import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import EmergencyButton from "@/components/EmergencyButton";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  Calendar, Clock, Stethoscope, FileText, MapPin,
  Search, User, Activity, LogOut, Star, Shield, Bell, Scan,
  ChevronRight, Eye, TrendingUp, Heart, Upload, Trash2, Download, FolderOpen, Pill, Brain, Sparkles, AlertCircle, RefreshCw, Globe, Sparkles, AlertCircle, RefreshCw
} from "lucide-react";

const ESTADO: Record<string, { label: string; color: string; dot: string }> = {
  pendiente:  { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  confirmada: { label: "Confirmada", color: "bg-blue-100 text-blue-700 border-blue-200",        dot: "bg-blue-400"   },
  completada: { label: "Completada", color: "bg-green-100 text-green-700 border-green-200",      dot: "bg-green-500"  },
  cancelada:  { label: "Cancelada",  color: "bg-red-100 text-red-700 border-red-200",            dot: "bg-red-400"    },
};

const TABS = ["Inicio", "Mis Citas", "Mis Recetas", "Mis Escaneos", "Mis Documentos", "Mi Perfil"] as const;
type Tab = typeof TABS[number];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Inicio");
  const [perfil, setPerfil]   = useState<any>(null);
  const [citas, setCitas]     = useState<any[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { supported, isSubscribed, permission, loading: pushLoading, subscribe, unsubscribe } = usePushNotifications();
  const [escaneos, setEscaneos]       = useState<any[]>([]);
  const [documentos, setDocumentos]   = useState<any[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [analizando, setAnalizando]   = useState<string | null>(null);
  const [analisisIA, setAnalisisIA]   = useState<Record<string, any>>({});
  const [docLoading, setDocLoading]   = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadData(user.id);
  }, [user]);

  async function loadData(uid: string) {
    setLoading(true);
    await Promise.all([loadPerfil(uid), loadCitas(uid), loadRecetas(uid), loadEscaneos(uid), loadDocumentos(uid)]);
    setLoading(false);
  }

  async function loadEscaneos(uid: string) {
    const { data } = await supabase
      .from("medicine_scans")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setEscaneos(data);
  }

  async function loadDocumentos(uid: string) {
    setDocLoading(true);
    const { data } = await supabase
      .from("documentos_medicos")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (data) setDocumentos(data);
    setDocLoading(false);
  }

  async function subirDocumento(file: File, tipo: string, descripcion: string) {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("documentos-medicos")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("documentos-medicos")
        .getPublicUrl(path);

      const { error: dbErr } = await supabase.from("documentos_medicos").insert({
        user_id: user.id,
        nombre: file.name,
        tipo,
        url: urlData.publicUrl,
        storage_path: path,
        descripcion,
      });
      if (dbErr) throw dbErr;
      await loadDocumentos(user.id);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  }

  async function eliminarDocumento(doc: any) {
    await supabase.storage.from("documentos-medicos").remove([doc.storage_path]);
    await supabase.from("documentos_medicos").delete().eq("id", doc.id);
    setDocumentos(prev => prev.filter(d => d.id !== doc.id));
  }

  async function analizarDocumento(doc: any) {
    setAnalizando(doc.id);
    try {
      console.log("Analizando URL:", doc.url);
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { imageUrl: doc.url, tipo: doc.tipo },
        headers: { Authorization: "Bearer " + session?.access_token }
      });
      console.log("Resultado:", data, "Error:", error);
      if (error) throw error;
      setAnalisisIA(prev => ({ ...prev, [doc.id]: data }));
    } catch (err) {
      console.error("Error analizando:", err);
      setAnalisisIA(prev => ({ ...prev, [doc.id]: { error: true } }));
    }
    setAnalizando(null);
  }

  async function loadPerfil(uid: string) {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).single();
    if (data) setPerfil(data);
  }

  async function loadCitas(uid: string) {
    const { data } = await supabase
      .from("citas").select("*").eq("paciente_id", uid).order("fecha", { ascending: false });
    if (!data || data.length === 0) { setCitas([]); return; }
    const doctorIds = [...new Set(data.map((c: any) => c.doctor_id))];
    const { data: profiles }  = await supabase.from("profiles").select("user_id, full_name").in("user_id", doctorIds);
    const { data: dProfiles } = await supabase.from("doctor_profiles").select("user_id, especialidad, clinica").in("user_id", doctorIds);
    setCitas(data.map((c: any) => ({
      ...c,
      doctor_nombre: (profiles  as any[])?.find(p => p.user_id === c.doctor_id)?.full_name    || "Doctor",
      especialidad:  (dProfiles as any[])?.find(p => p.user_id === c.doctor_id)?.especialidad || "",
      clinica:       (dProfiles as any[])?.find(p => p.user_id === c.doctor_id)?.clinica      || "",
    })));
  }

  async function loadRecetas(uid: string) {
    const { data } = await supabase
      .from("recetas").select("*, receta_medicamentos(*)")
      .eq("paciente_id", uid).order("created_at", { ascending: false });
    if (!data || data.length === 0) { setRecetas([]); return; }
    const doctorIds = [...new Set(data.map((r: any) => r.doctor_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", doctorIds);
    setRecetas(data.map((r: any) => ({
      ...r,
      doctor_nombre: (profiles as any[])?.find(p => p.user_id === r.doctor_id)?.full_name || "Doctor",
      medicamentos:  r.receta_medicamentos || [],
    })));
  }

  const today          = new Date().toISOString().split("T")[0];
  const citasProximas  = citas.filter(c => c.fecha >= today && c.estado !== "cancelada");
  const citasHoy       = citas.filter(c => c.fecha === today && c.estado !== "cancelada");
  const citasPasadas   = citas.filter(c => c.fecha < today   || c.estado === "completada");
  const citasPendientes = citas.filter(c => c.estado === "pendiente");
  const nombre = perfil?.full_name?.split(" ")[0] || "Paciente";

  const fmtFecha = (f: string) => {
    if (!f) return "";
    return new Date(f + "T12:00:00").toLocaleDateString("es-GT", { weekday: "short", month: "short", day: "numeric" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top Bar ── */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-tight">{perfil?.full_name || nombre}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {supported && (
            <Button
              variant={isSubscribed ? "default" : "outline"}
              size="sm"
              className={`gap-2 text-sm rounded-lg ${isSubscribed ? "bg-primary text-white" : ""}`}
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{isSubscribed ? "Notif. ON" : "Activar Notif."}</span>
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2 text-sm rounded-lg" onClick={() => navigate("/")}>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Ver App</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-sm text-muted-foreground hover:text-destructive rounded-lg" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}>
                {tab}
                {tab === "Mis Citas" && citasPendientes.length > 0 && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {citasPendientes.length}
                  </span>
                )}
                {tab === "Mis Recetas" && recetas.filter(r => r.estado !== "surtida").length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                    {recetas.filter(r => r.estado !== "surtida").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ══════════ INICIO ══════════ */}
        {activeTab === "Inicio" && (
          <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Citas hoy",   val: citasHoy.length,       sub: "Hoy",         icon: Calendar,    bg: "bg-blue-50",    ic: "text-blue-500" },
                { label: "Pendientes",  val: citasPendientes.length, sub: "Pendientes",  icon: Clock,       bg: "bg-yellow-50",  ic: "text-yellow-500" },
                { label: "Próximas",    val: citasProximas.length,   sub: "Este mes",    icon: TrendingUp,  bg: "bg-primary/5",  ic: "text-primary" },
                { label: "Recetas",     val: recetas.length,         sub: "Activas",     icon: FileText,    bg: "bg-green-50",   ic: "text-green-500" },
              ].map(({ label, val, sub, icon: Icon, bg, ic }) => (
                <Card key={label} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-default">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${ic}`} />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{val}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Próxima cita + Accesos rápidos */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Próxima cita */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />Próxima Cita
                    </CardTitle>
                    <button className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
                      onClick={() => setActiveTab("Mis Citas")}>
                      Ver todas <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {citasProximas.length > 0 ? (() => {
                    const c = citasProximas[0];
                    const cfg = ESTADO[c.estado] || ESTADO.pendiente;
                    return (
                      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{c.doctor_nombre}</p>
                              <p className="text-xs text-primary font-medium">{c.especialidad}</p>
                            </div>
                          </div>
                          <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-background rounded-lg px-3 py-2 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium">{fmtFecha(c.fecha)}</span>
                          </div>
                          <div className="bg-background rounded-lg px-3 py-2 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium">{c.hora}</span>
                          </div>
                        </div>
                        {c.clinica && (
                          <div className="bg-background rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{c.clinica}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"
                            className="flex-1 text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                            onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent((c.clinica || "") + " Guatemala")}`, "_blank")}>
                            <MapPin className="w-3 h-3 mr-1" />Mapa
                          </Button>
                          <Button size="sm"
                            className="flex-1 text-xs rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                            onClick={() => setActiveTab("Mis Citas")}>
                            Ver detalle
                          </Button>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Stethoscope className="w-7 h-7 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground mb-1">Sin citas próximas</p>
                      <p className="text-xs text-muted-foreground mb-4">Agendá con un especialista</p>
                      <Button size="sm"
                        className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-xs"
                        onClick={() => navigate("/doctores")}>
                        Buscar Doctor
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accesos rápidos */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-secondary" />Accesos Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Buscar Doctor",  sub: "659+ disponibles",  icon: Search,    grad: "from-primary to-secondary",      path: "/doctores"     },
                      { label: "Ver Mapa",       sub: "Cerca de ti",        icon: MapPin,    grad: "from-blue-500 to-blue-600",       path: "/mapa-doctores"},
                      { label: "Agendar Cita",   sub: "Flujo rápido",       icon: Calendar,  grad: "from-purple-500 to-purple-600",   path: "/citas"        },
                      { label: "Red BAM",         sub: "Seguro médico",      icon: Shield,    grad: "from-green-500 to-emerald-500",   path: "/medicos-bam"  },
                      { label: "Escáner Med.",    sub: "Identificar med.",   icon: Scan,      grad: "from-orange-500 to-red-500",       path: "/escaner-medicamentos" },
                      { label: "Modo Viajero",    sub: "Med. en el mundo",   icon: Globe,     grad: "from-blue-500 to-indigo-600",      path: "/modo-viajero" },
                      { label: "Recordatorios",   sub: "Tomar a tiempo",     icon: Bell,      grad: "from-green-500 to-teal-500",       path: "/recordatorio-medicamentos" },
                    ].map(({ label, sub, icon: Icon, grad, path }) => (
                      <button key={label} onClick={() => navigate(path)}
                        className="group flex flex-col items-start p-3 bg-background hover:bg-muted/40 rounded-xl border border-border/50 hover:border-primary/20 transition-all text-left">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-semibold text-foreground text-xs leading-tight">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historial */}
            {citasPasadas.length > 0 && (
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-500" />Historial Reciente
                    </CardTitle>
                    <button className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
                      onClick={() => setActiveTab("Mis Citas")}>
                      Ver todo <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {citasPasadas.slice(0, 4).map((c: any) => {
                      const cfg = ESTADO[c.estado] || ESTADO.completada;
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{c.doctor_nombre}</p>
                            <p className="text-xs text-muted-foreground">{fmtFecha(c.fecha)} · {c.especialidad}</p>
                          </div>
                          <Badge className={`text-xs border flex-shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ══════════ MIS CITAS ══════════ */}
        {activeTab === "Mis Citas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Mis Citas <span className="text-muted-foreground font-normal text-base">({citas.length})</span></h2>
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-xs gap-1.5"
                onClick={() => navigate("/citas")}>
                <Calendar className="w-3.5 h-3.5" />Nueva Cita
              </Button>
            </div>

            {citas.length === 0 ? (
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="py-16 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">No tenés citas todavía</p>
                  <p className="text-sm text-muted-foreground mb-4">Agendá tu primera cita con un especialista</p>
                  <Button className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg"
                    onClick={() => navigate("/doctores")}>Buscar Doctor</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {citas.map((c: any) => {
                  const cfg = ESTADO[c.estado] || ESTADO.pendiente;
                  const esProxima = c.fecha >= today && c.estado !== "cancelada";
                  return (
                    <Card key={c.id} className={`border shadow-sm hover:shadow-md transition-shadow ${esProxima ? "border-primary/20" : "border-border/50"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${esProxima ? "bg-gradient-to-br from-primary to-secondary" : "bg-muted"}`}>
                            <Stethoscope className={`w-5 h-5 ${esProxima ? "text-white" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-semibold text-foreground">{c.doctor_nombre}</p>
                                <p className="text-xs text-primary font-medium">{c.especialidad}</p>
                              </div>
                              <Badge className={`text-xs border flex-shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />{fmtFecha(c.fecha)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />{c.hora}
                              </span>
                              {c.clinica && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />{c.clinica}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {esProxima && c.clinica && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <Button size="sm" variant="outline" className="text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(c.clinica + " Guatemala")}`, "_blank")}>
                              <MapPin className="w-3 h-3 mr-1" />Ver en Mapa
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ MIS RECETAS ══════════ */}
        {activeTab === "Mis Recetas" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Mis Recetas <span className="text-muted-foreground font-normal text-base">({recetas.length})</span></h2>

            {recetas.length === 0 ? (
              <Card className="border border-border/50 shadow-sm">
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">No tenés recetas todavía</p>
                  <p className="text-sm text-muted-foreground">Tus recetas médicas aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recetas.map((r: any) => (
                  <Card key={r.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">{r.doctor_nombre}</p>
                              {r.diagnostico && <p className="text-xs text-muted-foreground mt-0.5">{r.diagnostico}</p>}
                            </div>
                            <Badge className={`text-xs border flex-shrink-0 ${r.estado === "surtida" ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
                              {r.estado === "surtida" ? "Surtida" : "Pendiente"}
                            </Badge>
                          </div>
                          {r.medicamentos.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {r.medicamentos.slice(0, 3).map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                  <span className="truncate">{m.nombre || m.medicamento}{m.dosis ? ` · ${m.dosis}` : ""}</span>
                                </div>
                              ))}
                              {r.medicamentos.length > 3 && (
                                <p className="text-xs text-primary font-medium">+{r.medicamentos.length - 3} más</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════ MI PERFIL ══════════ */}
        {/* ══ MIS ESCANEOS ══ */}
        {activeTab === "Mis Escaneos" && (
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Mis Escaneos</h2>
              <span className="text-xs text-muted-foreground">{escaneos.length} escaneos</span>
            </div>
            {escaneos.length === 0 ? (
              <Card className="border border-border/50 shadow-sm rounded-2xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Sin escaneos aún</h3>
                  <p className="text-sm text-muted-foreground mb-4">Usá el escáner para identificar medicamentos</p>
                  <Button className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl"
                    onClick={() => navigate("/escaner-medicamentos")}>
                    <Scan className="w-4 h-4 mr-2" />Ir al Escáner
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {escaneos.map((s: any) => (
                  <Card key={s.id} className="border border-border/50 shadow-sm rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        s.medicamento === "Butosol" ? "bg-red-100" :
                        s.medicamento === "Salbutamol" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        {s.medicamento === "Butosol" ? "🔴" : s.medicamento === "Salbutamol" ? "🔵" : "💊"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground">{s.medicamento}</p>
                        <p className="text-xs text-muted-foreground">{s.confianza}% confianza · {s.pais}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(s.created_at).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs"
                        onClick={() => navigate("/escaner-medicamentos")}>
                        <Scan className="w-3 h-3 mr-1" />Ver
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MIS DOCUMENTOS ══ */}
        {activeTab === "Mis Documentos" && (
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground">Mis Documentos</h2>
              <span className="text-xs text-muted-foreground">{documentos.length} archivos</span>
            </div>

            {/* Upload Card */}
            <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-5 py-3">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />Subir Documento
                </h3>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { tipo: "receta", label: "📋 Receta Médica", color: "from-blue-500 to-indigo-500" },
                    { tipo: "laboratorio", label: "🧪 Laboratorio", color: "from-green-500 to-emerald-500" },
                    { tipo: "radiografia", label: "🩻 Radiografía", color: "from-purple-500 to-violet-500" },
                    { tipo: "otro", label: "📁 Otro", color: "from-gray-500 to-gray-600" },
                  ].map(({ tipo, label, color }) => (
                    <label key={tipo} className={`cursor-pointer flex items-center justify-center gap-2 p-3 bg-gradient-to-r ${color} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                      <input type="file" accept=".jpg,.jpeg,.png,.heic,.webp" className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) subirDocumento(f, tipo, tipo);
                          e.target.value = "";
                        }} />
                      {uploading ? "Subiendo..." : label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">JPG, PNG · Máx 10MB · Para análisis IA subí foto/captura del documento</p>
              </CardContent>
            </Card>

            {/* Lista documentos */}
            {docLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
            ) : documentos.length === 0 ? (
              <Card className="border border-border/50 shadow-sm rounded-2xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Sin documentos aún</h3>
                  <p className="text-sm text-muted-foreground">Subí tus recetas, resultados de laboratorio o radiografías</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {documentos.map((doc: any) => (
                  <Card key={doc.id} className="border border-border/50 shadow-sm rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                        {doc.tipo === "receta" ? "📋" : doc.tipo === "laboratorio" ? "🧪" : doc.tipo === "radiografia" ? "🩻" : "📁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{doc.nombre}</p>
                        <p className="text-xs text-muted-foreground capitalize">{doc.tipo} · {new Date(doc.created_at).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="rounded-lg p-2 h-8 w-8"
                          onClick={() => window.open(doc.url, "_blank")}>
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg p-2 h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-200"
                          onClick={() => eliminarDocumento(doc)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                    {/* Botón analizar con IA */}
                    <div className="px-4 pb-4">
                      {!analisisIA[doc.id] ? (
                        <Button
                          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl gap-2 text-sm"
                          disabled={analizando === doc.id}
                          onClick={() => analizarDocumento(doc)}
                        >
                          {analizando === doc.id ? (
                            <><Brain className="w-4 h-4 animate-pulse" />Analizando con IA...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" />Analizar con IA</>
                          )}
                        </Button>
                      ) : analisisIA[doc.id].error ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-xl">
                            <AlertCircle className="w-4 h-4" />No se pudo analizar.
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl gap-2 text-sm"
                            disabled={analizando === doc.id}
                            onClick={() => { setAnalisisIA(prev => { const n = {...prev}; delete n[doc.id]; return n; }); }}
                          >
                            <RefreshCw className="w-4 h-4" />Reintentar
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <p className="font-bold text-violet-900 text-sm">Análisis IA</p>
                            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">⚠️ Orientativo</span>
                          </div>
                          {analisisIA[doc.id].resumen && (
                            <p className="text-sm text-gray-700 leading-relaxed">{analisisIA[doc.id].resumen}</p>
                          )}
                          {analisisIA[doc.id].hallazgos?.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Hallazgos</p>
                              {analisisIA[doc.id].hallazgos.map((h: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                                  {h}
                                </div>
                              ))}
                            </div>
                          )}
                          {analisisIA[doc.id].alertas?.length > 0 && analisisIA[doc.id].alertas[0] && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-red-700 mb-1">🚨 Alerta</p>
                              {analisisIA[doc.id].alertas.map((a: string, i: number) => (
                                <p key={i} className="text-sm text-red-700">{a}</p>
                              ))}
                            </div>
                          )}
                          {analisisIA[doc.id].recomendacion && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                              <p className="text-xs font-bold text-green-700 mb-1">✅ Recomendación</p>
                              <p className="text-sm text-green-700">{analisisIA[doc.id].recomendacion}</p>
                            </div>
                          )}
                          {analisisIA[doc.id].requiere_medico && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <p className="text-sm text-blue-700 font-medium">Se recomienda consultar con un médico</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 text-center mt-2">Este análisis es orientativo y no reemplaza el diagnóstico médico profesional.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Mi Perfil" && (
          <div className="max-w-md space-y-4">
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{perfil?.full_name || nombre}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-xs border">🏥 Paciente</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Total de citas",    val: citas.length,        icon: Calendar, bg: "bg-blue-50",   ic: "text-blue-500"   },
                    { label: "Citas completadas", val: citasPasadas.length, icon: Star,     bg: "bg-green-50",  ic: "text-green-500"  },
                    { label: "Recetas activas",   val: recetas.length,      icon: FileText, bg: "bg-purple-50", ic: "text-purple-500" },
                  ].map(({ label, val, icon: Icon, bg, ic }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${ic}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
