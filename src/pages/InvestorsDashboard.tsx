import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_EMAILS = ["totessi.10@gmail.com", "luisan.cabrera@gmail.com"];

interface Metrics {
  total_usuarios: number;
  citas_hoy: number;
  citas_total: number;
  medicine_scans: number;
  documentos: number;
  doctores: number;
  farmacias: number;
  opiniones_verificadas: number;
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [value, duration]);

  return <span>{display.toLocaleString("es-GT")}</span>;
}

function MetricCard({
  label,
  value,
  icon,
  gradient,
  textColor,
  sublabel,
}: {
  label: string;
  value: number;
  icon: string;
  gradient: string;
  textColor: string;
  sublabel?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg`}>
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white opacity-5" />
      <div className="absolute -bottom-8 -left-4 w-36 h-36 rounded-full bg-white opacity-5" />

      <div className="relative">
        <div className="text-3xl mb-3">{icon}</div>
        <div className={`text-5xl font-black tracking-tight ${textColor}`}>
          <AnimatedNumber value={value} />
        </div>
        <div className="mt-2 text-white font-semibold text-sm opacity-90 uppercase tracking-wider">
          {label}
        </div>
        {sublabel && (
          <div className="mt-1 text-white text-xs opacity-60">{sublabel}</div>
        )}
      </div>
    </div>
  );
}

export default function InvestorsDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setFetchError(null);
    const { data, error } = await supabase.rpc("get_investor_metrics");
    if (error) {
      setFetchError(error.message ?? "Error al cargar métricas. Verificá que la función SQL esté instalada en Supabase.");
    } else if (data) {
      setMetrics(data as Metrics);
      setLastUpdated(new Date());
    }
    if (isManual) setRefreshing(false);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { navigate("/auth"); return; }

      const email = user.email ?? "";
      if (!ALLOWED_EMAILS.includes(email)) { navigate("/"); return; }

      setAuthorized(true);
      await fetchMetrics();
      setLoading(false);
    }
    init();
  }, [navigate, fetchMetrics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!authorized) return;
    const interval = setInterval(() => fetchMetrics(), 30_000);
    return () => clearInterval(interval);
  }, [authorized, fetchMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  // Si hay error y aún no hay datos, mostrar pantalla de error completa
  if (fetchError && !metrics) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">Error al cargar métricas</h2>
          <p className="text-gray-400 text-sm mb-4">{fetchError}</p>
          <div className="bg-gray-800 rounded-xl p-4 text-left mb-6">
            <p className="text-gray-300 text-xs font-semibold mb-1">Solución:</p>
            <p className="text-gray-400 text-xs">Corré la migración <code className="text-blue-300">20260326000001_investor_metrics_function.sql</code> en el SQL Editor de Supabase para instalar la función <code className="text-blue-300">get_investor_metrics()</code>.</p>
          </div>
          <button
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
          >
            {refreshing ? "Reintentando..." : "Reintentar"}
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("es-GT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const updatedTime = lastUpdated?.toLocaleTimeString("es-GT", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-black text-white tracking-tight">iMed</span>
                <span className="text-blue-300 font-light text-2xl">Guatemala</span>
                <span className="hidden md:inline text-white/20 text-2xl">·</span>
                <span className="hidden md:inline text-blue-300/70 text-sm font-semibold uppercase tracking-widest">
                  Investors
                </span>
              </div>
              <p className="text-blue-200/60 text-sm capitalize">{today}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* EN VIVO badge */}
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-4 py-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-red-300 font-bold text-xs tracking-widest">EN VIVO</span>
              </div>

              {/* Manual refresh */}
              <button
                onClick={() => fetchMetrics(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/70 hover:text-white transition disabled:opacity-50"
              >
                <svg
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="mt-3 bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3">
              <p className="text-red-300 text-xs font-medium">⚠ {fetchError}</p>
              <p className="text-red-400/70 text-xs mt-1">Corré la migración <code>20260326000001_investor_metrics_function.sql</code> en el SQL Editor de Supabase.</p>
            </div>
          )}
          {lastUpdated && !fetchError && (
            <p className="mt-3 text-xs text-white/30">
              Última actualización: {updatedTime} · Auto-refresh cada 30s
            </p>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Top headline numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          <MetricCard
            label="Usuarios registrados"
            value={metrics?.total_usuarios ?? 0}
            icon="👥"
            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
            textColor="text-white"
            sublabel="Pacientes, doctores y farmacias"
          />
          <MetricCard
            label="Citas agendadas hoy"
            value={metrics?.citas_hoy ?? 0}
            icon="📅"
            gradient="bg-gradient-to-br from-emerald-600 to-teal-800"
            textColor="text-white"
            sublabel={today.split(",")[0]}
          />
          <MetricCard
            label="Total citas"
            value={metrics?.citas_total ?? 0}
            icon="🩺"
            gradient="bg-gradient-to-br from-violet-600 to-purple-800"
            textColor="text-white"
            sublabel="Históricas en la plataforma"
          />
          <MetricCard
            label="Doctores activos"
            value={metrics?.doctores ?? 0}
            icon="👨‍⚕️"
            gradient="bg-gradient-to-br from-indigo-600 to-blue-900"
            textColor="text-white"
            sublabel="Perfiles médicos completos"
          />
        </div>

        {/* Secondary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <MetricCard
            label="Medicamentos escaneados"
            value={metrics?.medicine_scans ?? 0}
            icon="💊"
            gradient="bg-gradient-to-br from-pink-600 to-rose-800"
            textColor="text-white"
            sublabel="Vía escáner de medicamentos"
          />
          <MetricCard
            label="Documentos médicos"
            value={metrics?.documentos ?? 0}
            icon="📄"
            gradient="bg-gradient-to-br from-amber-500 to-orange-700"
            textColor="text-white"
            sublabel="Subidos por pacientes"
          />
          <MetricCard
            label="Farmacias registradas"
            value={metrics?.farmacias ?? 0}
            icon="🏪"
            gradient="bg-gradient-to-br from-cyan-600 to-sky-800"
            textColor="text-white"
            sublabel="Aliadas en la red iMed"
          />
          <MetricCard
            label="Opiniones verificadas"
            value={metrics?.opiniones_verificadas ?? 0}
            icon="⭐"
            gradient="bg-gradient-to-br from-yellow-500 to-amber-700"
            textColor="text-white"
            sublabel="Solo pacientes con cita"
          />
        </div>

        {/* Divider + confidential notice */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-white/20 text-xs uppercase tracking-widest font-semibold">
            Información confidencial · Solo para uso interno de inversores
          </p>
          <p className="text-white/20 text-xs">
            iMed Guatemala © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
