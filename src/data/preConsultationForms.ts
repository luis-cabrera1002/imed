// Pre-consultation form templates by specialty

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'section-title';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  section?: string;
}

export interface PreConsultationFormTemplate {
  id: string;
  specialty: string;
  title: string;
  description: string;
  sections: {
    title: string;
    icon: string;
    fields: FormField[];
  }[];
}

export interface FilledForm {
  id: string;
  templateId: string;
  patientName: string;
  appointmentId: string;
  filledAt: string;
  answers: Record<string, string | string[] | boolean>;
  status: 'draft' | 'submitted' | 'reviewed';
  specialty: string;
}

// Base fields shared across all specialties
const personalInfoSection = {
  title: 'Información Personal',
  icon: 'user',
  fields: [
    { id: 'full_name', label: 'Nombre completo', type: 'text' as const, required: true, placeholder: 'Nombre y apellidos' },
    { id: 'dpi', label: 'Número de DPI', type: 'text' as const, required: true, placeholder: 'Ej: 1234 56789 0101' },
    { id: 'birth_date', label: 'Fecha de nacimiento', type: 'date' as const, required: true },
    { id: 'gender', label: 'Sexo', type: 'radio' as const, required: true, options: ['Masculino', 'Femenino', 'Otro'] },
    { id: 'phone', label: 'Teléfono', type: 'text' as const, required: true, placeholder: 'Ej: 5555-1234' },
    { id: 'email', label: 'Correo electrónico', type: 'text' as const, placeholder: 'correo@ejemplo.com' },
    { id: 'address', label: 'Dirección', type: 'textarea' as const, placeholder: 'Zona, municipio, departamento' },
  ]
};

const emergencyContactSection = {
  title: 'Contacto de Emergencia',
  icon: 'phone',
  fields: [
    { id: 'emergency_name', label: 'Nombre del contacto', type: 'text' as const, required: true, placeholder: 'Nombre completo' },
    { id: 'emergency_relationship', label: 'Parentesco', type: 'select' as const, required: true, options: ['Esposo/a', 'Padre/Madre', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Otro'] },
    { id: 'emergency_phone', label: 'Teléfono de emergencia', type: 'text' as const, required: true, placeholder: 'Ej: 5555-5678' },
  ]
};

const insuranceSection = {
  title: 'Información de Seguro Médico',
  icon: 'shield',
  fields: [
    { id: 'has_insurance', label: '¿Tiene seguro médico?', type: 'radio' as const, required: true, options: ['Sí', 'No'] },
    { id: 'insurance_company', label: 'Aseguradora', type: 'select' as const, options: ['BAM Seguros', 'Seguros G&T', 'Seguros El Roble', 'IGSS', 'Otro'] },
    { id: 'insurance_number', label: 'Número de póliza / carné', type: 'text' as const, placeholder: 'Número de afiliación' },
  ]
};

const medicalHistorySection = {
  title: 'Historial Médico General',
  icon: 'clipboard',
  fields: [
    { id: 'allergies', label: '¿Tiene alergias a medicamentos?', type: 'radio' as const, required: true, options: ['Sí', 'No'] },
    { id: 'allergies_detail', label: 'Si respondió sí, detalle las alergias', type: 'textarea' as const, placeholder: 'Ej: Penicilina, Ibuprofeno...' },
    { id: 'current_medications', label: 'Medicamentos que toma actualmente', type: 'textarea' as const, placeholder: 'Liste los medicamentos con dosis y frecuencia' },
    { id: 'chronic_conditions', label: 'Enfermedades crónicas', type: 'checkbox' as const, options: ['Diabetes', 'Hipertensión', 'Asma', 'Artritis', 'Enfermedad cardíaca', 'Enfermedad renal', 'Tiroides', 'Ninguna'] },
    { id: 'previous_surgeries', label: 'Cirugías previas', type: 'textarea' as const, placeholder: 'Describa las cirugías y fechas aproximadas' },
    { id: 'family_history', label: 'Antecedentes familiares importantes', type: 'checkbox' as const, options: ['Diabetes', 'Hipertensión', 'Cáncer', 'Enfermedad cardíaca', 'Enfermedad mental', 'Ninguno conocido'] },
  ]
};

const currentSymptomsSection = {
  title: 'Motivo de Consulta y Síntomas',
  icon: 'stethoscope',
  fields: [
    { id: 'reason', label: 'Motivo principal de la consulta', type: 'textarea' as const, required: true, placeholder: 'Describa brevemente por qué solicita esta consulta' },
    { id: 'symptom_duration', label: '¿Desde cuándo presenta los síntomas?', type: 'select' as const, options: ['Menos de 24 horas', '1-3 días', '1 semana', '2-4 semanas', 'Más de un mes', 'Más de 3 meses'] },
    { id: 'pain_level', label: 'Nivel de dolor (0 = sin dolor, 10 = dolor máximo)', type: 'select' as const, options: ['0 - Sin dolor', '1', '2', '3', '4', '5 - Moderado', '6', '7', '8', '9', '10 - Dolor máximo'] },
    { id: 'symptoms_description', label: 'Descripción detallada de los síntomas', type: 'textarea' as const, placeholder: 'Describa los síntomas con el mayor detalle posible' },
  ]
};

const consentSection = {
  title: 'Consentimiento Informado',
  icon: 'file-check',
  fields: [
    { id: 'consent_treatment', label: 'Autorizo al médico a realizar la evaluación y tratamiento necesarios', type: 'checkbox' as const, required: true, options: ['Sí, autorizo'] },
    { id: 'consent_data', label: 'Autorizo el uso de mis datos con fines clínicos', type: 'checkbox' as const, required: true, options: ['Sí, autorizo'] },
    { id: 'consent_signature', label: 'Firma digital (escriba su nombre completo)', type: 'text' as const, required: true, placeholder: 'Su nombre completo como firma' },
    { id: 'consent_date', label: 'Fecha', type: 'date' as const, required: true },
  ]
};

// Specialty-specific sections
const cardiologySection = {
  title: 'Evaluación Cardiovascular',
  icon: 'heart',
  fields: [
    { id: 'chest_pain', label: '¿Experimenta dolor en el pecho?', type: 'radio' as const, options: ['Sí', 'No'] },
    { id: 'shortness_breath', label: '¿Tiene dificultad para respirar?', type: 'radio' as const, options: ['Sí, en reposo', 'Sí, al hacer ejercicio', 'No'] },
    { id: 'palpitations', label: '¿Siente palpitaciones o latidos irregulares?', type: 'radio' as const, options: ['Sí', 'No'] },
    { id: 'swelling', label: '¿Tiene hinchazón en piernas o tobillos?', type: 'radio' as const, options: ['Sí', 'No'] },
    { id: 'exercise_tolerance', label: '¿Cuántas cuadras puede caminar sin detenerse?', type: 'select' as const, options: ['Menos de 1', '1-3', '3-5', 'Más de 5'] },
    { id: 'smoking', label: '¿Fuma o ha fumado?', type: 'radio' as const, options: ['Sí, actualmente', 'Sí, pero dejé', 'No'] },
    { id: 'last_ecg', label: '¿Cuándo fue su último electrocardiograma?', type: 'select' as const, options: ['Nunca', 'Hace menos de 6 meses', 'Hace 6-12 meses', 'Hace más de 1 año'] },
  ]
};

const pediatricsSection = {
  title: 'Evaluación Pediátrica',
  icon: 'baby',
  fields: [
    { id: 'child_age', label: 'Edad del niño/a', type: 'text' as const, required: true, placeholder: 'Ej: 3 años 6 meses' },
    { id: 'birth_type', label: 'Tipo de parto', type: 'radio' as const, options: ['Natural', 'Cesárea'] },
    { id: 'birth_weight', label: 'Peso al nacer (libras)', type: 'text' as const, placeholder: 'Ej: 7 lbs 4 oz' },
    { id: 'vaccinations_up_to_date', label: '¿Vacunas al día?', type: 'radio' as const, options: ['Sí', 'No', 'No estoy seguro/a'] },
    { id: 'feeding', label: 'Tipo de alimentación', type: 'select' as const, options: ['Lactancia materna exclusiva', 'Fórmula', 'Mixta', 'Alimentación complementaria'] },
    { id: 'development_concerns', label: '¿Tiene preocupaciones sobre su desarrollo?', type: 'textarea' as const, placeholder: 'Lenguaje, motricidad, comportamiento...' },
  ]
};

const dermatologySection = {
  title: 'Evaluación Dermatológica',
  icon: 'scan',
  fields: [
    { id: 'skin_area', label: 'Área del cuerpo afectada', type: 'checkbox' as const, options: ['Cara', 'Cuero cabelludo', 'Cuello', 'Pecho', 'Espalda', 'Brazos', 'Piernas', 'Manos', 'Pies', 'Otra'] },
    { id: 'skin_symptoms', label: 'Tipo de síntoma', type: 'checkbox' as const, options: ['Picazón', 'Enrojecimiento', 'Descamación', 'Ampollas', 'Manchas', 'Lunares nuevos', 'Herida que no sana'] },
    { id: 'sun_exposure', label: '¿Se expone frecuentemente al sol?', type: 'radio' as const, options: ['Sí, diariamente', 'Ocasionalmente', 'Raramente'] },
    { id: 'skin_products', label: 'Productos que usa en la piel', type: 'textarea' as const, placeholder: 'Jabones, cremas, maquillaje...' },
  ]
};

const gynecologySection = {
  title: 'Evaluación Ginecológica',
  icon: 'heart-pulse',
  fields: [
    { id: 'last_period', label: 'Fecha de última menstruación', type: 'date' as const },
    { id: 'period_regular', label: '¿Sus periodos son regulares?', type: 'radio' as const, options: ['Sí', 'No'] },
    { id: 'pregnancies', label: 'Número de embarazos previos', type: 'number' as const },
    { id: 'last_pap', label: '¿Cuándo fue su último Papanicolaou?', type: 'select' as const, options: ['Nunca', 'Hace menos de 1 año', '1-2 años', 'Más de 2 años'] },
    { id: 'contraception', label: 'Método anticonceptivo actual', type: 'select' as const, options: ['Ninguno', 'Pastillas', 'Inyectable', 'DIU', 'Implante', 'Preservativo', 'Otro'] },
  ]
};

const ophthalmologySection = {
  title: 'Evaluación Oftalmológica',
  icon: 'eye',
  fields: [
    { id: 'vision_problems', label: 'Problemas de visión', type: 'checkbox' as const, options: ['Visión borrosa de lejos', 'Visión borrosa de cerca', 'Visión doble', 'Manchas flotantes', 'Dolor ocular', 'Ojos secos', 'Ojos rojos'] },
    { id: 'uses_glasses', label: '¿Usa lentes o lentes de contacto?', type: 'radio' as const, options: ['Lentes', 'Lentes de contacto', 'Ambos', 'No'] },
    { id: 'last_eye_exam', label: '¿Cuándo fue su último examen de la vista?', type: 'select' as const, options: ['Nunca', 'Hace menos de 1 año', '1-2 años', 'Más de 2 años'] },
    { id: 'eye_surgery', label: '¿Ha tenido cirugía ocular?', type: 'radio' as const, options: ['Sí', 'No'] },
    { id: 'diabetes_eye', label: '¿Es diabético/a?', type: 'radio' as const, options: ['Sí', 'No'] },
  ]
};

const orthopedicsSection = {
  title: 'Evaluación Ortopédica',
  icon: 'bone',
  fields: [
    { id: 'pain_location', label: 'Ubicación del dolor', type: 'checkbox' as const, options: ['Hombro', 'Codo', 'Muñeca/Mano', 'Columna cervical', 'Columna lumbar', 'Cadera', 'Rodilla', 'Tobillo/Pie'] },
    { id: 'pain_onset', label: '¿Cómo inició el dolor?', type: 'radio' as const, options: ['Gradualmente', 'De repente', 'Después de un golpe/caída', 'Después de ejercicio'] },
    { id: 'mobility', label: '¿Tiene dificultad para moverse?', type: 'radio' as const, options: ['Sí, mucha', 'Sí, algo', 'No'] },
    { id: 'previous_fractures', label: '¿Ha tenido fracturas previas?', type: 'radio' as const, options: ['Sí', 'No'] },
    { id: 'xrays', label: '¿Tiene radiografías o estudios recientes?', type: 'radio' as const, options: ['Sí', 'No'] },
  ]
};

const generalMedicineSection = {
  title: 'Evaluación General',
  icon: 'stethoscope',
  fields: [
    { id: 'weight', label: 'Peso aproximado (libras)', type: 'text' as const, placeholder: 'Ej: 150 lbs' },
    { id: 'height', label: 'Estatura', type: 'text' as const, placeholder: 'Ej: 5\'7" o 1.70 m' },
    { id: 'last_checkup', label: '¿Cuándo fue su último chequeo general?', type: 'select' as const, options: ['Nunca', 'Hace menos de 1 año', '1-2 años', 'Más de 2 años'] },
    { id: 'alcohol', label: '¿Consume alcohol?', type: 'radio' as const, options: ['No', 'Ocasionalmente', 'Frecuentemente'] },
    { id: 'exercise', label: '¿Realiza ejercicio físico?', type: 'select' as const, options: ['No', '1-2 veces por semana', '3-5 veces por semana', 'Diariamente'] },
    { id: 'sleep_quality', label: '¿Cómo duerme?', type: 'radio' as const, options: ['Bien', 'Regular', 'Mal'] },
  ]
};

// Build templates per specialty
export const formTemplates: PreConsultationFormTemplate[] = [
  {
    id: 'form-general',
    specialty: 'Medicina General',
    title: 'Formulario Pre-Consulta — Medicina General',
    description: 'Complete este formulario antes de su cita de medicina general.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, generalMedicineSection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-cardiology',
    specialty: 'Cardiología',
    title: 'Formulario Pre-Consulta — Cardiología',
    description: 'Complete este formulario antes de su cita con el cardiólogo.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, cardiologySection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-pediatrics',
    specialty: 'Pediatría',
    title: 'Formulario Pre-Consulta — Pediatría',
    description: 'Complete este formulario antes de la cita pediátrica de su hijo/a.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, pediatricsSection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-dermatology',
    specialty: 'Dermatología',
    title: 'Formulario Pre-Consulta — Dermatología',
    description: 'Complete este formulario antes de su cita dermatológica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, dermatologySection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-gynecology',
    specialty: 'Ginecología',
    title: 'Formulario Pre-Consulta — Ginecología',
    description: 'Complete este formulario antes de su consulta ginecológica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, gynecologySection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-ophthalmology',
    specialty: 'Oftalmología',
    title: 'Formulario Pre-Consulta — Oftalmología',
    description: 'Complete este formulario antes de su cita oftalmológica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, ophthalmologySection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-orthopedics',
    specialty: 'Ortopedia',
    title: 'Formulario Pre-Consulta — Ortopedia',
    description: 'Complete este formulario antes de su cita ortopédica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, orthopedicsSection, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-neurology',
    specialty: 'Neurología',
    title: 'Formulario Pre-Consulta — Neurología',
    description: 'Complete este formulario antes de su consulta neurológica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, {
      title: 'Evaluación Neurológica',
      icon: 'brain',
      fields: [
        { id: 'headaches', label: '¿Padece de dolores de cabeza frecuentes?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'headache_type', label: 'Tipo de dolor de cabeza', type: 'select' as const, options: ['Migraña', 'Tensional', 'En racimo', 'No sé'] },
        { id: 'dizziness', label: '¿Experimenta mareos o vértigo?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'numbness', label: '¿Siente entumecimiento u hormigueo?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'seizures', label: '¿Ha tenido convulsiones?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'memory_issues', label: '¿Tiene problemas de memoria?', type: 'radio' as const, options: ['Sí', 'No'] },
      ]
    }, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-gastro',
    specialty: 'Gastroenterología',
    title: 'Formulario Pre-Consulta — Gastroenterología',
    description: 'Complete este formulario antes de su consulta gastroenterológica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, {
      title: 'Evaluación Gastrointestinal',
      icon: 'activity',
      fields: [
        { id: 'abdominal_pain', label: '¿Presenta dolor abdominal?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'pain_area_gi', label: 'Área del dolor', type: 'select' as const, options: ['Parte superior', 'Alrededor del ombligo', 'Parte inferior', 'Lado derecho', 'Lado izquierdo', 'Generalizado'] },
        { id: 'nausea_vomiting', label: '¿Náuseas o vómitos?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'bowel_changes', label: 'Cambios en hábitos intestinales', type: 'checkbox' as const, options: ['Diarrea', 'Estreñimiento', 'Sangre en heces', 'Mucosidad', 'Ninguno'] },
        { id: 'weight_change', label: '¿Ha perdido o ganado peso sin razón?', type: 'radio' as const, options: ['Sí, perdí peso', 'Sí, gané peso', 'No'] },
      ]
    }, currentSymptomsSection, consentSection]
  },
  {
    id: 'form-urology',
    specialty: 'Urología',
    title: 'Formulario Pre-Consulta — Urología',
    description: 'Complete este formulario antes de su consulta urológica.',
    sections: [personalInfoSection, emergencyContactSection, insuranceSection, medicalHistorySection, {
      title: 'Evaluación Urológica',
      icon: 'activity',
      fields: [
        { id: 'urinary_frequency', label: '¿Orina con más frecuencia de lo normal?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'urinary_pain', label: '¿Siente dolor o ardor al orinar?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'blood_urine', label: '¿Ha notado sangre en la orina?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'kidney_stones', label: '¿Tiene antecedentes de piedras en los riñones?', type: 'radio' as const, options: ['Sí', 'No'] },
        { id: 'prostate_exam', label: '¿Cuándo fue su último examen de próstata? (hombres)', type: 'select' as const, options: ['No aplica', 'Nunca', 'Hace menos de 1 año', '1-2 años', 'Más de 2 años'] },
      ]
    }, currentSymptomsSection, consentSection]
  },
];

export const getFormBySpecialty = (specialty: string): PreConsultationFormTemplate => {
  const form = formTemplates.find(t => t.specialty === specialty);
  return form || formTemplates[0]; // default to general
};

// Mock filled forms for demo
export const mockFilledForms: FilledForm[] = [
  {
    id: 'filled-1',
    templateId: 'form-cardiology',
    patientName: 'María García',
    appointmentId: '1',
    filledAt: '2024-12-14T10:30:00',
    status: 'submitted',
    specialty: 'Cardiología',
    answers: {
      full_name: 'María García López',
      dpi: '1234 56789 0101',
      gender: 'Femenino',
      phone: '5555-1234',
      emergency_name: 'Carlos García',
      emergency_relationship: 'Esposo/a',
      emergency_phone: '5555-5678',
      has_insurance: 'Sí',
      insurance_company: 'BAM Seguros',
      allergies: 'Sí',
      allergies_detail: 'Penicilina',
      chronic_conditions: ['Hipertensión'],
      chest_pain: 'Sí',
      shortness_breath: 'Sí, al hacer ejercicio',
      reason: 'Control de presión arterial y evaluación de dolor en el pecho',
      pain_level: '4',
      consent_treatment: ['Sí, autorizo'],
      consent_data: ['Sí, autorizo'],
      consent_signature: 'María García López',
    }
  },
  {
    id: 'filled-2',
    templateId: 'form-general',
    patientName: 'Ana Rodríguez',
    appointmentId: '3',
    filledAt: '2024-12-14T08:00:00',
    status: 'submitted',
    specialty: 'Medicina General',
    answers: {
      full_name: 'Ana Rodríguez Pérez',
      dpi: '9876 54321 0101',
      gender: 'Femenino',
      phone: '4444-9876',
      emergency_name: 'José Rodríguez',
      emergency_relationship: 'Padre/Madre',
      emergency_phone: '4444-1111',
      has_insurance: 'No',
      allergies: 'No',
      chronic_conditions: ['Ninguna'],
      reason: 'Dolor de garganta persistente y fiebre baja desde hace 3 días',
      symptom_duration: '1-3 días',
      pain_level: '3',
      consent_treatment: ['Sí, autorizo'],
      consent_data: ['Sí, autorizo'],
      consent_signature: 'Ana Rodríguez Pérez',
    }
  },
];
