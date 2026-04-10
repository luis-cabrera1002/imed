import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { Link } from "react-router-dom";
import { Brain, Activity, Cpu, Zap, Shield, Globe, ChevronRight, Stethoscope, Scan, FileText, MessageCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Datos de actividad por departamento (demo)
const DEPT_ACTIVIDAD = [
  { departamento: "Guatemala",      lat: 14.6349, lng: -90.5069, actividad: 95, color: "#06b6d4" },
  { departamento: "Quetzaltenango", lat: 14.8333, lng: -91.5167, actividad: 72, color: "#3b82f6" },
  { departamento: "Escuintla",      lat: 14.3062, lng: -90.7862, actividad: 58, color: "#8b5cf6" },
  { departamento: "Alta Verapaz",   lat: 15.4667, lng: -90.3667, actividad: 45, color: "#06b6d4" },
  { departamento: "Huehuetenango",  lat: 15.3197, lng: -91.4714, actividad: 40, color: "#3b82f6" },
  { departamento: "San Marcos",     lat: 14.9667, lng: -91.7833, actividad: 35, color: "#8b5cf6" },
  { departamento: "Sacatepéquez",   lat: 14.5597, lng: -90.7347, actividad: 62, color: "#06b6d4" },
  { departamento: "Chimaltenango",  lat: 14.6617, lng: -90.8194, actividad: 48, color: "#3b82f6" },
  { departamento: "Izabal",         lat: 15.7333, lng: -88.9167, actividad: 30, color: "#8b5cf6" },
  { departamento: "Petén",          lat: 16.9167, lng: -89.8833, actividad: 22, color: "#06b6d4" },
];

// Timeline de detecciones recientes (generadas dinámicamente)
const DETECCIONES_BASE = [
  { zona: "Zona 10",          tipo: "Diagnóstico",    detalle: "Hipertensión arterial",        mins: 2 },
  { zona: "Quetzaltenango",   tipo: "Síntoma",        detalle: "Infección respiratoria alta",   mins: 4 },
  { zona: "Zona 15",          tipo: "Medicamento",    detalle: "Salbutamol identificado",       mins: 7 },
  { zona: "Zona 1",           tipo: "Documento",      detalle: "Radiografía procesada",         mins: 9 },
  { zona: "Mixco",            tipo: "Diagnóstico",    detalle: "Diabetes Tipo 2",               mins: 12 },
  { zona: "Villa Nueva",      tipo: "Síntoma",        detalle: "Dengue clásico sospechado",     mins: 15 },
  { zona: "Escuintla",        tipo: "Medicamento",    detalle: "Metformina identificada",       mins: 18 },
  { zona: "Zona 4",           tipo: "Diagnóstico",    detalle: "Ansiedad generalizada",         mins: 21 },
  { zona: "Alta Verapaz",     tipo: "Documento",      detalle: "Análisis de sangre procesado",  mins: 24 },
  { zona: "Petén",            tipo: "Síntoma",        detalle: "Malaria sospechada",             mins: 28 },
];

const TIPO_COLORS: Record<string, string> = {
  "Diagnóstico": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Síntoma":     "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Medicamento": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Documento":   "bg-green-500/20 text-green-300 border-green-500/30",
};

// Hook para animar números
function useCountUp(target: number, duration = 2000, active = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return value;
}

function AnimatedCounter({ value, label, sublabel, icon: Icon, color }: {
  value: number; label: string; sublabel: string; icon: React.ElementType; color: string;
}) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayed = useCountUp(value, 2500, active);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-4xl font-black text-white tabular-nums">{displayed.toLocaleString()}</p>
      <p className="text-sm font-semibold text-slate-300 mt-1">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
    </div>
  );
}

export default function ImedBrain() {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Delay map to ensure DOM is ready
    const t = setTimeout(() => setMapReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white">

      {/* ── Nav minimal ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080d1a]/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-lg">iMed <span className="text-cyan-400">Brain</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">Volver a iMed</Link>
          <a
            href="mailto:luisan.cabrera@gmail.com?subject=Inversión en iMed Guatemala"
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-[#080d1a] font-bold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            Contactar <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-sm text-cyan-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            Sistema activo · Procesando en tiempo real
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            iMed{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Brain
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            La Inteligencia de Salud de Guatemala
          </p>
          <p className="text-base text-slate-500 max-w-xl mx-auto mb-10">
            El primer sistema de IA médica nativo de Guatemala. Aprende de cada consulta, predice riesgos, y eleva el estándar de salud del país.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/mi-salud-ia"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
            >
              <Brain className="w-5 h-5" />
              Analizar mi salud
            </Link>
            <a
              href="mailto:luisan.cabrera@gmail.com?subject=Demo iMed Brain"
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-7 py-3.5 rounded-2xl transition-colors"
            >
              ¿Querés ser parte de esto? →
            </a>
          </div>
        </div>
      </section>

      {/* ── Métricas animadas ── */}
      <section className="py-20 px-4 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">Actividad en tiempo real</p>
            <h2 className="text-3xl font-bold text-white">Procesando la salud de Guatemala</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter value={1847}  label="Diagnósticos IA"       sublabel="Esta semana"      icon={Stethoscope}    color="bg-blue-600"    />
            <AnimatedCounter value={3129}  label="Medicamentos ID"       sublabel="Con escáner"      icon={Scan}           color="bg-cyan-600"    />
            <AnimatedCounter value={4206}  label="Síntomas analizados"   sublabel="Acumulado"        icon={Activity}       color="bg-purple-600"  />
            <AnimatedCounter value={892}   label="Documentos procesados" sublabel="Radiografías, labs" icon={FileText}     color="bg-green-600"   />
          </div>
        </div>
      </section>

      {/* ── Mapa de calor + Timeline ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">Cobertura nacional</p>
            <h2 className="text-3xl font-bold text-white">Actividad por Departamento</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Mapa */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: 420 }}>
              {mapReady && (
                <MapContainer
                  center={[15.3, -90.3]}
                  zoom={7}
                  style={{ height: "100%", width: "100%", background: "#0f172a" }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                  />
                  {DEPT_ACTIVIDAD.map(d => (
                    <CircleMarker
                      key={d.departamento}
                      center={[d.lat, d.lng]}
                      radius={Math.max(8, d.actividad / 5)}
                      pathOptions={{
                        color: d.color,
                        fillColor: d.color,
                        fillOpacity: 0.5,
                        weight: 1,
                      }}
                    >
                      <Tooltip direction="top">
                        <span className="text-xs font-semibold">{d.departamento} · {d.actividad} eventos</span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Últimas detecciones</p>
              </div>
              <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 360 }}>
                {DETECCIONES_BASE.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 mt-2 flex-shrink-0 group-hover:w-2 transition-all" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${TIPO_COLORS[d.tipo]}`}>{d.tipo}</span>
                        <span className="text-xs text-slate-500">{d.zona}</span>
                      </div>
                      <p className="text-sm text-slate-300 truncate">{d.detalle}</p>
                      <p className="text-xs text-slate-600">hace {d.mins} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">Arquitectura</p>
          <h2 className="text-3xl font-bold text-white mb-12">Cómo funciona iMed Brain</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                paso: "01",
                titulo: "Captura de datos médicos",
                desc: "Cada consulta, síntoma, medicamento e imagen procesada genera datos anónimos y estructurados en tiempo real.",
                icon: Activity,
                color: "from-blue-600 to-blue-700",
              },
              {
                paso: "02",
                titulo: "Procesamiento con IA",
                desc: "Modelos LLM especializados (Groq + Llama) analizan patrones, detectan riesgos y generan recomendaciones personalizadas.",
                icon: Cpu,
                color: "from-cyan-600 to-cyan-700",
              },
              {
                paso: "03",
                titulo: "Inteligencia colectiva",
                desc: "Los patrones agregados mejoran el sistema para todos: epidemiología, detección temprana y salud preventiva para Guatemala.",
                icon: Globe,
                color: "from-purple-600 to-purple-700",
              },
            ].map(p => (
              <div key={p.paso} className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-left hover:border-white/20 transition-colors">
                <span className="absolute top-4 right-4 text-xs font-black text-white/10 text-4xl">{p.paso}</span>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{p.titulo}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capacidades ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Capacidades del Sistema</h2>
            <p className="text-slate-400">Tecnología de clase mundial adaptada para el contexto guatemalteco</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Brain,       titulo: "Predicción de riesgo",    desc: "Diabetes, HTA, cardiovascular basado en perfil completo",  badge: "Nuevo" },
              { icon: Stethoscope, titulo: "Análisis de síntomas",    desc: "Triage IA con urgencia y especialidad recomendada",         badge: null },
              { icon: Scan,        titulo: "Reconocimiento visual",   desc: "Identifica medicamentos, analiza radiografías y laboratorios", badge: null },
              { icon: Zap,         titulo: "Transcripción médica",    desc: "Whisper convierte audio de consulta a nota clínica estructurada", badge: null },
              { icon: Shield,      titulo: "Detección de interacciones", desc: "Verifica combinaciones medicamentosas peligrosas",       badge: null },
              { icon: MessageCircle, titulo: "Alertas proactivas",   desc: "Notificaciones personalizadas según perfil y temporada epidémica", badge: "Nuevo" },
            ].map(c => (
              <div key={c.titulo} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <c.icon className="w-4.5 h-4.5 text-blue-400" />
                  </div>
                  {c.badge && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">{c.badge}</span>
                  )}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{c.titulo}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Inversores ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-900/60 to-cyan-900/30 border border-cyan-500/20 rounded-3xl p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/5" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-blue-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">
                ¿Querés ser parte de<br />
                <span className="text-cyan-400">iMed Brain?</span>
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Guatemala necesita más tecnología de salud. Si sos inversor, partner estratégico o querés conocer más sobre nuestra visión, hablemos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:luisan.cabrera@gmail.com?subject=Inversión en iMed Guatemala - iMed Brain"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform"
                >
                  <Zap className="w-4 h-4" />
                  Contactar al equipo
                </a>
                <Link
                  to="/investors"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/15 hover:bg-white/10 text-white font-medium px-7 py-3.5 rounded-2xl transition-colors"
                >
                  Ver métricas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer minimal ── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span>© 2026 iMed Guatemala · iMed Brain™</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terminos" className="hover:text-slate-400 transition-colors">Términos</Link>
            <Link to="/privacidad" className="hover:text-slate-400 transition-colors">Privacidad</Link>
            <Link to="/" className="hover:text-slate-400 transition-colors">App iMed</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
