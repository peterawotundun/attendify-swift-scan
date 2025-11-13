-- Clear all existing data
TRUNCATE TABLE public.attendance_records CASCADE;
TRUNCATE TABLE public.attendance_sessions CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.course_enrollments CASCADE;
TRUNCATE TABLE public.class_schedules CASCADE;
TRUNCATE TABLE public.lecturer_schedule CASCADE;
TRUNCATE TABLE public.classes CASCADE;
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.lecturers CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;

-- Ensure classes table has level field
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT '100';

-- Create automatic enrollment trigger
CREATE OR REPLACE FUNCTION public.auto_enroll_students()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-enroll all students matching department and level
  INSERT INTO public.course_enrollments (student_id, class_id)
  SELECT s.id, NEW.id
  FROM public.students s
  JOIN public.profiles p ON s.id = p.id
  WHERE p.department = NEW.department
    AND p.level = NEW.level
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-enroll students when a class is created
DROP TRIGGER IF EXISTS trigger_auto_enroll_students ON public.classes;
CREATE TRIGGER trigger_auto_enroll_students
AFTER INSERT ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.auto_enroll_students();

-- Function to auto-enroll student in matching courses when they register
CREATE OR REPLACE FUNCTION public.auto_enroll_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is a student
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'student') THEN
    -- Enroll in all classes matching department and level
    INSERT INTO public.course_enrollments (student_id, class_id)
    SELECT NEW.id, c.id
    FROM public.classes c
    WHERE c.department = NEW.department
      AND c.level = NEW.level
      AND c.is_active = true
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-enroll new students in matching courses
DROP TRIGGER IF EXISTS trigger_auto_enroll_new_student ON public.profiles;
CREATE TRIGGER trigger_auto_enroll_new_student
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_enroll_new_student();