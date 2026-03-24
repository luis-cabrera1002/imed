import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import imedLogo from "@/assets/imed-logo-new.png";

export default function EmailConfirmado() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Supabase maneja la sesión automáticamente con el token en la URL
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/patient-dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#1e4080] to-[#2563eb] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
        {/* Logo */}
        <img src={imedLogo} alt="iMed" className="h-10 mx-auto mb-6" />

        {/* Check animado */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Cuenta confirmada! 🎉
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Tu cuenta en <strong>iMed Guatemala</strong> ha sido verificada exitosamente. Ya podés acceder a todos los servicios médicos.
        </p>

        {/* Features */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
          {[
            "🏥 Buscá médicos y especialistas",
            "📅 Agendá citas en segundos",
            "💊 Escaneá tus medicamentos con IA",
            "📋 Guardá tus documentos médicos",
          ].map(f => (
            <p key={f} className="text-sm text-gray-700 font-medium">{f}</p>
          ))}
        </div>

        <Button
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white rounded-xl py-3 font-bold gap-2"
          onClick={() => navigate("/patient-dashboard")}
        >
          Ir a mi Dashboard <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          Redirigiendo automáticamente en {countdown}s...
        </p>

        <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-400">
          <Heart className="w-3 h-3 text-red-400" />
          Tu salud, a un clic de distancia
        </div>
      </div>
    </div>
  );
}
