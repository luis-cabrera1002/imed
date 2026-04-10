const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const rlMap = new Map<string, { count: number; resetAt: number }>();
function checkRL(ip: string): boolean {
  const now = Date.now();
  const e = rlMap.get(ip);
  if (!e || now > e.resetAt) { rlMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (e.count >= 10) return false;
  e.count++;
  return true;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRL(ip)) {
    return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intentá de nuevo en un minuto." }), {
      status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
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
    const validMime = "image/jpeg"; // Forzar siempre JPEG — Groq no acepta HEIC
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
              image_url: { url: `data:image/jpeg;base64,${cleanImage}` }
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