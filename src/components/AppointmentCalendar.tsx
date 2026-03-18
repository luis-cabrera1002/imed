import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  bookedDates?: Date[];
}

const AppointmentCalendar = ({
  selectedDate,
  onSelectDate,
  bookedDates = [],
}: AppointmentCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Disable past dates
  const disabledDays = { before: new Date() };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            disabled={isSameMonth(currentMonth, new Date())}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Selecciona una fecha disponible para tu cita
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          disabled={disabledDays}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={es}
          className="rounded-md border pointer-events-auto"
          modifiers={{
            booked: bookedDates,
          }}
          modifiersStyles={{
            booked: {
              backgroundColor: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            },
          }}
        />
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-muted" />
            <span>Ocupado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
