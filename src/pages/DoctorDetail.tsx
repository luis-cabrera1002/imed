import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

function Estrellas({ rating, total, size = "sm" }: { rating: number, total: number, size?: string }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${size === "lg" ? "w-6 h-6" : "w-4 h-4"} ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      {total > 0 && <span className="text-sm text-gray-500 ml-1">({total})</span>}
    </div>
  );
}

function EstrellasSelector({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i}
          className={`w-8 h-8 cursor-pointer transition-colors ${i <= (hover || value) ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor" viewBox="0 0 20 20"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [opiniones, setOpiniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [miOpinion, setMiOpinion] = useState({ rating: 0, comentario: "" });
  const [enviandoOpinion, setEnviandoOpinion] = useState(false);
  const [yaOpino, setYaOpino] = useState(false);

  useEffect(() => {
    loadTodo();
  }, [id]);

  async function loadTodo() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data: dp } = await supabase.from("doctor_profiles").select("*").eq("user_id", id).single();
    if (!dp) { setLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", id).single();

    const { data: ops } = await supabase.from("opiniones").select("*").eq("doctor_id", id).order("created_at", { ascending: false });

    const pacienteIds = ops?.map(o => o.paciente_id) || [];
    let pacientesMap: any = {};
    if (pacienteIds.length > 0) {
      const { data: pacientePerfiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", pacienteIds);
      pacientesMap = Object.fromEntries(pacientePerfiles?.map(p => [p.user_id, p.full_name]) || []);
    }

    const opinionesConNombre = ops?.map(o => ({ ...o, paciente_nombre: pacientesMap[o.paciente_id] || "Paciente" })) || [];
    const avgRating = opinionesConNombre.length > 0 ? opinionesConNombre.reduce((s, o) => s + o.rating, 0) / opinionesConNombre.length : 0;

    setDoctor({ ...dp, nombre: profile?.full_name || "Doctor", rating: avgRating, total_opiniones: opinionesConNombre.length });
    setOpiniones(opinionesConNombre);

    if (user) {
      const yaExiste = opinionesConNombre.some(o => o.paciente_id === user.id);
      setYaOpino(yaExiste);
    }

    setLoading(false);
  }

  async function enviarOpinion() {
    if (!user) { navigate("/auth"); return; }
    if (miOpinion.rating === 0) return;
    setEnviandoOpinion(true);
    const { error } = await supabase.from("opiniones").insert({
      doctor_id: id,
      paciente_id: user.id,
      rating: miOpinion.rating,
      comentario: miOpinion.comentario
    });
    if (!error) {
      setYaOpino(true);
      await loadTodo();
    }
    setEnviandoOpinion(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Médico no encontrado</h2>
        <p className="mt-2 text-gray-500">El médico que estás buscando no existe o ha sido eliminado.</p>
        <button onClick={() => navigate("/doctores")}
          className="mt-4 bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-950 transition">
          Volver a médicos
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-900 flex-shrink-0">
              {doctor.nombre.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{doctor.nombre}</h1>
              <p className="text-blue-900 font-medium mt-1">{doctor.especialidad}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Estrellas rating={doctor.rating} total={doctor.total_opiniones} />
                {doctor.numero_colegiado && (
                  <span className="text-sm text-gray-500">Colegiado: {doctor.numero_colegiado}</span>
                )}
              </div>
              {doctor.precio_consulta && (
                <p className="text-blue-900 font-semibold mt-2">Q{doctor.precio_consulta} por consulta</p>
              )}
            </div>
            <button onClick={() => navigate(`/citas?doctor=${id}`)}
              className="bg-blue-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-950 transition flex items-center gap-2">
              📅 Agendar Cita
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="informacion">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="informacion">Información</TabsTrigger>
                <TabsTrigger value="opiniones">Opiniones ({doctor.total_opiniones})</TabsTrigger>
              </TabsList>

              <TabsContent value="informacion">
                <div className="space-y-6">
                  {doctor.bio && (
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Sobre el doctor</h3>
                        <p className="text-gray-600 text-sm">{doctor.bio}</p>
                      </CardContent>
                    </Card>
                  )}
                  {doctor.clinica && (
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Clínica donde atiende</h3>
                        <div className="border rounded-lg p-3">
                          <p className="font-medium text-gray-800">🏥 {doctor.clinica}</p>
                          {doctor.direccion && <p className="text-sm text-gray-500 mt-1">📍 {doctor.direccion}</p>}
                          {doctor.hora_inicio && <p className="text-sm text-gray-500 mt-1">🕐 {doctor.hora_inicio} - {doctor.hora_fin}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {doctor.dias_atencion?.length > 0 && (
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Días de atención</h3>
                        <div className="flex flex-wrap gap-2">
                          {doctor.dias_atencion.map((dia: string) => (
                            <span key={dia} className="bg-blue-50 text-blue-900 text-sm px-3 py-1 rounded-full border border-blue-200">
                              {dia}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {doctor.telefono && (
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Contacto</h3>
                        <p className="text-gray-600">📞 {doctor.telefono}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="opiniones">
                <div className="space-y-4">
                  {/* Resumen de rating */}
                  {doctor.total_opiniones > 0 && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-bold text-gray-900">{doctor.rating.toFixed(1)}</span>
                          <div>
                            <Estrellas rating={doctor.rating} total={doctor.total_opiniones} size="lg" />
                            <p className="text-sm text-gray-500 mt-1">Basado en {doctor.total_opiniones} opiniones</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Formulario nueva opinión */}
                  {user && !yaOpino && (
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Deja tu opinión</h3>
                        <EstrellasSelector value={miOpinion.rating} onChange={v => setMiOpinion(prev => ({ ...prev, rating: v }))} />
                        <textarea
                          className="w-full border border-gray-300 rounded-lg p-3 mt-3 text-sm focus:outline-none focus:border-blue-700"
                          rows={3}
                          placeholder="Cuéntanos tu experiencia con este doctor..."
                          value={miOpinion.comentario}
                          onChange={e => setMiOpinion(prev => ({ ...prev, comentario: e.target.value }))}
                        />
                        <button onClick={enviarOpinion} disabled={enviandoOpinion || miOpinion.rating === 0}
                          className="mt-2 bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-950 transition disabled:opacity-50">
                          {enviandoOpinion ? "Enviando..." : "Publicar opinión"}
                        </button>
                      </CardContent>
                    </Card>
                  )}

                  {!user && (
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-gray-500 text-sm mb-3">Inicia sesión para dejar una opinión</p>
                        <button onClick={() => navigate("/auth")}
                          className="bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-950 transition">
                          Iniciar sesión
                        </button>
                      </CardContent>
                    </Card>
                  )}

                  {yaOpino && (
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-blue-900 font-medium">✅ Ya enviaste tu opinión sobre este doctor</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lista de opiniones */}
                  {opiniones.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-400">
                        Aún no hay opiniones para este doctor. ¡Sé el primero!
                      </CardContent>
                    </Card>
                  ) : (
                    opiniones.map(op => (
                      <Card key={op.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-900">
                                {op.paciente_nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{op.paciente_nombre}</p>
                                <Estrellas rating={op.rating} total={0} />
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(op.created_at).toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          {op.comentario && (
                            <p className="text-gray-600 text-sm mt-3">{op.comentario}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Especialidad</h3>
                <div className="flex items-center gap-2">
                  <span>🩺</span>
                  <span className="bg-blue-50 text-blue-900 text-sm font-semibold px-3 py-1 rounded-full">
                    {doctor.especialidad}
                  </span>
                </div>
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 text-sm mb-2">Para pedir cita</h4>
                  <p className="text-xs text-gray-500 mb-3">Agenda tu consulta con {doctor.nombre.split(" ")[0]}</p>
                  {doctor.clinica && (
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg p-2 bg-white mb-2">
                      <span className="text-sm font-medium text-gray-700">{doctor.clinica}</span>
                      <button onClick={() => navigate(`/citas?doctor=${id}`)}
                        className="bg-blue-900 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-blue-950 transition">
                        Agendar
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {doctor.precio_consulta && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Precio consulta</h3>
                  <p className="text-2xl font-bold text-blue-900">Q{doctor.precio_consulta}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
