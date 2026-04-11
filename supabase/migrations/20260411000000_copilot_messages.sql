-- ============================================================
-- iMed Guatemala — Migración: copilot_messages
-- Historial de conversaciones con iMed Copilot
-- ============================================================

CREATE TABLE IF NOT EXISTS copilot_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE copilot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios mensajes"
  ON copilot_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus propios mensajes"
  ON copilot_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus propios mensajes"
  ON copilot_messages FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_user_id  ON copilot_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_created  ON copilot_messages(user_id, created_at ASC);
