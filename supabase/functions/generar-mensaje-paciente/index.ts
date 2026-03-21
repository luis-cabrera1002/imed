import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const SUPABASE_URL = "https://usmjxdoboaxpbmuoproo.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  const { paciente_nombre, doctor_id, fecha, hora, motivo, aceptado } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: doctorProfile } = await supabase.from("profiles").select("full_name").eq("user_id", doctor_id).single();
  const { data: doctorEsp } = await supabase.from("doctor_profiles").select("especialidad, clinica").eq("user_id", doctor_id).single();

  const prompt = aceptado
    ? `Escribe un mensaje de WhatsApp corto y amable en español para ${paciente_nombre}, confirmándole que el Dr. ${doctorProfile?.full_name || "médico"} (${doctorEsp?.especialidad || "especialista"}) ha confirmado su cita para el ${fecha} a las ${hora}. Menciona que puede verla en la app iMed (imedgt.app). Máximo 3 líneas. Solo el mensaje.`
    : `Escribe un mensaje de WhatsApp corto y amable en español para ${paciente_nombre}, explicándole que el Dr. ${doctorProfile?.full_name || "médico"} no puede atenderle en ese horario. Invítale a agendar otra cita en iMed (imedgt.app). Máximo 2 líneas. Solo el mensaje.`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
    }),
  });

  const data = await groqRes.json();
  const mensaje = data.choices?.[0]?.message?.content || (aceptado
    ? `Hola ${paciente_nombre}, tu cita fue confirmada para el ${fecha} a las ${hora}. ¡Te esperamos!`
    : `Hola ${paciente_nombre}, el médico no está disponible en ese horario. Agenda otra cita en imedgt.app`
  );

  return new Response(JSON.stringify({ mensaje }), {
    headers: { "Content-Type": "application/json" },
  });
});
