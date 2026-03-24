import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Camera, Upload, Scan, CheckCircle, XCircle,
  MapPin, AlertCircle, RefreshCw, Info,
  ChevronDown, ChevronUp, Video, Pill
} from "lucide-react";

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/1F6MFz8rg/";

// ── Base de datos completa de medicamentos ──
const MEDICINE_DB: Record<string, any> = {
  "Butosol": {
    nombre: "Butosol",
    nombreComercial: "Butosol®",
    laboratorio: "Laboratorios Leti / Distribuidores GT",
    ingredienteActivo: "Sulfato de Salbutamol",
    concentracion: "100 mcg/dosis",
    tipo: "Broncodilatador β2-agonista de acción corta (SABA)",
    color: "rojo/naranja",
    emoji: "🔴",
    descripcion: "Inhalador de rescate de uso común en Guatemala y Centroamérica. Utilizado para el alivio rápido del broncoespasmo en asma y EPOC. Contiene el mismo principio activo que el Ventolin pero distribuido localmente.",
    indicaciones: ["Asma bronquial", "EPOC", "Broncoespasmo agudo", "Bronquitis obstructiva"],
    ingredientes: [
      { nombre: "Sulfato de Salbutamol (Albuterol)", presente: true, descripcion: "Principio activo — relaja los músculos de las vías respiratorias" },
      { nombre: "Propelente HFA-134a", presente: true, descripcion: "Propelente sin CFC, ecológico" },
      { nombre: "Etanol anhidro", presente: true, descripcion: "Cosolvente farmacéutico" },
      { nombre: "Ácido oleico", presente: false, descripcion: "Lubricante (ausente en esta fórmula)" },
      { nombre: "Cloruro de bencetonio", presente: false, descripcion: "Conservante (no aplica en MDI)" },
      { nombre: "Corticosteroide inhalado", presente: false, descripcion: "No es inhalador de mantenimiento" },
      { nombre: "Ipratropio bromuro", presente: false, descripcion: "No es combinado — solo salbutamol" },
    ],
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Ventolin HFA / ProAir HFA", laboratorio: "GSK / Teva" },
      { pais: "🇪🇸 España", nombre: "Ventolin / Salbutamol Sandoz", laboratorio: "GSK / Sandoz" },
      { pais: "🇫🇷 Francia", nombre: "Ventoline / Airomir", laboratorio: "GSK / Teva" },
      { pais: "🇩🇪 Alemania", nombre: "Sultanol / Salbutamol-ratiopharm", laboratorio: "GSK / Ratiopharm" },
      { pais: "🇲🇽 México", nombre: "Salbulair / Asmalair", laboratorio: "Asofarma / Chinoin" },
      { pais: "🇨🇴 Colombia", nombre: "Ventolin / Salbutamol MK", laboratorio: "GSK / Tecnoquímicas" },
      { pais: "🇦🇷 Argentina", nombre: "Aldobronquial / Ventolin", laboratorio: "Roemmers / GSK" },
      { pais: "🇧🇷 Brasil", nombre: "Aerolin / Salbulair", laboratorio: "GSK / Aché" },
      { pais: "🇨🇦 Canadá", nombre: "Ventolin HFA / Airomir", laboratorio: "GSK / Teva" },
      { pais: "🇬🇧 Reino Unido", nombre: "Ventolin Evohaler / Salamol", laboratorio: "GSK / Norton" },
    ]
  },
  "Salbutamol": {
    nombre: "Salbutamol",
    nombreComercial: "Ventolin® / Genérico",
    laboratorio: "GlaxoSmithKline / Múltiples laboratorios",
    ingredienteActivo: "Sulfato de Salbutamol",
    concentracion: "100 mcg/dosis",
    tipo: "Broncodilatador β2-agonista de acción corta (SABA)",
    color: "azul",
    emoji: "🔵",
    descripcion: "Inhalador broncodilatador de rescate más usado en el mundo. Disponible como Ventolin (marca) o genérico en prácticamente todos los países. Mismo mecanismo de acción que Butosol — son bioequivalentes.",
    indicaciones: ["Asma bronquial", "EPOC", "Broncoespasmo agudo", "Profilaxis de asma inducida por ejercicio"],
    ingredientes: [
      { nombre: "Sulfato de Salbutamol (Albuterol)", presente: true, descripcion: "Principio activo — relaja los músculos de las vías respiratorias" },
      { nombre: "Propelente HFA-134a", presente: true, descripcion: "Propelente sin CFC, ecológico" },
      { nombre: "Etanol anhidro", presente: true, descripcion: "Cosolvente farmacéutico" },
      { nombre: "Ácido oleico", presente: true, descripcion: "Lubricante para válvula dosificadora" },
      { nombre: "Cloruro de bencetonio", presente: false, descripcion: "Conservante (no aplica en MDI)" },
      { nombre: "Corticosteroide inhalado", presente: false, descripcion: "No es inhalador de mantenimiento" },
      { nombre: "Ipratropio bromuro", presente: false, descripcion: "No es combinado — solo salbutamol" },
    ],
    equivalentes: [
      { pais: "🇬🇹 Guatemala", nombre: "Butosol / Salbulair GT", laboratorio: "Leti / Asofarma" },
      { pais: "🇺🇸 EE.UU.", nombre: "ProAir HFA / Proventil HFA", laboratorio: "Teva / Merck" },
      { pais: "🇲🇽 México", nombre: "Salbulair / Asmalair / Sultanol", laboratorio: "Asofarma / Chinoin / GSK" },
      { pais: "🇦🇷 Argentina", nombre: "Aldobronquial / Broncovaleas", laboratorio: "Roemmers / Chiesi" },
      { pais: "🇨🇴 Colombia", nombre: "Salbutamol MK / Aldolair", laboratorio: "Tecnoquímicas / MK" },
      { pais: "🇧🇷 Brasil", nombre: "Aerolin / Salbulair", laboratorio: "GSK / Aché" },
      { pais: "🇨🇱 Chile", nombre: "Salbutamol Genfar / Servamol", laboratorio: "Genfar / Saval" },
      { pais: "🇵🇪 Perú", nombre: "Salbutamol Genfar / Aldolair", laboratorio: "Genfar / Farmindustria" },
    ]
  }
};

type Mode = "inicio" | "camara" | "analizando" | "resultado" | "error";

export default function MedicineScanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const [mode, setMode]               = useState<Mode>("inicio");
  const [modelReady, setModelReady]   = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [tmModel, setTmModel]         = useState<any>(null);
  const [resultado, setResultado]     = useState<{ clase: string; confianza: number } | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showIngr, setShowIngr]       = useState(true);
  const [showEquiv, setShowEquiv]     = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Esperar a que TF esté disponible en window
  const waitForTM = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        // @ts-ignore
        if (window.tmImage) { resolve(window.tmImage); return; }
        attempts++;
        if (attempts > 10) { reject(new Error("Teachable Machine no disponible")); return; }
        setTimeout(check, 500);
      };
      check();
    });
  }, []);

  async function loadModel() {
    if (modelReady && tmModel) return tmModel;
    setLoadingModel(true);
    try {
      const tmImage = await waitForTM();
      const model = await tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
      );
      setTmModel(model);
      setModelReady(true);
      setLoadingModel(false);
      return model;
    } catch (err: any) {
      setLoadingModel(false);
      setErrorMsg("No se pudo cargar el modelo de IA. Revisá tu conexión.");
      throw err;
    }
  }

  async function startCamera() {
    try {
      const model = await loadModel();
      if (!model) return;
      setMode("camara");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      setErrorMsg(err.name === "NotAllowedError"
        ? "Permiso de cámara denegado. Activalo en la configuración del navegador."
        : "No se pudo acceder a la cámara.");
      setMode("error");
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  }

  async function captureAndScan() {
    if (!videoRef.current || !canvasRef.current || !tmModel) return;
    setMode("analizando");
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImagePreview(canvas.toDataURL("image/jpeg", 0.8));
    stopCamera();
    await runPrediction(canvas);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMode("analizando");
    try {
      const model = await loadModel();
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const src = ev.target?.result as string;
        setImagePreview(src);
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")?.drawImage(img, 0, 0);
          await runPrediction(canvas, model);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    } catch {
      setMode("error");
    }
  }

  async function runPrediction(canvas: HTMLCanvasElement, model?: any) {
    const m = model || tmModel;
    if (!m) { setMode("error"); return; }
    try {
      const predictions: { className: string; probability: number }[] = await m.predict(canvas);
      const best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
      setResultado({ clase: best.className, confianza: Math.round(best.probability * 100) });
      setMode("resultado");
    } catch {
      setErrorMsg("No pudimos analizar la imagen. Intentá con mejor iluminación.");
      setMode("error");
    }
  }

  const medInfo  = resultado ? MEDICINE_DB[resultado.clase] : null;
  const otroMed  = resultado ? Object.values(MEDICINE_DB).find((m: any) => m.nombre !== resultado.clase) as any : null;

  const comparativa = medInfo && otroMed
    ? medInfo.ingredientes.map((ing: any) => ({
        ...ing,
        enOtro: (otroMed.ingredientes as any[]).find(i => i.nombre === ing.nombre)?.presente ?? false,
      }))
    : [];

  // ── Sin sesión ──
  if (!user) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border border-border/50 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Escáner de Medicamentos</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Iniciá sesión para usar el escáner y encontrar equivalentes en cualquier país del mundo.
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-xl"
              onClick={() => navigate("/auth")}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">

        {/* ══ INICIO ══ */}
        {mode === "inicio" && (
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Escáner de Medicamentos</h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                Fotografiá tu medicamento y encontrá su equivalente en cualquier país.
                Compará ingredientes activos al instante con IA.
              </p>
            </div>

            {/* Cómo funciona */}
            <Card className="border border-border/50 shadow-sm rounded-2xl mb-5">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />¿Cómo funciona?
                </h3>
                <div className="space-y-3">
                  {[
                    { n: "1", t: "Tomá una foto clara del medicamento o subí una imagen", ic: Camera },
                    { n: "2", t: "La IA identifica el medicamento automáticamente", ic: Scan },
                    { n: "3", t: "Ves el checklist comparativo de ingredientes activos", ic: CheckCircle },
                    { n: "4", t: "Encontrás su equivalente en más de 10 países", ic: MapPin },
                  ].map(({ n, t, ic: Icon }) => (
                    <div key={n} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{n}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug pt-0.5">{t}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medicamentos detectables */}
            <Card className="border border-border/50 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-secondary" />Medicamentos detectables
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(MEDICINE_DB).map((m: any) => (
                    <div key={m.nombre} className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-xl border border-border/50">
                      <span className="text-lg">{m.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.nombre}</p>
                        <p className="text-xs text-muted-foreground">{m.ingredienteActivo}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-xl border border-dashed border-border/50">
                    <span className="text-lg">➕</span>
                    <p className="text-xs text-muted-foreground">Más próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="space-y-3">
              <Button
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-md gap-2 text-base"
                onClick={startCamera}
                disabled={loadingModel}
              >
                {loadingModel
                  ? <><RefreshCw className="w-5 h-5 animate-spin" />Cargando IA...</>
                  : <><Camera className="w-5 h-5" />Usar Cámara</>
                }
              </Button>
              <Button variant="outline"
                className="w-full py-4 rounded-xl gap-2 text-base border-border/50"
                onClick={() => fileRef.current?.click()}
                disabled={loadingModel}
              >
                <Upload className="w-5 h-5" />Subir Foto de Galería
              </Button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </div>
          </div>
        )}

        {/* ══ CÁMARA ══ */}
        {mode === "camara" && (
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="text-center mb-4">
              <h2 className="font-bold text-foreground text-lg">Enfocá el medicamento</h2>
              <p className="text-sm text-muted-foreground">Asegurate que esté bien iluminado y centrado en el recuadro</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl mb-4">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full aspect-[4/3] object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              {/* Marco guía */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 border-4 border-white/70 rounded-2xl shadow-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl gap-2 text-base"
                onClick={captureAndScan}
                disabled={!streamActive}
              >
                <Scan className="w-5 h-5" />Escanear Ahora
              </Button>
              <Button variant="outline" className="w-full py-3 rounded-xl border-border/50"
                onClick={() => { stopCamera(); setMode("inicio"); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* ══ ANALIZANDO ══ */}
        {mode === "analizando" && (
          <div className="max-w-lg mx-auto px-4 py-12 text-center">
            {imagePreview && (
              <img src={imagePreview} className="w-40 h-40 rounded-2xl object-cover mx-auto mb-6 shadow-lg" alt="analizando" />
            )}
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Analizando con IA...</h2>
            <p className="text-muted-foreground text-sm">Identificando el medicamento y buscando equivalentes</p>
          </div>
        )}

        {/* ══ RESULTADO ══ */}
        {mode === "resultado" && resultado && medInfo && (
          <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
              {imagePreview && (
                <img src={imagePreview} className="w-16 h-16 rounded-xl object-cover border-2 border-green-200 flex-shrink-0" alt="resultado" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-600">Identificado con {resultado.confianza}% de certeza</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{medInfo.emoji} {medInfo.nombre}</h2>
                <p className="text-sm text-primary font-medium">{medInfo.ingredienteActivo} · {medInfo.concentracion}</p>
              </div>
            </div>

            {/* Info card */}
            <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-5 py-3">
                <p className="font-bold text-foreground">{medInfo.nombreComercial}</p>
                <p className="text-xs text-muted-foreground">{medInfo.laboratorio} · {medInfo.tipo}</p>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">{medInfo.descripcion}</p>
                <div className="flex flex-wrap gap-1.5">
                  {medInfo.indicaciones.map((ind: string) => (
                    <Badge key={ind} className="bg-primary/10 text-primary border-primary/20 border text-xs">{ind}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── CHECKLIST COMPARATIVO ── */}
            <Card className="border border-border/50 shadow-sm rounded-2xl">
              <button className="w-full px-5 py-4 flex items-center justify-between"
                onClick={() => setShowIngr(!showIngr)}>
                <div>
                  <h3 className="font-bold text-foreground text-left flex items-center gap-2">
                    <Scan className="w-4 h-4 text-primary" />Checklist de Ingredientes
                  </h3>
                  {otroMed && <p className="text-xs text-muted-foreground text-left mt-0.5">{medInfo.nombre} vs. {otroMed.nombre}</p>}
                </div>
                {showIngr ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>

              {showIngr && (
                <CardContent className="px-5 pb-5 pt-0">
                  {/* Headers tabla */}
                  <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-3 px-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Componente</p>
                    <p className="text-xs font-bold text-center text-primary uppercase tracking-wide">{medInfo.nombre}</p>
                    <p className="text-xs font-bold text-center text-secondary uppercase tracking-wide">{otroMed?.nombre}</p>
                  </div>

                  <div className="space-y-1.5">
                    {comparativa.map((ing: any, i: number) => (
                      <div key={i} className={`grid grid-cols-[1fr_80px_80px] gap-2 items-center p-3 rounded-xl transition-colors ${
                        ing.presente && ing.enOtro ? "bg-green-50 border border-green-100" :
                        !ing.presente && !ing.enOtro ? "bg-muted/20" :
                        "bg-yellow-50 border border-yellow-100"
                      }`}>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{ing.nombre}</p>
                          <p className="text-xs text-muted-foreground leading-tight mt-0.5">{ing.descripcion}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          {ing.presente
                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                            : <XCircle className="w-5 h-5 text-gray-300" />
                          }
                          <span className="text-xs font-medium" style={{ color: ing.presente ? '#16a34a' : '#9ca3af' }}>
                            {ing.presente ? "Sí" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          {ing.enOtro
                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                            : <XCircle className="w-5 h-5 text-gray-300" />
                          }
                          <span className="text-xs font-medium" style={{ color: ing.enOtro ? '#16a34a' : '#9ca3af' }}>
                            {ing.enOtro ? "Sí" : "No"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conclusión */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-800">Son bioequivalentes ✅</p>
                        <p className="text-xs text-green-700 mt-1">
                          Ambos contienen <strong>Sulfato de Salbutamol 100 mcg/dosis</strong> como principio activo.
                          Tienen el mismo efecto terapéutico y pueden sustituirse entre sí bajo supervisión médica.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* ── EQUIVALENTES POR PAÍS ── */}
            <Card className="border border-border/50 shadow-sm rounded-2xl">
              <button className="w-full px-5 py-4 flex items-center justify-between"
                onClick={() => setShowEquiv(!showEquiv)}>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary" />
                  Equivalentes en el Mundo
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20 border text-xs">
                    {medInfo.equivalentes.length} países
                  </Badge>
                </h3>
                {showEquiv ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {showEquiv && (
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="space-y-2">
                    {medInfo.equivalentes.map((eq: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{eq.pais.split(" ")[0]}</span>
                          <div>
                            <p className="text-xs font-bold text-foreground">{eq.pais.split(" ").slice(1).join(" ")}</p>
                            <p className="text-xs text-muted-foreground">{eq.laboratorio}</p>
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs font-semibold">
                          {eq.nombre}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* ── FARMACIAS CERCANAS ── */}
            <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4" />Farmacias Cercanas
                </h3>
                <p className="text-xs text-green-100 mt-0.5">Encontrá dónde comprar {medInfo.nombre} cerca de vos</p>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-1.5 text-sm"
                    onClick={() => window.open(`https://www.google.com/maps/search/farmacia+${encodeURIComponent(medInfo.nombre)}`, "_blank")}>
                    <MapPin className="w-4 h-4" />Google Maps
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-1.5 text-sm border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => navigate("/doctores")}>
                    <Video className="w-4 h-4" />Ver Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                <strong>Aviso médico:</strong> Esta herramienta es informativa. Consultá siempre con un médico o farmacéutico antes de sustituir cualquier medicamento.
              </p>
            </div>

            {/* Botones finales */}
            <div className="space-y-3 pb-8">
              <Button className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl gap-2"
                onClick={() => { setMode("inicio"); setResultado(null); setImagePreview(""); }}>
                <Scan className="w-4 h-4" />Escanear otro medicamento
              </Button>
              <Button variant="outline" className="w-full py-3 rounded-xl border-border/50"
                onClick={() => navigate("/doctores")}>
                Consultar con un médico
              </Button>
            </div>
          </div>
        )}

        {/* ══ ERROR ══ */}
        {mode === "error" && (
          <div className="max-w-lg mx-auto px-4 py-12 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
            <p className="text-muted-foreground text-sm mb-6">{errorMsg || "Intentá de nuevo con mejor iluminación."}</p>
            <div className="space-y-3">
              <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-white"
                onClick={() => { setMode("inicio"); setErrorMsg(""); }}>
                Volver a intentar
              </Button>
              <Button variant="outline" className="w-full rounded-xl gap-2"
                onClick={() => { setMode("inicio"); setErrorMsg(""); setTimeout(() => fileRef.current?.click(), 200); }}>
                <Upload className="w-4 h-4" />Subir foto en su lugar
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
