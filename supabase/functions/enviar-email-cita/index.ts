Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { doctor_email, doctor_name, paciente_email, paciente_name, hora, motivo } = body;
    const fechaRaw = body.fecha || "";
    // Formatear fecha en español directamente aqui
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    let fecha = fechaRaw;
    if (fechaRaw.includes("-")) {
      const [y, m, d] = fechaRaw.split("-");
      const dateObj = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
      fecha = `${dias[dateObj.getDay()]}, ${d} de ${meses[parseInt(m)-1]} de ${y}`;
    }

    const emailStyle = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f0f4f8; }
        .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px; text-align: center; }
        .header img { height: 40px; margin-bottom: 12px; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
        .logo { width: 120px; margin: 0 auto 12px; display: block; }
        .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #1e293b; margin-bottom: 20px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .card-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .card-row:last-child { border-bottom: none; }
        .card-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 90px; flex-shrink: 0; }
        .card-value { font-size: 15px; color: #1e293b; font-weight: 500; }
        .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
        .cta { text-align: center; margin: 24px 0 8px; }
        .cta a { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    `;

    const doctorHtml = `<!DOCTYPE html><html><head>${emailStyle}</head><body>
      <div class="container">
        <div class="header">
          <img src="https://imedgt.app/imed-logo.png" alt="iMed" style="height:40px;margin:0 auto 12px;display:block;" onerror="this.style.display='none'"><h1 style="margin:0;color:white;font-size:22px;font-weight:700;">iMed Guatemala</h1>
          <p>Nueva cita agendada</p>
        </div>
        <div class="body">
          <span class="badge">✅ Nueva Cita</span>
          <p class="greeting">Hola <strong>${doctor_name?.startsWith("Dr") ? doctor_name : "Dr. " + doctor_name}</strong>,</p>
          <p style="color:#475569;font-size:15px;">Tienes una nueva cita agendada en tu calendario.</p>
          <div class="card">
            <div class="card-row">
              <span class="card-label">👤 Paciente</span>
              <span class="card-value">${paciente_name || "No especificado"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">📅 Fecha</span>
              <span class="card-value">${fecha || "No especificada"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">🕐 Hora</span>
              <span class="card-value">${(hora || "").substring(0,5) || "No especificada"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">📋 Motivo</span>
              <span class="card-value">${motivo || "No especificado"}</span>
            </div>
          </div>
          <div class="cta">
            <a href="https://imedgt.app/doctor-dashboard">Ver en mi Dashboard</a>
          </div>
        </div>
        <div class="footer">iMed Guatemala · Tu salud, a un clic de distancia · <a href="https://imedgt.app" style="color:#2563eb;">imedgt.app</a></div>
      </div>
    </body></html>`;

    const pacienteHtml = `<!DOCTYPE html><html><head>${emailStyle}</head><body>
      <div class="container">
        <div class="header">
          <img src="https://imedgt.app/imed-logo.png" alt="iMed" style="height:40px;margin:0 auto 12px;display:block;" onerror="this.style.display='none'"><h1 style="margin:0;color:white;font-size:22px;font-weight:700;">iMed Guatemala</h1>
          <p>Tu cita fue confirmada</p>
        </div>
        <div class="body">
          <span class="badge">✅ Cita Confirmada</span>
          <p class="greeting">Hola <strong>${paciente_name || "Paciente"}</strong>,</p>
          <p style="color:#475569;font-size:15px;">Tu cita médica ha sido agendada exitosamente. ¡Te esperamos!</p>
          <div class="card">
            <div class="card-row">
              <span class="card-label">👨‍⚕️ Doctor</span>
              <span class="card-value">Dr. ${doctor_name || "No especificado"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">📅 Fecha</span>
              <span class="card-value">${fecha || "No especificada"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">🕐 Hora</span>
              <span class="card-value">${(hora || "").substring(0,5) || "No especificada"}</span>
            </div>
            <div class="card-row">
              <span class="card-label">📋 Motivo</span>
              <span class="card-value">${motivo || "No especificado"}</span>
            </div>
          </div>
          <p style="color:#475569;font-size:13px;text-align:center;">Recordá llegar 10 minutos antes de tu cita 🕐</p>
          <div class="cta">
            <a href="https://imedgt.app/patient-dashboard">Ver mis citas</a>
          </div>
        </div>
        <div class="footer">iMed Guatemala · Tu salud, a un clic de distancia · <a href="https://imedgt.app" style="color:#2563eb;">imedgt.app</a></div>
      </div>
    </body></html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "iMed Guatemala <noreply@imedgt.app>",
        to: [doctor_email || "luisan.cabrera@gmail.com"],
        subject: `Nueva cita — ${paciente_name || "Paciente"} · ${fecha || ""}`,
        html: doctorHtml,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "iMed Guatemala <noreply@imedgt.app>",
        to: [paciente_email || "luisan.cabrera@gmail.com"],
        subject: `Cita confirmada con Dr. ${doctor_name || ""} · ${fecha || ""}`,
        html: pacienteHtml,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});