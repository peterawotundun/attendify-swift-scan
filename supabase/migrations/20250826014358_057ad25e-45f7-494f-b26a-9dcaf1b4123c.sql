-- Ensure triggers are set for automatic data integrity
-- 1) Auto-set student_id from RFID on attendance_records inserts
DROP TRIGGER IF EXISTS trigger_set_student_id_from_rfid ON public.attendance_records;
CREATE TRIGGER trigger_set_student_id_from_rfid
BEFORE INSERT ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.set_student_id_from_rfid();

-- 2) Auto-generate session codes for new attendance_sessions
DROP TRIGGER IF EXISTS trigger_auto_generate_session_code ON public.attendance_sessions;
CREATE TRIGGER trigger_auto_generate_session_code
BEFORE INSERT ON public.attendance_sessions
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_session_code();

-- 3) Keep updated_at fresh on mutable tables
DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();