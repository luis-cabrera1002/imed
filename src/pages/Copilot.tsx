import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { functionsClient } from "@/integrations/supabase/functionsClient";
import {
  Bot, Send, Loader2, AlertTriangle, Phone, X, Shield,
  Droplets, Pill, HeartPulse, Trash2, ChevronDown, Zap,
  User, Stethoscope, MessageCircle,
} from "lucide-react";

interface Mensaje {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  es_emergencia?: boolean;
}

interface PacienteCtx {
  nombre: string;
  grupo_sanguineo: string | null;
  condiciones: string[];
  alergias: string[];
  medicamentos: string[];
  imc: string | null;
  peso: number | null;
  altura: number | null;
  ultimo_diagnostico: string | null;
  ultimo_doctor: string | null;
}

const SUGERENCIAS = [
  "¿Cómo estoy hoy según mi historial?",
  "Tengo fiebre desde ayer",
  "¿Puedo tomar ibuprofeno?",
  "Necesito cita urgente",
  "Explícame mi condición",
  "¿Hay interacción entre mis medicamentos?",
];

const INSTRUCCIONES_EMERGENCIA = [
  "Mantené la calma y avisá a alguien cercano",
  "No te muevas si hay dolor pecho o dificultad para respirar",
  "Aflojá ropa ajustada (corbata, cinturón, botones)",
  "Si perdés conciencia: pedí a alguien que haga RCP",
  "Tené tu carnet de identificación o expediente listo para los paramédicos",
];

export default function Copilot() {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<PacienteCtx | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [emergencia, setEmergencia] = useState(false);
  const [modoEmergencia, setModoEmergencia] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [showSugerencias, setShowSugerencias] = useState(true);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, enviando]);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUserId(user.id);

    // Cargar perfil + expediente en paralelo
    const [{ data: profile }, { data: exp }, { data: citas }] = await Promise.all([
      supabase.from("profiles").select("full_name, role").eq("user_id", user.id).single(),
      supabase.from("expediente_medico").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("citas")
        .select("doctor_id, notas_clinicas(diagnostico)")
        .eq("paciente_id", user.id)
        .eq("estado", "completada")
        .order("fecha", { ascending: false })
        .limit(1),
    ]);

    if (profile?.role !== "patient") { navigate("/patient-dashboard"); return; }

    // Calcular IMC
    let imc: string | null = null;
    if (exp?.peso && exp?.altura) {
      const altM = (exp.altura as number) / 100;
      imc = ((exp.peso as number) / (altM * altM)).toFixed(1);
    }

    // Obtener último doctor
    let ultimoDoctor: string | null = null;
    if ((citas as any)?.[0]?.doctor_id) {
      const { data: dp } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", (citas as any)[0].doctor_id)
        .single();
      ultimoDoctor = dp?.full_name ?? null;
    }

    // Último diagnóstico
    const ultimoDiag = (citas as any)?.[0]?.notas_clinicas?.[0]?.diagnostico ?? null;

    const ctx: PacienteCtx = {
      nombre:            profile?.full_name?.split(" ")[0] ?? "Paciente",
      grupo_sanguineo:   (exp as any)?.grupo_sanguineo ?? null,
      condiciones:       (exp as any)?.condiciones ?? [],
      alergias:          (exp as any)?.alergias ?? [],
      medicamentos:      (exp as any)?.medicamentos_activos ?? [],
      imc,
      peso:              (exp as any)?.peso ?? null,
      altura:            (exp as any)?.altura ?? null,
      ultimo_diagnostico: ultimoDiag,
      ultimo_doctor:      ultimoDoctor,
    };
    setPaciente(ctx);

    // Cargar historial de mensajes
    const { data: msgs } = await supabase
      .from("copilot_messages")
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (msgs && msgs.length > 0) {
      setMensajes(msgs as Mensaje[]);
      setShowSugerencias(false);
    } else {
      // Mensaje de bienvenida
      const welcome: Mensaje = {
        id: "welcome",
        role: "assistant",
        content: `¡Hola, ${ctx.nombre}! 👋 Soy **iMed Copilot**, tu asistente médico personal.\n\nEstoy aquí para ayudarte 24/7. Conozco tu historial médico y puedo responder tus consultas de salud de forma personalizada.\n\n¿En qué te puedo ayudar hoy?`,
        created_at: new Date().toISOString(),
      };
      setMensajes([welcome]);
    }
    setCargando(false);
  }

  const enviar = useCallback(async (textoEnviar?: string) => {
    const msg = (textoEnviar ?? texto).trim();
    if (!msg || enviando || !userId || !paciente) return;

    setTexto("");
    setShowSugerencias(false);
    setEnviando(true);

    // Agregar mensaje del usuario inmediatamente
    const userMsg: Mensaje = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMensajes(prev => [...prev, userMsg]);

    try {
      // Guardar mensaje usuario en DB
      const { data: savedUser } = await supabase
        .from("copilot_messages")
        .insert({ user_id: userId, role: "user", content: msg })
        .select("id")
        .single();

      // Llamar a edge function
      const { data, error } = await functionsClient.functions.invoke("copilot-chat", {
        body: {
          mensaje: msg,
          historial: mensajes.filter(m => m.id !== "welcome").slice(-10),
          paciente,
        },
      });

      if (error) throw new Error(error.message);

      const respuesta = data?.respuesta ?? "No pude procesar tu consulta.";
      const esEmergencia = data?.es_emergencia ?? false;

      if (esEmergencia) setEmergencia(true);

      // Guardar respuesta en DB
      const { data: savedAssistant } = await supabase
        .from("copilot_messages")
        .insert({ user_id: userId, role: "assistant", content: respuesta })
        .select("id")
        .single();

      const assistantMsg: Mensaje = {
        id: savedAssistant?.id ?? `tmp-a-${Date.now()}`,
        role: "assistant",
        content: respuesta,
        created_at: new Date().toISOString(),
        es_emergencia: esEmergencia,
      };

      setMensajes(prev => [
        ...prev.filter(m => m.id !== userMsg.id),
        { ...userMsg, id: savedUser?.id ?? userMsg.id },
        assistantMsg,
      ]);
    } catch (err: any) {
      const errorMsg: Mensaje = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Hubo un error al procesar tu consulta. Por favor intentá de nuevo. 🔄",
        created_at: new Date().toISOString(),
      };
      setMensajes(prev => [...prev, errorMsg]);
    } finally {
      setEnviando(false);
      inputRef.current?.focus();
    }
  }, [texto, mensajes, userId, paciente, enviando]);

  async function limpiarChat() {
    if (!userId || borrando) return;
    setBorrando(true);
    await supabase.from("copilot_messages").delete().eq("user_id", userId);
    const welcome: Mensaje = {
      id: "welcome",
      role: "assistant",
      content: `Chat limpiado. ¡Hola de nuevo, ${paciente?.nombre}! ¿En qué te puedo ayudar? 😊`,
      created_at: new Date().toISOString(),
    };
    setMensajes([welcome]);
    setEmergencia(false);
    setShowSugerencias(true);
    setBorrando(false);
  }

  // Renderizar markdown básico (negritas)
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      }
      return <span key={i}>{p}</span>;
    });
  }

  const profileItems = [
    paciente?.grupo_sanguineo ? { icon: Droplets, label: paciente.grupo_sanguineo, color: "text-red-400" } : null,
    paciente?.condiciones?.length ? { icon: HeartPulse, label: `${paciente.condiciones.length} condición${paciente.condiciones.length > 1 ? "es" : ""}`, color: "text-blue-400" } : null,
    paciente?.alergias?.length    ? { icon: Shield, label: `${paciente.alergias.length} alergia${paciente.alergias.length > 1 ? "s" : ""}`, color: "text-orange-400" } : null,
    paciente?.medicamentos?.length ? { icon: Pill, label: `${paciente.medicamentos.length} medicamento${paciente.medicamentos.length > 1 ? "s" : ""}`, color: "text-green-400" } : null,
  ].filter(Boolean) as { icon: any; label: string; color: string }[];

  if (cargando) return (
    <div className="h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-900" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
          <Bot className="absolute inset-0 m-auto w-7 h-7 text-blue-400" />
        </div>
        <p className="text-blue-300 text-sm">Cargando tu perfil médico...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0a1628] flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 py-3 bg-[#0d1e35] border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate("/patient-dashboard")} className="text-blue-300 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronDown className="w-5 h-5 rotate-90" />
        </button>

        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-sm">iMed Copilot</p>
            <span className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              En línea 24/7
            </span>
          </div>
          <p className="text-xs text-blue-400 truncate">Asistente médico de {paciente?.nombre}</p>
        </div>

        {/* Pills de perfil */}
        {profileItems.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5">
            {profileItems.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                <item.icon className={`w-3 h-3 ${item.color}`} />
                <span className="text-xs text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => setModoEmergencia(true)}
            className="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergencia</span>
          </button>
          <button
            onClick={limpiarChat}
            disabled={borrando}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
            title="Limpiar chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Banner emergencia detectada ── */}
      {emergencia && !modoEmergencia && (
        <div className="flex-shrink-0 bg-red-500/15 border-b border-red-500/30 px-4 py-2.5 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm font-medium flex-1">
            Se detectaron posibles síntomas de emergencia.
          </p>
          <a href="tel:128" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
            <Phone className="w-3.5 h-3.5" />
            Llamar 128
          </a>
          <button onClick={() => setEmergencia(false)} className="text-red-400 hover:text-red-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Modal Modo Emergencia ── */}
      {modoEmergencia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1e35] border border-red-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10">
            {/* Header emergencia */}
            <div className="bg-red-500/15 border-b border-red-500/30 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-black text-red-400 text-lg">MODO EMERGENCIA</span>
              </div>
              <button onClick={() => setModoEmergencia(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha del paciente */}
            <div className="p-5 space-y-3">
              <div className="bg-white/5 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">{paciente?.nombre}</span>
                </div>
                {paciente?.grupo_sanguineo && (
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-slate-300">Grupo sanguíneo: <strong className="text-white">{paciente.grupo_sanguineo}</strong></span>
                  </div>
                )}
                {paciente?.alergias && paciente.alergias.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-orange-400 uppercase">ALERGIAS CRÍTICAS</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {paciente.alergias.map(a => (
                          <span key={a} className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs px-2 py-0.5 rounded-full font-semibold">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {paciente?.medicamentos && paciente.medicamentos.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Pill className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400">Medicamentos actuales</span>
                      <p className="text-sm text-slate-300 mt-0.5">{paciente.medicamentos.join(", ")}</p>
                    </div>
                  </div>
                )}
                {paciente?.condiciones && paciente.condiciones.length > 0 && (
                  <div className="flex items-start gap-2">
                    <HeartPulse className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400">Condiciones conocidas</span>
                      <p className="text-sm text-slate-300 mt-0.5">{paciente.condiciones.join(", ")}</p>
                    </div>
                  </div>
                )}
                <Link
                  to="/expediente"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-1"
                  onClick={() => setModoEmergencia(false)}
                >
                  <Stethoscope className="w-3 h-3" />
                  Ver expediente completo
                </Link>
              </div>

              {/* Instrucciones mientras llega ayuda */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-400 uppercase mb-2">Mientras llega la ayuda</p>
                <ul className="space-y-1.5">
                  {INSTRUCCIONES_EMERGENCIA.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-4 h-4 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botones de llamada */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { num: "128", label: "Bomberos", color: "bg-red-500 hover:bg-red-600" },
                  { num: "122", label: "Policía",  color: "bg-blue-600 hover:bg-blue-700" },
                  { num: "1516", label: "MSPAS",   color: "bg-green-600 hover:bg-green-700" },
                ].map(b => (
                  <a
                    key={b.num}
                    href={`tel:${b.num}`}
                    className={`flex flex-col items-center gap-1 ${b.color} text-white py-3 rounded-2xl transition-colors shadow-lg`}
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-black">{b.num}</span>
                    <span className="text-xs opacity-80">{b.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mensajes ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {mensajes.map(m => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-1 shadow-md">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                isUser
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : m.es_emergencia
                    ? "bg-red-500/15 border border-red-500/30 text-slate-100 rounded-bl-sm"
                    : "bg-[#1a2f4a] text-slate-100 rounded-bl-sm"
              }`}>
                <p className="whitespace-pre-wrap">{renderContent(m.content)}</p>
                <p className={`text-xs mt-1.5 ${isUser ? "text-blue-200" : "text-slate-500"}`}>
                  {new Date(m.created_at).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {isUser && (
                <div className="w-7 h-7 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 mb-1">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {enviando && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[#1a2f4a] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Sugerencias rápidas ── */}
      {showSugerencias && !enviando && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SUGERENCIAS.map(s => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="flex-shrink-0 bg-[#1a2f4a] hover:bg-[#1e3858] border border-white/10 text-blue-300 text-xs px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-[#0d1e35] border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
              placeholder="Consultá con tu médico personal..."
              disabled={enviando}
              className="w-full bg-[#1a2f4a] border border-white/10 text-white placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => enviar()}
            disabled={!texto.trim() || enviando}
            className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            {enviando ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
        <p className="text-xs text-slate-600 text-center mt-2">
          iMed Copilot · No reemplaza al médico · Emergencias: 128
        </p>
      </div>
    </div>
  );
}
