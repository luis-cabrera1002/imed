import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, ClipboardList, CheckCircle2, Clock, FileText } from "lucide-react";
import { FilledForm, getFormBySpecialty } from "@/data/preConsultationForms";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filledForm: FilledForm | null;
}

const ViewFilledFormDialog = ({ open, onOpenChange, filledForm }: Props) => {
  if (!filledForm) return null;

  const template = getFormBySpecialty(filledForm.specialty);

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    submitted: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle2 className="h-3 w-3" /> },
    reviewed: { label: 'Revisado', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
  };

  const status = statusConfig[filledForm.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Formulario Pre-Consulta
            </DialogTitle>
            <DialogDescription>{template.title}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <User className="h-3 w-3" /> {filledForm.patientName}
            </Badge>
            <Badge className={`${status.color} gap-1`}>
              {status.icon} {status.label}
            </Badge>
            <Badge variant="secondary">
              {filledForm.specialty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Enviado: {format(new Date(filledForm.filledAt), "d MMM yyyy, HH:mm", { locale: es })}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {template.sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-6">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-3">
                <ClipboardList className="h-4 w-4 text-primary" />
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.fields.map(field => {
                  const answer = filledForm.answers[field.id];
                  if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
                    return (
                      <div key={field.id} className="flex items-start gap-3 py-2">
                        <span className="text-sm text-muted-foreground min-w-[180px]">{field.label}:</span>
                        <span className="text-sm text-muted-foreground/50 italic">No respondido</span>
                      </div>
                    );
                  }
                  return (
                    <div key={field.id} className="flex items-start gap-3 py-2">
                      <span className="text-sm text-muted-foreground min-w-[180px]">{field.label}:</span>
                      <span className="text-sm font-medium">
                        {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {sIdx < template.sections.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFilledFormDialog;
