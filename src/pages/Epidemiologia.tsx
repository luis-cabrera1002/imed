import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, AlertTriangle, CheckCircle, BarChart3, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Departamento {
  id: string;
  departamento: string;
  lat: number;
  lng: number;
  casos_semana: number;
  nivel: "bajo" | "moderado" | "alto";
  top_enfermedad: string;
  poblacion: number;
  updated_at: string;
}

interface TopEnfermedad {
  nombre: string;
  total: number;
  porcentaje: number;
}

const nivelConfig = {
  bajo:     { color: "#22c55e", fillColor: "#22c55e", label: "Bajo",     icon: CheckCircle,     bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200" },
  moderado: { color: "#f59e0b", fillColor: "#f59e0b", label: "Moderado", icon: AlertTriangle,   bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200" },
  alto:     { color: "#ef4444", fillColor: "#ef4444", label: "Alto",     icon: AlertTriangle,   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
};

export default function Epidemiologia() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [topEnfermedades, setTopEnfermedades] = useState<TopEnfermedad[]>([]);
  const [selectedDep, setSelectedDep] = useState<Departamento | null>(null);

  useEffect(() => {
    loadData();
    // Actualizar cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from("epidemiologia_departamentos")
      .select("*")
      .order("casos_semana", { ascending: false });

    if (data) {
      setDepartamentos(data as Departamento[]);
      setLastUpdate(new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }));
      calcularTopEnfermedades(data as Departamento[]);
    }
    setLoading(false);
  }

  function calcularTopEnfermedades(deps: Departamento[]) {
    const conteo: Record<string, number> = {};
    for (const d of deps) {
      if (d.top_enfermedad) {
        conteo[d.top_enfermedad] = (conteo[d.top_enfermedad] ?? 0) + d.casos_semana;
      }
    }
    const total = Object.values(conteo).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nombre, t]) => ({ nombre, total: t, porcentaje: Math.round((t / total) * 100) }));
    setTopEnfermedades(sorted);
  }

  const totalCasos = departamentos.reduce((s, d) => s + d.casos_semana, 0);
  const altoCount = departamentos.filter(d => d.nivel === "alto").length;
  const moderadoCount = departamentos.filter(d => d.nivel === "moderado").length;
  const bajoCount = departamentos.filter(d => d.nivel === "bajo").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Epidemiología</h1>
              <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                DATOS EN VIVO
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Vigilancia epidemiológica por departamento — Guatemala {new Date().getFullYear()}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar · {lastUpdate || "—"}
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Casos esta semana", value: totalCasos.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Nivel alto", value: altoCount, color: "text-red-600", bg: "bg-red-50" },
            { label: "Nivel moderado", value: moderadoCount, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Nivel bajo", value: bajoCount, color: "text-green-600", bg: "bg-green-50" },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <p className="text-xs text-gray-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mapa */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Mapa por Departamento</h2>
            </div>
            <div style={{ height: 450 }}>
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <MapContainer
                  center={[15.3, -90.3]}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {departamentos.map(dep => {
                    const cfg = nivelConfig[dep.nivel];
                    const radius = Math.max(12, Math.min(35, dep.casos_semana / 8));
                    return (
                      <CircleMarker
                        key={dep.id}
                        center={[dep.lat, dep.lng]}
                        radius={radius}
                        pathOptions={{
                          color: cfg.color,
                          fillColor: cfg.fillColor,
                          fillOpacity: 0.65,
                          weight: 2,
                        }}
                        eventHandlers={{ click: () => setSelectedDep(dep) }}
                      >
                        <Tooltip direction="top" offset={[0, -radius]}>
                          <div className="text-xs">
                            <strong>{dep.departamento}</strong><br />
                            {dep.casos_semana} casos · {cfg.label}<br />
                            {dep.top_enfermedad}
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              )}
            </div>

            {/* Leyenda */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-6">
              {Object.entries(nivelConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="text-xs text-gray-500">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho */}
          <div className="flex flex-col gap-6">

            {/* Departamento seleccionado */}
            {selectedDep && (
              <div className={`rounded-2xl p-4 border ${nivelConfig[selectedDep.nivel].bg} ${nivelConfig[selectedDep.nivel].border} shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${nivelConfig[selectedDep.nivel].text}`}>{selectedDep.departamento}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${nivelConfig[selectedDep.nivel].bg} ${nivelConfig[selectedDep.nivel].text} border ${nivelConfig[selectedDep.nivel].border}`}>
                    {nivelConfig[selectedDep.nivel].label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Casos esta semana</p>
                    <p className="font-bold text-gray-900">{selectedDep.casos_semana}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Población</p>
                    <p className="font-bold text-gray-900">{selectedDep.poblacion?.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Enfermedad principal</p>
                    <p className="font-bold text-gray-900">{selectedDep.top_enfermedad}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top 10 enfermedades */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900 text-sm">Top 10 esta semana</h2>
              </div>
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : topEnfermedades.map((e, i) => (
                  <div key={e.nombre}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-xs font-medium text-gray-800">{e.nombre}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">{e.total} casos</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${e.porcentaje}%`,
                          backgroundColor: i === 0 ? "#ef4444" : i < 3 ? "#f59e0b" : "#3b82f6",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Datos orientativos</strong> — basados en diagnósticos de notas clínicas iMed, anonimizados y agregados. No reemplazan la vigilancia epidemiológica oficial del MSPAS Guatemala.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
