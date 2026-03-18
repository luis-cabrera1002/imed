import { 
  User, Calendar, FileText, Pill, Activity, 
  TestTube, Download, Eye, AlertCircle, CheckCircle2,
  Heart, Thermometer, Weight, Droplets
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: "normal" | "abnormal" | "critical";
  results: {
    parameter: string;
    value: string;
    unit: string;
    reference: string;
    status: "normal" | "low" | "high";
  }[];
}

interface PatientDetail {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: { name: string; dose: string; frequency: string }[];
  labResults: LabResult[];
  insuranceProvider: string;
  insuranceNumber: string;
  emergencyContact: { name: string; phone: string; relationship: string };
}

// Mock patient details
const mockPatientDetails: Record<string, PatientDetail> = {
  "María García": {
    id: "MG001",
    name: "María García",
    avatar: "MG",
    age: 45,
    gender: "Femenino",
    phone: "+502 5555-1234",
    email: "maria.garcia@email.com",
    address: "Zona 10, Ciudad de Guatemala",
    bloodType: "O+",
    allergies: ["Penicilina", "Mariscos"],
    chronicConditions: ["Hipertensión", "Diabetes Tipo 2"],
    currentMedications: [
      { name: "Metformina", dose: "850mg", frequency: "2 veces al día" },
      { name: "Losartán", dose: "50mg", frequency: "1 vez al día" },
      { name: "Aspirina", dose: "100mg", frequency: "1 vez al día" }
    ],
    labResults: [
      {
        id: "LAB001",
        testName: "Hemograma Completo",
        date: "2024-01-10",
        status: "normal",
        results: [
          { parameter: "Hemoglobina", value: "13.5", unit: "g/dL", reference: "12.0-16.0", status: "normal" },
          { parameter: "Hematocrito", value: "40", unit: "%", reference: "36-46", status: "normal" },
          { parameter: "Leucocitos", value: "7,200", unit: "/μL", reference: "4,500-11,000", status: "normal" },
          { parameter: "Plaquetas", value: "245,000", unit: "/μL", reference: "150,000-400,000", status: "normal" }
        ]
      },
      {
        id: "LAB002",
        testName: "Perfil Glucémico",
        date: "2024-01-10",
        status: "abnormal",
        results: [
          { parameter: "Glucosa en ayunas", value: "142", unit: "mg/dL", reference: "70-100", status: "high" },
          { parameter: "Hemoglobina glicosilada (HbA1c)", value: "7.2", unit: "%", reference: "<5.7", status: "high" },
          { parameter: "Insulina", value: "15", unit: "μU/mL", reference: "2.6-24.9", status: "normal" }
        ]
      },
      {
        id: "LAB003",
        testName: "Perfil Lipídico",
        date: "2024-01-10",
        status: "abnormal",
        results: [
          { parameter: "Colesterol Total", value: "215", unit: "mg/dL", reference: "<200", status: "high" },
          { parameter: "HDL", value: "52", unit: "mg/dL", reference: ">40", status: "normal" },
          { parameter: "LDL", value: "138", unit: "mg/dL", reference: "<100", status: "high" },
          { parameter: "Triglicéridos", value: "165", unit: "mg/dL", reference: "<150", status: "high" }
        ]
      },
      {
        id: "LAB004",
        testName: "Función Renal",
        date: "2024-01-10",
        status: "normal",
        results: [
          { parameter: "Creatinina", value: "0.9", unit: "mg/dL", reference: "0.6-1.2", status: "normal" },
          { parameter: "Urea", value: "32", unit: "mg/dL", reference: "15-45", status: "normal" },
          { parameter: "TFG Estimada", value: "85", unit: "mL/min", reference: ">60", status: "normal" }
        ]
      }
    ],
    insuranceProvider: "Seguros G&T",
    insuranceNumber: "SGT-2024-001234",
    emergencyContact: { name: "Juan García", phone: "+502 5555-5678", relationship: "Esposo" }
  },
  "Carlos López": {
    id: "CL002",
    name: "Carlos López",
    avatar: "CL",
    age: 38,
    gender: "Masculino",
    phone: "+502 5555-2345",
    email: "carlos.lopez@email.com",
    address: "Zona 14, Ciudad de Guatemala",
    bloodType: "A+",
    allergies: ["Aspirina"],
    chronicConditions: ["Gastritis crónica"],
    currentMedications: [
      { name: "Omeprazol", dose: "20mg", frequency: "Antes del desayuno" }
    ],
    labResults: [
      {
        id: "LAB005",
        testName: "Hemograma Completo",
        date: "2024-01-08",
        status: "normal",
        results: [
          { parameter: "Hemoglobina", value: "15.2", unit: "g/dL", reference: "14.0-18.0", status: "normal" },
          { parameter: "Hematocrito", value: "44", unit: "%", reference: "40-54", status: "normal" },
          { parameter: "Leucocitos", value: "6,800", unit: "/μL", reference: "4,500-11,000", status: "normal" },
          { parameter: "Plaquetas", value: "198,000", unit: "/μL", reference: "150,000-400,000", status: "normal" }
        ]
      },
      {
        id: "LAB006",
        testName: "Test de H. Pylori",
        date: "2024-01-08",
        status: "abnormal",
        results: [
          { parameter: "Antígeno en heces", value: "Positivo", unit: "", reference: "Negativo", status: "high" }
        ]
      }
    ],
    insuranceProvider: "El Roble",
    insuranceNumber: "ER-2024-005678",
    emergencyContact: { name: "Ana de López", phone: "+502 5555-6789", relationship: "Esposa" }
  }
};

// Default detail for patients not in the mock data
const getDefaultPatientDetail = (patientName: string, avatar: string): PatientDetail => ({
  id: `DEFAULT-${Date.now()}`,
  name: patientName,
  avatar,
  age: 35,
  gender: "No especificado",
  phone: "+502 5555-0000",
  email: "paciente@email.com",
  address: "Ciudad de Guatemala",
  bloodType: "O+",
  allergies: [],
  chronicConditions: [],
  currentMedications: [],
  labResults: [],
  insuranceProvider: "Seguro General",
  insuranceNumber: "SG-2024-000000",
  emergencyContact: { name: "Contacto de Emergencia", phone: "+502 5555-0001", relationship: "Familiar" }
});

interface PatientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientAvatar: string;
}

const PatientDetailDialog = ({ open, onOpenChange, patientName, patientAvatar }: PatientDetailDialogProps) => {
  const patient = mockPatientDetails[patientName] || getDefaultPatientDetail(patientName, patientAvatar);

  const getStatusBadge = (status: "normal" | "abnormal" | "critical") => {
    switch (status) {
      case "normal": return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case "abnormal": return <Badge className="bg-yellow-100 text-yellow-800">Atención</Badge>;
      case "critical": return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
    }
  };

  const getValueColor = (status: "normal" | "low" | "high") => {
    switch (status) {
      case "normal": return "text-green-600";
      case "low": return "text-blue-600";
      case "high": return "text-red-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
              {patient.avatar}
            </div>
            <div>
              <span className="text-xl">{patient.name}</span>
              <p className="text-sm font-normal text-muted-foreground">
                {patient.age} años • {patient.gender} • {patient.bloodType}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 pt-2">
            {patient.allergies.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Alergias: {patient.allergies.join(", ")}
              </Badge>
            )}
            {patient.chronicConditions.map((condition, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {condition}
              </Badge>
            ))}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="text-xs">Información</TabsTrigger>
            <TabsTrigger value="medications" className="text-xs">Medicamentos</TabsTrigger>
            <TabsTrigger value="labs" className="text-xs">Laboratorios</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ScrollArea className="h-[350px] pr-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Datos Personales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Teléfono:</span> {patient.phone}</div>
                    <div><span className="text-muted-foreground">Email:</span> {patient.email}</div>
                    <div><span className="text-muted-foreground">Dirección:</span> {patient.address}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Seguro Médico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Proveedor:</span> {patient.insuranceProvider}</div>
                    <div><span className="text-muted-foreground">Número:</span> {patient.insuranceNumber}</div>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Condiciones de Salud
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicConditions.length > 0 ? (
                        patient.chronicConditions.map((condition, idx) => (
                          <Badge key={idx} variant="outline">{condition}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin condiciones crónicas registradas</span>
                      )}
                    </div>
                    {patient.allergies.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Alergias:</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="medications">
            <ScrollArea className="h-[350px] pr-4">
              {patient.currentMedications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay medicamentos activos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.currentMedications.map((med, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-muted/30 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.dose} - {med.frequency}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="labs">
            <ScrollArea className="h-[350px] pr-4">
              {patient.labResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay resultados de laboratorio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patient.labResults.map((lab) => (
                    <Card key={lab.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TestTube className="h-4 w-4 text-primary" />
                              {lab.testName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(lab.date), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(lab.status)}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {lab.results.map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                              <span className="text-muted-foreground">{result.parameter}</span>
                              <div className="flex items-center gap-4">
                                <span className={`font-medium ${getValueColor(result.status)}`}>
                                  {result.value} {result.unit}
                                </span>
                                <span className="text-xs text-muted-foreground w-24 text-right">
                                  Ref: {result.reference}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contact">
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contacto de Emergencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Nombre:</span>{" "}
                    <span className="font-medium">{patient.emergencyContact.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Teléfono:</span>{" "}
                    <span className="font-medium">{patient.emergencyContact.phone}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Relación:</span>{" "}
                    <span className="font-medium">{patient.emergencyContact.relationship}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailDialog;
