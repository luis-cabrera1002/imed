
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import ReviewsList from "@/components/ReviewsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDoctorById,
  getReviewsByEntityId,
  getClinicById
} from "@/data/mockData";
import { Doctor, Review, Clinic } from "@/types";
import { Calendar, Award, Languages, Stethoscope, Info } from "lucide-react";
import InsuranceBadge from "@/components/InsuranceBadge";

const DoctorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  
  useEffect(() => {
    if (id) {
      const doctorData = getDoctorById(id);
      if (doctorData) {
        setDoctor(doctorData);
        
        // Get reviews for this doctor
        const doctorReviews = getReviewsByEntityId(id, "doctor");
        setReviews(doctorReviews);
        
        // Get clinics where doctor works
        const doctorClinics = doctorData.clinicIds.map(clinicId => 
          getClinicById(clinicId)
        ).filter(clinic => clinic !== undefined) as Clinic[];
        
        setClinics(doctorClinics);
      }
    }
  }, [id]);
  
  if (!doctor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Médico no encontrado</h2>
            <p className="mt-2 text-gray-600">
              El médico que estás buscando no existe o ha sido eliminado.
            </p>
            <Link to="/doctores">
              <Button className="mt-4">Volver a médicos</Button>
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
        {/* Doctor Header */}
        <div className="bg-white border-b">
          <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 overflow-hidden rounded-full">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 md:flex-1">
                <h1 className="text-2xl font-bold">{doctor.name}</h1>
                <p className="mt-1 text-lg text-guatehealth-primary">
                  {doctor.specialty}
                </p>
                <div className="flex flex-wrap items-center justify-center mt-3 md:justify-start">
                  <div className="flex items-center mr-4">
                    <RatingStars rating={doctor.rating} />
                    <span className="ml-2 text-sm text-gray-500">
                      ({doctor.ratingsCount} valoraciones)
                    </span>
                  </div>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {doctor.experience} años de experiencia
                  </span>
                </div>
              </div>
              <div className="flex flex-col mt-4 space-y-2 md:mt-0">
                <Link to={`/citas?doctorId=${doctor.id}&specialty=${doctor.specialty}`}>
                  <Button className="flex items-center justify-center w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Doctor Body */}
        <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="informacion">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="informacion">Información</TabsTrigger>
                  <TabsTrigger value="opiniones">Opiniones</TabsTrigger>
                </TabsList>
                
                {/* Information Tab */}
                <TabsContent value="informacion">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Formación académica</h3>
                      <p className="mt-3 text-gray-600">{doctor.education}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold">Experiencia profesional</h3>
                      <div className="flex items-center mt-3">
                        <Award className="w-5 h-5 mr-2 text-guatehealth-primary" />
                        <span className="text-gray-600">
                          {doctor.experience} años de experiencia como {doctor.specialty}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold">Idiomas</h3>
                      <div className="flex items-center mt-3">
                        <Languages className="w-5 h-5 mr-2 text-guatehealth-primary" />
                        <span className="text-gray-600">
                          {doctor.languages.join(", ")}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold">Clínicas donde atiende</h3>
                      <div className="mt-3 space-y-4">
                        {clinics.map((clinic) => (
                          <div key={clinic.id} className="p-4 border rounded-lg">
                            <Link to={`/clinicas/${clinic.id}`} className="font-medium text-guatehealth-primary hover:underline">
                              {clinic.name}
                            </Link>
                            <p className="mt-1 text-sm text-gray-500">{clinic.address}, {clinic.city}</p>
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Horario:</span> {clinic.schedule.weekdays}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        Seguros médicos aceptados
                        <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Clic para ver cobertura
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {doctor.acceptedInsurance.map((insurance, index) => (
                          <InsuranceBadge 
                            key={index} 
                            insuranceName={insurance} 
                            showQuickInfo={true}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="opiniones">
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="text-3xl font-bold mr-2">{doctor.rating.toFixed(1)}</span>
                        <RatingStars rating={doctor.rating} size="lg" />
                      </div>
                      <span className="ml-3 text-gray-500">
                        Basado en {doctor.ratingsCount} opiniones
                      </span>
                    </div>
                    
                    <ReviewsList reviews={reviews} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-semibold">Especialidad</h3>
                <div className="flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-guatehealth-primary" />
                  <span className={`px-2 py-1 text-sm font-medium rounded-full doctor-specialty-badge specialty-${doctor.specialty.toLowerCase().replace('í', 'i').replace('ó', 'o').replace('é', 'e')}`}>
                    {doctor.specialty}
                  </span>
                </div>
                
                <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
                  <h4 className="text-base font-medium">Para pedir cita</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Seleccione la clínica donde desea atenderse con el Dr. {doctor.name.split(' ')[0]}.
                  </p>
                  <div className="mt-3 space-y-2">
                    {clinics.map((clinic) => (
                      <Link key={clinic.id} to={`/citas?doctorId=${doctor.id}&clinicId=${clinic.id}&specialty=${doctor.specialty}`}>
                        <div className="flex items-center justify-between p-2 border rounded hover:bg-muted transition-colors">
                          <span className="text-sm font-medium">{clinic.name}</span>
                          <Button size="sm">Agendar</Button>
                        </div>
                      </Link>
                    ))}
                  </div>
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

export default DoctorDetail;
