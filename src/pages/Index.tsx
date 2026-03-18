import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClinicCard from "@/components/ClinicCard";
import DoctorCard from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Stethoscope, Activity, Heart, Shield, Pill, ArrowRight } from "lucide-react";
import {
  clinics,
  doctors,
  getTopRatedClinics,
  getTopRatedDoctors,
  getAllSpecialties,
} from "@/data/mockData";
import { Specialty } from "@/types";
import SpecialtySection from "@/components/SpecialtySection";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [topClinics, setTopClinics] = useState(getTopRatedClinics(3));
  const [topDoctors, setTopDoctors] = useState(getTopRatedDoctors(3));
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allSpecialties = getAllSpecialties();
    setSpecialties(allSpecialties.slice(0, 3) as Specialty[]);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/clinicas?q=${searchQuery}`);
    }
  };

  const stats = [
    { label: "Doctores", value: `${doctors.length}+`, icon: Stethoscope },
    { label: "Clínicas", value: `${clinics.length}+`, icon: MapPin },
    { label: "Especialidades", value: `${getAllSpecialties().length}`, icon: Activity },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="bg-[image:var(--gradient-hero)] py-20 md:py-28 relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
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
                <span className="text-cyan-light">de distancia</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-white/80 mb-10 animate-fade-in font-body">
                Accede a los mejores médicos, clínicas y especialistas de Guatemala en un solo lugar. Agenda citas, consulta tu seguro y más.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-3xl mx-auto mb-14 animate-fade-in-up">
                <div className="flex flex-col gap-3 sm:flex-row bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl shadow-black/20">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-muted-foreground transform -translate-y-1/2 left-4 top-1/2" />
                    <Input
                      className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                      placeholder="Buscar médicos, clínicas o especialidades..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-navy-light hover:opacity-90 rounded-xl shadow-lg transition-all"
                    onClick={handleSearch}
                  >
                    Buscar
                  </Button>
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
                  { to: "/clinicas", icon: MapPin, label: "Clínicas", desc: "Centros médicos cerca de ti", color: "from-primary/20 to-primary/5" },
                  { to: "/doctores", icon: Stethoscope, label: "Médicos", desc: "Especialistas certificados", color: "from-secondary/20 to-secondary/5" },
                  { to: "/citas", icon: Calendar, label: "Agendar Cita", desc: "Reserva en minutos", color: "from-accent/20 to-accent/5" },
                  { to: "/mi-seguro", icon: Shield, label: "Mi Seguro", desc: "Consulta tu cobertura", color: "from-cyan/20 to-cyan/5" },
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
              <path
                fill="hsl(var(--background))"
                d="M0,60L80,55C160,50,320,40,480,45C640,50,800,70,960,75C1120,80,1280,70,1360,65L1440,60L1440,120L0,120Z"
              />
            </svg>
          </div>
        </section>

        {/* Featured Clinics */}
        <section className="py-16 mt-4">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Clínicas destacadas</h2>
                <p className="text-muted-foreground mt-1">Los mejores centros médicos de Guatemala</p>
              </div>
              <Link to="/clinicas">
                <Button variant="ghost" className="gap-1 text-primary hover:text-primary/80">
                  Ver todas <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topClinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Doctors */}
        <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Médicos destacados</h2>
                <p className="text-muted-foreground mt-1">Profesionales con las mejores calificaciones</p>
              </div>
              <Link to="/doctores">
                <Button variant="ghost" className="gap-1 text-primary hover:text-primary/80">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>

        {/* Top Doctors by Specialty */}
        <section className="py-16">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl md:text-3xl font-bold font-display text-foreground">Los mejores especialistas</h2>
            <div className="space-y-12">
              {specialties.map((specialty) => (
                <SpecialtySection
                  key={specialty}
                  specialty={specialty}
                  doctors={doctors}
                />
              ))}
              <div className="text-center">
                <Link to="/especialidades">
                  <Button variant="outline" className="gap-2 rounded-xl">
                    Ver todas las especialidades
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-5" />
          <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-6">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                Agenda tu cita médica en minutos
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                Con iMed puedes agendar citas con los mejores especialistas, verificar disponibilidad en tiempo real y gestionar tus seguros médicos.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link to="/citas">
                  <Button size="lg" className="flex items-center gap-2 bg-gradient-to-r from-primary to-navy-light rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Calendar className="w-5 h-5" />
                    Agendar Cita Ahora
                  </Button>
                </Link>
                <Link to="/clinicas">
                  <Button variant="outline" size="lg" className="flex items-center gap-2 rounded-xl">
                    <MapPin className="w-5 h-5" />
                    Explorar clínicas en el mapa
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

export default Index;
