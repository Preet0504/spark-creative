-- Create a security definer function to check if user is instructor for a section
CREATE OR REPLACE FUNCTION public.is_instructor_for_section(_user_id uuid, _section_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_sections cs
    JOIN public.profiles p ON p.id = _user_id
    WHERE cs.id = _section_id
      AND (
        cs.instructor ILIKE '%' || p.last_name || '%'
        OR cs.instructor ILIKE '%' || p.first_name || '%'
      )
  )
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Teachers can view section enrollments" ON public.enrollments;

-- Create a more restrictive policy that only allows teachers to see enrollments for their own sections
CREATE POLICY "Teachers can view their section enrollments"
ON public.enrollments
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND is_instructor_for_section(auth.uid(), section_id)
);