import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function crearIconoDoctor() {
  return L.divIcon({
    html: `<div style="
      background: #1e3a5f;
      width: 42px; height: 42px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="transform: rotate(45deg); color: white; font-size: 18px;">🩺</div>
    </div>`,
    className: "custom-marker",
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -44],
  });
}

function crearIconoPaciente() {
  return L.divIcon({
    html: `<div style="
      background: #2563eb;
      width: 20px; height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.4);
    "></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function DoctorMap() {
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<any[]>([]);
  const [ubicacion, setUbicacion] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [especialidad, setEspecialidad] = useState("Todas");
  const [radio, setRadio] = useState(5);
  const centro: [number, number] = ubicacion ? [ubicacion.lat, ubicacion.lng] : [14.6349, -90.5069];

  const ESPECIALIDADES = [
    "Todas", "Medicina General", "Pediatría", "Ginecología", "Cardiología",
    "Dermatología", "Traumatología", "Neurología", "Psiquiatría",
    "Oftalmología", "Odontología", "Nutrición", "Fisioterapia"
  ];

  useEffect(() => {
    loadDoctores();
    detectarUbicacion();
  }, []);

  async function detectarUbicacion() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  async function loadDoctores() {
    const { data: dpData } = await supabase.from("doctor_profiles").select("*").not("latitud", "is", null);
    const { data: bamData } = await supabase.from("bam_doctors").select("*").not("latitud", "is", null).limit(656);

    const userIds = (dpData || []).map(d => d.user_id);
    const { data: profileData } = userIds.length > 0
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
      : { data: [] };
    const { data: opinionesData } = await supabase.from("opiniones").select("doctor_id, rating");

    const registrados = (dpData || []).map(d => {
      const ops = opinionesData?.filter(o => o.doctor_id === d.user_id) || [];
      const avgRating = ops.length > 0 ? ops.reduce((s, o) => s + o.rating, 0) / ops.length : 0;
      return {
        ...d,
        nombre: profileData?.find(p => p.user_id === d.user_id)?.full_name || "Doctor",
        rating: avgRating,
        total_opiniones: ops.length,
        tipo: "registrado"
      };
    });

    const bam = (bamData || []).map(d => ({
      ...d,
      latitud: d.latitud,
      longitud: d.longitud,
      nombre: d.nombre,
      especialidad: d.especialidad,
      direccion: d.direccion,
      telefono: d.telefono,
      rating: 0,
      total_opiniones: 0,
      tipo: "bam"
    }));

    setDoctores([...registrados, ...bam]);
    setLoading(false);
  }

  const doctoresFiltrados = doctores
    .map(d => ({
      ...d,
      distancia: ubicacion ? calcularDistancia(ubicacion.lat, ubicacion.lng, d.latitud, d.longitud) : null
    }))
    .filter(d => {
      const coincideEspec = especialidad === "Todas" || d.especialidad === especialidad;
      const coincideRadio = !d.distancia || d.distancia <= radio;
      return coincideEspec && coincideRadio;
    });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Mapa de Doctores</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/doctores")}
              className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
              Ver Lista
            </button>
            <button onClick={() => navigate("/")}
              className="bg-blue-950 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition">
              Inicio
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b p-3">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-700"
            value={especialidad}
            onChange={e => setEspecialidad(e.target.value)}>
            {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          {ubicacion && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Radio:</span>
              <input type="range" min="1" max="20" value={radio}
                onChange={e => setRadio(Number(e.target.value))}
                className="w-24 accent-blue-900" />
              <span className="text-sm font-semibold text-blue-900">{radio} km</span>
            </div>
          )}

          <span className="text-sm text-gray-500 ml-auto">
            {doctoresFiltrados.length} doctor{doctoresFiltrados.length !== 1 ? "es" : ""} en el mapa
          </span>
        </div>
      </div>

      {/* Mapa */}
      <div className="max-w-6xl mx-auto p-4">
        <div style={{ height: "calc(100vh - 200px)", minHeight: "500px" }} className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <MapContainer
            center={centro}
            zoom={ubicacion ? 13 : 12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marcador del paciente */}
            {ubicacion && (
              <>
                <Marker position={[ubicacion.lat, ubicacion.lng]} icon={crearIconoPaciente()}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-blue-900">📍 Tu ubicación</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[ubicacion.lat, ubicacion.lng]}
                  radius={radio * 1000}
                  pathOptions={{ color: "#1e3a5f", fillColor: "#1e3a5f", fillOpacity: 0.05, weight: 1 }}
                />
              </>
            )}

            {/* Marcadores de doctores */}
            {doctoresFiltrados.map(doctor => (
              <Marker
                key={doctor.id}
                position={[doctor.latitud, doctor.longitud]}
                icon={crearIconoDoctor()}>
                <Popup maxWidth={280}>
                  <div className="p-2 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-900">
                        {doctor.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{doctor.nombre}</p>
                        <span className="text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">{doctor.especialidad}</span>
                      </div>
                    </div>
                    {doctor.clinica && <p className="text-xs text-gray-500 mb-1">🏥 {doctor.clinica}</p>}
                    {doctor.precio_consulta && <p className="text-xs text-blue-900 font-semibold mb-1">Q{doctor.precio_consulta} consulta</p>}
                    {doctor.distancia && (
                      <p className="text-xs text-blue-600 font-medium mb-2">
                        📍 {doctor.distancia < 1 ? `${Math.round(doctor.distancia * 1000)}m` : `${doctor.distancia.toFixed(1)}km`} de distancia
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/citas?doctor=${doctor.user_id}`)}
                        className="flex-1 bg-blue-900 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-950 transition">
                        Agendar Cita
                      </button>
                      <button
                        onClick={() => navigate(`/doctores/${doctor.user_id}`)}
                        className="flex-1 border border-gray-300 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:border-blue-700 transition">
                        Ver Perfil
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {doctoresFiltrados.length === 0 && (
          <div className="mt-4 bg-white rounded-xl p-6 text-center border border-gray-200">
            <p className="text-gray-500">No hay doctores en el área seleccionada.</p>
            <button onClick={() => setRadio(20)}
              className="mt-2 text-blue-900 font-semibold text-sm hover:underline">
              Ampliar búsqueda a 20km
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
