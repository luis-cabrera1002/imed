import { Medicine, Pharmacy, Prescription, PreAppointmentRequirement, PharmacyStock } from '@/types/medicines';

export const medicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    genericName: 'Paracetamol',
    category: 'Analgésicos',
    description: 'Analgésico y antipirético para el alivio del dolor y la fiebre',
    presentation: 'Tabletas 500mg, caja x 20',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: false,
    price: 25.00,
    activeIngredient: 'Paracetamol 500mg',
    indications: ['Dolor leve a moderado', 'Fiebre', 'Dolor de cabeza', 'Dolor muscular'],
    contraindications: ['Insuficiencia hepática grave', 'Alergia al paracetamol']
  },
  {
    id: '2',
    name: 'Amoxicilina',
    genericName: 'Amoxicilina',
    category: 'Antibióticos',
    description: 'Antibiótico de amplio espectro para infecciones bacterianas',
    presentation: 'Cápsulas 500mg, caja x 12',
    manufacturer: 'Pharmadina',
    requiresPrescription: true,
    price: 85.00,
    activeIngredient: 'Amoxicilina trihidratada 500mg',
    indications: ['Infecciones respiratorias', 'Infecciones urinarias', 'Infecciones de piel'],
    contraindications: ['Alergia a penicilinas', 'Mononucleosis infecciosa']
  },
  {
    id: '3',
    name: 'Ibuprofeno',
    genericName: 'Ibuprofeno',
    category: 'Antiinflamatorios',
    description: 'Antiinflamatorio no esteroideo para dolor e inflamación',
    presentation: 'Tabletas 400mg, caja x 24',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: false,
    price: 45.00,
    activeIngredient: 'Ibuprofeno 400mg',
    indications: ['Dolor e inflamación', 'Fiebre', 'Artritis', 'Dolor menstrual'],
    contraindications: ['Úlcera péptica activa', 'Insuficiencia renal grave', 'Tercer trimestre de embarazo']
  },
  {
    id: '4',
    name: 'Losartán',
    genericName: 'Losartán Potásico',
    category: 'Cardiovasculares',
    description: 'Antihipertensivo para el control de la presión arterial',
    presentation: 'Tabletas 50mg, caja x 30',
    manufacturer: 'Pharmadina',
    requiresPrescription: true,
    price: 120.00,
    activeIngredient: 'Losartán potásico 50mg',
    indications: ['Hipertensión arterial', 'Insuficiencia cardíaca', 'Protección renal en diabéticos'],
    contraindications: ['Embarazo', 'Lactancia', 'Estenosis renal bilateral']
  },
  {
    id: '5',
    name: 'Omeprazol',
    genericName: 'Omeprazol',
    category: 'Digestivos',
    description: 'Inhibidor de la bomba de protones para problemas gástricos',
    presentation: 'Cápsulas 20mg, caja x 14',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: false,
    price: 65.00,
    activeIngredient: 'Omeprazol 20mg',
    indications: ['Reflujo gastroesofágico', 'Úlcera péptica', 'Gastritis', 'Síndrome de Zollinger-Ellison'],
    contraindications: ['Alergia al omeprazol', 'Uso con atazanavir']
  },
  {
    id: '6',
    name: 'Salbutamol',
    genericName: 'Salbutamol',
    category: 'Respiratorios',
    description: 'Broncodilatador para el tratamiento del asma y EPOC',
    presentation: 'Inhalador 100mcg, 200 dosis',
    manufacturer: 'Pharmadina',
    requiresPrescription: true,
    price: 95.00,
    activeIngredient: 'Salbutamol sulfato 100mcg/dosis',
    indications: ['Asma bronquial', 'EPOC', 'Broncoespasmo'],
    contraindications: ['Alergia al salbutamol', 'Tirotoxicosis no tratada']
  },
  {
    id: '7',
    name: 'Metformina',
    genericName: 'Metformina',
    category: 'Diabetes',
    description: 'Antidiabético oral para diabetes tipo 2',
    presentation: 'Tabletas 850mg, caja x 30',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: true,
    price: 110.00,
    activeIngredient: 'Metformina clorhidrato 850mg',
    indications: ['Diabetes mellitus tipo 2', 'Síndrome de ovario poliquístico'],
    contraindications: ['Insuficiencia renal', 'Acidosis metabólica', 'Insuficiencia hepática']
  },
  {
    id: '8',
    name: 'Vitamina C',
    genericName: 'Ácido Ascórbico',
    category: 'Vitaminas y Suplementos',
    description: 'Suplemento vitamínico para reforzar el sistema inmune',
    presentation: 'Tabletas efervescentes 1g, tubo x 20',
    manufacturer: 'Pharmadina',
    requiresPrescription: false,
    price: 55.00,
    activeIngredient: 'Ácido ascórbico 1000mg',
    indications: ['Deficiencia de vitamina C', 'Refuerzo inmunológico', 'Prevención de resfriados'],
    contraindications: ['Litiasis renal', 'Hemocromatosis']
  },
  {
    id: '9',
    name: 'Loratadina',
    genericName: 'Loratadina',
    category: 'Otros',
    description: 'Antihistamínico para alergias',
    presentation: 'Tabletas 10mg, caja x 10',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: false,
    price: 35.00,
    activeIngredient: 'Loratadina 10mg',
    indications: ['Rinitis alérgica', 'Urticaria', 'Alergia estacional'],
    contraindications: ['Hipersensibilidad a loratadina']
  },
  {
    id: '10',
    name: 'Hidrocortisona',
    genericName: 'Hidrocortisona',
    category: 'Dermatológicos',
    description: 'Crema corticoesteroide para afecciones de la piel',
    presentation: 'Crema 1%, tubo 30g',
    manufacturer: 'Pharmadina',
    requiresPrescription: false,
    price: 70.00,
    activeIngredient: 'Hidrocortisona 1%',
    indications: ['Dermatitis', 'Eczema', 'Psoriasis leve', 'Picaduras de insectos'],
    contraindications: ['Infecciones cutáneas', 'Rosácea', 'Acné vulgar']
  },
  {
    id: '11',
    name: 'Atorvastatina',
    genericName: 'Atorvastatina Cálcica',
    category: 'Cardiovasculares',
    description: 'Estatina para el control del colesterol',
    presentation: 'Tabletas 20mg, caja x 30',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: true,
    price: 145.00,
    activeIngredient: 'Atorvastatina cálcica 20mg',
    indications: ['Hipercolesterolemia', 'Prevención cardiovascular', 'Dislipidemia mixta'],
    contraindications: ['Enfermedad hepática activa', 'Embarazo', 'Lactancia']
  },
  {
    id: '12',
    name: 'Cetirizina',
    genericName: 'Cetirizina',
    category: 'Otros',
    description: 'Antihistamínico de segunda generación',
    presentation: 'Tabletas 10mg, caja x 20',
    manufacturer: 'Pharmadina',
    requiresPrescription: false,
    price: 42.00,
    activeIngredient: 'Cetirizina diclorhidrato 10mg',
    indications: ['Rinitis alérgica', 'Conjuntivitis alérgica', 'Urticaria crónica'],
    contraindications: ['Insuficiencia renal grave', 'Hipersensibilidad a cetirizina']
  },
  {
    id: '13',
    name: 'Azitromicina',
    genericName: 'Azitromicina',
    category: 'Antibióticos',
    description: 'Antibiótico macrólido de amplio espectro',
    presentation: 'Tabletas 500mg, caja x 3',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: true,
    price: 95.00,
    activeIngredient: 'Azitromicina dihidratada 500mg',
    indications: ['Infecciones respiratorias', 'Infecciones de piel', 'Infecciones de transmisión sexual'],
    contraindications: ['Alergia a macrólidos', 'Insuficiencia hepática grave']
  },
  {
    id: '14',
    name: 'Diclofenaco',
    genericName: 'Diclofenaco Sódico',
    category: 'Antiinflamatorios',
    description: 'AINE potente para dolor e inflamación severa',
    presentation: 'Tabletas 50mg, caja x 20',
    manufacturer: 'Pharmadina',
    requiresPrescription: true,
    price: 55.00,
    activeIngredient: 'Diclofenaco sódico 50mg',
    indications: ['Artritis reumatoide', 'Espondilitis', 'Dolor postoperatorio', 'Dismenorrea'],
    contraindications: ['Úlcera péptica', 'Insuficiencia cardíaca', 'Tercer trimestre de embarazo']
  },
  {
    id: '15',
    name: 'Ranitidina',
    genericName: 'Ranitidina',
    category: 'Digestivos',
    description: 'Antagonista H2 para reducir la acidez gástrica',
    presentation: 'Tabletas 150mg, caja x 20',
    manufacturer: 'Laboratorios Leti',
    requiresPrescription: false,
    price: 48.00,
    activeIngredient: 'Ranitidina clorhidrato 150mg',
    indications: ['Úlcera péptica', 'Reflujo gastroesofágico', 'Dispepsia'],
    contraindications: ['Hipersensibilidad a ranitidina', 'Porfiria']
  }
];

export const pharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Farmacia del Ahorro Zona 10',
    chain: 'Farmacia del Ahorro',
    address: 'Av. La Reforma 15-20, Zona 10',
    city: 'Guatemala',
    coordinates: { lat: 14.5995, lng: -90.5151 },
    phone: '2331-4500',
    hours: '24 horas',
    delivery: true,
    rating: 4.5,
    medicinesAvailable: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    stock: [
      { medicineId: '1', quantity: 45, lastUpdated: '2024-03-20' },
      { medicineId: '2', quantity: 12, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 38, lastUpdated: '2024-03-20' },
      { medicineId: '4', quantity: 8, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 25, lastUpdated: '2024-03-20' },
      { medicineId: '6', quantity: 5, lastUpdated: '2024-03-20' },
      { medicineId: '7', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 60, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 30, lastUpdated: '2024-03-20' },
      { medicineId: '10', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '11', quantity: 10, lastUpdated: '2024-03-20' },
      { medicineId: '12', quantity: 22, lastUpdated: '2024-03-20' },
      { medicineId: '13', quantity: 8, lastUpdated: '2024-03-20' },
      { medicineId: '14', quantity: 14, lastUpdated: '2024-03-20' },
      { medicineId: '15', quantity: 20, lastUpdated: '2024-03-20' }
    ],
    distance: 1.2
  },
  {
    id: '2',
    name: 'Cruz Verde Zona 4',
    chain: 'Cruz Verde',
    address: '7a Av. 12-23, Zona 4',
    city: 'Guatemala',
    coordinates: { lat: 14.6256, lng: -90.5128 },
    phone: '2220-3300',
    hours: 'Lun-Sáb: 7:00-20:00, Dom: 8:00-18:00',
    delivery: true,
    rating: 4.3,
    medicinesAvailable: ['1', '3', '5', '8', '9', '10', '12', '15'],
    stock: [
      { medicineId: '1', quantity: 25, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 0, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 40, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '10', quantity: 8, lastUpdated: '2024-03-20' },
      { medicineId: '12', quantity: 12, lastUpdated: '2024-03-20' },
      { medicineId: '15', quantity: 0, lastUpdated: '2024-03-20' }
    ],
    distance: 2.5
  },
  {
    id: '3',
    name: 'Farmacia Batres Zona 11',
    chain: 'Farmacia Batres',
    address: 'Calzada Roosevelt 22-43, Zona 11',
    city: 'Guatemala',
    coordinates: { lat: 14.6133, lng: -90.5456 },
    phone: '2473-2300',
    hours: '24 horas',
    delivery: true,
    rating: 4.6,
    medicinesAvailable: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    stock: [
      { medicineId: '1', quantity: 50, lastUpdated: '2024-03-20' },
      { medicineId: '2', quantity: 20, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 42, lastUpdated: '2024-03-20' },
      { medicineId: '4', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 30, lastUpdated: '2024-03-20' },
      { medicineId: '6', quantity: 10, lastUpdated: '2024-03-20' },
      { medicineId: '7', quantity: 22, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 55, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 35, lastUpdated: '2024-03-20' },
      { medicineId: '10', quantity: 25, lastUpdated: '2024-03-20' },
      { medicineId: '11', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '12', quantity: 28, lastUpdated: '2024-03-20' },
      { medicineId: '13', quantity: 12, lastUpdated: '2024-03-20' },
      { medicineId: '14', quantity: 20, lastUpdated: '2024-03-20' },
      { medicineId: '15', quantity: 25, lastUpdated: '2024-03-20' }
    ],
    distance: 3.8
  },
  {
    id: '4',
    name: 'Farmacia San Nicolás Antigua',
    chain: 'Farmacia San Nicolás',
    address: '5a Av. Norte #29A, Antigua Guatemala',
    city: 'Antigua Guatemala',
    coordinates: { lat: 14.5589, lng: -90.7344 },
    phone: '7832-1234',
    hours: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-14:00',
    delivery: false,
    rating: 4.4,
    medicinesAvailable: ['1', '3', '5', '8', '9'],
    stock: [
      { medicineId: '1', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 10, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 8, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 20, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 5, lastUpdated: '2024-03-20' }
    ],
    distance: 25.0
  },
  {
    id: '5',
    name: 'Farmacia Galeno Pradera',
    chain: 'Farmacia Galeno',
    address: 'Km 13.5 Carretera a El Salvador, C.C. Pradera',
    city: 'Guatemala',
    coordinates: { lat: 14.5472, lng: -90.4411 },
    phone: '6650-5000',
    hours: 'Lun-Dom: 9:00-21:00',
    delivery: true,
    rating: 4.7,
    medicinesAvailable: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    stock: [
      { medicineId: '1', quantity: 35, lastUpdated: '2024-03-20' },
      { medicineId: '2', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 28, lastUpdated: '2024-03-20' },
      { medicineId: '4', quantity: 12, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 22, lastUpdated: '2024-03-20' },
      { medicineId: '6', quantity: 8, lastUpdated: '2024-03-20' },
      { medicineId: '7', quantity: 20, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 45, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 25, lastUpdated: '2024-03-20' },
      { medicineId: '10', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '11', quantity: 10, lastUpdated: '2024-03-20' },
      { medicineId: '12', quantity: 20, lastUpdated: '2024-03-20' },
      { medicineId: '13', quantity: 6, lastUpdated: '2024-03-20' },
      { medicineId: '14', quantity: 16, lastUpdated: '2024-03-20' },
      { medicineId: '15', quantity: 18, lastUpdated: '2024-03-20' }
    ],
    distance: 8.5
  },
  {
    id: '6',
    name: 'Farmacia Meykos Centro',
    chain: 'Farmacia Meykos',
    address: '6a Calle 7-55, Zona 1',
    city: 'Guatemala',
    coordinates: { lat: 14.6417, lng: -90.5130 },
    phone: '2232-8800',
    hours: 'Lun-Vie: 7:00-19:00, Sáb: 8:00-17:00',
    delivery: false,
    rating: 4.2,
    medicinesAvailable: ['1', '2', '3', '4', '5', '7', '8', '9', '11', '13'],
    stock: [
      { medicineId: '1', quantity: 30, lastUpdated: '2024-03-20' },
      { medicineId: '2', quantity: 0, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 20, lastUpdated: '2024-03-20' },
      { medicineId: '4', quantity: 5, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '7', quantity: 10, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 35, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '11', quantity: 8, lastUpdated: '2024-03-20' },
      { medicineId: '13', quantity: 4, lastUpdated: '2024-03-20' }
    ],
    distance: 4.2
  },
  {
    id: '7',
    name: 'Farmacia Carolina & H Zona 15',
    chain: 'Carolina & H',
    address: 'Blvd. Vista Hermosa 25-30, Zona 15',
    city: 'Guatemala',
    coordinates: { lat: 14.5890, lng: -90.4856 },
    phone: '2369-1500',
    hours: 'Lun-Dom: 8:00-22:00',
    delivery: true,
    rating: 4.8,
    medicinesAvailable: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    stock: [
      { medicineId: '1', quantity: 55, lastUpdated: '2024-03-20' },
      { medicineId: '2', quantity: 25, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 48, lastUpdated: '2024-03-20' },
      { medicineId: '4', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 35, lastUpdated: '2024-03-20' },
      { medicineId: '6', quantity: 12, lastUpdated: '2024-03-20' },
      { medicineId: '7', quantity: 28, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 70, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 40, lastUpdated: '2024-03-20' },
      { medicineId: '10', quantity: 22, lastUpdated: '2024-03-20' },
      { medicineId: '11', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '12', quantity: 32, lastUpdated: '2024-03-20' },
      { medicineId: '13', quantity: 14, lastUpdated: '2024-03-20' },
      { medicineId: '14', quantity: 24, lastUpdated: '2024-03-20' },
      { medicineId: '15', quantity: 28, lastUpdated: '2024-03-20' }
    ],
    distance: 5.1
  },
  {
    id: '8',
    name: 'Farmacia San Pablo Miraflores',
    chain: 'Farmacia San Pablo',
    address: '21 Calle 0-34, Zona 11 Miraflores',
    city: 'Guatemala',
    coordinates: { lat: 14.6050, lng: -90.5380 },
    phone: '2440-8900',
    hours: 'Lun-Sáb: 7:00-21:00, Dom: 8:00-20:00',
    delivery: true,
    rating: 4.4,
    medicinesAvailable: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '14'],
    stock: [
      { medicineId: '1', quantity: 40, lastUpdated: '2024-03-20' },
      { medicineId: '2', quantity: 15, lastUpdated: '2024-03-20' },
      { medicineId: '3', quantity: 32, lastUpdated: '2024-03-20' },
      { medicineId: '4', quantity: 10, lastUpdated: '2024-03-20' },
      { medicineId: '5', quantity: 28, lastUpdated: '2024-03-20' },
      { medicineId: '6', quantity: 7, lastUpdated: '2024-03-20' },
      { medicineId: '7', quantity: 18, lastUpdated: '2024-03-20' },
      { medicineId: '8', quantity: 50, lastUpdated: '2024-03-20' },
      { medicineId: '9', quantity: 28, lastUpdated: '2024-03-20' },
      { medicineId: '10', quantity: 16, lastUpdated: '2024-03-20' },
      { medicineId: '12', quantity: 25, lastUpdated: '2024-03-20' },
      { medicineId: '14', quantity: 18, lastUpdated: '2024-03-20' }
    ],
    distance: 3.2
  }
];

export const prescriptions: Prescription[] = [
  {
    id: '1',
    appointmentId: 'apt-001',
    doctorId: '1',
    doctorName: 'Dr. Carlos Méndez',
    patientName: 'Juan Pérez',
    date: '2024-03-15',
    medicines: [
      {
        medicineId: '4',
        medicineName: 'Losartán',
        dosage: '50mg',
        frequency: '1 vez al día',
        duration: '30 días',
        instructions: 'Tomar en la mañana con el desayuno'
      },
      {
        medicineId: '5',
        medicineName: 'Omeprazol',
        dosage: '20mg',
        frequency: '1 vez al día',
        duration: '14 días',
        instructions: 'Tomar 30 minutos antes del desayuno'
      }
    ],
    diagnosis: 'Hipertensión arterial controlada, Gastritis',
    notes: 'Control en 30 días. Dieta baja en sodio.',
    status: 'pending'
  },
  {
    id: '2',
    appointmentId: 'apt-002',
    doctorId: '2',
    doctorName: 'Dra. Ana López',
    patientName: 'Juan Pérez',
    date: '2024-03-10',
    medicines: [
      {
        medicineId: '2',
        medicineName: 'Amoxicilina',
        dosage: '500mg',
        frequency: '3 veces al día',
        duration: '7 días',
        instructions: 'Tomar cada 8 horas con alimentos'
      }
    ],
    diagnosis: 'Faringitis bacteriana',
    notes: 'Completar tratamiento antibiótico. Reposo.',
    status: 'filled'
  },
  {
    id: '3',
    appointmentId: 'apt-003',
    doctorId: '9',
    doctorName: 'Dr. Fernando Paz',
    patientName: 'Juan Pérez',
    date: '2024-03-08',
    medicines: [
      {
        medicineId: '7',
        medicineName: 'Metformina',
        dosage: '850mg',
        frequency: '2 veces al día',
        duration: '90 días',
        instructions: 'Tomar con el desayuno y la cena'
      },
      {
        medicineId: '11',
        medicineName: 'Atorvastatina',
        dosage: '20mg',
        frequency: '1 vez al día',
        duration: '90 días',
        instructions: 'Tomar por la noche'
      }
    ],
    diagnosis: 'Diabetes tipo 2, Dislipidemia',
    notes: 'Control de glucosa en ayunas. Próxima cita en 3 meses.',
    status: 'pending'
  }
];

export const preAppointmentRequirements: PreAppointmentRequirement[] = [
  {
    id: '1',
    appointmentId: 'apt-upcoming-001',
    doctorId: '1',
    doctorName: 'Dr. Carlos Méndez',
    specialty: 'Cardiología',
    appointmentDate: '2024-03-25T10:00:00',
    requirements: [
      {
        type: 'test',
        description: 'Electrocardiograma reciente (máximo 15 días)',
        urgent: true
      },
      {
        type: 'test',
        description: 'Exámenes de sangre: Colesterol total, HDL, LDL, Triglicéridos',
        urgent: true
      },
      {
        type: 'preparation',
        description: 'Ayuno de 12 horas antes de la cita',
        urgent: false
      },
      {
        type: 'document',
        description: 'Traer resultados de consultas anteriores',
        urgent: false
      }
    ],
    completed: false,
    notes: 'Por favor llevar todos los estudios el día de la cita'
  },
  {
    id: '2',
    appointmentId: 'apt-upcoming-002',
    doctorId: '4',
    doctorName: 'Dra. Gabriela Estrada',
    specialty: 'Dermatología',
    appointmentDate: '2024-03-22T14:30:00',
    requirements: [
      {
        type: 'preparation',
        description: 'No aplicar cremas o maquillaje en el área afectada',
        urgent: false
      },
      {
        type: 'document',
        description: 'Lista de medicamentos actuales y alergias conocidas',
        urgent: true
      }
    ],
    completed: false
  },
  {
    id: '3',
    appointmentId: 'apt-upcoming-003',
    doctorId: '9',
    doctorName: 'Dr. Fernando Paz',
    specialty: 'Endocrinología',
    appointmentDate: '2024-03-28T09:00:00',
    requirements: [
      {
        type: 'test',
        description: 'Hemoglobina glucosilada (HbA1c)',
        urgent: true
      },
      {
        type: 'test',
        description: 'Perfil tiroideo completo (TSH, T3, T4)',
        urgent: true
      },
      {
        type: 'document',
        description: 'Registro de glucosa de los últimos 30 días',
        urgent: true
      },
      {
        type: 'preparation',
        description: 'Ayuno de 8-12 horas',
        urgent: false
      }
    ],
    completed: false,
    notes: 'Es importante traer el registro de glucosa para ajustar tratamiento'
  }
];

// Helper functions
export const getMedicineById = (id: string): Medicine | undefined => {
  return medicines.find(med => med.id === id);
};

export const getMedicinesByCategory = (category: string): Medicine[] => {
  if (category === 'all') return medicines;
  return medicines.filter(med => med.category === category);
};

export const getPharmacyById = (id: string): Pharmacy | undefined => {
  return pharmacies.find(pharmacy => pharmacy.id === id);
};

export const getPharmaciesWithMedicine = (medicineId: string): Pharmacy[] => {
  return pharmacies.filter(pharmacy => 
    pharmacy.medicinesAvailable.includes(medicineId)
  );
};

export const getPharmaciesWithStock = (medicineId: string): (Pharmacy & { stockQuantity: number })[] => {
  return pharmacies
    .filter(pharmacy => pharmacy.medicinesAvailable.includes(medicineId))
    .map(pharmacy => {
      const stockInfo = pharmacy.stock.find(s => s.medicineId === medicineId);
      return {
        ...pharmacy,
        stockQuantity: stockInfo?.quantity || 0
      };
    })
    .sort((a, b) => {
      // Sort by distance first, then by stock availability
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return b.stockQuantity - a.stockQuantity;
    });
};

export const getTotalStockForMedicine = (medicineId: string): { 
  totalStock: number; 
  pharmaciesWithStock: number; 
  nearestWithStock?: Pharmacy 
} => {
  const pharmaciesWithMedicine = getPharmaciesWithStock(medicineId);
  const pharmaciesWithActualStock = pharmaciesWithMedicine.filter(p => p.stockQuantity > 0);
  const totalStock = pharmaciesWithMedicine.reduce((sum, p) => sum + p.stockQuantity, 0);
  
  const nearestWithStock = pharmaciesWithActualStock
    .sort((a, b) => (a.distance || 999) - (b.distance || 999))[0];

  return {
    totalStock,
    pharmaciesWithStock: pharmaciesWithActualStock.length,
    nearestWithStock
  };
};

export const getPrescriptionsByPatient = (patientName: string): Prescription[] => {
  return prescriptions.filter(rx => rx.patientName === patientName);
};

export const getPreAppointmentRequirements = (): PreAppointmentRequirement[] => {
  return preAppointmentRequirements.filter(req => !req.completed);
};

export const getAllMedicineCategories = (): string[] => {
  return Array.from(new Set(medicines.map(med => med.category)));
};
