import { useParams, useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMedicineById, getPharmaciesWithStock } from "@/data/medicinesData";
import { 
  Pill, 
  MapPin, 
  Phone, 
  Clock, 
  Truck,
  AlertTriangle,
  CheckCircle2,
  Factory,
  FlaskConical,
  Package,
  Navigation
} from "lucide-react";
import RatingStars from "@/components/RatingStars";
import type { MapLocation } from "@/components/Map";

const Map = lazy(() => import("@/components/Map"));

const MedicineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const medicine = getMedicineById(id || "");
  const pharmaciesWithStock = getPharmaciesWithStock(id || "");

  const pharmacyLocations: MapLocation[] = pharmaciesWithStock
    .filter(p => p.stockQuantity > 0)
    .map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.name,
      address: pharmacy.address,
      coordinates: pharmacy.coordinates,
      type: 'pharmacy' as const
    }));

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return { label: "Agotado", variant: "destructive" as const };
    if (quantity < 10) return { label: `${quantity} unidades`, variant: "secondary" as const };
    return { label: `${quantity} en stock`, variant: "default" as const };
  };

  if (!medicine) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Medicina no encontrada</h2>
            <p className="text-muted-foreground">La medicina que buscas no está disponible</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background rounded-lg border p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="p-6 bg-primary/10 rounded-2xl">
                <Pill className="h-16 w-16 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{medicine.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">{medicine.genericName}</p>
                    <Badge variant="secondary" className="mr-2">{medicine.category}</Badge>
                    {medicine.requiresPrescription && <Badge variant="destructive">Requiere Receta Médica</Badge>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Precio</p>
                    <p className="text-4xl font-bold text-primary">Q{medicine.price.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{medicine.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información del Medicamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Principio Activo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{medicine.activeIngredient}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Factory className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Fabricante</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Indicaciones</h2>
                </div>
                <ul className="space-y-2">
                  {medicine.indications.map((indication, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{indication}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h2 className="text-xl font-semibold">Contraindicaciones</h2>
                </div>
                <ul className="space-y-2">
                  {medicine.contraindications.map((contraindication, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-1">•</span>
                      <span>{contraindication}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Disponibilidad en Farmacias</h2>
                  <Badge variant="outline" className="gap-1">
                    <Package className="h-3 w-3" />
                    {pharmaciesWithStock.filter(p => p.stockQuantity > 0).length} con stock
                  </Badge>
                </div>
                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                  {pharmaciesWithStock.map((pharmacy) => {
                    const stockBadge = getStockBadge(pharmacy.stockQuantity);
                    return (
                      <div 
                        key={pharmacy.id} 
                        className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                          pharmacy.stockQuantity === 0 ? 'opacity-60 bg-muted/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{pharmacy.name}</h3>
                            {pharmacy.distance && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {pharmacy.distance} km de distancia
                              </p>
                            )}
                          </div>
                          <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{pharmacy.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{pharmacy.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{pharmacy.hours}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {pharmacy.delivery ? (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Truck className="h-4 w-4" /> Delivery disponible
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">Solo retiro en tienda</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            disabled={pharmacy.stockQuantity === 0}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            {pharmacy.stockQuantity > 0 ? 'Reservar' : 'Sin stock'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent((pharmacy.name || '') + ' ' + (pharmacy.address || '') + ' Guatemala')}`, '_blank')}>
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {pharmacyLocations.length > 0 && (
                  <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
                    <div className="rounded-lg overflow-hidden border h-64">
                      <Map locations={pharmacyLocations} showLegend={false} />
                    </div>
                  </Suspense>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MedicineDetail;