-- Add student for RFID 4D E4 31 46 (normalize to no spaces)
INSERT INTO students (name, matric_number, rfid_code, department, email)
VALUES (
  'Student 4DE43146',
  'MAT-4DE43146',
  '4DE43146',
  'Computer Science',
  NULL
)
ON CONFLICT (rfid_code) DO NOTHING;

-- Update attendance records missing session_id and student_id
UPDATE attendance_records 
SET 
  session_id = '9e9a9a63-3d7f-419d-b37f-5dfa814a95d3',
  student_id = (SELECT id FROM students WHERE rfid_code = '4DE43146'),
  rfid_scan = '4DE43146'
WHERE rfid_scan = '4D E4 31 46' AND session_id IS NULL;

-- Also update any other records with spaces in RFID codes to normalized format
UPDATE attendance_records 
SET rfid_scan = REPLACE(rfid_scan, ' ', '')
WHERE rfid_scan LIKE '% %';