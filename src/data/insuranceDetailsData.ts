export interface InsuranceDetail {
  id: string;
  name: string;
  logo: string;
  phone: string;
  emergencyPhone: string;
  website: string;
  email: string;
  coverage: {
    category: string;
    items: string[];
    copay?: string;
  }[];
  benefits: string[];
  exclusions: string[];
  networkType: 'Nacional' | 'Internacional' | 'Regional';
  customerServiceHours: string;
}

export const insuranceDetails: InsuranceDetail[] = [
  {
    id: 'bam',
    name: 'BAM',
    logo: 'https://via.placeholder.com/100x50?text=BAM',
    phone: '+502 2338-8888',
    emergencyPhone: '+502 2338-8800',
    website: 'www.bam.com.gt',
    email: 'seguros@bam.com.gt',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Medicina General', 'Todas las especialidades', 'Segunda opinión médica'],
        copay: 'Q60 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Habitación privada', 'Cuidados intensivos', 'Cirugías programadas y de emergencia'],
        copay: '15% coaseguro'
      },
      {
        category: 'Medicamentos',
        items: ['Medicamentos de marca', 'Genéricos', 'Medicamentos oncológicos'],
        copay: '25% del costo'
      },
      {
        category: 'Laboratorios e Imágenes',
        items: ['Exámenes de rutina', 'Exámenes especializados', 'Rayos X', 'Tomografías', 'Resonancias'],
        copay: 'Q75 deducible'
      },
      {
        category: 'Maternidad',
        items: ['Control prenatal', 'Parto normal o cesárea', 'Atención neonatal'],
        copay: 'Incluido después de 10 meses'
      }
    ],
    benefits: [
      'Red de más de 48 doctores especialistas',
      '15 hospitales y clínicas afiliadas en todo el país',
      'Cobertura en departamentos: Guatemala, Quetzaltenango, Escuintla, Alta Verapaz y más',
      'Atención de emergencia 24/7',
      'App móvil para gestión de citas',
      'Programa de bienestar y prevención',
      'Descuentos en farmacias afiliadas'
    ],
    exclusions: [
      'Cirugías estéticas',
      'Tratamientos experimentales',
      'Condiciones preexistentes (primeros 12 meses)',
      'Deportes extremos'
    ],
    networkType: 'Nacional',
    customerServiceHours: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-12:00'
  },
  {
    id: '1',
    name: 'Seguros G&T',
    logo: 'https://via.placeholder.com/100x50?text=G%26T',
    phone: '+502 2338-6565',
    emergencyPhone: '+502 2338-6500',
    website: 'www.segurosgt.com.gt',
    email: 'atencion@segurosgt.com.gt',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Medicina General', 'Especialidades', 'Medicina Preventiva'],
        copay: 'Q50 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Habitación privada', 'Cuidados intensivos', 'Cirugías programadas'],
        copay: '20% coaseguro'
      },
      {
        category: 'Medicamentos',
        items: ['Medicamentos de marca', 'Genéricos', 'Medicamentos especializados'],
        copay: '30% del costo'
      },
      {
        category: 'Laboratorios',
        items: ['Exámenes de rutina', 'Exámenes especializados', 'Imagenología'],
        copay: 'Q100 deducible'
      }
    ],
    benefits: [
      'Cobertura en más de 50 clínicas afiliadas',
      'Atención de emergencia 24/7',
      'Segundo opinión médica gratuita',
      'Programa de bienestar y prevención',
      'Descuentos en farmacias afiliadas'
    ],
    exclusions: [
      'Cirugías estéticas',
      'Tratamientos experimentales',
      'Condiciones preexistentes (primeros 12 meses)'
    ],
    networkType: 'Nacional',
    customerServiceHours: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-12:00'
  },
  {
    id: '2',
    name: 'Mapfre',
    logo: 'https://via.placeholder.com/100x50?text=Mapfre',
    phone: '+502 2277-7777',
    emergencyPhone: '+502 2277-7700',
    website: 'www.mapfre.com.gt',
    email: 'servicios@mapfre.com.gt',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Todas las especialidades', 'Telemedicina incluida', 'Segunda opinión'],
        copay: 'Q75 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Suite privada', 'UCI/UCE', 'Cirugías de alta complejidad'],
        copay: '15% coaseguro'
      },
      {
        category: 'Medicamentos',
        items: ['Cobertura amplia', 'Medicamentos importados', 'Tratamientos oncológicos'],
        copay: '25% del costo'
      },
      {
        category: 'Maternidad',
        items: ['Control prenatal', 'Parto normal o cesárea', 'Atención neonatal'],
        copay: 'Incluido después de 10 meses'
      }
    ],
    benefits: [
      'Red internacional de hospitales',
      'Evacuación médica internacional',
      'App móvil para gestión de citas',
      'Reembolso en 48 horas',
      'Chequeos anuales incluidos'
    ],
    exclusions: [
      'Tratamientos de fertilidad',
      'Cirugía bariátrica (excepto casos médicos)',
      'Deportes extremos'
    ],
    networkType: 'Internacional',
    customerServiceHours: 'Lun-Dom: 24 horas'
  },
  {
    id: '3',
    name: 'Bupa',
    logo: 'https://via.placeholder.com/100x50?text=Bupa',
    phone: '+502 2300-5000',
    emergencyPhone: '+502 2300-5050',
    website: 'www.bupa.com.gt',
    email: 'guatemala@bupa.com',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Especialistas premium', 'Consultas ilimitadas', 'Telemedicina 24/7'],
        copay: 'Sin copago'
      },
      {
        category: 'Hospitalización',
        items: ['Hospitales de primera clase', 'Acompañante cubierto', 'Alimentación especial'],
        copay: '10% coaseguro máximo Q5,000'
      },
      {
        category: 'Tratamientos Especiales',
        items: ['Oncología completa', 'Trasplantes', 'Tratamientos en el extranjero'],
        copay: 'Según plan contratado'
      },
      {
        category: 'Bienestar',
        items: ['Gimnasio', 'Nutricionista', 'Psicología', 'Coaching de salud'],
        copay: 'Incluido'
      }
    ],
    benefits: [
      'Acceso a hospitales de clase mundial',
      'Tratamiento en USA y Europa',
      'Gestor personal de salud',
      'Sin límite anual de cobertura',
      'Programa ejecutivo de chequeos'
    ],
    exclusions: [
      'Periodo de espera 6 meses enfermedades graves',
      'Tratamientos no aprobados por FDA'
    ],
    networkType: 'Internacional',
    customerServiceHours: 'Lun-Dom: 24 horas (multilingüe)'
  },
  {
    id: '4',
    name: 'Universales',
    logo: 'https://via.placeholder.com/100x50?text=Universales',
    phone: '+502 2385-5555',
    emergencyPhone: '+502 2385-5500',
    website: 'www.universales.com.gt',
    email: 'clientes@universales.com.gt',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Medicina General', 'Pediatría', 'Ginecología', 'Medicina Interna'],
        copay: 'Q40 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Habitación compartida o privada', 'Cirugías', 'Emergencias'],
        copay: '25% coaseguro'
      },
      {
        category: 'Medicamentos',
        items: ['Medicamentos genéricos', 'Medicamentos de marca selectos'],
        copay: '35% del costo'
      }
    ],
    benefits: [
      'Primas accesibles',
      'Amplia red de clínicas',
      'Planes familiares con descuento',
      'Atención en todo el país'
    ],
    exclusions: [
      'Enfermedades preexistentes (24 meses)',
      'Tratamientos fuera de Guatemala',
      'Cirugías electivas'
    ],
    networkType: 'Nacional',
    customerServiceHours: 'Lun-Vie: 8:00-17:00'
  },
  {
    id: '5',
    name: 'Pan-American Life',
    logo: 'https://via.placeholder.com/100x50?text=PanAmerican',
    phone: '+502 2279-8888',
    emergencyPhone: '+502 2279-8800',
    website: 'www.palig.com/guatemala',
    email: 'guatemala@palig.com',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Red preferente de especialistas', 'Medicina preventiva', 'Chequeos ejecutivos'],
        copay: 'Q60 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Hospitales de primera', 'Cobertura regional', 'Cirugías programadas'],
        copay: '20% coaseguro'
      },
      {
        category: 'Emergencias',
        items: ['Atención inmediata', 'Ambulancia incluida', 'Evacuación aérea'],
        copay: 'Sin copago en emergencias'
      },
      {
        category: 'Dental y Visual',
        items: ['Limpiezas anuales', 'Extracciones', 'Lentes con receta'],
        copay: '50% del costo'
      }
    ],
    benefits: [
      'Cobertura en toda Centroamérica',
      'Atención en Miami sin trámites',
      'Programa dental incluido',
      'Línea de enfermería 24/7',
      'App para reembolsos digitales'
    ],
    exclusions: [
      'Tratamientos cosméticos',
      'Medicina alternativa',
      'Lesiones autoinfligidas'
    ],
    networkType: 'Internacional',
    customerServiceHours: 'Lun-Vie: 7:00-19:00, Sáb: 8:00-14:00'
  },
  {
    id: '6',
    name: 'BienestarSalud',
    logo: 'https://via.placeholder.com/100x50?text=Bienestar',
    phone: '+502 2222-3333',
    emergencyPhone: '+502 2222-3300',
    website: 'www.bienestarsalud.com.gt',
    email: 'info@bienestarsalud.com.gt',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Medicina General', 'Especialidades básicas'],
        copay: 'Q35 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Habitación estándar', 'Cirugías menores', 'Emergencias'],
        copay: '30% coaseguro'
      },
      {
        category: 'Laboratorios',
        items: ['Exámenes básicos', 'Rayos X'],
        copay: 'Q75 deducible'
      }
    ],
    benefits: [
      'El seguro más económico del mercado',
      'Ideal para familias jóvenes',
      'Sin exámenes médicos de ingreso',
      'Cobertura inmediata accidentes'
    ],
    exclusions: [
      'Enfermedades crónicas',
      'Hospitalización mayor a 15 días',
      'Tratamientos especializados'
    ],
    networkType: 'Regional',
    customerServiceHours: 'Lun-Vie: 8:00-17:00'
  },
  {
    id: '7',
    name: 'Aseguradora Rural',
    logo: 'https://via.placeholder.com/100x50?text=Rural',
    phone: '+502 2339-1717',
    emergencyPhone: '+502 2339-1700',
    website: 'www.aseguradorarural.com.gt',
    email: 'seguros@aseguradorarural.com.gt',
    coverage: [
      {
        category: 'Consultas Médicas',
        items: ['Medicina General', 'Pediatría', 'Control prenatal'],
        copay: 'Q45 por consulta'
      },
      {
        category: 'Hospitalización',
        items: ['Red de hospitales rurales y urbanos', 'Emergencias', 'Maternidad'],
        copay: '20% coaseguro'
      },
      {
        category: 'Programas Especiales',
        items: ['Vacunación', 'Control de diabetes', 'Hipertensión'],
        copay: 'Sin costo adicional'
      }
    ],
    benefits: [
      'Cobertura en áreas rurales',
      'Brigadas médicas móviles',
      'Programas de prevención comunitaria',
      'Atención bilingüe (español/idiomas mayas)'
    ],
    exclusions: [
      'Tratamientos en capital (excepto emergencias)',
      'Cirugías de alta complejidad'
    ],
    networkType: 'Nacional',
    customerServiceHours: 'Lun-Sáb: 7:00-18:00'
  }
];

export const getInsuranceByName = (name: string): InsuranceDetail | undefined => {
  return insuranceDetails.find(
    insurance => insurance.name.toLowerCase().includes(name.toLowerCase()) ||
                 name.toLowerCase().includes(insurance.name.toLowerCase())
  );
};

export const getInsuranceById = (id: string): InsuranceDetail | undefined => {
  return insuranceDetails.find(insurance => insurance.id === id);
};
