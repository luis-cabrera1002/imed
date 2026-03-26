import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Globe, Search, ArrowLeft, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const MEDICINE_DB: Record<string, any> = {
  "Butosol": {
    nombre: "Butosol", ingredienteActivo: "Sulfato de Salbutamol", emoji: "🔴",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Ventolin HFA / ProAir HFA", laboratorio: "GSK / Teva" },
      { pais: "🇪🇸 España", nombre: "Ventolin / Salbutamol Sandoz", laboratorio: "GSK / Sandoz" },
      { pais: "🇫🇷 Francia", nombre: "Ventoline / Airomir", laboratorio: "GSK / Teva" },
      { pais: "🇩🇪 Alemania", nombre: "Sultanol / Salbutamol-ratiopharm", laboratorio: "GSK / Ratiopharm" },
      { pais: "🇲🇽 México", nombre: "Salbulair / Asmalair", laboratorio: "Asofarma / Chinoin" },
      { pais: "🇨🇴 Colombia", nombre: "Ventolin / Salbutamol MK", laboratorio: "GSK / Tecnoquímicas" },
      { pais: "🇦🇷 Argentina", nombre: "Aldobronquial / Ventolin", laboratorio: "Roemmers / GSK" },
      { pais: "🇧🇷 Brasil", nombre: "Aerolin / Salbulair", laboratorio: "GSK / Aché" },
      { pais: "🇬🇧 Reino Unido", nombre: "Ventolin Evohaler / Salamol", laboratorio: "GSK / Norton" },
      { pais: "🇨🇦 Canadá", nombre: "Ventolin HFA / Airomir", laboratorio: "GSK / Teva" },
    ]
  },
  "Salbutamol": {
    nombre: "Salbutamol", ingredienteActivo: "Sulfato de Salbutamol", emoji: "🔵",
    equivalentes: [
      { pais: "🇬🇹 Guatemala", nombre: "Butosol / Salbulair GT", laboratorio: "Grünenthal / Asofarma" },
      { pais: "🇺🇸 EE.UU.", nombre: "ProAir HFA / Proventil HFA", laboratorio: "Teva / Merck" },
      { pais: "🇲🇽 México", nombre: "Salbulair / Sultanol", laboratorio: "Asofarma / GSK" },
      { pais: "🇦🇷 Argentina", nombre: "Aldobronquial / Broncovaleas", laboratorio: "Roemmers / Chiesi" },
      { pais: "🇨🇴 Colombia", nombre: "Salbutamol MK / Aldolair", laboratorio: "Tecnoquímicas / MK" },
      { pais: "🇧🇷 Brasil", nombre: "Aerolin / Salbulair", laboratorio: "GSK / Aché" },
      { pais: "🇪🇸 España", nombre: "Ventolin / Salbutamol EFG", laboratorio: "GSK / Genérico" },
    ]
  }
};

export default function ModoViajero() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [paisFiltro, setPaisFiltro] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  const paises = Array.from(new Set(
    Object.values(MEDICINE_DB).flatMap((m: any) => m.equivalentes.map((e: any) => e.pais))
  )).sort();

  function buscar() {
    const query = busqueda.trim().toLowerCase();
    if (!query) return;
    const found = Object.values(MEDICINE_DB).find((m: any) =>
      m.nombre.toLowerCase().includes(query) ||
      m.ingredienteActivo.toLowerCase().includes(query) ||
      m.equivalentes.some((e: any) => e.nombre.toLowerCase().includes(query))
    );
    setResultado(found || null);
  }

  const equivalentesFiltrados = resultado
    ? (paisFiltro ? resultado.equivalentes.filter((e: any) => e.pais === paisFiltro) : resultado.equivalentes)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Modo Viajero</h1>
          <p className="text-muted-foreground text-sm">Encontrá el equivalente de tu medicamento en cualquier país</p>
        </div>
        <Card className="border border-border/50 shadow-sm rounded-2xl mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Ej: Butosol, Salbutamol..." value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onKeyDown={e => e.key === "Enter" && buscar()}
                className="rounded-xl" />
              <Button onClick={buscar} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl px-4">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            {resultado && (
              <select className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={paisFiltro} onChange={e => setPaisFiltro(e.target.value)}>
                <option value="">Todos los paises</option>
                {paises.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </CardContent>
        </Card>
        {resultado ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <span className="text-3xl">{resultado.emoji}</span>
              <div>
                <p className="font-bold text-foreground text-lg">{resultado.nombre}</p>
                <p className="text-sm text-muted-foreground">{resultado.ingredienteActivo}</p>
              </div>
              <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 border">{equivalentesFiltrados.length} paises</Badge>
            </div>
            {equivalentesFiltrados.map((eq: any, i: number) => (
              <Card key={i} className="border border-border/50 shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{eq.pais.split(" ")[0]}</span>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">{eq.pais.split(" ").slice(1).join(" ")}</p>
                      <p className="text-xs text-muted-foreground">{eq.laboratorio}</p>
                    </div>
                  </div>
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20 border text-xs font-semibold">{eq.nombre}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : busqueda && (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No encontramos ese medicamento.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
