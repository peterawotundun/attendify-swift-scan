-- Remove unique constraint from classes.code to allow multiple sessions of same course
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_code_key;