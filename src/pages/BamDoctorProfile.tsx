import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Phone, MapPin, Shield, Stethoscope, Calendar, User } from "lucide-react";

const BamDoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("bam_doctors")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) { setError(true); } else { setDoctor(data); }
      setLoading(false);
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50"><Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando perfil del doctor...</p>
          </div>
        </div>
      <Footer /></div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50"><Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor no encontrado</h2>
            <p className="text-gray-500 mb-6">No pudimos encontrar este perfil médico.</p>
            <Button onClick={() => navigate("/medicos-bam")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl">
              Ver todos los doctores BAM
            </Button>
          </div>
        </div>
      <Footer /></div>
    );
  }

  const esp = doctor.especialidad ? doctor.especialidad.charAt(0).toUpperCase() + doctor.especialidad.slice(1).toLowerCase() : "Especialidad no especificada";
  const nom = doctor.nombre ? doctor.nombre.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "Doctor";

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button onClick={() => navigate("/medicos-bam")} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />Volver a la Red BAM
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6 overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-10">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Red BAM 2025</span>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Seguro BAM</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">{nom}</h1>
                <p className="text-blue-100 text-lg font-medium">{esp}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-green-600" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Teléfono</p>
                  {doctor.telefono ? <a href={`tel:${doctor.telefono}`} className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors">{doctor.telefono}</a> : <p className="text-gray-400 italic text-sm">No disponible</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Seguro aceptado</p>
                  <p className="text-lg font-bold text-gray-900">{doctor.seguro || "BAM"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0"><Stethoscope className="w-6 h-6 text-purple-600" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Especialidad</p>
                  <p className="text-lg font-bold text-gray-900">{esp}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {doctor.direccion && (
          <Card className="mb-6 shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"><MapPin className="w-6 h-6 text-red-500" /></div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1">Dirección del consultorio</h3>
                  <p className="text-gray-700 text-base leading-relaxed">{doctor.direccion}</p>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(doctor.direccion + " Guatemala")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm">
                    <MapPin className="w-4 h-4" />Ver en Google Maps
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6 shadow-sm border border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"><Shield className="w-6 h-6 text-yellow-700" /></div>
              <div>
                <h3 className="text-base font-bold text-yellow-900 mb-1">Médico de la Red BAM 2025</h3>
                <p className="text-yellow-800 text-sm leading-relaxed">Este médico forma parte de la Red de Proveedores del Seguro BAM 2025. Para agendar citas y confirmar disponibilidad, comunícate directamente al teléfono indicado o contacta a tu seguro BAM.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctor.telefono && (
            <a href={`tel:${doctor.telefono}`} className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-base rounded-xl shadow-md flex items-center justify-center gap-3">
                <Phone className="w-5 h-5" />Llamar al Doctor
              </Button>
            </a>
          )}
          <Button onClick={() => navigate("/doctores")} variant="outline" className="w-full border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold py-4 text-base rounded-xl flex items-center justify-center gap-3">
            <Calendar className="w-5 h-5" />Buscar más doctores
          </Button>
        </div>
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
            <Stethoscope className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eres médico y quieres más pacientes?</h3>
            <p className="text-gray-600 mb-5 text-sm leading-relaxed max-w-md mx-auto">Registra tu perfil en iMed Guatemala y aparece en el buscador principal con citas en línea, reseñas y más.</p>
            <Button onClick={() => navigate("/auth")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md">
              Registrarme como médico
            </Button>
          </div>
        </div>
      </div>
    <Footer /></div>
  );
};

export default BamDoctorProfile;
