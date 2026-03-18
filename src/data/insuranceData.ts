import { InsuranceAgency } from '@/types/insurance';

export const insuranceAgencies: InsuranceAgency[] = [
  {
    id: '1',
    name: 'Seguros G&T Continental - Oficina Zona 10',
    chain: 'Seguros G&T Continental',
    address: '12 Calle 1-25, Zona 10',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6015,
      lng: -90.5070
    },
    phone: '+502 2338-6565',
    hours: 'Lun-Vie: 8:00-17:00, Sáb: 9:00-13:00',
    rating: 4.6,
    services: ['Seguros Médicos', 'Seguros de Vida', 'Consultoría']
  },
  {
    id: '2',
    name: 'Mapfre Guatemala - Zona 9',
    chain: 'Mapfre',
    address: '7a Avenida 12-23, Zona 9',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6095,
      lng: -90.5195
    },
    phone: '+502 2277-7777',
    hours: 'Lun-Vie: 8:30-17:30',
    rating: 4.4,
    services: ['Seguros de Salud', 'Seguros de Vida', 'Seguros de Auto']
  },
  {
    id: '3',
    name: 'Bupa Guatemala - Zona 15',
    chain: 'Bupa',
    address: '4a Avenida 15-45, Zona 15',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.5880,
      lng: -90.4895
    },
    phone: '+502 2300-5000',
    hours: 'Lun-Vie: 8:00-17:00',
    rating: 4.7,
    services: ['Seguros Médicos Internacionales', 'Planes Empresariales']
  },
  {
    id: '4',
    name: 'Pan-American Life - Oakland',
    chain: 'Pan-American Life',
    address: 'Diagonal 6 10-01, Zona 10',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.5965,
      lng: -90.5125
    },
    phone: '+502 2279-8888',
    hours: 'Lun-Vie: 8:00-17:30, Sáb: 9:00-12:00',
    rating: 4.5,
    services: ['Seguros de Salud', 'Seguros de Vida', 'Seguros Colectivos']
  },
  {
    id: '5',
    name: 'Seguros Universales',
    chain: 'Seguros Universales',
    address: '11 Avenida 7-48, Zona 9',
    city: 'Ciudad de Guatemala',
    coordinates: {
      lat: 14.6105,
      lng: -90.5165
    },
    phone: '+502 2385-5555',
    hours: 'Lun-Vie: 8:00-17:00',
    rating: 4.3,
    services: ['Seguros Médicos', 'Planes Familiares', 'Consultoría']
  }
];
