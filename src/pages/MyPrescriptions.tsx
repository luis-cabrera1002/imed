import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { RequirementCard } from "@/components/RequirementCard";
import { SendToPharmacyDialog } from "@/components/SendToPharmacyDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  prescriptions, 
  preAppointmentRequirements,
  getPrescriptionsByPatient,
  getPreAppointmentRequirements 
} from "@/data/medicinesData";
import { Prescription } from "@/types/medicines";
import { FileText, Calendar, User, Pill, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MyPrescriptions = () => {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [prescriptionToSend, setPrescriptionToSend] = useState<Prescription | null>(null);
  const [requirements, setRequirements] = useState(getPreAppointmentRequirements());
  
  // In a real app, this would come from authentication
  const currentUser = "Juan Pérez";
  const userPrescriptions = getPrescriptionsByPatient(currentUser);

  const handleCompleteRequirement = (id: string) => {
    setRequirements(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Mi Historial Médico</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Recetas y Pre-requisitos
              </h1>
              <p className="text-lg text-muted-foreground">
                Gestiona tus recetas médicas y prepárate para tus próximas citas
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <Tabs defaultValue="prescriptions" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recetas Médicas
                <Badge variant="secondary">{userPrescriptions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="requirements" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pre-requisitos
                <Badge variant="destructive">{requirements.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="space-y-6">
              {userPrescriptions.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tienes recetas médicas</h3>
                  <p className="text-muted-foreground mb-4">
                    Tus recetas aparecerán aquí después de tus consultas médicas
                  </p>
                  <Button onClick={() => window.location.href = '/citas'}>
                    Agendar Cita
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPrescriptions.map((prescription) => (
                    <PrescriptionCard
                      key={prescription.id}
                      prescription={prescription}
                      onViewDetails={setSelectedPrescription}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              {requirements.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    ¡Todo listo!
                  </h3>
                  <p className="text-muted-foreground">
                    No tienes pre-requisitos pendientes para tus próximas citas
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                        Importante
                      </h3>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Completa todos los pre-requisitos antes de tu cita para garantizar una
                      consulta efectiva y evitar reprogramaciones.
                    </p>
                  </div>

                  {requirements.map((requirement) => (
                    <RequirementCard
                      key={requirement.id}
                      requirement={requirement}
                      onComplete={handleCompleteRequirement}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Prescription Details Dialog */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPrescription && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Receta Médica Completa</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Doctor</p>
                      <p className="font-medium">{selectedPrescription.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {format(new Date(selectedPrescription.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="font-semibold mb-2">Diagnóstico</h3>
                  <p className="text-muted-foreground">{selectedPrescription.diagnosis}</p>
                </div>

                {/* Medicines */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Medicamentos Recetados
                  </h3>
                  <div className="space-y-4">
                    {selectedPrescription.medicines.map((med, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold mb-2">{med.medicineName}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Dosis</p>
                            <p className="font-medium">{med.dosage}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Frecuencia</p>
                            <p className="font-medium">{med.frequency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duración</p>
                            <p className="font-medium">{med.duration}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Instrucciones</p>
                            <p className="font-medium">{med.instructions}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Notas Adicionales</h3>
                    <p className="text-sm text-muted-foreground">{selectedPrescription.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" size="lg">
                    <Pill className="mr-2 h-5 w-5" />
                    Buscar en Farmacias
                  </Button>
                  <Button 
                    className="flex-1 gap-2" 
                    size="lg"
                    onClick={() => {
                      setPrescriptionToSend(selectedPrescription);
                      setSelectedPrescription(null);
                    }}
                  >
                    <Send className="h-5 w-5" />
                    Enviar a Farmacia
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send to Pharmacy Dialog */}
      <SendToPharmacyDialog
        open={!!prescriptionToSend}
        onOpenChange={(open) => !open && setPrescriptionToSend(null)}
        prescription={prescriptionToSend}
      />

      <Footer />
    </div>
  );
};

export default MyPrescriptions;
