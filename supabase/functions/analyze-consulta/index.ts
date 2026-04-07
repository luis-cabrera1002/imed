const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { transcripcion } = await req.json();
    if (!transcripcion?.trim()) {
      return new Response(JSON.stringify({ error: "Missing transcripcion" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const prompt = `Sos un asistente clínico de iMed Guatemala. Analizá esta transcripción de una consulta médica y extraé la información estructurada.

TRANSCRIPCIÓN:
"""
${transcripcion}
"""

Respondé ÚNICAMENTE con JSON válido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "motivo_consulta": "Por qué el paciente vino a la consulta",
  "examen_fisico": "Signos vitales y hallazgos del examen físico mencionados",
  "diagnostico": "Diagnóstico principal mencionado por el doctor",
  "codigo_cie10": "Código CIE-10 más probable (ej: J06.9)",
  "plan_tratamiento": "Plan de tratamiento indicado",
  "medicamentos_recetados": "Medicamentos con dosis y frecuencia mencionados",
  "proxima_cita": "Cuándo debe volver el paciente (ej: 2 semanas, 1 mes)",
  "resumen_expediente": "Resumen de la consulta en 2-3 oraciones para el expediente",
  "instrucciones_paciente": "Instrucciones en lenguaje simple para el paciente",
  "recordatorios_sugeridos": "Lista de recordatorios de medicamentos (ej: Metformina 500mg cada 12h)"
}

Si algún dato no se menciona en la transcripción, usá "" (string vacío). No inventes datos que no estén en la transcripción.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 800,
        temperature: 0.1,
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
      // Try to fix unquoted keys
      try {
        const fixed = text.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        result = JSON.parse(fixed);
      } catch {
        result = {
          motivo_consulta: "",
          examen_fisico: "",
          diagnostico: "",
          codigo_cie10: "",
          plan_tratamiento: "",
          medicamentos_recetados: "",
          proxima_cita: "",
          resumen_expediente: "No se pudo extraer el resumen automáticamente.",
          instrucciones_paciente: "",
          recordatorios_sugeridos: "",
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-consulta error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
