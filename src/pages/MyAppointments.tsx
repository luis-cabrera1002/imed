import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, XCircle, ChevronRight, Stethoscope } from "lucide-react";

const ESTADO = {
  pendiente:  { label: "Pendiente",  bg: "bg-yellow-100 text-yellow-800",  dot: "bg-yellow-400",  icon: AlertCircle },
  confirmada: { label: "Confirmada", bg: "bg-teal-100 text-teal-800",      dot: "bg-teal-400",    icon: CheckCircle },
  completada: { label: "Completada", bg: "bg-green-100 text-green-800",    dot: "bg-green-500",   icon: CheckCircle },
  cancelada:  { label: "Cancelada",  bg: "bg-red-100 text-red-800",        dot: "bg-red-400",     icon: XCircle },
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("proximas");
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadCitas(); }, []);

  async function loadCitas() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    const { data: citasData } = await supabase.from("citas").select("*").eq("paciente_id", user.id).order("fecha", { ascending: true });
    if (!citasData || citasData.length === 0) { setLoading(false); return; }
    const doctorIds = [...new Set(citasData.map(c => c.doctor_id))];
    const { data: perfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", doctorIds);
    const { data: doctorPerfiles } = await supabase.from("doctor_profiles").select("user_id, especialidad, clinica, direccion").in("user_id", doctorIds);
    setCitas(citasData.map(cita => ({
      ...cita,
      doctor_nombre: perfiles?.find(p => p.user_id === cita.doctor_id)?.full_name || "Doctor",
      especialidad: doctorPerfiles?.find(p => p.user_id === cita.doctor_id)?.especialidad || "",
      clinica: doctorPerfiles?.find(p => p.user_id === cita.doctor_id)?.clinica || "",
      direccion: doctorPerfiles?.find(p => p.user_id === cita.doctor_id)?.direccion || "",
    })));
    setLoading(false);
  }

  async function cancelarCita(id) {
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    if (!error) {
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: "cancelada" } : c));
      setSelected(null);
      toast({ title: "Cita cancelada", description: "Tu cita fue cancelada correctamente." });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const proximas = citas.filter(c => c.fecha >= today && c.estado !== "cancelada");
  const historial = citas.filter(c => c.fecha < today || c.estado === "completada" || c.estado === "cancelada");
  const lista = tab === "proximas" ? proximas : historial;

  const fmtFecha = (f) => {
    if (!f) return "";
    const d = new Date(f + "T12:00:00");
    return d.toLocaleDateString("es-GT", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-600">Cargando tus citas...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-5 h-5 rotate-180"/>
          </button>
          <div>
            <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide">Mi Historial Médico</p>
            <h1 className="text-xl font-bold text-gray-900">Mis Citas Médicas</h1>
            <p className="text-xs text-gray-500">Gestiona tus citas próximas y revisa tu historial médico</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 mb-6 shadow-sm border border-gray-100">
          <button onClick={() => setTab("proximas")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab==="proximas" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Calendar className="w-4 h-4"/> Próximas Citas
            {proximas.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==="proximas"?"bg-white/20 text-white":"bg-teal-100 text-teal-700"}`}>{proximas.length}</span>}
          </button>
          <button onClick={() => setTab("historial")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab==="historial" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Stethoscope className="w-4 h-4"/> Historial
            {historial.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==="historial"?"bg-white/20 text-white":"bg-teal-100 text-teal-700"}`}>{historial.length}</span>}
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-teal-300"/>
            </div>
            <p className="text-gray-500 font-medium mb-2">{tab==="proximas" ? "No tienes citas próximas" : "No tienes historial de citas"}</p>
            <p className="text-gray-400 text-sm mb-6">Agenda una cita con cualquier médico de iMed</p>
            <Button onClick={() => navigate("/doctores")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6">
              Buscar un médico
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map(c => {
              const cfg = ESTADO[c.estado] || ESTADO.pendiente;
              const Icon = cfg.icon;
              return (
                <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-2xl overflow-hidden"
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}>
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{c.doctor_nombre}</h3>
                          {c.especialidad && <p className="text-teal-600 text-sm font-medium">{c.especialidad}</p>}
                        </div>
                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.bg}`}>
                          <Icon className="w-3 h-3"/>{cfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-500 flex-shrink-0"/>
                          <div>
                            <p className="text-xs text-teal-600 font-medium">Fecha</p>
                            <p className="text-xs text-gray-800 font-semibold">{fmtFecha(c.fecha)}</p>
                          </div>
                        </div>
                        <div className="bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-500 flex-shrink-0"/>
                          <div>
                            <p className="text-xs text-teal-600 font-medium">Hora</p>
                            <p className="text-xs text-gray-800 font-semibold">{c.hora}</p>
                          </div>
                        </div>
                        {c.clinica && (
                          <div className="bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2 col-span-2">
                            <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0"/>
                            <div>
                              <p className="text-xs text-teal-600 font-medium">Ubicación</p>
                              <p className="text-xs text-gray-800 font-semibold">{c.clinica}</p>
                            </div>
                          </div>
                        )}
                        {c.motivo && (
                          <div className="bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2 col-span-2">
                            <Stethoscope className="w-4 h-4 text-teal-500 flex-shrink-0"/>
                            <div>
                              <p className="text-xs text-teal-600 font-medium">Notas</p>
                              <p className="text-xs text-gray-800 font-semibold">{c.motivo}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Expandido */}
                    {selected?.id === c.id && (
                      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex gap-3">
                        {c.direccion && (
                          <Button variant="outline" size="sm"
                            className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl text-xs"
                            onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/${encodeURIComponent(c.clinica + " " + c.direccion + " Guatemala")}`, "_blank"); }}>
                            <MapPin className="w-3 h-3 mr-1"/> Ver en Mapa
                          </Button>
                        )}
                        {c.estado === "confirmada" && (
                          <Button size="sm"
                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-xs"
                            variant="outline"
                            onClick={e => { e.stopPropagation(); cancelarCita(c.id); }}>
                            <XCircle className="w-3 h-3 mr-1"/> Cancelar Cita
                          </Button>
                        )}
                        <Button size="sm"
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs"
                          onClick={e => { e.stopPropagation(); navigate(`/doctores/${c.doctor_id}`); }}>
                          Ver Doctor
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button onClick={() => navigate("/doctores")} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 font-semibold">
            + Agendar nueva cita
          </Button>
        </div>
      </div>
    </div>
  );
}
