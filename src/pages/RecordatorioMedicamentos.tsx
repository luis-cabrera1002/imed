import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Bell, Plus, Trash2, Clock, Pill, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const DIAS = ["lun","mar","mie","jue","vie","sab","dom"];
const DIAS_LABEL: Record<string, string> = { lun:"L", mar:"M", mie:"X", jue:"J", vie:"V", sab:"S", dom:"D" };

export default function RecordatorioMedicamentos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ medicamento: "", hora: "08:00", dias: [...DIAS] });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    cargarRecordatorios();
  }, [user]);

  async function cargarRecordatorios() {
    setLoading(true);
    const { data } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("user_id", user!.id)
      .eq("activo", true)
      .order("hora");
    if (data) setRecordatorios(data);
    setLoading(false);
  }

  async function guardarRecordatorio() {
    if (!form.medicamento || !form.hora || form.dias.length === 0) return;
    setSaving(true);
    const { error } = await supabase.from("medication_reminders").insert({
      user_id: user!.id,
      medicamento: form.medicamento,
      hora: form.hora,
      dias: form.dias,
      activo: true
    });
    if (!error) {
      setForm({ medicamento: "", hora: "08:00", dias: [...DIAS] });
      setShowForm(false);
      await cargarRecordatorios();
    }
    setSaving(false);
  }

  async function eliminar(id: string) {
    await supabase.from("medication_reminders").update({ activo: false }).eq("id", id);
    setRecordatorios(prev => prev.filter(r => r.id !== id));
  }

  function toggleDia(dia: string) {
    setForm(prev => ({
      ...prev,
      dias: prev.dias.includes(dia) ? prev.dias.filter(d => d !== dia) : [...prev.dias, dia]
    }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/patient-dashboard")} className="flex items-center gap-2 text-muted-foreground mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" /> Recordatorios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Configurá tus recordatorios de medicamentos</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-1">
            <Plus className="w-4 h-4" /> Nuevo
          </Button>
        </div>
        {showForm && (
          <Card className="border border-primary/20 shadow-sm rounded-2xl mb-4">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-foreground">Nuevo recordatorio</h3>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Medicamento</label>
                <Input placeholder="Ej: Butosol, Metformina..." value={form.medicamento}
                  onChange={e => setForm(p => ({...p, medicamento: e.target.value}))}
                  className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Hora</label>
                <Input type="time" value={form.hora}
                  onChange={e => setForm(p => ({...p, hora: e.target.value}))}
                  className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Dias</label>
                <div className="flex gap-1.5">
                  {DIAS.map(dia => (
                    <button key={dia} onClick={() => toggleDia(dia)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-colors ${form.dias.includes(dia) ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {DIAS_LABEL[dia]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white rounded-xl"
                  disabled={saving || !form.medicamento} onClick={guardarRecordatorio}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
        ) : recordatorios.length === 0 ? (
          <Card className="border border-border/50 shadow-sm rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Sin recordatorios</h3>
              <p className="text-sm text-muted-foreground mb-4">Configura recordatorios para no olvidar tus medicamentos</p>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2">
                <Plus className="w-4 h-4" />Crear recordatorio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recordatorios.map((r: any) => (
              <Card key={r.id} className="border border-border/50 shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{r.medicamento}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{r.hora?.substring(0,5)}</span>
                      <div className="flex gap-0.5 ml-1">
                        {DIAS.map(dia => (
                          <span key={dia} className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${r.dias?.includes(dia) ? "bg-primary/20 text-primary" : "text-muted-foreground/30"}`}>
                            {DIAS_LABEL[dia]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg p-2 h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-200 flex-shrink-0"
                    onClick={() => eliminar(r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700"><strong>Activa las notificaciones</strong> en tu dashboard para recibir los recordatorios.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
