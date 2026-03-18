import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  Calendar, 
  Search, 
  CheckCircle, 
  Volume2,
  ArrowRight,
  Heart,
  MapPin,
  FileText,
  Home
} from "lucide-react";

const SeniorGuide = () => {
  const [activeStep, setActiveStep] = useState(1);
  
  const steps = [
    {
      id: 1,
      title: "Buscar un Doctor o Clínica",
      icon: Search,
      description: "Encuentre fácilmente el médico o clínica que necesita",
      instructions: [
        "En la página principal, verá una barra de búsqueda grande en la parte superior",
        "Escriba el nombre del doctor, especialidad o clínica que busca",
        "Presione el botón 'Buscar' o la tecla Enter",
        "Verá una lista de resultados que puede explorar"
      ],
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop"
    },
    {
      id: 2,
      title: "Ver Información del Doctor",
      icon: Heart,
      description: "Conozca toda la información del profesional médico",
      instructions: [
        "Haga clic en la tarjeta del doctor que le interese",
        "Podrá ver su especialidad, años de experiencia y calificación",
        "Revise los comentarios de otros pacientes",
        "Vea las clínicas donde atiende y los horarios disponibles"
      ],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"
    },
    {
      id: 3,
      title: "Agendar una Cita",
      icon: Calendar,
      description: "Reserve su cita médica en 3 pasos sencillos",
      instructions: [
        "Presione el botón verde 'Agendar Cita'",
        "Seleccione la especialidad y el doctor de su preferencia",
        "Escoja la fecha y hora que más le convenga",
        "Complete sus datos personales y seguro médico",
        "Confirme su cita y recibirá una notificación"
      ],
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=500&fit=crop"
    },
    {
      id: 4,
      title: "Ver su Receta Médica",
      icon: FileText,
      description: "Acceda a sus recetas y medicamentos",
      instructions: [
        "En el menú superior, haga clic en 'Mis Recetas'",
        "Verá todas sus recetas médicas organizadas",
        "Puede ver los detalles de cada medicamento",
        "Encuentre las farmacias donde puede comprar sus medicinas",
        "Marque como completada cuando tome sus medicamentos"
      ],
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=500&fit=crop"
    },
    {
      id: 5,
      title: "Encontrar Clínicas Cercanas",
      icon: MapPin,
      description: "Localice clínicas y hospitales en su área",
      instructions: [
        "Haga clic en 'Clínicas' en el menú superior",
        "Use el mapa interactivo para ver clínicas cercanas",
        "Puede filtrar por especialidad o seguro médico",
        "Vea la dirección, teléfono y horarios de atención",
        "Presione 'Cómo llegar' para obtener indicaciones"
      ],
      image: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&h=500&fit=crop"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-guatehealth-primary to-guatehealth-secondary text-white py-16">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Heart className="w-20 h-20 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Guía Paso a Paso para Adultos Mayores
              </h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                Aprenda a usar iMed de forma fácil y sencilla. 
                Esta guía está diseñada especialmente para usted.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-6"
                  onClick={() => {
                    const element = document.getElementById('guia-interactiva');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <ArrowRight className="w-6 h-6 mr-2" />
                  Comenzar Tutorial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white text-guatehealth-primary border-2"
                >
                  <Phone className="w-6 h-6 mr-2" />
                  Llamar para Asistencia
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 bg-white">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              ¿Por qué usar iMed?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-guatehealth-primary" />
                <h3 className="text-2xl font-semibold mb-4">Fácil de Usar</h3>
                <p className="text-lg text-gray-600">
                  Interfaz grande y clara diseñada pensando en usted
                </p>
              </Card>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Phone className="w-16 h-16 mx-auto mb-4 text-guatehealth-primary" />
                <h3 className="text-2xl font-semibold mb-4">Soporte 24/7</h3>
                <p className="text-lg text-gray-600">
                  Asistencia telefónica siempre disponible para ayudarle
                </p>
              </Card>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Heart className="w-16 h-16 mx-auto mb-4 text-guatehealth-primary" />
                <h3 className="text-2xl font-semibold mb-4">Confiable</h3>
                <p className="text-lg text-gray-600">
                  Miles de pacientes confían en nosotros cada día
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Interactive Guide */}
        <div id="guia-interactiva" className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tutorial Paso a Paso
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Siga estos pasos simples para aprender a usar todas las funciones de iMed
              </p>
            </div>

            <Tabs value={activeStep.toString()} onValueChange={(v) => setActiveStep(parseInt(v))} className="max-w-6xl mx-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8 h-auto bg-white p-2 rounded-lg">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <TabsTrigger 
                      key={step.id} 
                      value={step.id.toString()}
                      className="flex flex-col items-center p-4 text-center data-[state=active]:bg-guatehealth-primary data-[state=active]:text-white"
                    >
                      <Icon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-semibold">{step.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <TabsContent key={step.id} value={step.id.toString()}>
                    <Card className="overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 lg:p-12">
                          <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-guatehealth-primary text-white mr-4">
                              <Icon className="w-8 h-8" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-guatehealth-primary uppercase">
                                Paso {step.id} de {steps.length}
                              </span>
                              <h3 className="text-2xl md:text-3xl font-bold">
                                {step.title}
                              </h3>
                            </div>
                          </div>
                          
                          <p className="text-xl text-gray-600 mb-8">
                            {step.description}
                          </p>
                          
                          <div className="space-y-4">
                            {step.instructions.map((instruction, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                                <p className="text-lg text-gray-700 leading-relaxed">
                                  {instruction}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-4 mt-8">
                            {step.id > 1 && (
                              <Button 
                                variant="outline" 
                                size="lg"
                                onClick={() => setActiveStep(step.id - 1)}
                                className="text-lg"
                              >
                                Anterior
                              </Button>
                            )}
                            {step.id < steps.length && (
                              <Button 
                                size="lg"
                                onClick={() => setActiveStep(step.id + 1)}
                                className="text-lg"
                              >
                                Siguiente Paso
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 lg:min-h-full">
                          <img 
                            src={step.image} 
                            alt={step.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>

        {/* Video Tutorials Section */}
        <div className="py-16 bg-white">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Videos Tutoriales
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aprenda viendo estos videos paso a paso con instrucciones claras
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Cómo buscar un doctor",
                  duration: "3:45",
                  image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop"
                },
                {
                  title: "Cómo agendar una cita",
                  duration: "5:20",
                  image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop"
                },
                {
                  title: "Cómo ver sus recetas",
                  duration: "2:30",
                  image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop"
                },
                {
                  title: "Cómo encontrar farmacias",
                  duration: "4:10",
                  image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&h=400&fit=crop"
                }
              ].map((video, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img 
                      src={video.image} 
                      alt={video.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <Button size="lg" className="rounded-full w-20 h-20">
                        <Volume2 className="w-10 h-10" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-semibold">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                    <p className="text-gray-600">
                      Tutorial en video con instrucciones paso a paso
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="py-16 bg-gradient-to-r from-guatehealth-primary to-guatehealth-secondary text-white">
          <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8">
            <Phone className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Necesita Ayuda Adicional?
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Nuestro equipo de soporte está disponible para ayudarle en cualquier momento. 
              No dude en llamarnos, estamos aquí para usted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="tel:+50212345678">
                <Button size="lg" variant="secondary" className="text-xl px-8 py-6">
                  <Phone className="w-6 h-6 mr-2" />
                  +502 1234-5678
                </Button>
              </a>
              <span className="text-xl">o</span>
              <Button size="lg" variant="outline" className="text-xl px-8 py-6 bg-white text-guatehealth-primary border-2">
                <Home className="w-6 h-6 mr-2" />
                Volver al Inicio
              </Button>
            </div>
            <p className="mt-8 text-lg opacity-90">
              Horario de atención: Lunes a Domingo, 24 horas
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeniorGuide;
