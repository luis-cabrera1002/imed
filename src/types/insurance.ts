export interface InsuranceAgency {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  hours: string;
  rating: number;
  services: string[];
}
