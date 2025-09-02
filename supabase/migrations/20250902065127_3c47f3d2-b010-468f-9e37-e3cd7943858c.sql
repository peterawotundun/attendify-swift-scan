-- Create helper to normalize RFID codes (remove spaces, uppercase)
CREATE OR REPLACE FUNCTION public.normalize_rfid(rfid text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT UPPER(REPLACE(COALESCE(rfid, ''), ' ', ''))
$$;

-- Trigger function: normalize rfid_scan, set student_id and session_id if missing
CREATE OR REPLACE FUNCTION public.set_attendance_record_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_active_session uuid;
BEGIN
  -- Normalize RFID in the incoming row
  IF NEW.rfid_scan IS NOT NULL THEN
    NEW.rfid_scan := public.normalize_rfid(NEW.rfid_scan);
  END IF;

  -- Set student_id from students.rfid_code if not provided
  IF NEW.student_id IS NULL AND NEW.rfid_scan IS NOT NULL THEN
    SELECT s.id INTO NEW.student_id
    FROM public.students s
    WHERE s.rfid_code = NEW.rfid_scan
    LIMIT 1;
  END IF;

  -- Set session_id to latest active session if not provided
  IF NEW.session_id IS NULL THEN
    SELECT a.id INTO latest_active_session
    FROM public.attendance_sessions a
    WHERE a.is_active = true
    ORDER BY a.created_at DESC
    LIMIT 1;

    IF latest_active_session IS NULL THEN
      -- Fallback to absolute latest session
      SELECT a.id INTO latest_active_session
      FROM public.attendance_sessions a
      ORDER BY a.created_at DESC
      LIMIT 1;
    END IF;

    NEW.session_id := latest_active_session;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on attendance_records
DROP TRIGGER IF EXISTS trg_set_attendance_record_fields ON public.attendance_records;
CREATE TRIGGER trg_set_attendance_record_fields
BEFORE INSERT ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.set_attendance_record_fields();

-- Helpful index for RFID lookups
CREATE INDEX IF NOT EXISTS idx_students_rfid_code ON public.students (rfid_code);
