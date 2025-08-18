-- First add the user to students table
INSERT INTO students (id, name, matric_number, rfid_code, department, email)
VALUES (
  'cfa506b9-0919-4976-a911-db8e448501f1',
  'Petet Awotundun',
  '2022/1/86897ET',
  'F25F58F8',
  'Computer Science',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  matric_number = EXCLUDED.matric_number,
  rfid_code = EXCLUDED.rfid_code,
  department = EXCLUDED.department;

-- Then update attendance record to use correct RFID format and link to user
UPDATE attendance_records 
SET rfid_scan = 'F25F58F8',
    student_id = 'cfa506b9-0919-4976-a911-db8e448501f1'
WHERE rfid_scan = 'F2 5F 58 F8';