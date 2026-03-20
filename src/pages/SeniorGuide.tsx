import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Calendar, Search, CheckCircle, Volume2, ArrowRight, Heart, MapPin, FileText, Home } from "lucide-react";

const SeniorGuide = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Buscar un Doctor",
      icon: Search,
      description: "Encuentre fácilmente el médico que necesita",
      instructions: [
        "En la página principal, verá una barra de búsqueda grande en la parte superior",
        "Escriba el nombre del doctor o la especialidad que busca",
        "Presione el botón Buscar o la tecla Enter en su teclado",
        "Verá una lista de doctores que puede explorar",
      ],
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
    },
    {
      id: 2,
      title: "Ver Info del Doctor",
      icon: Heart,
      description: "Conozca toda la información del profesional médico",
      instructions: [
        "Haga clic en la tarjeta del doctor que le interese",
        "Podrá ver su especialidad, clínica y precio de consulta",
        "Revise los comentarios de otros pacientes",
        "Vea los horarios disponibles para la cita",
      ],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop",
    },
    {
      id: 3,
      title: "Agendar una Cita",
      icon: Calendar,
      description: "Reserve su cita médica en pasos sencillos",
      instructions: [
        "Presione el botón azul Agendar Cita en la tarjeta del doctor",
        "Seleccione la fecha y hora que más le convenga",
        "Escriba el motivo de su consulta",
        "Presione Confirmar Cita",
        "Recibirá un correo electrónico confirmando su cita",
      ],
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=500&fit=crop",
    },
    {
      id: 4,
      title: "Ver sus Citas",
      icon: FileText,
      description: "Acceda a sus citas médicas agendadas",
      instructions: [
        "En el menú superior, haga clic en Servicios",
        "Luego haga clic en Mis Citas",
        "Verá todas sus citas organizadas por fecha",
        "Puede ver el nombre del doctor y el horario de cada cita",
      ],
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=500&fit=crop",
    },
    {
      id: 5,
      title: "Doctores Cercanos",
      icon: MapPin,
      description: "Localice doctores y clínicas en su área",
      instructions: [
        "Haga clic en Mapa en la página principal",
        "El mapa mostrará doctores cercanos a usted",
        "Puede hacer clic en cada marcador para ver información",
        "Presione Ver Perfil para conocer más del doctor",
        "Presione Agendar Cita para reservar directamente",
      ],
      image: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&h=500&fit=crop",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="bg-blue-900 text-white py-16">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Heart className="w-20 h-20 mx-auto mb-6 text-blue-200" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Guía Paso a Paso para Adultos Mayores
              </h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed text-blue-100">
                Aprenda a usar iMed de forma fácil y sencilla. Esta guía está diseñada especialmente para usted.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-white text-blue-900 hover:bg-blue-50 font-bold"
                  onClick={() => {
                    const element = document.getElementById("guia-interactiva");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <ArrowRight className="w-6 h-6 mr-2" />
                  Comenzar Tutorial
                </Button>
                <a href="tel:+50212345678">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-900 font-bold" style={{color:'white'}}>
                    <Phone className="w-6 h-6 mr-2" />
                    Llamar para Asistencia
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              ¿Por qué usar iMed?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow bg-white border-gray-200">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-800" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Fácil de Usar</h3>
                <p className="text-lg text-gray-700">Interfaz grande y clara diseñada pensando en usted</p>
              </Card>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow bg-white border-gray-200">
                <Phone className="w-16 h-16 mx-auto mb-4 text-blue-800" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Soporte 24/7</h3>
                <p className="text-lg text-gray-700">Asistencia telefónica siempre disponible para ayudarle</p>
              </Card>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow bg-white border-gray-200">
                <Heart className="w-16 h-16 mx-auto mb-4 text-blue-800" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Confiable</h3>
                <p className="text-lg text-gray-700">Médicos verificados que confían en nosotros</p>
              </Card>
            </div>
          </div>
        </div>

        <div id="guia-interactiva" className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Tutorial Paso a Paso</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Siga estos pasos simples para aprender a usar todas las funciones de iMed
              </p>
            </div>
            <Tabs value={activeStep.toString()} onValueChange={(v) => setActiveStep(parseInt(v))} className="max-w-6xl mx-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8 h-auto bg-white p-2 rounded-lg border border-gray-200">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <TabsTrigger key={step.id} value={step.id.toString()} className="flex flex-col items-center p-4 text-center data-[state=active]:bg-blue-900 data-[state=active]:text-white text-gray-700 rounded-md">
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
                    <Card className="overflow-hidden bg-white border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 lg:p-12">
                          <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-900 text-white mr-4">
                              <Icon className="w-8 h-8" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-blue-900 uppercase">Paso {step.id} de {steps.length}</span>
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{step.title}</h3>
                            </div>
                          </div>
                          <p className="text-xl text-gray-700 mb-8">{step.description}</p>
                          <div className="space-y-4">
                            {step.instructions.map((instruction, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                                <p className="text-lg text-gray-800 leading-relaxed">{instruction}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-4 mt-8">
                            {step.id > 1 && (
                              <Button variant="outline" size="lg" onClick={() => setActiveStep(step.id - 1)} className="text-lg border-gray-300 text-gray-800 hover:bg-gray-100">
                                Anterior
                              </Button>
                            )}
                            {step.id < steps.length && (
                              <Button size="lg" onClick={() => setActiveStep(step.id + 1)} className="text-lg bg-blue-900 hover:bg-blue-950 text-white">
                                Siguiente Paso
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-100 lg:min-h-full">
                          <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Videos Tutoriales</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">Aprenda viendo estos videos paso a paso</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { title: "Cómo buscar un doctor", duration: "3:45", image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop" },
                { title: "Cómo agendar una cita", duration: "5:20", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop" },
                { title: "Cómo ver sus citas", duration: "2:30", image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop" },
                { title: "Cómo encontrar doctores cercanos", duration: "4:10", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&h=400&fit=crop" },
              ].map((video, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200">
                  <div className="relative">
                    <img src={video.image} alt={video.title} className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <Button size="lg" className="rounded-full w-20 h-20 bg-blue-900 hover:bg-blue-950">
                        <Volume2 className="w-10 h-10 text-white" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-semibold">{video.duration}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{video.title}</h3>
                    <p className="text-gray-700">Tutorial en video con instrucciones paso a paso</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="py-16 bg-blue-900 text-white">
          <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8">
            <Phone className="w-20 h-20 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">¿Necesita Ayuda Adicional?</h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-blue-100">
              Nuestro equipo de soporte está disponible para ayudarle. No dude en llamarnos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="tel:+50212345678">
                <Button size="lg" className="text-xl px-8 py-6 bg-white text-blue-900 hover:bg-blue-50 font-bold">
                  <Phone className="w-6 h-6 mr-2" />
                  +502 1234-5678
                </Button>
              </a>
              <span className="text-xl text-blue-100">o</span>
              <Link to="/">
                <Button size="lg" variant="outline" className="text-xl px-8 py-6 border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-900 font-bold" style={{color:'white'}}>
                  <Home className="w-6 h-6 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-lg text-blue-100">Horario de atención: Lunes a Domingo, 24 horas</p>
            <div className="mt-12 pt-10 border-t border-blue-700">
              <p className="text-2xl font-bold text-white mb-6">¿Listo para agendar su cita?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/doctores">
                  <Button size="lg" className="text-xl px-10 py-6 bg-white text-blue-900 hover:bg-blue-50 font-bold w-full sm:w-auto">
                    🔍 Buscar un Doctor
                  </Button>
                </Link>
                <Link to="/citas">
                  <Button size="lg" className="text-xl px-10 py-6 bg-cyan-400 text-blue-900 hover:bg-cyan-300 font-bold w-full sm:w-auto">
                    📅 Agendar mi Cita Ahora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeniorGuide;
