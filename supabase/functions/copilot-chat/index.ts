// ============================================================
// iMed Guatemala — Edge Function: copilot-chat
// Asistente médico personal 24/7 con contexto completo del paciente.
// Detecta emergencias y activa protocolo.
// ============================================================

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// Palabras clave de emergencia
const EMERGENCY_KEYWORDS = [
  "dolor de pecho", "dolor pecho", "chest pain",
  "dificultad para respirar", "no puedo respirar", "falta de aire",
  "pérdida de conciencia", "perdí el conocimiento", "desmayo",
  "sangrado abundante", "hemorragia",
  "convulsión", "convulsiones",
  "accidente cerebrovascular", "derrame cerebral",
  "ataque al corazón", "infarto",
  "sobredosis", "me tomé muchas pastillas",
  "me estoy muriendo", "voy a morir",
  "no tengo pulso", "sin pulso",
];

function detectEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => lower.includes(kw));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intentá en un minuto." }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const { mensaje, historial, paciente } = await req.json();

    if (!mensaje?.trim()) {
      return new Response(JSON.stringify({ error: "Missing mensaje" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Detectar emergencia antes de llamar a Groq
    const esEmergencia = detectEmergency(mensaje);

    // Construir contexto del paciente para el system prompt
    const nombre = paciente?.nombre || "Paciente";
    const contextoPaciente = [
      paciente?.nombre          ? `Nombre: ${paciente.nombre}` : null,
      paciente?.grupo_sanguineo ? `Grupo sanguíneo: ${paciente.grupo_sanguineo}` : null,
      paciente?.imc             ? `IMC: ${paciente.imc} kg/m²` : null,
      paciente?.peso && paciente?.altura ? `Peso: ${paciente.peso}kg, Altura: ${paciente.altura}cm` : null,
      paciente?.condiciones?.length     ? `Condiciones crónicas: ${paciente.condiciones.join(", ")}` : null,
      paciente?.alergias?.length        ? `ALERGIAS (CRÍTICO): ${paciente.alergias.join(", ")}` : null,
      paciente?.medicamentos?.length    ? `Medicamentos activos: ${paciente.medicamentos.join(", ")}` : null,
      paciente?.ultimo_diagnostico      ? `Último diagnóstico registrado: ${paciente.ultimo_diagnostico}` : null,
      paciente?.ultimo_doctor           ? `Último médico tratante: ${paciente.ultimo_doctor}` : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = `Sos iMed Copilot, el asistente médico personal de ${nombre} en iMed Guatemala.
Tenés acceso completo a su historial médico y lo conocés bien.

PERFIL DEL PACIENTE:
${contextoPaciente || "Perfil pendiente de completar — pedile que complete su expediente en /expediente"}

INSTRUCCIONES:
- Hablás en español guatemalteco cálido, empático y profesional
- Siempre tenés en cuenta sus ALERGIAS al recomendar cualquier medicamento o tratamiento
- Verificás si sus síntomas pueden relacionarse con sus CONDICIONES CRÓNICAS conocidas
- Si toma medicamentos, revisás posibles interacciones antes de sugerir algo
- NUNCA reemplazás al médico — siempre recomendás consultar presencialmente para diagnóstico formal
- Respondés de forma concisa (máx 3-4 párrafos) — no des parrafadas innecesarias
- Usás emojis con moderación para ser más amigable
- Si detectás síntomas de emergencia: dolor pecho, dificultad respirar, pérdida conciencia, convulsiones — SIEMPRE indicás llamar al 128 INMEDIATAMENTE
${esEmergencia ? "\n⚠️ EMERGENCIA DETECTADA: El paciente reporta síntomas de emergencia. Tu primera respuesta DEBE ser indicar que llame al 128 de inmediato y dar instrucciones básicas mientras llega ayuda." : ""}

RECUERDA: Sos el médico virtual de ${nombre}. Lo conocés, lo cuidás y querés lo mejor para su salud.`;

    // Construir historial de mensajes para Groq
    const messages = [
      { role: "system", content: systemPrompt },
      // Últimos 10 mensajes del historial para mantener contexto sin exceder tokens
      ...(historial ?? []).slice(-10).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: mensaje },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 600,
        temperature: 0.4,
        messages,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const respuesta = data.choices?.[0]?.message?.content?.trim()
      ?? "Lo siento, no pude procesar tu consulta. Por favor intentá de nuevo.";

    return new Response(JSON.stringify({
      respuesta,
      es_emergencia: esEmergencia,
    }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("copilot-chat error:", err);
    return new Response(JSON.stringify({
      respuesta: "Hubo un error al procesar tu consulta. Por favor intentá de nuevo en unos momentos.",
      es_emergencia: false,
      error: String(err),
    }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
