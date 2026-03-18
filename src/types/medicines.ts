export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  description: string;
  presentation: string; // e.g., "Tabletas 500mg", "Jarabe 120ml"
  manufacturer: string;
  requiresPrescription: boolean;
  price: number;
  image?: string;
  activeIngredient: string;
  indications: string[];
  contraindications: string[];
}

export interface PharmacyStock {
  medicineId: string;
  quantity: number;
  lastUpdated: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  chain: string; // e.g., "Farmacia del Ahorro", "Cruz Verde"
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  hours: string;
  delivery: boolean;
  rating: number;
  medicinesAvailable: string[]; // Array of medicine IDs
  stock: PharmacyStock[]; // Stock information per medicine
  distance?: number; // Distance from user in km (calculated)
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  date: string;
  medicines: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  notes?: string;
  status: 'pending' | 'filled' | 'expired';
}

export interface PreAppointmentRequirement {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  requirements: {
    type: 'test' | 'document' | 'preparation' | 'medicine';
    description: string;
    urgent: boolean;
  }[];
  completed: boolean;
  notes?: string;
}

export type MedicineCategory = 
  | 'Analgésicos'
  | 'Antibióticos'
  | 'Antiinflamatorios'
  | 'Cardiovasculares'
  | 'Digestivos'
  | 'Respiratorios'
  | 'Dermatológicos'
  | 'Vitaminas y Suplementos'
  | 'Diabetes'
  | 'Otros';
