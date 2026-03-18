import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeSlot } from "@/types/appointments";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  date: Date;
}

const TimeSlotPicker = ({ slots, selectedTime, onSelectTime, date }: TimeSlotPickerProps) => {
  const morningSlots = slots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour >= 12;
  });

  const renderSlots = (slotsToRender: TimeSlot[], period: string) => {
    if (slotsToRender.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {period}
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {slotsToRender.map((slot) => (
            <Button
              key={slot.time}
              variant={selectedTime === slot.time ? "default" : "outline"}
              disabled={!slot.available}
              onClick={() => onSelectTime(slot.time)}
              className={cn(
                "h-10 text-sm",
                !slot.available && "opacity-50 cursor-not-allowed"
              )}
            >
              {slot.time}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Horarios Disponibles</CardTitle>
        <CardDescription>
          Selecciona el horario que mejor se ajuste a tus necesidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSlots(morningSlots, "Mañana")}
        {renderSlots(afternoonSlots, "Tarde")}
        {slots.every((slot) => !slot.available) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hay horarios disponibles para esta fecha.
              <br />
              Por favor, selecciona otra fecha.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotPicker;
