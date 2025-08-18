-- Ensure realtime works and student_id auto-populates from RFID

-- 1) Create a function to set student_id from rfid_scan if missing
CREATE OR REPLACE FUNCTION public.set_student_id_from_rfid()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.student_id IS NULL AND NEW.rfid_scan IS NOT NULL THEN
    SELECT s.id INTO NEW.student_id
    FROM public.students s
    WHERE s.rfid_code = NEW.rfid_scan
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Create trigger on attendance_records
DROP TRIGGER IF EXISTS trg_set_student_id_from_rfid ON public.attendance_records;
CREATE TRIGGER trg_set_student_id_from_rfid
BEFORE INSERT ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.set_student_id_from_rfid();

-- 3) Backfill existing rows
UPDATE public.attendance_records ar
SET student_id = s.id
FROM public.students s
WHERE ar.student_id IS NULL
  AND ar.rfid_scan IS NOT NULL
  AND s.rfid_code = ar.rfid_scan;

-- 4) Improve query performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON public.attendance_records(student_id);

-- 5) Ensure realtime captures full rows for updates/inserts
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;

-- 6) Add table to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'attendance_records'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records';
  END IF;
END$$;