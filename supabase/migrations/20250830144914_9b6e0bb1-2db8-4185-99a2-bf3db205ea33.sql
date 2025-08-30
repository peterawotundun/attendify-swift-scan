-- Fix function search path security issues by setting search_path to 'public'
CREATE OR REPLACE FUNCTION public.set_student_id_from_rfid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.student_id IS NULL AND NEW.rfid_scan IS NOT NULL THEN
    SELECT s.id INTO NEW.student_id
    FROM public.students s
    WHERE s.rfid_code = NEW.rfid_scan
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_session_code(course_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
DECLARE
    result_session_code TEXT;
    counter INTEGER := 1;
    base_code TEXT;
BEGIN
    -- Create base code from course code and current date
    base_code := course_code || '-' || TO_CHAR(NOW(), 'YYYY-MM-DD');
    
    -- Check if base code exists, if so add a counter
    result_session_code := base_code;
    WHILE EXISTS (SELECT 1 FROM public.attendance_sessions WHERE session_code = result_session_code) LOOP
        result_session_code := base_code || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN result_session_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_generate_session_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
DECLARE
    course_code TEXT;
BEGIN
    -- Get the course code from the classes table
    SELECT code INTO course_code 
    FROM public.classes 
    WHERE id = NEW.class_id;
    
    -- Generate session code if not provided
    IF NEW.session_code IS NULL OR NEW.session_code = '' THEN
        NEW.session_code := generate_session_code(course_code);
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;