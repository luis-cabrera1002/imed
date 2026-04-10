-- Agrega campos de consentimiento legal a la tabla profiles
-- Versión de términos aceptados, fecha, y consent de marketing

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS terminos_aceptados_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terminos_version TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.terminos_aceptados_at IS 'Fecha y hora en que el usuario aceptó los Términos y Condiciones';
COMMENT ON COLUMN profiles.terminos_version IS 'Versión de los Términos aceptados (e.g. "1.0")';
COMMENT ON COLUMN profiles.marketing_consent IS 'true si el usuario aceptó recibir comunicaciones de marketing';
