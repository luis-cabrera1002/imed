import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { functionsClient } from "@/integrations/supabase/functionsClient";
import Header from "@/components/Header";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, AlertTriangle, CheckCircle, Clock, Stethoscope,
  ArrowRight, Info, RotateCcw, Search
} from "lucide-react";

type Urgencia = "baja" | "media" | "alta";

interface Resultado {
  condiciones: string[];
  especialidad: string;
  urgencia: Urgencia;
  consejo: string;
  disclaimer: string;
}

const URGENCIA_CONFIG: Record<Urgencia, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  baja:  { label: "Urgencia Baja",   color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200", icon: CheckCircle },
  media: { label: "Urgencia Media",  color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: Clock },
  alta:  { label: "Urgencia Alta",   color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",   icon: AlertTriangle },
};

export default function SintomaChecker() {
  const navigate = useNavigate();
  const [sintomas, setSintomas] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analizar() {
    if (!sintomas.trim() || sintomas.trim().length < 10) {
      setError("Describí tus síntomas con más detalle (mínimo 10 caracteres).");
      return;
    }
    setLoading(true);
    setError("");
    setResultado(null);

    const { data, error: fnErr } = await functionsClient.functions.invoke("symptom-checker", {
      body: { sintomas },
    });

    if (fnErr || data?.error) {
      setError("No se pudo analizar los síntomas. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    setResultado(data as Resultado);
    setLoading(false);
  }

  const cfg = resultado ? URGENCIA_CONFIG[resultado.urgencia] ?? URGENCIA_CONFIG.media : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Brain className="w-3.5 h-3.5" /> IA Médica
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificador de Síntomas</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Describí tus síntomas en lenguaje natural y nuestra IA te orientará sobre posibles causas y qué especialista consultar.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-6">
          <MedicalDisclaimer />
        </div>

        {/* Input */}
        {!resultado && (
          <Card className="border-0 shadow-sm mb-4">
            <CardContent className="pt-5 pb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describí tus síntomas
              </label>
              <Textarea
                value={sintomas}
                onChange={e => setSintomas(e.target.value)}
                placeholder="Ej: Tengo dolor de cabeza fuerte desde ayer, me duele la nuca y tengo fiebre de 38°C. También siento náuseas..."
                rows={5}
                className="text-sm resize-none mb-4"
                disabled={loading}
              />
              {error && (
                <p className="text-red-600 text-sm mb-3">{error}</p>
              )}
              <Button
                onClick={analizar}
                disabled={loading || !sintomas.trim()}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" /> Analizar con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resultado */}
        {resultado && cfg && (
          <div className="space-y-4">
            {/* Urgencia banner */}
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
              <cfg.icon className={`w-6 h-6 ${cfg.color} flex-shrink-0`} />
              <div>
                <p className={`font-bold ${cfg.color}`}>{cfg.label}</p>
                <p className={`text-sm ${cfg.color} opacity-80`}>
                  {resultado.urgencia === "baja"  && "Podés consultar a tu médico en los próximos días."}
                  {resultado.urgencia === "media" && "Se recomienda ver a un médico en las próximas 24-48 horas."}
                  {resultado.urgencia === "alta"  && "Buscá atención médica hoy. No esperes."}
                </p>
              </div>
            </div>

            {/* Posibles condiciones */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
                  <Stethoscope className="w-4 h-4 text-purple-600" /> Posibles causas
                </h3>
                <div className="space-y-2">
                  {resultado.condiciones.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{c}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Especialidad + Consejo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Especialidad recomendada</p>
                  <p className="font-bold text-gray-900 text-base">{resultado.especialidad}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Consejo inmediato</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{resultado.consejo}</p>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 bg-gray-100 rounded-xl px-4 py-3">
              <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 italic">{resultado.disclaimer}</p>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(`/doctores?especialidad=${encodeURIComponent(resultado.especialidad)}`)}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4" />
                Buscar {resultado.especialidad}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setResultado(null); setSintomas(""); }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Nuevo análisis
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/citas")}
              className="w-full gap-2 text-sm text-gray-500"
            >
              Agendar cita ahora <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
