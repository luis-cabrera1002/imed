-- ============================================================
-- iMed Guatemala — Expediente Médico Digital
-- ============================================================

CREATE TABLE IF NOT EXISTS public.expediente_medico (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condiciones         text[] NOT NULL DEFAULT '{}',
  alergias            text[] NOT NULL DEFAULT '{}',
  medicamentos_activos text[] NOT NULL DEFAULT '{}',
  grupo_sanguineo     text CHECK (grupo_sanguineo IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','')),
  peso                numeric(5,1),    -- kg
  altura              numeric(5,1),    -- cm
  notas               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS expediente_user_idx ON public.expediente_medico (user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER expediente_updated_at
  BEFORE UPDATE ON public.expediente_medico
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.expediente_medico ENABLE ROW LEVEL SECURITY;

-- Paciente lee y edita su propio expediente
CREATE POLICY "expediente_own" ON public.expediente_medico
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Doctor puede leer el expediente de pacientes con quienes tiene cita
CREATE POLICY "expediente_doctor_read" ON public.expediente_medico
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.citas
      WHERE citas.paciente_id = expediente_medico.user_id
        AND citas.doctor_id   = auth.uid()
    )
  );
