import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Send, MessageCircle, Calendar, ChevronLeft } from "lucide-react";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string | null;
  otro_nombre: string;
  otro_id: string;
}

interface Mensaje {
  id: string;
  sender_id: string;
  mensaje: string;
  created_at: string;
  leido: boolean;
}

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00").toLocaleDateString("es-GT", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const citaIdParam = searchParams.get("cita");

  const [user, setUser] = useState<any>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [role, setRole] = useState<string>("patient");
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth"); return; }
    setUser(u);

    // Get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", u.id)
      .single();
    const userRole = profile?.role ?? "patient";
    setRole(userRole);

    // Load citas (as patient or doctor)
    const isDoctor = userRole === "doctor";
    const idField = isDoctor ? "doctor_id" : "paciente_id";
    const otherField = isDoctor ? "paciente_id" : "doctor_id";

    const { data: citasData } = await supabase
      .from("citas")
      .select(`id, fecha, hora, estado, ${otherField}`)
      .eq(idField, u.id)
      .order("fecha", { ascending: false });

    if (!citasData) { setLoadingCitas(false); return; }

    // Resolve names for the "other" party
    const otherIds = [...new Set(citasData.map((c: any) => c[otherField]))];
    const { data: perfiles } = otherIds.length > 0
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", otherIds)
      : { data: [] };
    const nameMap: Record<string, string> = {};
    (perfiles ?? []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });

    const citasList: Cita[] = citasData.map((c: any) => ({
      id: c.id,
      fecha: c.fecha,
      hora: c.hora,
      estado: c.estado,
      otro_id: c[otherField],
      otro_nombre: nameMap[c[otherField]] ?? (isDoctor ? "Paciente" : "Doctor"),
    }));

    setCitas(citasList);
    setLoadingCitas(false);

    // Auto-select from URL param
    if (citaIdParam) {
      const found = citasList.find(c => c.id === citaIdParam);
      if (found) selectCita(found, u.id);
    }
  }

  const loadMensajes = useCallback(async (citaId: string, userId: string) => {
    const { data } = await supabase
      .from("mensajes_chat")
      .select("id, sender_id, mensaje, created_at, leido")
      .eq("cita_id", citaId)
      .order("created_at", { ascending: true });
    setMensajes(data ?? []);

    // Mark unread messages as read
    if (data && data.length > 0) {
      const unread = data.filter((m: Mensaje) => !m.leido && m.sender_id !== userId);
      if (unread.length > 0) {
        await supabase
          .from("mensajes_chat")
          .update({ leido: true })
          .in("id", unread.map((m: Mensaje) => m.id));
      }
    }
  }, []);

  function selectCita(cita: Cita, userId?: string) {
    setSelectedCita(cita);
    const uid = userId ?? user?.id;
    if (!uid) return;

    // Unsubscribe old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    loadMensajes(cita.id, uid);

    // Subscribe to realtime inserts for this cita
    const channel = supabase
      .channel(`chat-${cita.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes_chat", filter: `cita_id=eq.${cita.id}` },
        (payload) => {
          setMensajes(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Mensaje];
          });
          // Mark as read if not sender
          if (payload.new.sender_id !== uid) {
            supabase.from("mensajes_chat").update({ leido: true }).eq("id", payload.new.id);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }

  // Cleanup realtime on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviarMensaje() {
    if (!texto.trim() || !selectedCita || !user) return;
    setEnviando(true);
    const msg = texto.trim();
    setTexto("");

    const { error } = await supabase.from("mensajes_chat").insert({
      cita_id: selectedCita.id,
      sender_id: user.id,
      receiver_id: selectedCita.otro_id,
      mensaje: msg,
    });

    if (error) {
      // Re-put text if failed
      setTexto(msg);
    }
    setEnviando(false);
  }

  const estadoColor: Record<string, string> = {
    completada: "bg-green-100 text-green-700",
    confirmada: "bg-blue-100 text-blue-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    cancelada: "bg-red-100 text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
        </div>

        <div className="flex gap-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 460 }}>

          {/* Sidebar: lista de citas */}
          <div className={`w-full md:w-72 flex-shrink-0 border-r border-gray-100 flex flex-col ${selectedCita ? "hidden md:flex" : "flex"}`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tus citas</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingCitas ? (
                <div className="flex items-center justify-center h-32 text-gray-300">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : citas.length === 0 ? (
                <div className="text-center py-12 text-gray-400 px-4">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No tenés citas aún</p>
                </div>
              ) : (
                citas.map(cita => (
                  <button
                    key={cita.id}
                    onClick={() => selectCita(cita)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-blue-50/60 transition-colors ${selectedCita?.id === cita.id ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{cita.otro_nombre}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatFecha(cita.fecha)} · {cita.hora.substring(0, 5)}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${estadoColor[cita.estado ?? ""] ?? "bg-gray-100 text-gray-500"}`}>
                        {cita.estado ?? "—"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className={`flex-1 flex flex-col ${!selectedCita ? "hidden md:flex" : "flex"}`}>
            {!selectedCita ? (
              <div className="flex-1 flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Seleccioná una cita para abrir el chat</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCita(null)}
                    className="md:hidden text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-900 text-sm flex-shrink-0">
                    {selectedCita.otro_nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedCita.otro_nombre}</p>
                    <p className="text-xs text-gray-400">{formatFecha(selectedCita.fecha)} · {selectedCita.hora.substring(0, 5)}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {mensajes.length === 0 && (
                    <div className="text-center text-gray-300 py-12">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Sin mensajes aún. ¡Iniciá la conversación!</p>
                    </div>
                  )}
                  {mensajes.map(m => {
                    const isMine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}>
                          <p className="leading-relaxed">{m.mensaje}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                            {new Date(m.created_at).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
                            {isMine && <span className="ml-1">{m.leido ? " ✓✓" : " ✓"}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={texto}
                      onChange={e => setTexto(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviarMensaje()}
                      placeholder="Escribí un mensaje..."
                      disabled={enviando}
                      className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                    />
                    <button
                      onClick={enviarMensaje}
                      disabled={!texto.trim() || enviando}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
