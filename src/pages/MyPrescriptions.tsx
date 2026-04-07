import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Pill, CheckCircle2, AlertCircle, Send, X, MapPin, Clock, User, ChevronDown, ChevronUp, QrCode } from "lucide-react";

const FARMACIAS = [
  { nombre: "Farmacia del Ahorro Zona 10", direccion: "Av. La Reforma 15-20, Zona 10", telefono: "2331-4500", horario: "24 horas", rating: 4.5 },
  { nombre: "Farmacia San Pablo Miraflores", direccion: "21 Calle 0-34, Zona 11 Miraflores", telefono: "2440-8900", horario: "Lun-Sáb: 7:00-21:00", rating: 4.4 },
  { nombre: "Farmacia Galeno Zona 1", direccion: "6a Avenida 0-60, Zona 1", telefono: "2232-0000", horario: "24 horas", rating: 4.2 },
  { nombre: "Farmacia Batres Zona 9", direccion: "Blvd. Los Próceres 20-09, Zona 9", telefono: "2360-1000", horario: "Lun-Dom: 8:00-22:00", rating: 4.3 },
];

export default function MyPrescriptions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("recetas");
  const [recetas, setRecetas] = useState([]);
  const [recetasDigitales, setRecetasDigitales] = useState([]);
  const [prereqs, setPrereqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [sendModal, setSendModal] = useState(null);
  const [selectedFarmacia, setSelectedFarmacia] = useState(null);
  const [notasFarmacia, setNotasFarmacia] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);
    await Promise.all([loadRecetas(user.id), loadPrereqs(user.id), loadRecetasDigitales(user.id)]);
    setLoading(false);
  }

  async function loadRecetas(uid) {
    const { data } = await supabase.from("recetas").select("*").eq("paciente_id", uid).order("created_at", { ascending: false });
    if (!data || data.length === 0) { setRecetas([]); return; }
    const recetaIds = data.map(r => r.id);
    const doctorIds = [...new Set(data.map(r => r.doctor_id))];
    const [{ data: meds }, { data: profiles }, { data: dProfiles }, { data: pedidos }] = await Promise.all([
      supabase.from("receta_medicamentos").select("*").in("receta_id", recetaIds),
      supabase.from("profiles").select("user_id, full_name").in("user_id", doctorIds),
      supabase.from("doctor_profiles").select("user_id, especialidad, clinica").in("user_id", doctorIds),
      supabase.from("pedidos_farmacia").select("*").in("receta_id", recetaIds),
    ]);
    setRecetas(data.map(r => ({
      ...r,
      medicamentos: (meds||[]).filter(m => m.receta_id === r.id),
      doctor_nombre: profiles?.find(p => p.user_id === r.doctor_id)?.full_name || "Dr.",
      especialidad: dProfiles?.find(p => p.user_id === r.doctor_id)?.especialidad || "",
      clinica: dProfiles?.find(p => p.user_id === r.doctor_id)?.clinica || "",
      pedido: (pedidos||[]).find(p => p.receta_id === r.id) || null,
    })));
  }

  async function loadRecetasDigitales(uid) {
    const { data } = await supabase.from("recetas_digitales").select("*").eq("paciente_id", uid).order("created_at", { ascending: false });
    if (data) {
      const doctorIds = [...new Set(data.map(r => r.doctor_id))];
      const [{ data: profiles }, { data: dProfiles }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", doctorIds),
        supabase.from("doctor_profiles").select("user_id, especialidad, clinica").in("user_id", doctorIds),
      ]);
      setRecetasDigitales(data.map(r => ({
        ...r,
        doctor_nombre: profiles?.find(p => p.user_id === r.doctor_id)?.full_name || "Dr.",
        especialidad: dProfiles?.find(p => p.user_id === r.doctor_id)?.especialidad || "",
      })));
    }
  }

  async function loadPrereqs(uid) {
    const { data } = await supabase.from("prerequisitos_cita").select("*").eq("paciente_id", uid).order("created_at", { ascending: false });
    if (data) setPrereqs(data);
  }

  async function togglePrereq(id, completado) {
    await supabase.from("prerequisitos_cita").update({ completado: !completado }).eq("id", id);
    setPrereqs(prev => prev.map(p => p.id === id ? { ...p, completado: !completado } : p));
  }

  async function enviarFarmacia() {
    if (!selectedFarmacia || !sendModal) return;
    setSending(true);
    const farmacia = FARMACIAS[selectedFarmacia];
    const { error } = await supabase.from("pedidos_farmacia").insert({
      receta_id: sendModal.id,
      paciente_id: user.id,
      farmacia_nombre: farmacia.nombre,
      farmacia_direccion: farmacia.direccion,
      notas: notasFarmacia,
      estado: "pendiente",
    });
    if (!error) {
      toast({ title: "✅ Receta enviada", description: `La farmacia ${farmacia.nombre} preparará tu pedido.` });
      setSendModal(null);
      setSelectedFarmacia(null);
      setNotasFarmacia("");
      await loadRecetas(user.id);
    }
    setSending(false);
  }

  const fmtFecha = (f) => {
    if (!f) return "";
    return new Date(f).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Título */}
        <div className="text-center mb-6">
          <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Mi Historial Médico</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-1">Recetas y Pre-requisitos</h1>
          <p className="text-gray-500 text-sm">Gestiona tus recetas médicas y prepárate para tus próximas citas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setTab("digitales")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${tab==="digitales" ? "border-teal-500 text-teal-700 bg-white" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
            <QrCode className="w-4 h-4"/> Recetas QR
            {recetasDigitales.length > 0 && <span className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{recetasDigitales.length}</span>}
          </button>
          <button onClick={() => setTab("recetas")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${tab==="recetas" ? "border-teal-500 text-teal-700 bg-white" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
            <FileText className="w-4 h-4"/> Recetas Clásicas
            {recetas.length > 0 && <span className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{recetas.length}</span>}
          </button>
          <button onClick={() => setTab("prereqs")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${tab==="prereqs" ? "border-teal-500 text-teal-700 bg-white" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}>
            <CheckCircle2 className="w-4 h-4"/> Pre-requisitos
            {prereqs.filter(p=>!p.completado).length > 0 && <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{prereqs.filter(p=>!p.completado).length}</span>}
          </button>
        </div>

        {/* RECETAS DIGITALES QR */}
        {tab === "digitales" && (
          <div className="space-y-4">
            {recetasDigitales.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p className="font-medium">No tienes recetas digitales aún</p>
                <p className="text-sm mt-1">Tu médico te enviará recetas con código QR después de la consulta</p>
              </div>
            ) : recetasDigitales.map(r => (
              <Card key={r.id} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + "/receta/" + r.qr_code)}`}
                      alt="QR de receta"
                      className="w-20 h-20 rounded-xl border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-bold text-gray-900">{r.doctor_nombre}</p>
                          {r.especialidad && <p className="text-teal-600 text-xs font-medium">{r.especialidad}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{fmtFecha(r.fecha)}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${r.estado==="activa"?"bg-green-100 text-green-700":r.estado==="usada"?"bg-gray-100 text-gray-600":"bg-red-100 text-red-700"}`}>
                          {r.estado === "activa" ? "Activa" : r.estado === "usada" ? "Usada" : "Vencida"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(r.medicamentos||[]).map((m, i) => (
                          <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {m.nombre}{m.dosis ? ` ${m.dosis}` : ""}
                          </span>
                        ))}
                      </div>
                      {r.notas && <p className="text-xs text-gray-500 mt-2 italic">"{r.notas}"</p>}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-gray-400"/>
                    <p className="text-xs text-gray-400">Muestra el QR a la farmacia para verificar esta receta</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* RECETAS */}
        {tab === "recetas" && (
          <div className="space-y-4">
            {recetas.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p className="font-medium">No tienes recetas médicas</p>
                <p className="text-sm mt-1">Tus recetas aparecerán aquí después de tus consultas</p>
              </div>
            ) : recetas.map(r => (
              <Card key={r.id} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-teal-600"/>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{r.doctor_nombre}</p>
                          <p className="text-teal-600 text-xs font-medium">{r.especialidad} {r.clinica ? `· ${r.clinica}` : ""}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtFecha(r.created_at)}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${r.pedido ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.pedido ? "Surtida" : "Pendiente"}
                      </span>
                    </div>

                    {r.diagnostico && (
                      <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-3">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Diagnóstico</p>
                        <p className="text-sm text-teal-700 font-medium">{r.diagnostico}</p>
                      </div>
                    )}

                    {r.medicamentos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Pill className="w-3 h-3"/> Medicamentos ({r.medicamentos.length})
                        </p>
                        <div className="space-y-1">
                          {r.medicamentos.map(m => (
                            <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0"/>
                              <span className="font-semibold text-gray-800">{m.nombre}</span>
                              {m.dosis && <span className="text-gray-400">· {m.dosis}</span>}
                              {m.frecuencia && <span className="text-gray-400">· {m.frecuencia}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:underline mt-1">
                      {expanded === r.id ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                      {expanded === r.id ? "Ver menos" : "Ver detalles completos"}
                    </button>

                    {expanded === r.id && (
                      <div className="mt-3 space-y-3">
                        {r.medicamentos.map(m => (
                          <div key={m.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="font-bold text-gray-900 mb-2">{m.nombre} <span className="text-gray-500 font-normal text-sm">{m.dosis}</span></p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {m.frecuencia && <div><p className="text-gray-400">Frecuencia</p><p className="font-semibold text-gray-700">{m.frecuencia}</p></div>}
                              {m.duracion && <div><p className="text-gray-400">Duración</p><p className="font-semibold text-gray-700">{m.duracion}</p></div>}
                            </div>
                            {m.instrucciones && <p className="text-xs text-gray-500 mt-2 bg-white rounded-lg p-2 border border-gray-100"><span className="font-semibold">Instrucciones:</span> {m.instrucciones}</p>}
                          </div>
                        ))}
                        {r.comentarios_doctor && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Comentarios del Doctor</p>
                            <p className="text-sm text-blue-800">{r.comentarios_doctor}</p>
                          </div>
                        )}
                        {r.seguimiento && (
                          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                            <p className="text-xs text-yellow-800"><span className="font-bold">Seguimiento:</span> {r.seguimiento}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {r.pedido ? (
                    <div className="bg-green-50 px-5 py-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600"/>
                      <p className="text-xs text-green-700 font-medium">Receta enviada a <span className="font-bold">{r.pedido.farmacia_nombre}</span></p>
                    </div>
                  ) : (
                    <div className="border-t border-gray-100 px-5 py-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-gray-200 text-gray-600 rounded-xl text-xs"
                        onClick={() => window.open(`https://www.google.com/maps/search/Farmacia+Guatemala`, "_blank")}>
                        <MapPin className="w-3 h-3 mr-1"/> Buscar Farmacias
                      </Button>
                      <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs"
                        onClick={() => { setSendModal(r); setSelectedFarmacia(null); }}>
                        <Send className="w-3 h-3 mr-1"/> Enviar a Farmacia
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* PRE-REQUISITOS */}
        {tab === "prereqs" && (
          <div className="space-y-4">
            {prereqs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p className="font-medium">No tienes pre-requisitos pendientes</p>
                <p className="text-sm mt-1">Los pre-requisitos de tus citas aparecerán aquí</p>
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-yellow-800">Completa todos los pre-requisitos antes de tu cita para garantizar una consulta efectiva y evitar reprogramaciones.</p>
                </div>
                {Object.entries(prereqs.reduce((acc, p) => {
                  const key = p.cita_id || "general";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(p);
                  return acc;
                }, {})).map(([citaId, items]) => (
                  <Card key={citaId} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Pre-requisitos de Cita</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {items.filter(i=>i.completado).length}/{items.length} completados
                        </span>
                      </div>
                      <div className="space-y-2">
                        {items.map(item => (
                          <button key={item.id} onClick={() => togglePrereq(item.id, item.completado)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${item.completado ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50 hover:border-teal-200"}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${item.completado ? "bg-teal-500 border-teal-500" : "border-gray-300"}`}>
                              {item.completado && <CheckCircle2 className="w-3 h-3 text-white"/>}
                            </div>
                            <span className={`text-sm flex-1 ${item.completado ? "line-through text-gray-400" : "text-gray-700"}`}>{item.descripcion}</span>
                            {item.urgente && !item.completado && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Urgente</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal enviar a farmacia */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Enviar Receta a Farmacia</h3>
              <button onClick={() => setSendModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 font-semibold mb-1">Medicamentos en la receta</p>
                <div className="flex flex-wrap gap-1">
                  {sendModal.medicamentos.map(m => (
                    <span key={m.id} className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">{m.nombre} {m.dosis ? `· ${m.dosis}` : ""}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{sendModal.doctor_nombre} · {new Date(sendModal.created_at).toLocaleDateString("es-GT")}</p>
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-2">Selecciona una farmacia</p>
              <div className="space-y-2 mb-4">
                {FARMACIAS.map((f, i) => (
                  <button key={i} onClick={() => setSelectedFarmacia(i)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedFarmacia===i ? "border-teal-500 bg-teal-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900">{f.nombre}</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs text-gray-500">{f.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{f.direccion}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3"/>{f.horario}</p>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Notas adicionales (opcional)</label>
                <textarea value={notasFarmacia} onChange={e=>setNotasFarmacia(e.target.value)}
                  placeholder="Ej: Prefiero recoger después de las 3pm, necesito factura..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none" rows={2}/>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl border-gray-200" onClick={() => setSendModal(null)}>Cancelar</Button>
                <Button disabled={selectedFarmacia===null || sending} onClick={enviarFarmacia}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold">
                  {sending ? "Enviando..." : <><Send className="w-4 h-4 mr-1"/> Enviar Receta</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

