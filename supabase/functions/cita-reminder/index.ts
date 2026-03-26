import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY  = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails("mailto:info@imedgt.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Guatemala is UTC-6. The cron fires at 16:00 UTC = 10:00 AM Guatemala.
// "Tomorrow" is computed in UTC — correct for GT date appointments.
function tomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function dbFetch(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

Deno.serve(async (req) => {
  // Allow manual POST trigger (e.g. from cron via pg_net) and OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  try {
    const fecha = tomorrowDateStr();
    console.log(`[cita-reminder] Buscando citas para: ${fecha}`);

    // 1. Fetch citas para mañana con estado pendiente o confirmada
    const citas = await dbFetch(
      `citas?fecha=eq.${fecha}&estado=in.(pendiente,confirmada)&select=id,paciente_id,doctor_id,hora`
    );

    if (!Array.isArray(citas) || citas.length === 0) {
      console.log("[cita-reminder] Sin citas para mañana.");
      return new Response(JSON.stringify({ sent: 0, date: fecha }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[cita-reminder] ${citas.length} cita(s) encontradas.`);

    // 2. Resolver nombres de doctores en batch
    const doctorIds = [...new Set(citas.map((c: any) => c.doctor_id))];
    const doctorProfiles = await dbFetch(
      `profiles?user_id=in.(${doctorIds.join(",")})&select=user_id,full_name`
    );
    const doctorMap: Record<string, string> = {};
    for (const p of doctorProfiles) doctorMap[p.user_id] = p.full_name;

    // 3. Resolver push subscriptions de pacientes en batch
    const pacienteIds = [...new Set(citas.map((c: any) => c.paciente_id))];
    const suscripciones = await dbFetch(
      `push_subscriptions?user_id=in.(${pacienteIds.join(",")})&select=user_id,subscription`
    );
    const subMap: Record<string, any> = {};
    for (const s of suscripciones) subMap[s.user_id] = s.subscription;

    // 4. Enviar push a cada paciente
    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const cita of citas) {
      const subscription = subMap[cita.paciente_id];
      if (!subscription) {
        console.log(`[cita-reminder] Sin suscripción para paciente ${cita.paciente_id}`);
        skipped++;
        continue;
      }

      const doctorNombre = doctorMap[cita.doctor_id] ?? "tu médico";
      const hora = (cita.hora as string).substring(0, 5); // HH:MM

      const payload = JSON.stringify({
        title: "Recordatorio iMed 📅",
        body: `Mañana tenés cita con ${doctorNombre} a las ${hora}. ¡No olvidés llegar 10 min antes!`,
        url: "/mis-citas",
        tag: `cita-reminder-${cita.id}`,
        badgeCount: 1,
      });

      try {
        await webpush.sendNotification(subscription, payload);
        sent++;
        console.log(`[cita-reminder] Push enviado → paciente ${cita.paciente_id}`);
      } catch (err) {
        const msg = `Error enviando a ${cita.paciente_id}: ${err}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    const result = { date: fecha, total_citas: citas.length, sent, skipped, errors };
    console.log("[cita-reminder] Resultado:", result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("[cita-reminder] Error fatal:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
