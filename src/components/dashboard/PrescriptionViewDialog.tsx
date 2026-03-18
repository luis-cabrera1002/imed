import { 
  FileText, User, Calendar, Pill, Stethoscope, 
  AlertCircle, CheckCircle, Phone, Clock
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
import { Separator } from "@/components/ui/separator";

interface PrescriptionDetail {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientAllergies: string[];
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  diagnosis: string;
  prescriptionDate: string;
  expirationDate: string;
  medicines: {
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
  }[];
  notes: string;
  isVerified: boolean;
}

// Mock prescription data
const mockPrescriptions: Record<string, PrescriptionDetail> = {
  "ORD-001": {
    id: "RX-2024-001",
    patientName: "María García",
    patientPhone: "+502 5555-1234",
    patientAge: 45,
    patientAllergies: ["Penicilina", "Mariscos"],
    doctorName: "Dr. Carlos García",
    doctorSpecialty: "Medicina Interna",
    doctorLicense: "COL-GT-12345",
    diagnosis: "Control de diabetes tipo 2 e hipertensión arterial",
    prescriptionDate: "2024-01-15",
    expirationDate: "2024-02-15",
    medicines: [
      { 
        name: "Paracetamol 500mg", 
        dose: "500mg", 
        frequency: "Cada 8 horas", 
        duration: "7 días",
        instructions: "Tomar después de los alimentos",
        quantity: 20
      },
      { 
        name: "Omeprazol 20mg", 
        dose: "20mg", 
        frequency: "Una vez al día", 
        duration: "14 días",
        instructions: "Tomar en ayunas, 30 minutos antes del desayuno",
        quantity: 14
      }
    ],
    notes: "Paciente debe continuar con dieta baja en sodio y carbohidratos. Control en 2 semanas.",
    isVerified: true
  },
  "ORD-002": {
    id: "RX-2024-002",
    patientName: "Carlos López",
    patientPhone: "+502 5555-2345",
    patientAge: 38,
    patientAllergies: ["Aspirina"],
    doctorName: "Dr. Carlos García",
    doctorSpecialty: "Medicina Interna",
    doctorLicense: "COL-GT-12345",
    diagnosis: "Gastritis crónica por H. Pylori",
    prescriptionDate: "2024-01-14",
    expirationDate: "2024-02-14",
    medicines: [
      { 
        name: "Losartán 50mg", 
        dose: "50mg", 
        frequency: "Una vez al día", 
        duration: "30 días",
        instructions: "Tomar por la mañana con agua",
        quantity: 30
      }
    ],
    notes: "Esquema de erradicación completado. Verificar test de H. Pylori en 4 semanas.",
    isVerified: true
  },
  "ORD-004": {
    id: "RX-2024-003",
    patientName: "José Martínez",
    patientPhone: "+502 5555-3456",
    patientAge: 55,
    patientAllergies: [],
    doctorName: "Dra. Ana López",
    doctorSpecialty: "Endocrinología",
    doctorLicense: "COL-GT-23456",
    diagnosis: "Diabetes Mellitus tipo 2 con control glucémico subóptimo",
    prescriptionDate: "2024-01-13",
    expirationDate: "2024-04-13",
    medicines: [
      { 
        name: "Metformina 850mg", 
        dose: "850mg", 
        frequency: "Dos veces al día", 
        duration: "90 días",
        instructions: "Tomar con el almuerzo y la cena",
        quantity: 60
      },
      { 
        name: "Glibenclamida 5mg", 
        dose: "5mg", 
        frequency: "Una vez al día", 
        duration: "30 días",
        instructions: "Tomar antes del desayuno",
        quantity: 30
      }
    ],
    notes: "Paciente debe monitorear glucosa en ayunas diariamente. Meta: <130 mg/dL.",
    isVerified: true
  }
};

// Default prescription for orders not in the mock data
const getDefaultPrescription = (orderId: string, patientName: string): PrescriptionDetail => ({
  id: `RX-${orderId}`,
  patientName,
  patientPhone: "+502 5555-0000",
  patientAge: 30,
  patientAllergies: [],
  doctorName: "Dr. Médico General",
  doctorSpecialty: "Medicina General",
  doctorLicense: "COL-GT-00000",
  diagnosis: "Consulta general",
  prescriptionDate: format(new Date(), "yyyy-MM-dd"),
  expirationDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  medicines: [
    {
      name: "Medicamento prescrito",
      dose: "Según indicación",
      frequency: "Según indicación",
      duration: "Según indicación",
      instructions: "Seguir instrucciones del médico",
      quantity: 1
    }
  ],
  notes: "",
  isVerified: false
});

interface PrescriptionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  patientName: string;
}

const PrescriptionViewDialog = ({ open, onOpenChange, orderId, patientName }: PrescriptionViewDialogProps) => {
  const prescription = mockPrescriptions[orderId] || getDefaultPrescription(orderId, patientName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Receta Médica - {prescription.id}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {prescription.isVerified ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Receta Verificada
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pendiente de Verificación
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Información del Paciente
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{prescription.patientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Edad:</span>
                  <p className="font-medium">{prescription.patientAge} años</p>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Teléfono:</span>
                  <p className="font-medium">{prescription.patientPhone}</p>
                </div>
                <div>
                  {prescription.patientAllergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-muted-foreground">Alergias:</span>
                      {prescription.patientAllergies.map((allergy, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">Sin alergias conocidas</span>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Médico Prescriptor
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{prescription.doctorName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Especialidad:</span>
                  <p className="font-medium">{prescription.doctorSpecialty}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">No. Colegiado:</span>
                  <p className="font-medium">{prescription.doctorLicense}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold text-sm mb-2">Diagnóstico</h3>
              <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
            </div>

            {/* Prescription Dates */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fecha emisión:</span>
                <span className="font-medium">
                  {format(new Date(prescription.prescriptionDate), "d MMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Válida hasta:</span>
                <span className="font-medium">
                  {format(new Date(prescription.expirationDate), "d MMM yyyy", { locale: es })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Medicines */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Medicamentos Prescritos
              </h3>
              <div className="space-y-3">
                {prescription.medicines.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.dose}</p>
                      </div>
                      <Badge variant="outline">Cant: {med.quantity}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div>
                        <span className="text-muted-foreground">Frecuencia:</span>
                        <p className="font-medium">{med.frequency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duración:</span>
                        <p className="font-medium">{med.duration}</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                      <span className="text-muted-foreground">Instrucciones:</span>
                      <p>{med.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <h3 className="font-semibold text-sm mb-2 text-yellow-800">Notas del Médico</h3>
                  <p className="text-sm text-yellow-700">{prescription.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar Receta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionViewDialog;
