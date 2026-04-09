-- Referencias Médicas: permite a doctores referir pacientes a especialistas
CREATE TABLE IF NOT EXISTS referencias_medicas (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_origen_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cita_id             uuid REFERENCES citas(id) ON DELETE SET NULL,
  especialidad_destino text NOT NULL,
  motivo              text NOT NULL,
  nota_adicional      text,
  estado              text NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'vista', 'completada')),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referencias_paciente   ON referencias_medicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_referencias_doctor      ON referencias_medicas(doctor_origen_id);
CREATE INDEX IF NOT EXISTS idx_referencias_created_at  ON referencias_medicas(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_referencias_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_referencias_updated_at
  BEFORE UPDATE ON referencias_medicas
  FOR EACH ROW EXECUTE FUNCTION update_referencias_updated_at();

-- RLS
ALTER TABLE referencias_medicas ENABLE ROW LEVEL SECURITY;

-- Doctor puede ver y crear sus propias referencias
CREATE POLICY "doctor_refs_all" ON referencias_medicas
  FOR ALL USING (doctor_origen_id = auth.uid());

-- Paciente puede ver las referencias que le enviaron
CREATE POLICY "patient_refs_select" ON referencias_medicas
  FOR SELECT USING (paciente_id = auth.uid());

-- Paciente puede actualizar estado a 'vista'
CREATE POLICY "patient_refs_update_vista" ON referencias_medicas
  FOR UPDATE USING (paciente_id = auth.uid())
  WITH CHECK (estado = 'vista');
