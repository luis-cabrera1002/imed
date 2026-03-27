import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, CheckCircle, XCircle, MapPin, Store, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { MapLocation } from "@/components/Map";

const Map = lazy(() => import("@/components/Map"));

const MEDICAMENTOS_COMUNES = [
  "Paracetamol 500mg", "Ibuprofeno 400mg", "Amoxicilina 500mg",
  "Omeprazol 20mg", "Metformina 850mg", "Loratadina 10mg",
  "Atorvastatina 20mg", "Losartán 50mg", "Salbutamol inhalador",
  "Aspirina 100mg", "Clonazepam 0.5mg", "Enalapril 10mg",
];

interface Farmacia {
  id: string;
  farmacia_id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  lat: number;
  lng: number;
}

interface StockItem {
  farmacia_id: string;
  medicamento: string;
  en_stock: boolean;
}

export default function MapaFarmacias() {
  const { toast } = useToast();
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [selectedFarmacia, setSelectedFarmacia] = useState<Farmacia | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isFarmacia, setIsFarmacia] = useState(false);
  const [myFarmacia, setMyFarmacia] = useState<Farmacia | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nuevoMed, setNuevoMed] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);

    // Check if logged-in user is a pharmacy
    if (u) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", u.id)
        .single();
      const esF = profile?.role === "pharmacy";
      setIsFarmacia(esF);
    }

    // Load all pharmacy locations
    const { data: ubicaciones } = await supabase
      .from("farmacia_ubicacion")
      .select("*");
    const lista = ubicaciones ?? [];
    setFarmacias(lista);

    if (u) {
      const mine = lista.find((f: Farmacia) => f.farmacia_id === u.id);
      setMyFarmacia(mine ?? null);
    }

    // Load all stock
    const { data: stockData } = await supabase
      .from("farmacia_stock")
      .select("farmacia_id, medicamento, en_stock");
    setStock(stockData ?? []);

    setLoading(false);
  }

  // Filter farmacias by busqueda (show only those with the searched medication in stock)
  const farmaciasFiltradas = busqueda.trim()
    ? farmacias.filter(f =>
        stock.some(
          s => s.farmacia_id === f.farmacia_id &&
               s.medicamento.toLowerCase().includes(busqueda.toLowerCase()) &&
               s.en_stock
        )
      )
    : farmacias;

  const mapLocations: MapLocation[] = farmaciasFiltradas.map(f => ({
    id: f.farmacia_id,
    name: f.nombre,
    address: f.direccion ?? "Guatemala",
    coordinates: { lat: f.lat, lng: f.lng },
    type: "pharmacy" as const,
  }));

  function getStockForFarmacia(farmacia_id: string) {
    return stock.filter(s => s.farmacia_id === farmacia_id);
  }

  async function toggleStock(medicamento: string, enStock: boolean) {
    if (!user || !isFarmacia) return;
    setGuardando(true);
    const { error } = await supabase
      .from("farmacia_stock")
      .upsert({ farmacia_id: user.id, medicamento, en_stock: enStock }, { onConflict: "farmacia_id,medicamento" });
    if (!error) {
      setStock(prev => {
        const others = prev.filter(s => !(s.farmacia_id === user.id && s.medicamento === medicamento));
        return [...others, { farmacia_id: user.id, medicamento, en_stock: enStock }];
      });
      toast({ title: enStock ? "Stock marcado ✓" : "Marcado sin stock", description: medicamento });
    }
    setGuardando(false);
  }

  async function agregarMedicamento() {
    if (!nuevoMed.trim() || !user || !isFarmacia) return;
    setGuardando(true);
    const { error } = await supabase
      .from("farmacia_stock")
      .upsert({ farmacia_id: user.id, medicamento: nuevoMed.trim(), en_stock: true }, { onConflict: "farmacia_id,medicamento" });
    if (!error) {
      setStock(prev => [...prev.filter(s => !(s.farmacia_id === user.id && s.medicamento === nuevoMed.trim())),
        { farmacia_id: user.id, medicamento: nuevoMed.trim(), en_stock: true }]);
      setNuevoMed("");
      toast({ title: "Medicamento agregado", description: nuevoMed.trim() });
    }
    setGuardando(false);
  }

  const myStock = user ? getStockForFarmacia(user.id) : [];
  const selectedStock = selectedFarmacia ? getStockForFarmacia(selectedFarmacia.farmacia_id) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-green-600" />
            Mapa de Farmacias
          </h1>
          <p className="text-gray-500 text-sm mt-1">Encontrá farmacias con stock del medicamento que necesitás</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por medicamento (ej: Paracetamol)"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-9 rounded-xl border-gray-200"
          />
        </div>

        {busqueda && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {farmaciasFiltradas.length === 0
                ? "Ninguna farmacia tiene ese medicamento en stock"
                : `${farmaciasFiltradas.length} farmacia(s) con "${busqueda}" en stock`}
            </span>
            {farmaciasFiltradas.length === 0 && (
              <span className="text-xs text-orange-500 font-medium">Intentá buscar por nombre genérico</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Map */}
          <div className="lg:col-span-2 h-[500px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : (
              <Suspense fallback={<div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center"><RefreshCw className="w-6 h-6 text-gray-400 animate-spin" /></div>}>
                <Map
                  locations={mapLocations}
                  selectedLocationId={selectedFarmacia?.farmacia_id}
                  onSelectLocation={(id) => {
                    const f = farmacias.find(x => x.farmacia_id === id);
                    setSelectedFarmacia(f ?? null);
                  }}
                />
              </Suspense>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Farmacia seleccionada */}
            {selectedFarmacia ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedFarmacia.nombre}</h3>
                    {selectedFarmacia.direccion && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {selectedFarmacia.direccion}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setSelectedFarmacia(null)} className="text-gray-300 hover:text-gray-500 text-xs">✕</button>
                </div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medicamentos</h4>
                {selectedStock.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin información de stock</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedStock.map(s => (
                      <div key={s.medicamento} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{s.medicamento}</span>
                        {s.en_stock
                          ? <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Disponible</span>
                          : <span className="flex items-center gap-1 text-xs text-red-400 font-semibold"><XCircle className="w-3.5 h-3.5" /> Sin stock</span>
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-5 text-center text-gray-400">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Seleccioná una farmacia en el mapa para ver su stock</p>
              </div>
            )}

            {/* Panel de gestión para farmacias */}
            {isFarmacia && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Store className="w-4 h-4 text-orange-500" /> Mi stock
                </h3>
                <p className="text-xs text-gray-400 mb-4">Marcá qué medicamentos tenés disponibles</p>

                {/* Medicamentos comunes con toggle */}
                <div className="space-y-2 mb-4">
                  {MEDICAMENTOS_COMUNES.map(med => {
                    const item = myStock.find(s => s.medicamento === med);
                    const enStock = item?.en_stock ?? false;
                    return (
                      <div key={med} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 flex-1 mr-2">{med}</span>
                        <button
                          onClick={() => toggleStock(med, !enStock)}
                          disabled={guardando}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                            enStock
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {enStock ? <><CheckCircle className="w-3 h-3" /> Tengo</> : <><XCircle className="w-3 h-3" /> Sin stock</>}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Agregar medicamento personalizado */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Input
                    placeholder="Otro medicamento..."
                    value={nuevoMed}
                    onChange={e => setNuevoMed(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && agregarMedicamento()}
                    className="text-sm rounded-xl border-gray-200 h-9"
                  />
                  <Button
                    onClick={agregarMedicamento}
                    disabled={!nuevoMed.trim() || guardando}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9 px-3"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {/* CTA para farmacias no registradas */}
            {!isFarmacia && !loading && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                <p className="text-sm text-orange-800 font-medium mb-1">¿Sos una farmacia?</p>
                <p className="text-xs text-orange-600 mb-3">Registrate en iMed y aparecé en este mapa con tu stock actualizado</p>
                <a href="/auth" className="text-xs font-semibold text-orange-700 underline">Registrar mi farmacia →</a>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
