const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
    });
  }
  try {
    const { imageUrl, tipo } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: "Missing imageUrl" }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

    // Descargar imagen
    const imgRes = await fetch(imageUrl);
    const imgBlob = await imgRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBlob)));
    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 600,
        temperature: 0.1,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: "text", text: `Sos un asistente médico de apoyo. Analizá este documento médico (${tipo || "médico"}) y respondé SOLO con JSON válido sin markdown ni texto extra:\n{\n  "resumen": "resumen en 2-3 oraciones en español simple para el paciente",\n  "hallazgos": ["hallazgo 1", "hallazgo 2"],\n  "alertas": ["alerta si la hay, o array vacío si no"],\n  "recomendacion": "acción sugerida",\n  "requiere_medico": true\n}\nIMPORTANTE: Siempre recomendar validación médica profesional.` }
          ]
        }]
      })
    });

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data));

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    let result;
    try { result = JSON.parse(clean); }
    catch { result = { resumen: "No se pudo analizar el documento.", hallazgos: [], alertas: [], recomendacion: "Consultá con tu médico.", requiere_medico: true }; }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
});