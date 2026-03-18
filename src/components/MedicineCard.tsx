import { Medicine } from "@/types/medicines";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, MapPin, Package, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTotalStockForMedicine } from "@/data/medicinesData";

interface MedicineCardProps {
  medicine: Medicine;
}

export const MedicineCard = ({ medicine }: MedicineCardProps) => {
  const navigate = useNavigate();
  const stockInfo = getTotalStockForMedicine(medicine.id);

  const getStockStatus = () => {
    if (stockInfo.totalStock === 0) {
      return { label: "Sin stock", variant: "destructive" as const, icon: AlertTriangle };
    }
    if (stockInfo.totalStock < 10) {
      return { label: "Stock bajo", variant: "secondary" as const, icon: Package };
    }
    return { label: "Disponible", variant: "default" as const, icon: CheckCircle2 };
  };

  const status = getStockStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{medicine.name}</h3>
              <p className="text-sm text-muted-foreground">{medicine.genericName}</p>
            </div>
          </div>
          {medicine.requiresPrescription && (
            <Badge variant="destructive" className="text-xs">
              Requiere Receta
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Presentación</p>
            <p className="text-sm">{medicine.presentation}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categoría</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {medicine.category}
              </Badge>
            </div>
            <div className="text-right">
              <Badge variant={status.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          </div>

          {stockInfo.pharmaciesWithStock > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  <strong>{stockInfo.pharmaciesWithStock}</strong> farmacia{stockInfo.pharmaciesWithStock !== 1 ? 's' : ''} con stock
                </span>
              </div>
              {stockInfo.nearestWithStock && (
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Más cercana: {stockInfo.nearestWithStock.name} ({stockInfo.nearestWithStock.distance} km)
                </p>
              )}
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-2xl font-bold text-primary">
              Q{medicine.price.toFixed(2)}
            </p>
          </div>

          <Button
            onClick={() => navigate(`/medicinas/${medicine.id}`)}
            className="w-full"
            variant="default"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Ver Farmacias y Stock
          </Button>
        </div>
      </div>
    </Card>
  );
};
