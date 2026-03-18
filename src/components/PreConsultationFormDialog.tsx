import { useState, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  User, Phone, Shield, ClipboardList, Stethoscope, FileCheck,
  Heart, Baby, Eye, Bone, Brain, Activity, Scan, HeartPulse,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { PreConsultationFormTemplate, FormField } from "@/data/preConsultationForms";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PreConsultationFormTemplate;
  patientName?: string;
  onSubmit?: (answers: Record<string, string | string[] | boolean>) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  user: <User className="h-5 w-5" />,
  phone: <Phone className="h-5 w-5" />,
  shield: <Shield className="h-5 w-5" />,
  clipboard: <ClipboardList className="h-5 w-5" />,
  stethoscope: <Stethoscope className="h-5 w-5" />,
  'file-check': <FileCheck className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  baby: <Baby className="h-5 w-5" />,
  eye: <Eye className="h-5 w-5" />,
  bone: <Bone className="h-5 w-5" />,
  brain: <Brain className="h-5 w-5" />,
  activity: <Activity className="h-5 w-5" />,
  scan: <Scan className="h-5 w-5" />,
  'heart-pulse': <HeartPulse className="h-5 w-5" />,
};

const PreConsultationFormDialog = ({ open, onOpenChange, template, patientName, onSubmit }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean>>({});

  const totalSteps = template.sections.length;
  const currentSection = template.sections[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const requiredFieldsComplete = useMemo(() => {
    if (!currentSection) return true;
    return currentSection.fields.filter(f => f.required).every(f => {
      const val = answers[f.id];
      if (Array.isArray(val)) return val.length > 0;
      return val !== undefined && val !== '';
    });
  }, [answers, currentSection]);

  const setValue = (id: string, value: string | string[] | boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = (answers[fieldId] as string[]) || [];
    setValue(fieldId, checked ? [...current, option] : current.filter(o => o !== option));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleSubmit = () => {
    onSubmit?.(answers);
    toast({
      title: "✅ Formulario enviado",
      description: "Su formulario pre-consulta ha sido enviado exitosamente al doctor.",
    });
    setCurrentStep(0);
    setAnswers({});
    onOpenChange(false);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={(answers[field.id] as string) || ''}
            onChange={e => setValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="bg-background"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={(answers[field.id] as string) || ''}
            onChange={e => setValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="bg-background"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={(answers[field.id] as string) || ''}
            onChange={e => setValue(field.id, e.target.value)}
            className="bg-background"
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={(answers[field.id] as string) || ''}
            onChange={e => setValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="bg-background"
          />
        );
      case 'select':
        return (
          <Select value={(answers[field.id] as string) || ''} onValueChange={v => setValue(field.id, v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup
            value={(answers[field.id] as string) || ''}
            onValueChange={v => setValue(field.id, v)}
            className="flex flex-wrap gap-3"
          >
            {field.options?.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="flex flex-wrap gap-3">
            {field.options?.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${opt}`}
                  checked={((answers[field.id] as string[]) || []).includes(opt)}
                  onCheckedChange={checked => handleCheckboxChange(field.id, opt, !!checked)}
                />
                <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              {template.title}
            </DialogTitle>
            <DialogDescription>{template.description}</DialogDescription>
          </DialogHeader>
          {patientName && (
            <Badge variant="outline" className="mt-2">
              <User className="h-3 w-3 mr-1" /> Paciente: {patientName}
            </Badge>
          )}
          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paso {currentStep + 1} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {/* Step indicators */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {template.sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap transition-all ${
                    i === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : i < currentStep
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < currentStep ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {sec.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {currentSection && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {iconMap[currentSection.icon] || <ClipboardList className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentSection.title}</h3>
                  <p className="text-xs text-muted-foreground">Complete los campos requeridos (*)</p>
                </div>
              </div>
              <Separator />
              {currentSection.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Navigation */}
        <DialogFooter className="px-6 py-4 border-t flex-row gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <div className="flex-1" />
          {!requiredFieldsComplete && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
              <AlertCircle className="h-3 w-3" /> Campos requeridos
            </span>
          )}
          {currentStep < totalSteps - 1 ? (
            <Button onClick={handleNext} className="gap-1">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Enviar Formulario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreConsultationFormDialog;
