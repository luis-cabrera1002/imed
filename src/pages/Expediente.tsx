import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { functionsClient } from "@/integrations/supabase/functionsClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart, Pill, AlertTriangle, Droplets, Weight, Ruler,
  Plus, X, Save, Edit2, ClipboardList, ArrowLeft, User,
  ShieldAlert, ShieldCheck, Clock,
} from "lucide-react";
import CardiovascularRisk from "@/components/CardiovascularRisk";

interface Expediente {
  condiciones: string[];
  alergias: string[];
  medicamentos_activos: string[];
  grupo_sanguineo: string;
  peso: string;
  altura: string;
  notas: string;
}

const GRUPOS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const EMPTY: Expediente = {
  condiciones: [], alergias: [], medicamentos_activos: [],
  grupo_sanguineo: "", peso: "", altura: "", notas: "",
};

// Chip input para listas de texto (condiciones, alergias, meds)
function ChipInput({
  label, icon: Icon, color, items, onAdd, onRemove, placeholder, readOnly,
}: {
  label: string; icon: any; color: string; items: string[];
  onAdd: (v: string) => void; onRemove: (i: number) => void;
  placeholder: string; readOnly?: boolean;
}) {
  const [input, setInput] = useState("");

  function handleAdd() {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onAdd(v);
    setInput("");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              color.includes("red") ? "bg-red-50 text-red-700 border border-red-200" :
              color.includes("orange") ? "bg-orange-50 text-orange-700 border border-orange-200" :
              color.includes("blue") ? "bg-blue-50 text-blue-700 border border-blue-200" :
              "bg-purple-50 text-purple-700 border border-purple-200"
            }`}
          >
            {item}
            {!readOnly && (
              <button onClick={() => onRemove(i)} className="hover:opacity-70 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-sm text-gray-400 italic">Sin {label.toLowerCase()} registradas</span>
        )}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            placeholder={placeholder}
            className="h-9 text-sm flex-1"
          />
          <Button size="sm" variant="outline" onClick={handleAdd} disabled={!input.trim()}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Expediente() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const patientId = params.get("patient_id"); // Doctor viewing a patient's record

  const [user, setUser] = useState<any>(null);
  const [expediente, setExpediente] = useState<Expediente>(EMPTY);
  const [original, setOriginal] = useState<Expediente>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const readOnly = !!(patientId); // doctor view is read-only

  // Drug interactions for medicamentos_activos
  const [loadingInteracciones, setLoadingInteracciones] = useState(false);
  const [interacciones, setInteracciones] = useState<any | null>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth"); return; }
    setUser(u);

    const { data: profile } = await supabase
      .from("profiles").select("role, full_name").eq("user_id", u.id).single();
    setIsDoctor(profile?.role === "doctor");

    const targetId = patientId || u.id;

    if (patientId) {
      const { data: p } = await supabase
        .from("profiles").select("full_name").eq("user_id", patientId).single();
      setPatientName(p?.full_name ?? "Paciente");
    }

    const { data } = await supabase
      .from("expediente_medico").select("*").eq("user_id", targetId).single();

    if (data) {
      const exp: Expediente = {
        condiciones:          data.condiciones ?? [],
        alergias:             data.alergias ?? [],
        medicamentos_activos: data.medicamentos_activos ?? [],
        grupo_sanguineo:      data.grupo_sanguineo ?? "",
        peso:                 data.peso?.toString() ?? "",
        altura:               data.altura?.toString() ?? "",
        notas:                data.notas ?? "",
      };
      setExpediente(exp);
      setOriginal(exp);
    } else if (!patientId) {
      // No expediente yet — open in edit mode for patient
      setEditing(true);
    }
    setLoading(false);
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id:              user.id,
      condiciones:          expediente.condiciones,
      alergias:             expediente.alergias,
      medicamentos_activos: expediente.medicamentos_activos,
      grupo_sanguineo:      expediente.grupo_sanguineo || null,
      peso:                 expediente.peso ? parseFloat(expediente.peso) : null,
      altura:               expediente.altura ? parseFloat(expediente.altura) : null,
      notas:                expediente.notas || null,
    };
    await supabase.from("expediente_medico").upsert(payload, { onConflict: "user_id" });
    setOriginal(expediente);
    setEditing(false);
    setSaving(false);
  }

  function cancel() {
    setExpediente(original);
    setEditing(false);
  }

  async function verificarInteraccionesExpediente() {
    const meds = expediente.medicamentos_activos.join(", ");
    if (!meds.trim()) return;
    setLoadingInteracciones(true);
    setInteracciones(null);
    try {
      const { data } = await functionsClient.functions.invoke("drug-interactions", {
        body: { medicamentos: meds },
      });
      setInteracciones(data);
    } catch (e) {
      console.error("drug-interactions error:", e);
    }
    setLoadingInteracciones(false);
  }

  function listOp(field: keyof Expediente, op: "add" | "remove", val?: string, idx?: number) {
    setExpediente(prev => {
      const arr = [...(prev[field] as string[])];
      if (op === "add" && val) arr.push(val);
      if (op === "remove" && idx !== undefined) arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  }

  const imc = expediente.peso && expediente.altura
    ? (parseFloat(expediente.peso) / Math.pow(parseFloat(expediente.altura) / 100, 2)).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              {patientId ? `Expediente de ${patientName}` : "Mi Expediente Médico"}
            </h1>
            {isDoctor && patientId && (
              <p className="text-sm text-gray-500 mt-0.5">Vista del doctor — solo lectura</p>
            )}
          </div>
          {!readOnly && !editing && (
            <Button size="sm" onClick={() => setEditing(true)} className="gap-1.5">
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </Button>
          )}
          {!readOnly && editing && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={cancel}>Cancelar</Button>
              <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          )}
        </div>

        {/* Datos vitales */}
        <Card className="mb-4 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Datos Vitales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-red-500" /> Grupo Sanguíneo
                </label>
                {editing ? (
                  <select
                    value={expediente.grupo_sanguineo}
                    onChange={e => setExpediente(p => ({ ...p, grupo_sanguineo: e.target.value }))}
                    className="w-full h-9 border border-gray-200 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">— Sin definir —</option>
                    {GRUPOS.map(g => <option key={g}>{g}</option>)}
                  </select>
                ) : (
                  <p className={`text-2xl font-black ${expediente.grupo_sanguineo ? "text-red-600" : "text-gray-300"}`}>
                    {expediente.grupo_sanguineo || "—"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                  <Weight className="w-3.5 h-3.5 text-blue-500" /> Peso (kg)
                </label>
                {editing ? (
                  <Input type="number" step="0.1" min="1" max="300"
                    value={expediente.peso}
                    onChange={e => setExpediente(p => ({ ...p, peso: e.target.value }))}
                    className="h-9 text-sm" placeholder="70.0"
                  />
                ) : (
                  <p className={`text-2xl font-black ${expediente.peso ? "text-blue-700" : "text-gray-300"}`}>
                    {expediente.peso ? `${expediente.peso} kg` : "—"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-green-500" /> Altura (cm)
                </label>
                {editing ? (
                  <Input type="number" step="0.5" min="50" max="250"
                    value={expediente.altura}
                    onChange={e => setExpediente(p => ({ ...p, altura: e.target.value }))}
                    className="h-9 text-sm" placeholder="170"
                  />
                ) : (
                  <p className={`text-2xl font-black ${expediente.altura ? "text-green-700" : "text-gray-300"}`}>
                    {expediente.altura ? `${expediente.altura} cm` : "—"}
                  </p>
                )}
              </div>
            </div>
            {imc && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">IMC calculado: </span>
                <span className={`text-sm font-bold ${
                  parseFloat(imc) < 18.5 ? "text-blue-600" :
                  parseFloat(imc) < 25   ? "text-green-600" :
                  parseFloat(imc) < 30   ? "text-orange-500" : "text-red-600"
                }`}>
                  {imc} — {
                    parseFloat(imc) < 18.5 ? "Bajo peso" :
                    parseFloat(imc) < 25   ? "Normal" :
                    parseFloat(imc) < 30   ? "Sobrepeso" : "Obesidad"
                  }
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Condiciones, Alergias, Medicamentos */}
        <div className="space-y-4 mb-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <ChipInput
                label="Condiciones Crónicas"
                icon={Heart}
                color="text-red-500"
                items={expediente.condiciones}
                onAdd={v => listOp("condiciones", "add", v)}
                onRemove={i => listOp("condiciones", "remove", undefined, i)}
                placeholder="Ej: Diabetes tipo 2, Hipertensión..."
                readOnly={readOnly || !editing}
              />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <ChipInput
                label="Alergias"
                icon={AlertTriangle}
                color="text-orange-500"
                items={expediente.alergias}
                onAdd={v => listOp("alergias", "add", v)}
                onRemove={i => listOp("alergias", "remove", undefined, i)}
                placeholder="Ej: Penicilina, Polen, Mariscos..."
                readOnly={readOnly || !editing}
              />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <ChipInput
                label="Medicamentos Activos"
                icon={Pill}
                color="text-blue-500"
                items={expediente.medicamentos_activos}
                onAdd={v => { listOp("medicamentos_activos", "add", v); setInteracciones(null); }}
                onRemove={i => { listOp("medicamentos_activos", "remove", undefined, i); setInteracciones(null); }}
                placeholder="Ej: Metformina 850mg, Losartán 50mg..."
                readOnly={readOnly || !editing}
              />

              {/* Drug interactions checker */}
              {expediente.medicamentos_activos.length >= 2 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={verificarInteraccionesExpediente}
                    disabled={loadingInteracciones}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {loadingInteracciones
                      ? <><Clock className="w-3 h-3 animate-spin" /> Verificando...</>
                      : <><ShieldAlert className="w-3 h-3" /> Verificar interacciones entre medicamentos</>}
                  </button>

                  {interacciones && (
                    <div className="mt-2 space-y-2">
                      {interacciones.interacciones_graves?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-bold text-red-700">Interacciones Graves</span>
                          </div>
                          {interacciones.interacciones_graves.map((i: any, idx: number) => (
                            <div key={idx} className="mb-1">
                              <p className="text-xs font-semibold text-red-800">{i.medicamentos}</p>
                              <p className="text-xs text-red-700">{i.descripcion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {interacciones.interacciones_moderadas?.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-xs font-bold text-yellow-700">Interacciones Moderadas</span>
                          </div>
                          {interacciones.interacciones_moderadas.map((i: any, idx: number) => (
                            <div key={idx} className="mb-1">
                              <p className="text-xs font-semibold text-yellow-800">{i.medicamentos}</p>
                              <p className="text-xs text-yellow-700">{i.descripcion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {interacciones.sin_interacciones_conocidas && (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-green-700">Sin interacciones conocidas.</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 italic">{interacciones.disclaimer}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Notas adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={expediente.notas}
                onChange={e => setExpediente(p => ({ ...p, notas: e.target.value }))}
                placeholder="Antecedentes familiares, cirugías previas, observaciones..."
                rows={4}
                className="text-sm resize-none"
              />
            ) : (
              <p className={`text-sm leading-relaxed ${expediente.notas ? "text-gray-700" : "text-gray-400 italic"}`}>
                {expediente.notas || "Sin notas adicionales"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cardiovascular Risk Calculator */}
        <div className="mt-4">
          <CardiovascularRisk
            isDiabetico={expediente.condiciones.some(c => c.toLowerCase().includes("diabetes"))}
            defaultCollapsed
          />
        </div>

        {/* Save button for mobile (floating at bottom) */}
        {editing && !readOnly && (
          <div className="fixed bottom-6 right-6">
            <Button onClick={save} disabled={saving} size="lg" className="shadow-xl gap-2 rounded-2xl">
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar expediente"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
