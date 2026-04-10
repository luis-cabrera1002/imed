// ============================================================
// iMed Guatemala — Edge Function: health-predictor
// Análisis predictivo de salud personalizado con IA.
// Analiza el expediente completo del paciente y genera
// estimaciones de riesgo de salud, recomendaciones y
// edad biológica estimada.
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
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Límite de análisis alcanzado. Intentá en un minuto." }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const { expediente } = await req.json();
    if (!expediente) {
      return new Response(JSON.stringify({ error: "Missing expediente" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const prompt = `Sos un médico preventivista experto de iMed Guatemala. Analizá el siguiente expediente médico y generá un perfil de salud predictivo personalizado.

EXPEDIENTE DEL PACIENTE:
- Edad: ${expediente.edad || "No especificada"} años
- Sexo: ${expediente.sexo || "No especificado"}
- Peso: ${expediente.peso || "No especificado"} kg
- Altura: ${expediente.altura || "No especificada"} cm
- IMC: ${expediente.imc || "No calculado"}
- Grupo sanguíneo: ${expediente.grupo_sanguineo || "No especificado"}
- Condiciones médicas: ${expediente.condiciones?.join(", ") || "Ninguna registrada"}
- Alergias: ${expediente.alergias?.join(", ") || "Ninguna registrada"}
- Medicamentos activos: ${expediente.medicamentos?.join(", ") || "Ninguno"}
- Última visita al médico: ${expediente.ultima_cita || "No registrada"}

Respondé ÚNICAMENTE con JSON válido (sin markdown, sin texto extra):
{
  "riesgo_diabetes": {
    "porcentaje": 25,
    "nivel": "moderado",
    "explicacion": "Explicación breve y clara (máx 100 caracteres) en español guatemalteco"
  },
  "riesgo_hipertension": {
    "porcentaje": 40,
    "nivel": "moderado",
    "explicacion": "Explicación breve"
  },
  "riesgo_cardiovascular": {
    "porcentaje": 15,
    "nivel": "bajo",
    "explicacion": "Explicación breve"
  },
  "habitos_recomendados": [
    "Hábito 1 específico para este perfil",
    "Hábito 2",
    "Hábito 3",
    "Hábito 4",
    "Hábito 5"
  ],
  "examenes_sugeridos": [
    "Examen 1 preventivo según perfil",
    "Examen 2"
  ],
  "edad_biologica": {
    "estimada": 35,
    "real": ${expediente.edad || 35},
    "diferencia": -2,
    "interpretacion": "Breve interpretación positiva o motivacional"
  },
  "mensaje_motivacional": "Mensaje personalizado y empático en español guatemalteco (máx 200 caracteres)"
}

REGLAS:
- nivel: "bajo" (0-25%), "moderado" (26-55%), "alto" (56-100%)
- Basate SOLO en los datos disponibles — no inventés datos que no están
- Si hay pocos datos, sé más conservador en los porcentajes (tendé a bajo/moderado)
- Habitos y exámenes deben ser ESPECÍFICOS para este paciente, no genéricos
- El mensaje motivacional debe ser cálido y personalizado
- Si el IMC está elevado, incluyelo en las recomendaciones
- Si hay condiciones crónicas, ajustá los riesgos correspondientemente`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = (data.choices?.[0]?.message?.content || "{}").replace(/```json|```/g, "").trim();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Fallback estructurado si el JSON falla
      result = {
        riesgo_diabetes:        { porcentaje: 20, nivel: "bajo",     explicacion: "Sin datos suficientes para calcular" },
        riesgo_hipertension:    { porcentaje: 25, nivel: "bajo",     explicacion: "Sin datos suficientes para calcular" },
        riesgo_cardiovascular:  { porcentaje: 15, nivel: "bajo",     explicacion: "Sin datos suficientes para calcular" },
        habitos_recomendados: [
          "Realizá actividad física al menos 30 minutos al día",
          "Consumí 8 vasos de agua diariamente",
          "Dormí 7-8 horas por noche",
          "Reducí el consumo de sal y azúcar procesada",
          "Mantenés tus controles médicos anuales al día",
        ],
        examenes_sugeridos: [
          "Hemograma completo anual",
          "Glucosa en ayunas",
          "Perfil lipídico",
          "Presión arterial",
        ],
        edad_biologica: {
          estimada: expediente.edad || 30,
          real: expediente.edad || 30,
          diferencia: 0,
          interpretacion: "Completá tu expediente para una estimación más precisa",
        },
        mensaje_motivacional: "¡Tu salud es tu mayor inversión! Completá tu expediente en iMed para un análisis más personalizado.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("health-predictor error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
