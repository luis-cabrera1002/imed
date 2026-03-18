import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, MapPin, Phone, Clock, Star, Truck, 
  CheckCircle2, Send, Pill, Loader2 
} from "lucide-react";
import { Prescription, Pharmacy } from "@/types/medicines";
import { pharmacies } from "@/data/medicinesData";
import { toast } from "sonner";

interface SendToPharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
}

export const SendToPharmacyDialog = ({ 
  open, 
  onOpenChange, 
  prescription 
}: SendToPharmacyDialogProps) => {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Filter pharmacies that have all the medicines in the prescription
  const availablePharmacies = pharmacies.filter(pharmacy => {
    if (!prescription) return false;
    return prescription.medicines.every(med => 
      pharmacy.medicinesAvailable.includes(med.medicineId)
    );
  });

  const handleSend = async () => {
    if (!selectedPharmacy || !prescription) return;

    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSending(false);
    setIsSent(true);
    
    const pharmacy = pharmacies.find(p => p.id === selectedPharmacy);
    toast.success(`Receta enviada a ${pharmacy?.name}`, {
      description: "La farmacia preparará tu pedido. Te contactarán pronto."
    });

    // Reset after a delay
    setTimeout(() => {
      setIsSent(false);
      setSelectedPharmacy("");
      setAdditionalNotes("");
      onOpenChange(false);
    }, 2000);
  };

  const handleClose = () => {
    if (!isSending) {
      setSelectedPharmacy("");
      setAdditionalNotes("");
      setIsSent(false);
      onOpenChange(false);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isSent ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">¡Receta Enviada!</h3>
            <p className="text-muted-foreground">
              La farmacia recibirá tu receta y preparará tus medicamentos.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Send className="h-5 w-5 text-primary" />
                Enviar Receta a Farmacia
              </DialogTitle>
              <DialogDescription>
                Selecciona una farmacia para que preparen tus medicamentos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Prescription Summary */}
              <Card className="p-4 bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  Medicamentos en la receta
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prescription.medicines.map((med, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {med.medicineName} - {med.dosage}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Dr. {prescription.doctorName} • {prescription.date}
                </p>
              </Card>

              {/* Pharmacy Selection */}
              <div className="space-y-3">
                <h4 className="font-medium">Selecciona una farmacia</h4>
                
                {availablePharmacies.length === 0 ? (
                  <Card className="p-6 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No hay farmacias disponibles con todos los medicamentos de tu receta.
                    </p>
                  </Card>
                ) : (
                  <RadioGroup value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                    <div className="space-y-3">
                      {availablePharmacies.map((pharmacy) => (
                        <Label
                          key={pharmacy.id}
                          htmlFor={pharmacy.id}
                          className={`block cursor-pointer`}
                        >
                          <Card className={`p-4 transition-all hover:shadow-md ${
                            selectedPharmacy === pharmacy.id 
                              ? 'ring-2 ring-primary border-primary' 
                              : 'hover:border-primary/50'
                          }`}>
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={pharmacy.id} id={pharmacy.id} className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="font-semibold">{pharmacy.name}</h5>
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-sm">{pharmacy.rating}</span>
                                  </div>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {pharmacy.address}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    {pharmacy.hours}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <p className="flex items-center gap-1">
                                      <Phone className="h-3.5 w-3.5" />
                                      {pharmacy.phone}
                                    </p>
                                    {pharmacy.delivery && (
                                      <Badge variant="outline" className="text-xs">
                                        <Truck className="h-3 w-3 mr-1" />
                                        Delivery
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>

              {/* Additional Notes */}
              {availablePharmacies.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ej: Prefiero recoger después de las 3pm, necesito factura..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleClose}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleSend}
                  disabled={!selectedPharmacy || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Receta
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
