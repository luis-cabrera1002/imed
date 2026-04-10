import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Star, Users, DollarSign, Calendar, Award, ArrowLeft, Loader2 } from "lucide-react";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function MisEstadisticas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("");
  const [precioCita, setPrecioCita] = useState(0);

  // Métricas
  const [citasPorMes, setCitasPorMes] = useState<{ mes: string; citas: number }[]>([]);
  const [topDiagnosticos, setTopDiagnosticos] = useState<{ nombre: string; value: number }[]>([]);
  const [ratingProm, setRatingProm] = useState(0);
  const [totalOpiniones, setTotalOpiniones] = useState(0);
  const [ingresosEstimados, setIngresosEstimados] = useState(0);
  const [pacientesUnicos, setPacientesUnicos] = useState(0);
  const [totalCitasMes, setTotalCitasMes] = useState(0);
  const [topDoctor, setTopDoctor] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "doctor") { navigate("/doctor-dashboard"); return; }
    setDoctorName(profile?.full_name ?? "Doctor");

    const { data: dp } = await supabase
      .from("doctor_profiles")
      .select("precio_consulta")
      .eq("user_id", user.id)
      .maybeSingle();
    const precio = dp?.precio_consulta ?? 0;
    setPrecioCita(precio);

    await Promise.all([
      loadCitasPorMes(user.id, precio),
      loadDiagnosticos(user.id),
      loadOpiniones(user.id),
    ]);
    setLoading(false);
  }

  async function loadCitasPorMes(uid: string, precio: number) {
    const now = new Date();
    const desde = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0];

    const { data } = await supabase
      .from("citas")
      .select("fecha, estado")
      .eq("doctor_id", uid)
      .gte("fecha", desde)
      .order("fecha", { ascending: true });

    // Agrupar por mes
    const mapa: Record<string, number> = {};
    const completadas: Record<string, number> = {};
    const pacIds = new Set<string>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      mapa[key] = 0;
      completadas[key] = 0;
    }

    (data ?? []).forEach((c: any) => {
      const key = c.fecha.substring(0, 7);
      if (key in mapa) {
        mapa[key]++;
        if (c.estado === "completada") completadas[key]++;
      }
    });

    const series = Object.entries(mapa).map(([key, total]) => {
      const [y, m] = key.split("-");
      return { mes: MESES[parseInt(m) - 1], citas: total };
    });
    setCitasPorMes(series);

    // Mes actual
    const mesKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const citasMesActual = mapa[mesKey] ?? 0;
    const completadasMes = completadas[mesKey] ?? 0;
    setTotalCitasMes(citasMesActual);
    setIngresosEstimados(completadasMes * precio);

    // Pacientes únicos (todos los meses)
    const { data: allCitas } = await supabase
      .from("citas")
      .select("paciente_id")
      .eq("doctor_id", uid);
    const uniquePac = new Set((allCitas ?? []).map((c: any) => c.paciente_id));
    setPacientesUnicos(uniquePac.size);
  }

  async function loadDiagnosticos(uid: string) {
    const { data } = await supabase
      .from("notas_clinicas")
      .select("diagnostico")
      .eq("doctor_id", uid)
      .not("diagnostico", "is", null);

    const conteo: Record<string, number> = {};
    (data ?? []).forEach((n: any) => {
      const diag = (n.diagnostico ?? "").trim().substring(0, 40);
      if (diag) conteo[diag] = (conteo[diag] ?? 0) + 1;
    });

    const sorted = Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, value]) => ({ nombre, value }));

    setTopDiagnosticos(sorted.length > 0 ? sorted : [
      { nombre: "Sin datos aún", value: 1 },
    ]);
  }

  async function loadOpiniones(uid: string) {
    const { data } = await supabase
      .from("opiniones")
      .select("rating")
      .eq("doctor_id", uid);

    const ops = data ?? [];
    setTotalOpiniones(ops.length);
    if (ops.length > 0) {
      const prom = ops.reduce((s: number, o: any) => s + (o.rating ?? 0), 0) / ops.length;
      setRatingProm(Math.round(prom * 10) / 10);
      setTopDoctor(prom >= 4.5);
    }
  }

  // Gauge de rating
  function RatingGauge({ value, max = 5 }: { value: number; max?: number }) {
    const pct = (value / max) * 100;
    const color = value >= 4.5 ? "#10b981" : value >= 3.5 ? "#f59e0b" : "#ef4444";
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-14 overflow-hidden">
          <svg viewBox="0 0 100 50" className="w-full">
            <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${125.66 * pct / 100} 125.66`}
            />
          </svg>
        </div>
        <div className="-mt-3 text-center">
          <p className="text-2xl font-bold" style={{ color }}>{value > 0 ? value : "—"}</p>
          <p className="text-xs text-gray-400">de 5 estrellas</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/doctor-dashboard")}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
            </button>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mis Estadísticas</h1>
              {topDoctor && (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  Top Doctor iMed ⭐
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">Dr. {doctorName}</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Citas este mes", value: totalCitasMes, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pacientes únicos", value: pacientesUnicos, icon: Users, color: "text-green-600", bg: "bg-green-50" },
            { label: "Ingresos est. (Q)", value: `Q${ingresosEstimados.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Opiniones", value: totalOpiniones, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <div className="flex items-center gap-2 mb-1">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <p className="text-xs text-gray-500">{k.label}</p>
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

          {/* Citas por mes — barra */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Citas por Mes</h2>
              <span className="text-xs text-gray-400 ml-auto">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={citasPorMes} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <RechartTooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v: number) => [`${v} citas`, ""]}
                />
                <Bar dataKey="citas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rating gauge */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-4 self-start">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-gray-900">Rating Promedio</h2>
            </div>
            <RatingGauge value={ratingProm} />
            <p className="text-sm text-gray-400 mt-4">{totalOpiniones} opinión{totalOpiniones !== 1 ? "es" : ""} verificada{totalOpiniones !== 1 ? "s" : ""}</p>
            {totalOpiniones === 0 && (
              <p className="text-xs text-gray-300 mt-1">Completa citas para recibir opiniones</p>
            )}
            {ratingProm >= 4.5 && totalOpiniones > 0 && (
              <span className="mt-3 flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-200">
                <Award className="w-3.5 h-3.5" /> Top Doctor iMed
              </span>
            )}
          </div>
        </div>

        {/* Top diagnósticos — pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Top 5 Diagnósticos</h2>
          </div>
          {topDiagnosticos[0]?.nombre === "Sin datos aún" ? (
            <div className="text-center py-8 text-gray-300">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Completá notas clínicas para ver tus diagnósticos más frecuentes.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={topDiagnosticos}
                    dataKey="value"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {topDiagnosticos.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(v: string) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>}
                  />
                  <RechartTooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    formatter={(v: number, name: string) => [`${v} caso${v !== 1 ? "s" : ""}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full md:w-56 space-y-2">
                {topDiagnosticos.map((d, i) => (
                  <div key={d.nombre} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-600 truncate flex-1">{d.nombre}</span>
                    <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nota precio */}
        {precioCita === 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">
              <strong>Tip:</strong> Configurá tu precio de consulta en tu perfil de doctor para que los ingresos estimados se calculen correctamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
