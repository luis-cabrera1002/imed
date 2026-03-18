import { PreAppointmentRequirement } from "@/types/medicines";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, AlertCircle, FileText, TestTube, Clipboard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface RequirementCardProps {
  requirement: PreAppointmentRequirement;
  onComplete: (id: string) => void;
}

export const RequirementCard = ({ requirement, onComplete }: RequirementCardProps) => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(requirement.requirements.length).fill(false)
  );

  const handleCheckItem = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);

    // If all items are checked, mark as complete
    if (newChecked.every(item => item)) {
      onComplete(requirement.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'test':
        return <TestTube className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'preparation':
        return <Clipboard className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-6 border-l-4 border-l-primary">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">Pre-requisitos de Cita</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            {requirement.doctorName} - {requirement.specialty}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(new Date(requirement.appointmentDate), "d MMM", { locale: es })}
        </Badge>
      </div>

      <div className="space-y-4 mb-4">
        {requirement.requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              req.urgent ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50'
            }`}
          >
            <Checkbox
              id={`req-${requirement.id}-${index}`}
              checked={checkedItems[index]}
              onCheckedChange={() => handleCheckItem(index)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-start gap-2">
                {getIcon(req.type)}
                <div className="flex-1">
                  <label
                    htmlFor={`req-${requirement.id}-${index}`}
                    className={`text-sm font-medium cursor-pointer ${
                      checkedItems[index] ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {req.description}
                  </label>
                  {req.urgent && (
                    <Badge variant="destructive" className="text-xs ml-2">
                      Urgente
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {requirement.notes && (
        <div className="p-3 bg-muted rounded-lg mb-4">
          <p className="text-sm">
            <span className="font-medium">Nota:</span> {requirement.notes}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>
          Completar antes del{" "}
          {format(new Date(requirement.appointmentDate), "d 'de' MMMM 'a las' HH:mm", {
            locale: es
          })}
        </span>
      </div>
    </Card>
  );
};
