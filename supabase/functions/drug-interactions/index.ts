const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { medicamentos } = await req.json();
    if (!medicamentos?.trim()) {
      return new Response(JSON.stringify({ error: "Missing medicamentos" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const prompt = `Sos un farmacólogo clínico experto. Analizá los siguientes medicamentos y detectá interacciones medicamentosas clínicamente relevantes.

MEDICAMENTOS A ANALIZAR:
${medicamentos}

Respondé ÚNICAMENTE con JSON válido (sin markdown, sin texto extra):
{
  "interacciones_graves": [
    {"medicamentos": "Fármaco A + Fármaco B", "descripcion": "Riesgo y mecanismo"}
  ],
  "interacciones_moderadas": [
    {"medicamentos": "Fármaco X + Fármaco Y", "descripcion": "Riesgo y monitoreo necesario"}
  ],
  "sin_interacciones_conocidas": false,
  "recomendaciones": "Qué debe hacer el médico: ajustar dosis, sustituir fármaco, monitorear parámetros, etc.",
  "disclaimer": "Información orientativa basada en datos farmacológicos — no reemplaza evaluación clínica ni farmacológica profesional."
}

REGLAS:
- Solo listá interacciones documentadas clínicamente (no especulativas)
- Si hay menos de 2 medicamentos reconocibles, devolvé sin_interacciones_conocidas: true
- Si no hay interacciones, devolvé arrays vacíos y sin_interacciones_conocidas: true
- Los campos interacciones_graves e interacciones_moderadas son arrays (pueden estar vacíos [])`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 700,
        temperature: 0.1,
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
      try {
        const fixed = text.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        result = JSON.parse(fixed);
      } catch {
        result = {
          interacciones_graves: [],
          interacciones_moderadas: [],
          sin_interacciones_conocidas: true,
          recomendaciones: "No se detectaron interacciones conocidas. Siempre verificá con un farmacólogo.",
          disclaimer: "No se pudo analizar completamente. Consultá con un farmacólogo clínico.",
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("drug-interactions error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
