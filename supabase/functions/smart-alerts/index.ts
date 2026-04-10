// ============================================================
// iMed Guatemala — Edge Function: smart-alerts
// Genera alertas de salud personalizadas y proactivas
// basadas en el perfil del paciente.
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
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Demasiadas solicitudes." }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const { paciente } = await req.json();
    if (!paciente) {
      return new Response(JSON.stringify({ error: "Missing paciente" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const mesActual = new Date().toLocaleString("es-GT", { month: "long" });
    const esMesLluvia = [4, 5, 6, 7, 8, 9, 10].includes(new Date().getMonth() + 1);

    const prompt = `Sos un asistente médico preventivo de iMed Guatemala. Analizá el perfil del paciente y generá alertas de salud proactivas y personalizadas.

PERFIL:
- IMC: ${paciente.imc || "No disponible"}
- Condiciones: ${paciente.condiciones?.join(", ") || "Ninguna"}
- Medicamentos: ${paciente.medicamentos?.join(", ") || "Ninguno"}
- Última cita médica: ${paciente.ultima_cita || "Desconocida"}
- Mes actual: ${mesActual}
- Temporada de lluvia: ${esMesLluvia ? "Sí (mayor riesgo de dengue)" : "No"}
- Departamento: ${paciente.departamento || "Guatemala"}

Generá entre 2 y 4 alertas personalizadas y relevantes. Respondé ÚNICAMENTE con JSON válido:
{
  "alertas": [
    {
      "tipo": "chequeo",
      "mensaje": "Mensaje conciso y útil en español guatemalteco (máx 120 caracteres)",
      "urgencia": "info",
      "accion": "URL relativa o null"
    }
  ]
}

TIPOS: "chequeo" | "medicamento" | "epidemia" | "imc" | "preventivo"
URGENCIA: "info" (azul) | "warning" (amarillo) | "danger" (rojo)

REGLAS:
- Solo generá alertas realmente relevantes para este perfil
- Si el IMC > 25: alerta sobre peso y nutricionistas disponibles en iMed
- Si tiene medicamentos crónicos: recordatorios de exámenes de control
- Si es temporada de lluvia: alerta de dengue
- Si no hay cita reciente (más de 6 meses): sugerencia de chequeo
- Máximo 4 alertas — preferí calidad sobre cantidad
- Mensajes empáticos, no alarmistas`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        temperature: 0.3,
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
      // Fallback con alertas estáticas según perfil
      const alertas = [];

      if (!paciente.ultima_cita || daysSince(paciente.ultima_cita) > 180) {
        alertas.push({
          tipo: "chequeo",
          mensaje: "Hace más de 6 meses que no visitás a un médico. Te recomendamos un chequeo general.",
          urgencia: "warning",
          accion: "/doctores",
        });
      }

      if (esMesLluvia) {
        alertas.push({
          tipo: "epidemia",
          mensaje: "Estamos en temporada de lluvia. Vigilá síntomas de dengue: fiebre, dolor muscular, sarpullido.",
          urgencia: "info",
          accion: "/sintomas",
        });
      }

      if (paciente.imc && parseFloat(paciente.imc) > 25) {
        alertas.push({
          tipo: "imc",
          mensaje: `Tu IMC (${paciente.imc}) indica sobrepeso. Tenemos nutricionistas disponibles en iMed.`,
          urgencia: "warning",
          accion: "/doctores",
        });
      }

      result = { alertas };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("smart-alerts error:", err);
    return new Response(JSON.stringify({ alertas: [] }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

function daysSince(dateStr: string): number {
  try {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}
