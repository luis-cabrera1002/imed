-- Create opiniones table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.opiniones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL,
  paciente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cita_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  verificado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, paciente_id)
);

-- Add cita_id column if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opiniones' AND column_name = 'cita_id'
  ) THEN
    ALTER TABLE public.opiniones ADD COLUMN cita_id UUID;
  END IF;
END $$;

-- Add verificado column if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'opiniones' AND column_name = 'verificado'
  ) THEN
    ALTER TABLE public.opiniones ADD COLUMN verificado BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add FK constraint for cita_id if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public' AND tc.table_name = 'opiniones'
      AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'cita_id'
  ) THEN
    ALTER TABLE public.opiniones
      ADD CONSTRAINT opiniones_cita_id_fkey
      FOREIGN KEY (cita_id) REFERENCES public.citas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Mark existing opinions without cita_id as not verified
UPDATE public.opiniones SET verificado = false WHERE cita_id IS NULL AND verificado IS NULL;

-- Enable RLS
ALTER TABLE public.opiniones ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Opiniones son públicas" ON public.opiniones;
DROP POLICY IF EXISTS "Pacientes pueden opinar" ON public.opiniones;
DROP POLICY IF EXISTS "Anyone can read opiniones" ON public.opiniones;
DROP POLICY IF EXISTS "Authenticated users can insert opiniones" ON public.opiniones;
DROP POLICY IF EXISTS "Solo pacientes con cita completada pueden opinar" ON public.opiniones;

-- Anyone can read opiniones
CREATE POLICY "Anyone can read opiniones"
  ON public.opiniones
  FOR SELECT
  USING (true);

-- Only patients with a completed appointment with that doctor can insert
-- The cita_id is required and must reference a completed appointment belonging to the patient
CREATE POLICY "Solo pacientes con cita completada pueden opinar"
  ON public.opiniones
  FOR INSERT
  WITH CHECK (
    auth.uid() = paciente_id
    AND cita_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.citas c
      WHERE c.id = cita_id
        AND c.paciente_id = auth.uid()
        AND c.doctor_id = opiniones.doctor_id
        AND c.estado = 'completada'
    )
  );
