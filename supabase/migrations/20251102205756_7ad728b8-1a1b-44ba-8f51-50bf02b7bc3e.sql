-- Add is_active column to classes table for soft delete
ALTER TABLE public.classes 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;