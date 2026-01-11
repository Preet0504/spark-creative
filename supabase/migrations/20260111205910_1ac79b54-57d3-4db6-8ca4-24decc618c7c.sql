-- 1. Add instructor_id column to course_sections for proper teacher linking
ALTER TABLE public.course_sections 
ADD COLUMN instructor_id UUID REFERENCES public.profiles(id);

-- 2. Create waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, section_id)
);

-- Enable RLS on waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Waitlist policies
CREATE POLICY "Students can view their own waitlist entries"
ON public.waitlist FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can add themselves to waitlist"
ON public.waitlist FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can remove themselves from waitlist"
ON public.waitlist FOR DELETE
USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all waitlist entries"
ON public.waitlist FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view waitlist for their sections"
ON public.waitlist FOR SELECT
USING (is_instructor_for_section(auth.uid(), section_id));

-- 3. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);