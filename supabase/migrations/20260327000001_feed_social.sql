-- ============================================================
-- iMed Guatemala — Feed Social
-- ============================================================

-- TABLAS

CREATE TABLE IF NOT EXISTS public.feed_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo        text NOT NULL,
  contenido     text NOT NULL,
  categoria     text NOT NULL DEFAULT 'salud'
                  CHECK (categoria IN ('salud','medicamentos','investigacion','consejos','noticias','otro')),
  imagen_url    text,
  likes_count   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feed_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.feed_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  contenido  text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS feed_posts_created_idx    ON public.feed_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS feed_posts_categoria_idx  ON public.feed_posts (categoria);
CREATE INDEX IF NOT EXISTS feed_likes_post_idx       ON public.feed_likes (post_id);
CREATE INDEX IF NOT EXISTS feed_comments_post_idx    ON public.feed_comments (post_id);

-- RLS
ALTER TABLE public.feed_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments  ENABLE ROW LEVEL SECURITY;

-- feed_posts: todos pueden leer, autenticados pueden crear los suyos
CREATE POLICY "feed_posts_select" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "feed_posts_insert" ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_posts_delete" ON public.feed_posts FOR DELETE USING (auth.uid() = user_id);

-- feed_likes: todos leen, autenticado crea/borra el suyo
CREATE POLICY "feed_likes_select" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "feed_likes_insert" ON public.feed_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_likes_delete" ON public.feed_likes FOR DELETE USING (auth.uid() = user_id);

-- feed_comments: todos leen, autenticado crea/borra el suyo
CREATE POLICY "feed_comments_select" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "feed_comments_insert" ON public.feed_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_comments_delete" ON public.feed_comments FOR DELETE USING (auth.uid() = user_id);

-- Función para incrementar/decrementar likes_count de forma segura
CREATE OR REPLACE FUNCTION public.toggle_feed_like(p_post_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_new_count integer;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM feed_likes WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM feed_likes WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE feed_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_post_id
      RETURNING likes_count INTO v_new_count;
    RETURN jsonb_build_object('liked', false, 'likes_count', v_new_count);
  ELSE
    INSERT INTO feed_likes (user_id, post_id) VALUES (p_user_id, p_post_id)
      ON CONFLICT DO NOTHING;
    UPDATE feed_posts SET likes_count = likes_count + 1 WHERE id = p_post_id
      RETURNING likes_count INTO v_new_count;
    RETURN jsonb_build_object('liked', true, 'likes_count', v_new_count);
  END IF;
END;
$$;

-- ============================================================
-- SEED DATA — 8 publicaciones demo variadas
-- Usamos un user_id ficticio que no romperá FK porque insertamos
-- directamente como SECURITY DEFINER no pasa RLS.
-- Alternativa segura: insertar con un UUID "anónimo" en profiles.
-- Para el seed usamos una función para obtener cualquier user existente
-- o el primer usuario de la plataforma.
-- ============================================================

DO $$
DECLARE
  v_uid uuid;
BEGIN
  -- Tomar el primer usuario existente para los posts demo
  SELECT id INTO v_uid FROM auth.users LIMIT 1;
  IF v_uid IS NULL THEN RETURN; END IF;

  INSERT INTO public.feed_posts (user_id, titulo, contenido, categoria, likes_count, created_at) VALUES

  (v_uid,
   'La importancia de la hidratación en el clima de Guatemala',
   'Guatemala, con su clima tropical, nos exige mantenernos hidratados durante todo el día. Se recomienda consumir entre 2 y 3 litros de agua diariamente. La deshidratación puede causar dolores de cabeza, fatiga y baja concentración. Llevá siempre una botella de agua y evitá bebidas azucaradas como sustituto.',
   'salud', 47,
   now() - interval '2 hours'),

  (v_uid,
   'Nuevo tratamiento para diabetes tipo 2 — Actualización 2026',
   'Recientemente la FDA aprobó semaglutida oral para el manejo de diabetes tipo 2. En ensayos clínicos mostró una reducción del 15% en hemoglobina glicosilada. Como médicos debemos estar al tanto de estas opciones para ofrecer el mejor tratamiento a nuestros pacientes guatemaltecos.',
   'investigacion', 89,
   now() - interval '5 hours'),

  (v_uid,
   'Disponibilidad: Metformina 850mg ahora en stock',
   'Buenas noticias para nuestros pacientes con diabetes. Contamos con disponibilidad completa de Metformina 850mg, Losartán 50mg y Atorvastatina 20mg. Precio preferencial para pacientes de iMed. Visitanos en zona 10 o consultá en la app.',
   'medicamentos', 34,
   now() - interval '8 hours'),

  (v_uid,
   '5 señales de alerta que no debes ignorar',
   '1. Dolor en el pecho que irradia al brazo izquierdo — posible infarto. 2. Visión doble repentina — puede indicar ACV. 3. Dificultad para respirar sin causa aparente. 4. Fiebre mayor a 39°C por más de 3 días. 5. Pérdida de peso sin razón conocida. Si experimentás alguno de estos síntomas, buscá atención médica inmediata.',
   'consejos', 112,
   now() - interval '1 day'),

  (v_uid,
   'Guatemala avanza en telemedicina: iMed entre los líderes',
   'El Ministerio de Salud de Guatemala reportó un aumento del 340% en consultas de telemedicina durante 2025. Plataformas como iMed están democratizando el acceso a salud de calidad en áreas rurales del país. Un logro histórico para la salud pública guatemalteca.',
   'noticias', 156,
   now() - interval '2 days'),

  (v_uid,
   'Interacciones medicamentosas que debes conocer',
   'Algunos medicamentos comunes pueden interactuar peligrosamente: 1. Ibuprofeno + Warfarina = riesgo de sangrado. 2. Metformina + Alcohol = riesgo de acidosis. 3. Anticonceptivos + Rifampicina = menor efectividad. 4. Estatinas + Jugo de toronja = mayor toxicidad. Siempre consultá con tu médico antes de combinar medicamentos.',
   'medicamentos', 78,
   now() - interval '3 days'),

  (v_uid,
   'Mi experiencia con el Escáner de Medicamentos de iMed',
   'Quería compartir que usé el escáner de medicamentos para identificar una pastilla que encontré sin etiqueta. En segundos me dio toda la información: nombre, dosis, efectos secundarios y contraindicaciones. Increíble herramienta, especialmente para adultos mayores que manejan varios medicamentos.',
   'consejos', 63,
   now() - interval '4 days'),

  (v_uid,
   'Campaña de vacunación contra influenza — Temporada 2026',
   'El MSPAS lanzó la campaña nacional de vacunación contra influenza estacional. La vacuna está disponible en todos los centros de salud del país de forma gratuita. Grupos prioritarios: adultos mayores de 60 años, niños de 6 meses a 5 años, embarazadas y personal de salud.',
   'noticias', 201,
   now() - interval '5 days')

  ON CONFLICT DO NOTHING;
END $$;
