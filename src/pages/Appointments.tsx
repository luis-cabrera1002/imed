import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const doctorId = searchParams.get("doctor");

  const [user, setUser] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [doctorPerfil, setDoctorPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cita, setCita] = useState({
    fecha: "",
    hora: "",
    motivo: ""
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);

    if (doctorId) {
      await loadDoctor(doctorId);
    }
    setLoading(false);
  }

  async function loadDoctor(id: string) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    const { data: perfilData } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (profileData) setDoctor(profileData);
    if (perfilData) setDoctorPerfil(perfilData);
  }

  async function agendarCita() {
    if (!cita.fecha || !cita.hora) {
      toast({ title: "Completa la fecha y hora", variant: "destructive" });
      return;
    }
    if (!doctorId) {
      toast({ title: "No se seleccionó doctor", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("citas")
      .insert({
        paciente_id: user.id,
        doctor_id: doctorId,
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo,
        estado: "pendiente"
      });

    setSaving(false);
    if (error) {
      toast({ title: "Error al agendar", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "¡Cita agendada!",
        description: `Tu cita fue agendada para el ${cita.fecha} a las ${cita.hora}.`
      });
      navigate("/my-appointments");
    }
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
          <h1 className="text-xl font-bold">Agendar Cita</h1>
          <Button variant="outline" className="text-white border-white"
            onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {doctor && doctorPerfil && (
          <Card>
            <CardContent className="pt-4">
              <h2 className="font-semibold text-lg">{doctor.full_name}</h2>
              <p className="text-teal-600">{doctorPerfil.especialidad}</p>
              {doctorPerfil.clinica && <p className="text-sm text-gray-500">{doctorPerfil.clinica}</p>}
              {doctorPerfil.direccion && <p className="text-sm text-gray-500">{doctorPerfil.direccion}</p>}
              {doctorPerfil.precio_consulta && (
                <p className="text-sm font-medium mt-1">Consulta: Q{doctorPerfil.precio_consulta}</p>
              )}
              {doctorPerfil.dias_atencion?.length > 0 && (
                <p className="text-sm text-gray-500">
                  Atiende: {doctorPerfil.dias_atencion.join(", ")} de {doctorPerfil.hora_inicio} a {doctorPerfil.hora_fin}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Selecciona fecha y hora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Fecha *</Label>
              <Input type="date" value={cita.fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setCita({...cita, fecha: e.target.value})} />
            </div>
            <div>
              <Label>Hora *</Label>
              <Input type="time" value={cita.hora}
                onChange={e => setCita({...cita, hora: e.target.value})} />
            </div>
            <div>
              <Label>Motivo de la consulta (opcional)</Label>
              <Textarea value={cita.motivo}
                onChange={e => setCita({...cita, motivo: e.target.value})}
                placeholder="Describe brevemente el motivo de tu visita..."
                rows={3} />
            </div>
            <Button onClick={agendarCita} disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-700">
              {saving ? "Agendando..." : "Confirmar Cita"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
