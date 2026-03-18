
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import ReviewsList from "@/components/ReviewsList";
import DoctorCard from "@/components/DoctorCard";
import Map, { MapLocation } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getClinicById, 
  getDoctorsByClinicId,
  getReviewsByEntityId
} from "@/data/mockData";
import { Clinic, Doctor, Review } from "@/types";
import { Phone, MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";

const ClinicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    if (id) {
      const clinicData = getClinicById(id);
      if (clinicData) {
        setClinic(clinicData);
        
        // Get doctors in this clinic
        const clinicDoctors = getDoctorsByClinicId(id);
        setDoctors(clinicDoctors);
        
        // Get reviews for this clinic
        const clinicReviews = getReviewsByEntityId(id, "clinic");
        setReviews(clinicReviews);
      }
    }
  }, [id]);
  
  if (!clinic) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Clínica no encontrada</h2>
            <p className="mt-2 text-gray-600">
              La clínica que estás buscando no existe o ha sido eliminada.
            </p>
            <Link to="/clinicas">
              <Button className="mt-4">Volver a clínicas</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Clinic Header */}
        <div className="bg-white border-b">
          <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{clinic.name}</h1>
                <div className="flex flex-col mt-2 space-y-1 text-sm text-gray-500 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{clinic.address}, {clinic.city}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{clinic.phone}</span>
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <RatingStars rating={clinic.rating} />
                  <span className="ml-2 text-sm text-gray-500">
                    ({clinic.ratingsCount} valoraciones)
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap mt-4 gap-2 lg:mt-0">
                {clinic.emergency && (
                  <Button
                    className="flex items-center bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Urgencias 24h
                  </Button>
                )}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => window.location.href = `/citas?clinic=${clinic.id}`}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Agendar Cita
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`, '_blank')}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Cómo llegar
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Clinic Body */}
        <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="informacion">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="informacion">Información</TabsTrigger>
                  <TabsTrigger value="medicos">Médicos</TabsTrigger>
                  <TabsTrigger value="opiniones">Opiniones</TabsTrigger>
                </TabsList>
                
                {/* Information Tab */}
                <TabsContent value="informacion">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Especialidades</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {clinic.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-blue-100 rounded-full text-guatehealth-primary"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold">Horario</h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Lunes a viernes:</span>
                          <span className="ml-2">{clinic.schedule.weekdays}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Fines de semana:</span>
                          <span className="ml-2">{clinic.schedule.weekend}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold">Seguros aceptados</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {clinic.acceptedInsurance.map((insurance, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-700"
                          >
                            {insurance}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {clinic.website && (
                      <div>
                        <h3 className="text-lg font-semibold">Sitio Web Oficial</h3>
                        <div className="mt-3">
                          <a 
                            href={clinic.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-guatehealth-primary hover:underline"
                          >
                            {clinic.website}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Doctors Tab */}
                <TabsContent value="medicos">
                  {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {doctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay médicos disponibles para esta clínica.</p>
                  )}
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="opiniones">
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="text-3xl font-bold mr-2">{clinic.rating.toFixed(1)}</span>
                        <RatingStars rating={clinic.rating} size="lg" />
                      </div>
                      <span className="ml-3 text-gray-500">
                        Basado en {clinic.ratingsCount} opiniones
                      </span>
                    </div>
                    
                    <ReviewsList reviews={reviews} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar Map */}
            <div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-semibold">Ubicación</h3>
                <div className="h-64 mb-4">
                  <Map 
                    locations={[{
                      id: clinic.id,
                      name: clinic.name,
                      address: clinic.address,
                      coordinates: clinic.coordinates,
                      type: clinic.emergency ? 'hospital' : 'clinic',
                      emergency: clinic.emergency
                    }]} 
                    selectedLocationId={clinic.id} 
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`, '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Cómo llegar
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = `/clinicas?view=mapa&selected=${clinic.id}`}
                  >
                    Ver en Mapa Completo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClinicDetail;
