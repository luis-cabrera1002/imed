const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }
  try {
    const { image, mimeType } = await req.json();
    if (!image || !mimeType) {
      return new Response(JSON.stringify({ error: "Missing image or mimeType" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    const validMime = ["image/jpeg", "image/png", "image/webp"].includes(mimeType) ? mimeType : "image/jpeg";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: validMime, data: image } },
              { text: "Analizá esta imagen de un medicamento. IMPORTANTE: Solo respondé con JSON puro, sin markdown, sin texto extra. Si ves un inhalador ROJO o NARANJA o dice Butosol responde: {nombre: Butosol, confianza: 90}. Si ves un inhalador AZUL o dice Salbutamol o Ventolin responde: {nombre: Salbutamol, confianza: 90}. Si no es un inhalador responde: {nombre: Desconocido, confianza: 0}" }
            ]
          }],
          generationConfig: { maxOutputTokens: 100, temperature: 0.1 }
        })
      }
    );

    const data = await response.json();
    console.log("Gemini raw:", JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"nombre":"Desconocido","confianza":0}';
    console.log("Gemini text:", text);
    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      if (clean.includes("Butosol")) result = { nombre: "Butosol", confianza: 75 };
      else if (clean.includes("Salbutamol")) result = { nombre: "Salbutamol", confianza: 75 };
      else result = { nombre: "Desconocido", confianza: 0 };
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ nombre: "Desconocido", confianza: 0 }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});