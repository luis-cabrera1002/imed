import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ESPECIALIDADES = [
  "Todas", "Medicina General", "Pediatría", "Ginecología", "Cardiología",
  "Dermatología", "Traumatología", "Neurología", "Psiquiatría",
  "Oftalmología", "Odontología", "Nutrición", "Fisioterapia"
];

export default function Doctors() {
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas");

  useEffect(() => {
    loadDoctores();
  }, []);

  async function loadDoctores() {
    const { data } = await supabase
      .from("doctor_profiles")
      .select(`
        *,
        profile:profiles!doctor_profiles_user_id_fkey(full_name, phone)
      `);

    if (data) setDoctores(data);
    setLoading(false);
  }

  const doctoresFiltrados = doctores.filter(d => {
    const nombre = d.profile?.full_name?.toLowerCase() || "";
    const espec = d.especialidad?.toLowerCase() || "";
    const clinica = d.clinica?.toLowerCase() || "";
    const busq = busqueda.toLowerCase();

    const coincideBusqueda = !busqueda ||
      nombre.includes(busq) ||
      espec.includes(busq) ||
      clinica.includes(busq);

    const coincideEspecialidad = especialidad === "Todas" ||
      d.especialidad === especialidad;

    return coincideBusqueda && coincideEspecialidad;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando doctores...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Buscar Doctor</h1>
          <Button variant="outline" className="text-white border-white"
            onClick={() => navigate("/")}>
            Inicio
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nombre, especialidad o clínica..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ESPECIALIDADES.map(e => (
            <button key={e} onClick={() => setEspecialidad(e)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                especialidad === e
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-teal-400"
              }`}>
              {e}
            </button>
          ))}
        </div>

        {doctoresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-400">
              No se encontraron doctores con esos filtros.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctoresFiltrados.map(doctor => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {doctor.profile?.full_name || "Doctor"}
                      </h3>
                      <Badge className="bg-teal-100 text-teal-800 mt-1">
                        {doctor.especialidad || "Especialidad no especificada"}
                      </Badge>
                      {doctor.clinica && (
                        <p className="text-sm text-gray-500 mt-2">{doctor.clinica}</p>
                      )}
                      {doctor.direccion && (
                        <p className="text-sm text-gray-400">{doctor.direccion}</p>
                      )}
                      {doctor.precio_consulta && (
                        <p className="text-sm font-medium text-teal-600 mt-1">
                          Q{doctor.precio_consulta} por consulta
                        </p>
                      )}
                      {doctor.dias_atencion?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {doctor.dias_atencion.slice(0,3).join(", ")}
                          {doctor.dias_atencion.length > 3 ? "..." : ""}
                          {" · "}{doctor.hora_inicio} - {doctor.hora_fin}
                        </p>
                      )}
                      {doctor.bio && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doctor.bio}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-teal-600 hover:bg-teal-700"
                    onClick={() => navigate(`/appointments?doctor=${doctor.user_id}`)}>
                    Agendar Cita
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
