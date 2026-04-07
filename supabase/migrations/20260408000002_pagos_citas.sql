-- ============================================================
-- iMed Guatemala — Pagos de Citas (Wompi)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pagos_citas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id         uuid REFERENCES public.citas(id) ON DELETE CASCADE,
  paciente_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monto           integer NOT NULL,        -- en quetzales
  moneda          text NOT NULL DEFAULT 'GTQ',
  referencia_wompi text,                   -- transaction ID de Wompi
  estado          text NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente','completado','fallido')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pagos_citas_paciente_idx ON public.pagos_citas (paciente_id);
CREATE INDEX IF NOT EXISTS pagos_citas_cita_idx     ON public.pagos_citas (cita_id);

ALTER TABLE public.pagos_citas ENABLE ROW LEVEL SECURITY;

-- Paciente puede ver sus propios pagos
CREATE POLICY "pagos_paciente_read" ON public.pagos_citas
  FOR SELECT USING (auth.uid() = paciente_id);

-- Paciente puede insertar pagos
CREATE POLICY "pagos_paciente_insert" ON public.pagos_citas
  FOR INSERT WITH CHECK (auth.uid() = paciente_id);

-- Doctor puede ver pagos de sus citas
CREATE POLICY "pagos_doctor_read" ON public.pagos_citas
  FOR SELECT USING (auth.uid() = doctor_id);

-- Asegurar que precio_consulta existe como integer en doctor_profiles
-- (Si ya existe como numeric, no hace nada gracias al IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'doctor_profiles'
      AND column_name  = 'precio_consulta'
  ) THEN
    ALTER TABLE public.doctor_profiles ADD COLUMN precio_consulta integer;
  END IF;
END $$;
