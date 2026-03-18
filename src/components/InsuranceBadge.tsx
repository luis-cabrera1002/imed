import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Phone, Info, ExternalLink, Shield } from "lucide-react";
import { getInsuranceByName } from "@/data/insuranceDetailsData";
import InsuranceInfoDialog from "./InsuranceInfoDialog";

interface InsuranceBadgeProps {
  insuranceName: string;
  showQuickInfo?: boolean;
}

const InsuranceBadge = ({ insuranceName, showQuickInfo = true }: InsuranceBadgeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const insurance = getInsuranceByName(insuranceName);

  if (!showQuickInfo || !insurance) {
    return (
      <Badge variant="outline" className="text-sm bg-background">
        {insuranceName}
      </Badge>
    );
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Badge 
            variant="outline" 
            className="text-sm bg-background cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            {insuranceName}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 bg-background border shadow-lg z-50" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{insurance.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {insurance.networkType}
              </Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3 h-3 text-primary" />
                <a 
                  href={`tel:${insurance.phone}`}
                  className="hover:text-primary hover:underline"
                >
                  {insurance.phone}
                </a>
              </div>
              <div className="text-muted-foreground line-clamp-2">
                <span className="font-medium">Horario:</span> {insurance.customerServiceHours}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => window.open(`tel:${insurance.phone}`, '_self')}
              >
                <Phone className="w-3 h-3 mr-1" />
                Llamar
              </Button>
              <Button 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => setDialogOpen(true)}
              >
                <Info className="w-3 h-3 mr-1" />
                Ver Cobertura
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <InsuranceInfoDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        insuranceName={insuranceName}
      />
    </>
  );
};

export default InsuranceBadge;
