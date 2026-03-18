
export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  rating: number;
  ratingsCount: number;
  specialties: string[];
  acceptedInsurance: string[];
  schedule: {
    weekdays: string;
    weekend: string;
  };
  emergency: boolean;
  image?: string;
  website?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinicIds: string[];
  image: string;
  rating: number;
  ratingsCount: number;
  education: string;
  experience: number;
  acceptedInsurance: string[];
  languages: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  entityId: string; // Can be clinicId or doctorId
  entityType: 'clinic' | 'doctor';
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface Insurance {
  id: string;
  name: string;
  logo?: string;
}

export type Specialty = 
  | 'Cardiología'
  | 'Pediatría'
  | 'Dermatología'
  | 'Ginecología'
  | 'Neurología'
  | 'Oftalmología'
  | 'Ortopedia'
  | 'Medicina General'
  | 'Gastroenterología'
  | 'Urología';
