import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, FileText, Pill, CheckCircle, XCircle, AlertCircle, ClipboardList, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PreConsultationFormDialog from '@/components/PreConsultationFormDialog';
import { getFormBySpecialty } from '@/data/preConsultationForms';

// Datos de ejemplo
const mockAppointments = [
  {
    id: '1',
    date: '2024-12-15',
    time: '10:00',
    doctor: 'Dr. Carlos Méndez',
    specialty: 'Cardiología',
    clinic: 'Centro Médico Guatemala',
    status: 'confirmed',
    notes: 'Revisión de presión arterial y resultados de análisis',
    formFilled: false,
  },
  {
    id: '2',
    date: '2024-12-20',
    time: '14:30',
    doctor: 'Dra. María López',
    specialty: 'Pediatría',
    clinic: 'Hospital Herrera Llerandi',
    status: 'pending',
    notes: 'Control de vacunación',
    formFilled: false,
  }
];

const mockHistory = [
  {
    id: 'h1',
    date: '2024-11-10',
    time: '09:00',
    doctor: 'Dr. Roberto García',
    specialty: 'Medicina General',
    clinic: 'Sanatorio El Pilar',
    status: 'completed',
    diagnosis: 'Gripe estacional',
    doctorNotes: 'Paciente presentó síntomas de gripe común. Se recomienda reposo, hidratación abundante y seguimiento de tratamiento prescrito.',
    prescription: {
      id: 'rx1',
      medicines: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Cada 8 horas', duration: '5 días', instructions: 'Tomar con alimentos' },
        { name: 'Vitamina C', dosage: '1000mg', frequency: 'Una vez al día', duration: '7 días', instructions: 'Tomar en ayunas' }
      ]
    },
    followUp: 'Control en 7 días si persisten los síntomas'
  },
  {
    id: 'h2',
    date: '2024-10-05',
    time: '15:30',
    doctor: 'Dra. Ana Martínez',
    specialty: 'Dermatología',
    clinic: 'Centro Médico Guatemala',
    status: 'completed',
    diagnosis: 'Dermatitis de contacto',
    doctorNotes: 'Se observa irritación en la piel debido a alergia por contacto. Se prescribe tratamiento tópico y se recomienda evitar el contacto con detergentes fuertes.',
    prescription: {
      id: 'rx2',
      medicines: [
        { name: 'Crema de Hidrocortisona', dosage: '1%', frequency: 'Aplicar 2 veces al día', duration: '14 días', instructions: 'Aplicar en zona afectada después de limpiar' }
      ]
    },
    followUp: 'Control en 2 semanas'
  },
  {
    id: 'h3',
    date: '2024-09-15',
    time: '11:00',
    doctor: 'Dr. José Ramírez',
    specialty: 'Oftalmología',
    clinic: 'Hospital Centro Médico',
    status: 'completed',
    diagnosis: 'Actualización de graduación de lentes',
    doctorNotes: 'Se realizó examen completo de la vista. La graduación ha cambiado ligeramente. Se entrega nueva receta para lentes.',
    prescription: { id: 'rx3', medicines: [] },
    followUp: 'Control anual de rutina'
  }
];

const MyAppointments = () => {
  const navigate = useNavigate();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [filledForms, setFilledForms] = useState<Record<string, boolean>>({});

  const handleOpenForm = (specialty: string, appointmentId: string) => {
    setSelectedSpecialty(specialty);
    setSelectedPatientName(''); // patient fills their own
    setFormDialogOpen(true);
  };

  const handleFormSubmit = (answers: Record<string, string | string[] | boolean>) => {
    // Mark form as filled for demo
    setFilledForms(prev => ({ ...prev, [selectedSpecialty]: true }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Mis Citas Médicas</h1>
            <p className="text-lg text-muted-foreground">Gestiona tus citas próximas y revisa tu historial médico</p>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
              <TabsTrigger value="upcoming" className="text-base">
                <Calendar className="w-4 h-4 mr-2" />
                Próximas Citas
              </TabsTrigger>
              <TabsTrigger value="history" className="text-base">
                <FileText className="w-4 h-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            {/* Upcoming */}
            <TabsContent value="upcoming" className="space-y-4">
              {mockAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No tienes citas programadas</h3>
                    <p className="text-muted-foreground mb-6">Agenda tu primera cita médica</p>
                    <Button onClick={() => navigate('/citas')}>Agendar Cita</Button>
                  </CardContent>
                </Card>
              ) : (
                mockAppointments.map((appointment) => {
                  const isFormFilled = filledForms[appointment.specialty];
                  return (
                    <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-2xl">{appointment.doctor}</CardTitle>
                            <CardDescription className="text-base">{appointment.specialty}</CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1 text-sm px-3 py-1`}>
                            {getStatusIcon(appointment.status)}
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Fecha</p>
                              <p className="font-semibold text-base">
                                {format(new Date(appointment.date), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                            <Clock className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Hora</p>
                              <p className="font-semibold text-base">{appointment.time}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Ubicación</p>
                            <p className="font-semibold text-base">{appointment.clinic}</p>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                            <FileText className="w-5 h-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Notas</p>
                              <p className="text-base">{appointment.notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Pre-consultation form CTA */}
                        <div className={`p-4 rounded-lg border-2 border-dashed ${
                          isFormFilled
                            ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                            : 'border-primary/30 bg-primary/5'
                        }`}>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                isFormFilled ? 'bg-green-100' : 'bg-primary/10'
                              }`}>
                                {isFormFilled
                                  ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  : <ClipboardList className="h-5 w-5 text-primary" />
                                }
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {isFormFilled ? 'Formulario Pre-Consulta Enviado' : 'Formulario Pre-Consulta Pendiente'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isFormFilled
                                    ? 'Su formulario ha sido enviado al doctor exitosamente.'
                                    : `Complete el formulario de ${appointment.specialty} antes de su cita.`
                                  }
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isFormFilled ? 'outline' : 'default'}
                              onClick={() => handleOpenForm(appointment.specialty, appointment.id)}
                              className="gap-1"
                            >
                              <ClipboardList className="h-4 w-4" />
                              {isFormFilled ? 'Ver / Editar' : 'Llenar Formulario'}
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button variant="outline" className="flex-1 text-base" onClick={() => navigate('/clinicas?view=mapa')}>
                            Ver en Mapa
                          </Button>
                          {appointment.status === 'pending' && (
                            <Button variant="outline" className="flex-1 text-base text-destructive hover:bg-destructive/10">
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-4">
              {mockHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No hay historial disponible</h3>
                    <p className="text-muted-foreground">Tu historial de citas aparecerá aquí</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {mockHistory.map((record) => (
                    <Card key={record.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-2xl">{record.doctor}</CardTitle>
                            <CardDescription className="text-base">{record.specialty} - {record.clinic}</CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(record.status)} flex items-center gap-1 text-sm px-3 py-1`}>
                            {getStatusIcon(record.status)}
                            {getStatusText(record.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(record.date), "d 'de' MMMM, yyyy", { locale: es })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {record.time}
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Diagnóstico
                          </h4>
                          <p className="text-base bg-secondary/50 p-3 rounded-lg">{record.diagnosis}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Comentarios del Doctor
                          </h4>
                          <p className="text-base bg-accent/50 p-4 rounded-lg leading-relaxed">{record.doctorNotes}</p>
                        </div>
                        {record.prescription.medicines.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                              <Pill className="w-5 h-5 text-primary" /> Receta Médica
                            </h4>
                            <div className="space-y-3">
                              {record.prescription.medicines.map((medicine, idx) => (
                                <div key={idx} className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-semibold text-lg">{medicine.name}</p>
                                      <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Frecuencia</p>
                                      <p className="font-medium">{medicine.frequency}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Duración</p>
                                      <p className="font-medium">{medicine.duration}</p>
                                    </div>
                                  </div>
                                  <div className="bg-background p-2 rounded text-sm mt-2">
                                    <p className="text-muted-foreground">Instrucciones:</p>
                                    <p className="font-medium">{medicine.instructions}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {record.followUp && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <strong>Seguimiento:</strong> {record.followUp}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Pre-consultation Form Dialog */}
      {selectedSpecialty && (
        <PreConsultationFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          template={getFormBySpecialty(selectedSpecialty)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default MyAppointments;
