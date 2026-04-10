-- ============================================================
-- iMed Guatemala — Migración: Telemedicina + Empresas + Epidemiología
-- Fecha: 2026-04-10
-- ============================================================

-- 1. VIDEO_CONSULTAS — registra salas Daily.co por cita
CREATE TABLE IF NOT EXISTS video_consultas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id     UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  room_url    TEXT NOT NULL,
  room_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  duracion    INTEGER DEFAULT 120, -- minutos máximo
  estado      TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada'))
);

ALTER TABLE video_consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propias video_consultas"
  ON video_consultas FOR SELECT
  USING (
    cita_id IN (
      SELECT id FROM citas
      WHERE doctor_id = auth.uid() OR paciente_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios crean video_consultas de sus citas"
  ON video_consultas FOR INSERT
  WITH CHECK (
    cita_id IN (
      SELECT id FROM citas
      WHERE doctor_id = auth.uid() OR paciente_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_video_consultas_cita_id ON video_consultas(cita_id);

-- 2. EMPRESAS_CLIENTES — leads y clientes B2B
CREATE TABLE IF NOT EXISTS empresas_clientes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  contacto    TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  empleados   INTEGER,
  plan        TEXT DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise')),
  estado      TEXT DEFAULT 'lead' CHECK (estado IN ('lead', 'activo', 'inactivo')),
  notas       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE empresas_clientes ENABLE ROW LEVEL SECURITY;

-- Solo admins ven los leads empresariales (por email)
CREATE POLICY "Solo admins ven empresas_clientes"
  ON empresas_clientes FOR SELECT
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('totessi.10@gmail.com', 'luisan.cabrera@gmail.com')
  );

-- Cualquiera puede insertar (formulario público de contacto)
CREATE POLICY "Inserción pública de leads"
  ON empresas_clientes FOR INSERT
  WITH CHECK (true);

-- 3. EPIDEMIOLOGIA_DEPARTAMENTOS — datos de enfermedades por departamento
CREATE TABLE IF NOT EXISTS epidemiologia_departamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento    TEXT NOT NULL UNIQUE,
  lat             DECIMAL(10, 6) NOT NULL,
  lng             DECIMAL(10, 6) NOT NULL,
  casos_semana    INTEGER DEFAULT 0,
  nivel           TEXT DEFAULT 'bajo' CHECK (nivel IN ('bajo', 'moderado', 'alto')),
  top_enfermedad  TEXT,
  poblacion       INTEGER,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE epidemiologia_departamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Epidemiología es pública"
  ON epidemiologia_departamentos FOR SELECT
  USING (true);

-- Seed: 22 departamentos de Guatemala con datos demo realistas
INSERT INTO epidemiologia_departamentos (departamento, lat, lng, casos_semana, nivel, top_enfermedad, poblacion) VALUES
  ('Guatemala',        14.6349, -90.5069, 312, 'alto',      'Infecciones respiratorias', 3257616),
  ('Alta Verapaz',     15.4667, -90.3667, 187, 'moderado',  'Diarrea aguda',             1300000),
  ('Baja Verapaz',     15.1167, -90.3167,  48, 'bajo',      'Hipertensión arterial',      275000),
  ('Chimaltenango',    14.6617, -90.8194,  93, 'moderado',  'Infecciones respiratorias',  700000),
  ('Chiquimula',       14.7917, -89.5497,  76, 'moderado',  'Diarrea aguda',              390000),
  ('El Progreso',      14.9500, -90.0667,  29, 'bajo',      'Hipertensión arterial',      161000),
  ('Escuintla',        14.3062, -90.7862, 134, 'alto',      'Dengue',                     747000),
  ('Huehuetenango',    15.3197, -91.4714, 145, 'moderado',  'Infecciones respiratorias', 1200000),
  ('Izabal',           15.7333, -88.9167,  98, 'moderado',  'Dengue',                     450000),
  ('Jalapa',           14.6333, -89.9833,  41, 'bajo',      'Hipertensión arterial',      320000),
  ('Jutiapa',          14.2942, -89.8942,  62, 'moderado',  'Diarrea aguda',              450000),
  ('Petén',            16.9167, -89.8833,  55, 'bajo',      'Malaria',                    700000),
  ('Quetzaltenango',   14.8333, -91.5167, 178, 'moderado',  'Infecciones respiratorias',  900000),
  ('Quiché',           15.0333, -91.1500, 112, 'moderado',  'Diarrea aguda',              900000),
  ('Retalhuleu',       14.5389, -91.6819,  67, 'moderado',  'Dengue',                     340000),
  ('Sacatepéquez',     14.5597, -90.7347,  89, 'moderado',  'Infecciones respiratorias',  340000),
  ('San Marcos',       14.9667, -91.7833, 118, 'moderado',  'Infecciones respiratorias', 1100000),
  ('Santa Rosa',       14.3167, -90.3000,  43, 'bajo',      'Hipertensión arterial',      380000),
  ('Sololá',           14.7750, -91.1833,  71, 'moderado',  'Diarrea aguda',              500000),
  ('Suchitepéquez',    14.5333, -91.5167,  88, 'moderado',  'Dengue',                     560000),
  ('Totonicapán',      14.9167, -91.3667,  59, 'bajo',      'Infecciones respiratorias',  490000),
  ('Zacapa',           14.9667, -89.5333,  44, 'bajo',      'Dengue',                     230000)
ON CONFLICT (departamento) DO NOTHING;

-- 4. legal_consent columns (por si no fueron aplicadas aún)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS terminos_aceptados_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terminos_version TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
