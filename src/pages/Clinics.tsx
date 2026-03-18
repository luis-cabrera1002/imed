
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterBar from "@/components/FilterBar";
import ClinicCard from "@/components/ClinicCard";
import MapDemo, { MapLocation } from "@/components/MapDemo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allClinics } from "@/data/mockData";
import { pharmacies } from "@/data/medicinesData";
import { insuranceAgencies } from "@/data/insuranceData";
import { Clinic } from "@/types";
import { useSearchParams } from "react-router-dom";

const Clinics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(allClinics);
  const [selectedClinicId, setSelectedClinicId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<string>("listado");

  // Sync state with URL params
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const selectedParam = searchParams.get("selected");
    const queryParam = searchParams.get("q");
    
    if (viewParam === "mapa") {
      setView("mapa");
    } else {
      setView("listado");
    }
    
    if (selectedParam) {
      setSelectedClinicId(selectedParam);
    }
    
    if (queryParam) {
      handleSearch({ searchText: queryParam });
    }
  }, [searchParams]);

  // Prepare all locations for the map
  const allLocations: MapLocation[] = [
    ...allClinics.map(clinic => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      coordinates: clinic.coordinates,
      type: (clinic.emergency ? 'hospital' : 'clinic') as 'hospital' | 'clinic',
      emergency: clinic.emergency
    })),
    ...pharmacies.map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      coordinates: pharmacy.coordinates,
      type: 'pharmacy' as const
    })),
    ...insuranceAgencies.map(agency => ({
      id: agency.id,
      name: agency.name,
      address: agency.address,
      coordinates: agency.coordinates,
      type: 'insurance' as const
    }))
  ];

  const handleSearch = (filters: any) => {
    let filtered = [...allClinics];

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(searchLower) ||
          clinic.address.toLowerCase().includes(searchLower) ||
          clinic.specialties.some((s) => s.toLowerCase().includes(searchLower))
      );
    }

    if (filters.specialty && filters.specialty !== "all") {
      filtered = filtered.filter((clinic) =>
        clinic.specialties.includes(filters.specialty)
      );
    }

    if (filters.showEmergency) {
      filtered = filtered.filter((clinic) => clinic.emergency);
    }

    if (filters.selectedInsurances && filters.selectedInsurances.length > 0) {
      filtered = filtered.filter((clinic) =>
        filters.selectedInsurances.some((insurance: string) =>
          clinic.acceptedInsurance.includes(insurance)
        )
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((clinic) => clinic.rating >= filters.rating);
    }

    setFilteredClinics(filtered);
  };

  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setView("mapa");
    setSearchParams({ view: "mapa", selected: clinicId });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Clínicas y centros médicos</h1>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                ← Volver al Inicio
              </Button>
            </Link>
          </div>
          <div className="mt-6">
            <FilterBar onSearch={handleSearch} />
          </div>
          <div className="mt-6">
            <Tabs value={view} onValueChange={(newView) => {
              setView(newView);
              setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set("view", newView);
                return newParams;
              });
            }}>
              <TabsList>
                <TabsTrigger value="listado">Listado</TabsTrigger>
                <TabsTrigger value="mapa">Mapa</TabsTrigger>
              </TabsList>
              <TabsContent value="listado" className="mt-4">
                {filteredClinics.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredClinics.map((clinic) => (
                      <ClinicCard key={clinic.id} clinic={clinic} />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-lg text-gray-500">
                      No se encontraron clínicas con los filtros seleccionados.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="mapa" className="mt-4">
                <div className="h-[calc(100vh-280px)]">
                  <MapDemo
                    locations={allLocations}
                    selectedLocationId={selectedClinicId}
                    onSelectLocation={(id) => setSelectedClinicId(id)}
                    showLegend={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Clinics;
