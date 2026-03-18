import { Prescription } from "@/types/medicines";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Pill } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PrescriptionCardProps {
  prescription: Prescription;
  onViewDetails: (prescription: Prescription) => void;
}

export const PrescriptionCard = ({ prescription, onViewDetails }: PrescriptionCardProps) => {
  const statusColors = {
    pending: "bg-yellow-500",
    filled: "bg-green-500",
    expired: "bg-red-500"
  };

  const statusLabels = {
    pending: "Pendiente",
    filled: "Surtida",
    expired: "Vencida"
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Receta Médica</h3>
            <p className="text-sm text-muted-foreground">#{prescription.id}</p>
          </div>
        </div>
        <Badge className={statusColors[prescription.status]}>
          {statusLabels[prescription.status]}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{prescription.doctorName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(prescription.date), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
        </div>

        <div className="pt-3 border-t">
          <p className="text-sm font-medium mb-2">Diagnóstico:</p>
          <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
        </div>

        <div className="pt-2">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medicamentos ({prescription.medicines.length})
          </p>
          <ul className="space-y-1">
            {prescription.medicines.slice(0, 2).map((med, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {med.medicineName} - {med.dosage}
              </li>
            ))}
            {prescription.medicines.length > 2 && (
              <li className="text-sm text-muted-foreground">
                • Y {prescription.medicines.length - 2} más...
              </li>
            )}
          </ul>
        </div>

        <Button
          onClick={() => onViewDetails(prescription)}
          variant="outline"
          className="w-full mt-4"
        >
          Ver Detalles Completos
        </Button>
      </div>
    </Card>
  );
};
