export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  clinicId: string;
  specialty: string;
  date: string;
  time: string;
  insurance: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  doctorId?: string;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}
