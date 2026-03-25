import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
    });
  }
  try {
    const { imageUrl, tipo } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: "Missing imageUrl" }), {
      status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });

    const prompt = "Sos un asistente medico de apoyo. Analiza este documento medico (" + (tipo || "medico") + ") y responde SOLO con JSON valido sin markdown ni texto extra: {\"resumen\":\"resumen 2-3 oraciones en espanol simple\",\"hallazgos\":[\"hallazgo 1\"],\"alertas\":[\"alerta si hay\"],\"recomendacion\":\"accion sugerida\",\"requiere_medico\":true}. IMPORTANTE: Siempre recomendar validacion medica.";

    const isPDF = imageUrl.toLowerCase().includes(".pdf");
    let messages;

    if (isPDF) {
      // Para PDFs: usar el texto del documento directamente via Anthropic API format
      const pdfRes = await fetch(imageUrl);
      const pdfBuffer = await pdfRes.arrayBuffer();
      const pdfBase64 = encodeBase64(new Uint8Array(pdfBuffer));
      
      // Groq no soporta PDF nativamente, usar texto extraido
      // Convertir bytes a string buscando texto legible
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(new Uint8Array(pdfBuffer));
      // Extraer solo caracteres legibles
      const readableText = rawText.split("").filter(c => {
        const code = c.charCodeAt(0);
        return (code >= 32 && code <= 126) || code === 10 || code === 13;
      }).join("").replace(/\s+/g, " ").trim().substring(0, 2000);
      
      console.log("PDF text extracted:", readableText.substring(0, 200));
      
      messages = [{
        role: "user",
        content: prompt + "\n\nContenido del documento PDF:\n" + readableText
      }];
    } else {
      const imgRes = await fetch(imageUrl);
      const contentType = imgRes.headers.get("content-type") || "image/jpeg";
      const arrayBuf = await imgRes.arrayBuffer();
      const base64 = encodeBase64(new Uint8Array(arrayBuf));
      const mimeType = contentType.includes("png") ? "image/png" : contentType.includes("webp") ? "image/webp" : "image/jpeg";
      messages = [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: "data:" + mimeType + ";base64," + base64 } },
          { type: "text", text: prompt }
        ]
      }];
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_API_KEY },
      body: JSON.stringify({ model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 600, temperature: 0.1, messages })
    });

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data).substring(0, 300));

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let result;
    try { result = JSON.parse(clean); }
    catch { result = { resumen: "No se pudo analizar el documento.", hallazgos: [], alertas: [], recomendacion: "Consulta con tu medico.", requiere_medico: true }; }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    console.error("Error:", String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
