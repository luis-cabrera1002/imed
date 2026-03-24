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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: image }
            },
            {
              type: "text",
              text: `Analizá esta imagen de un medicamento inhalador.
Respondé ÚNICAMENTE con JSON válido, sin texto extra ni markdown:
{"nombre": "NOMBRE", "confianza": NUMERO}

Medicamentos que podés identificar:
- "Butosol" → inhalador rojo/naranja, marca guatemalteca de Salbutamol
- "Salbutamol" → inhalador azul, Ventolin u otras marcas genéricas

Si no podés identificar: {"nombre": "Desconocido", "confianza": 0}`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{"nombre":"Desconocido","confianza":0}';
    
    // Limpiar respuesta por si tiene markdown
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
