import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

const MedicalDisclaimer = ({ compact = false }: MedicalDisclaimerProps) => {
  if (compact) {
    return (
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Aviso:</strong> iMed no es un servicio médico. La información proporcionada es orientativa y no reemplaza la consulta con un profesional de la salud certificado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800 mb-1">Aviso médico importante</p>
        <p className="text-sm text-amber-700 leading-relaxed">
          iMed no es un servicio médico. La información y los resultados proporcionados por esta herramienta son
          de carácter <strong>orientativo e informativo</strong> únicamente. No constituyen diagnóstico, prescripción
          ni tratamiento médico. Siempre consultá con un profesional de la salud certificado antes de tomar
          decisiones sobre tu salud.
        </p>
        <p className="text-xs text-amber-600 mt-2">
          En caso de emergencia, llamá al <strong>1500</strong> (Bomberos Voluntarios de Guatemala) o acudí al centro de salud más cercano.
        </p>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
