import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { functionsClient } from "@/integrations/supabase/functionsClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Search, Plus, Save, Share2, Printer, Trash2,
  Stethoscope, Sparkles, CheckCircle, Clock, AlertCircle,
  X, ChevronDown, User, Lock, Calendar, Clipboard,
  ArrowLeft, Brain, Mic, MicOff, Radio, Wand2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Built-in templates (hardcoded in JS)
// ─────────────────────────────────────────────────────────────────────────────
const PLANTILLAS_DEFAULT: Record<string, { nombre: string; campos: Partial<NoteForm> }> = {
  general: {
    nombre: "Consulta General",
    campos: {
      examen_fisico: "Peso: ___ kg  Talla: ___ cm\nFC: ___ lpm  FR: ___ rpm\nTA: ___/___mmHg  T°: ___°C\nAspecto general:",
      motivo_consulta: "Paciente consulta por:",
    },
  },
  cardiologia: {
    nombre: "Cardiología",
    campos: {
      examen_fisico:
        "FC: ___ lpm\nPA: ___/___mmHg\nRitmo: Regular/Irregular\nSoplos: Presentes/Ausentes\nEdemas: Sí/No",
      motivo_consulta: "Paciente consulta por:",
    },
  },
  pediatria: {
    nombre: "Pediatría",
    campos: {
      examen_fisico:
        "Peso: ___ kg\nTalla: ___ cm\nPC: ___ cm\nDesarrollo: Acorde/No acorde a edad\nVacunas al día: Sí/No",
      motivo_consulta: "Paciente pediátrico consulta por:",
    },
  },
  ginecologia: {
    nombre: "Ginecología",
    campos: {
      examen_fisico:
        "FUR: ___\nGesta: ___ Para: ___ Abortos: ___\nPapanicolau: ___\nEco transvaginal: ___",
      motivo_consulta: "Paciente consulta por:",
    },
  },
  dermatologia: {
    nombre: "Dermatología",
    campos: {
      examen_fisico:
        "Lesión: (pápula/mácula/vesícula/placa)\nLocalización: ___\nColoración: ___\nBordes: (bien/mal definidos)\nDistribución: ___",
      motivo_consulta: "Paciente consulta por:",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface NoteForm {
  motivo_consulta: string;
  examen_fisico: string;
  diagnostico: string;
  codigo_cie10: string;
  plan_tratamiento: string;
  medicamentos_recetados: string;
  proxima_cita: string;
  notas_privadas: string;
  plantilla: string;
  compartida_con_paciente: boolean;
}

interface NoteRecord extends NoteForm {
  id: string;
  doctor_id: string;
  paciente_id: string;
  cita_id?: string | null;
  created_at: string;
  updated_at: string;
  paciente_nombre?: string;
}

const EMPTY_FORM: NoteForm = {
  motivo_consulta: "",
  examen_fisico: "",
  diagnostico: "",
  codigo_cie10: "",
  plan_tratamiento: "",
  medicamentos_recetados: "",
  proxima_cita: "",
  notas_privadas: "",
  plantilla: "general",
  compartida_con_paciente: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function NotasClinicas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // URL params
  const urlCitaId = searchParams.get("cita_id") || null;
  const urlPacienteId = searchParams.get("paciente_id") || null;
  const urlPacienteNombre = searchParams.get("paciente_nombre") || "Paciente";
  const urlNotaId = searchParams.get("nota_id") || null;

  // Auth / role
  const [isDoctor, setIsDoctor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [especialidadDoctor, setEspecialidadDoctor] = useState("Medicina General");

  // Notes list
  const [notas, setNotas] = useState<NoteRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notaActiva, setNotaActiva] = useState<NoteRecord | null>(null);

  // Form
  const [form, setForm] = useState<NoteForm>(EMPTY_FORM);
  const [pacienteActivo, setPacienteActivo] = useState<{ id: string; nombre: string } | null>(null);

  // Autosave
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // AI
  const [iaSug, setIaSug] = useState<any | null>(null);
  const [loadingIA, setLoadingIA] = useState(false);

  // Custom templates (from DB)
  const [plantillasCustom, setPlantillasCustom] = useState<any[]>([]);
  const [showPlantillaDropdown, setShowPlantillaDropdown] = useState(false);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUserId(user.id);

    // Check doctor profile
    const { data: dp } = await supabase
      .from("doctor_profiles")
      .select("especialidad")
      .eq("user_id", user.id)
      .single();

    if (!dp) {
      // Not a doctor — redirect
      toast({ title: "Acceso denegado", description: "Esta sección es solo para médicos.", variant: "destructive" });
      navigate("/patient-dashboard");
      return;
    }

    setIsDoctor(true);
    setEspecialidadDoctor(dp.especialidad || "Medicina General");

    await Promise.all([
      loadNotas(user.id),
      loadPlantillasCustom(user.id),
    ]);

    setLoading(false);

    // Handle URL params
    if (urlNotaId) {
      // Will be selected after notas load via effect
    } else if (urlPacienteId) {
      // Create new note pre-filled for this patient
      nuevaNota(user.id, urlCitaId, urlPacienteId, urlPacienteNombre);
    }
  }

  // Select nota by URL param after notas load
  useEffect(() => {
    if (urlNotaId && notas.length > 0) {
      const found = notas.find(n => n.id === urlNotaId);
      if (found) selectNota(found);
    }
  }, [urlNotaId, notas.length]);

  // ── Load notes ───────────────────────────────────────────────────────────
  async function loadNotas(doctorId: string) {
    const { data } = await supabase
      .from("notas_clinicas")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("updated_at", { ascending: false });

    if (!data) return;

    const pIds = [...new Set(data.map((n: any) => n.paciente_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", pIds);

    const pm: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { pm[p.user_id] = p.full_name; });

    setNotas(data.map((n: any) => ({ ...n, paciente_nombre: pm[n.paciente_id] || "Paciente" })));
  }

  async function loadPlantillasCustom(doctorId: string) {
    const { data } = await supabase
      .from("plantillas_notas")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false });
    if (data) setPlantillasCustom(data);
  }

  // ── Select / New note ─────────────────────────────────────────────────────
  function selectNota(nota: NoteRecord) {
    setNotaActiva(nota);
    setForm({
      motivo_consulta: nota.motivo_consulta || "",
      examen_fisico: nota.examen_fisico || "",
      diagnostico: nota.diagnostico || "",
      codigo_cie10: nota.codigo_cie10 || "",
      plan_tratamiento: nota.plan_tratamiento || "",
      medicamentos_recetados: nota.medicamentos_recetados || "",
      proxima_cita: nota.proxima_cita || "",
      notas_privadas: nota.notas_privadas || "",
      plantilla: nota.plantilla || "general",
      compartida_con_paciente: nota.compartida_con_paciente || false,
    });
    setPacienteActivo({ id: nota.paciente_id, nombre: nota.paciente_nombre || "Paciente" });
    setIaSug(null);
    setAutosaveStatus("saved");
  }

  function nuevaNota(
    doctorId: string,
    citaId?: string | null,
    pacienteId?: string | null,
    pacienteNombre?: string
  ) {
    const plantillaKey = "general";
    const tpl = PLANTILLAS_DEFAULT[plantillaKey];
    const newForm: NoteForm = {
      ...EMPTY_FORM,
      motivo_consulta: tpl.campos.motivo_consulta || "",
      examen_fisico: tpl.campos.examen_fisico || "",
      plantilla: plantillaKey,
    };

    const newNota: NoteRecord = {
      id: "", // empty = not saved yet
      doctor_id: doctorId,
      paciente_id: pacienteId || "",
      cita_id: citaId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      paciente_nombre: pacienteNombre || "Nuevo Paciente",
      ...newForm,
    };

    setNotaActiva(newNota);
    setForm(newForm);
    setPacienteActivo({ id: pacienteId || "", nombre: pacienteNombre || "Nuevo Paciente" });
    setIaSug(null);
    setAutosaveStatus("unsaved");
  }

  function handleNuevaNota() {
    if (!userId) return;
    nuevaNota(userId);
  }

  // ── Form change + autosave ────────────────────────────────────────────────
  const handleFormChange = useCallback((field: keyof NoteForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setAutosaveStatus("unsaved");

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      guardarNota(true);
    }, 30000);
  }, []);

  // ── Save note ─────────────────────────────────────────────────────────────
  async function guardarNota(silent = false) {
    if (!userId || !notaActiva) return;
    if (!pacienteActivo?.id) {
      if (!silent) toast({ title: "Falta paciente", description: "Seleccioná un paciente para esta nota.", variant: "destructive" });
      return;
    }

    setAutosaveStatus("saving");

    const payload: any = {
      doctor_id: userId,
      paciente_id: pacienteActivo.id,
      cita_id: notaActiva.cita_id || null,
      motivo_consulta: form.motivo_consulta,
      examen_fisico: form.examen_fisico,
      diagnostico: form.diagnostico,
      codigo_cie10: form.codigo_cie10,
      plan_tratamiento: form.plan_tratamiento,
      medicamentos_recetados: form.medicamentos_recetados,
      proxima_cita: form.proxima_cita,
      notas_privadas: form.notas_privadas,
      plantilla: form.plantilla,
      compartida_con_paciente: form.compartida_con_paciente,
      updated_at: new Date().toISOString(),
    };

    if (notaActiva.id) {
      payload.id = notaActiva.id;
    }

    const { data, error } = await supabase
      .from("notas_clinicas")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      setAutosaveStatus("unsaved");
      if (!silent) toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
      return;
    }

    setAutosaveStatus("saved");
    if (data) {
      const updated: NoteRecord = { ...data, paciente_nombre: pacienteActivo.nombre };
      setNotaActiva(updated);
      setNotas(prev => {
        const exists = prev.find(n => n.id === updated.id);
        if (exists) return prev.map(n => n.id === updated.id ? updated : n);
        return [updated, ...prev];
      });
    }

    if (!silent) toast({ title: "Nota guardada", description: "Los datos fueron guardados correctamente." });
  }

  // ── Share with patient ────────────────────────────────────────────────────
  async function compartirConPaciente() {
    if (!notaActiva?.id) {
      await guardarNota(true);
      return;
    }
    const { error } = await supabase
      .from("notas_clinicas")
      .update({ compartida_con_paciente: true })
      .eq("id", notaActiva.id);

    if (!error) {
      setForm(prev => ({ ...prev, compartida_con_paciente: true }));
      setNotaActiva(prev => prev ? { ...prev, compartida_con_paciente: true } : null);
      toast({ title: "Nota compartida", description: "El paciente podrá ver esta nota en su dashboard." });
    }
  }

  // ── Delete note ───────────────────────────────────────────────────────────
  async function eliminarNota() {
    if (!notaActiva?.id) {
      setNotaActiva(null);
      setForm(EMPTY_FORM);
      return;
    }
    const { error } = await supabase.from("notas_clinicas").delete().eq("id", notaActiva.id);
    if (!error) {
      setNotas(prev => prev.filter(n => n.id !== notaActiva.id));
      setNotaActiva(null);
      setForm(EMPTY_FORM);
      toast({ title: "Nota eliminada" });
    }
  }

  // ── Apply template ────────────────────────────────────────────────────────
  function aplicarPlantilla(key: string) {
    const tpl = PLANTILLAS_DEFAULT[key];
    if (!tpl) return;
    setForm(prev => ({
      ...prev,
      plantilla: key,
      motivo_consulta: tpl.campos.motivo_consulta || prev.motivo_consulta,
      examen_fisico: tpl.campos.examen_fisico || prev.examen_fisico,
    }));
    setShowPlantillaDropdown(false);
    setAutosaveStatus("unsaved");
  }

  // ── AI suggestions ────────────────────────────────────────────────────────
  async function sugerirIA() {
    if (!form.motivo_consulta && !form.examen_fisico) {
      toast({ title: "Faltan datos", description: "Completá el motivo de consulta o examen físico primero.", variant: "destructive" });
      return;
    }
    setLoadingIA(true);
    setIaSug(null);
    try {
      const { data, error } = await functionsClient.functions.invoke("clinical-notes-ai", {
        body: {
          motivo: form.motivo_consulta,
          examen_fisico: form.examen_fisico,
          especialidad: especialidadDoctor,
        },
      });
      if (error) throw error;
      setIaSug(data);
    } catch (err) {
      console.error("IA error:", err);
      toast({ title: "Error de IA", description: "No se pudo obtener sugerencias. Intentá de nuevo.", variant: "destructive" });
    }
    setLoadingIA(false);
  }

  // ── Save as custom template ───────────────────────────────────────────────
  async function guardarComoPlantilla() {
    if (!userId) return;
    const nombre = window.prompt("Nombre para tu plantilla:");
    if (!nombre) return;
    const { error } = await supabase.from("plantillas_notas").insert({
      doctor_id: userId,
      nombre,
      especialidad: especialidadDoctor,
      campos: {
        motivo_consulta: form.motivo_consulta,
        examen_fisico: form.examen_fisico,
      },
      is_default: false,
    });
    if (!error) {
      toast({ title: "Plantilla guardada", description: `"${nombre}" guardada en tus plantillas.` });
      loadPlantillasCustom(userId);
    }
  }

  // ── Print ─────────────────────────────────────────────────────────────────
  function printNota() {
    window.print();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // iMed NOA — Voice Assistant
  // ══════════════════════════════════════════════════════════════════════════
  type NoaState = "idle" | "recording" | "transcribing" | "analyzing" | "done";

  const [noaOpen, setNoaOpen] = useState(false);
  const [noaState, setNoaState] = useState<NoaState>("idle");
  const [noaTimer, setNoaTimer] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [noaResult, setNoaResult] = useState<Record<string, string> | null>(null);
  const [noaChunkPending, setNoaChunkPending] = useState(false);

  const recorderRef  = useRef<MediaRecorder | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const chunksRef    = useRef<Blob[]>([]);
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef("");
  const transcriptPanelRef = useRef<HTMLDivElement | null>(null);

  function openNoa() {
    setNoaOpen(true);
    setNoaState("idle");
    setNoaTimer(0);
    setLiveTranscript("");
    setNoaResult(null);
    transcriptRef.current = "";
    chunksRef.current = [];
  }

  function closeNoa() {
    stopRecording();
    setNoaOpen(false);
    setNoaState("idle");
  }

  function drawWaveform() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    analyser.fftSize = 64;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    function frame() {
      animFrameRef.current = requestAnimationFrame(frame);
      analyser!.getByteFrequencyData(data);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const bw = (canvas!.width / bufLen) - 1;
      for (let i = 0; i < bufLen; i++) {
        const ratio = data[i] / 255;
        const bh = Math.max(4, ratio * canvas!.height);
        const alpha = 0.3 + ratio * 0.7;
        ctx!.fillStyle = `rgba(147, 51, 234, ${alpha})`;
        const x = i * (bw + 1);
        ctx!.beginPath();
        ctx!.roundRect(x, canvas!.height - bh, bw, bh, 3);
        ctx!.fill();
      }
    }
    frame();
  }

  async function transcribeBlob(blob: Blob) {
    if (blob.size < 1000) return; // skip tiny/empty chunks
    setNoaChunkPending(true);
    try {
      const ab = await blob.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = "";
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      const b64 = btoa(bin);
      const mime = blob.type || "audio/webm";

      const { data } = await functionsClient.functions.invoke("transcribe-consulta", {
        body: { audio: b64, mimeType: mime },
      });

      if (data?.text?.trim()) {
        transcriptRef.current = (transcriptRef.current + " " + data.text).trim();
        setLiveTranscript(transcriptRef.current);
        setTimeout(() => {
          if (transcriptPanelRef.current) {
            transcriptPanelRef.current.scrollTop = transcriptPanelRef.current.scrollHeight;
          }
        }, 50);
      }
    } catch (e) {
      console.error("transcribe chunk error:", e);
    }
    setNoaChunkPending(false);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio waveform
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const src = audioCtx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          // Transcribe each 30s chunk as it arrives
          transcribeBlob(e.data);
        }
      };

      recorder.onstop = async () => {
        // If there's accumulated but un-transcribed data (shouldn't happen with timeslice)
        // wait a tick for last transcription, then analyze
        setNoaState("analyzing");
        await new Promise(r => setTimeout(r, 500));
        await analyzeTranscript();
      };

      recorder.start(30000); // emit chunk every 30s

      setNoaState("recording");
      setNoaTimer(0);
      timerRef.current = setInterval(() => setNoaTimer(t => t + 1), 1000);

      // Start waveform after a tick (canvas needs to be mounted)
      setTimeout(drawWaveform, 100);
    } catch (err) {
      toast({ title: "No se pudo acceder al micrófono", description: "Permití el acceso en tu navegador.", variant: "destructive" });
      console.error("microphone error:", err);
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setNoaState("transcribing");
      recorderRef.current.stop();
    }
  }

  async function analyzeTranscript() {
    if (!transcriptRef.current.trim()) {
      toast({ title: "Sin transcripción", description: "No se detectó audio suficiente.", variant: "destructive" });
      setNoaState("idle");
      return;
    }
    setNoaState("analyzing");
    try {
      const { data } = await functionsClient.functions.invoke("analyze-consulta", {
        body: { transcripcion: transcriptRef.current },
      });
      if (data && !data.error) {
        setNoaResult(data);
        setNoaState("done");
      } else {
        throw new Error(data?.error || "Unknown error");
      }
    } catch (e) {
      console.error("analyze-consulta error:", e);
      toast({ title: "Error al analizar", description: "No se pudo procesar la consulta.", variant: "destructive" });
      setNoaState("idle");
    }
  }

  function applyNoaResult() {
    if (!noaResult) return;
    const transcriptSnippet = transcriptRef.current.length > 600
      ? transcriptRef.current.slice(0, 600) + "..."
      : transcriptRef.current;
    const notasExtra = [
      form.notas_privadas,
      noaResult.resumen_expediente ? `\n[NOA Resumen] ${noaResult.resumen_expediente}` : "",
      noaResult.instrucciones_paciente ? `[NOA Instrucciones] ${noaResult.instrucciones_paciente}` : "",
      noaResult.recordatorios_sugeridos ? `[NOA Recordatorios] ${noaResult.recordatorios_sugeridos}` : "",
      `\n[NOA Transcripción] ${transcriptSnippet}`,
    ].filter(Boolean).join("\n").trim();

    setForm(prev => ({
      ...prev,
      motivo_consulta: noaResult!.motivo_consulta || prev.motivo_consulta,
      examen_fisico:   noaResult!.examen_fisico   || prev.examen_fisico,
      diagnostico:     noaResult!.diagnostico      || prev.diagnostico,
      codigo_cie10:    noaResult!.codigo_cie10     || prev.codigo_cie10,
      plan_tratamiento:       noaResult!.plan_tratamiento      || prev.plan_tratamiento,
      medicamentos_recetados: noaResult!.medicamentos_recetados || prev.medicamentos_recetados,
      proxima_cita:    noaResult!.proxima_cita     || prev.proxima_cita,
      notas_privadas:  notasExtra,
    }));
    setAutosaveStatus("unsaved");
    setNoaOpen(false);
    setNoaState("idle");
    toast({ title: "✨ Nota completada con NOA", description: "Los campos fueron llenados automáticamente." });
  }

  function fmtTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  // ─── Filtered notes list ──────────────────────────────────────────────────
  const notasFiltradas = notas.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.paciente_nombre || "").toLowerCase().includes(q) ||
      (n.diagnostico || "").toLowerCase().includes(q) ||
      (n.motivo_consulta || "").toLowerCase().includes(q)
    );
  });

  // ─── Autosave status indicator ────────────────────────────────────────────
  function AutosaveIndicator() {
    if (autosaveStatus === "saved") return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle className="w-3 h-3" /> Guardado
      </span>
    );
    if (autosaveStatus === "saving") return (
      <span className="flex items-center gap-1 text-xs text-blue-500">
        <Clock className="w-3 h-3 animate-spin" /> Guardando...
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <AlertCircle className="w-3 h-3" /> Sin guardar
      </span>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { font-family: serif; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="flex h-screen flex-col">
        {/* Top bar */}
        <div className="border-b bg-white px-4 py-3 flex items-center gap-3 no-print flex-shrink-0">
          <button onClick={() => navigate("/doctor-dashboard")} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Notas Clínicas</span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Panel ── */}
          <div className="w-80 flex-shrink-0 bg-white border-r flex flex-col no-print">
            {/* Panel header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Notas Clínicas</h2>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 gap-1 text-xs"
                onClick={handleNuevaNota}
              >
                <Plus className="w-3 h-3" /> Nueva
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente o diagnóstico..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 h-8 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto">
              {notasFiltradas.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">
                    {searchQuery ? "Sin resultados" : "No hay notas aún"}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs mt-1">Creá una nueva nota para comenzar</p>
                  )}
                </div>
              ) : (
                notasFiltradas.map(nota => {
                  const isActive = notaActiva?.id === nota.id;
                  return (
                    <button
                      key={nota.id}
                      onClick={() => selectNota(nota)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                        isActive ? "bg-blue-50 border-l-2 border-l-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-700">
                            {(nota.paciente_nombre || "P")[0]}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900 truncate flex-1">
                          {nota.paciente_nombre || "Paciente"}
                        </p>
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full capitalize flex-shrink-0">
                          {nota.plantilla || "general"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate pl-8">
                        {nota.diagnostico || nota.motivo_consulta || "Sin diagnóstico"}
                      </p>
                      <p className="text-xs text-gray-400 pl-8 mt-0.5">
                        {new Date(nota.updated_at).toLocaleDateString("es-GT", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {!notaActiva ? (
              // Empty state
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-gray-500">Seleccioná una nota o creá una nueva</p>
                  <p className="text-sm mt-1">Las notas se guardan automáticamente</p>
                  <Button
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={handleNuevaNota}
                  >
                    <Plus className="w-4 h-4" /> Nueva Nota
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Note top bar */}
                <div className="bg-white border-b px-4 py-2 flex items-center justify-between no-print flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-sm text-gray-800">
                        {pacienteActivo?.nombre || "Paciente"}
                      </span>
                    </div>
                    <AutosaveIndicator />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Template selector */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-gray-200"
                        onClick={() => setShowPlantillaDropdown(v => !v)}
                      >
                        <Clipboard className="w-3 h-3" />
                        {PLANTILLAS_DEFAULT[form.plantilla]?.nombre || "Plantilla"}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      {showPlantillaDropdown && (
                        <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg min-w-48 py-1">
                          <p className="text-xs font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wide">
                            Plantillas
                          </p>
                          {Object.entries(PLANTILLAS_DEFAULT).map(([key, tpl]) => (
                            <button
                              key={key}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                              onClick={() => aplicarPlantilla(key)}
                            >
                              {tpl.nombre}
                            </button>
                          ))}
                          {plantillasCustom.length > 0 && (
                            <>
                              <div className="border-t border-gray-100 my-1" />
                              <p className="text-xs font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wide">
                                Mis Plantillas
                              </p>
                              {plantillasCustom.map(tpl => (
                                <button
                                  key={tpl.id}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                                  onClick={() => {
                                    setForm(prev => ({
                                      ...prev,
                                      plantilla: tpl.nombre,
                                      motivo_consulta: tpl.campos?.motivo_consulta || prev.motivo_consulta,
                                      examen_fisico: tpl.campos?.examen_fisico || prev.examen_fisico,
                                    }));
                                    setShowPlantillaDropdown(false);
                                    setAutosaveStatus("unsaved");
                                  }}
                                >
                                  {tpl.nombre}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => guardarNota(false)}
                    >
                      <Save className="w-3 h-3" /> Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={compartirConPaciente}
                      disabled={form.compartida_con_paciente}
                      title={form.compartida_con_paciente ? "Ya compartida con el paciente" : "Compartir con paciente"}
                    >
                      <Share2 className="w-3 h-3" />
                      {form.compartida_con_paciente ? "Compartida" : "Compartir"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-gray-200"
                      onClick={printNota}
                      title="Imprimir"
                    >
                      <Printer className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm("¿Eliminar esta nota?")) eliminarNota();
                      }}
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Print header (hidden on screen) */}
                <div className="print-only p-6 border-b">
                  <h1 className="text-xl font-bold">iMed Guatemala — Nota Clínica</h1>
                  <p>Paciente: {pacienteActivo?.nombre}</p>
                  <p>Fecha: {new Date().toLocaleDateString("es-GT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p>Plantilla: {PLANTILLAS_DEFAULT[form.plantilla]?.nombre || form.plantilla}</p>
                </div>

                {/* Form body */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-3xl mx-auto space-y-4">

                    {/* Motivo de consulta */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Motivo de Consulta
                      </label>
                      <Textarea
                        rows={3}
                        value={form.motivo_consulta}
                        onChange={e => handleFormChange("motivo_consulta", e.target.value)}
                        placeholder="Describe el motivo de la consulta..."
                        className="text-sm resize-none rounded-xl"
                      />
                    </div>

                    {/* Examen físico */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Examen Físico
                      </label>
                      <Textarea
                        rows={4}
                        value={form.examen_fisico}
                        onChange={e => handleFormChange("examen_fisico", e.target.value)}
                        placeholder="Hallazgos del examen físico..."
                        className="text-sm resize-none rounded-xl font-mono"
                      />
                    </div>

                    {/* Diagnóstico + CIE-10 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Diagnóstico
                        </label>
                        <Input
                          value={form.diagnostico}
                          onChange={e => handleFormChange("diagnostico", e.target.value)}
                          placeholder="Diagnóstico principal..."
                          className="text-sm rounded-xl h-10"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                          Código CIE-10
                        </label>
                        <Input
                          value={form.codigo_cie10}
                          onChange={e => handleFormChange("codigo_cie10", e.target.value)}
                          placeholder="J00.0"
                          className="text-sm rounded-xl h-10"
                        />
                      </div>
                    </div>

                    {/* Plan de tratamiento */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Plan de Tratamiento
                      </label>
                      <Textarea
                        rows={4}
                        value={form.plan_tratamiento}
                        onChange={e => handleFormChange("plan_tratamiento", e.target.value)}
                        placeholder="Plan de tratamiento y seguimiento..."
                        className="text-sm resize-none rounded-xl"
                      />
                    </div>

                    {/* Medicamentos */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Medicamentos Recetados
                      </label>
                      <Textarea
                        rows={3}
                        value={form.medicamentos_recetados}
                        onChange={e => handleFormChange("medicamentos_recetados", e.target.value)}
                        placeholder="Medicamentos, dosis e instrucciones..."
                        className="text-sm resize-none rounded-xl"
                      />
                    </div>

                    {/* Próxima cita */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" /> Próxima Cita Sugerida
                      </label>
                      <Input
                        type="date"
                        value={form.proxima_cita}
                        onChange={e => handleFormChange("proxima_cita", e.target.value)}
                        className="text-sm rounded-xl h-10 w-48"
                      />
                    </div>

                    {/* Notas privadas */}
                    <div>
                      <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                        <Lock className="w-3 h-3" /> Notas Privadas — solo visible para vos
                      </label>
                      <Textarea
                        rows={3}
                        value={form.notas_privadas}
                        onChange={e => handleFormChange("notas_privadas", e.target.value)}
                        placeholder="Observaciones privadas, recordatorios internos..."
                        className="text-sm resize-none rounded-xl bg-amber-50 border-amber-200 focus:ring-amber-200 no-print"
                      />
                    </div>

                    {/* ── AI Section ── */}
                    <div className="border border-purple-200 rounded-2xl overflow-hidden no-print">
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-900 text-sm">Asistente IA Clínico</span>
                        </div>
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white h-7 text-xs gap-1.5 px-3"
                          onClick={sugerirIA}
                          disabled={loadingIA}
                        >
                          {loadingIA ? (
                            <><Clock className="w-3 h-3 animate-spin" /> Analizando...</>
                          ) : (
                            <><Sparkles className="w-3 h-3" /> Sugerir con IA</>
                          )}
                        </Button>
                      </div>

                      {iaSug && (
                        <div className="p-4 space-y-3">
                          {/* Diagnóstico sugerido */}
                          <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Diagnóstico sugerido</p>
                              <p className="text-sm text-gray-800">{iaSug.diagnostico_sugerido}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-blue-600 border-blue-200 flex-shrink-0"
                              onClick={() => {
                                handleFormChange("diagnostico", iaSug.diagnostico_sugerido);
                                toast({ title: "Aplicado", description: "Diagnóstico copiado al formulario." });
                              }}
                            >
                              Aplicar
                            </Button>
                          </div>

                          {/* CIE-10 */}
                          <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Código CIE-10</p>
                              <p className="text-sm font-mono text-gray-800">{iaSug.codigo_cie10}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-blue-600 border-blue-200 flex-shrink-0"
                              onClick={() => {
                                handleFormChange("codigo_cie10", iaSug.codigo_cie10);
                                toast({ title: "Aplicado", description: "Código CIE-10 copiado." });
                              }}
                            >
                              Aplicar
                            </Button>
                          </div>

                          {/* Plan de tratamiento */}
                          <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Plan de tratamiento</p>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{iaSug.plan_tratamiento}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-blue-600 border-blue-200 flex-shrink-0"
                              onClick={() => {
                                handleFormChange("plan_tratamiento", iaSug.plan_tratamiento);
                                toast({ title: "Aplicado", description: "Plan de tratamiento copiado." });
                              }}
                            >
                              Aplicar
                            </Button>
                          </div>

                          {/* Medicamentos */}
                          {iaSug.medicamentos && (
                            <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Medicamentos sugeridos</p>
                                <p className="text-sm text-gray-800">{iaSug.medicamentos}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-blue-600 border-blue-200 flex-shrink-0"
                                onClick={() => {
                                  handleFormChange("medicamentos_recetados", iaSug.medicamentos);
                                  toast({ title: "Aplicado", description: "Medicamentos copiados." });
                                }}
                              >
                                Aplicar
                              </Button>
                            </div>
                          )}

                          {/* Disclaimer */}
                          <div className="flex items-start gap-2 text-xs text-gray-400 px-1">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                            <p>{iaSug.advertencia || "Sugerencia de IA — el médico debe confirmar el diagnóstico y tratamiento."}</p>
                          </div>

                          {/* Dismiss */}
                          <button
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            onClick={() => setIaSug(null)}
                          >
                            <X className="w-3 h-3" /> Descartar sugerencias
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Save as template */}
                    <div className="no-print pb-4">
                      <button
                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1.5 underline underline-offset-2"
                        onClick={guardarComoPlantilla}
                      >
                        <Clipboard className="w-3 h-3" /> Guardar como plantilla personalizada
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NOA Floating Button ── */}
      {activeNota && (
        <button
          onClick={noaOpen ? closeNoa : openNoa}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 no-print"
          style={{
            background: noaState === "recording"
              ? "linear-gradient(135deg,#ef4444,#dc2626)"
              : "linear-gradient(135deg,#6366f1,#4f46e5)",
          }}
          title="iMed NOA — Asistente de Voz"
        >
          {noaState === "recording" ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : noaState === "transcribing" || noaState === "analyzing" ? (
            <Radio className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      )}

      {/* ── NOA Modal ── */}
      {noaOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 no-print">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeNoa} />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">iMed NOA</p>
                  <p className="text-indigo-200 text-xs">Asistente de Voz con IA</p>
                </div>
              </div>
              <button onClick={closeNoa} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* ── IDLE state ── */}
              {noaState === "idle" && !noaResult && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                    <Mic className="w-10 h-10 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Dictá la consulta</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Hablá con normalidad durante la consulta. NOA transcribirá y llenará el formulario automáticamente.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-500">
                    <div className="bg-indigo-50 rounded-xl p-3 text-center">
                      <p className="font-semibold text-indigo-700">Motivo</p>
                      <p>detectado</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-3 text-center">
                      <p className="font-semibold text-indigo-700">Diagnóstico</p>
                      <p>+ CIE-10</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-3 text-center">
                      <p className="font-semibold text-indigo-700">Plan</p>
                      <p>+ medicamentos</p>
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-xl h-12 text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white" }}
                    onClick={startRecording}
                  >
                    <Mic className="w-4 h-4 mr-2" /> Iniciar grabación
                  </Button>
                </div>
              )}

              {/* ── RECORDING state ── */}
              {noaState === "recording" && (
                <div className="space-y-4">
                  {/* Timer + waveform */}
                  <div className="bg-red-50 rounded-2xl p-4 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-700 font-mono text-lg font-bold">{fmtTime(noaTimer)}</span>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={340}
                      height={48}
                      className="w-full rounded-xl"
                      style={{ background: "rgba(239,68,68,0.08)" }}
                    />
                    <p className="text-xs text-red-600">
                      {noaChunkPending ? "Transcribiendo fragmento..." : "Hablá con naturalidad..."}
                    </p>
                  </div>

                  {/* Live transcript */}
                  {liveTranscript && (
                    <div
                      ref={transcriptPanelRef}
                      className="max-h-40 overflow-y-auto rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700 leading-relaxed"
                    >
                      {liveTranscript}
                    </div>
                  )}

                  <Button
                    className="w-full rounded-xl h-12 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white"
                    onClick={stopRecording}
                  >
                    <MicOff className="w-4 h-4 mr-2" /> Detener y analizar
                  </Button>
                </div>
              )}

              {/* ── TRANSCRIBING state ── */}
              {noaState === "transcribing" && (
                <div className="text-center py-6 space-y-3">
                  <Radio className="w-10 h-10 text-indigo-500 animate-pulse mx-auto" />
                  <p className="font-semibold text-gray-700">Transcribiendo audio...</p>
                  <p className="text-sm text-gray-400">Groq Whisper procesando tu grabación</p>
                  {liveTranscript && (
                    <div className="text-left bg-gray-50 rounded-xl p-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
                      {liveTranscript}
                    </div>
                  )}
                </div>
              )}

              {/* ── ANALYZING state ── */}
              {noaState === "analyzing" && (
                <div className="text-center py-6 space-y-3">
                  <Brain className="w-10 h-10 text-indigo-500 animate-pulse mx-auto" />
                  <p className="font-semibold text-gray-700">Analizando con IA...</p>
                  <p className="text-sm text-gray-400">Extrayendo datos clínicos de la transcripción</p>
                  <div className="space-y-1.5 text-left">
                    {["Motivo de consulta", "Diagnóstico + CIE-10", "Plan de tratamiento", "Medicamentos"].map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── DONE state ── */}
              {noaState === "done" && noaResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-3 py-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm font-semibold">Análisis completado</p>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {[
                      { key: "motivo_consulta", label: "Motivo de consulta" },
                      { key: "diagnostico", label: "Diagnóstico" },
                      { key: "codigo_cie10", label: "Código CIE-10" },
                      { key: "plan_tratamiento", label: "Plan de tratamiento" },
                      { key: "medicamentos_recetados", label: "Medicamentos" },
                      { key: "proxima_cita", label: "Próxima cita" },
                    ]
                      .filter(f => noaResult[f.key])
                      .map(f => (
                        <div key={f.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">{f.label}</p>
                          <p className="text-sm text-gray-800 line-clamp-2">{noaResult[f.key]}</p>
                        </div>
                      ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl h-11 text-sm"
                      onClick={() => { setNoaState("idle"); setNoaResult(null); setLiveTranscript(""); transcriptRef.current = ""; }}
                    >
                      Descartar
                    </Button>
                    <Button
                      className="rounded-xl h-11 text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "white" }}
                      onClick={() => { applyNoaResult(); closeNoa(); }}
                    >
                      <Wand2 className="w-4 h-4 mr-1.5" /> Aplicar al formulario
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
