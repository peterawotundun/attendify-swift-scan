-- Add lecturer_id to classes table for course assignment
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS lecturer_id uuid REFERENCES auth.users(id);

-- Create table for class schedules (separate from sessions)
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  scheduled_date date NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for class_schedules
CREATE POLICY "Allow all operations on class_schedules"
ON public.class_schedules
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_class_schedules_updated_at
BEFORE UPDATE ON public.class_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();