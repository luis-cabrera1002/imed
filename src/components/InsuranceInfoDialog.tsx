import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  Globe, 
  Mail, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  PhoneCall,
  Building2
} from "lucide-react";
import { InsuranceDetail, getInsuranceByName } from "@/data/insuranceDetailsData";

interface InsuranceInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insuranceName: string;
}

const InsuranceInfoDialog = ({ open, onOpenChange, insuranceName }: InsuranceInfoDialogProps) => {
  const insurance = getInsuranceByName(insuranceName);

  if (!insurance) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seguro no encontrado</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            No se encontró información detallada para "{insuranceName}".
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">{insurance.name}</DialogTitle>
              <Badge 
                variant={insurance.networkType === 'Internacional' ? 'default' : 'secondary'}
                className="mt-1"
              >
                Red {insurance.networkType}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={() => window.open(`tel:${insurance.phone}`, '_self')}
          >
            <Phone className="w-4 h-4" />
            Llamar Ahora
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={() => window.open(`tel:${insurance.emergencyPhone}`, '_self')}
          >
            <PhoneCall className="w-4 h-4" />
            Emergencias
          </Button>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4 text-primary" />
            <span>{insurance.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhoneCall className="w-4 h-4 text-destructive" />
            <span>Emergencias: {insurance.emergencyPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <a 
              href={`https://${insurance.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline"
            >
              {insurance.website}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            <a 
              href={`mailto:${insurance.email}`}
              className="hover:text-primary hover:underline"
            >
              {insurance.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-full">
            <Clock className="w-4 h-4 text-primary" />
            <span>{insurance.customerServiceHours}</span>
          </div>
        </div>

        <Tabs defaultValue="coverage" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coverage">Cobertura</TabsTrigger>
            <TabsTrigger value="benefits">Beneficios</TabsTrigger>
            <TabsTrigger value="exclusions">Exclusiones</TabsTrigger>
          </TabsList>

          <TabsContent value="coverage" className="space-y-4 mt-4">
            {insurance.coverage.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    {category.category}
                  </h4>
                  {category.copay && (
                    <Badge variant="outline" className="text-xs">
                      {category.copay}
                    </Badge>
                  )}
                </div>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="benefits" className="mt-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Beneficios Incluidos
              </h4>
              <ul className="space-y-3">
                {insurance.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="exclusions" className="mt-4">
            <div className="border rounded-lg p-4 border-destructive/20 bg-destructive/5">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" />
                No Incluido en la Cobertura
              </h4>
              <ul className="space-y-3">
                {insurance.exclusions.map((exclusion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>{exclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open(`https://${insurance.website}`, '_blank')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Visitar Sitio Web
          </Button>
          <Button 
            className="flex-1"
            onClick={() => window.open(`mailto:${insurance.email}?subject=Consulta sobre cobertura médica`, '_blank')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar Correo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsuranceInfoDialog;
