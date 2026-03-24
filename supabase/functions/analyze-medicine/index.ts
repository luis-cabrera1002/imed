const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
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
    const validMime = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)
      ? mimeType : "image/jpeg";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5-20251101",
        max_tokens: 150,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: validMime, data: image }
            },
            {
              type: "text",
              text: `Sos un experto en identificación de medicamentos. Analizá esta imagen.
REGLAS:
1. Si ves un inhalador/aerosol de color ROJO, NARANJA o con la marca "Butosol" → es Butosol
2. Si ves un inhalador/aerosol de color AZUL, o dice "Salbutamol", "Ventolin", "Albuterol" → es Salbutamol
3. Si ves cualquier inhalador aunque no veas bien la etiqueta, identificalo por el COLOR
4. Solo respondé con JSON válido, sin texto extra, sin markdown
Formato EXACTO de respuesta (solo esto, nada más):
{"nombre": "Butosol", "confianza": 85}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    console.log("Anthropic raw response:", JSON.stringify(data));

    if (data.error) {
      console.error("Anthropic error:", JSON.stringify(data.error));
      return new Response(JSON.stringify({ nombre: "Desconocido", confianza: 0 }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const text = data.content?.[0]?.text || '{"nombre":"Desconocido","confianza":0}';
    console.log("Claude text:", text);
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
