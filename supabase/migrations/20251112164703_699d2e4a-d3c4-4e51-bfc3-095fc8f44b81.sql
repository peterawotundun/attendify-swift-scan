-- Add day field to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS day text;

-- Update mark_attendance function to check max students
CREATE OR REPLACE FUNCTION public.mark_attendance(rfid_input text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    student_record students%ROWTYPE;
    active_session attendance_sessions%ROWTYPE;
    class_record classes%ROWTYPE;
    new_record attendance_records%ROWTYPE;
    current_attendance_count INTEGER;
BEGIN
    -- 1. Find student
    SELECT * INTO student_record
    FROM students
    WHERE rfid_code = rfid_input
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Unregistered card'
        );
    END IF;

    -- 2. Find active session
    SELECT * INTO active_session
    FROM attendance_sessions
    WHERE is_active = TRUE
      AND now() BETWEEN start_time AND end_time
    ORDER BY start_time DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'No active session, try again later'
        );
    END IF;

    -- 3. Get course info
    SELECT * INTO class_record FROM classes WHERE id = active_session.class_id;

    -- 4. Check current attendance count
    SELECT COUNT(*) INTO current_attendance_count
    FROM attendance_records
    WHERE session_id = active_session.id;

    -- 5. Check if max students reached
    IF current_attendance_count >= class_record.total_students THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Class is full - maximum attendance reached',
            'display', json_build_object(
                'Name', student_record.name,
                'Matric', student_record.matric_number,
                'Course', class_record.code,
                'Status', 'Class Full'
            )
        );
    END IF;

    -- 6. Prevent duplicate
    IF EXISTS (
        SELECT 1 FROM attendance_records
        WHERE student_id = student_record.id
          AND session_id = active_session.id
    ) THEN
        RETURN json_build_object(
            'status', 'error',
            'message', 'Attendance already marked',
            'display', json_build_object(
                'Name', student_record.name,
                'Matric', student_record.matric_number,
                'Course', class_record.code,
                'Status', 'Already Marked'
            )
        );
    END IF;

    -- 7. Mark attendance
    INSERT INTO attendance_records (checkin_time, rfid_scan, session_id, student_id)
    VALUES (now(), rfid_input, active_session.id, student_record.id)
    RETURNING * INTO new_record;

    -- 8. Return success
    RETURN json_build_object(
        'status', 'success',
        'message', 'Attendance marked',
        'display', json_build_object(
            'Name', student_record.name,
            'Matric', student_record.matric_number,
            'Course', class_record.code,
            'Status', 'Present'
        ),
        'session', json_build_object(
            'course', class_record.code,
            'display_message', active_session.display_message
        )
    );
END;
$$;