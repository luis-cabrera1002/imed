import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { functionsClient } from "@/integrations/supabase/functionsClient";
import Header from "@/components/Header";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import {
  Upload, Image as ImageIcon, AlertTriangle, CheckCircle,
  Clock, ArrowLeft, Scan, Zap, Eye, FileText, Info,
} from "lucide-react";

const TIPOS_IMAGEN = [
  "Lesión cutánea / dermatológica",
  "Radiografía de tórax",
  "Radiografía ósea",
  "Ecografía",
  "Resultado de laboratorio",
  "Tomografía / Resonancia",
  "Fotografía clínica general",
  "Otro",
];

interface DiagnosisResult {
  tipo_documento: string;
  hallazgos: string[];
  posible_diagnostico: string;
  recomendaciones: string;
  urgencia: "baja" | "media" | "alta";
  disclaimer: string;
}

const URGENCIA_CONFIG = {
  baja:  { label: "Urgencia Baja",  bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500"  },
  media: { label: "Urgencia Media", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
  alta:  { label: "Urgencia Alta",  bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500"    },
};

export default function DiagnosticoImagen() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [tipo, setTipo] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar 10 MB.");
      return;
    }
    setError(null);
    setResult(null);
    setImageMime(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      // Extract pure base64 (strip data:...;base64, prefix)
      setImageBase64(dataUrl.split(",")[1] ?? null);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function analyze() {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    try {
      const { data, error: fnErr } = await functionsClient.functions.invoke("image-diagnosis", {
        body: { image: imageBase64, mimeType: imageMime, tipo },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      setResult(data as DiagnosisResult);
    } catch (e: any) {
      setError(e?.message || "No se pudo analizar la imagen. Intentá de nuevo.");
    }
    setAnalyzing(false);
  }

  function reset() {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    setTipo("");
  }

  const urgCfg = result ? (URGENCIA_CONFIG[result.urgencia] ?? URGENCIA_CONFIG.media) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Diagnóstico por Imagen con IA</h1>
              <p className="text-sm text-gray-500">Segunda opinión de IA para imágenes médicas</p>
            </div>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="mb-6">
          <MedicalDisclaimer />
        </div>

        <div className="space-y-5">
          {/* Upload area */}
          {!imagePreview ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Arrastrá la imagen aquí</p>
              <p className="text-sm text-gray-400 mb-3">o hacé clic para seleccionar</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP · Máx 10 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={imagePreview} alt="Imagen a analizar" className="w-full max-h-80 object-contain bg-gray-900" />
              {!result && (
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Tipo de imagen selector */}
          {imagePreview && !result && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Tipo de imagen (opcional)
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="">— Seleccioná el tipo —</option>
                {TIPOS_IMAGEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Analyze button */}
          {imagePreview && !result && (
            <Button
              className="w-full h-12 text-sm font-semibold rounded-xl"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" }}
              onClick={analyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <><Clock className="w-4 h-4 mr-2 animate-spin" /> Analizando con IA...</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" /> Analizar imagen</>
              )}
            </Button>
          )}

          {/* Results */}
          {result && urgCfg && (
            <div className="space-y-4 animate-in fade-in duration-300">

              {/* Urgencia badge */}
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${urgCfg.bg} ${urgCfg.border}`}>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${urgCfg.dot}`} />
                <span className={`font-bold text-sm ${urgCfg.text}`}>{urgCfg.label}</span>
                <span className={`text-xs ${urgCfg.text} ml-auto`}>{result.tipo_documento}</span>
              </div>

              {/* Hallazgos */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Hallazgos</h3>
                </div>
                <ul className="space-y-2">
                  {(result.hallazgos || []).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Posible diagnóstico */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Posible Diagnóstico</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{result.posible_diagnostico}</p>
              </div>

              {/* Recomendaciones */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Recomendaciones</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{result.recomendaciones}</p>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">{result.disclaimer}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-11 text-sm" onClick={reset}>
                  Analizar otra imagen
                </Button>
                <Button
                  className="flex-1 rounded-xl h-11 text-sm"
                  onClick={() => navigate("/doctores")}
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" }}
                >
                  Buscar especialista
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
