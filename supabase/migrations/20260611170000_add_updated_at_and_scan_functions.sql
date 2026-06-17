-- Alter subscription_usages table to add updated_at
ALTER TABLE public.subscription_usages ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Clean up any duplicate subscription_usages entries just in case before applying unique constraint
DELETE FROM public.subscription_usages a USING public.subscription_usages b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- Add unique constraint on user_id to subscription_usages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_usages_user_id_key'
  ) THEN
    ALTER TABLE public.subscription_usages ADD CONSTRAINT subscription_usages_user_id_key UNIQUE (user_id);
  END IF;
END
$$;

-- Revoke default public execution rights on functions in public schema (we will grant explicitly)
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM public;

-- Create get_or_create_usage function
CREATE OR REPLACE FUNCTION public.get_or_create_usage(owner_uuid uuid, is_free_plan boolean)
RETURNS TABLE (
  res_pdf_upload integer,
  res_qr_scan integer,
  res_created_at timestamptz,
  res_updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_pdf_upload integer;
  v_qr_scan integer;
  v_created_at timestamptz;
  v_updated_at timestamptz;
  v_now timestamptz := now();
  v_last_reset timestamptz;
BEGIN
  -- Security check: only allow matching auth.uid() unless executed by service_role/admin
  IF owner_uuid <> auth.uid() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id, su.pdf_upload, su.qr_scan, su.created_at, su.updated_at
  INTO v_id, v_pdf_upload, v_qr_scan, v_created_at, v_updated_at
  FROM public.subscription_usages su
  WHERE su.user_id = owner_uuid;

  IF v_id IS NULL THEN
    INSERT INTO public.subscription_usages (user_id, pdf_upload, qr_scan, updated_at)
    VALUES (owner_uuid, 0, 0, v_now)
    RETURNING id, subscription_usages.pdf_upload, subscription_usages.qr_scan, subscription_usages.created_at, subscription_usages.updated_at
    INTO v_id, v_pdf_upload, v_qr_scan, v_created_at, v_updated_at;
  END IF;

  v_last_reset := COALESCE(v_updated_at, v_created_at);

  IF is_free_plan AND v_now >= v_last_reset + interval '30 days' THEN
    v_qr_scan := 0;
    v_updated_at := v_now;
    
    UPDATE public.subscription_usages
    SET qr_scan = 0, updated_at = v_now
    WHERE id = v_id;
  END IF;

  RETURN QUERY SELECT v_pdf_upload, v_qr_scan, v_created_at, v_updated_at;
END;
$$;

-- Create track_and_increment_scan function
CREATE OR REPLACE FUNCTION public.track_and_increment_scan(owner_uuid uuid, is_free_plan boolean)
RETURNS TABLE (
  res_qr_scan integer,
  res_last_reset timestamptz,
  res_is_exceeded boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_qr_scan integer;
  v_created_at timestamptz;
  v_updated_at timestamptz;
  v_now timestamptz := now();
  v_last_reset timestamptz;
BEGIN
  -- Get usage record
  SELECT id, su.qr_scan, su.created_at, su.updated_at
  INTO v_id, v_qr_scan, v_created_at, v_updated_at
  FROM public.subscription_usages su
  WHERE su.user_id = owner_uuid;

  -- Create if not exists
  IF v_id IS NULL THEN
    INSERT INTO public.subscription_usages (user_id, pdf_upload, qr_scan, updated_at)
    VALUES (owner_uuid, 0, 0, v_now)
    RETURNING id, subscription_usages.qr_scan, subscription_usages.created_at, subscription_usages.updated_at
    INTO v_id, v_qr_scan, v_created_at, v_updated_at;
  END IF;

  v_last_reset := COALESCE(v_updated_at, v_created_at);

  -- If it is a free plan, check if we need to reset (30 days elapsed)
  IF is_free_plan AND v_now >= v_last_reset + interval '30 days' THEN
    v_qr_scan := 0;
    v_last_reset := v_now;
    
    UPDATE public.subscription_usages
    SET qr_scan = 0, updated_at = v_now
    WHERE id = v_id;
  END IF;

  -- Enforce check: if already exceeded, return true and don't increment
  IF is_free_plan AND v_qr_scan >= 1000 THEN
    RETURN QUERY SELECT v_qr_scan, v_last_reset, true;
    RETURN;
  END IF;

  -- Otherwise, increment and return
  v_qr_scan := v_qr_scan + 1;
  
  UPDATE public.subscription_usages
  SET qr_scan = v_qr_scan
  WHERE id = v_id;

  RETURN QUERY SELECT v_qr_scan, v_last_reset, false;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_usage(uuid, boolean) TO authenticated;
-- Restrict track_and_increment_scan to service_role/admin only
REVOKE EXECUTE ON FUNCTION public.track_and_increment_scan(uuid, boolean) FROM public;
REVOKE EXECUTE ON FUNCTION public.track_and_increment_scan(uuid, boolean) FROM authenticated;
