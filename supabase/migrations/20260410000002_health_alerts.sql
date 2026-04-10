-- ============================================================
-- iMed Guatemala — Migración: health_alerts
-- Sistema de alertas inteligentes de salud personalizadas
-- ============================================================

CREATE TABLE IF NOT EXISTS health_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,   -- 'preventivo' | 'medicamento' | 'epidemia' | 'imc' | 'chequeo'
  mensaje     TEXT NOT NULL,
  urgencia    TEXT NOT NULL DEFAULT 'info' CHECK (urgencia IN ('info', 'warning', 'danger')),
  leida       BOOLEAN DEFAULT false,
  ocultar     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes ven sus propias alertas"
  ON health_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Pacientes actualizan sus alertas"
  ON health_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema puede insertar alertas"
  ON health_alerts FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_health_alerts_user_id  ON health_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_created  ON health_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_alerts_leida    ON health_alerts(user_id, leida);
