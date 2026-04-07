-- ============================================================
-- iMed Guatemala — Recetas Digitales con QR
-- ============================================================

CREATE TABLE IF NOT EXISTS public.recetas_digitales (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Cada medicamento: {nombre, dosis, frecuencia, duracion, instrucciones}
  medicamentos jsonb NOT NULL DEFAULT '[]',
  fecha       date NOT NULL DEFAULT current_date,
  estado      text NOT NULL DEFAULT 'activa'
                CHECK (estado IN ('activa','usada','vencida')),
  -- Código único que se codifica en el QR
  qr_code     text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  notas       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recetas_digitales_doctor_idx   ON public.recetas_digitales (doctor_id);
CREATE INDEX IF NOT EXISTS recetas_digitales_paciente_idx ON public.recetas_digitales (paciente_id);
CREATE INDEX IF NOT EXISTS recetas_digitales_qr_idx       ON public.recetas_digitales (qr_code);

ALTER TABLE public.recetas_digitales ENABLE ROW LEVEL SECURITY;

-- Doctor puede crear y leer sus propias recetas
CREATE POLICY "receta_doctor" ON public.recetas_digitales
  USING  (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- Paciente puede leer sus propias recetas
CREATE POLICY "receta_paciente_read" ON public.recetas_digitales
  FOR SELECT USING (auth.uid() = paciente_id);

-- Verificación pública por QR (cualquier autenticado puede leer por qr_code)
CREATE POLICY "receta_qr_verify" ON public.recetas_digitales
  FOR SELECT USING (auth.uid() IS NOT NULL);
