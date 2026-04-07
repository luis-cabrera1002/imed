import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User, Calendar, DollarSign, Star, Clock, CheckCircle, XCircle, Brain,
  AlertCircle, TrendingUp, Users, Stethoscope, MapPin, Phone,
  Edit, Save, LogOut, ChevronRight, Activity, FileText, Plus, X, QrCode, ClipboardList
} from "lucide-react";

const ESPECIALIDADES = [
  "Medicina General","Pediatría","Ginecología","Cardiología","Dermatología",
  "Traumatología","Neurología","Psiquiatría","Oftalmología","Odontología",
  "Nutrición","Fisioterapia","Urología","Endocrinología","Gastroenterología"
];
const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const ESTADO_CONFIG = {
  pendiente:   { label: "Pendiente",   color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  confirmada:  { label: "Confirmada",  color: "bg-blue-100 text-blue-800",    icon: CheckCircle },
  completada:  { label: "Completada",  color: "bg-green-100 text-green-800",  icon: CheckCircle },
  cancelada:   { label: "Cancelada",   color: "bg-red-100 text-red-800",      icon: XCircle },
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [citas, setCitas] = useState([]);
  const [opiniones, setOpiniones] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [activeTab, setActiveTab] = useState("inicio");
  const [showRecetaForm, setShowRecetaForm] = useState(false);
  const [recetaForm, setRecetaForm] = useState({ paciente_id: "", medicamentos: [{ nombre: "", dosis: "", frecuencia: "", duracion: "", instrucciones: "" }], notas: "" });
  const [savingReceta, setSavingReceta] = useState(false);
  const [fullName, setFullName] = useState("");
  const [citaFilter, setCitaFilter] = useState("todas");
  const [perfil, setPerfil] = useState({
    especialidad: "", numero_colegiado: "", clinica: "", direccion: "",
    telefono: "", precio_consulta: "", dias_atencion: [],
    hora_inicio: "08:00", hora_fin: "17:00", bio: "",
    latitud: null, longitud: null, direccion_completa: ""
  });

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);
    await Promise.all([loadPerfil(user.id), loadCitas(user.id), loadOpiniones(user.id), loadFullName(user.id), loadRecetas(user.id)]);
    setLoading(false);
  }

  async function loadFullName(userId) {
    const { data } = await supabase.from("profiles").select("full_name").eq("user_id", userId).single();
    if (data) setFullName(data.full_name || "");
  }

  async function loadPerfil(userId) {
    const { data } = await supabase.from("doctor_profiles").select("*").eq("user_id", userId).single();
    if (data) setPerfil({
      especialidad: data.especialidad || "", numero_colegiado: data.numero_colegiado || "",
      clinica: data.clinica || "", direccion: data.direccion || "",
      telefono: data.telefono || "", precio_consulta: data.precio_consulta?.toString() || "",
      dias_atencion: data.dias_atencion || [], hora_inicio: data.hora_inicio || "08:00",
      hora_fin: data.hora_fin || "17:00", bio: data.bio || "",
      latitud: data.latitud || null, longitud: data.longitud || null,
      direccion_completa: data.direccion_completa || ""
    });
  }

  async function loadCitas(userId) {
    const { data } = await supabase.from("citas").select("*").eq("doctor_id", userId).order("fecha", { ascending: false });
    if (data) {
      const patientIds = [...new Set(data.map(c => c.paciente_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", patientIds);
      const pm = {};
      (profiles || []).forEach(p => { pm[p.user_id] = p.full_name; });
      setCitas(data.map(c => ({ ...c, paciente_nombre: pm[c.paciente_id] || "Paciente" })));
    }
  }

  async function loadRecetas(userId) {
    const { data } = await supabase.from("recetas_digitales").select("*, paciente:paciente_id(full_name:profiles(full_name))").eq("doctor_id", userId).order("created_at", { ascending: false });
    if (data) {
      // Fetch patient names separately
      const pIds = [...new Set(data.map(r => r.paciente_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", pIds);
      const pm: Record<string, string> = {};
      (profiles || []).forEach(p => { pm[p.user_id] = p.full_name; });
      setRecetas(data.map(r => ({ ...r, paciente_nombre: pm[r.paciente_id] || "Paciente" })));
    }
  }

  async function loadOpiniones(userId) {
    const { data } = await supabase.from("opiniones").select("*").eq("doctor_id", userId).order("created_at", { ascending: false });
    if (data) setOpiniones(data);
  }

  async function savePerfil() {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id, especialidad: perfil.especialidad, numero_colegiado: perfil.numero_colegiado,
      clinica: perfil.clinica, direccion: perfil.direccion, telefono: perfil.telefono,
      precio_consulta: perfil.precio_consulta ? parseFloat(perfil.precio_consulta) : null,
      dias_atencion: perfil.dias_atencion, hora_inicio: perfil.hora_inicio, hora_fin: perfil.hora_fin,
      bio: perfil.bio, latitud: perfil.latitud, longitud: perfil.longitud,
      direccion_completa: perfil.direccion_completa, updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("doctor_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) { toast({ title: "Error al guardar", description: error.message, variant: "destructive" }); }
    else { toast({ title: "✅ Perfil guardado", description: "Tu información fue actualizada." }); }
    setSaving(false);
  }

  async function createReceta() {
    if (!user || !recetaForm.paciente_id || recetaForm.medicamentos.every(m => !m.nombre)) return;
    setSavingReceta(true);
    const meds = recetaForm.medicamentos.filter(m => m.nombre.trim());
    const { error } = await supabase.from("recetas_digitales").insert({
      doctor_id: user.id,
      paciente_id: recetaForm.paciente_id,
      medicamentos: meds,
      notas: recetaForm.notas || null,
    });
    if (!error) {
      toast({ title: "Receta creada", description: "La receta digital fue generada con QR." });
      setShowRecetaForm(false);
      setRecetaForm({ paciente_id: "", medicamentos: [{ nombre: "", dosis: "", frecuencia: "", duracion: "", instrucciones: "" }], notas: "" });
      await loadRecetas(user.id);
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSavingReceta(false);
  }

  async function updateCitaEstado(citaId, estado) {
    const { error } = await supabase.from("citas").update({ estado }).eq("id", citaId);
    if (!error) {
      setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado } : c));
      toast({ title: "Cita actualizada", description: `Estado cambiado a ${estado}` });
    }
  }

  async function getUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setPerfil(p => ({ ...p, latitud: lat, longitud: lng }));
      toast({ title: "📍 Ubicación capturada", description: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter(c => c.fecha === today);
  const citasPendientes = citas.filter(c => c.estado === "pendiente");
  const citasCompletadas = citas.filter(c => c.estado === "completada");
  const citasEsteMes = citas.filter(c => c.fecha?.startsWith(new Date().toISOString().slice(0, 7)));
  const ingresosMes = citasEsteMes.filter(c => c.estado === "completada").length * (parseFloat(perfil.precio_consulta) || 0);
  const avgRating = opiniones.length > 0 ? (opiniones.reduce((s, o) => s + (o.rating || 0), 0) / opiniones.length).toFixed(1) : "—";
  const pacientesUnicos = new Set(citas.map(c => c.paciente_id)).size;
  const citasFiltradas = citas.filter(c => {
    if (citaFilter === "hoy") return c.fecha === today;
    if (citaFilter === "todas") return true;
    return c.estado === citaFilter;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando tu dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{fullName || "Doctor"}</p>
              <p className="text-xs text-gray-500">{perfil.especialidad || "Completa tu perfil"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/")}>Ver App</Button>
            <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1" onClick={() => navigate("/agenda-inteligente")}>
              <Brain className="w-3 h-3"/> Agenda IA
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>
              <LogOut className="w-3 h-3 mr-1" /> Salir
            </Button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {["inicio","citas","recetas","opiniones","perfil"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              {tab === "inicio" ? "Inicio" : tab === "citas" ? `Citas (${citas.length})` : tab === "recetas" ? `Recetas (${recetas.length})` : tab === "opiniones" ? `Reseñas (${opiniones.length})` : "Mi Perfil"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {activeTab === "inicio" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Calendar, bg: "bg-blue-100", ic: "text-blue-600", badge: "Hoy", badgeC: "text-green-600 bg-green-50", val: citasHoy.length, label: "Citas hoy" },
                { icon: AlertCircle, bg: "bg-yellow-100", ic: "text-yellow-600", badge: "Pendientes", badgeC: "text-yellow-700 bg-yellow-50", val: citasPendientes.length, label: "Por confirmar" },
                { icon: DollarSign, bg: "bg-green-100", ic: "text-green-600", badge: "Este mes", badgeC: "text-blue-600 bg-blue-50", val: `Q${ingresosMes.toLocaleString()}`, label: "Ingresos estimados" },
                { icon: Star, bg: "bg-purple-100", ic: "text-purple-600", badge: `${opiniones.length} reseñas`, badgeC: "text-purple-700 bg-purple-50", val: avgRating, label: "Calificación" },
              ].map(({ icon: Icon, bg, ic, badge, badgeC, val, label }, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${ic}`} />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeC}`}>{badge}</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{val}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Rendimiento del mes</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Citas completadas", val: citasCompletadas.length, pct: citas.length > 0 ? (citasCompletadas.length/citas.length)*100 : 0, color: "bg-green-500" },
                      { label: "Citas este mes", val: citasEsteMes.length, pct: Math.min(citasEsteMes.length*5,100), color: "bg-blue-500" },
                      { label: "Pacientes únicos", val: pacientesUnicos, pct: Math.min(pacientesUnicos*10,100), color: "bg-purple-500" },
                    ].map(({label,val,pct,color}) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-semibold">{val}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full`} style={{width:`${pct}%`}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Citas de Hoy</h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{citasHoy.length} programadas</span>
                  </div>
                  {citasHoy.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No tienes citas para hoy</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {citasHoy.slice(0,5).map(c => {
                        const cfg = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG.pendiente;
                        return (
                          <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-700">{(c.paciente_nombre||"P")[0]}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{c.paciente_nombre}</p>
                                <p className="text-xs text-gray-500">{c.motivo||"Consulta general"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-700">{c.hora}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "citas" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["todas","hoy","pendiente","confirmada","completada"].map(f => (
                <button key={f} onClick={() => setCitaFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${citaFilter===f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:border-blue-600"}`}>
                  {f==="todas"?`Todas (${citas.length})`:f==="hoy"?`Hoy (${citasHoy.length})`:f==="pendiente"?`Pendientes (${citasPendientes.length})`:f==="confirmada"?`Confirmadas (${citas.filter(c=>c.estado==="confirmada").length})`:`Completadas (${citasCompletadas.length})`}
                </button>
              ))}
            </div>
            {citasFiltradas.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay citas en esta categoría</p>
              </div>
            ) : (
              <div className="space-y-3">
                {citasFiltradas.map(c => {
                  const cfg = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG.pendiente;
                  const Icon = cfg.icon;
                  return (
                    <Card key={c.id} className="border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-blue-700">{(c.paciente_nombre||"P")[0]}</span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{c.paciente_nombre}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{c.motivo||"Consulta general"}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3"/>{c.fecha}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3"/>{c.hora}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${cfg.color}`}>
                              <Icon className="w-3 h-3"/>{cfg.label}
                            </span>
                            {c.estado==="pendiente" && (
                              <div className="flex gap-1">
                                <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 text-white h-7 px-2" onClick={() => updateCitaEstado(c.id,"confirmada")}>Confirmar</Button>
                                <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 h-7 px-2" onClick={() => updateCitaEstado(c.id,"cancelada")}>Cancelar</Button>
                              </div>
                            )}
                            {c.estado==="confirmada" && (
                              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-7 px-3" onClick={() => updateCitaEstado(c.id,"completada")}>Marcar completada</Button>
                            )}
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2 gap-1 border-gray-200" onClick={() => navigate(`/expediente?patient_id=${c.paciente_id}`)}>
                              <ClipboardList className="w-3 h-3"/> Expediente
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "recetas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Recetas Digitales</h2>
              <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowRecetaForm(true)}>
                <Plus className="w-3.5 h-3.5"/> Nueva Receta
              </Button>
            </div>

            {showRecetaForm && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600"/>Nueva Receta Digital</h3>
                    <button onClick={() => setShowRecetaForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">ID del Paciente</label>
                    <select className="w-full h-9 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={recetaForm.paciente_id} onChange={e => setRecetaForm(f => ({...f, paciente_id: e.target.value}))}>
                      <option value="">Seleccionar paciente...</option>
                      {[...new Map(citas.map(c => [c.paciente_id, c.paciente_nombre])).entries()].map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Medicamentos</label>
                    {recetaForm.medicamentos.map((med, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input className="h-8 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none" placeholder="Nombre del medicamento *" value={med.nombre} onChange={e => setRecetaForm(f => { const m=[...f.medicamentos]; m[i]={...m[i],nombre:e.target.value}; return {...f,medicamentos:m}; })}/>
                          <input className="h-8 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none" placeholder="Dosis (ej: 500mg)" value={med.dosis} onChange={e => setRecetaForm(f => { const m=[...f.medicamentos]; m[i]={...m[i],dosis:e.target.value}; return {...f,medicamentos:m}; })}/>
                          <input className="h-8 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none" placeholder="Frecuencia (ej: cada 8h)" value={med.frecuencia} onChange={e => setRecetaForm(f => { const m=[...f.medicamentos]; m[i]={...m[i],frecuencia:e.target.value}; return {...f,medicamentos:m}; })}/>
                          <input className="h-8 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none" placeholder="Duración (ej: 7 días)" value={med.duracion} onChange={e => setRecetaForm(f => { const m=[...f.medicamentos]; m[i]={...m[i],duracion:e.target.value}; return {...f,medicamentos:m}; })}/>
                        </div>
                        <div className="flex gap-2">
                          <input className="flex-1 h-8 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none" placeholder="Instrucciones adicionales" value={med.instrucciones} onChange={e => setRecetaForm(f => { const m=[...f.medicamentos]; m[i]={...m[i],instrucciones:e.target.value}; return {...f,medicamentos:m}; })}/>
                          {recetaForm.medicamentos.length > 1 && (
                            <button className="text-red-400 hover:text-red-600" onClick={() => setRecetaForm(f => ({...f, medicamentos: f.medicamentos.filter((_,j)=>j!==i)}))}>
                              <X className="w-4 h-4"/>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setRecetaForm(f => ({...f, medicamentos: [...f.medicamentos, {nombre:"",dosis:"",frecuencia:"",duracion:"",instrucciones:""}]}))}>
                      <Plus className="w-3 h-3"/> Agregar medicamento
                    </Button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notas</label>
                    <textarea className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none" rows={2} placeholder="Indicaciones adicionales..." value={recetaForm.notas} onChange={e => setRecetaForm(f => ({...f, notas: e.target.value}))}/>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowRecetaForm(false)}>Cancelar</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" onClick={createReceta} disabled={savingReceta || !recetaForm.paciente_id}>
                      {savingReceta ? "Guardando..." : <><QrCode className="w-3.5 h-3.5"/> Crear Receta con QR</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {recetas.length === 0 && !showRecetaForm ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p>No has creado recetas digitales aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recetas.map(r => (
                  <Card key={r.id} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + "/receta/" + r.qr_code)}`}
                          alt="QR" className="w-16 h-16 rounded-lg border border-gray-100 flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900">{r.paciente_nombre}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.estado==="activa"?"bg-green-100 text-green-700":r.estado==="usada"?"bg-gray-100 text-gray-600":"bg-red-100 text-red-700"}`}>{r.estado}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{new Date(r.fecha).toLocaleDateString("es-GT")}</p>
                          <div className="flex flex-wrap gap-1">
                            {(r.medicamentos||[]).slice(0,3).map((m,i) => (
                              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{m.nombre} {m.dosis}</span>
                            ))}
                            {(r.medicamentos||[]).length > 3 && <span className="text-xs text-gray-400">+{r.medicamentos.length-3} más</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "opiniones" && (
          <div className="space-y-4">
            {opiniones.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p className="font-medium">Aún no tienes reseñas</p>
                <p className="text-sm mt-1">Cuando tus pacientes te califiquen aparecerán aquí</p>
              </div>
            ) : (
              <>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
                      <div className="flex items-center gap-0.5 mt-1 justify-center">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s<=parseFloat(avgRating)?"text-yellow-400 fill-yellow-400":"text-gray-300"}`}/>)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{opiniones.length} reseñas</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map(n => {
                        const count = opiniones.filter(o=>o.rating===n).length;
                        const pct = opiniones.length>0?(count/opiniones.length)*100:0;
                        return (
                          <div key={n} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-2">{n}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-yellow-400 h-2 rounded-full" style={{width:`${pct}%`}}/>
                            </div>
                            <span className="text-xs text-gray-500 w-4">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-3">
                  {opiniones.map(o => (
                    <Card key={o.id} className="border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s<=o.rating?"text-yellow-400 fill-yellow-400":"text-gray-300"}`}/>)}
                          <span className="text-xs text-gray-400 ml-2">{new Date(o.created_at).toLocaleDateString("es-GT")}</span>
                        </div>
                        {o.comentario && <p className="text-sm text-gray-700">"{o.comentario}"</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "perfil" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600"/>Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Especialidad</Label>
                    <select value={perfil.especialidad} onChange={e=>setPerfil(p=>({...p,especialidad:e.target.value}))}
                      className="w-full mt-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-blue-400">
                      <option value="">Seleccionar...</option>
                      {ESPECIALIDADES.map(e=><option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div><Label className="text-sm font-semibold">No. Colegiado</Label><Input value={perfil.numero_colegiado} onChange={e=>setPerfil(p=>({...p,numero_colegiado:e.target.value}))} placeholder="12345" className="mt-1 h-10 rounded-xl"/></div>
                  <div><Label className="text-sm font-semibold">Clínica / Hospital</Label><Input value={perfil.clinica} onChange={e=>setPerfil(p=>({...p,clinica:e.target.value}))} placeholder="Hospital General" className="mt-1 h-10 rounded-xl"/></div>
                  <div><Label className="text-sm font-semibold">Teléfono</Label><Input value={perfil.telefono} onChange={e=>setPerfil(p=>({...p,telefono:e.target.value}))} placeholder="2222-3333" className="mt-1 h-10 rounded-xl"/></div>
                  <div><Label className="text-sm font-semibold">Precio consulta (Q)</Label><Input type="number" value={perfil.precio_consulta} onChange={e=>setPerfil(p=>({...p,precio_consulta:e.target.value}))} placeholder="350" className="mt-1 h-10 rounded-xl"/></div>
                  <div><Label className="text-sm font-semibold">Dirección</Label><Input value={perfil.direccion} onChange={e=>setPerfil(p=>({...p,direccion:e.target.value}))} placeholder="Zona 10, Guatemala" className="mt-1 h-10 rounded-xl"/></div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Biografía / Presentación</Label>
                  <Textarea value={perfil.bio} onChange={e=>setPerfil(p=>({...p,bio:e.target.value}))} placeholder="Cuéntale a tus pacientes sobre ti..." className="mt-1 rounded-xl" rows={3}/>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600"/>Horario de Atención</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Días de atención</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIAS.map(dia => (
                      <button key={dia} type="button"
                        onClick={() => setPerfil(p=>({...p,dias_atencion:p.dias_atencion.includes(dia)?p.dias_atencion.filter(d=>d!==dia):[...p.dias_atencion,dia]}))}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${perfil.dias_atencion.includes(dia)?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-sm font-semibold">Hora inicio</Label><Input type="time" value={perfil.hora_inicio} onChange={e=>setPerfil(p=>({...p,hora_inicio:e.target.value}))} className="mt-1 h-10 rounded-xl"/></div>
                  <div><Label className="text-sm font-semibold">Hora fin</Label><Input type="time" value={perfil.hora_fin} onChange={e=>setPerfil(p=>({...p,hora_fin:e.target.value}))} className="mt-1 h-10 rounded-xl"/></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600"/>Ubicación GPS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {perfil.latitud && perfil.longitud ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                    <CheckCircle className="w-4 h-4"/>Ubicación guardada: {perfil.latitud.toFixed(4)}, {perfil.longitud.toFixed(4)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-4 py-3 rounded-xl">
                    <AlertCircle className="w-4 h-4"/>Sin ubicación — aparecerás en el mapa cuando la captures
                  </div>
                )}
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl" onClick={getUbicacion}>
                  <MapPin className="w-4 h-4 mr-2"/>Capturar mi ubicación actual
                </Button>
              </CardContent>
            </Card>

            <Button onClick={savePerfil} disabled={saving} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-base">
              {saving ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
