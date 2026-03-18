
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { specialties as allSpecialties, insurances } from "@/data/mockData";

interface FilterBarProps {
  onSearch: (filters: any) => void;
}

const FilterBar = ({ onSearch }: FilterBarProps) => {
  const [searchText, setSearchText] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [rating, setRating] = useState("");

  const handleSearch = () => {
    onSearch({
      searchText,
      specialty,
      showEmergency,
      selectedInsurances,
      rating: rating ? parseInt(rating, 10) : 0,
    });
  };

  const handleInsuranceToggle = (insuranceName: string) => {
    setSelectedInsurances((current) =>
      current.includes(insuranceName)
        ? current.filter((i) => i !== insuranceName)
        : [...current, insuranceName]
    );
  };

  const handleReset = () => {
    setSearchText("");
    setSpecialty("");
    setShowEmergency(false);
    setSelectedInsurances([]);
    setRating("");
    onSearch({});
  };

  return (
    <div className="flex flex-col p-4 space-y-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            className="pl-10"
            placeholder="Buscar clínicas, médicos o especialidades..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
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
              {allSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="emergency"
            checked={showEmergency}
            onCheckedChange={(checked) => setShowEmergency(!!checked)}
          />
          <Label htmlFor="emergency">Servicio de urgencias</Label>
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
                  {insurances.map((insurance) => (
                    <div key={insurance.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`insurance-${insurance.id}`}
                        checked={selectedInsurances.includes(insurance.name)}
                        onCheckedChange={() => handleInsuranceToggle(insurance.name)}
                      />
                      <Label htmlFor={`insurance-${insurance.id}`}>
                        {insurance.name}
                      </Label>
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
      </div>
    </div>
  );
};

export default FilterBar;
