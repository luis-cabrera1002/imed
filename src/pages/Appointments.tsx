import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { doctors, clinics, getAllInsurances } from "@/data/mockData";
import { generateTimeSlots, addAppointment } from "@/data/appointmentsData";
import { getAllSpecialties } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";

const Appointments = () => {
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get("doctorId") || "";
  const initialClinicId = searchParams.get("clinicId") || "";
  const initialSpecialty = searchParams.get("specialty") || "";

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId);
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const specialties = getAllSpecialties();
  const insurances = getAllInsurances();

  // Filter doctors by specialty
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty || selectedSpecialty === "all") return doctors;
    return doctors.filter((doc) => doc.specialty === selectedSpecialty);
  }, [selectedSpecialty]);

  // Filter clinics by selected doctor
  const filteredClinics = useMemo(() => {
    if (!selectedDoctorId) return clinics;
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor) return clinics;
    return clinics.filter((clinic) => doctor.clinicIds.includes(clinic.id));
  }, [selectedDoctorId]);

  // Get available time slots
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedDoctorId || !selectedClinicId) return [];
    return generateTimeSlots(selectedDate, selectedDoctorId, selectedClinicId);
  }, [selectedDate, selectedDoctorId, selectedClinicId]);

  // Selected entities
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const selectedClinic = clinics.find((c) => c.id === selectedClinicId);

  const handleSubmitAppointment = () => {
    if (
      !patientName ||
      !patientEmail ||
      !patientPhone ||
      !selectedDoctorId ||
      !selectedClinicId ||
      !selectedDate ||
      !selectedTime ||
      !selectedInsurance
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const appointment = addAppointment({
      patientName,
      patientEmail,
      patientPhone,
      doctorId: selectedDoctorId,
      clinicId: selectedClinicId,
      specialty: selectedSpecialty,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      insurance: selectedInsurance,
      notes,
    });

    toast({
      title: "¡Cita agendada exitosamente!",
      description: `Tu cita ha sido registrada para el ${format(
        selectedDate,
        "d 'de' MMMM 'de' yyyy",
        { locale: es }
      )} a las ${selectedTime}`,
    });

    setStep(4); // Move to confirmation step
  };

  const canProceedToStep2 = selectedSpecialty && selectedDoctorId && selectedClinicId;
  const canProceedToStep3 = canProceedToStep2 && selectedDate && selectedTime;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Agendar Cita Médica</h1>
            <p className="text-muted-foreground">
              Programa tu consulta con los mejores especialistas de Guatemala
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { num: 1, label: "Seleccionar", icon: User },
                { num: 2, label: "Fecha y Hora", icon: Calendar },
                { num: 3, label: "Datos", icon: FileText },
                { num: 4, label: "Confirmación", icon: CheckCircle2 },
              ].map(({ num, label, icon: Icon }, idx) => (
                <div key={num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        step >= num
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="mt-2 text-xs font-medium text-center">
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        step > num ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-5xl mx-auto">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Paso 1: Selecciona Especialidad, Doctor y Clínica</CardTitle>
                  <CardDescription>
                    Elige la especialidad médica, el doctor de tu preferencia y el centro médico
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Specialty Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidad Médica *</Label>
                    <Select
                      value={selectedSpecialty}
                      onValueChange={setSelectedSpecialty}
                    >
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las especialidades</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor *</Label>
                    <Select
                      value={selectedDoctorId}
                      onValueChange={setSelectedDoctorId}
                      disabled={!selectedSpecialty || selectedSpecialty === "all"}
                    >
                      <SelectTrigger id="doctor">
                        <SelectValue placeholder="Selecciona un doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <span>{doctor.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {doctor.specialty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ★ {doctor.rating}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDoctor && (
                      <div className="p-4 mt-2 border rounded-lg bg-muted/50">
                        <div className="flex items-start gap-4">
                          <img
                            src={selectedDoctor.image}
                            alt={selectedDoctor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{selectedDoctor.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedDoctor.specialty}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedDoctor.experience} años de experiencia
                            </p>
                            <p className="text-sm mt-1">
                              <strong>Educación:</strong> {selectedDoctor.education}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clinic Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="clinic">Centro Médico *</Label>
                    <Select
                      value={selectedClinicId}
                      onValueChange={setSelectedClinicId}
                      disabled={!selectedDoctorId}
                    >
                      <SelectTrigger id="clinic">
                        <SelectValue placeholder="Selecciona un centro médico" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredClinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{clinic.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {clinic.city}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClinic && (
                      <div className="p-4 mt-2 border rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-2">{selectedClinic.name}</h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {selectedClinic.address}, {selectedClinic.city}
                          </p>
                          <p>
                            <strong>Horario:</strong> {selectedClinic.schedule.weekdays}{" "}
                            (Lunes a Viernes)
                          </p>
                          <p>
                            <strong>Fin de semana:</strong>{" "}
                            {selectedClinic.schedule.weekend}
                          </p>
                          {selectedClinic.emergency && (
                            <Badge variant="destructive" className="mt-2">
                              Emergencias 24/7
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="w-full"
                  >
                    Continuar a Fecha y Hora
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <AppointmentCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
                {selectedDate && (
                  <TimeSlotPicker
                    slots={timeSlots}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                    date={selectedDate}
                  />
                )}
                <div className="lg:col-span-2 flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Volver
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedToStep3}
                    className="flex-1"
                  >
                    Continuar a Datos del Paciente
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Paso 3: Información del Paciente</CardTitle>
                  <CardDescription>
                    Completa tus datos personales y seguro médico
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Patient Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        placeholder="Juan Pérez"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+502 1234-5678"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance">Seguro Médico *</Label>
                      <Select
                        value={selectedInsurance}
                        onValueChange={setSelectedInsurance}
                      >
                        <SelectTrigger id="insurance">
                          <SelectValue placeholder="Selecciona tu seguro" />
                        </SelectTrigger>
                        <SelectContent>
                          {insurances.map((insurance) => (
                            <SelectItem key={insurance} value={insurance}>
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {insurance}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="particular">Particular (Sin seguro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe brevemente el motivo de tu consulta o información relevante para el doctor..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-3">Resumen de tu cita</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Doctor:</strong> {selectedDoctor?.name}
                      </p>
                      <p>
                        <strong>Especialidad:</strong> {selectedSpecialty}
                      </p>
                      <p>
                        <strong>Clínica:</strong> {selectedClinic?.name}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {selectedDate &&
                          format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      <p>
                        <strong>Hora:</strong> {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Volver
                    </Button>
                    <Button onClick={handleSubmitAppointment} className="flex-1">
                      Confirmar Cita
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="border-2 border-primary">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">¡Cita Agendada Exitosamente!</CardTitle>
                  <CardDescription>
                    Hemos enviado un correo de confirmación a {patientEmail}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border rounded-lg bg-muted/50 space-y-4">
                    <h4 className="font-semibold text-lg mb-4">Detalles de tu cita</h4>
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Doctor</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoctor?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedSpecialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Centro Médico</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedClinic?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedClinic?.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Fecha y Hora</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedDate &&
                              format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                                locale: es,
                              })}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedTime}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Seguro Médico</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedInsurance}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          Importante
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 mt-1">
                          Por favor llega 15 minutos antes de tu cita. Recuerda traer tu
                          documento de identidad y tarjeta de seguro médico.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => window.location.href = "/"}>
                      Volver al Inicio
                    </Button>
                    <Button className="flex-1" onClick={() => window.location.href = "/citas"}>
                      Agendar Otra Cita
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Appointments;
