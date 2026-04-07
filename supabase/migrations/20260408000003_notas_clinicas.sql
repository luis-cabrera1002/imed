-- ============================================================
-- notas_clinicas: clinical notes written by doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS notas_clinicas (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cita_id                   uuid REFERENCES citas(id) ON DELETE SET NULL,
  motivo_consulta           text,
  examen_fisico             text,
  diagnostico               text,
  codigo_cie10              text,
  plan_tratamiento          text,
  medicamentos_recetados    text,
  proxima_cita              text,
  notas_privadas            text,
  plantilla                 text DEFAULT 'general',
  compartida_con_paciente   boolean DEFAULT false,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- ============================================================
-- plantillas_notas: note templates (system-wide or per-doctor)
-- ============================================================
CREATE TABLE IF NOT EXISTS plantillas_notas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = system template
  nombre        text NOT NULL,
  especialidad  text,
  campos        jsonb NOT NULL DEFAULT '{}',
  is_default    boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- updated_at trigger (reuse existing function if present)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_notas_clinicas ON notas_clinicas;
CREATE TRIGGER set_updated_at_notas_clinicas
  BEFORE UPDATE ON notas_clinicas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE notas_clinicas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_notas  ENABLE ROW LEVEL SECURITY;

-- notas_clinicas: doctor full CRUD on own notes
CREATE POLICY "doctor_select_own_notas" ON notas_clinicas
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "doctor_insert_notas" ON notas_clinicas
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "doctor_update_notas" ON notas_clinicas
  FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "doctor_delete_notas" ON notas_clinicas
  FOR DELETE USING (auth.uid() = doctor_id);

-- notas_clinicas: patient can read notes shared with them
CREATE POLICY "patient_select_shared_notas" ON notas_clinicas
  FOR SELECT USING (
    auth.uid() = paciente_id AND compartida_con_paciente = true
  );

-- plantillas_notas: doctor CRUD own templates
CREATE POLICY "doctor_select_plantillas" ON plantillas_notas
  FOR SELECT USING (
    auth.uid() = doctor_id OR doctor_id IS NULL
  );

CREATE POLICY "doctor_insert_plantillas" ON plantillas_notas
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "doctor_update_plantillas" ON plantillas_notas
  FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "doctor_delete_plantillas" ON plantillas_notas
  FOR DELETE USING (auth.uid() = doctor_id);

-- ============================================================
-- Seed: 5 default system templates (doctor_id = NULL)
-- ============================================================
INSERT INTO plantillas_notas (doctor_id, nombre, especialidad, campos, is_default) VALUES
(
  NULL,
  'Consulta General',
  'Medicina General',
  '{
    "motivo_consulta": "Paciente consulta por:",
    "examen_fisico": "Peso: ___ kg  Talla: ___ cm\nFC: ___ lpm  FR: ___ rpm\nTA: ___/___mmHg  T°: ___°C\nAspecto general:",
    "diagnostico": "",
    "plan_tratamiento": ""
  }',
  true
),
(
  NULL,
  'Cardiología',
  'Cardiología',
  '{
    "motivo_consulta": "Paciente consulta por:",
    "examen_fisico": "FC: ___ lpm\nPA: ___/___mmHg\nRitmo: Regular/Irregular\nSoplos: Presentes/Ausentes\nEdemas: Sí/No\nPulsos periféricos: Normales/Disminuidos",
    "diagnostico": "",
    "plan_tratamiento": ""
  }',
  true
),
(
  NULL,
  'Pediatría',
  'Pediatría',
  '{
    "motivo_consulta": "Paciente pediátrico consulta por:",
    "examen_fisico": "Peso: ___ kg\nTalla: ___ cm\nPC: ___ cm\nDesarrollo: Acorde/No acorde a edad\nVacunas al día: Sí/No\nFontanelas: Cerradas/Abiertas\nReflejo Moro: Presente/Ausente",
    "diagnostico": "",
    "plan_tratamiento": ""
  }',
  true
),
(
  NULL,
  'Ginecología',
  'Ginecología',
  '{
    "motivo_consulta": "Paciente consulta por:",
    "examen_fisico": "FUR: ___\nGesta: ___ Para: ___ Abortos: ___\nFUM: ___\nPapanicolau: ___\nEco transvaginal: ___\nExploración: ",
    "diagnostico": "",
    "plan_tratamiento": ""
  }',
  true
),
(
  NULL,
  'Dermatología',
  'Dermatología',
  '{
    "motivo_consulta": "Paciente consulta por:",
    "examen_fisico": "Lesión: (pápula/mácula/vesícula/placa)\nLocalización: ___\nColoración: ___\nBordes: (bien/mal definidos)\nDistribución: ___\nPrurito: Sí/No\nEvolución: ___ días/semanas",
    "diagnostico": "",
    "plan_tratamiento": ""
  }',
  true
)
ON CONFLICT DO NOTHING;
