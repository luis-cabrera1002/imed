Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { doctor_email, doctor_name, paciente_email, paciente_name, fecha, hora, motivo } = body;

    // Email al doctor
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "iMed Guatemala <noreply@imedgt.app>",
        to: [doctor_email || "luisan.cabrera@gmail.com"],
        subject: "Nueva cita agendada — iMed Guatemala",
        html: `
          <h2>Nueva cita agendada</h2>
          <p>Hola Dr. ${doctor_name || ""},</p>
          <p>Tienes una nueva cita agendada:</p>
          <ul>
            <li><strong>Paciente:</strong> ${paciente_name || "No especificado"}</li>
            <li><strong>Fecha:</strong> ${fecha || "No especificada"}</li>
            <li><strong>Hora:</strong> ${hora || "No especificada"}</li>
            <li><strong>Motivo:</strong> ${motivo || "No especificado"}</li>
          </ul>
          <p>Ingresa a <a href="https://imedgt.app">imedgt.app</a> para ver los detalles.</p>
        `,
      }),
    });

    // Email al paciente
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "iMed Guatemala <noreply@imedgt.app>",
        to: [paciente_email || "luisan.cabrera@gmail.com"],
        subject: "Tu cita fue confirmada — iMed Guatemala",
        html: `
          <h2>Cita confirmada</h2>
          <p>Hola ${paciente_name || ""},</p>
          <p>Tu cita ha sido agendada exitosamente:</p>
          <ul>
            <li><strong>Doctor:</strong> Dr. ${doctor_name || "No especificado"}</li>
            <li><strong>Fecha:</strong> ${fecha || "No especificada"}</li>
            <li><strong>Hora:</strong> ${hora || "No especificada"}</li>
            <li><strong>Motivo:</strong> ${motivo || "No especificado"}</li>
          </ul>
          <p>Ingresa a <a href="https://imedgt.app">imedgt.app</a> para ver tus citas.</p>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
