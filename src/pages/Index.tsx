import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { Search, MapPin, Calendar, Stethoscope, Activity, Heart, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const ESPECIALIDADES = [
  "Cardiología", "Pediatría", "Dermatología", "Ginecología",
  "Neurología", "Ortopedia", "Oftalmología", "Psiquiatría",
  "Medicina General", "Cirugía General", "Urología", "Endocrinología",
  "Gastroenterología", "Reumatología", "Oncología", "Radiología",
  "Medicina Interna", "Nutrición", "Odontología", "Traumatología"
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [doctorCount, setDoctorCount] = useState<number | null>(null);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDoctorCount = async () => {
      const { count } = await supabase
        .from("doctor_profiles")
        .select("*", { count: "exact", head: true });
      const { count: bamCount } = await supabase.from("bam_doctors").select("*", { count: "exact", head: true });
      setDoctorCount((count ?? 0) + (bamCount ?? 0));
    };
    fetchDoctorCount();
  }, []);

  // Cerrar sugerencias al hacer click afuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const filtered = ESPECIALIDADES.filter(e =>
        e.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    setSuggestions([]);
    if (searchQuery.trim()) {
      navigate(`/doctores?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/doctores");
    }
  };

  const selectSuggestion = (s: string) => {
    setSearchQuery(s);
    setSuggestions([]);
    navigate(`/doctores?q=${encodeURIComponent(s)}`);
  };

  const stats = [
    { label: "Doctores", value: doctorCount !== null ? `${doctorCount}+` : "...", icon: Stethoscope },
    { label: "Especialidades", value: "20+", icon: Activity },
    { label: "Guatemala", value: "🇬🇹", icon: MapPin },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="bg-[image:var(--gradient-hero)] py-20 md:py-28 relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl" />
            </div>
            <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8 relative z-10">
              <div className="animate-fade-in">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                  <Heart className="w-4 h-4" />
                  Tu salud, nuestra prioridad
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-in font-display leading-tight">
                Tu salud, a un clic
                <br />
                <span className="text-cyan-300">de distancia</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-white/80 mb-6 animate-fade-in font-body">
                Accede a los mejores médicos y especialistas de Guatemala en un solo lugar. Agenda citas y más.
              </p>
              {/* Escáner CTA */}
              <div className="flex justify-center mb-8 animate-fade-in">
                <button
                  onClick={() => window.location.href = "/escaner-medicamentos"}
                  className="group flex items-center gap-3 px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-2xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Scan className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-tight">Escáner de Medicamentos</p>
                    <p className="text-xs text-white/70 leading-tight">Identificá tu med. con IA al instante</p>
                  </div>
                  <span className="ml-2 px-2 py-0.5 bg-orange-400/30 text-orange-200 text-xs font-bold rounded-full">NUEVO</span>
                </button>
              </div>

              {/* Search Bar con autocompletado */}
              <div className="max-w-3xl mx-auto mb-14 animate-fade-in-up" ref={searchRef}>
                <div className="relative flex flex-col gap-3 sm:flex-row bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl shadow-black/20">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-muted-foreground transform -translate-y-1/2 left-4 top-1/2" />
                    <Input
                      className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                      placeholder="Buscar médicos o especialidades..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-blue-900 hover:opacity-90 rounded-xl shadow-lg transition-all text-white"
                    onClick={handleSearch}
                  >
                    Buscar
                  </Button>

                  {/* Sugerencias */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          className="w-full text-left px-5 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-900 text-base font-medium transition-colors border-b border-gray-100 last:border-0 flex items-center gap-3"
                          onMouseDown={() => selectSuggestion(s)}
                        >
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in-up">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3 text-white/90">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold font-display">{stat.value}</p>
                      <p className="text-sm text-white/70">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fade-in-up">
                {[
                  { to: "/doctores", icon: Stethoscope, label: "Médicos", desc: "Especialistas certificados", color: "from-primary/20 to-primary/5" },
                  { to: "/mapa-doctores", icon: MapPin, label: "Mapa", desc: "Doctores cerca de ti", color: "from-secondary/20 to-secondary/5" },
                  { to: "/citas", icon: Calendar, label: "Agendar Cita", desc: "Reserva en minutos", color: "from-accent/20 to-accent/5" },
                  { to: "/guia-adultos", icon: Heart, label: "Guía Adultos", desc: "Ayuda paso a paso", color: "from-cyan-500/20 to-cyan-500/5" },
                ].map((item) => (
                  <Link key={item.to} to={item.to}>
                    <Card className="group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white/90 backdrop-blur-sm border border-white/50 hover:border-primary/30">
                      <CardContent className="p-5 text-center">
                        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground font-display">{item.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute left-0 right-0 z-10 h-16 -bottom-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
              <path fill="hsl(var(--background))" d="M0,60L80,55C160,50,320,40,480,45C640,50,800,70,960,75C1120,80,1280,70,1360,65L1440,60L1440,120L0,120Z" />
            </svg>
          </div>
        </section>

        {/* Médicos reales */}
        <section className="py-16 mt-4">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Médicos en iMed</h2>
                <p className="text-muted-foreground mt-1">Profesionales verificados en Guatemala</p>
              </div>
              <Link to="/doctores">
                <Button variant="ghost" className="gap-1 text-primary hover:text-primary/80">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <RealDoctorCards />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 relative overflow-hidden">
          <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-6">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                Agenda tu cita médica en minutos
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                Con iMed puedes agendar citas con los mejores especialistas y gestionar tu salud desde tu celular.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link to="/doctores">
                  <Button size="lg" className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-900 rounded-xl shadow-lg hover:shadow-xl transition-all text-white">
                    <Stethoscope className="w-5 h-5" />
                    Buscar un Médico
                  </Button>
                </Link>
                <Link to="/mapa-doctores">
                  <Button variant="outline" size="lg" className="flex items-center gap-2 rounded-xl">
                    <MapPin className="w-5 h-5" />
                    Ver Mapa de Doctores
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const RealDoctorCards = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from("doctor_profiles")
        .select("id, user_id, especialidad, clinica, precio_consulta")
        .limit(3);

      if (data && data.length > 0) {
        const userIds = data.map((d) => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap: Record<string, string> = {};
        (profiles ?? []).forEach((p: any) => { profileMap[p.user_id] = p.full_name; });

        setDoctors(data.map((d) => ({ ...d, full_name: profileMap[d.user_id] || "Doctor iMed" })));
      }
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-muted animate-pulse" />
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="col-span-3 text-center py-12 text-muted-foreground">
        <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Los doctores aparecerán aquí cuando se registren.</p>
        <Link to="/auth">
          <Button className="mt-4 bg-primary text-white">Registrarse como Doctor</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {doctors.map((doctor) => (
        <Card
          key={doctor.id}
          className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group border-border/50 hover:border-primary/20"
          onClick={() => navigate(`/doctores/${doctor.user_id}`)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-900/20 flex items-center justify-center ring-4 ring-primary/10">
                <Stethoscope className="w-10 h-10 text-primary" />
              </div>
              <h3 className="mt-4 font-bold text-lg text-center group-hover:text-primary transition-colors font-display">
                {doctor.full_name}
              </h3>
              <span className="mt-2 text-xs px-3 py-1 rounded-full border border-primary/30 text-primary font-medium">
                {doctor.especialidad || "Medicina General"}
              </span>
              {doctor.clinica && (
                <p className="mt-2 text-sm text-muted-foreground text-center">{doctor.clinica}</p>
              )}
              {doctor.precio_consulta && (
                <p className="mt-1 text-sm font-semibold text-green-600">Q{doctor.precio_consulta}</p>
              )}
              <div className="w-full mt-4 space-y-2">
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-900 hover:opacity-90 text-white"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate(`/citas?doctor=${doctor.user_id}`); }}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendar Cita
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={(e) => { e.stopPropagation(); navigate(`/doctores/${doctor.user_id}`); }}
                >
                  Ver Perfil Completo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default Index;
