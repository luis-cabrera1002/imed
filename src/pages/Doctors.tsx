
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { allDoctors, specialties, getAllInsurances } from "@/data/mockData";
import { Doctor } from "@/types";
import { Search, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const initialSpecialty = searchParams.get("specialty") || "";
  
  const [searchText, setSearchText] = useState("");
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [rating, setRating] = useState("");
  const [insurances, setInsurances] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(allDoctors);

  useEffect(() => {
    setInsurances(getAllInsurances());
    applyFilters();
  }, [specialty, selectedInsurances, rating]);

  const applyFilters = () => {
    let filtered = [...allDoctors];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchLower) ||
          doctor.specialty.toLowerCase().includes(searchLower)
      );
    }

    if (specialty) {
      filtered = filtered.filter(
        (doctor) => doctor.specialty === specialty
      );
    }

    if (selectedInsurances.length > 0) {
      filtered = filtered.filter((doctor) =>
        selectedInsurances.some((insurance) =>
          doctor.acceptedInsurance.includes(insurance)
        )
      );
    }

    if (rating) {
      filtered = filtered.filter(
        (doctor) => doctor.rating >= parseInt(rating, 10)
      );
    }

    // Sort by rating
    filtered = filtered.sort((a, b) => b.rating - a.rating);

    setDoctors(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleReset = () => {
    setSearchText("");
    setSpecialty("");
    setRating("");
    setSelectedInsurances([]);
    setDoctors(allDoctors);
  };

  const handleInsuranceToggle = (insuranceName: string) => {
    setSelectedInsurances((current) =>
      current.includes(insuranceName)
        ? current.filter((i) => i !== insuranceName)
        : [...current, insuranceName]
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Médicos especialistas</h1>
          
          <div className="flex flex-col p-4 mt-6 space-y-4 bg-white border rounded-lg shadow-sm md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="relative flex-grow">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                className="pl-10"
                placeholder="Buscar por nombre o especialidad..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <Select
                value={specialty}
                onValueChange={(value) => setSpecialty(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Seguros aceptados</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {insurances.map((insurance, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`insurance-${index}`}
                            checked={selectedInsurances.includes(insurance)}
                            onCheckedChange={() => handleInsuranceToggle(insurance)}
                          />
                          <Label htmlFor={`insurance-${index}`}>{insurance}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Valoración mínima</h3>
                    <Select value={rating} onValueChange={setRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier valoración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Cualquier valoración</SelectItem>
                        <SelectItem value="3">3+ estrellas</SelectItem>
                        <SelectItem value="4">4+ estrellas</SelectItem>
                        <SelectItem value="5">5 estrellas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleReset}>
                      Restablecer
                    </Button>
                    <Button onClick={handleSearch}>Aplicar</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
          
          {/* Results */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">
              {doctors.length} médicos encontrados
            </h2>
            
            {doctors.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No se encontraron médicos con los criterios seleccionados.
                </p>
                <Button className="mt-4" variant="outline" onClick={handleReset}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Doctors;
