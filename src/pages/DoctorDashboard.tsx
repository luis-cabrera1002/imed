import { useState } from "react";
import { 
  Calendar, Clock, Users, CheckCircle, XCircle, 
  TrendingUp, Activity, Building2, Star, 
  ChevronLeft, ChevronRight, MoreVertical, Eye, User, ClipboardList, FileText
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PatientHistoryDialog from "@/components/dashboard/PatientHistoryDialog";
import RescheduleDialog from "@/components/dashboard/RescheduleDialog";
import PatientDetailDialog from "@/components/dashboard/PatientDetailDialog";
import PreConsultationFormDialog from "@/components/PreConsultationFormDialog";
import ViewFilledFormDialog from "@/components/dashboard/ViewFilledFormDialog";
import { getFormBySpecialty, mockFilledForms, FilledForm } from "@/data/preConsultationForms";

interface Appointment {
  id: number;
  patient: string;
  time: string;
  type: string;
  status: string;
  avatar: string;
  specialty?: string;
}

const mockAppointments: Appointment[] = [
  { id: 1, patient: "María García", time: "08:00", type: "Consulta General", status: "confirmed", avatar: "MG", specialty: "Cardiología" },
  { id: 2, patient: "Carlos López", time: "08:30", type: "Seguimiento", status: "confirmed", avatar: "CL", specialty: "Cardiología" },
  { id: 3, patient: "Ana Rodríguez", time: "09:00", type: "Primera Visita", status: "pending", avatar: "AR", specialty: "Medicina General" },
  { id: 4, patient: "José Martínez", time: "09:30", type: "Consulta General", status: "confirmed", avatar: "JM", specialty: "Cardiología" },
  { id: 5, patient: "Laura Hernández", time: "10:00", type: "Resultados", status: "completed", avatar: "LH", specialty: "Cardiología" },
  { id: 6, patient: "Pedro Sánchez", time: "10:30", type: "Consulta General", status: "completed", avatar: "PS", specialty: "Medicina General" },
  { id: 7, patient: "Isabel Torres", time: "11:00", type: "Seguimiento", status: "confirmed", avatar: "IT", specialty: "Cardiología" },
  { id: 8, patient: "Miguel Díaz", time: "14:00", type: "Consulta General", status: "pending", avatar: "MD", specialty: "Medicina General" },
  { id: 9, patient: "Carmen Flores", time: "14:30", type: "Primera Visita", status: "confirmed", avatar: "CF", specialty: "Cardiología" },
  { id: 10, patient: "Roberto Ruiz", time: "15:00", type: "Seguimiento", status: "cancelled", avatar: "RR", specialty: "Cardiología" },
];

const hospitalHours = [
  { hospital: "Hospital General San Juan", days: "Lun-Vie", hours: "08:00 - 14:00", color: "bg-primary/10 text-primary" },
  { hospital: "Clínica Santa María", days: "Lun-Mié", hours: "15:00 - 19:00", color: "bg-secondary/10 text-secondary" },
  { hospital: "Centro Médico La Paz", days: "Jue-Vie", hours: "15:00 - 18:00", color: "bg-accent/10 text-accent-foreground" },
];

const DoctorDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form-related states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formSpecialty, setFormSpecialty] = useState('');
  const [viewFormDialogOpen, setViewFormDialogOpen] = useState(false);
  const [selectedFilledForm, setSelectedFilledForm] = useState<FilledForm | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayAppointments = mockAppointments;
  const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;
  const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = todayAppointments.filter(a => a.status === 'cancelled').length;

  const handleViewHistory = (appointment: Appointment) => { setSelectedAppointment(appointment); setHistoryDialogOpen(true); };
  const handleReschedule = (appointment: Appointment) => { setSelectedAppointment(appointment); setRescheduleDialogOpen(true); };
  const handleViewDetail = (appointment: Appointment) => { setSelectedAppointment(appointment); setDetailDialogOpen(true); };

  const handleSendForm = (appointment: Appointment) => {
    setFormSpecialty(appointment.specialty || 'Medicina General');
    setFormDialogOpen(true);
  };

  const handleViewFilledForm = (appointment: Appointment) => {
    const filled = mockFilledForms.find(f => f.patientName === appointment.patient);
    if (filled) {
      setSelectedFilledForm(filled);
      setViewFormDialogOpen(true);
    }
  };

  const getPatientHasForm = (patient: string) => mockFilledForms.some(f => f.patientName === patient);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Buenos días, Dr. García 👋</h1>
          <p className="text-muted-foreground mt-1">{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pendientes', count: pendingCount, icon: <Clock className="h-5 w-5 text-yellow-600" />, border: 'border-l-yellow-500', bg: 'bg-yellow-100' },
            { label: 'Confirmadas', count: confirmedCount, icon: <Users className="h-5 w-5 text-blue-600" />, border: 'border-l-blue-500', bg: 'bg-blue-100' },
            { label: 'Completadas', count: completedCount, icon: <CheckCircle className="h-5 w-5 text-green-600" />, border: 'border-l-green-500', bg: 'bg-green-100' },
            { label: 'Canceladas', count: cancelledCount, icon: <XCircle className="h-5 w-5 text-red-600" />, border: 'border-l-red-500', bg: 'bg-red-100' },
          ].map(s => (
            <Card key={s.label} className={`border-l-4 ${s.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground">{s.count}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-full ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Week Calendar */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Calendario Semanal
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    const appointmentCount = Math.floor(Math.random() * 8) + 2;
                    return (
                      <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                            : isToday ? 'bg-primary/10 text-primary border-2 border-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}>
                        <p className="text-xs font-medium opacity-70">{format(day, 'EEE', { locale: es })}</p>
                        <p className="text-lg font-bold">{format(day, 'd')}</p>
                        <p className="text-xs mt-1">{appointmentCount} citas</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Citas de Hoy</CardTitle>
                    <CardDescription>{todayAppointments.length} citas programadas</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Ver Todas</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => {
                    const hasForm = getPatientHasForm(appointment.patient);
                    return (
                      <div key={appointment.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-bold text-foreground">{appointment.time}</p>
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">{appointment.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{appointment.patient}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                        {hasForm && (
                          <Badge variant="outline" className="gap-1 text-xs border-green-300 text-green-700 bg-green-50 cursor-pointer hover:bg-green-100"
                            onClick={() => handleViewFilledForm(appointment)}>
                            <ClipboardList className="h-3 w-3" /> Formulario
                          </Badge>
                        )}
                        <Badge className={`${getStatusColor(appointment.status)} border`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
                            {hasForm ? (
                              <DropdownMenuItem onClick={() => handleViewFilledForm(appointment)}>
                                <FileText className="h-4 w-4 mr-2" /> Ver Formulario Pre-Consulta
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleSendForm(appointment)}>
                                <ClipboardList className="h-4 w-4 mr-2" /> Enviar Formulario Pre-Consulta
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleViewHistory(appointment)}>
                              <Eye className="h-4 w-4 mr-2" /> Ver Historial
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetail(appointment)}>
                              <User className="h-4 w-4 mr-2" /> Ver Paciente Completo
                            </DropdownMenuItem>
                            <DropdownMenuItem>Iniciar Consulta</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReschedule(appointment)}>
                              <Calendar className="h-4 w-4 mr-2" /> Reagendar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Citas Completadas', val: 87 },
                  { label: 'Satisfacción Pacientes', val: 94 },
                  { label: 'Puntualidad', val: 91 },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-medium">{m.val}%</span>
                    </div>
                    <Progress value={m.val} className="h-2" />
                  </div>
                ))}
                <div className="pt-2 border-t flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold">4.8</span>
                  <span className="text-muted-foreground text-sm">(256 reseñas)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Horarios en Hospitales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hospitalHours.map((schedule, index) => (
                  <div key={index} className={`p-3 rounded-lg ${schedule.color}`}>
                    <p className="font-medium text-sm">{schedule.hospital}</p>
                    <div className="flex justify-between mt-1 text-xs opacity-80">
                      <span>{schedule.days}</span>
                      <span>{schedule.hours}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Formularios Recibidos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" /> Formularios Recibidos
                </CardTitle>
                <CardDescription>{mockFilledForms.length} formularios pendientes de revisión</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockFilledForms.map(form => (
                  <div key={form.id}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3"
                    onClick={() => { setSelectedFilledForm(form); setViewFormDialogOpen(true); }}>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{form.patientName}</p>
                      <p className="text-xs text-muted-foreground">{form.specialty}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                      {form.status === 'submitted' ? 'Nuevo' : 'Revisado'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Estadísticas del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: '142', label: 'Pacientes Atendidos', color: 'text-primary' },
                    { val: '28', label: 'Nuevos Pacientes', color: 'text-secondary' },
                    { val: 'Q 45,200', label: 'Ingresos', color: 'text-green-600' },
                    { val: '18 min', label: 'Tiempo Promedio', color: 'text-foreground' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      <PatientHistoryDialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen} patientName={selectedAppointment?.patient || ""} patientAvatar={selectedAppointment?.avatar || ""} />
      <RescheduleDialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen} appointment={selectedAppointment} />
      <PatientDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} patientName={selectedAppointment?.patient || ""} patientAvatar={selectedAppointment?.avatar || ""} />
      
      {formSpecialty && (
        <PreConsultationFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          template={getFormBySpecialty(formSpecialty)}
          patientName={selectedAppointment?.patient}
        />
      )}

      <ViewFilledFormDialog
        open={viewFormDialogOpen}
        onOpenChange={setViewFormDialogOpen}
        filledForm={selectedFilledForm}
      />
    </div>
  );
};

export default DoctorDashboard;
