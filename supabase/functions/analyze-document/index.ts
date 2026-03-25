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

    const imgRes = await fetch(imageUrl);
    const contentType = imgRes.headers.get("content-type") || "";
    const isPDF = contentType.includes("pdf") || imageUrl.toLowerCase().includes(".pdf");

    let messages;

    if (isPDF) {
      const text = await imgRes.text();
      const cleanText = text.substring(0, 3000);
      const prompt = "Sos un asistente medico de apoyo. Analiza este documento medico (" + (tipo || "medico") + "):\n\n" + cleanText + "\n\nResponde SOLO con JSON valido sin markdown ni texto extra:\n{\"resumen\":\"resumen en 2-3 oraciones en espanol simple para el paciente\",\"hallazgos\":[\"hallazgo 1\",\"hallazgo 2\"],\"alertas\":[\"alerta si la hay, o string vacio\"],\"recomendacion\":\"accion sugerida\",\"requiere_medico\":true}\nIMPORTANTE: Siempre recomendar validacion medica profesional.";
      messages = [{ role: "user", content: prompt }];
    } else {
      const arrayBuf = await imgRes.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuf);
      const base64 = btoa(uint8.reduce((acc, byte) => acc + String.fromCharCode(byte), ""));
      const mimeType = contentType.includes("png") ? "image/png" : contentType.includes("webp") ? "image/webp" : "image/jpeg";
      const prompt = "Sos un asistente medico de apoyo. Analiza este documento medico (" + (tipo || "medico") + ") y responde SOLO con JSON valido sin markdown ni texto extra:\n{\"resumen\":\"resumen en 2-3 oraciones en espanol simple para el paciente\",\"hallazgos\":[\"hallazgo 1\",\"hallazgo 2\"],\"alertas\":[\"alerta si la hay\"],\"recomendacion\":\"accion sugerida\",\"requiere_medico\":true}\nIMPORTANTE: Siempre recomendar validacion medica profesional.";
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
    console.log("Groq:", JSON.stringify(data).substring(0, 300));

    if (data.error) {
      console.error("Groq error:", JSON.stringify(data.error));
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
