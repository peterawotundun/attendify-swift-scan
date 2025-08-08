-- Create students table with RFID codes
CREATE TABLE public.students (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    matric_number TEXT NOT NULL UNIQUE,
    rfid_code TEXT NOT NULL UNIQUE,
    email TEXT,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    time TEXT NOT NULL,
    room TEXT NOT NULL,
    lecturer_id UUID,
    total_students INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance sessions table
CREATE TABLE public.attendance_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    session_code TEXT NOT NULL UNIQUE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    rfid_scan BOOLEAN DEFAULT true,
    UNIQUE(session_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict these later with authentication)
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance_sessions" ON public.attendance_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

-- Insert 10 sample students with RFID codes
INSERT INTO public.students (name, matric_number, rfid_code, email, department) VALUES
('Alice Johnson', 'STU001', '220065F8', 'alice.johnson@university.edu', 'Computer Science'),
('Bob Smith', 'STU002', '220066A3', 'bob.smith@university.edu', 'Computer Science'),
('Carol Davis', 'STU003', '220067B4', 'carol.davis@university.edu', 'Information Technology'),
('David Wilson', 'STU004', '220068C5', 'david.wilson@university.edu', 'Computer Science'),
('Emily Brown', 'STU005', '220069D6', 'emily.brown@university.edu', 'Software Engineering'),
('Frank Miller', 'STU006', '22006AE7', 'frank.miller@university.edu', 'Computer Science'),
('Grace Lee', 'STU007', '22006BF8', 'grace.lee@university.edu', 'Information Technology'),
('Henry Taylor', 'STU008', '22006C09', 'henry.taylor@university.edu', 'Computer Science'),
('Ivy Chen', 'STU009', '22006D1A', 'ivy.chen@university.edu', 'Software Engineering'),
('Jack Rodriguez', 'STU010', '22006E2B', 'jack.rodriguez@university.edu', 'Computer Science');

-- Insert sample class
INSERT INTO public.classes (name, code, time, room, total_students) VALUES
('Data Structures', 'CS201', '10:00 AM - 11:30 AM', 'A101', 45);

-- Insert sample attendance session
INSERT INTO public.attendance_sessions (class_id, session_code, is_active) 
SELECT id, 'ATD-2024-001', true FROM public.classes WHERE code = 'CS201';

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();