-- Create a function to generate unique session codes based on course code
CREATE OR REPLACE FUNCTION generate_session_code(course_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    result_session_code TEXT;
    counter INTEGER := 1;
    base_code TEXT;
BEGIN
    -- Create base code from course code and current date
    base_code := course_code || '-' || TO_CHAR(NOW(), 'YYYY-MM-DD');
    
    -- Check if base code exists, if so add a counter
    result_session_code := base_code;
    WHILE EXISTS (SELECT 1 FROM attendance_sessions WHERE session_code = result_session_code) LOOP
        result_session_code := base_code || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN result_session_code;
END;
$$;

-- Update existing session to use course-specific code
UPDATE attendance_sessions 
SET session_code = generate_session_code('CS201')
WHERE id = '9e9a9a63-3d7f-419d-b37f-5dfa814a95d3';

-- Create a trigger to automatically generate session codes for new sessions
CREATE OR REPLACE FUNCTION auto_generate_session_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    course_code TEXT;
BEGIN
    -- Get the course code from the classes table
    SELECT code INTO course_code 
    FROM classes 
    WHERE id = NEW.class_id;
    
    -- Generate session code if not provided
    IF NEW.session_code IS NULL OR NEW.session_code = '' THEN
        NEW.session_code := generate_session_code(course_code);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_session_code ON attendance_sessions;
CREATE TRIGGER trigger_auto_generate_session_code
    BEFORE INSERT ON attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_session_code();