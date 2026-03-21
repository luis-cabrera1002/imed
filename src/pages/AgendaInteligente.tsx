import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Calendar, Clock, CheckCircle, XCircle, Sparkles, ArrowLeft, RefreshCw, Phone, MessageSquare } from "lucide-react";

export default function AgendaInteligente() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [user, setUser] = useState(null);
  const [mensajesIA, setMensajesIA] = useState({});

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);
    await loadSugerencias(user.id);
  }

  async function loadSugerencias(doctorId) {
    setLoading(true);
    const { data } = await supabase
      .from("agenda_sugerencias")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const pacienteIds = [...new Set(data.map(s => s.paciente_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", pacienteIds);
      const pm = {};
      (profiles || []).forEach(p => { pm[p.user_id] = p; });
      setSugerencias(data.map(s => ({
        ...s,
        paciente_nombre: pm[s.paciente_id]?.full_name || "Paciente",
        paciente_telefono: pm[s.paciente_id]?.phone || "",
      })));
    } else {
      setSugerencias([]);
    }
    setLoading(false);
  }

  async function generarMensajePaciente(sugerencia, aceptado) {
    try {
      const res = await supabase.functions.invoke("generar-mensaje-paciente", {
        body: { paciente_nombre: sugerencia.paciente_nombre, doctor_id: sugerencia.doctor_id, fecha: sugerencia.fecha_disponible, hora: sugerencia.hora_disponible, motivo: sugerencia.motivo_sugerencia, aceptado },
      });
      return res.data?.mensaje || (aceptado ? `Hola ${sugerencia.paciente_nombre}, tu cita fue confirmada para el ${sugerencia.fecha_disponible} a las ${sugerencia.hora_disponible}. Te esperamos en iMed!` : `Hola ${sugerencia.paciente_nombre}, el médico no puede atenderte en ese horario. Agenda otra cita en imedgt.app`);
    } catch {
      return aceptado ? `Hola ${sugerencia.paciente_nombre}, tu cita fue confirmada para el ${sugerencia.fecha_disponible} a las ${sugerencia.hora_disponible}. Te esperamos en iMed!` : `Hola ${sugerencia.paciente_nombre}, el médico no puede atenderte en ese horario. Agenda otra cita en imedgt.app`;
    }
  }

  async function responder(sugerencia, accion) {
    setProcesando(sugerencia.id);
    try {
      const mensajePaciente = await generarMensajePaciente(sugerencia, accion === "aceptada");
      setMensajesIA(prev => ({ ...prev, [sugerencia.id]: mensajePaciente }));
      await supabase.from("agenda_sugerencias").update({ estado: accion, mensaje_paciente: mensajePaciente, updated_at: new Date().toISOString() }).eq("id", sugerencia.id);
      if (accion === "aceptada") {
        await supabase.from("citas").insert({ paciente_id: sugerencia.paciente_id, doctor_id: sugerencia.doctor_id, fecha: sugerencia.fecha_disponible, hora: sugerencia.hora_disponible, motivo: sugerencia.motivo_sugerencia || "Cita sugerida por iMed", estado: "confirmada" });
      }
      setSugerencias(prev => prev.filter(s => s.id !== sugerencia.id));
      toast({ title: accion === "aceptada" ? "✅ Cita confirmada" : "❌ Sugerencia rechazada", description: accion === "aceptada" ? `Cita agendada con ${sugerencia.paciente_nombre}` : `Se notificó a ${sugerencia.paciente_nombre}` });
    } catch(e) {
      toast({ title: "Error", description: "No se pudo procesar", variant: "destructive" });
    }
    setProcesando(null);
  }

  const fmtFecha = (f) => f ? new Date(f + "T12:00:00").toLocaleDateString("es-GT", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/doctor-dashboard")} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5"/></button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center"><Brain className="w-4 h-4 text-white"/></div>
              <div>
                <h1 className="font-bold text-gray-900 text-base">Agenda Inteligente</h1>
                <p className="text-xs text-gray-500">Sugerencias de iMed IA</p>
              </div>
            </div>
          </div>
          <button onClick={() => user && loadSugerencias(user.id)} className="text-gray-400 hover:text-gray-600 p-2"><RefreshCw className="w-4 h-4"/></button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 flex-shrink-0 mt-0.5"/>
            <div>
              <h2 className="font-bold text-base mb-1">¿Cómo funciona?</h2>
              <p className="text-purple-100 text-sm leading-relaxed">Cuando un paciente cancela, iMed busca automáticamente pacientes disponibles para ese horario y te los sugiere aquí. ¡Acepta o rechaza con un clic y la IA notifica al paciente!</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-500">Buscando sugerencias...</p>
          </div>
        ) : sugerencias.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-10 h-10 text-purple-200"/>
            </div>
            <h3 className="font-bold text-gray-700 mb-2">No hay sugerencias pendientes</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">Cuando un paciente cancele una cita, iMed buscará automáticamente candidatos para ese espacio.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">{sugerencias.length} sugerencia{sugerencias.length > 1 ? "s" : ""} pendiente{sugerencias.length > 1 ? "s" : ""}</p>
            {sugerencias.map(s => (
              <Card key={s.id} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-purple-50 px-5 py-3 flex items-center justify-between border-b border-purple-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600"/>
                      <span className="text-sm font-semibold text-purple-800">{fmtFecha(s.fecha_disponible)}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3"/>
                      <span className="text-xs font-bold">{s.hora_disponible}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-purple-700">{(s.paciente_nombre||"P")[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{s.paciente_nombre}</p>
                        {s.paciente_telefono && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3"/>{s.paciente_telefono}</p>}
                      </div>
                    </div>
                    {s.motivo_sugerencia && (
                      <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Motivo</p>
                        <p className="text-sm text-gray-700">{s.motivo_sugerencia}</p>
                      </div>
                    )}
                    {s.mensaje_doctor && (
                      <div className="bg-purple-50 rounded-xl px-4 py-3 mb-4 border border-purple-100">
                        <div className="flex items-center gap-1.5 mb-1"><Sparkles className="w-3.5 h-3.5 text-purple-500"/><p className="text-xs text-purple-600 font-semibold">Mensaje de iMed IA</p></div>
                        <p className="text-sm text-purple-800 leading-relaxed">{s.mensaje_doctor}</p>
                      </div>
                    )}
                    {mensajesIA[s.id] && (
                      <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4 border border-blue-100">
                        <div className="flex items-center gap-1.5 mb-1"><MessageSquare className="w-3.5 h-3.5 text-blue-500"/><p className="text-xs text-blue-600 font-semibold">Mensaje enviado al paciente</p></div>
                        <p className="text-sm text-blue-800 leading-relaxed">{mensajesIA[s.id]}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button disabled={procesando===s.id} onClick={() => responder(s,"rechazada")} variant="outline" className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold">
                        <XCircle className="w-4 h-4 mr-1.5"/>{procesando===s.id?"...":"Rechazar"}
                      </Button>
                      <Button disabled={procesando===s.id} onClick={() => responder(s,"aceptada")} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-sm">
                        <CheckCircle className="w-4 h-4 mr-1.5"/>{procesando===s.id?"Procesando...":"Aceptar Cita"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
