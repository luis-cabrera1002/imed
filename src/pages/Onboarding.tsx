import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scan, Calendar, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import imedLogo from "@/assets/imed-logo-new.png";

const PASOS = [
  {
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    titulo: "Agenda tu primera cita",
    descripcion: "Encontra al medico ideal entre mas de 650 especialistas en Guatemala. Agenda en segundos desde tu celular.",
    cta: "Ver medicos",
    ruta: "/doctores",
    emoji: "👨‍⚕️"
  },
  {
    icon: Scan,
    color: "from-orange-500 to-red-500",
    titulo: "Escánea tus medicamentos",
    descripcion: "Fotografiá cualquier medicamento y encontra su equivalente en mas de 10 paises. Perfecto para cuando viajás.",
    cta: "Probar escaner",
    ruta: "/escaner-medicamentos",
    emoji: "💊"
  },
  {
    icon: FileText,
    color: "from-violet-500 to-purple-600",
    titulo: "Guarda tus documentos",
    descripcion: "Subi tus recetas, resultados de laboratorio y radiografias. La IA los analiza y te explica en lenguaje simple.",
    cta: "Mi Dashboard",
    ruta: "/patient-dashboard",
    emoji: "📋"
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);

  function siguiente() {
    if (paso < PASOS.length - 1) setPaso(paso + 1);
    else navigate("/patient-dashboard");
  }

  const p = PASOS[paso];
  const Icon = p.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#1e4080] to-[#2563eb] flex flex-col items-center justify-center px-4">
      <img src={imedLogo} alt="iMed" className="h-10 mb-8" />
      <div className="flex gap-2 mb-8">
        {PASOS.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === paso ? "w-8 bg-white" : i < paso ? "w-2 bg-white/60" : "w-2 bg-white/30"}`} />
        ))}
      </div>
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
        <div className={`w-20 h-20 bg-gradient-to-br ${p.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">{p.emoji}</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{p.titulo}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{p.descripcion}</p>
        </div>
        <div className="space-y-3">
          <Button className={`w-full py-3 bg-gradient-to-r ${p.color} text-white font-bold rounded-xl gap-2`}
            onClick={() => navigate(p.ruta)}>
            {p.cta} <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-full py-3 text-gray-400 rounded-xl" onClick={siguiente}>
            {paso < PASOS.length - 1 ? "Saltar este paso" : "Ir a mi Dashboard"}
          </Button>
        </div>
      </div>
      <button onClick={() => navigate("/patient-dashboard")} className="mt-6 text-white/50 text-sm hover:text-white/80">
        Saltar tutorial
      </button>
    </div>
  );
}
