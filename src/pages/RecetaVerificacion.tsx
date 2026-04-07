import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, QrCode, Pill, User, Calendar, FileText, ArrowLeft } from "lucide-react";

export default function RecetaVerificacion() {
  const { qr_code } = useParams<{ qr_code: string }>();
  const navigate = useNavigate();
  const [receta, setReceta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    verify();
  }, [qr_code]);

  async function verify() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data, error } = await supabase
      .from("recetas_digitales")
      .select("*")
      .eq("qr_code", qr_code)
      .single();

    if (error || !data) { setNotFound(true); setLoading(false); return; }

    const [{ data: docProfile }, { data: pacProfile }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", data.doctor_id).single(),
      supabase.from("profiles").select("full_name").eq("user_id", data.paciente_id).single(),
    ]);

    setReceta({
      ...data,
      doctor_nombre: docProfile?.full_name || "Doctor",
      paciente_nombre: pacProfile?.full_name || "Paciente",
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-500 text-sm">Verificando receta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receta no válida</h1>
          <p className="text-gray-500 mb-6">El código QR escaneado no corresponde a ninguna receta en el sistema o ya fue usada.</p>
          <Button onClick={() => navigate("/")} variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4"/> Volver</Button>
        </div>
      </div>
    );
  }

  const estadoColor = receta.estado === "activa" ? "text-green-700 bg-green-50 border-green-200"
    : receta.estado === "usada" ? "text-gray-600 bg-gray-50 border-gray-200"
    : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft className="w-4 h-4"/> Volver
        </button>

        {/* Verification banner */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border mb-6 ${estadoColor}`}>
          {receta.estado === "activa" ? <CheckCircle className="w-5 h-5 flex-shrink-0"/> : <XCircle className="w-5 h-5 flex-shrink-0"/>}
          <div>
            <p className="font-bold text-sm">
              {receta.estado === "activa" ? "Receta válida y activa" : receta.estado === "usada" ? "Receta ya utilizada" : "Receta vencida"}
            </p>
            <p className="text-xs opacity-80">Código QR verificado en iMed Guatemala</p>
          </div>
        </div>

        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600"/>
              </div>
              <div>
                <p className="font-bold text-gray-900">Receta Digital iMed</p>
                <p className="text-xs text-gray-400">Emitida el {new Date(receta.fecha).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                  <User className="w-3 h-3"/> Médico
                </p>
                <p className="text-sm font-bold text-gray-900">{receta.doctor_nombre}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1 mb-1">
                  <User className="w-3 h-3"/> Paciente
                </p>
                <p className="text-sm font-bold text-gray-900">{receta.paciente_nombre}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-3">
                <Pill className="w-3 h-3"/> Medicamentos prescritos
              </p>
              <div className="space-y-2">
                {(receta.medicamentos || []).map((m: any, i: number) => (
                  <div key={i} className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                    <p className="font-bold text-gray-900 text-sm">{m.nombre} <span className="font-normal text-gray-500">{m.dosis}</span></p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {m.frecuencia && <span className="text-xs text-gray-500">{m.frecuencia}</span>}
                      {m.duracion && <span className="text-xs text-gray-500">· {m.duracion}</span>}
                    </div>
                    {m.instrucciones && <p className="text-xs text-gray-500 mt-1 italic">{m.instrucciones}</p>}
                  </div>
                ))}
              </div>
            </div>

            {receta.notas && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Notas del médico</p>
                <p className="text-sm text-blue-800">{receta.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <QrCode className="w-3.5 h-3.5"/>
          <span>Código: {receta.qr_code}</span>
        </div>
      </div>
    </div>
  );
}
