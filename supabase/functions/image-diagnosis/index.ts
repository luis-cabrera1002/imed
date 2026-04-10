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
    return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intentá de nuevo en un minuto." }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const { image, mimeType, tipo } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const cleanImage = image.includes(",") ? image.split(",")[1] : image;
    const imgMime = (mimeType || "image/jpeg").split(";")[0];

    const prompt = `Sos un asistente médico especializado en análisis de imágenes clínicas para iMed Guatemala. Analizá esta imagen médica y respondé ÚNICAMENTE con JSON válido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "tipo_documento": "Qué tipo de imagen es (Radiografía de tórax / Lesión cutánea / Resultado de laboratorio / Ecografía / Fotografía clínica / etc.)",
  "hallazgos": ["hallazgo observado 1", "hallazgo observado 2", "hallazgo observado 3"],
  "posible_diagnostico": "Diagnóstico diferencial basado en los hallazgos. Indicá nivel de confianza (alto/medio/bajo) y justificación breve.",
  "recomendaciones": "Qué especialista consultar, qué exámenes adicionales se recomiendan, qué hacer a continuación.",
  "urgencia": "baja",
  "disclaimer": "Segunda opinión de IA — no reemplaza el criterio médico profesional. Siempre consultá con un médico."
}

REGLAS:
- urgencia debe ser exactamente "baja", "media" o "alta"
- Solo describí lo que realmente ves en la imagen
- Si la imagen no es médica o no es clara, indicalo en tipo_documento
- Si hay signos de urgencia alta, mencionalo explícitamente en hallazgos
- Tipo especificado por el usuario: ${tipo || "no especificado"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 700,
        temperature: 0.1,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${imgMime};base64,${cleanImage}` } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = (data.choices?.[0]?.message?.content || "{}").replace(/```json|```/g, "").trim();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        tipo_documento: "No determinado",
        hallazgos: ["No se pudo procesar la imagen correctamente"],
        posible_diagnostico: "No determinado — imagen no analizable",
        recomendaciones: "Consultá con un médico para evaluación directa con la imagen original.",
        urgencia: "media",
        disclaimer: "Segunda opinión de IA — no reemplaza el criterio médico profesional.",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("image-diagnosis error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
