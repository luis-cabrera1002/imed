import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://usmjxdoboaxpbmuoproo.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const TWILIO_SID = Deno.env.get("TWILIO_SID") || "";
const TWILIO_TOKEN = Deno.env.get("TWILIO_TOKEN") || "";
const TWILIO_FROM = "whatsapp:+14155238886";

serve(async (req) => {
  const body = await req.json();
  const { record, old_record } = body;

  // Solo actuar cuando una cita cambia a "cancelada"
  if (record?.estado !== "cancelada" || old_record?.estado === "cancelada") {
    return new Response(JSON.stringify({ ok: true, skip: true }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const citaCancelada = record;

  // 1. Obtener info del doctor
  const { data: doctorProfile } = await supabase
    .from("doctor_profiles")
    .select("especialidad, precio_consulta")
    .eq("user_id", citaCancelada.doctor_id)
    .single();

  const { data: doctorUser } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("user_id", citaCancelada.doctor_id)
    .single();

  // 2. Buscar pacientes compatibles (misma especialidad, nunca han ido con este doctor o hace tiempo)
  const { data: pacientesCompatibles } = await supabase
    .from("citas")
    .select("paciente_id, motivo, created_at")
    .neq("paciente_id", citaCancelada.paciente_id)
    .neq("doctor_id", citaCancelada.doctor_id)
    .eq("estado", "pendiente")
    .limit(5);

  if (!pacientesCompatibles || pacientesCompatibles.length === 0) {
    return new Response(JSON.stringify({ ok: true, msg: "No hay pacientes compatibles" }), { status: 200 });
  }

  // 3. Obtener nombres de pacientes
  const pacienteIds = pacientesCompatibles.map(p => p.paciente_id);
  const { data: pacienteProfiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, phone")
    .in("user_id", pacienteIds);

  const pacientesConInfo = pacientesCompatibles.map(p => ({
    ...p,
    nombre: pacienteProfiles?.find(pr => pr.user_id === p.paciente_id)?.full_name || "Paciente",
    telefono: pacienteProfiles?.find(pr => pr.user_id === p.paciente_id)?.phone || "",
  }));

  // 4. Generar mensaje con Groq
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{
        role: "user",
        content: `Eres un asistente médico de iMed Guatemala. 
El Dr. ${doctorProfile ? doctorProfile.especialidad : "médico"} (${doctorUser?.full_name || "Doctor"}) acaba de tener una cancelación.
Fecha libre: ${citaCancelada.fecha} a las ${citaCancelada.hora}.
Hay ${pacientesConInfo.length} pacientes que podrían ocupar ese espacio.
Escribe un mensaje de WhatsApp CORTO (máximo 3 líneas) y profesional en español para el doctor, 
informándole que su agenda se liberó y que hay pacientes disponibles en iMed.
No uses emojis excesivos, sé directo y útil. Solo el mensaje, sin explicaciones.`
      }],
      max_tokens: 150,
    }),
  });

  const groqData = await groqRes.json();
  const mensajeDoctor = groqData.choices?.[0]?.message?.content || 
    `Dr. ${doctorUser?.full_name}, se liberó un espacio el ${citaCancelada.fecha} a las ${citaCancelada.hora}. Hay ${pacientesConInfo.length} pacientes disponibles en iMed. Entra a ver tus sugerencias: imedgt.app/agenda-inteligente`;

  // 5. Guardar sugerencias en Supabase
  const sugerencias = pacientesConInfo.map(p => ({
    doctor_id: citaCancelada.doctor_id,
    paciente_id: p.paciente_id,
    cita_cancelada_id: citaCancelada.id,
    fecha_disponible: citaCancelada.fecha,
    hora_disponible: citaCancelada.hora,
    motivo_sugerencia: p.motivo || "Consulta general",
    mensaje_doctor: mensajeDoctor,
    estado: "pendiente",
  }));

  await supabase.from("agenda_sugerencias").insert(sugerencias);

  // 6. Enviar WhatsApp al doctor si tiene teléfono
  const doctorPhone = doctorUser?.phone;
  if (doctorPhone && TWILIO_SID && TWILIO_TOKEN) {
    const twilioBody = new URLSearchParams({
      To: `whatsapp:${doctorPhone}`,
      From: TWILIO_FROM,
      Body: `🏥 iMed Guatemala\n\n${mensajeDoctor}\n\nVer sugerencias: https://imedgt.app/agenda-inteligente`,
    });

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: twilioBody,
      }
    );
  }

  return new Response(JSON.stringify({ ok: true, sugerencias: sugerencias.length, mensaje: mensajeDoctor }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
