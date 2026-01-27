-- Add dean_id column to link deans to real users
ALTER TABLE public.schools ADD COLUMN dean_id uuid REFERENCES public.profiles(id);

-- Clear the fake dean text data
UPDATE public.schools SET dean = '';

-- Create index for dean lookups
CREATE INDEX idx_schools_dean_id ON public.schools(dean_id);