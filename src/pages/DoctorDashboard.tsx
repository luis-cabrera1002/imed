import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const ESPECIALIDADES = [
  "Medicina General", "Pediatría", "Ginecología", "Cardiología",
  "Dermatología", "Traumatología", "Neurología", "Psiquiatría",
  "Oftalmología", "Odontología", "Nutrición", "Fisioterapia",
  "Urología", "Endocrinología", "Gastroenterología"
];

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [citas, setCitas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"perfil" | "citas">("perfil");

  const [perfil, setPerfil] = useState({
    especialidad: "",
    numero_colegiado: "",
    clinica: "",
    direccion: "",
    telefono: "",
    precio_consulta: "",
    dias_atencion: [] as string[],
    hora_inicio: "08:00",
    hora_fin: "17:00",
    bio: ""
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
    await loadPerfil(user.id);
    await loadCitas(user.id);
    setLoading(false);
  }

  async function loadPerfil(userId: string) {
    const { data } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setPerfil({
        especialidad: data.especialidad || "",
        numero_colegiado: data.numero_colegiado || "",
        clinica: data.clinica || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        precio_consulta: data.precio_consulta?.toString() || "",
        dias_atencion: data.dias_atencion || [],
        hora_inicio: data.hora_inicio || "08:00",
        hora_fin: data.hora_fin || "17:00",
        bio: data.bio || ""
      });
    }
  }

  async function loadCitas(userId: string) {
    const { data } = await supabase
      .from("citas")
      .select(`
        *,
        paciente:profiles!citas_paciente_id_fkey(full_name, phone)
      `)
      .eq("doctor_id", userId)
      .order("fecha", { ascending: true });

    if (data) setCitas(data);
  }

  async function savePerfil() {
    setSaving(true);
    const { error } = await supabase
      .from("doctor_profiles")
      .upsert({
        user_id: user.id,
        especialidad: perfil.especialidad,
        numero_colegiado: perfil.numero_colegiado,
        clinica: perfil.clinica,
        direccion: perfil.direccion,
        telefono: perfil.telefono,
        precio_consulta: perfil.precio_consulta ? parseFloat(perfil.precio_consulta) : null,
        dias_atencion: perfil.dias_atencion,
        hora_inicio: perfil.hora_inicio,
        hora_fin: perfil.hora_fin,
        bio: perfil.bio,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    setSaving(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "¡Perfil guardado!", description: "Tu información ha sido actualizada." });
    }
  }

  async function actualizarEstadoCita(citaId: string, nuevoEstado: string) {
    const { error } = await supabase
      .from("citas")
      .update({ estado: nuevoEstado })
      .eq("id", citaId);

    if (!error) {
      setCitas(citas.map(c => c.id === citaId ? { ...c, estado: nuevoEstado } : c));
      toast({ title: "Cita actualizada" });
    }
  }

  function exportarExcel() {
    const datos = citas.map(c => ({
      "Fecha": c.fecha,
      "Hora": c.hora,
      "Paciente": c.paciente?.full_name || "—",
      "Teléfono": c.paciente?.phone || "—",
      "Motivo": c.motivo || "—",
      "Estado": c.estado || "pendiente"
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Citas");
    XLSX.writeFile(wb, `citas-imed-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function toggleDia(dia: string) {
    setPerfil(prev => ({
      ...prev,
      dias_atencion: prev.dias_atencion.includes(dia)
        ? prev.dias_atencion.filter(d => d !== dia)
        : [...prev.dias_atencion, dia]
    }));
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">iMed Guatemala — Panel Doctor</h1>
          <Button variant="outline" className="text-white border-white hover:bg-teal-700"
            onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "perfil" ? "default" : "outline"}
            onClick={() => setActiveTab("perfil")}
            className={activeTab === "perfil" ? "bg-teal-600" : ""}
          >
            Mi Perfil
          </Button>
          <Button
            variant={activeTab === "citas" ? "default" : "outline"}
            onClick={() => setActiveTab("citas")}
            className={activeTab === "citas" ? "bg-teal-600" : ""}
          >
            Mis Citas ({citas.length})
          </Button>
        </div>

        {activeTab === "perfil" && (
          <Card>
            <CardHeader>
              <CardTitle>Completa tu perfil médico</CardTitle>
              <p className="text-sm text-gray-500">Esta información aparecerá cuando los pacientes te busquen</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Especialidad *</Label>
                  <select
                    className="w-full border rounded-md p-2 mt-1"
                    value={perfil.especialidad}
                    onChange={e => setPerfil({...perfil, especialidad: e.target.value})}
                  >
                    <option value="">Selecciona una especialidad</option>
                    {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Número de Colegiado</Label>
                  <Input value={perfil.numero_colegiado}
                    onChange={e => setPerfil({...perfil, numero_colegiado: e.target.value})}
                    placeholder="Ej: 12345" />
                </div>
                <div>
                  <Label>Clínica / Hospital</Label>
                  <Input value={perfil.clinica}
                    onChange={e => setPerfil({...perfil, clinica: e.target.value})}
                    placeholder="Ej: Clínica San Rafael" />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input value={perfil.direccion}
                    onChange={e => setPerfil({...perfil, direccion: e.target.value})}
                    placeholder="Ej: Zona 10, Guatemala City" />
                </div>
                <div>
                  <Label>Teléfono de contacto</Label>
                  <Input value={perfil.telefono}
                    onChange={e => setPerfil({...perfil, telefono: e.target.value})}
                    placeholder="Ej: +502 5555-5555" />
                </div>
                <div>
                  <Label>Precio consulta (Q)</Label>
                  <Input type="number" value={perfil.precio_consulta}
                    onChange={e => setPerfil({...perfil, precio_consulta: e.target.value})}
                    placeholder="Ej: 350" />
                </div>
                <div>
                  <Label>Hora inicio</Label>
                  <Input type="time" value={perfil.hora_inicio}
                    onChange={e => setPerfil({...perfil, hora_inicio: e.target.value})} />
                </div>
                <div>
                  <Label>Hora fin</Label>
                  <Input type="time" value={perfil.hora_fin}
                    onChange={e => setPerfil({...perfil, hora_fin: e.target.value})} />
                </div>
              </div>

              <div>
                <Label>Días de atención</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DIAS.map(dia => (
                    <button key={dia} onClick={() => toggleDia(dia)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        perfil.dias_atencion.includes(dia)
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-teal-400"
                      }`}>
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Descripción / Bio</Label>
                <Textarea value={perfil.bio}
                  onChange={e => setPerfil({...perfil, bio: e.target.value})}
                  placeholder="Cuéntale a los pacientes sobre tu experiencia y especialización..."
                  rows={4} />
              </div>

              <Button onClick={savePerfil} disabled={saving}
                className="w-full bg-teal-600 hover:bg-teal-700">
                {saving ? "Guardando..." : "Guardar Perfil"}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "citas" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Tus citas agendadas</h2>
              {citas.length > 0 && (
                <Button onClick={exportarExcel} variant="outline" className="border-teal-600 text-teal-600">
                  Exportar a Excel
                </Button>
              )}
            </div>

            {citas.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  No tienes citas agendadas aún.
                </CardContent>
              </Card>
            ) : (
              citas.map(cita => (
                <Card key={cita.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{cita.paciente?.full_name || "Paciente"}</p>
                        <p className="text-sm text-gray-500">{cita.fecha} a las {cita.hora}</p>
                        {cita.motivo && <p className="text-sm text-gray-600 mt-1">Motivo: {cita.motivo}</p>}
                        {cita.paciente?.phone && <p className="text-sm text-gray-500">Tel: {cita.paciente.phone}</p>}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={
                          cita.estado === "confirmada" ? "bg-green-100 text-green-800" :
                          cita.estado === "cancelada" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {cita.estado || "pendiente"}
                        </Badge>
                        {cita.estado !== "confirmada" && (
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs"
                            onClick={() => actualizarEstadoCita(cita.id, "confirmada")}>
                            Confirmar
                          </Button>
                        )}
                        {cita.estado !== "cancelada" && (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 text-xs"
                            onClick={() => actualizarEstadoCita(cita.id, "cancelada")}>
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
        )}
      </div>
    </div>
  );
}
