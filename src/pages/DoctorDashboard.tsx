import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [ubicacionStatus, setUbicacionStatus] = useState<string>("");

  const [perfil, setPerfil] = useState({
    especialidad: "", numero_colegiado: "", clinica: "", direccion: "",
    telefono: "", precio_consulta: "", dias_atencion: [] as string[],
    hora_inicio: "08:00", hora_fin: "17:00", bio: "",
    latitud: null as number | null, longitud: null as number | null,
    direccion_completa: ""
  });

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);
    await loadPerfil(user.id);
    await loadCitas(user.id);
    setLoading(false);
  }

  async function loadPerfil(userId: string) {
    const { data } = await supabase.from("doctor_profiles").select("*").eq("user_id", userId).single();
    if (data) {
      setPerfil({
        especialidad: data.especialidad || "", numero_colegiado: data.numero_colegiado || "",
        clinica: data.clinica || "", direccion: data.direccion || "",
        telefono: data.telefono || "", precio_consulta: data.precio_consulta?.toString() || "",
        dias_atencion: data.dias_atencion || [], hora_inicio: data.hora_inicio || "08:00",
        hora_fin: data.hora_fin || "17:00", bio: data.bio || "",
        latitud: data.latitud || null, longitud: data.longitud || null,
        direccion_completa: data.direccion_completa || ""
      });
      if (data.latitud && data.longitud) setUbicacionStatus("✅ Ubicación guardada correctamente");
    }
  }

  async function loadCitas(userId: string) {
    const { data: citasData } = await supabase.from("citas").select("*").eq("doctor_id", userId).order("fecha", { ascending: true });
    if (!citasData || citasData.length === 0) return;
    const pacienteIds = [...new Set(citasData.map(c => c.paciente_id))];
    const { data: perfiles } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", pacienteIds);
    setCitas(citasData.map(cita => ({
      ...cita,
      paciente_nombre: perfiles?.find(p => p.user_id === cita.paciente_id)?.full_name || "Paciente",
      paciente_telefono: perfiles?.find(p => p.user_id === cita.paciente_id)?.phone || ""
    })));
  }

  async function detectarUbicacion() {
    if (!navigator.geolocation) {
      toast({ title: "Tu navegador no soporta geolocalización", variant: "destructive" });
      return;
    }
    setUbicacionStatus("⏳ Detectando ubicación...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const dir = data.display_name || `${lat}, ${lng}`;
          setPerfil(prev => ({ ...prev, latitud: lat, longitud: lng, direccion_completa: dir }));
          setUbicacionStatus("✅ Ubicación detectada: " + dir.substring(0, 60) + "...");
          toast({ title: "Ubicación detectada correctamente" });
        } catch {
          setPerfil(prev => ({ ...prev, latitud: lat, longitud: lng }));
          setUbicacionStatus("✅ Ubicación detectada");
        }
      },
      () => {
        setUbicacionStatus("❌ No se pudo obtener la ubicación. Permite el acceso en tu navegador.");
        toast({ title: "Permiso de ubicación denegado", variant: "destructive" });
      }
    );
  }

  async function savePerfil() {
    if (!perfil.especialidad) {
      toast({ title: "Selecciona una especialidad", variant: "destructive" }); return;
    }
    if (!perfil.latitud || !perfil.longitud) {
      toast({ title: "Falta tu ubicación", description: "Haz clic en 'Detectar mi ubicación' antes de guardar.", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("doctor_profiles").upsert({
      user_id: user.id, especialidad: perfil.especialidad, numero_colegiado: perfil.numero_colegiado,
      clinica: perfil.clinica, direccion: perfil.direccion, telefono: perfil.telefono,
      precio_consulta: perfil.precio_consulta ? parseFloat(perfil.precio_consulta) : null,
      dias_atencion: perfil.dias_atencion, hora_inicio: perfil.hora_inicio, hora_fin: perfil.hora_fin,
      bio: perfil.bio, latitud: perfil.latitud, longitud: perfil.longitud,
      direccion_completa: perfil.direccion_completa, updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    else toast({ title: "¡Perfil guardado!", description: "Tu información ha sido actualizada." });
  }

  async function actualizarEstadoCita(citaId: string, nuevoEstado: string) {
    const { error } = await supabase.from("citas").update({ estado: nuevoEstado }).eq("id", citaId);
    if (!error) {
      setCitas(citas.map(c => c.id === citaId ? { ...c, estado: nuevoEstado } : c));
      toast({ title: "Cita actualizada" });
    }
  }

  function exportarExcel() {
    const datos = citas.map(c => ({
      "Fecha": c.fecha, "Hora": c.hora, "Paciente": c.paciente_nombre,
      "Teléfono": c.paciente_telefono || "—", "Motivo": c.motivo || "—", "Estado": c.estado || "pendiente"
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
      {/* Header */}
      <div className="bg-blue-900 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Panel Doctor — iMed Guatemala</h1>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
            className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("perfil")}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === "perfil" ? "bg-blue-900 text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"}`}>
            Mi Perfil
          </button>
          <button onClick={() => setActiveTab("citas")}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === "citas" ? "bg-blue-900 text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"}`}>
            Mis Citas ({citas.length})
          </button>
        </div>

        {activeTab === "perfil" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Completa tu perfil médico</CardTitle>
              <p className="text-sm text-gray-500">Esta información aparecerá cuando los pacientes te busquen</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Especialidad *</Label>
                  <select className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:outline-none focus:border-blue-700"
                    value={perfil.especialidad}
                    onChange={e => setPerfil({...perfil, especialidad: e.target.value})}>
                    <option value="">Selecciona una especialidad</option>
                    {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Número de Colegiado</Label>
                  <Input value={perfil.numero_colegiado} onChange={e => setPerfil({...perfil, numero_colegiado: e.target.value})} placeholder="Ej: 12345" />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Clínica / Hospital</Label>
                  <Input value={perfil.clinica} onChange={e => setPerfil({...perfil, clinica: e.target.value})} placeholder="Ej: Clínica San Rafael" />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Dirección</Label>
                  <Input value={perfil.direccion} onChange={e => setPerfil({...perfil, direccion: e.target.value})} placeholder="Ej: Zona 10, Guatemala City" />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Teléfono de contacto</Label>
                  <Input value={perfil.telefono} onChange={e => setPerfil({...perfil, telefono: e.target.value})} placeholder="Ej: +502 5555-5555" />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Precio consulta (Q)</Label>
                  <Input type="number" value={perfil.precio_consulta} onChange={e => setPerfil({...perfil, precio_consulta: e.target.value})} placeholder="Ej: 350" />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Hora inicio</Label>
                  <Input type="time" value={perfil.hora_inicio} onChange={e => setPerfil({...perfil, hora_inicio: e.target.value})} />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Hora fin</Label>
                  <Input type="time" value={perfil.hora_fin} onChange={e => setPerfil({...perfil, hora_fin: e.target.value})} />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Días de atención</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DIAS.map(dia => (
                    <button key={dia} onClick={() => toggleDia(dia)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        perfil.dias_atencion.includes(dia)
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}>
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Descripción / Bio</Label>
                <Textarea value={perfil.bio} onChange={e => setPerfil({...perfil, bio: e.target.value})}
                  placeholder="Cuéntale a los pacientes sobre tu experiencia y especialización..." rows={4} />
              </div>

              {/* Sección ubicación */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-900 font-semibold text-sm mb-1">📍 Ubicación de tu clínica</p>
                <p className="text-blue-900 text-sm mb-3">
                  Necesaria para que los pacientes te encuentren cerca de ellos.
                </p>
                <button onClick={detectarUbicacion}
                  className="bg-blue-900 text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-blue-950 transition">
                  Detectar mi ubicación
                </button>
                {ubicacionStatus && (
                  <p className="text-sm mt-3 text-blue-900 font-medium">{ubicacionStatus}</p>
                )}
              </div>

              <button onClick={savePerfil} disabled={saving}
                className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-950 transition disabled:opacity-50 text-base">
                {saving ? "Guardando..." : "Guardar Perfil"}
              </button>
            </CardContent>
          </Card>
        )}

        {activeTab === "citas" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Tus citas agendadas</h2>
              {citas.length > 0 && (
                <button onClick={exportarExcel}
                  className="border border-blue-900 text-blue-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                  Exportar a Excel
                </button>
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
                        <p className="font-semibold text-gray-800">{cita.paciente_nombre}</p>
                        <p className="text-sm text-gray-500">{cita.fecha} a las {cita.hora}</p>
                        {cita.motivo && <p className="text-sm text-gray-600 mt-1">Motivo: {cita.motivo}</p>}
                        {cita.paciente_telefono && <p className="text-sm text-gray-500">Tel: {cita.paciente_telefono}</p>}
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
                          <button onClick={() => actualizarEstadoCita(cita.id, "confirmada")}
                            className="bg-blue-900 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-950 transition">
                            Confirmar
                          </button>
                        )}
                        {cita.estado !== "cancelada" && (
                          <button onClick={() => actualizarEstadoCita(cita.id, "cancelada")}
                            className="border border-red-300 text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-red-50 transition">
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
        )}
      </div>
    </div>
  );
}
