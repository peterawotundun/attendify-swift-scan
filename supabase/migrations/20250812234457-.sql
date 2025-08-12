-- Enable realtime for attendance_records table
ALTER TABLE attendance_records REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
SELECT supabase_realtime.add_table('attendance_records');