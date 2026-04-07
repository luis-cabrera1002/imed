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
    const { motivo, examen_fisico, especialidad } = await req.json();

    if (!motivo && !examen_fisico) {
      return new Response(
        JSON.stringify({ error: "Missing motivo or examen_fisico" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const prompt = `Eres un asistente clínico de apoyo para médicos en Guatemala. Basado en: motivo='${motivo || ""}', examen físico='${examen_fisico || ""}', especialidad='${especialidad || "Medicina General"}'. Sugiere ÚNICAMENTE JSON válido con esta estructura exacta: {"diagnostico_sugerido": "string con diagnóstico probable", "codigo_cie10": "string con código CIE-10 más probable", "plan_tratamiento": "string con 2-3 líneas de plan", "medicamentos": "string con medicamentos comunes separados por coma", "advertencia": "Sugerencia de IA — el médico debe confirmar el diagnóstico y tratamiento."}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: "Eres un asistente clínico. Responde SOLO con JSON válido, sin texto adicional, sin markdown, sin bloques de código.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Groq raw:", JSON.stringify(data));

    if (data.error) {
      console.error("Groq error:", JSON.stringify(data.error));
      return new Response(
        JSON.stringify({ error: "Groq API error", detail: data.error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const text = data.choices?.[0]?.message?.content || "{}";
    console.log("Groq text:", text);

    const clean = text.replace(/```json|```/g, "").trim();

    let result: Record<string, string>;
    try {
      // Fix unquoted keys: {key: "val"} → {"key": "val"}
      const fixed = clean.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      result = JSON.parse(fixed);
    } catch {
      // Fallback: extract fields manually
      result = {
        diagnostico_sugerido: "No se pudo determinar",
        codigo_cie10: "Z00.0",
        plan_tratamiento: "Consultar con especialista",
        medicamentos: "",
        advertencia: "Sugerencia de IA — el médico debe confirmar el diagnóstico y tratamiento.",
      };
    }

    // Ensure advertencia is always present
    if (!result.advertencia) {
      result.advertencia = "Sugerencia de IA — el médico debe confirmar el diagnóstico y tratamiento.";
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({
        diagnostico_sugerido: "Error al procesar",
        codigo_cie10: "",
        plan_tratamiento: "",
        medicamentos: "",
        advertencia: "Sugerencia de IA — el médico debe confirmar el diagnóstico y tratamiento.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
