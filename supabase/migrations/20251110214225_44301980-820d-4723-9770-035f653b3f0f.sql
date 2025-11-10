-- Create course_enrollments table
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own enrollments
CREATE POLICY "Students can view their enrollments"
ON public.course_enrollments
FOR SELECT
USING (true);

-- Policy: Allow insert for enrollment
CREATE POLICY "Allow enrollment"
ON public.course_enrollments
FOR INSERT
WITH CHECK (true);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.lecturer_schedule(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('schedule', 'reminder', 'general')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_time TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own notifications
CREATE POLICY "Students can view their notifications"
ON public.notifications
FOR SELECT
USING (true);

-- Policy: Students can update their notifications (mark as read)
CREATE POLICY "Students can update their notifications"
ON public.notifications
FOR UPDATE
USING (true);

-- Function to notify enrolled students when class is scheduled
CREATE OR REPLACE FUNCTION public.notify_enrolled_students()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  class_info RECORD;
  enrollment RECORD;
BEGIN
  -- Get class details
  SELECT code, name, time, room INTO class_info
  FROM public.classes
  WHERE id = NEW.class_id;
  
  -- Create notifications for all enrolled students
  FOR enrollment IN 
    SELECT student_id 
    FROM public.course_enrollments 
    WHERE class_id = NEW.class_id
  LOOP
    INSERT INTO public.notifications (
      student_id,
      class_id,
      schedule_id,
      message,
      notification_type,
      scheduled_time
    )
    VALUES (
      enrollment.student_id,
      NEW.class_id,
      NEW.id,
      format('Class scheduled: %s (%s) on %s at %s in room %s', 
        class_info.name, 
        class_info.code, 
        NEW.scheduled_date::date,
        class_info.time,
        class_info.room
      ),
      'schedule',
      NEW.scheduled_date
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to notify students when class is scheduled
CREATE TRIGGER notify_students_on_schedule
AFTER INSERT ON public.lecturer_schedule
FOR EACH ROW
EXECUTE FUNCTION public.notify_enrolled_students();

-- Function to calculate attendance percentage
CREATE OR REPLACE FUNCTION public.get_attendance_percentage(
  p_student_id UUID,
  p_class_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_sessions INTEGER;
  attended_sessions INTEGER;
  percentage NUMERIC;
BEGIN
  -- Count total sessions for the class
  SELECT COUNT(*) INTO total_sessions
  FROM public.attendance_sessions
  WHERE class_id = p_class_id;
  
  -- Count sessions the student attended
  SELECT COUNT(*) INTO attended_sessions
  FROM public.attendance_records ar
  JOIN public.attendance_sessions asession ON ar.session_id = asession.id
  WHERE ar.student_id = p_student_id
    AND asession.class_id = p_class_id;
  
  -- Calculate percentage
  IF total_sessions > 0 THEN
    percentage := ROUND((attended_sessions::NUMERIC / total_sessions::NUMERIC) * 100, 2);
  ELSE
    percentage := 0;
  END IF;
  
  RETURN percentage;
END;
$$;