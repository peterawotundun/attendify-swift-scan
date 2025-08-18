-- Update attendance record to use correct RFID format and link to existing profile
UPDATE attendance_records 
SET rfid_scan = 'F25F58F8',
    student_id = 'cfa506b9-0919-4976-a911-db8e448501f1'
WHERE rfid_scan = 'F2 5F 58 F8';

-- Also add the user to students table if not already there
INSERT INTO students (id, name, matric_number, rfid_code, department, email)
SELECT 
  id,
  full_name,
  matric_number,
  rfid_code,
  department,
  NULL
FROM profiles 
WHERE rfid_code = 'F25F58F8'
ON CONFLICT (rfid_code) DO UPDATE SET
  name = EXCLUDED.name,
  matric_number = EXCLUDED.matric_number,
  department = EXCLUDED.department;