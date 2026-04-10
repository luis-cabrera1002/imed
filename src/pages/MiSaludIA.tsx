import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { functionsClient } from "@/integrations/supabase/functionsClient";
import Header from "@/components/Header";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import {
  Brain, Loader2, RefreshCw, Share2, CheckCircle, AlertTriangle,
  XCircle, Dna, Activity, Heart, Sparkles, ArrowLeft, FlaskConical,
  Dumbbell, Calendar,
} from "lucide-react";

interface RiesgoItem {
  porcentaje: number;
  nivel: "bajo" | "moderado" | "alto";
  explicacion: string;
}

interface EdadBiologica {
  estimada: number;
  real: number;
  diferencia: number;
  interpretacion: string;
}

interface HealthProfile {
  riesgo_diabetes: RiesgoItem;
  riesgo_hipertension: RiesgoItem;
  riesgo_cardiovascular: RiesgoItem;
  habitos_recomendados: string[];
  examenes_sugeridos: string[];
  edad_biologica: EdadBiologica;
  mensaje_motivacional: string;
}

const NIVEL_CONFIG = {
  bajo:     { color: "#22c55e", bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200", label: "Riesgo Bajo",     icon: CheckCircle  },
  moderado: { color: "#f59e0b", bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-200",label: "Riesgo Moderado", icon: AlertTriangle },
  alto:     { color: "#ef4444", bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",   label: "Riesgo Alto",     icon: XCircle      },
};

// Gauge circular SVG
function CircularGauge({ pct, color, size = 120 }: { pct: number; color: string; size?: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{pct}%</text>
    </svg>
  );
}

function RiesgoCard({ titulo, icono: Icono, data, color }: {
  titulo: string;
  icono: React.ElementType;
  data: RiesgoItem;
  color: string;
}) {
  const cfg = NIVEL_CONFIG[data.nivel] ?? NIVEL_CONFIG.bajo;
  const NivelIcon = cfg.icon;
  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5 flex flex-col items-center text-center`}>
      <div className="flex items-center gap-2 mb-3 self-start">
        <Icono className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-800">{titulo}</span>
      </div>
      <CircularGauge pct={data.porcentaje} color={cfg.color} />
      <div className={`flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        <NivelIcon className="w-3 h-3" />
        {cfg.label}
      </div>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{data.explicacion}</p>
    </div>
  );
}

export default function MiSaludIA() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<HealthProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expedienteCompleto, setExpedienteCompleto] = useState(false);
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [compartiendo, setCompartiendo] = useState(false);
  const [compartidoOk, setCompartidoOk] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "patient") { navigate("/patient-dashboard"); return; }
    setNombrePaciente(profile?.full_name?.split(" ")[0] || "Paciente");

    const { data: exp } = await supabase
      .from("expediente_medico")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setExpedienteCompleto(!!(exp?.condiciones || exp?.medicamentos_activos || exp?.peso));
  }

  async function analizar() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setCompartidoOk(false);

    try {
      // Cargar datos del expediente
      const [{ data: exp }, { data: profile }, { data: citas }] = await Promise.all([
        supabase.from("expediente_medico").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("profiles").select("full_name, created_at").eq("user_id", userId).single(),
        supabase.from("citas").select("fecha").eq("paciente_id", userId).eq("estado", "completada").order("fecha", { ascending: false }).limit(1),
      ]);

      // Calcular edad desde created_at (aproximación)
      const edadAprox = null; // No tenemos fecha de nacimiento en el schema

      // Calcular IMC si hay datos
      let imc: string | null = null;
      if (exp?.peso && exp?.altura) {
        const altM = exp.altura / 100;
        imc = (exp.peso / (altM * altM)).toFixed(1);
      }

      const expediente = {
        edad: edadAprox,
        sexo: null,
        peso: exp?.peso ?? null,
        altura: exp?.altura ?? null,
        imc,
        grupo_sanguineo: exp?.grupo_sanguineo ?? null,
        condiciones: exp?.condiciones ?? [],
        alergias: exp?.alergias ?? [],
        medicamentos: exp?.medicamentos_activos ?? [],
        ultima_cita: citas?.[0]?.fecha ?? null,
      };

      const { data, error: fnErr } = await functionsClient.functions.invoke("health-predictor", {
        body: { expediente },
      });

      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);

      setResultado(data as HealthProfile);
    } catch (err: any) {
      setError(err.message ?? "Error al analizar tu perfil. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function compartirConDoctor() {
    if (!resultado || !userId) return;
    setCompartiendo(true);

    const resumenTexto = `
=== iMed Brain — Perfil Predictivo de Salud ===
Fecha: ${new Date().toLocaleDateString("es-GT")}

RIESGOS ESTIMADOS:
• Diabetes: ${resultado.riesgo_diabetes.porcentaje}% (${resultado.riesgo_diabetes.nivel}) — ${resultado.riesgo_diabetes.explicacion}
• Hipertensión: ${resultado.riesgo_hipertension.porcentaje}% (${resultado.riesgo_hipertension.nivel}) — ${resultado.riesgo_hipertension.explicacion}
• Cardiovascular: ${resultado.riesgo_cardiovascular.porcentaje}% (${resultado.riesgo_cardiovascular.nivel}) — ${resultado.riesgo_cardiovascular.explicacion}

EDAD BIOLÓGICA ESTIMADA: ${resultado.edad_biologica.estimada} años (real: ${resultado.edad_biologica.real})
${resultado.edad_biologica.interpretacion}

HÁBITOS RECOMENDADOS:
${resultado.habitos_recomendados.map((h, i) => `${i + 1}. ${h}`).join("\n")}

EXÁMENES SUGERIDOS:
${resultado.examenes_sugeridos.map((e, i) => `${i + 1}. ${e}`).join("\n")}

Generado por iMed Brain — DISCLAIMER: Este análisis es orientativo y NO reemplaza evaluación médica profesional.
`.trim();

    // Buscar la última cita del paciente para asociar la nota
    const { data: cita } = await supabase
      .from("citas")
      .select("id, doctor_id")
      .eq("paciente_id", userId)
      .eq("estado", "completada")
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cita) {
      await supabase.from("notas_clinicas").insert({
        doctor_id: cita.doctor_id,
        paciente_id: userId,
        cita_id: cita.id,
        motivo_consulta: "Análisis Predictivo iMed Brain",
        diagnostico: `Perfil predictivo: Diabetes ${resultado.riesgo_diabetes.porcentaje}%, HTA ${resultado.riesgo_hipertension.porcentaje}%, CV ${resultado.riesgo_cardiovascular.porcentaje}%`,
        plan_tratamiento: resultado.habitos_recomendados.join(" | "),
        observaciones: resumenTexto,
        compartida_con_paciente: true,
      });
      setCompartidoOk(true);
    } else {
      // Sin citas completadas, simplemente copiar al portapapeles
      await navigator.clipboard.writeText(resumenTexto).catch(() => {});
      setCompartidoOk(true);
    }
    setCompartiendo(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Salud IA</h1>
                <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                  iMed Brain 🧠
                </span>
              </div>
              <p className="text-gray-500 text-sm ml-13">
                Hola, {nombrePaciente}. Analizamos tu expediente para darte un perfil predictivo personalizado.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6">
          <MedicalDisclaimer />
        </div>

        {/* CTA de análisis */}
        {!resultado && !loading && (
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-8 text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Análisis Predictivo de Salud</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              iMed Brain analiza tu expediente médico completo con inteligencia artificial para estimar tus riesgos de salud y darte recomendaciones personalizadas.
            </p>
            {!expedienteCompleto && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700 text-left">
                <strong>Tip:</strong> Completar tu{" "}
                <button onClick={() => navigate("/expediente")} className="underline font-semibold">expediente médico</button>
                {" "}mejora la precisión del análisis. Podés analizar con los datos actuales.
              </div>
            )}
            <button
              onClick={analizar}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Analizar mi salud con IA
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-12 text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
              <Brain className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Analizando tu perfil...</h3>
            <p className="text-sm text-gray-400">iMed Brain está procesando tu expediente completo</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Error en el análisis</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Resultado */}
        {resultado && !loading && (
          <div className="space-y-6">

            {/* Mensaje motivacional */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold opacity-80 mb-1">Mensaje de iMed Brain</p>
                  <p className="font-medium leading-relaxed">{resultado.mensaje_motivacional}</p>
                </div>
              </div>
            </div>

            {/* Riesgos — 3 gauges */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Riesgos Estimados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RiesgoCard titulo="Diabetes" icono={Dna} data={resultado.riesgo_diabetes} color={NIVEL_CONFIG[resultado.riesgo_diabetes.nivel]?.color ?? "#22c55e"} />
                <RiesgoCard titulo="Hipertensión" icono={Activity} data={resultado.riesgo_hipertension} color={NIVEL_CONFIG[resultado.riesgo_hipertension.nivel]?.color ?? "#22c55e"} />
                <RiesgoCard titulo="Cardiovascular" icono={Heart} data={resultado.riesgo_cardiovascular} color={NIVEL_CONFIG[resultado.riesgo_cardiovascular.nivel]?.color ?? "#22c55e"} />
              </div>
            </div>

            {/* Edad biológica */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Dna className="w-5 h-5 text-purple-600" />
                Edad Biológica Estimada
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Edad real</p>
                    <p className="text-4xl font-black text-gray-800">{resultado.edad_biologica.real || "—"}</p>
                    <p className="text-xs text-gray-400">años</p>
                  </div>
                  <div className="text-3xl text-gray-300">→</div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Edad biológica</p>
                    <p className={`text-4xl font-black ${
                      resultado.edad_biologica.diferencia < 0 ? "text-green-600" :
                      resultado.edad_biologica.diferencia > 2 ? "text-red-600" : "text-blue-600"
                    }`}>{resultado.edad_biologica.estimada}</p>
                    <p className="text-xs text-gray-400">años</p>
                  </div>
                </div>
                <div className="flex-1">
                  {resultado.edad_biologica.diferencia !== 0 && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold mb-2 ${
                      resultado.edad_biologica.diferencia < 0
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {resultado.edad_biologica.diferencia < 0 ? "✨" : "⚠️"}
                      {Math.abs(resultado.edad_biologica.diferencia)} años {resultado.edad_biologica.diferencia < 0 ? "más joven" : "mayor"} de lo que aparentás
                    </div>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">{resultado.edad_biologica.interpretacion}</p>
                </div>
              </div>
            </div>

            {/* Hábitos + Exámenes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-green-600" />
                  Hábitos Recomendados
                </h2>
                <ul className="space-y-2.5">
                  {resultado.habitos_recomendados.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  Exámenes Sugeridos
                </h2>
                <ul className="space-y-2.5">
                  {resultado.examenes_sugeridos.map((e, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 leading-relaxed">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={analizar}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerar análisis
              </button>
              <button
                onClick={compartirConDoctor}
                disabled={compartiendo || compartidoOk}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  compartidoOk
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {compartiendo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : compartidoOk ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {compartidoOk ? "¡Compartido con tu doctor!" : compartiendo ? "Compartiendo..." : "Compartir con mi doctor"}
              </button>
              <button
                onClick={() => navigate("/citas")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                Agendar cita preventiva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
