import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("citas")
      .select(`
        *,
        doctor:profiles!citas_doctor_id_fkey(full_name),
        doctor_perfil:doctor_profiles!citas_doctor_id_fkey(especialidad, clinica, telefono)
      `)
      .eq("paciente_id", user.id)
      .order("fecha", { ascending: true });

    if (data) setCitas(data);
    setLoading(false);
  }

  async function cancelarCita(citaId: string) {
    const { error } = await supabase
      .from("citas")
      .update({ estado: "cancelada" })
      .eq("id", citaId);

    if (!error) {
      setCitas(citas.map(c => c.id === citaId ? { ...c, estado: "cancelada" } : c));
      toast({ title: "Cita cancelada" });
    }
  }

  function exportarExcel() {
    const datos = citas.map(c => ({
      "Fecha": c.fecha,
      "Hora": c.hora,
      "Doctor": c.doctor?.full_name || "—",
      "Especialidad": c.doctor_perfil?.especialidad || "—",
      "Clínica": c.doctor_perfil?.clinica || "—",
      "Motivo": c.motivo || "—",
      "Estado": c.estado || "pendiente"
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
      <div className="bg-teal-600 text-white p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Mis Citas</h1>
          <div className="flex gap-2">
            {citas.length > 0 && (
              <Button variant="outline" className="text-white border-white text-sm"
                onClick={exportarExcel}>
                Exportar Excel
              </Button>
            )}
            <Button variant="outline" className="text-white border-white"
              onClick={() => navigate("/")}>
              Inicio
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {citas.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-gray-400 mb-4">No tienes citas agendadas aún.</p>
              <Button onClick={() => navigate("/doctors")}
                className="bg-teal-600 hover:bg-teal-700">
                Buscar un Doctor
              </Button>
            </CardContent>
          </Card>
        ) : (
          citas.map(cita => (
            <Card key={cita.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{cita.doctor?.full_name || "Doctor"}</p>
                    <p className="text-teal-600 text-sm">{cita.doctor_perfil?.especialidad}</p>
                    <p className="text-sm text-gray-500">{cita.fecha} a las {cita.hora}</p>
                    {cita.doctor_perfil?.clinica && (
                      <p className="text-sm text-gray-500">{cita.doctor_perfil.clinica}</p>
                    )}
                    {cita.motivo && (
                      <p className="text-sm text-gray-600 mt-1">Motivo: {cita.motivo}</p>
                    )}
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
                      <Button size="sm" variant="outline"
                        className="text-red-600 border-red-300 text-xs"
                        onClick={() => cancelarCita(cita.id)}>
                        Cancelar
                      </Button>
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
