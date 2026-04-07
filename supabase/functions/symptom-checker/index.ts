const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { sintomas } = await req.json();
    if (!sintomas?.trim()) {
      return new Response(JSON.stringify({ error: "Missing sintomas" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const prompt = `Eres un asistente médico de triage de iMed Guatemala. El paciente describe sus síntomas: "${sintomas}".
Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "condiciones": ["condición 1", "condición 2", "condición 3"],
  "especialidad": "Nombre de especialidad médica recomendada",
  "urgencia": "baja",
  "consejo": "Consejo inmediato concreto en 1-2 oraciones en español.",
  "disclaimer": "Esta evaluación es orientativa. Consultá con un médico certificado para diagnóstico y tratamiento."
}
Reglas:
- Máximo 3 condiciones posibles más probables (puede ser menos si no aplica).
- urgencia: "baja" (puede esperar días), "media" (ver médico en 24-48h), "alta" (atención urgente hoy).
- Especialidad en español (ej: Medicina General, Cardiología, Dermatología, etc.).
- Responde en español guatemalteco natural.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 350,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let text = (data.choices?.[0]?.message?.content || "").trim();
    text = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        condiciones: ["Síntomas no identificados claramente"],
        especialidad: "Medicina General",
        urgencia: "media",
        consejo: "Consultá con un médico general para una evaluación completa de tus síntomas.",
        disclaimer: "Esta evaluación es orientativa. Consultá con un médico certificado para diagnóstico y tratamiento.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("symptom-checker error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
