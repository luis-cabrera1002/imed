import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MedicineCard } from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { medicines, getAllMedicineCategories } from "@/data/medicinesData";
import { Search, Filter, Pill } from "lucide-react";

const Medicines = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [requiresPrescription, setRequiresPrescription] = useState<string>("all");

  const categories = getAllMedicineCategories();

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || medicine.category === selectedCategory;

    const matchesPrescription =
      requiresPrescription === "all" ||
      (requiresPrescription === "yes" && medicine.requiresPrescription) ||
      (requiresPrescription === "no" && !medicine.requiresPrescription);

    return matchesSearch && matchesCategory && matchesPrescription;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Pill className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Catálogo de Medicinas</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Encuentra tus Medicinas
              </h1>
              <p className="text-lg text-muted-foreground">
                Busca medicamentos y descubre dónde encontrarlos en farmacias cercanas
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o principio activo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={requiresPrescription} onValueChange={setRequiresPrescription}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de venta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="no">Venta libre</SelectItem>
                  <SelectItem value="yes">Requiere receta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredMedicines.length} medicamento{filteredMedicines.length !== 1 ? 's' : ''} encontrado{filteredMedicines.length !== 1 ? 's' : ''}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setRequiresPrescription("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </section>

        {/* Medicines Grid */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron medicinas</h3>
              <p className="text-muted-foreground">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Medicines;
