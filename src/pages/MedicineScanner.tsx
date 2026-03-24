import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Camera, Upload, Scan, CheckCircle, XCircle,
  MapPin, AlertCircle, RefreshCw, Info, ChevronDown, ChevronUp
} from "lucide-react";

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/1F6MFz8rg/";

// Base de datos de medicamentos con ingredientes
const MEDICINE_DB: Record<string, {
  nombre: string;
  nombreComercial: string;
  ingredienteActivo: string;
  concentracion: string;
  tipo: string;
  descripcion: string;
  ingredientes: { nombre: string; presente: boolean; descripcion: string }[];
  equivalentes: { pais: string; nombre: string; laboratorio: string }[];
  color: string;
  emoji: string;
}> = {
  "Butosol": {
    nombre: "Butosol",
    nombreComercial: "Butosol",
    ingredienteActivo: "Salbutamol",
    concentracion: "100 mcg/dosis",
    tipo: "Broncodilatador de acción corta",
    descripcion: "Inhalador de rescate para alivio rápido del asma y EPOC. Disponible principalmente en Guatemala y Centroamérica.",
    color: "blue",
    emoji: "💙",
    ingredientes: [
      { nombre: "Salbutamol (Albuterol)", presente: true, descripcion: "Broncodilatador β2-agonista de acción corta" },
      { nombre: "HFA-134a (propelente)", presente: true, descripcion: "Propelente ecológico sin CFC" },
      { nombre: "Etanol anhidro", presente: true, descripcion: "Solvente farmacéutico" },
      { nombre: "Ácido oleico", presente: false, descripcion: "Lubricante (presente en algunas fórmulas)" },
      { nombre: "Ipratropio", presente: false, descripcion: "Broncodilatador adicional (no incluido)" },
      { nombre: "Corticosteroide", presente: false, descripcion: "No es un inhalador de mantenimiento" },
    ],
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Proventil HFA / Ventolin HFA", laboratorio: "GSK / Bausch" },
      { pais: "🇪🇸 España", nombre: "Ventolin / Salbutamol Sandoz", laboratorio: "GSK / Sandoz" },
      { pais: "🇫🇷 Francia", nombre: "Ventoline / Airomir", laboratorio: "GSK / Teva" },
      { pais: "🇲🇽 México", nombre: "Salbulair / Ventolin", laboratorio: "Asofarma / GSK" },
      { pais: "🇦🇷 Argentina", nombre: "Aldobronquial / Ventolin", laboratorio: "Roemmers / GSK" },
      { pais: "🇨🇴 Colombia", nombre: "Ventolin / Salbutamol MK", laboratorio: "GSK / MK" },
    ]
  },
  "Salbutamol": {
    nombre: "Salbutamol",
    nombreComercial: "Ventolin / Genérico",
    ingredienteActivo: "Salbutamol",
    concentracion: "100 mcg/dosis",
    tipo: "Broncodilatador de acción corta",
    descripcion: "Inhalador broncodilatador genérico ampliamente disponible en Europa y América. Mismo principio activo que Butosol.",
    color: "blue",
    emoji: "💊",
    ingredientes: [
      { nombre: "Salbutamol (Albuterol)", presente: true, descripcion: "Broncodilatador β2-agonista de acción corta" },
      { nombre: "HFA-134a (propelente)", presente: true, descripcion: "Propelente ecológico sin CFC" },
      { nombre: "Etanol anhidro", presente: true, descripcion: "Solvente farmacéutico" },
      { nombre: "Ácido oleico", presente: true, descripcion: "Lubricante para válvula dosificadora" },
      { nombre: "Ipratropio", presente: false, descripcion: "Broncodilatador adicional (no incluido)" },
      { nombre: "Corticosteroide", presente: false, descripcion: "No es un inhalador de mantenimiento" },
    ],
    equivalentes: [
      { pais: "🇬🇹 Guatemala", nombre: "Butosol / Salbulair", laboratorio: "Grünenthal / Asofarma" },
      { pais: "🇺🇸 EE.UU.", nombre: "Proventil HFA / Ventolin HFA", laboratorio: "GSK / Bausch" },
      { pais: "🇲🇽 México", nombre: "Salbulair / Asmalair", laboratorio: "Asofarma" },
      { pais: "🇦🇷 Argentina", nombre: "Aldobronquial / Ventolin", laboratorio: "Roemmers / GSK" },
      { pais: "🇨🇴 Colombia", nombre: "Salbutamol MK / Ventolin", laboratorio: "MK / GSK" },
      { pais: "🇧🇷 Brasil", nombre: "Aerolin / Salbulair", laboratorio: "GSK / Aché" },
    ]
  }
};

export default function MedicineScanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"inicio" | "camara" | "resultado" | "error">("inicio");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [resultado, setResultado] = useState<{ clase: string; confianza: number } | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showIngredients, setShowIngredients] = useState(true);
  const [showEquivalentes, setShowEquivalentes] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [tmModel, setTmModel] = useState<any>(null);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  async function loadModel() {
    setLoadingModel(true);
    try {
      // @ts-ignore
      const tmImage = window.tmImage;
      if (!tmImage) throw new Error("Teachable Machine no cargado");
      const model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
      setTmModel(model);
      setModelLoaded(true);
    } catch (err) {
      console.error("Error cargando modelo:", err);
    }
    setLoadingModel(false);
  }

  async function startCamera() {
    if (!modelLoaded) await loadModel();
    setMode("camara");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch {
      setMode("error");
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      setStreamActive(false);
    }
  }

  async function captureAndScan() {
    if (!videoRef.current || !canvasRef.current || !tmModel) return;
    setScanning(true);
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setImagePreview(canvas.toDataURL("image/jpeg"));
    await analyzeImage(canvas);
  }

  async function analyzeImage(source: HTMLCanvasElement | HTMLImageElement) {
    if (!tmModel) return;
    try {
      const predictions = await tmModel.predict(source);
      const best = predictions.reduce((a: any, b: any) => a.probability > b.probability ? a : b);
      stopCamera();
      setResultado({ clase: best.className, confianza: Math.round(best.probability * 100) });
      setMode("resultado");
    } catch (err) {
      setMode("error");
    }
    setScanning(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!modelLoaded) await loadModel();
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target?.result as string;
      setImagePreview(src);
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
        await analyzeImage(canvas);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  const medInfo = resultado ? MEDICINE_DB[resultado.clase] : null;
  const otroMed = resultado ? Object.values(MEDICINE_DB).find(m => m.nombre !== resultado.clase) : null;

  // Comparativa de ingredientes
  const getComparativa = () => {
    if (!medInfo || !otroMed) return [];
    return medInfo.ingredientes.map(ing => {
      const enOtro = otroMed.ingredientes.find(i => i.nombre === ing.nombre);
      return {
        ...ing,
        enOtro: enOtro?.presente ?? false,
      };
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full border border-border/50 shadow-sm">
            <CardContent className="p-8 text-center">
              <Scan className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Escáner de Medicamentos</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Iniciá sesión para usar el escáner y encontrar equivalentes de tus medicamentos en cualquier país.
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
  }

  return (
    <>
      {/* Cargar Teachable Machine SDK */}
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js" />

      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">

          {/* ── INICIO ── */}
          {mode === "inicio" && (
            <div className="max-w-lg mx-auto px-4 py-8">
              {/* Hero */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Scan className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Escáner de Medicamentos</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Fotografiá tu medicamento y encontrá su equivalente en cualquier país del mundo.
                  Compará ingredientes activos al instante.
                </p>
              </div>

              {/* Cómo funciona */}
              <Card className="border border-border/50 shadow-sm rounded-2xl mb-6">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />¿Cómo funciona?
                  </h3>
                  <div className="space-y-3">
                    {[
                      { num: "1", txt: "Tomá una foto clara del medicamento o subí una imagen", icon: Camera },
                      { num: "2", txt: "La IA identifica el medicamento en segundos", icon: Scan },
                      { num: "3", txt: "Ves la comparativa de ingredientes activos vs. equivalentes", icon: CheckCircle },
                      { num: "4", txt: "Encontrás dónde comprarlo cerca de tu ubicación", icon: MapPin },
                    ].map(({ num, txt, icon: Icon }) => (
                      <div key={num} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{num}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">{txt}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medicamentos soportados */}
              <Card className="border border-border/50 shadow-sm rounded-2xl mb-6">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-3">Medicamentos detectables</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(MEDICINE_DB).map(m => (
                      <Badge key={m.nombre} className="bg-primary/10 text-primary border-primary/20 border">
                        {m.emoji} {m.nombre}
                      </Badge>
                    ))}
                    <Badge className="bg-muted text-muted-foreground border border-border">
                      + más próximamente
                    </Badge>
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
                  {loadingModel ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" />Cargando IA...</>
                  ) : (
                    <><Camera className="w-5 h-5" />Usar Cámara</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-4 rounded-xl gap-2 text-base border-border/50"
                  onClick={() => { if (!modelLoaded) loadModel(); fileRef.current?.click(); }}
                >
                  <Upload className="w-5 h-5" />Subir Foto
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {/* ── CÁMARA ── */}
          {mode === "camara" && (
            <div className="max-w-lg mx-auto px-4 py-6">
              <div className="text-center mb-4">
                <h2 className="font-bold text-foreground text-lg">Enfocá el medicamento</h2>
                <p className="text-sm text-muted-foreground">Asegurate que el medicamento esté bien iluminado y centrado</p>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl mb-4">
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {/* Guía visual */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-4 border-white/60 rounded-2xl" />
                </div>
                {scanning && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-3" />
                      <p className="font-semibold">Analizando...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl gap-2"
                  onClick={captureAndScan}
                  disabled={scanning || !streamActive}
                >
                  <Scan className="w-5 h-5" />
                  {scanning ? "Analizando..." : "Escanear"}
                </Button>
                <Button variant="outline" className="w-full py-3 rounded-xl border-border/50"
                  onClick={() => { stopCamera(); setMode("inicio"); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* ── RESULTADO ── */}
          {mode === "resultado" && resultado && medInfo && (
            <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

              {/* Header resultado */}
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img src={imagePreview} className="w-16 h-16 rounded-xl object-cover border border-border/50" alt="scan" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Medicamento identificado</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{medInfo.nombre}</h2>
                  <p className="text-sm text-primary font-medium">{medInfo.ingredienteActivo} · {medInfo.concentracion}</p>
                </div>
              </div>

              {/* Info principal */}
              <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{medInfo.tipo}</p>
                    <p className="text-xs text-muted-foreground">{medInfo.concentracion}</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-none text-sm font-bold">
                    {resultado.confianza}% seguro
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{medInfo.descripcion}</p>
                </CardContent>
              </Card>

              {/* Comparativa ingredientes */}
              <Card className="border border-border/50 shadow-sm rounded-2xl">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between"
                  onClick={() => setShowIngredients(!showIngredients)}
                >
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Scan className="w-4 h-4 text-primary" />
                    Comparativa de Ingredientes
                    {otroMed && <span className="text-xs text-muted-foreground font-normal">vs. {otroMed.nombre}</span>}
                  </h3>
                  {showIngredients ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {showIngredients && (
                  <CardContent className="px-5 pb-5 pt-0">
                    {/* Headers */}
                    <div className="grid grid-cols-3 gap-2 mb-3 px-2">
                      <p className="text-xs font-semibold text-muted-foreground">Ingrediente</p>
                      <p className="text-xs font-semibold text-center text-primary">{medInfo.nombre}</p>
                      <p className="text-xs font-semibold text-center text-secondary">{otroMed?.nombre}</p>
                    </div>
                    <div className="space-y-2">
                      {getComparativa().map((ing, i) => (
                        <div key={i} className={`grid grid-cols-3 gap-2 items-center p-2.5 rounded-xl ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                          <div>
                            <p className="text-xs font-medium text-foreground leading-tight">{ing.nombre}</p>
                            <p className="text-xs text-muted-foreground leading-tight">{ing.descripcion}</p>
                          </div>
                          <div className="flex justify-center">
                            {ing.presente
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : <XCircle className="w-5 h-5 text-gray-300" />
                            }
                          </div>
                          <div className="flex justify-center">
                            {ing.enOtro
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : <XCircle className="w-5 h-5 text-gray-300" />
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-xs text-green-700 font-medium flex items-start gap-1.5">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Mismo ingrediente activo — Son bioequivalentes y tienen el mismo efecto terapéutico.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Equivalentes por país */}
              <Card className="border border-border/50 shadow-sm rounded-2xl">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between"
                  onClick={() => setShowEquivalentes(!showEquivalentes)}
                >
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-secondary" />
                    Equivalentes por País
                  </h3>
                  {showEquivalentes ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {showEquivalentes && (
                  <CardContent className="px-5 pb-5 pt-0">
                    <div className="space-y-2">
                      {medInfo.equivalentes.map((eq, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{eq.pais.split(" ")[0]}</span>
                            <div>
                              <p className="text-xs font-medium text-foreground">{eq.pais.split(" ").slice(1).join(" ")}</p>
                              <p className="text-xs text-muted-foreground">{eq.laboratorio}</p>
                            </div>
                          </div>
                          <Badge className="bg-secondary/10 text-secondary border-secondary/20 border text-xs">
                            {eq.nombre}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Farmacias cercanas */}
              <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />Farmacias Cercanas
                  </h3>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground mb-4">
                    Encontrá dónde comprar <strong>{medInfo.nombre}</strong> o sus equivalentes cerca de vos.
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
                    onClick={() => window.open(
                      `https://www.google.com/maps/search/farmacia+${encodeURIComponent(medInfo.nombre)}`,
                      "_blank"
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    Buscar en Google Maps
                  </Button>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  Esta herramienta es solo informativa. Siempre consultá con un médico o farmacéutico antes de sustituir un medicamento.
                </p>
              </div>

              {/* Botones finales */}
              <div className="space-y-3 pb-6">
                <Button
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl gap-2"
                  onClick={() => { setMode("inicio"); setResultado(null); setImagePreview(""); }}
                >
                  <Scan className="w-4 h-4" />Escanear otro medicamento
                </Button>
                <Button variant="outline" className="w-full py-3 rounded-xl border-border/50"
                  onClick={() => navigate("/doctores")}>
                  Consultar con un médico
                </Button>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {mode === "error" && (
            <div className="max-w-lg mx-auto px-4 py-12 text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No pudimos acceder a la cámara</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Verificá que le diste permiso a la app para usar la cámara, o intentá subiendo una foto.
              </p>
              <div className="space-y-3">
                <Button className="w-full rounded-xl" onClick={() => setMode("inicio")}>
                  Volver e intentar de nuevo
                </Button>
                <Button variant="outline" className="w-full rounded-xl gap-2"
                  onClick={() => { setMode("inicio"); setTimeout(() => fileRef.current?.click(), 100); }}>
                  <Upload className="w-4 h-4" />Subir foto en su lugar
                </Button>
              </div>
            </div>
          )}

        </main>
        <Footer />
      </div>
    </>
  );
}
