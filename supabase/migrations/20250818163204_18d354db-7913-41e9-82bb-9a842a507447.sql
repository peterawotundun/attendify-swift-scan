-- Add missing columns to attendance_records table
ALTER TABLE attendance_records 
ADD COLUMN session_id UUID REFERENCES attendance_sessions(id),
ADD COLUMN student_id UUID REFERENCES students(id);

-- Update existing records to link to the demo session and students based on RFID
UPDATE attendance_records 
SET session_id = '9e9a9a63-3d7f-419d-b37f-5dfa814a95d3',
    student_id = (
      SELECT id FROM students WHERE rfid_code = attendance_records.rfid_scan LIMIT 1
    )
WHERE session_id IS NULL;