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
  },
  "Metformina": {
    nombre: "Metformina", ingredienteActivo: "Clorhidrato de Metformina", emoji: "🟡",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Glucophage / Fortamet", laboratorio: "Bristol-Myers Squibb / Shionogi" },
      { pais: "🇪🇸 España", nombre: "Dianben / Metformina EFG", laboratorio: "Merck / Genérico" },
      { pais: "🇲🇽 México", nombre: "Glucophage / Glafornil", laboratorio: "Merck / Silanes" },
      { pais: "🇨🇴 Colombia", nombre: "Glucophage / Metformina MK", laboratorio: "Merck / Tecnoquímicas" },
      { pais: "🇦🇷 Argentina", nombre: "Glucophage / Metral", laboratorio: "Merck / Raffo" },
      { pais: "🇧🇷 Brasil", nombre: "Glifage / Glucoformin", laboratorio: "Merck / Sanofi" },
      { pais: "🇬🇧 Reino Unido", nombre: "Glucophage / Metformin HCl", laboratorio: "Merck / Genérico" },
      { pais: "🇨🇦 Canadá", nombre: "Glucophage / Glumetza", laboratorio: "Merck / Santarus" },
    ]
  },
  "Losartán": {
    nombre: "Losartán", ingredienteActivo: "Losartán Potásico", emoji: "🔴",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Cozaar / Losartan generic", laboratorio: "Merck / Teva" },
      { pais: "🇪🇸 España", nombre: "Cozaar / Losartán EFG", laboratorio: "Merck / Genérico" },
      { pais: "🇲🇽 México", nombre: "Cozaar / Losartan MK", laboratorio: "Merck / Tecnoquímicas" },
      { pais: "🇦🇷 Argentina", nombre: "Cozaar / Losaprex", laboratorio: "Merck / Gador" },
      { pais: "🇨🇴 Colombia", nombre: "Cozaar / Losartan MK", laboratorio: "Merck / Tecnoquímicas" },
      { pais: "🇧🇷 Brasil", nombre: "Cozaar / Losartec", laboratorio: "Merck / EMS" },
      { pais: "🇬🇧 Reino Unido", nombre: "Cozaar / Losartan generic", laboratorio: "Merck / Sandoz" },
    ]
  },
  "Omeprazol": {
    nombre: "Omeprazol", ingredienteActivo: "Omeprazol", emoji: "🟠",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Prilosec / Zegerid", laboratorio: "AstraZeneca / Santarus" },
      { pais: "🇪🇸 España", nombre: "Losec / Omeprazol EFG", laboratorio: "AstraZeneca / Genérico" },
      { pais: "🇲🇽 México", nombre: "Losec / Prilosec", laboratorio: "AstraZeneca" },
      { pais: "🇦🇷 Argentina", nombre: "Losec / Ulcozol", laboratorio: "AstraZeneca / Gador" },
      { pais: "🇨🇴 Colombia", nombre: "Losec / Omeprazol MK", laboratorio: "AstraZeneca / Tecnoquímicas" },
      { pais: "🇧🇷 Brasil", nombre: "Losec / Omeprazol genérico", laboratorio: "AstraZeneca / EMS" },
      { pais: "🇬🇧 Reino Unido", nombre: "Losec / Omeprazole generic", laboratorio: "AstraZeneca / Sandoz" },
    ]
  },
  "Atorvastatina": {
    nombre: "Atorvastatina", ingredienteActivo: "Atorvastatina Cálcica", emoji: "🟤",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Lipitor / Atorvastatin generic", laboratorio: "Pfizer / Teva" },
      { pais: "🇪🇸 España", nombre: "Cardyl / Atorvastatina EFG", laboratorio: "Pfizer / Genérico" },
      { pais: "🇲🇽 México", nombre: "Lipitor / Liparex", laboratorio: "Pfizer / Asofarma" },
      { pais: "🇦🇷 Argentina", nombre: "Lipitor / Atorvar", laboratorio: "Pfizer / Roemmers" },
      { pais: "🇨🇴 Colombia", nombre: "Lipitor / Atorvastatina MK", laboratorio: "Pfizer / Tecnoquímicas" },
      { pais: "🇧🇷 Brasil", nombre: "Lipitor / Citalor", laboratorio: "Pfizer / EMS" },
      { pais: "🇬🇧 Reino Unido", nombre: "Lipitor / Atorvastatin generic", laboratorio: "Pfizer / Sandoz" },
    ]
  },
  "Amoxicilina": {
    nombre: "Amoxicilina", ingredienteActivo: "Amoxicilina Trihidrato", emoji: "🟢",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Amoxil / Trimox", laboratorio: "GSK / Apothecon" },
      { pais: "🇪🇸 España", nombre: "Amoxicilina EFG / Clamoxyl", laboratorio: "GSK / Genérico" },
      { pais: "🇲🇽 México", nombre: "Trimox / Amoxicilina MK", laboratorio: "Bristol / Tecnoquímicas" },
      { pais: "🇦🇷 Argentina", nombre: "Amoxidal / Amoxicilina genérico", laboratorio: "Roemmers / Genérico" },
      { pais: "🇨🇴 Colombia", nombre: "Amoxicilina MK / Amoxidal", laboratorio: "Tecnoquímicas / Roemmers" },
      { pais: "🇧🇷 Brasil", nombre: "Amoxil / Novocilin", laboratorio: "GSK / Medley" },
      { pais: "🇬🇧 Reino Unido", nombre: "Amoxil / Amoxicillin generic", laboratorio: "GSK / Sandoz" },
    ]
  },
  "Ibuprofeno": {
    nombre: "Ibuprofeno", ingredienteActivo: "Ibuprofeno", emoji: "🔶",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Advil / Motrin", laboratorio: "Pfizer / Johnson & Johnson" },
      { pais: "🇪🇸 España", nombre: "Nurofen / Ibuprofeno EFG", laboratorio: "Reckitt / Genérico" },
      { pais: "🇲🇽 México", nombre: "Advil / Motrin", laboratorio: "Pfizer / Johnson & Johnson" },
      { pais: "🇦🇷 Argentina", nombre: "Advil / Ibupirac", laboratorio: "Pfizer / Roemmers" },
      { pais: "🇨🇴 Colombia", nombre: "Advil / Ibuprofeno MK", laboratorio: "Pfizer / Tecnoquímicas" },
      { pais: "🇧🇷 Brasil", nombre: "Advil / Motrin", laboratorio: "Pfizer / Johnson & Johnson" },
      { pais: "🇬🇧 Reino Unido", nombre: "Nurofen / Ibuprofen generic", laboratorio: "Reckitt / Sandoz" },
    ]
  },
  "Clonazepam": {
    nombre: "Clonazepam", ingredienteActivo: "Clonazepam", emoji: "🟣",
    equivalentes: [
      { pais: "🇺🇸 EE.UU.", nombre: "Klonopin / Clonazepam generic", laboratorio: "Roche / Teva" },
      { pais: "🇪🇸 España", nombre: "Rivotril / Clonazepam EFG", laboratorio: "Roche / Genérico" },
      { pais: "🇲🇽 México", nombre: "Rivotril / Clonazepam Roche", laboratorio: "Roche" },
      { pais: "🇦🇷 Argentina", nombre: "Rivotril / Clonax", laboratorio: "Roche / Roemmers" },
      { pais: "🇨🇴 Colombia", nombre: "Rivotril / Clonazepam MK", laboratorio: "Roche / Tecnoquímicas" },
      { pais: "🇧🇷 Brasil", nombre: "Rivotril / Clonazepam genérico", laboratorio: "Roche / Sandoz" },
      { pais: "🇬🇧 Reino Unido", nombre: "Rivotril / Clonazepam generic", laboratorio: "Roche / Sandoz" },
    ]
  },
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
