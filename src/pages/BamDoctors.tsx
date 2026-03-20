import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Stethoscope, MapPin, Phone, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ESPECIALIDADES = [
  "Todas","CARDIOLOGIA","CIRUGIA GENERAL","DERMATOLOGIA","GASTROENTEROLOGIA",
  "GINECOLOGIA Y OBSTETRICIA","MEDICINA GENERAL","MEDICINA INTERNA","NEUROLOGIA",
  "OFTALMOLOGIA","ORTOPEDIA","OTORRINOLARINGOLOGIA","PEDIATRIA",
  "TRAUMATOLOGIA Y ORTOPEDIA","UROLOGIA"
];

const BamDoctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
    fetchDoctors(q, "Todas");
  }, []);

  const fetchDoctors = async (q: string, esp: string) => {
    setLoading(true);
    let query = supabase.from("bam_doctors").select("*").limit(300);
    if (q.trim()) query = query.ilike("nombre", `%${q}%`).or(`especialidad.ilike.%${q}%`);
    if (esp !== "Todas") query = query.eq("especialidad", esp);
    const { data } = await query.order("especialidad");
    setDoctors(data || []);
    setLoading(false);
  };

  const handleSearch = () => fetchDoctors(search, especialidad);
  const handleEsp = (e: string) => { setEspecialidad(e); fetchDoctors(search, e); };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="bg-blue-900 py-12">
          <div className="container px-4 mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-200" />
              <span className="text-blue-200 font-semibold text-lg">Red de Proveedores BAM 2025</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-6">Médicos con Seguro BAM</h1>
            <div className="flex gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  className="pl-10 h-12 bg-white text-gray-900"
                  placeholder="Buscar por nombre o especialidad..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button className="h-12 px-6 bg-white text-blue-900 hover:bg-blue-50 font-bold" onClick={handleSearch}>
                Buscar
              </Button>
            </div>
          </div>
        </div>

        <div className="container px-4 mx-auto py-8">
          {/* Filtro especialidades */}
          <div className="flex gap-2 flex-wrap mb-6">
            {ESPECIALIDADES.map(e => (
              <button
                key={e}
                onClick={() => handleEsp(e)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  especialidad === e
                    ? "bg-blue-900 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-900 hover:text-blue-900"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i}><CardContent className="p-5">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-1/2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </CardContent></Card>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No se encontraron doctores con ese criterio.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4 font-medium">{doctors.length} doctores encontrados</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(d => (
                  <Card key={d.id} className="bg-white hover:shadow-md transition-shadow border-gray-200 cursor-pointer" onClick={() => navigate(`/medicos-bam/${d.id}`)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-blue-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{d.nombre}</h3>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full font-medium">
                            {d.especialidad}
                          </span>
                        </div>
                      </div>
                      {d.direccion && (
                        <div className="flex items-start gap-2 mt-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600 leading-relaxed">{d.direccion}</p>
                        </div>
                      )}
                      {d.telefono && (
                        <div className="flex items-center gap-2 mt-2">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-600">{d.telefono}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Acepta Seguro BAM</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BamDoctors;
