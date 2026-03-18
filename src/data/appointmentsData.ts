import { Appointment, TimeSlot } from "@/types/appointments";

// Mock appointments data
export const appointments: Appointment[] = [];

// Generate available time slots for a given date
export const generateTimeSlots = (date: Date, doctorId: string, clinicId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();
  
  // Weekend has limited hours (9 AM - 1 PM)
  // Weekdays have full hours (8 AM - 6 PM)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const startHour = isWeekend ? 9 : 8;
  const endHour = isWeekend ? 13 : 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Generate slots every 30 minutes
    ['00', '30'].forEach((minutes) => {
      const time = `${hour.toString().padStart(2, '0')}:${minutes}`;
      
      // Check if slot is already booked
      const isBooked = appointments.some(
        (apt) =>
          apt.doctorId === doctorId &&
          apt.date === date.toISOString().split('T')[0] &&
          apt.time === time &&
          apt.status !== 'cancelled'
      );
      
      slots.push({
        time,
        available: !isBooked,
        doctorId,
      });
    });
  }
  
  return slots;
};

// Add a new appointment
export const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment => {
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  appointments.push(newAppointment);
  return newAppointment;
};

// Get appointments by doctor
export const getAppointmentsByDoctor = (doctorId: string): Appointment[] => {
  return appointments.filter((apt) => apt.doctorId === doctorId && apt.status !== 'cancelled');
};

// Get appointments by patient email
export const getAppointmentsByPatient = (email: string): Appointment[] => {
  return appointments.filter((apt) => apt.patientEmail === email);
};

// Cancel appointment
export const cancelAppointment = (appointmentId: string): boolean => {
  const appointment = appointments.find((apt) => apt.id === appointmentId);
  if (appointment) {
    appointment.status = 'cancelled';
    return true;
  }
  return false;
};

// Confirm appointment
export const confirmAppointment = (appointmentId: string): boolean => {
  const appointment = appointments.find((apt) => apt.id === appointmentId);
  if (appointment) {
    appointment.status = 'confirmed';
    return true;
  }
  return false;
};
