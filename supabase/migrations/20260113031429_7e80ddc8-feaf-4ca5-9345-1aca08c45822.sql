-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER NOT NULL DEFAULT 100,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  file_url TEXT,
  file_name TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  grade NUMERIC(5,2),
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Teachers can manage their section assignments"
ON public.assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_sections cs
    WHERE cs.id = section_id AND cs.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.course_sections cs
    WHERE cs.id = section_id AND cs.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all assignments"
ON public.assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view assignments for their enrolled sections"
ON public.assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.section_id = assignments.section_id
      AND e.student_id = auth.uid()
      AND e.status = 'enrolled'
  )
);

-- Submissions policies
CREATE POLICY "Students can manage their own submissions"
ON public.assignment_submissions
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view and grade submissions for their sections"
ON public.assignment_submissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.course_sections cs ON cs.id = a.section_id
    WHERE a.id = assignment_id AND cs.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.course_sections cs ON cs.id = a.section_id
    WHERE a.id = assignment_id AND cs.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all submissions"
ON public.assignment_submissions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create storage bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('submissions', 'submissions', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for submissions bucket
CREATE POLICY "Students can upload their own submissions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view their own submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can view submissions for their sections"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'submissions' AND
  EXISTS (
    SELECT 1 FROM public.assignment_submissions sub
    JOIN public.assignments a ON a.id = sub.assignment_id
    JOIN public.course_sections cs ON cs.id = a.section_id
    WHERE sub.file_url LIKE '%' || name
      AND cs.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions' AND has_role(auth.uid(), 'admin'));

-- Update trigger for assignments
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();