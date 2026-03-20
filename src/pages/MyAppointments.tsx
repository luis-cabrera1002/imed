import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

export default function MyAppointments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCitas();
  }, []);

  async function loadCitas() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data: citasData } = await supabase
      .from("citas").select("*")
      .eq("paciente_id", user.id)
      .order("fecha", { ascending: true });

    if (!citasData || citasData.length === 0) { setLoading(false); return; }

    const doctorIds = [...new Set(citasData.map(c => c.doctor_id))];
    const { data: perfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", doctorIds);
    const { data: doctorPerfiles } = await supabase.from("doctor_profiles").select("user_id, especialidad, clinica").in("user_id", doctorIds);

    setCitas(citasData.map(cita => ({
      ...cita,
      doctor_nombre: perfiles?.find(p => p.user_id === cita.doctor_id)?.full_name || "Doctor",
      especialidad: doctorPerfiles?.find(p => p.user_id === cita.doctor_id)?.especialidad || "",
      clinica: doctorPerfiles?.find(p => p.user_id === cita.doctor_id)?.clinica || "",
    })));
    setLoading(false);
  }

  async function cancelarCita(citaId: string) {
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", citaId);
    if (!error) {
      setCitas(citas.map(c => c.id === citaId ? { ...c, estado: "cancelada" } : c));
      toast({ title: "Cita cancelada" });
    }
  }

  function exportarExcel() {
    const datos = citas.map(c => ({
      "Fecha": c.fecha, "Hora": c.hora, "Doctor": c.doctor_nombre,
      "Especialidad": c.especialidad, "Clínica": c.clinica,
      "Motivo": c.motivo || "—", "Estado": c.estado || "pendiente"
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mis Citas");
    XLSX.writeFile(wb, `mis-citas-imed-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Mis Citas</h1>
          <div className="flex gap-2">
            {citas.length > 0 && (
              <button onClick={exportarExcel}
                className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                Exportar Excel
              </button>
            )}
            <button onClick={() => navigate("/")}
              className="bg-blue-950 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-950 transition">
              Inicio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {citas.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-gray-400 mb-4">No tienes citas agendadas aún.</p>
              <button onClick={() => navigate("/doctores")}
                className="bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-950 transition">
                Buscar un Doctor
              </button>
            </CardContent>
          </Card>
        ) : (
          citas.map(cita => (
            <Card key={cita.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{cita.doctor_nombre}</p>
                    <p className="text-blue-900 text-sm">{cita.especialidad}</p>
                    <p className="text-sm text-gray-500">{cita.fecha} a las {cita.hora}</p>
                    {cita.clinica && <p className="text-sm text-gray-500">{cita.clinica}</p>}
                    {cita.motivo && <p className="text-sm text-gray-600 mt-1">Motivo: {cita.motivo}</p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={
                      cita.estado === "confirmada" ? "bg-green-100 text-green-800" :
                      cita.estado === "cancelada" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      {cita.estado || "pendiente"}
                    </Badge>
                    {cita.estado !== "cancelada" && (
                      <button onClick={() => cancelarCita(cita.id)}
                        className="text-red-600 border border-red-300 px-3 py-1 rounded-lg text-xs hover:bg-red-50 transition">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
