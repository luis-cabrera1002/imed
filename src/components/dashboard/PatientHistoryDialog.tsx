import { 
  Calendar, Clock, FileText, Pill, Activity, 
  Stethoscope, Heart, Thermometer, Weight
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientHistory {
  id: string;
  patientName: string;
  avatar: string;
  age: number;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  visits: {
    date: string;
    type: string;
    diagnosis: string;
    notes: string;
    prescriptions: string[];
    doctor: string;
  }[];
  vitals: {
    date: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
  }[];
}

// Mock patient histories
const mockPatientHistories: Record<string, PatientHistory> = {
  "María García": {
    id: "MG001",
    patientName: "María García",
    avatar: "MG",
    age: 45,
    bloodType: "O+",
    allergies: ["Penicilina", "Mariscos"],
    chronicConditions: ["Hipertensión", "Diabetes Tipo 2"],
    visits: [
      {
        date: "2024-01-15",
        type: "Consulta General",
        diagnosis: "Control de diabetes",
        notes: "Paciente estable, se ajusta medicación de metformina.",
        prescriptions: ["Metformina 850mg - 2 veces al día", "Losartán 50mg - 1 vez al día"],
        doctor: "Dr. Carlos García"
      },
      {
        date: "2023-12-01",
        type: "Urgencia",
        diagnosis: "Infección urinaria",
        notes: "Síntomas de ITU, se prescribe antibiótico.",
        prescriptions: ["Ciprofloxacino 500mg - cada 12 horas por 7 días"],
        doctor: "Dra. Ana López"
      },
      {
        date: "2023-10-20",
        type: "Seguimiento",
        diagnosis: "Revisión anual",
        notes: "Exámenes de laboratorio dentro de parámetros normales.",
        prescriptions: [],
        doctor: "Dr. Carlos García"
      }
    ],
    vitals: [
      { date: "2024-01-15", bloodPressure: "130/85", heartRate: 72, temperature: 36.5, weight: 68 },
      { date: "2023-12-01", bloodPressure: "140/90", heartRate: 88, temperature: 37.8, weight: 69 },
      { date: "2023-10-20", bloodPressure: "128/82", heartRate: 70, temperature: 36.4, weight: 67 }
    ]
  },
  "Carlos López": {
    id: "CL002",
    patientName: "Carlos López",
    avatar: "CL",
    age: 38,
    bloodType: "A+",
    allergies: ["Aspirina"],
    chronicConditions: ["Gastritis crónica"],
    visits: [
      {
        date: "2024-01-10",
        type: "Seguimiento",
        diagnosis: "Control de gastritis",
        notes: "Mejoría notable con tratamiento actual.",
        prescriptions: ["Omeprazol 20mg - antes del desayuno"],
        doctor: "Dr. Carlos García"
      },
      {
        date: "2023-11-15",
        type: "Consulta General",
        diagnosis: "Dolor epigástrico",
        notes: "Se solicitan estudios de endoscopia.",
        prescriptions: ["Omeprazol 40mg - cada 12 horas", "Sucralfato 1g - antes de comidas"],
        doctor: "Dr. Carlos García"
      }
    ],
    vitals: [
      { date: "2024-01-10", bloodPressure: "118/75", heartRate: 68, temperature: 36.3, weight: 75 },
      { date: "2023-11-15", bloodPressure: "125/80", heartRate: 74, temperature: 36.6, weight: 76 }
    ]
  },
  "Ana Rodríguez": {
    id: "AR003",
    patientName: "Ana Rodríguez",
    avatar: "AR",
    age: 29,
    bloodType: "B-",
    allergies: [],
    chronicConditions: [],
    visits: [],
    vitals: []
  }
};

// Default history for patients not in the mock data
const getDefaultHistory = (patientName: string, avatar: string): PatientHistory => ({
  id: `DEFAULT-${Date.now()}`,
  patientName,
  avatar,
  age: 35,
  bloodType: "O+",
  allergies: [],
  chronicConditions: [],
  visits: [
    {
      date: "2024-01-05",
      type: "Primera Visita",
      diagnosis: "Evaluación inicial",
      notes: "Paciente nuevo, se realiza historia clínica completa.",
      prescriptions: [],
      doctor: "Dr. Carlos García"
    }
  ],
  vitals: [
    { date: "2024-01-05", bloodPressure: "120/80", heartRate: 72, temperature: 36.5, weight: 70 }
  ]
});

interface PatientHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientAvatar: string;
}

const PatientHistoryDialog = ({ open, onOpenChange, patientName, patientAvatar }: PatientHistoryDialogProps) => {
  const history = mockPatientHistories[patientName] || getDefaultHistory(patientName, patientAvatar);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {history.avatar}
            </div>
            <div>
              <span>{history.patientName}</span>
              <p className="text-sm font-normal text-muted-foreground">
                {history.age} años • Tipo de sangre: {history.bloodType}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 pt-2">
            {history.allergies.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                Alergias: {history.allergies.join(", ")}
              </Badge>
            )}
            {history.chronicConditions.map((condition, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {condition}
              </Badge>
            ))}
            {history.allergies.length === 0 && history.chronicConditions.length === 0 && (
              <Badge variant="outline" className="text-xs">Sin condiciones conocidas</Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visits" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visits">Historial de Visitas</TabsTrigger>
            <TabsTrigger value="vitals">Signos Vitales</TabsTrigger>
          </TabsList>

          <TabsContent value="visits">
            <ScrollArea className="h-[350px] pr-4">
              {history.visits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Primera visita del paciente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.visits.map((visit, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {format(new Date(visit.date), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>
                        <Badge variant="outline">{visit.type}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Diagnóstico:</span>{" "}
                            <span className="text-muted-foreground">{visit.diagnosis}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">Notas:</span>{" "}
                            <span className="text-muted-foreground">{visit.notes}</span>
                          </div>
                        </div>
                        {visit.prescriptions.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Pill className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Recetas:</span>
                              <ul className="list-disc list-inside text-muted-foreground ml-2">
                                {visit.prescriptions.map((rx, rxIdx) => (
                                  <li key={rxIdx}>{rx}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground pt-2">
                          Atendido por: {visit.doctor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="vitals">
            <ScrollArea className="h-[350px] pr-4">
              {history.vitals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay registros de signos vitales</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.vitals.map((vital, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          {format(new Date(vital.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <Heart className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Presión</p>
                            <p className="font-semibold text-sm">{vital.bloodPressure}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
                          <Activity className="h-4 w-4 text-pink-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Pulso</p>
                            <p className="font-semibold text-sm">{vital.heartRate} bpm</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Temp.</p>
                            <p className="font-semibold text-sm">{vital.temperature}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <Weight className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Peso</p>
                            <p className="font-semibold text-sm">{vital.weight} kg</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientHistoryDialog;
