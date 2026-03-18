
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllSpecialties, getTopDoctorsBySpecialty, doctors } from "@/data/mockData";
import { Specialty } from "@/types";
import RatingStars from "@/components/RatingStars";

const SpecialtyCard = ({ specialty }: { specialty: string }) => {
  const topDoctors = getTopDoctorsBySpecialty(specialty, 1);
  const doctorCount = doctors.filter(d => d.specialty === specialty).length;
  
  // Determine color class based on specialty
  const getSpecialtyClass = (specialty: string): string => {
    const normalizedSpecialty = specialty.toLowerCase().replace('í', 'i').replace('ó', 'o').replace('é', 'e');
    return `specialty-${normalizedSpecialty}`;
  };
  
  return (
    <Link to={`/doctores?specialty=${specialty}`}>
      <div className="overflow-hidden transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
        <div className="p-5">
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${getSpecialtyClass(specialty)}`}>
              <span className="text-xl font-bold">{specialty.charAt(0)}</span>
            </div>
            <h3 className="ml-3 text-lg font-semibold">{specialty}</h3>
          </div>
          <p className="text-sm text-gray-500">{doctorCount} médicos especialistas</p>
          
          {topDoctors.length > 0 && (
            <div className="p-3 mt-4 bg-gray-50 rounded-lg">
              <p className="mb-2 text-xs font-medium text-gray-500">Médico destacado</p>
              <div className="flex items-center">
                <div className="w-10 h-10 overflow-hidden rounded-full">
                  <img
                    src={topDoctors[0].image}
                    alt={topDoctors[0].name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{topDoctors[0].name}</p>
                  <div className="flex items-center mt-1">
                    <RatingStars rating={topDoctors[0].rating} size="sm" />
                    <span className="ml-1 text-xs text-gray-500">
                      ({topDoctors[0].ratingsCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Button variant="link" className="w-full mt-3 text-guatehealth-primary">
            Ver médicos
          </Button>
        </div>
      </div>
    </Link>
  );
};

const Specialties = () => {
  const [searchText, setSearchText] = useState("");
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    const allSpecialties = getAllSpecialties() as Specialty[];
    setSpecialties(allSpecialties);
    setFilteredSpecialties(allSpecialties);
  }, []);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setFilteredSpecialties(specialties);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = specialties.filter(specialty =>
      specialty.toLowerCase().includes(searchLower)
    );
    setFilteredSpecialties(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Especialidades médicas</h1>
          
          <div className="flex flex-col mt-6 space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="relative flex-grow">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                className="pl-10"
                placeholder="Buscar especialidad..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpecialties.map((specialty) => (
              <SpecialtyCard key={specialty} specialty={specialty} />
            ))}
          </div>
          
          {filteredSpecialties.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-lg text-gray-500">
                No se encontraron especialidades con los criterios de búsqueda.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Specialties;
