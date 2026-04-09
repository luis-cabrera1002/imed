import { useState } from "react";
import { Heart, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Framingham General CVD Risk Score (D'Agostino et al., 2008) ───────────────
// Uses continuous Cox proportional hazards model (not point-based)

interface FraminghamInputs {
  edad: number;
  sexo: "M" | "F";
  colesterol_total: number; // mg/dL
  colesterol_hdl: number;   // mg/dL
  presion_sistolica: number; // mmHg
  fumador: boolean;
  diabetico: boolean;
}

function calcularFramingham(inp: FraminghamInputs): number {
  const { edad, sexo, colesterol_total, colesterol_hdl, presion_sistolica, fumador, diabetico } = inp;

  // Guard: valid ranges
  if (edad < 20 || edad > 79) return -1;
  if (colesterol_total < 100 || colesterol_hdl < 20 || presion_sistolica < 80) return -1;

  const lnAge   = Math.log(edad);
  const lnTC    = Math.log(colesterol_total);
  const lnHDL   = Math.log(colesterol_hdl);
  const lnSBP   = Math.log(presion_sistolica);
  const smoke   = fumador ? 1 : 0;
  const diab    = diabetico ? 1 : 0;

  let F: number;
  let S0: number;

  if (sexo === "M") {
    F  = 3.06117 * lnAge + 1.12370 * lnTC - 0.93263 * lnHDL + 1.99881 * lnSBP + 0.65451 * smoke + 0.57367 * diab - 23.9802;
    S0 = 0.88936;
  } else {
    F  = 2.32888 * lnAge + 1.20904 * lnTC - 0.70833 * lnHDL + 2.82263 * lnSBP + 0.52873 * smoke + 0.69154 * diab - 26.1931;
    S0 = 0.95012;
  }

  const risk = (1 - Math.pow(S0, Math.exp(F))) * 100;
  return Math.min(Math.max(risk, 0.1), 99);
}

function getRiskCategory(risk: number): { label: string; color: string; bg: string; border: string; dot: string; rec: string } {
  if (risk < 10) return {
    label: "Riesgo Bajo",
    color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500",
    rec: "Mantené un estilo de vida saludable: dieta balanceada, ejercicio regular y control anual con tu médico.",
  };
  if (risk < 20) return {
    label: "Riesgo Moderado",
    color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500",
    rec: "Considerá modificar factores de riesgo controlables. Consultá con tu médico para evaluación de lípidos y presión arterial.",
  };
  return {
    label: "Riesgo Alto",
    color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500",
    rec: "Consultá urgentemente con un cardiólogo. Se recomienda tratamiento farmacológico y cambios intensivos de estilo de vida.",
  };
}

interface Props {
  // Optional pre-fill values from expediente
  isDiabetico?: boolean;
  defaultCollapsed?: boolean;
}

export default function CardiovascularRisk({ isDiabetico = false, defaultCollapsed = true }: Props) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const [form, setForm] = useState({
    edad: "",
    sexo: "M" as "M" | "F",
    colesterol_total: "",
    colesterol_hdl: "",
    presion_sistolica: "",
    fumador: false,
    diabetico: isDiabetico,
  });
  const [result, setResult] = useState<number | null>(null);
  const [calculated, setCalculated] = useState(false);

  function calcular() {
    const inp: FraminghamInputs = {
      edad:              parseInt(form.edad),
      sexo:              form.sexo,
      colesterol_total:  parseFloat(form.colesterol_total),
      colesterol_hdl:    parseFloat(form.colesterol_hdl),
      presion_sistolica: parseFloat(form.presion_sistolica),
      fumador:           form.fumador,
      diabetico:         form.diabetico,
    };
    const r = calcularFramingham(inp);
    setResult(r);
    setCalculated(true);
  }

  const canCalc = form.edad && form.colesterol_total && form.colesterol_hdl && form.presion_sistolica;

  const cat = result !== null && result >= 0 ? getRiskCategory(result) : null;

  // Gauge bar width (0-100%)
  const gaugeWidth = result !== null && result >= 0 ? Math.min(result, 100) : 0;
  const gaugeColor = gaugeWidth < 10 ? "bg-green-500" : gaugeWidth < 20 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="border border-indigo-100 rounded-2xl overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-red-900 text-sm">Predictor de Riesgo Cardiovascular</span>
          {calculated && result !== null && result >= 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat?.bg} ${cat?.color} ml-1`}>
              {result.toFixed(1)}% — {cat?.label}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Edad (años)</label>
              <Input type="number" min="20" max="79" value={form.edad}
                onChange={e => setForm(f => ({ ...f, edad: e.target.value }))}
                placeholder="45" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Sexo</label>
              <select value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value as "M" | "F" }))}
                className="w-full h-9 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Colesterol Total (mg/dL)</label>
              <Input type="number" min="100" max="500" value={form.colesterol_total}
                onChange={e => setForm(f => ({ ...f, colesterol_total: e.target.value }))}
                placeholder="200" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Colesterol HDL (mg/dL)</label>
              <Input type="number" min="20" max="150" value={form.colesterol_hdl}
                onChange={e => setForm(f => ({ ...f, colesterol_hdl: e.target.value }))}
                placeholder="50" className="h-9 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Presión Sistólica (mmHg)</label>
              <Input type="number" min="80" max="260" value={form.presion_sistolica}
                onChange={e => setForm(f => ({ ...f, presion_sistolica: e.target.value }))}
                placeholder="120" className="h-9 text-sm" />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.fumador}
                onChange={e => setForm(f => ({ ...f, fumador: e.target.checked }))}
                className="rounded" />
              <span className="text-sm text-gray-700">Fumador activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.diabetico}
                onChange={e => setForm(f => ({ ...f, diabetico: e.target.checked }))}
                className="rounded" />
              <span className="text-sm text-gray-700">Diabético</span>
            </label>
          </div>

          <Button
            size="sm"
            className="w-full rounded-xl h-10 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
            onClick={calcular}
            disabled={!canCalc}
          >
            <Heart className="w-3.5 h-3.5 mr-1.5" /> Calcular Riesgo a 10 años
          </Button>

          {/* Result */}
          {calculated && result !== null && (
            result < 0 ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <p className="text-sm text-orange-700">Valores fuera de rango. Revisá los datos ingresados (edad 20-79, colesterol y presión dentro de rangos normales).</p>
              </div>
            ) : (
              <div className={`space-y-3 p-4 rounded-xl border ${cat!.bg} ${cat!.border}`}>
                {/* Gauge */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-sm font-bold ${cat!.color}`}>{cat!.label}</span>
                    <span className={`text-2xl font-black ${cat!.color}`}>{result.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 border border-gray-100">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${gaugeColor}`}
                      style={{ width: `${Math.min(gaugeWidth * 1.5, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-green-600 font-medium">Bajo &lt;10%</span>
                    <span className="text-yellow-600 font-medium">Moderado 10-20%</span>
                    <span className="text-red-600 font-medium">Alto &gt;20%</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="flex items-start gap-2">
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cat!.color}`} />
                  <p className={`text-sm leading-relaxed ${cat!.color}`}>{cat!.rec}</p>
                </div>
              </div>
            )
          )}

          {/* Method note */}
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>Score de Framingham (D'Agostino et al., 2008). Riesgo estimado de evento cardiovascular a 10 años. Solo orientativo — requiere evaluación médica.</p>
          </div>
        </div>
      )}
    </div>
  );
}
