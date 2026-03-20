import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Stethoscope, MapPin, Phone, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ESPECIALIDADES = [
  "Todas","CARDIOLOGIA","CIRUGIA GENERAL","DERMATOLOGIA","GASTROENTEROLOGIA",
  "GINECOLOGIA Y OBSTETRICIA","MEDICINA GENERAL","MEDICINA INTERNA",
  "NEUROLOGIA","OFTALMOLOGIA","ORTOPEDIA","OTORRINOLARINGOLOGIA",
  "PEDIATRIA","TRAUMATOLOGIA Y ORTOPEDIA","UROLOGIA","ALERGOLOGO PEDIATRA"
];

const BamDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  useEffect(() => { fetchDoctors("", "Todas", 0); }, []);

  const fetchDoctors = async (q: string, esp: string, p: number) => {
    setLoading(true);
    let query = supabase.from("bam_doctors").select("*");
    if (q.trim()) query = query.or(`nombre.ilike.%${q}%,especialidad.ilike.%${q}%,direccion.ilike.%${q}%`);
    if (esp !== "Todas") query = query.ilike("especialidad", `%${esp}%`);
    query = query.order("especialidad").range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);
    const { data } = await query;
    if (p === 0) setDoctors(data || []);
    else setDoctors(prev => [...prev, ...(data || [])]);
    setLoading(false);
  };

  const handleSearch = () => { setPage(0); fetchDoctors(search, especialidad, 0); };
  const handleEsp = (e: string) => { setEspecialidad(e); setPage(0); fetchDoctors(search, e, 0); };
  const handleMore = () => { const next = page + 1; setPage(next); fetchDoctors(search, especialidad, next); };

  const fmt = (s: string) => s ? s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-blue-900 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-1">Red de Médicos BAM 2025</h1>
          <p className="text-blue-200 mb-6">656 médicos que aceptan Seguro BAM en Guatemala</p>
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                className="pl-10 h-12 bg-white text-gray-900"
                placeholder="Buscar por nombre, especialidad o dirección..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="h-12 px-6 bg-white text-blue-900 hover:bg-blue-50 font-bold" onClick={handleSearch}>Buscar</Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {ESPECIALIDADES.map(e => (
            <button key={e} onClick={() => handleEsp(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${especialidad === e ? "bg-blue-900 text-white" : "bg-white text-gray-600 border border-gray-300 hover:border-blue-900 hover:text-blue-900"}`}>
              {e === "Todas" ? "Todas" : fmt(e)}
            </button>
          ))}
        </div>

        {loading && doctors.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <Card key={i}><CardContent className="p-5">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"/>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"/>
                  <div className="h-3 bg-gray-200 rounded animate-pulse"/>
                </div>
              </CardContent></Card>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No se encontraron doctores</p>
            <Button className="mt-4 bg-blue-900 text-white" onClick={() => { setSearch(""); handleEsp("Todas"); }}>Ver todos</Button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4 font-medium">{doctors.length} doctores encontrados</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map(d => (
                <Card key={d.id} className="bg-white border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-6 h-6 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{fmt(d.nombre)}</h3>
                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full mt-1 font-medium">{fmt(d.especialidad)}</span>
                      </div>
                    </div>
                    {d.direccion && (
                      <p className="text-xs text-gray-500 flex items-start gap-1 mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="line-clamp-2">{d.direccion}</span>
                      </p>
                    )}
                    {d.telefono && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                        <Phone className="w-3 h-3 flex-shrink-0 text-gray-400" />{d.telefono}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Seguro BAM</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-1.5 rounded-lg font-semibold"
                        onClick={() => navigate(`/medicos-bam/${d.id}`)}
                      >
                        Ver Perfil →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl"
                onClick={handleMore}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Cargar más doctores"}
              </Button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BamDoctors;
