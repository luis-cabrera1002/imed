import { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: number;
  patient: string;
  time: string;
  type: string;
  status: string;
  avatar: string;
}

const availableTimeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

const RescheduleDialog = ({ open, onOpenChange, appointment }: RescheduleDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulate some occupied time slots
  const occupiedSlots = ["09:00", "10:30", "14:30", "16:00"];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: "Cita reagendada",
      description: `La cita de ${appointment?.patient} ha sido reagendada para el ${format(selectedDate, "d 'de' MMMM", { locale: es })} a las ${selectedTime}.`,
    });

    onOpenChange(false);
    setSelectedTime(null);
  };

  const isTimeSlotAvailable = (time: string) => !occupiedSlots.includes(time);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Reagendar Cita
          </DialogTitle>
          <DialogDescription>
            {appointment && (
              <span>
                Reagendar la cita de <strong>{appointment.patient}</strong> ({appointment.type})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Seleccionar nueva fecha</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
              locale={es}
              className="rounded-md border mx-auto"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Seleccionar horario
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableTimeSlots.map((time) => {
                const available = isTimeSlotAvailable(time);
                const isSelected = selectedTime === time;
                
                return (
                  <Button
                    key={time}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={!available}
                    onClick={() => setSelectedTime(time)}
                    className={`text-xs ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Los horarios deshabilitados ya tienen citas programadas.
            </p>
          </div>

          {selectedDate && selectedTime && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">Nueva fecha y hora:</p>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} a las {selectedTime}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime || isLoading}
          >
            {isLoading ? "Reagendando..." : "Confirmar Reagendación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
