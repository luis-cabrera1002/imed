import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Stethoscope, MapPin, Phone, Shield, Calendar, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ESPECIALIDADES = [
  "Todas","Medicina General","Pediatría","Ginecología","Cardiología",
  "Dermatología","Traumatología","Neurología","Psiquiatría","Oftalmología",
  "Odontología","Nutrición","Fisioterapia","Urología","Endocrinología","Gastroenterología"
];

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [registeredDoctors, setRegisteredDoctors] = useState<any[]>([]);
  const [bamDoctors, setBamDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"todos" | "registrados" | "bam">("todos");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const BAM_ESPECIALIDADES = [
    "CARDIOLOGIA","CIRUGIA GENERAL","DERMATOLOGIA","GASTROENTEROLOGIA",
    "GINECOLOGIA Y OBSTETRICIA","MEDICINA GENERAL","MEDICINA INTERNA",
    "NEUROLOGIA","OFTALMOLOGIA","ORTOPEDIA","OTORRINOLARINGOLOGIA",
    "PEDIATRIA","TRAUMATOLOGIA Y ORTOPEDIA","UROLOGIA"
  ];

  useEffect(() => {
    fetchAll(search, especialidad);
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSuggestions([]);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchAll = async (q: string, esp: string) => {
    setLoading(true);
    // Fetch registered doctors
    let rq = supabase.from("doctor_profiles").select("id, user_id, especialidad, clinica, precio_consulta, latitud, longitud").limit(50);
    if (q.trim()) rq = rq.ilike("especialidad", `%${q}%`);
    const { data: rDocs } = await rq;

    if (rDocs && rDocs.length > 0) {
      const uids = rDocs.map((d: any) => d.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", uids);
      const pm: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { pm[p.user_id] = p.full_name; });
      setRegisteredDoctors(rDocs.map((d: any) => ({ ...d, full_name: pm[d.user_id] || "Doctor iMed", source: "registered" })));
    } else {
      setRegisteredDoctors([]);
    }

    // Fetch BAM doctors
    let bq = supabase.from("bam_doctors").select("*").limit(200);
    if (q.trim()) bq = bq.or(`nombre.ilike.%${q}%,especialidad.ilike.%${q}%`);
    if (esp !== "Todas") bq = bq.ilike("especialidad", `%${esp}%`);
    const { data: bDocs } = await bq.order("especialidad");
    setBamDoctors((bDocs || []).map((d: any) => ({ ...d, source: "bam" })));
    setLoading(false);
  };

  const handleSearch = () => { setSuggestions([]); fetchAll(search, especialidad); };
  const handleEsp = (e: string) => { setEspecialidad(e); fetchAll(search, e); };
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val.length >= 2) {
      const all = [...ESPECIALIDADES, ...BAM_ESPECIALIDADES];
      setSuggestions([...new Set(all.filter(e => e.toLowerCase().includes(val.toLowerCase())))].slice(0, 6));
    } else setSuggestions([]);
  };

  const allDoctors = [...registeredDoctors, ...bamDoctors];
  const displayed = activeTab === "registrados" ? registeredDoctors : activeTab === "bam" ? bamDoctors : allDoctors;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="bg-blue-900 py-10">
          <div className="container px-4 mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Buscar Médicos</h1>
            <p className="text-blue-200 mb-6">Doctores registrados en iMed + Red de Proveedores BAM 2025</p>
            <div className="flex gap-3 max-w-2xl" ref={searchRef}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  className="pl-10 h-12 bg-white text-gray-900"
                  placeholder="Buscar por nombre, especialidad..."
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border z-50">
                    {suggestions.map(s => (
                      <button key={s} className="w-full text-left px-4 py-2.5 text-gray-800 hover:bg-blue-50 text-sm font-medium border-b last:border-0"
                        onMouseDown={() => { setSearch(s); setSuggestions([]); fetchAll(s, especialidad); }}>
                        <Search className="w-3.5 h-3.5 inline mr-2 text-gray-400" />{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button className="h-12 px-6 bg-white text-blue-900 hover:bg-blue-50 font-bold" onClick={handleSearch}>Buscar</Button>
              <Button variant="outline" className="h-12 px-4 border-white text-white hover:bg-white/10" onClick={() => navigate("/mapa-doctores")}>
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container px-4 mx-auto py-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            {([["todos","Todos",allDoctors.length],["registrados","En iMed",registeredDoctors.length],["bam","Red BAM",bamDoctors.length]] as const).map(([tab,label,count]) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {label} <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>
              </button>
            ))}
          </div>

          {/* Filtros especialidad */}
          <div className="flex gap-2 flex-wrap mb-6">
            {ESPECIALIDADES.map(e => (
              <button key={e} onClick={() => handleEsp(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${especialidad === e ? "bg-blue-900 text-white" : "bg-white text-gray-600 border border-gray-300 hover:border-blue-900 hover:text-blue-900"}`}>
                {e}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Card key={i}><CardContent className="p-5"><div className="space-y-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"/><div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"/><div className="h-3 bg-gray-200 rounded animate-pulse"/></div></CardContent></Card>)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No se encontraron doctores.</p>
              <Button className="mt-4 bg-blue-900 text-white" onClick={() => { setSearch(""); setEspecialidad("Todas"); fetchAll("","Todas"); }}>Ver todos</Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4 font-medium">{displayed.length} doctores encontrados</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((d, i) => d.source === "registered" ? (
                  <Card key={`r-${d.id}`} className="bg-white hover:shadow-md transition-shadow cursor-pointer border-blue-100 border-2" onClick={() => navigate(`/doctores/${d.user_id}`)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-semibold">✓ Registrado en iMed</span>
                          <h3 className="font-bold text-gray-900 mt-1">{d.full_name}</h3>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full">{d.especialidad}</span>
                        </div>
                      </div>
                      {d.clinica && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><MapPin className="w-3 h-3"/>{d.clinica}</p>}
                      {d.precio_consulta && <p className="text-sm font-bold text-green-600 mt-1">Q{d.precio_consulta} consulta</p>}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-blue-900 text-white rounded-lg text-xs" onClick={e => { e.stopPropagation(); navigate(`/citas?doctor=${d.user_id}`); }}><Calendar className="w-3 h-3 mr-1"/>Agendar</Button>
                        <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs" onClick={e => { e.stopPropagation(); navigate(`/doctores/${d.user_id}`); }}>Ver Perfil</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={`b-${d.id}`} className="bg-white hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={() => navigate(`/medicos-bam/${d.id}`)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-blue-800" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{d.nombre}</h3>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full mt-1 inline-block">{d.especialidad}</span>
                        </div>
                      </div>
                      {d.direccion && <p className="text-xs text-gray-500 mt-2 flex items-start gap-1"><MapPin className="w-3 h-3 flex-shrink-0 mt-0.5"/>{d.direccion}</p>}
                      {d.telefono && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/>{d.telefono}</p>}
                      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
                        <Shield className="w-3 h-3 text-green-600"/><span className="text-xs text-green-600 font-medium">Acepta Seguro BAM</span>
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

export default Doctors;
