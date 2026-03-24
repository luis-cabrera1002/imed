import { useState, useRef } from "react";
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

const MEDICINE_DB: Record<string, any> = {
  "Butosol": {
    nombre: "Butosol",
    nombreComercial: "Butosol®",
    laboratorio: "Grünenthal Guatemala",
    ingredienteActivo: "Sulfato de Salbutamol",
    concentracion: "100 mcg/dosis",
    tipo: "Broncodilatador β2-agonista de acción corta (SABA)",
    color: "rojo",
    emoji: "🔴",
    descripcion: "Inhalador de rescate de uso común en Guatemala y Centroamérica. Mismo principio activo que el Ventolin/Salbutamol pero con distribución local.",
    indicaciones: ["Asma bronquial", "EPOC", "Broncoespasmo agudo", "Bronquitis obstructiva"],
    ingredientes: [
      { nombre: "Sulfato de Salbutamol (Albuterol)", presente: true,  descripcion: "Principio activo — relaja los músculos de las vías respiratorias" },
      { nombre: "Propelente HFA-134a",               presente: true,  descripcion: "Propelente ecológico sin CFC" },
      { nombre: "Etanol anhidro",                     presente: true,  descripcion: "Cosolvente farmacéutico" },
      { nombre: "Ácido oleico",                       presente: false, descripcion: "Lubricante (ausente en esta fórmula)" },
      { nombre: "Corticosteroide inhalado",           presente: false, descripcion: "No es inhalador de mantenimiento" },
      { nombre: "Ipratropio bromuro",                 presente: false, descripcion: "No es combinado — solo salbutamol" },
    ],
    equivalentes: [
      { pais: "🇺🇸 EE.UU.",      nombre: "Ventolin HFA / ProAir HFA",       laboratorio: "GSK / Teva" },
      { pais: "🇪🇸 España",       nombre: "Ventolin / Salbutamol Sandoz",     laboratorio: "GSK / Sandoz" },
      { pais: "🇫🇷 Francia",      nombre: "Ventoline / Airomir",              laboratorio: "GSK / Teva" },
      { pais: "🇩🇪 Alemania",     nombre: "Sultanol / Salbutamol-ratiopharm", laboratorio: "GSK / Ratiopharm" },
      { pais: "🇲🇽 México",       nombre: "Salbulair / Asmalair",             laboratorio: "Asofarma / Chinoin" },
      { pais: "🇨🇴 Colombia",     nombre: "Ventolin / Salbutamol MK",         laboratorio: "GSK / Tecnoquímicas" },
      { pais: "🇦🇷 Argentina",    nombre: "Aldobronquial / Ventolin",          laboratorio: "Roemmers / GSK" },
      { pais: "🇧🇷 Brasil",       nombre: "Aerolin / Salbulair",              laboratorio: "GSK / Aché" },
      { pais: "🇬🇧 Reino Unido",  nombre: "Ventolin Evohaler / Salamol",      laboratorio: "GSK / Norton" },
      { pais: "🇨🇦 Canadá",       nombre: "Ventolin HFA / Airomir",           laboratorio: "GSK / Teva" },
    ]
  },
  "Salbutamol": {
    nombre: "Salbutamol",
    nombreComercial: "Ventolin® / Genérico",
    laboratorio: "GlaxoSmithKline / Múltiples",
    ingredienteActivo: "Sulfato de Salbutamol",
    concentracion: "100 mcg/dosis",
    tipo: "Broncodilatador β2-agonista de acción corta (SABA)",
    color: "azul",
    emoji: "🔵",
    descripcion: "Inhalador broncodilatador de rescate más usado en el mundo. Disponible en prácticamente todos los países como Ventolin o genérico.",
    indicaciones: ["Asma bronquial", "EPOC", "Broncoespasmo agudo", "Profilaxis de asma por ejercicio"],
    ingredientes: [
      { nombre: "Sulfato de Salbutamol (Albuterol)", presente: true,  descripcion: "Principio activo — relaja los músculos de las vías respiratorias" },
      { nombre: "Propelente HFA-134a",               presente: true,  descripcion: "Propelente ecológico sin CFC" },
      { nombre: "Etanol anhidro",                     presente: true,  descripcion: "Cosolvente farmacéutico" },
      { nombre: "Ácido oleico",                       presente: true,  descripcion: "Lubricante para válvula dosificadora" },
      { nombre: "Corticosteroide inhalado",           presente: false, descripcion: "No es inhalador de mantenimiento" },
      { nombre: "Ipratropio bromuro",                 presente: false, descripcion: "No es combinado — solo salbutamol" },
    ],
    equivalentes: [
      { pais: "🇬🇹 Guatemala",    nombre: "Butosol / Salbulair GT",     laboratorio: "Grünenthal / Asofarma" },
      { pais: "🇺🇸 EE.UU.",       nombre: "ProAir HFA / Proventil HFA", laboratorio: "Teva / Merck" },
      { pais: "🇲🇽 México",       nombre: "Salbulair / Sultanol",        laboratorio: "Asofarma / GSK" },
      { pais: "🇦🇷 Argentina",    nombre: "Aldobronquial / Broncovaleas", laboratorio: "Roemmers / Chiesi" },
      { pais: "🇨🇴 Colombia",     nombre: "Salbutamol MK / Aldolair",    laboratorio: "Tecnoquímicas / MK" },
      { pais: "🇧🇷 Brasil",       nombre: "Aerolin / Salbulair",         laboratorio: "GSK / Aché" },
      { pais: "🇨🇱 Chile",        nombre: "Salbutamol Genfar / Servamol",laboratorio: "Genfar / Saval" },
      { pais: "🇵🇪 Perú",         nombre: "Salbutamol Genfar / Aldolair",laboratorio: "Genfar / Farmindustria" },
    ]
  }
};

type Mode = "inicio" | "analizando" | "resultado" | "error";

export default function MedicineScanner() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const fileRef   = useRef<HTMLInputElement>(null);
  const camRef    = useRef<HTMLInputElement>(null);

  const [mode, setMode]               = useState<Mode>("inicio");
  const [resultado, setResultado]     = useState<{ clase: string; confianza: number } | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showIngr, setShowIngr]       = useState(true);
  const [showEquiv, setShowEquiv]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");

  // Analiza la imagen con Claude API (vision)
  async function analyzeWithClaude(base64: string, mimeType: string) {
    const response = await fetch("https://usmjxdoboaxpbmuoproo.supabase.co/functions/v1/analyze-medicine", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbWp4ZG9ib2F4cGJtdW9wcm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODE5NTYsImV4cCI6MjA4OTQ1Nzk1Nn0.KnBC3PNZIEpvtn3jSw8M6octoXcBHFh1XPb7CQsW968" },
      body: JSON.stringify({ image: base64, mimeType })
    });

    const data = await response.json();
    return data;
  }

  async function processImage(file: File) {
    setMode("analizando");

    try {
      // Convertir a base64 y preview al mismo tiempo
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      setImagePreview(dataUrl);
      // Convertir a JPEG via canvas con timeout de seguridad
      const convertToJpeg = (src: string): Promise<string> =>
        new Promise((res) => {
          const img = new Image();
          const timeout = setTimeout(() => res(src), 5000);
          img.onload = () => {
            clearTimeout(timeout);
            try {
              const MAX = 1024;
              const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
              const canvas = document.createElement("canvas");
              canvas.width = Math.round(img.naturalWidth * scale);
              canvas.height = Math.round(img.naturalHeight * scale);
              canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
              res(canvas.toDataURL("image/jpeg", 0.8));
            } catch { res(src); }
          };
          img.onerror = () => { clearTimeout(timeout); res(src); };
          img.src = src;
        });
      const jpegDataUrl = await convertToJpeg(dataUrl);
      const base64 = jpegDataUrl.split(",")[1].replace(/\s/g, "");
      const mimeType = "image/jpeg" as "image/jpeg";
      const result = await analyzeWithClaude(base64, mimeType);

      if (result.nombre === "Desconocido" || result.confianza < 10) {
        setErrorMsg("No pudimos identificar el medicamento. Intentá con mejor iluminación y enfocando bien la etiqueta.");
        setMode("error");
        return;
      }

      setResultado({ clase: result.nombre, confianza: result.confianza });
      setMode("resultado");
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al analizar la imagen. Revisá tu conexión e intentá de nuevo.");
      setMode("error");
    }
  }

  const medInfo = resultado ? MEDICINE_DB[resultado.clase] : null;
  const otroMed = resultado
    ? (Object.values(MEDICINE_DB).find((m: any) => m.nombre !== resultado.clase) as any)
    : null;

  const comparativa = medInfo && otroMed
    ? medInfo.ingredientes.map((ing: any) => ({
        ...ing,
        enOtro: (otroMed.ingredientes as any[]).find(i => i.nombre === ing.nombre)?.presente ?? false,
      }))
    : [];

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
                    { n: "1", t: "Tomá una foto clara del medicamento o subí una imagen" },
                    { n: "2", t: "La IA identifica el medicamento en segundos" },
                    { n: "3", t: "Ves el checklist comparativo de ingredientes activos" },
                    { n: "4", t: "Encontrás su equivalente en más de 10 países" },
                  ].map(({ n, t }) => (
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
              {/* Cámara directa en mobile */}
              <Button
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-md gap-2 text-base"
                onClick={() => camRef.current?.click()}
              >
                <Camera className="w-5 h-5" />Tomar Foto
              </Button>
              <input
                ref={camRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processImage(f); }}
              />

              <Button
                variant="outline"
                className="w-full py-4 rounded-xl gap-2 text-base border-border/50"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-5 h-5" />Subir Foto de Galería
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processImage(f); }}
              />
            </div>
          </div>
        )}

        {/* ══ ANALIZANDO ══ */}
        {mode === "analizando" && (
          <div className="max-w-lg mx-auto px-4 py-12 text-center">
            {imagePreview && (
              <img src={imagePreview}
                className="w-44 h-44 rounded-2xl object-cover mx-auto mb-6 shadow-lg border-4 border-primary/20"
                alt="analizando" />
            )}
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Analizando con IA...</h2>
            <p className="text-muted-foreground text-sm">Identificando el medicamento y buscando equivalentes</p>
            <p className="text-xs text-muted-foreground mt-2">Esto toma unos segundos ☕</p>
          </div>
        )}

        {/* ══ RESULTADO ══ */}
        {mode === "resultado" && resultado && medInfo && (
          <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

            {/* Header resultado */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
              {imagePreview && (
                <img src={imagePreview}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-green-200 flex-shrink-0"
                  alt="resultado" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-600">
                    Identificado con {resultado.confianza}% de certeza
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{medInfo.emoji} {medInfo.nombre}</h2>
                <p className="text-sm text-primary font-medium">{medInfo.ingredienteActivo} · {medInfo.concentracion}</p>
              </div>
            </div>

            {/* Info */}
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
                  {otroMed && (
                    <p className="text-xs text-muted-foreground text-left mt-0.5">
                      {medInfo.nombre} vs. {otroMed.nombre}
                    </p>
                  )}
                </div>
                {showIngr
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                }
              </button>

              {showIngr && (
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="grid grid-cols-[1fr_70px_70px] gap-2 mb-3 px-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Componente</p>
                    <p className="text-xs font-bold text-center text-primary uppercase tracking-wide">{medInfo.nombre}</p>
                    <p className="text-xs font-bold text-center text-secondary uppercase tracking-wide">{otroMed?.nombre}</p>
                  </div>
                  <div className="space-y-1.5">
                    {comparativa.map((ing: any, i: number) => (
                      <div key={i} className={`grid grid-cols-[1fr_70px_70px] gap-2 items-center p-3 rounded-xl ${
                        ing.presente && ing.enOtro   ? "bg-green-50 border border-green-100" :
                        !ing.presente && !ing.enOtro ? "bg-muted/20" :
                                                       "bg-yellow-50 border border-yellow-100"
                      }`}>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{ing.nombre}</p>
                          <p className="text-xs text-muted-foreground leading-tight mt-0.5">{ing.descripcion}</p>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          {ing.presente
                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                            : <XCircle className="w-5 h-5 text-gray-300" />
                          }
                          <span className={`text-xs font-bold ${ing.presente ? "text-green-600" : "text-gray-400"}`}>
                            {ing.presente ? "Sí" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          {ing.enOtro
                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                            : <XCircle className="w-5 h-5 text-gray-300" />
                          }
                          <span className={`text-xs font-bold ${ing.enOtro ? "text-green-600" : "text-gray-400"}`}>
                            {ing.enOtro ? "Sí" : "No"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-800">Son bioequivalentes ✅</p>
                        <p className="text-xs text-green-700 mt-1">
                          Ambos contienen <strong>Sulfato de Salbutamol 100 mcg/dosis</strong>.
                          Mismo efecto terapéutico — pueden sustituirse bajo supervisión médica.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* ── EQUIVALENTES ── */}
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
                {showEquiv
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                }
              </button>
              {showEquiv && (
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="space-y-2">
                    {medInfo.equivalentes.map((eq: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
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

            {/* Farmacias */}
            <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4" />Farmacias Cercanas
                </h3>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-1.5 text-sm"
                    onClick={() => window.open(
                      `https://www.google.com/maps/search/farmacia+${encodeURIComponent(medInfo.nombre)}`,
                      "_blank"
                    )}>
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
                <strong>Aviso médico:</strong> Esta herramienta es informativa.
                Consultá siempre con un médico o farmacéutico antes de sustituir cualquier medicamento.
              </p>
            </div>

            {/* Botones finales */}
            <div className="space-y-3 pb-8">
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

        {/* ══ ERROR ══ */}
        {mode === "error" && (
          <div className="max-w-lg mx-auto px-4 py-12 text-center">
            {imagePreview && (
              <img src={imagePreview}
                className="w-32 h-32 rounded-2xl object-cover mx-auto mb-4 shadow-lg opacity-60"
                alt="error" />
            )}
            <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No pudimos identificarlo</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              {errorMsg || "Intentá con mejor iluminación y enfocando bien la etiqueta del medicamento."}
            </p>
            <div className="space-y-3">
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold gap-2"
                onClick={() => { setMode("inicio"); setErrorMsg(""); setImagePreview(""); }}
              >
                <Camera className="w-4 h-4" />Intentar de nuevo
              </Button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
