const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { audio, mimeType } = await req.json();
    if (!audio) {
      return new Response(JSON.stringify({ error: "Missing audio" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Decode base64 → binary
    const binaryStr = atob(audio);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Groq Whisper only accepts certain extensions — map mimeType to filename
    const extMap: Record<string, string> = {
      "audio/webm": "audio.webm",
      "audio/webm;codecs=opus": "audio.webm",
      "audio/ogg": "audio.ogg",
      "audio/ogg;codecs=opus": "audio.ogg",
      "audio/mp4": "audio.mp4",
      "audio/mpeg": "audio.mp3",
      "audio/wav": "audio.wav",
    };
    const safeMime = (mimeType || "audio/webm").split(";")[0];
    const fileName = extMap[safeMime] || extMap[(mimeType || "").split(";")[0]] || "audio.webm";

    const blob = new Blob([bytes], { type: safeMime });
    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("model", "whisper-large-v3");
    formData.append("language", "es");
    formData.append("response_format", "json");
    formData.append("temperature", "0.0");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: formData,
    });

    const result = await response.json();
    console.log("Whisper result:", JSON.stringify(result).slice(0, 200));

    if (result.error) {
      console.error("Whisper error:", result.error);
      return new Response(JSON.stringify({ text: "" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text: result.text || "" }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("transcribe-consulta error:", err);
    return new Response(JSON.stringify({ text: "", error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
