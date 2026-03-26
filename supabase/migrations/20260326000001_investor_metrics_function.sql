-- Function to return platform metrics for authorized investors only
-- Uses SECURITY DEFINER to bypass RLS and read aggregate counts

CREATE OR REPLACE FUNCTION public.get_investor_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized_emails TEXT[] := ARRAY['totessi.10@gmail.com', 'luisan.cabrera@gmail.com'];
  caller_email TEXT;
  result JSON;
BEGIN
  -- Resolve caller email from auth.users
  SELECT email INTO caller_email
  FROM auth.users
  WHERE id = auth.uid();

  IF NOT (caller_email = ANY(authorized_emails)) THEN
    RAISE EXCEPTION 'Unauthorized: access restricted to investors';
  END IF;

  SELECT json_build_object(
    'total_usuarios',        (SELECT COUNT(*) FROM public.profiles),
    'citas_hoy',             (SELECT COUNT(*) FROM public.citas WHERE fecha::date = CURRENT_DATE),
    'citas_total',           (SELECT COUNT(*) FROM public.citas),
    'medicine_scans',        (SELECT COUNT(*) FROM public.medicine_scans),
    'documentos',            (SELECT COUNT(*) FROM public.documentos_medicos),
    'doctores',              (SELECT COUNT(*) FROM public.doctor_profiles),
    'farmacias',             (SELECT COUNT(*) FROM public.profiles WHERE role::TEXT = 'pharmacy'),
    'opiniones_verificadas', (SELECT COUNT(*) FROM public.opiniones WHERE verificado = true)
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute to authenticated users (the function itself enforces the email whitelist)
GRANT EXECUTE ON FUNCTION public.get_investor_metrics() TO authenticated;
