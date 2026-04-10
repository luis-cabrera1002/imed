// ============================================================
// iMed Guatemala — Edge Function: create-room
// Crea una sala de videollamada Daily.co para una cita médica.
//
// Requiere en Supabase Secrets (proyecto usmjxdoboaxpbmuoproo):
//   DAILY_API_KEY = (obtener en https://dashboard.daily.co → Developers → API keys)
//
// Uso:
//   functionsClient.functions.invoke("create-room", { body: { cita_id } })
// ============================================================

const DAILY_API_KEY = Deno.env.get("DAILY_API_KEY");
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intentá en un minuto." }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const { cita_id } = await req.json();
    if (!cita_id) {
      return new Response(JSON.stringify({ error: "Missing cita_id" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Si no hay API key de Daily.co, retornar sala demo para testing
    if (!DAILY_API_KEY) {
      console.warn("DAILY_API_KEY not set — returning demo room");
      const demoRoomName = `imed-demo-${cita_id.slice(0, 8)}`;
      return new Response(JSON.stringify({
        room_url: `https://imed-gt.daily.co/${demoRoomName}`,
        room_name: demoRoomName,
        demo: true,
        message: "Sala demo — configurar DAILY_API_KEY en Supabase Secrets para activar telemedicina real",
      }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Nombre único de sala basado en cita_id
    const roomName = `imed-${cita_id.slice(0, 16)}`;

    // Crear sala en Daily.co
    const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp: Math.floor(Date.now() / 1000) + 60 * 120, // expira en 2 horas
          max_participants: 2,
          enable_screenshare: false,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!dailyRes.ok) {
      const errData = await dailyRes.json();
      // Si la sala ya existe (409), obtenerla
      if (dailyRes.status === 409) {
        const getRes = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          headers: { "Authorization": `Bearer ${DAILY_API_KEY}` },
        });
        if (getRes.ok) {
          const room = await getRes.json();
          return new Response(JSON.stringify({ room_url: room.url, room_name: room.name }), {
            headers: { ...CORS, "Content-Type": "application/json" },
          });
        }
      }
      throw new Error(errData.info || "Error creando sala Daily.co");
    }

    const room = await dailyRes.json();
    return new Response(JSON.stringify({ room_url: room.url, room_name: room.name }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("create-room error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
