-- ============================================================
-- MAPA DE FARMACIAS
-- ============================================================

-- Tabla de ubicaciones de farmacias (lat/lng + info de contacto)
CREATE TABLE IF NOT EXISTS public.farmacia_ubicacion (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmacia_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  direccion   TEXT,
  telefono    TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.farmacia_ubicacion ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer ubicaciones
CREATE POLICY "Public read farmacia_ubicacion"
  ON public.farmacia_ubicacion FOR SELECT USING (true);

-- Solo la propia farmacia puede insertar/actualizar su ubicación
CREATE POLICY "Farmacia manages own ubicacion"
  ON public.farmacia_ubicacion FOR ALL
  USING (auth.uid() = farmacia_id)
  WITH CHECK (auth.uid() = farmacia_id);

-- -------------------------------------------------------
-- Stock de medicamentos por farmacia
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmacia_stock (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmacia_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medicamento TEXT NOT NULL,
  en_stock    BOOLEAN NOT NULL DEFAULT true,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(farmacia_id, medicamento)
);

ALTER TABLE public.farmacia_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read farmacia_stock"
  ON public.farmacia_stock FOR SELECT USING (true);

CREATE POLICY "Farmacia manages own stock"
  ON public.farmacia_stock FOR ALL
  USING (auth.uid() = farmacia_id)
  WITH CHECK (auth.uid() = farmacia_id);

-- Trigger updated_at on farmacia_ubicacion
CREATE TRIGGER update_farmacia_ubicacion_updated_at
  BEFORE UPDATE ON public.farmacia_ubicacion
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger updated_at on farmacia_stock
CREATE TRIGGER update_farmacia_stock_updated_at
  BEFORE UPDATE ON public.farmacia_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: algunas farmacias demo en Guatemala City para que el mapa no quede vacío
-- Estas se insertan con un UUID fijo que NO corresponde a usuarios reales
-- (solo para que los inversores y visitantes vean el mapa funcional)
INSERT INTO public.farmacia_ubicacion (id, farmacia_id, nombre, direccion, lat, lng)
VALUES
  ('00000001-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
   'Farmacia Galeno - Zona 10', 'Av. La Reforma 9-55, Zona 10, Guatemala', 14.6055, -90.5121),
  ('00000001-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000002',
   'Farmacia Cruz Verde - Zona 1', '6a Av. 10-55, Zona 1, Guatemala City', 14.6408, -90.5133),
  ('00000001-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000003',
   'Farmacia Universal - Zona 4', '6a Av. 3-65, Zona 4, Guatemala City', 14.6270, -90.5148),
  ('00000001-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000004',
   'Farmacia Batres - Zona 13', 'Blvd. Liberación 7-55, Zona 13', 14.5887, -90.5215),
  ('00000001-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000005',
   'Farmacia Meykos - Zona 15', 'Vía 5, Zona 15, Vista Hermosa', 14.5930, -90.4935)
ON CONFLICT (farmacia_id) DO NOTHING;

-- Seed stock demo para las farmacias demo
INSERT INTO public.farmacia_stock (farmacia_id, medicamento, en_stock)
VALUES
  ('00000001-0000-0000-0000-000000000001', 'Paracetamol 500mg', true),
  ('00000001-0000-0000-0000-000000000001', 'Ibuprofeno 400mg', true),
  ('00000001-0000-0000-0000-000000000001', 'Amoxicilina 500mg', false),
  ('00000001-0000-0000-0000-000000000002', 'Paracetamol 500mg', true),
  ('00000001-0000-0000-0000-000000000002', 'Omeprazol 20mg', true),
  ('00000001-0000-0000-0000-000000000002', 'Metformina 850mg', true),
  ('00000001-0000-0000-0000-000000000003', 'Ibuprofeno 400mg', false),
  ('00000001-0000-0000-0000-000000000003', 'Loratadina 10mg', true),
  ('00000001-0000-0000-0000-000000000004', 'Atorvastatina 20mg', true),
  ('00000001-0000-0000-0000-000000000004', 'Losartán 50mg', true),
  ('00000001-0000-0000-0000-000000000005', 'Paracetamol 500mg', true),
  ('00000001-0000-0000-0000-000000000005', 'Amoxicilina 500mg', true)
ON CONFLICT (farmacia_id, medicamento) DO NOTHING;


-- ============================================================
-- CHAT PACIENTE-DOCTOR
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mensajes_chat (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id     UUID REFERENCES public.citas(id) ON DELETE CASCADE NOT NULL,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mensaje     TEXT NOT NULL,
  leido       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mensajes_chat ENABLE ROW LEVEL SECURITY;

-- Solo el sender o receiver de una cita pueden leer sus mensajes
CREATE POLICY "Chat participants can read messages"
  ON public.mensajes_chat FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Solo el sender puede insertar sus propios mensajes
-- y solo si es paciente o doctor de la cita referenciada
CREATE POLICY "Chat participants can send messages"
  ON public.mensajes_chat FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.citas c
      WHERE c.id = cita_id
        AND (c.paciente_id = auth.uid() OR c.doctor_id = auth.uid())
    )
  );

-- Receiver puede marcar como leído
CREATE POLICY "Receiver can mark messages as read"
  ON public.mensajes_chat FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Habilitar Realtime en mensajes_chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_chat;
