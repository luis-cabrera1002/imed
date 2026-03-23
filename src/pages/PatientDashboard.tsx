import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, Stethoscope, FileText, MapPin,
  Search, ChevronRight, User, Activity, LogOut
} from "lucide-react";

const ESTADO: Record<string, { label: string; bg: string }> = {
  pendiente:  { label: "Pendiente",  bg: "bg-yellow-100 text-yellow-800" },
  confirmada: { label: "Confirmada", bg: "bg-teal-100 text-teal-800" },
  completada: { label: "Completada", bg: "bg-green-100 text-green-800" },
  cancelada:  { label: "Cancelada",  bg: "bg-red-100 text-red-800" },
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    await Promise.all([loadPerfil(user.id), loadCitas(user.id), loadRecetas(user.id)]);
    setLoading(false);
  }

  async function loadPerfil(uid: string) {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).single();
    if (data) setPerfil(data);
  }

  async function loadCitas(uid: string) {
    const { data } = await supabase
      .from("citas").select("*")
      .eq("paciente_id", uid)
      .order("fecha", { ascending: true });
    if (!data || data.length === 0) { setCitas([]); return; }
    const doctorIds = [...new Set(data.map((c: any) => c.doctor_id))];
    const { data: profiles } = await supabase
      .from("profiles").select("user_id, full_name").in("user_id", doctorIds);
    const { data: dProfiles } = await supabase
      .from("doctor_profiles").select("user_id, especialidad, clinica").in("user_id", doctorIds);
    setCitas(data.map((c: any) => ({
      ...c,
      doctor_nombre: (profiles as any[])?.find(p => p.user_id === c.doctor_id)?.full_name || "Doctor",
      especialidad:  (dProfiles as any[])?.find(p => p.user_id === c.doctor_id)?.especialidad || "",
      clinica:       (dProfiles as any[])?.find(p => p.user_id === c.doctor_id)?.clinica || "",
    })));
  }

  async function loadRecetas(uid: string) {
    const { data } = await supabase
      .from("recetas").select("*, receta_medicamentos(*)")
      .eq("paciente_id", uid)
      .order("created_at", { ascending: false })
      .limit(5);
    if (!data || data.length === 0) { setRecetas([]); return; }
    const doctorIds = [...new Set(data.map((r: any) => r.doctor_id))];
    const { data: profiles } = await supabase
      .from("profiles").select("user_id, full_name").in("user_id", doctorIds);
    setRecetas(data.map((r: any) => ({
      ...r,
      doctor_nombre: (profiles as any[])?.find(p => p.user_id === r.doctor_id)?.full_name || "Doctor",
      medicamentos:  r.receta_medicamentos || [],
    })));
  }

  const today = new Date().toISOString().split("T")[0];
  const citasProximas = citas.filter(c => c.fecha >= today && c.estado !== "cancelada");
  const citasHoy      = citas.filter(c => c.fecha === today && c.estado !== "cancelada");
  const citasPasadas  = citas.filter(c => c.fecha < today || c.estado === "completada");
  const nombre = perfil?.full_name?.split(" ")[0] || "Paciente";

  const fmtFecha = (f: string) => {
    if (!f) return "";
    return new Date(f + "T12:00:00").toLocaleDateString("es-GT", {
      weekday: "short", month: "short", day: "numeric"
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 px-4 pt-6 pb-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-teal-100 text-xs font-medium">Bienvenido de vuelta</p>
                <h1 className="text-white font-bold text-lg">{nombre}</h1>
              </div>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}
              className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Citas hoy",  val: citasHoy.length },
              { label: "Próximas",   val: citasProximas.length },
              { label: "Recetas",    val: recetas.length },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-teal-100 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-8 space-y-4">

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Buscar Doctor", sub: "659+ disponibles", icon: Search,   color: "bg-teal-100",   ic: "text-teal-600",   path: "/doctores" },
            { label: "Ver Mapa",      sub: "Cerca de ti",      icon: MapPin,   color: "bg-blue-100",   ic: "text-blue-600",   path: "/mapa-doctores" },
            { label: "Mis Citas",     sub: `${citasProximas.length} próximas`, icon: Calendar, color: "bg-purple-100", ic: "text-purple-600", path: "/mis-citas" },
            { label: "Mis Recetas",   sub: `${recetas.length} recetas`,        icon: FileText, color: "bg-green-100",  ic: "text-green-600",  path: "/mis-recetas" },
          ].map(({ label, sub, icon: Icon, color, ic, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Próxima cita */}
        {citasProximas.length > 0 ? (
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />Próxima Cita
                </h3>
                <button onClick={() => navigate("/mis-citas")}
                  className="text-xs text-teal-600 font-semibold flex items-center gap-0.5">
                  Ver todas<ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {(() => {
                const c = citasProximas[0];
                const cfg = ESTADO[c.estado] || ESTADO.pendiente;
                return (
                  <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{c.doctor_nombre}</p>
                        <p className="text-teal-600 text-sm">{c.especialidad}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-xs font-semibold text-gray-700">{fmtFecha(c.fecha)}</span>
                      </div>
                      <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-xs font-semibold text-gray-700">{c.hora}</span>
                      </div>
                    </div>
                    {c.clinica && (
                      <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-xs font-semibold text-gray-700">{c.clinica}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline"
                        className="flex-1 border-teal-200 text-teal-700 rounded-xl text-xs"
                        onClick={() => window.open(
                          `https://www.google.com/maps/search/${encodeURIComponent((c.clinica || "") + " Guatemala")}`,
                          "_blank"
                        )}>
                        <MapPin className="w-3 h-3 mr-1" />Ver en Mapa
                      </Button>
                      <Button size="sm"
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs"
                        onClick={() => navigate("/mis-citas")}>
                        Ver detalle
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-6 text-center">
              <Stethoscope className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <h3 className="font-bold text-white text-lg mb-1">¿Necesitas ver a un médico?</h3>
              <p className="text-teal-100 text-sm mb-4">
                Encuentra especialistas en toda Guatemala y agenda en minutos.
              </p>
              <Button onClick={() => navigate("/doctores")}
                className="bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl px-6">
                Buscar Doctor
              </Button>
            </div>
          </Card>
        )}

        {/* Recetas recientes */}
        {recetas.length > 0 && (
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />Recetas Recientes
                </h3>
                <button onClick={() => navigate("/mis-recetas")}
                  className="text-xs text-teal-600 font-semibold flex items-center gap-0.5">
                  Ver todas<ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {recetas.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.doctor_nombre}</p>
                      <p className="text-xs text-gray-500">
                        {r.medicamentos.length} medicamento{r.medicamentos.length !== 1 ? "s" : ""}
                        {r.diagnostico ? ` · ${r.diagnostico}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      r.estado === "surtida" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.estado === "surtida" ? "Surtida" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial */}
        {citasPasadas.length > 0 && (
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />Historial
                </h3>
                <button onClick={() => navigate("/mis-citas")}
                  className="text-xs text-teal-600 font-semibold flex items-center gap-0.5">
                  Ver todo<ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {citasPasadas.slice(0, 3).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">{c.doctor_nombre}</p>
                      <p className="text-xs text-gray-400">{fmtFecha(c.fecha)} · {c.especialidad}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      ESTADO[c.estado]?.bg || "bg-gray-100 text-gray-600"
                    }`}>
                      {ESTADO[c.estado]?.label || c.estado}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
