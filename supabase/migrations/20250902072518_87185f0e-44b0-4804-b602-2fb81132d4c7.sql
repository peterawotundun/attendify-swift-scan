-- Sync existing profile data to students table
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
SELECT 
  p.id,
  p.full_name,
  p.matric_number,
  p.rfid_code,
  u.email,
  p.department,
  p.created_at,
  p.updated_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  matric_number = EXCLUDED.matric_number,
  rfid_code = EXCLUDED.rfid_code,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  updated_at = EXCLUDED.updated_at;