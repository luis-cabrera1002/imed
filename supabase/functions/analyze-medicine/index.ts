const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
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
    // Forzar siempre image/jpeg si mimeType es vacío o inválido
    const validMime = ["image/jpeg", "image/png", "image/webp"].includes(mimeType) ? mimeType : "image/jpeg";
    // Limpiar base64 por si trae prefijo data:...
    const cleanImage = image.includes(",") ? image.split(",")[1] : image;

    const prompt = "Look at this image. Is there a medical inhaler? If RED or ORANGE or says Butosol: respond ONLY with this JSON: {nombre:Butosol,confianza:90}. If BLUE or says Salbutamol or Ventolin: respond ONLY with: {nombre:Salbutamol,confianza:90}. Otherwise: {nombre:Desconocido,confianza:0}. JSON only, no other text.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 50,
        temperature: 0.0,
        messages: [{
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${validMime};base64,${cleanImage}` }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }]
      })
    });

    const data = await response.json();
    console.log("Groq raw:", JSON.stringify(data));

    if (data.error) {
      console.error("Groq error:", JSON.stringify(data.error));
      return new Response(JSON.stringify({ nombre: "Desconocido", confianza: 0 }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const text = data.choices?.[0]?.message?.content || '{"nombre":"Desconocido","confianza":0}';
    console.log("Groq text:", text);
    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      // Añadir comillas a keys si faltan: {nombre:X} → {"nombre":X}
      const fixed = clean.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      result = JSON.parse(fixed);
    } catch {
      if (clean.includes("Butosol")) result = { nombre: "Butosol", confianza: 90 };
      else if (clean.includes("Salbutamol")) result = { nombre: "Salbutamol", confianza: 90 };
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