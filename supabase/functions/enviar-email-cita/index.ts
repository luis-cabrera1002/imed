import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    const { record } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const doctorRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${record.doctor_id}&select=full_name`,
      { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } }
    );
    const doctor = (await doctorRes.json())[0];

    const pacienteRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${record.paciente_id}&select=full_name`,
      { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } }
    );
    const paciente = (await pacienteRes.json())[0];

    const authRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${record.doctor_id}`,
      { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } }
    );
    const doctorEmail = (await authRes.json()).email;

    if (!doctorEmail) return new Response(JSON.stringify({ error: "No email" }), { status: 400 });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "iMed Guatemala <onboarding@resend.dev>",
        to: doctorEmail,
        subject: "Nueva cita agendada — iMed Guatemala",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0d9488;padding:20px;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">iMed Guatemala</h1></div><div style="background:#f9fafb;padding:30px;border-radius:0 0 8px 8px"><h2>Nueva cita agendada</h2><p>Estimado/a <strong>${doctor?.full_name||"Doctor/a"}</strong>,</p><p>Tienes una nueva cita:</p><div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0"><p><strong>Paciente:</strong> ${paciente?.full_name||"Paciente"}</p><p><strong>Fecha:</strong> ${record.fecha}</p><p><strong>Hora:</strong> ${record.hora}</p>${record.motivo?`<p><strong>Motivo:</strong> ${record.motivo}</p>`:""}</div><a href="https://imedgt.app" style="background:#0d9488;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Ver mi panel</a></div></div>`
      }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
