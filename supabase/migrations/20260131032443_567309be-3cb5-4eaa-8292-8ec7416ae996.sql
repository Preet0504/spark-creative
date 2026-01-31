-- Create enum for material types
CREATE TYPE public.material_type AS ENUM ('file', 'link', 'text');

-- Create course_materials table
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type public.material_type NOT NULL DEFAULT 'file',
  file_url TEXT,
  file_name TEXT,
  link_url TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all materials"
ON public.course_materials FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their section materials"
ON public.course_materials FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_sections cs
    WHERE cs.id = course_materials.section_id
    AND cs.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.course_sections cs
    WHERE cs.id = course_materials.section_id
    AND cs.instructor_id = auth.uid()
  )
);

CREATE POLICY "Students can view materials for enrolled sections"
ON public.course_materials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.section_id = course_materials.section_id
    AND e.student_id = auth.uid()
    AND e.status = 'enrolled'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_course_materials_updated_at
BEFORE UPDATE ON public.course_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false);

-- Storage policies
CREATE POLICY "Teachers can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials' AND
  (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'teacher')
  )
);

CREATE POLICY "Teachers can update their materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-materials' AND
  (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'teacher')
  )
);

CREATE POLICY "Teachers can delete their materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-materials' AND
  (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'teacher')
  )
);

CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials' AND auth.role() = 'authenticated');