# iMed Guatemala — Contexto Completo para IA / Desarrolladores

> Última actualización: 2026-04-10
> Proyecto en producción en **https://imedgt.app**

---

## Modelo de Negocio

iMed Guatemala es una plataforma digital de salud para el mercado guatemalteco con tres tipos de usuario:

- **Pacientes** — buscan doctores, agendan citas, gestionan su expediente, escanean medicamentos, reciben recordatorios
- **Médicos** — publican perfil, reciben pacientes, escriben notas clínicas con IA (AliMed), emiten recetas digitales con QR, refieren pacientes
- **Farmacias** — aparecen en el mapa con stock en tiempo real, reciben pedidos de recetas

**Ingresos proyectados:** suscripción mensual por doctor ($15-30/mes), comisión por cita agendada, plan premium paciente.

**Inversores:** acceso restringido a `/investors` solo para emails autorizados (`totessi.10@gmail.com`, `luisan.cabrera@gmail.com`).

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Router | React Router v6 |
| State | React useState/useEffect (sin Redux) |
| HTTP / DB client | @supabase/supabase-js v2 |
| Mapas | React-Leaflet + Leaflet |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Backend / DB | Supabase (PostgreSQL + RLS + Auth + Realtime) |
| Edge Functions | Supabase Edge Functions (Deno) |
| IA | Groq API (llama-3.3-70b-versatile, whisper-large-v3, llama-4-scout-17b vision) |
| Deploy | Vercel (producción) |

---

## Arquitectura Supabase — DOS PROYECTOS (crítico)

```
aijuacqdvrbflzwqhmvn  →  Base de datos, Auth, RLS, Storage, Realtime
usmjxdoboaxpbmuoproo  →  Edge Functions exclusivamente
```

**REGLA CRÍTICA:** Toda llamada a Edge Function DEBE usar `functionsClient`, NUNCA `supabase`.

```typescript
// CORRECTO
import { functionsClient } from "@/integrations/supabase/functionsClient";
const { data } = await functionsClient.functions.invoke("symptom-checker", { body: { sintomas } });

// INCORRECTO — usaría el proyecto de DB, no el de funciones
const { data } = await supabase.functions.invoke("symptom-checker", { body: { sintomas } });
```

Ambos clientes están en:
- `src/integrations/supabase/client.ts` — cliente DB/Auth (proyecto aijuacqdvrbflzwqhmvn)
- `src/integrations/supabase/functionsClient.ts` — cliente Edge Functions (proyecto usmjxdoboaxpbmuoproo)

---

## Variables de Entorno

### Vercel (producción — configuradas como encrypted env vars)
```
VITE_SUPABASE_URL         = https://aijuacqdvrbflzwqhmvn.supabase.co
VITE_SUPABASE_ANON_KEY    = (anon key del proyecto DB)
VITE_FUNCTIONS_URL         = https://usmjxdoboaxpbmuoproo.supabase.co
VITE_FUNCTIONS_KEY         = (anon key del proyecto Edge Functions)
VITE_VAPID_PUBLIC_KEY      = BBRWJAHGvYPFNWAMQ8tR1hRgXdIYKvpuJeczPs6CHC-LFgJSegzZpacoxM5Nu28WbzNIekTk_m-q5nGSs9Y3lqY
```

### Local (.env.local)
Solo contiene `VITE_VAPID_PUBLIC_KEY` y el token Vercel OIDC. Las demás vars de Supabase se leen automáticamente en dev porque Vite las tiene en `.env` (o usa las de Vercel pull).

### Edge Functions (Supabase secrets — proyecto usmjxdoboaxpbmuoproo)
```
GROQ_API_KEY    = (key de Groq para todas las funciones IA)
VAPID_PRIVATE_KEY
VAPID_PUBLIC_KEY
```

---

## Roles y Autenticación

```typescript
// src/contexts/AuthContext.tsx
export function getDashboardPath(role: string | null | undefined): string {
  if (role === 'doctor')   return '/doctor-dashboard';
  if (role === 'pharmacy') return '/pharmacy-dashboard';
  return '/patient-dashboard';    // default (patient)
}
```

El rol se guarda en `profiles.role` y en `auth.users.raw_user_meta_data.role`.
Hay un trigger en Supabase (`ensure_auth_trigger`) que crea el perfil automáticamente al registrarse.

**Flujo registro:**
1. Usuario elige rol en `/auth`
2. `supabase.auth.signUp({ options: { data: { role, full_name } } })`
3. Email de confirmación → `/email-confirmado`
4. Login → `getDashboardPath(role)` → dashboard correcto

---

## Páginas y Rutas

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | Index | Público |
| `/auth` | Auth | Público |
| `/email-confirmado` | EmailConfirmado | Público |
| `/onboarding` | Onboarding | Post-registro paciente |
| `/patient-dashboard` | PatientDashboard | Paciente |
| `/doctor-dashboard` | DoctorDashboard | Doctor |
| `/pharmacy-dashboard` | PharmacyDashboard | Farmacia |
| `/expediente` | Expediente | Paciente + Doctor (con `?patient_id=`) |
| `/notas-clinicas` | NotasClinicas | Doctor (con `?cita_id=&paciente_id=&paciente_nombre=`) |
| `/diagnostico-imagen` | DiagnosticoImagen | Todos |
| `/sintomas` | SintomaChecker | Todos |
| `/mapa-farmacias` | MapaFarmacias | Todos |
| `/feed` | Feed | Autenticado |
| `/chat` | Chat | Autenticado (con `?cita=` param) |
| `/mis-recetas` | MyPrescriptions | Paciente |
| `/recordatorio-medicamentos` | RecordatorioMedicamentos | Paciente |
| `/modo-viajero` | ModoViajero | Todos |
| `/escaner-medicamentos` | MedicineScanner | Todos |
| `/investors` | InvestorsDashboard | Solo emails autorizados |
| `/receta/:qr_code` | RecetaVerificacion | Público (farmacias escanean) |
| `/doctores` | Doctors | Público |
| `/doctores/:id` | DoctorDetail | Público |
| `/clinicas` | Clinics | Público |
| `/medicos-bam` | BamDoctors | Público |
| `/agenda-inteligente` | AgendaInteligente | Doctor |
| `/mapa-doctores` | DoctorMap | Público |
| `/citas` | Appointments | Paciente |
| `/mis-citas` | MyAppointments | Paciente |
| `/mi-seguro` | MyInsurance | Paciente |
| `/guia-adultos` | SeniorGuide | Todos |

---

## Edge Functions Deployadas

Todas en el proyecto **usmjxdoboaxpbmuoproo**. Ninguna requiere JWT (`verify_jwt = false` en `supabase/config.toml`).

| Función | Modelo | Descripción |
|---------|--------|-------------|
| `symptom-checker` | llama-3.3-70b-versatile | Analiza síntomas → urgencia, especialidad, condiciones |
| `analyze-medicine` | llama-4-scout-17b-16e-instruct (vision) | Identifica medicamento desde foto |
| `analyze-document` | llama-4-scout-17b-16e-instruct (vision) | Analiza documento médico (resultados, radiografías) |
| `transcribe-consulta` | whisper-large-v3 | Transcribe audio de consulta (recibe base64, retorna texto) |
| `analyze-consulta` | llama-3.3-70b-versatile | Analiza transcripción → llena form de nota clínica (AliMed) |
| `image-diagnosis` | llama-4-scout-17b-16e-instruct (vision) | Diagnóstico por imagen → hallazgos, urgencia, recomendaciones |
| `drug-interactions` | llama-3.3-70b-versatile | Verifica interacciones medicamentosas → graves/moderadas |
| `agenda-inteligente` | llama-3.3-70b-versatile | Sugiere horarios óptimos para el doctor |
| `clinical-notes-ai` | llama-3.3-70b-versatile | (Legacy AliMed — reemplazado por transcribe+analyze) |
| `cita-reminder` | — | Envía recordatorios de citas (CRON) |
| `enviar-email-cita` | — | Email transaccional de confirmación de cita |
| `generar-mensaje-paciente` | llama-3.3-70b-versatile | Genera mensaje personalizado para el paciente |
| `send-push` | — | Envía push notifications web (VAPID) |

**Deploy de una función:**
```bash
npx supabase functions deploy <nombre-funcion> --project-ref usmjxdoboaxpbmuoproo
```

---

## Base de Datos — Tablas Principales

```sql
profiles              -- user_id, full_name, phone, role ('patient'|'doctor'|'pharmacy')
doctor_profiles       -- user_id, especialidad, clinica, bio, precio_consulta, lat, lng, ...
citas                 -- id, doctor_id, paciente_id, fecha, hora, estado, motivo
recetas               -- id, doctor_id, paciente_id, diagnostico, comentarios_doctor
receta_medicamentos   -- id, receta_id, nombre, dosis, frecuencia, duracion, instrucciones
recetas_digitales     -- id, doctor_id, paciente_id, medicamentos (JSONB), qr_code (auto-gen trigger), estado
pedidos_farmacia      -- id, receta_id, paciente_id, farmacia_nombre, estado
prerequisitos_cita    -- id, cita_id, paciente_id, descripcion, completado, urgente
expediente_medico     -- user_id, condiciones[], alergias[], medicamentos_activos[], grupo_sanguineo, peso, altura
notas_clinicas        -- id, doctor_id, paciente_id, cita_id, motivo_consulta, diagnostico, ..., compartida_con_paciente
medicine_scans        -- user_id, nombre, imagen_url, resultado_json
documentos_medicos    -- user_id, nombre, tipo, url, storage_path, descripcion, analisis_ia_json
medication_reminders  -- user_id, medicamento, hora, dias[], activo
farmacia_ubicacion    -- farmacia_id, nombre, direccion, lat, lng
farmacia_stock        -- farmacia_id, medicamento, en_stock (UNIQUE farmacia_id+medicamento)
mensajes_chat         -- cita_id, sender_id, receiver_id, mensaje, leido
feed_posts            -- user_id, titulo, contenido, categoria, likes_count
feed_likes            -- post_id, user_id (UNIQUE)
feed_comments         -- post_id, user_id, contenido
opiniones             -- doctor_id, paciente_id, rating, comentario, verificado, verificado_con (cita_id)
referencias_medicas   -- doctor_origen_id, paciente_id, cita_id, especialidad_destino, motivo, estado
```

**RPCs importantes:**
- `toggle_feed_like(p_post_id, p_user_id)` — toggle like atómico + actualiza likes_count
- `get_investor_metrics()` — métricas agrupadas (solo emails autorizados)

---

## Features Implementadas

### Flujos del Paciente
- [x] Registro y login por rol (paciente/doctor/farmacia)
- [x] Onboarding post-registro (solo pacientes)
- [x] PatientDashboard con Health Score, citas, recetas, escaneos, documentos, perfil
- [x] Expediente médico (condiciones, alergias, medicamentos, grupo sanguíneo, IMC)
- [x] Verificador de interacciones medicamentosas en expediente (≥2 medicamentos)
- [x] Predictor de Riesgo Cardiovascular Framingham (D'Agostino 2008) en expediente
- [x] Scanner de medicamentos con IA (foto → identifica medicamento, equivalentes)
- [x] Análisis de documentos médicos con IA (foto/PDF → explicación en lenguaje simple)
- [x] Recordatorios de medicamentos con días y hora
- [x] Modo Viajero (busca equivalentes de medicamentos por país — 9 medicamentos GT)
- [x] Mis Recetas (recetas clásicas + recetas digitales con QR)
- [x] Chat con doctor por cita (realtime Supabase)
- [x] Notificaciones push web (VAPID)
- [x] Mi Seguro (BAM)
- [x] Referencias médicas recibidas (ve cuando un doctor lo refirió a especialista)

### Flujos del Doctor
- [x] DoctorDashboard con métricas, citas, recetas, notas, opiniones, perfil
- [x] Gestión de citas (confirmar, completar, cancelar)
- [x] **AliMed** — asistente de voz IA durante consulta (graba audio → Whisper → análisis Groq → llena formulario)
- [x] Notas Clínicas con plantillas (general, cardiología, pediatría, ginecología, neurología)
- [x] Recetas digitales con código QR (escaneable en `/receta/:qr_code`)
- [x] Expediente del paciente (vista de solo lectura desde cita)
- [x] Verificador de interacciones medicamentosas en nota clínica
- [x] Predictor de Riesgo Cardiovascular en nota clínica
- [x] Botón "Referir paciente" → modal → guarda en referencias_medicas
- [x] Diagnóstico por Imagen IA (`/diagnostico-imagen`)
- [x] Agenda Inteligente IA (`/agenda-inteligente`)
- [x] Perfil público con ubicación GPS para aparecer en mapa

### Flujos de Farmacia
- [x] PharmacyDashboard con mapa de ubicación y gestión de stock
- [x] Mapa de farmacias público (`/mapa-farmacias`) con búsqueda por medicamento
- [x] Stock en tiempo real (toggle por medicamento)
- [x] Recibir pedidos de recetas de pacientes

### Features Generales / IA
- [x] Symptom Checker (`/sintomas`) — urgencia + especialidad recomendada
- [x] Diagnóstico por Imagen (`/diagnostico-imagen`) — hallazgos, posible diagnóstico, urgencia
- [x] Feed Social médico — publicaciones, likes, comentarios, categorías
- [x] Mapa de doctores (Leaflet con pins)
- [x] Directorio de doctores BAM (`/medicos-bam`)
- [x] Verificación de recetas por QR (`/receta/:qr_code`)
- [x] Dashboard de Inversores con 8 métricas animadas
- [x] Guía para Adultos Mayores
- [x] Reviews verificados (solo pacientes con cita completada pueden opinar)

---

## Features Pendientes / Ideas Futuras

- [ ] **Telemedicina** — videollamada integrada en el chat de cita
- [ ] **Pago en línea** — integración con Visa, BAM, Mastercard para pagar citas
- [ ] **Notificaciones push reales** — el cron `cita-reminder` está, falta activar worker en producción
- [ ] **IA multimodal en chat** — paciente puede enviar fotos al doctor
- [ ] **Historial de versiones del expediente** — auditoría de cambios
- [ ] **Integración con IGSS / IGGS** — sistema público de salud Guatemala
- [ ] **App móvil nativa** — React Native o Capacitor
- [ ] **Facturación electrónica FEL** — para doctores que emiten facturas
- [ ] **Sistema de referencias completo** — el doctor de destino acepta/rechaza referencia
- [ ] **Caché offline** — expediente y recetas disponibles sin internet
- [ ] **Más medicamentos en Modo Viajero** — actualmente 9, meta 200+

---

## AliMed — Asistente de Voz IA (Crítico)

AliMed es el asistente de voz para doctores en `/notas-clinicas`. Es el feature más complejo técnicamente.

### Flujo completo:
1. Doctor hace clic en "🎙️ AliMed"
2. `navigator.mediaDevices.getUserMedia({ audio: true })` — pide micrófono
3. `MediaRecorder` con `timeslice: 30000` — cada 30s dispara `ondataavailable`
4. Cada chunk de audio → `transcribeBlob()` → Edge Function `transcribe-consulta` (Whisper)
5. Al detener: espera `chunkPendingRef` (mutable ref) antes de procesar blob final
6. Si grabación < 30s → `onstop` hace transcripción del blob completo
7. Transcripción acumulada → `analyzeTranscript()` → Edge Function `analyze-consulta` (Groq)
8. Groq devuelve JSON → llena automáticamente todos los campos del formulario

### Patrones críticos anti-bug:
```typescript
// ORDEN CORRECTO al detener grabación:
recorderRef.current.stop();    // 1. Primero stop() → dispara ondataavailable (último chunk)
// stream.getTracks().stop()   // 2. Detener stream SOLO DENTRO de recorder.onstop

// chunkPendingRef = mutable ref para evitar stale closure en onstop
const chunkPendingRef = useRef(false);  // NO usar useState aquí

// iOS: fallback MIME type
const supportedMime = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"]
  .find(t => MediaRecorder.isTypeSupported(t)) || "";

// iOS: AudioContext fallback
const AudioCtxClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;

// Safari: roundRect fallback
if (typeof (ctx as any).roundRect === "function") {
  ctx.roundRect(x, y, w, h, 3); ctx.fill();
} else {
  ctx.fillRect(x, y, w, h);
}
```

---

## Framingham Score — Implementación

`src/components/CardiovascularRisk.tsx` implementa el Score de Framingham General CVD Risk (D'Agostino et al., 2008).

```typescript
// Hombres: F = 3.06117*ln(age) + 1.12370*ln(TC) - 0.93263*ln(HDL) + 1.99881*ln(SBP) + 0.65451*smoke + 0.57367*diab - 23.9802
// S0 = 0.88936
// Riesgo = (1 - S0^exp(F)) * 100

// Mujeres: F = 2.32888*ln(age) + 1.20904*ln(TC) - 0.70833*ln(HDL) + 2.82263*ln(SBP) + 0.52873*smoke + 0.69154*diab - 26.1931
// S0 = 0.95012
```

Categorías: < 10% Bajo (verde), 10-20% Moderado (amarillo), > 20% Alto (rojo).

---

## Migraciones SQL

Todas en `supabase/migrations/`. **DEBEN ejecutarse en orden** en el proyecto `aijuacqdvrbflzwqhmvn`.

| Archivo | Contenido |
|---------|-----------|
| `20251121...sql` | Schema base (profiles, doctor_profiles, citas, etc.) |
| `20260326000000_opiniones_verificadas.sql` | Reviews con verificación por cita completada |
| `20260326000001_investor_metrics_function.sql` | RPC `get_investor_metrics()` |
| `20260326000002_cita_reminder_cron.sql` | CRON para recordatorios de citas |
| `20260326000003_ensure_auth_trigger.sql` | Trigger auto-crea perfil al registrar usuario |
| `20260327000000_farmacia_mapa_y_chat.sql` | Tablas farmacia_ubicacion, farmacia_stock, mensajes_chat + seed 5 farmacias demo |
| `20260327000001_feed_social.sql` | feed_posts, feed_likes, feed_comments + RPC toggle_feed_like |
| `20260408000000_expediente_medico.sql` | Tabla expediente_medico |
| `20260408000001_recetas_digitales.sql` | Tabla recetas_digitales + trigger QR auto-generado |
| `20260408000002_pagos_citas.sql` | Tabla pagos_citas (pendiente integración real) |
| `20260408000003_notas_clinicas.sql` | Tabla notas_clinicas con todas las columnas clínicas |
| `20260409000001_referencias_medicas.sql` | Tabla referencias_medicas + RLS + índices |

**Si una migración no está aplicada**, el feature correspondiente falla silenciosamente (query devuelve null, no crash).

---

## Comandos de Desarrollo

```bash
# Dev local
npm run dev

# Build producción
npm run build

# Deploy a Vercel producción
npx vercel --prod

# Deploy una Edge Function
npx supabase functions deploy <nombre> --project-ref usmjxdoboaxpbmuoproo

# Deploy TODAS las Edge Functions
npx supabase functions deploy --project-ref usmjxdoboaxpbmuoproo
```

---

## Convenciones de Código

### Imports de Supabase
```typescript
import { supabase } from "@/integrations/supabase/client";        // DB, Auth, Storage, Realtime
import { functionsClient } from "@/integrations/supabase/functionsClient"; // Edge Functions
```

### Rutas con parámetros para el Doctor
```typescript
// Desde DoctorDashboard → abre expediente del paciente
navigate(`/expediente?patient_id=${paciente_id}`)

// Desde DoctorDashboard → nueva nota clínica de una cita
navigate(`/notas-clinicas?cita_id=${cita.id}&paciente_id=${paciente_id}&paciente_nombre=${nombre}`)
```

### Roles
```typescript
// Siempre usar getDashboardPath() para redirigir
import { getDashboardPath } from "@/contexts/AuthContext";
navigate(getDashboardPath(profile?.role));
```

### Patrones de carga de datos
```typescript
// Patrón estándar: cargar en paralelo con Promise.all
async function loadData(uid: string) {
  setLoading(true);
  await Promise.all([loadPerfil(uid), loadCitas(uid), loadOtraCosa(uid)]);
  setLoading(false);
}
```

### Unir datos de múltiples tablas (Supabase no soporta JOINs complejos en RLS)
```typescript
// NUNCA hacer: select("*, profiles(*)")  — puede fallar con RLS
// SIEMPRE hacer: dos queries separadas
const { data: citas } = await supabase.from("citas").select("*").eq("doctor_id", uid);
const ids = citas.map(c => c.paciente_id);
const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
// Luego merge en JS
```

---

## Datos Demo / Seed

Las **5 farmacias demo** tienen UUIDs fijos (`00000001-0000-0000-0000-00000000000X`) y aparecen en el mapa de farmacias aunque no haya farmacias registradas. Insertadas en `20260327000000_farmacia_mapa_y_chat.sql`.

**No borrar estas filas** — el mapa quedaría vacío para visitantes nuevos.

---

## Seguridad y RLS

- Todas las tablas tienen RLS habilitado
- Pacientes solo ven sus propios datos
- Doctores ven sus citas y notas, pero NO datos de otros doctores
- El expediente es visible para el propio paciente y para doctores con `?patient_id=` (sin RLS extra — confiar en UI)
- Las Edge Functions no requieren JWT (`verify_jwt = false`) porque reciben datos del frontend ya autenticado
- `get_investor_metrics()` tiene su propio whitelist de emails dentro de la función SQL

---

## Errores Conocidos / Gotchas

1. **`supabase.functions.invoke()` vs `functionsClient.functions.invoke()`** — el error más común. Siempre usar `functionsClient` para edge functions.

2. **Joins anidados con RLS** — `select("*, tabla(*)")` puede devolver null silenciosamente si RLS bloquea. Usar queries separadas.

3. **`noaChunkPending` stale en closure** — en AliMed, usar `chunkPendingRef.current` (mutable ref) dentro de event handlers, nunca leer state de React directamente.

4. **`recorder.stop()` antes de `stream.getTracks().stop()`** — si se hace al revés, el último chunk de audio se pierde.

5. **QR code en recetas digitales** — `qr_code` es generado por trigger en Supabase. Si el trigger no está instalado, `qr_code` es null. El UI maneja esto con fallback visual.

6. **Redirect post-reset-password** — siempre leer el rol del usuario antes de redirigir. NO hardcodear `/patient-dashboard`.

7. **`referencias_medicas` migration** — si no está aplicada, el botón "Referir" y la sección de referencias en PatientDashboard fallan silenciosamente.

---

## Contacto / Acceso

- **Proyecto Vercel:** `imedguate` (owner: `luis-cabrera1002s-projects`)
- **Supabase DB:** proyecto `aijuacqdvrbflzwqhmvn`
- **Supabase Functions:** proyecto `usmjxdoboaxpbmuoproo`
- **Producción:** https://imedgt.app
- **Inversores autorizados:** `totessi.10@gmail.com`, `luisan.cabrera@gmail.com`
