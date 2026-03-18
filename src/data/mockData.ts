
import { Clinic, Doctor, Review, Insurance } from '../types';
import { bamHospitals, bamDoctors, bamInsurance, bamSpecialties } from './bamProvidersData';

export const clinics: Clinic[] = [
  {
    id: '1',
    name: 'Centro Médico Guatemala',
    address: '7a Avenida 11-67, Zona 9',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6089,
      lng: -90.5183
    },
    phone: '+502 2312-5678',
    rating: 4.7,
    ratingsCount: 352,
    specialties: ['Cardiología', 'Pediatría', 'Dermatología', 'Ginecología'],
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Universales'],
    schedule: {
      weekdays: '7:00 - 20:00',
      weekend: '8:00 - 13:00'
    },
    emergency: true,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
    website: 'https://www.centromedicoguatemala.com',
  },
  {
    id: '2',
    name: 'Hospital Herrera Llerandi',
    address: '6a Avenida 8-71, Zona 10',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6134,
      lng: -90.5149
    },
    phone: '+502 2334-5963',
    rating: 4.9,
    ratingsCount: 628,
    specialties: ['Neurología', 'Ortopedia', 'Cardiología', 'Oftalmología'],
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Universales', 'Pan-American Life'],
    schedule: {
      weekdays: '6:00 - 22:00',
      weekend: '7:00 - 20:00'
    },
    emergency: true,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=600&fit=crop',
    website: 'https://www.hospitalhll.com',
  },
  {
    id: '3',
    name: 'Sanatorio El Pilar',
    address: '3a Avenida 10-71, Zona 15',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.5857,
      lng: -90.4923
    },
    phone: '+502 2279-7474',
    rating: 4.5,
    ratingsCount: 274,
    specialties: ['Pediatría', 'Ginecología', 'Medicina General', 'Gastroenterología'],
    acceptedInsurance: ['Mapfre', 'Bupa', 'BienestarSalud', 'Aseguradora Rural'],
    schedule: {
      weekdays: '8:00 - 19:00',
      weekend: '9:00 - 14:00'
    },
    emergency: false,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop',
    website: 'https://www.sanatorioelpilar.com.gt',
  },
  {
    id: '4',
    name: 'Hospital Centro Médico',
    address: '6a Avenida 3-47, Zona 10',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6025,
      lng: -90.5196
    },
    phone: '+502 2385-7890',
    rating: 4.8,
    ratingsCount: 492,
    specialties: ['Cardiología', 'Neurología', 'Urología', 'Oftalmología'],
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Pan-American Life', 'Universales'],
    schedule: {
      weekdays: '7:00 - 21:00',
      weekend: '8:00 - 17:00'
    },
    emergency: true,
    image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&h=600&fit=crop',
    website: 'https://www.hospitalcentromedico.com',
  },
  {
    id: '5',
    name: 'Clínica San Cristóbal',
    address: '10a Calle 6-23, Zona 14',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.5768,
      lng: -90.4930
    },
    phone: '+502 2333-2111',
    rating: 4.3,
    ratingsCount: 187,
    specialties: ['Dermatología', 'Pediatría', 'Medicina General'],
    acceptedInsurance: ['Seguros G&T', 'BienestarSalud', 'Aseguradora Rural'],
    schedule: {
      weekdays: '8:00 - 18:00',
      weekend: '9:00 - 13:00'
    },
    emergency: false,
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&h=600&fit=crop',
    website: 'https://www.clinicasancristobal.com.gt',
  },
  {
    id: '6',
    name: 'Centro Médico Xela',
    address: '4a Calle 8-42, Zona 3',
    city: 'Quetzaltenango',
    coordinates: {
      lat: 14.8406,
      lng: -91.5331
    },
    phone: '+502 7761-8934',
    rating: 4.4,
    ratingsCount: 156,
    specialties: ['Ortopedia', 'Ginecología', 'Medicina General'],
    acceptedInsurance: ['BienestarSalud', 'Aseguradora Rural', 'Mapfre'],
    schedule: {
      weekdays: '8:00 - 18:00',
      weekend: '9:00 - 13:00'
    },
    emergency: true,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop',
    website: 'https://www.centromedicoxela.com',
  },
  {
    id: '7',
    name: 'Hospital Privado de las Américas',
    address: '12 Calle 1-25, Zona 10',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6012,
      lng: -90.5234
    },
    phone: '+502 2381-6000',
    rating: 4.6,
    ratingsCount: 423,
    specialties: ['Oncología', 'Traumatología', 'Nefrología', 'Endocrinología'],
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Pan-American Life'],
    schedule: {
      weekdays: '6:00 - 22:00',
      weekend: '7:00 - 20:00'
    },
    emergency: true,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop',
    website: 'https://www.hospitalamericas.com.gt',
  },
  {
    id: '8',
    name: 'Clínica de Especialidades Vista Hermosa',
    address: 'Blvd. Vista Hermosa 15-45, Zona 15',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.5823,
      lng: -90.4867
    },
    phone: '+502 2369-5500',
    rating: 4.7,
    ratingsCount: 289,
    specialties: ['Psiquiatría', 'Reumatología', 'Alergología', 'Medicina Interna'],
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Universales', 'BienestarSalud'],
    schedule: {
      weekdays: '7:00 - 19:00',
      weekend: '8:00 - 14:00'
    },
    emergency: false,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
    website: 'https://www.clinicavistahermosa.com',
  }
];

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Carlos Méndez',
    specialty: 'Cardiología',
    clinicIds: ['1', '2', '4'],
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.9,
    ratingsCount: 143,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 15,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Universales'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '2',
    name: 'Dra. Ana López',
    specialty: 'Pediatría',
    clinicIds: ['1', '3', '5'],
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4.8,
    ratingsCount: 219,
    education: 'Universidad Francisco Marroquín, Guatemala',
    experience: 12,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'BienestarSalud', 'Aseguradora Rural'],
    languages: ['Español', 'Inglés', 'Francés']
  },
  {
    id: '3',
    name: 'Dr. Luis Ramírez',
    specialty: 'Neurología',
    clinicIds: ['2', '4'],
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4.9,
    ratingsCount: 176,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 20,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Pan-American Life'],
    languages: ['Español', 'Inglés', 'Alemán']
  },
  {
    id: '4',
    name: 'Dra. Gabriela Estrada',
    specialty: 'Dermatología',
    clinicIds: ['1', '5'],
    image: 'https://randomuser.me/api/portraits/women/43.jpg',
    rating: 4.7,
    ratingsCount: 158,
    education: 'Universidad Rafael Landívar, Guatemala',
    experience: 8,
    acceptedInsurance: ['Seguros G&T', 'BienestarSalud', 'Aseguradora Rural'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '5',
    name: 'Dr. Roberto Castillo',
    specialty: 'Ortopedia',
    clinicIds: ['2', '6'],
    image: 'https://randomuser.me/api/portraits/men/59.jpg',
    rating: 4.6,
    ratingsCount: 132,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 14,
    acceptedInsurance: ['BienestarSalud', 'Aseguradora Rural', 'Mapfre'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '6',
    name: 'Dra. María Fernández',
    specialty: 'Ginecología',
    clinicIds: ['1', '3', '6'],
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    rating: 4.8,
    ratingsCount: 187,
    education: 'Universidad Francisco Marroquín, Guatemala',
    experience: 10,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Universales', 'BienestarSalud'],
    languages: ['Español', 'Inglés', 'Italiano']
  },
  {
    id: '7',
    name: 'Dr. Julio Vásquez',
    specialty: 'Oftalmología',
    clinicIds: ['2', '4'],
    image: 'https://randomuser.me/api/portraits/men/74.jpg',
    rating: 4.7,
    ratingsCount: 129,
    education: 'Universidad Rafael Landívar, Guatemala',
    experience: 11,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Pan-American Life'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '8',
    name: 'Dra. Carmen Arévalo',
    specialty: 'Medicina General',
    clinicIds: ['3', '5', '6'],
    image: 'https://randomuser.me/api/portraits/women/26.jpg',
    rating: 4.5,
    ratingsCount: 203,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 7,
    acceptedInsurance: ['BienestarSalud', 'Aseguradora Rural', 'Mapfre', 'Seguros G&T'],
    languages: ['Español', 'Inglés']
  },
  // Nuevos doctores
  {
    id: '9',
    name: 'Dr. Fernando Paz',
    specialty: 'Endocrinología',
    clinicIds: ['7', '4'],
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: 4.9,
    ratingsCount: 167,
    education: 'Universidad de San Carlos, Guatemala - Subespecialidad en Johns Hopkins',
    experience: 18,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Pan-American Life'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '10',
    name: 'Dra. Patricia Morales',
    specialty: 'Psiquiatría',
    clinicIds: ['8', '1'],
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 4.8,
    ratingsCount: 142,
    education: 'Universidad Francisco Marroquín, Guatemala',
    experience: 15,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Universales', 'BienestarSalud'],
    languages: ['Español', 'Inglés', 'Portugués']
  },
  {
    id: '11',
    name: 'Dr. Alejandro Velásquez',
    specialty: 'Gastroenterología',
    clinicIds: ['3', '4', '7'],
    image: 'https://randomuser.me/api/portraits/men/36.jpg',
    rating: 4.7,
    ratingsCount: 198,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 13,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Aseguradora Rural'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '12',
    name: 'Dra. Laura Sandoval',
    specialty: 'Reumatología',
    clinicIds: ['8', '2'],
    image: 'https://randomuser.me/api/portraits/women/52.jpg',
    rating: 4.6,
    ratingsCount: 124,
    education: 'Universidad Rafael Landívar, Guatemala',
    experience: 9,
    acceptedInsurance: ['Mapfre', 'Universales', 'BienestarSalud'],
    languages: ['Español', 'Inglés', 'Francés']
  },
  {
    id: '13',
    name: 'Dr. Miguel Ángel Torres',
    specialty: 'Urología',
    clinicIds: ['4', '7'],
    image: 'https://randomuser.me/api/portraits/men/61.jpg',
    rating: 4.8,
    ratingsCount: 156,
    education: 'Universidad de San Carlos, Guatemala - Especialización en España',
    experience: 16,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Pan-American Life'],
    languages: ['Español', 'Inglés', 'Catalán']
  },
  {
    id: '14',
    name: 'Dra. Sofía Herrera',
    specialty: 'Alergología',
    clinicIds: ['8', '5'],
    image: 'https://randomuser.me/api/portraits/women/38.jpg',
    rating: 4.7,
    ratingsCount: 112,
    education: 'Universidad Francisco Marroquín, Guatemala',
    experience: 8,
    acceptedInsurance: ['Seguros G&T', 'BienestarSalud', 'Aseguradora Rural'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '15',
    name: 'Dr. Ricardo Monzón',
    specialty: 'Oncología',
    clinicIds: ['7', '2'],
    image: 'https://randomuser.me/api/portraits/men/55.jpg',
    rating: 4.9,
    ratingsCount: 189,
    education: 'Universidad de San Carlos, Guatemala - Fellowship MD Anderson',
    experience: 22,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa', 'Pan-American Life', 'Universales'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '16',
    name: 'Dra. Andrea Figueroa',
    specialty: 'Nefrología',
    clinicIds: ['7', '4'],
    image: 'https://randomuser.me/api/portraits/women/29.jpg',
    rating: 4.6,
    ratingsCount: 98,
    education: 'Universidad Rafael Landívar, Guatemala',
    experience: 11,
    acceptedInsurance: ['Mapfre', 'Bupa', 'Pan-American Life'],
    languages: ['Español', 'Inglés', 'Alemán']
  },
  {
    id: '17',
    name: 'Dr. Jorge Barrios',
    specialty: 'Traumatología',
    clinicIds: ['7', '2', '6'],
    image: 'https://randomuser.me/api/portraits/men/42.jpg',
    rating: 4.8,
    ratingsCount: 175,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 14,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'BienestarSalud', 'Aseguradora Rural'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '18',
    name: 'Dra. Claudia Mejía',
    specialty: 'Medicina Interna',
    clinicIds: ['8', '3', '1'],
    image: 'https://randomuser.me/api/portraits/women/55.jpg',
    rating: 4.7,
    ratingsCount: 234,
    education: 'Universidad Francisco Marroquín, Guatemala',
    experience: 17,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Universales', 'BienestarSalud'],
    languages: ['Español', 'Inglés', 'Francés']
  },
  {
    id: '19',
    name: 'Dr. Eduardo Samayoa',
    specialty: 'Neumología',
    clinicIds: ['2', '7'],
    image: 'https://randomuser.me/api/portraits/men/48.jpg',
    rating: 4.6,
    ratingsCount: 145,
    education: 'Universidad de San Carlos, Guatemala',
    experience: 12,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'Bupa'],
    languages: ['Español', 'Inglés']
  },
  {
    id: '20',
    name: 'Dra. Mariana Castro',
    specialty: 'Pediatría',
    clinicIds: ['1', '5', '8'],
    image: 'https://randomuser.me/api/portraits/women/62.jpg',
    rating: 4.9,
    ratingsCount: 267,
    education: 'Universidad Rafael Landívar, Guatemala - Subespecialidad Neonatología',
    experience: 10,
    acceptedInsurance: ['Seguros G&T', 'Mapfre', 'BienestarSalud', 'Universales'],
    languages: ['Español', 'Inglés']
  }
];

export const reviews: Review[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'María García',
    userImage: 'https://randomuser.me/api/portraits/women/12.jpg',
    entityId: '1',
    entityType: 'clinic',
    rating: 5,
    comment: 'Excelente atención en el Centro Médico Guatemala. El personal muy amable y las instalaciones muy limpias.',
    date: '2023-10-15',
    helpful: 12
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Juan Pérez',
    userImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    entityId: '1',
    entityType: 'clinic',
    rating: 4,
    comment: 'Buena atención, aunque tuve que esperar un poco más de lo esperado. El médico fue muy profesional.',
    date: '2023-09-28',
    helpful: 5
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Sofía Rodríguez',
    userImage: 'https://randomuser.me/api/portraits/women/53.jpg',
    entityId: '1',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Carlos Méndez es un excelente cardiólogo. Muy detallista en su diagnóstico y con muy buen trato humano.',
    date: '2023-11-05',
    helpful: 18
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'Roberto Alvarez',
    userImage: 'https://randomuser.me/api/portraits/men/37.jpg',
    entityId: '2',
    entityType: 'clinic',
    rating: 5,
    comment: 'El Hospital Herrera Llerandi tiene un servicio de primera. Las enfermeras muy atentas y los doctores muy profesionales.',
    date: '2023-10-22',
    helpful: 9
  },
  {
    id: '5',
    userId: 'u5',
    userName: 'Ana Morales',
    userImage: 'https://randomuser.me/api/portraits/women/72.jpg',
    entityId: '3',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Luis Ramírez tiene un gran conocimiento en neurología. Resolvió mis dudas con mucha paciencia.',
    date: '2023-09-12',
    helpful: 7
  },
  {
    id: '6',
    userId: 'u6',
    userName: 'Carlos Mendoza',
    userImage: 'https://randomuser.me/api/portraits/men/65.jpg',
    entityId: '3',
    entityType: 'clinic',
    rating: 4,
    comment: 'Sanatorio El Pilar tiene buenas instalaciones, pero el proceso de admisión es un poco lento.',
    date: '2023-11-10',
    helpful: 3
  },
  {
    id: '7',
    userId: 'u7',
    userName: 'Luisa Gómez',
    userImage: 'https://randomuser.me/api/portraits/women/35.jpg',
    entityId: '6',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. María Fernández es una ginecóloga excepcional. Muy profesional y empática.',
    date: '2023-10-30',
    helpful: 15
  },
  {
    id: '8',
    userId: 'u8',
    userName: 'Pedro Solares',
    userImage: 'https://randomuser.me/api/portraits/men/42.jpg',
    entityId: '7',
    entityType: 'doctor',
    rating: 4,
    comment: 'El Dr. Julio Vásquez es buen oftalmólogo pero las citas suelen retrasarse un poco.',
    date: '2023-09-17',
    helpful: 6
  },
  // Nuevas reseñas para más doctores
  {
    id: '9',
    userId: 'u9',
    userName: 'Patricia Hernández',
    userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    entityId: '1',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Carlos Méndez salvó la vida de mi esposo. Su diagnóstico fue preciso y el tratamiento efectivo. Eternamente agradecidos.',
    date: '2024-01-15',
    helpful: 42
  },
  {
    id: '10',
    userId: 'u10',
    userName: 'Fernando López',
    userImage: 'https://randomuser.me/api/portraits/men/28.jpg',
    entityId: '2',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. Ana López atendió a mi hijo de 3 años. Tiene una paciencia increíble y explica todo muy claramente. La mejor pediatra.',
    date: '2024-01-20',
    helpful: 28
  },
  {
    id: '11',
    userId: 'u11',
    userName: 'Gabriela Pineda',
    userImage: 'https://randomuser.me/api/portraits/women/67.jpg',
    entityId: '2',
    entityType: 'doctor',
    rating: 4,
    comment: 'Buena doctora, muy profesional. A veces hay que esperar un poco pero vale la pena por la calidad de atención.',
    date: '2024-02-05',
    helpful: 12
  },
  {
    id: '12',
    userId: 'u12',
    userName: 'Manuel Ríos',
    userImage: 'https://randomuser.me/api/portraits/men/51.jpg',
    entityId: '9',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Fernando Paz controla mi diabetes desde hace 5 años. Gracias a él mis niveles están perfectos. Muy recomendado.',
    date: '2024-02-10',
    helpful: 35
  },
  {
    id: '13',
    userId: 'u13',
    userName: 'Rosa Méndez',
    userImage: 'https://randomuser.me/api/portraits/women/58.jpg',
    entityId: '9',
    entityType: 'doctor',
    rating: 5,
    comment: 'Excelente endocrinólogo. Me ayudó con mi problema de tiroides cuando otros doctores no daban con el diagnóstico.',
    date: '2024-01-28',
    helpful: 22
  },
  {
    id: '14',
    userId: 'u14',
    userName: 'Andrés Vega',
    userImage: 'https://randomuser.me/api/portraits/men/33.jpg',
    entityId: '10',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. Patricia Morales me ayudó enormemente con mi ansiedad. Profesional, empática y muy preparada.',
    date: '2024-02-15',
    helpful: 19
  },
  {
    id: '15',
    userId: 'u15',
    userName: 'Lucía Arriola',
    userImage: 'https://randomuser.me/api/portraits/women/31.jpg',
    entityId: '11',
    entityType: 'doctor',
    rating: 4,
    comment: 'El Dr. Alejandro Velásquez realizó mi endoscopía. Muy profesional y me explicó todo el procedimiento. Recomendado.',
    date: '2024-01-22',
    helpful: 14
  },
  {
    id: '16',
    userId: 'u16',
    userName: 'Diego Morán',
    userImage: 'https://randomuser.me/api/portraits/men/46.jpg',
    entityId: '15',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Ricardo Monzón es un oncólogo excepcional. Su trato humano durante el tratamiento de mi madre fue invaluable.',
    date: '2024-02-01',
    helpful: 38
  },
  {
    id: '17',
    userId: 'u17',
    userName: 'Beatriz Solórzano',
    userImage: 'https://randomuser.me/api/portraits/women/49.jpg',
    entityId: '4',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. Gabriela Estrada trató mi problema de acné severo. En 3 meses vi resultados increíbles. Muy agradecida.',
    date: '2024-01-18',
    helpful: 24
  },
  {
    id: '18',
    userId: 'u18',
    userName: 'Oscar Peña',
    userImage: 'https://randomuser.me/api/portraits/men/39.jpg',
    entityId: '17',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Jorge Barrios operó mi rodilla. Excelente cirujano y muy buen seguimiento postoperatorio.',
    date: '2024-02-08',
    helpful: 21
  },
  {
    id: '19',
    userId: 'u19',
    userName: 'Carolina Juárez',
    userImage: 'https://randomuser.me/api/portraits/women/41.jpg',
    entityId: '20',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. Mariana Castro atendió el parto de mi bebé. Fue una experiencia maravillosa gracias a ella.',
    date: '2024-02-12',
    helpful: 31
  },
  {
    id: '20',
    userId: 'u20',
    userName: 'Jorge Lara',
    userImage: 'https://randomuser.me/api/portraits/men/54.jpg',
    entityId: '13',
    entityType: 'doctor',
    rating: 4,
    comment: 'El Dr. Miguel Ángel Torres es muy competente en urología. Buena atención aunque el consultorio a veces está muy lleno.',
    date: '2024-01-30',
    helpful: 11
  },
  {
    id: '21',
    userId: 'u21',
    userName: 'Mónica Estrada',
    userImage: 'https://randomuser.me/api/portraits/women/36.jpg',
    entityId: '14',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. Sofía Herrera identificó mis alergias que otros doctores no pudieron. El tratamiento ha cambiado mi vida.',
    date: '2024-02-18',
    helpful: 17
  },
  {
    id: '22',
    userId: 'u22',
    userName: 'Raúl Contreras',
    userImage: 'https://randomuser.me/api/portraits/men/44.jpg',
    entityId: '18',
    entityType: 'doctor',
    rating: 5,
    comment: 'La Dra. Claudia Mejía es una internista extraordinaria. Muy minuciosa en sus diagnósticos.',
    date: '2024-02-20',
    helpful: 15
  },
  {
    id: '23',
    userId: 'u23',
    userName: 'Silvia Orellana',
    userImage: 'https://randomuser.me/api/portraits/women/47.jpg',
    entityId: '12',
    entityType: 'doctor',
    rating: 4,
    comment: 'La Dra. Laura Sandoval trata mi artritis reumatoide. Buena doctora, muy actualizada en tratamientos.',
    date: '2024-01-25',
    helpful: 9
  },
  {
    id: '24',
    userId: 'u24',
    userName: 'Héctor Barillas',
    userImage: 'https://randomuser.me/api/portraits/men/57.jpg',
    entityId: '19',
    entityType: 'doctor',
    rating: 5,
    comment: 'El Dr. Eduardo Samayoa diagnosticó y trató mi apnea del sueño. Gran profesional.',
    date: '2024-02-14',
    helpful: 13
  }
];

export const insurances: Insurance[] = [
  bamInsurance,
  {
    id: '1',
    name: 'Seguros G&T',
    logo: 'https://via.placeholder.com/100x50?text=G&T'
  },
  {
    id: '2',
    name: 'Mapfre',
    logo: 'https://via.placeholder.com/100x50?text=Mapfre'
  },
  {
    id: '3',
    name: 'Bupa',
    logo: 'https://via.placeholder.com/100x50?text=Bupa'
  },
  {
    id: '4',
    name: 'Universales',
    logo: 'https://via.placeholder.com/100x50?text=Universales'
  },
  {
    id: '5',
    name: 'Pan-American Life',
    logo: 'https://via.placeholder.com/100x50?text=PanAmerican'
  },
  {
    id: '6',
    name: 'BienestarSalud',
    logo: 'https://via.placeholder.com/100x50?text=Bienestar'
  },
  {
    id: '7',
    name: 'Aseguradora Rural',
    logo: 'https://via.placeholder.com/100x50?text=AseguradoraRural'
  }
];

// Combinar clínicas/hospitales originales con los de BAM
export const allClinics: Clinic[] = [...clinics, ...bamHospitals];

// Combinar doctores originales con los de BAM
export const allDoctors: Doctor[] = [...doctors, ...bamDoctors];

export const specialties = [
  'Cardiología',
  'Cardiología Pediátrica',
  'Pediatría',
  'Dermatología',
  'Ginecología',
  'Neurología',
  'Oftalmología',
  'Ortopedia',
  'Medicina General',
  'Gastroenterología',
  'Urología',
  'Endocrinología',
  'Psiquiatría',
  'Reumatología',
  'Alergología',
  'Oncología',
  'Nefrología',
  'Traumatología',
  'Medicina Interna',
  'Neumología',
  'Cirugía General',
  'Otorrinolaringología',
  'Fisioterapia',
];

export const getClinicById = (id: string): Clinic | undefined => {
  return allClinics.find(clinic => clinic.id === id);
};

export const getDoctorById = (id: string): Doctor | undefined => {
  return allDoctors.find(doctor => doctor.id === id);
};

export const getDoctorsByClinicId = (clinicId: string): Doctor[] => {
  return allDoctors.filter(doctor => doctor.clinicIds.includes(clinicId));
};

export const getDoctorsBySpecialty = (specialty: string): Doctor[] => {
  return allDoctors.filter(doctor => doctor.specialty === specialty);
};

export const getReviewsByEntityId = (entityId: string, entityType: 'clinic' | 'doctor'): Review[] => {
  return reviews.filter(review => review.entityId === entityId && review.entityType === entityType);
};

export const getTopDoctorsBySpecialty = (specialty: string, limit = 3): Doctor[] => {
  return allDoctors
    .filter(doctor => doctor.specialty === specialty)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getAllSpecialties = (): string[] => {
  return [...new Set(allDoctors.map(doctor => doctor.specialty))];
};

export const getAllInsurances = (): string[] => {
  const insuranceList = allClinics.flatMap(clinic => clinic.acceptedInsurance);
  return [...new Set(insuranceList)];
};

export const getTopRatedClinics = (limit = 5): Clinic[] => {
  return [...allClinics].sort((a, b) => b.rating - a.rating).slice(0, limit);
};

export const getTopRatedDoctors = (limit = 5): Doctor[] => {
  return [...allDoctors].sort((a, b) => b.rating - a.rating).slice(0, limit);
};

// Funciones específicas para filtrar por seguro
export const getDoctorsByInsurance = (insurance: string): Doctor[] => {
  return allDoctors.filter(doctor => 
    doctor.acceptedInsurance.includes(insurance)
  );
};

export const getClinicsByInsurance = (insurance: string): Clinic[] => {
  return allClinics.filter(clinic => 
    clinic.acceptedInsurance.includes(insurance)
  );
};
