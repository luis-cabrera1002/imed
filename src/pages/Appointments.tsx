import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar, Clock, Stethoscope, MapPin, CheckCircle,
  ArrowLeft, ChevronLeft, ChevronRight, Video, Building2,
  ExternalLink, Copy
} from "lucide-react";

const HORAS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
const DIAS_SEMANA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function generateMeetLink() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand = (n: number) => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
}

export default function Appointments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const doctorId = searchParams.get("doctor");

  const [user, setUser]             = useState<any>(null);
  const [doctor, setDoctor]         = useState<any>(null);
  const [doctorPerfil, setDoctorPerfil] = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [step, setStep]             = useState(1); // 1=fecha, 2=hora, 3=modalidad, 4=confirmar, 5=exito
  const [fecha, setFecha]           = useState("");
  const [hora, setHora]             = useState("");
  const [motivo, setMotivo]         = useState("");
  const [modalidad, setModalidad]   = useState<"presencial" | "videollamada">("presencial");
  const [meetLink, setMeetLink]     = useState("");
  const [mesActual, setMesActual]   = useState(new Date());
  const [citaId, setCitaId]         = useState<string>("");

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);
    if (!doctorId) { navigate("/doctores"); return; }
    await loadDoctor(doctorId);
    setLoading(false);
  }

  async function loadDoctor(id: string) {
    const { data: perfil } = await supabase.from("doctor_profiles").select("*").eq("user_id", id).single();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", id).single();
    setDoctorPerfil(perfil);
    setDoctor(profile);
  }

  async function confirmarCita() {
    if (!user || !fecha || !hora) return;
    setSaving(true);

    const link = modalidad === "videollamada" ? generateMeetLink() : null;
    if (link) setMeetLink(link);

    const { data, error } = await supabase.from("citas").insert({
      paciente_id: user.id,
      doctor_id: doctorId,
      fecha,
      hora,
      motivo: motivo || "Consulta general",
      estado: "pendiente",
      modalidad,
      meet_link: link,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: "No se pudo agendar la cita.", variant: "destructive" });
    } else {
      if (data?.id) setCitaId(data.id);
      setStep(5);

      // Enviar email con datos ya cargados
      try {
        const fechaFmt = fecha ? new Date(fecha + "T12:00:00").toLocaleDateString("es-GT", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        }) : "";

        // Obtener email del paciente desde auth
        const { data: { user: authUser } } = await supabase.auth.getUser();

        await supabase.functions.invoke("enviar-email-cita", {
          body: {
            doctor_email: user.email, // fallback
            doctor_name: doctor?.full_name || doctorPerfil?.full_name || "Doctor",
            paciente_email: authUser?.email || user.email,
            paciente_name: authUser?.user_metadata?.full_name || "Paciente",
            fecha: fechaFmt,
            hora,
            motivo: motivo || "Consulta general",
          }
        });
      } catch (emailErr) {
        console.error("Error enviando email:", emailErr);
      }
    }
    setSaving(false);
  }

  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const primerDia   = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDia   = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
  const diasEnMes   = ultimoDia.getDate();
  const inicioSemana = primerDia.getDay();

  const diasCalendario: (number | null)[] = [];
  for (let i = 0; i < inicioSemana; i++) diasCalendario.push(null);
  for (let i = 1; i <= diasEnMes; i++) diasCalendario.push(i);

  const seleccionarDia = (dia: number) => {
    const d = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
    if (d < hoy) return;
    const iso = `${mesActual.getFullYear()}-${String(mesActual.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
    setFecha(iso);
    setStep(2);
  };

  const fmtFecha = (f: string) => {
    if (!f) return "";
    return new Date(f + "T12:00:00").toLocaleDateString("es-GT", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="font-bold text-gray-900">Agendar Cita</h1>
            <p className="text-xs text-gray-500">
              {step===1 ? "Selecciona una fecha" :
               step===2 ? "Selecciona la hora" :
               step===3 ? "¿Presencial o videollamada?" :
               step===4 ? "Confirma tu cita" : "¡Listo!"}
            </p>
          </div>
        </div>
        {/* Progress */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="flex gap-1">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-teal-500" : "bg-gray-200"}`}/>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Info del doctor */}
        {doctorPerfil && doctor && step < 5 && (
          <Card className="border-0 shadow-sm mb-5 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-7 h-7 text-teal-600"/>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{doctor.full_name}</p>
                <p className="text-teal-600 text-sm font-medium">{doctorPerfil.especialidad}</p>
                {doctorPerfil.clinica && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3"/>{doctorPerfil.clinica}
                  </p>
                )}
              </div>
              {doctorPerfil.precio_consulta && (
                <div className="text-right">
                  <p className="font-bold text-gray-900">Q{doctorPerfil.precio_consulta}</p>
                  <p className="text-xs text-gray-400">consulta</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── PASO 1: Calendario ── */}
        {step === 1 && (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth()-1, 1))}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500"/>
                </button>
                <h3 className="font-bold text-gray-900">{MESES[mesActual.getMonth()]} {mesActual.getFullYear()}</h3>
                <button
                  onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth()+1, 1))}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500"/>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map(d => (
                  <p key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasCalendario.map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`}/>;
                  const d = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
                  const isPasado = d < hoy;
                  const iso = `${mesActual.getFullYear()}-${String(mesActual.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
                  const isSelected = fecha === iso;
                  const isHoy = d.toDateString() === hoy.toDateString();
                  return (
                    <button key={dia} onClick={() => seleccionarDia(dia)} disabled={isPasado}
                      className={`aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center
                        ${isSelected ? "bg-teal-600 text-white shadow-md" :
                          isHoy ? "bg-teal-50 text-teal-700 border-2 border-teal-300" :
                          isPasado ? "text-gray-300 cursor-not-allowed" :
                          "hover:bg-teal-50 text-gray-700 hover:text-teal-700"}`}>
                      {dia}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PASO 2: Horarios ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-teal-50 rounded-2xl px-4 py-3 flex items-center gap-2 border border-teal-100">
              <Calendar className="w-4 h-4 text-teal-600"/>
              <p className="text-sm font-semibold text-teal-800">{fmtFecha(fecha)}</p>
            </div>
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600"/>Horarios disponibles
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {HORAS.map(h => (
                    <button key={h}
                      onClick={() => { setHora(h); setStep(3); }}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                        ${hora===h ? "border-teal-500 bg-teal-50 text-teal-700" :
                          "border-gray-100 hover:border-teal-300 hover:bg-teal-50 text-gray-700"}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── PASO 3: Modalidad ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-teal-100 flex-1">
                <Calendar className="w-4 h-4 text-teal-600"/>
                <span className="text-xs font-semibold text-teal-800">{fmtFecha(fecha)}</span>
              </div>
              <div className="bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-teal-100">
                <Clock className="w-4 h-4 text-teal-600"/>
                <span className="text-xs font-semibold text-teal-800">{hora}</span>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-lg">¿Cómo querés tu cita?</h3>

            {/* Presencial */}
            <button
              onClick={() => setModalidad("presencial")}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                modalidad === "presencial"
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 bg-white hover:border-teal-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  modalidad === "presencial" ? "bg-teal-500" : "bg-gray-100"
                }`}>
                  <Building2 className={`w-6 h-6 ${modalidad === "presencial" ? "text-white" : "text-gray-400"}`}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">Presencial</p>
                    {modalidad === "presencial" && (
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white"/>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Visita al doctor en su clínica</p>
                  {doctorPerfil?.clinica && (
                    <p className="text-xs text-teal-600 font-medium mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3"/>{doctorPerfil.clinica}
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* Videollamada */}
            <button
              onClick={() => setModalidad("videollamada")}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                modalidad === "videollamada"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  modalidad === "videollamada" ? "bg-blue-500" : "bg-gray-100"
                }`}>
                  <Video className={`w-6 h-6 ${modalidad === "videollamada" ? "text-white" : "text-gray-400"}`}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">Videollamada</p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Google Meet
                      </span>
                    </div>
                    {modalidad === "videollamada" && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white"/>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Consulta desde donde estés</p>
                  <p className="text-xs text-gray-400 mt-1">Se genera un link de Google Meet automáticamente</p>
                </div>
              </div>
            </button>

            <Button
              onClick={() => setStep(4)}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* ── PASO 4: Confirmar ── */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-gray-900 mb-2">Resumen de tu cita</h3>

                <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0"/>
                  <div>
                    <p className="text-xs text-teal-600 font-medium">Fecha</p>
                    <p className="font-semibold text-gray-900 text-sm">{fmtFecha(fecha)}</p>
                  </div>
                </div>

                <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600 flex-shrink-0"/>
                  <div>
                    <p className="text-xs text-teal-600 font-medium">Hora</p>
                    <p className="font-semibold text-gray-900 text-sm">{hora}</p>
                  </div>
                </div>

                {/* Modalidad */}
                <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
                  modalidad === "videollamada" ? "bg-blue-50" : "bg-teal-50"
                }`}>
                  {modalidad === "videollamada"
                    ? <Video className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                    : <Building2 className="w-5 h-5 text-teal-600 flex-shrink-0"/>
                  }
                  <div>
                    <p className={`text-xs font-medium ${modalidad === "videollamada" ? "text-blue-600" : "text-teal-600"}`}>
                      Modalidad
                    </p>
                    <p className="font-semibold text-gray-900 text-sm capitalize">{modalidad}</p>
                    {modalidad === "videollamada" && (
                      <p className="text-xs text-blue-500 mt-0.5">Se generará tu link de Google Meet al confirmar</p>
                    )}
                  </div>
                </div>

                {modalidad === "presencial" && doctorPerfil?.clinica && (
                  <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0"/>
                    <div>
                      <p className="text-xs text-teal-600 font-medium">Lugar</p>
                      <p className="font-semibold text-gray-900 text-sm">{doctorPerfil.clinica}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Motivo de la consulta (opcional)
                </label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Describe brevemente el motivo de tu visita..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none text-gray-700"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Button
              onClick={confirmarCita}
              disabled={saving}
              className="w-full h-13 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-base py-4"
            >
              {saving ? "Agendando..." : "Confirmar Cita"}
            </Button>
          </div>
        )}

        {/* ── PASO 5: Éxito ── */}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12 text-green-500"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cita agendada!</h2>
            <p className="text-gray-500 mb-1">{fmtFecha(fecha)} a las {hora}</p>
            {doctor && <p className="text-teal-600 font-semibold mb-1">con {doctor.full_name}</p>}
            <p className="text-sm text-gray-400 mb-6 capitalize">{modalidad}</p>

            {/* Link de Google Meet */}
            {modalidad === "videollamada" && meetLink && (
              <Card className="border-0 shadow-md rounded-2xl mb-6 overflow-hidden">
                <div className="bg-blue-600 px-5 py-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-white"/>
                  <p className="font-bold text-white">Tu link de Google Meet</p>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500 mb-3">Compartí este link con tu doctor antes de la cita</p>
                  <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between gap-2 mb-4">
                    <p className="text-blue-700 font-medium text-sm truncate">{meetLink}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meetLink);
                        toast({ title: "¡Copiado!", description: "Link copiado al portapapeles" });
                      }}
                      className="flex-shrink-0 p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-blue-600"/>
                    </button>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
                    onClick={() => window.open(meetLink, "_blank")}
                  >
                    <Video className="w-4 h-4"/>
                    Unirse a Google Meet
                    <ExternalLink className="w-3.5 h-3.5"/>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/mis-citas")}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-3"
              >
                Ver mis citas
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full border-gray-200 text-gray-600 rounded-xl py-3"
              >
                Ir al inicio
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
