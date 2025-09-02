-- Create function to sync profile data to students table
CREATE OR REPLACE FUNCTION public.sync_profile_to_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update student record with profile data
  INSERT INTO public.students (
    id,
    name,
    matric_number,
    rfid_code,
    email,
    department,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.full_name,
    NEW.matric_number,
    NEW.rfid_code,
    (SELECT email FROM auth.users WHERE id = NEW.user_id),
    NEW.department,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    name = NEW.full_name,
    matric_number = NEW.matric_number,
    rfid_code = NEW.rfid_code,
    email = (SELECT email FROM auth.users WHERE id = NEW.user_id),
    department = NEW.department,
    updated_at = NEW.updated_at;
    
  RETURN NEW;
END;
$$;

-- Create trigger to sync profile data to students table
CREATE TRIGGER sync_profile_to_student_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_student();