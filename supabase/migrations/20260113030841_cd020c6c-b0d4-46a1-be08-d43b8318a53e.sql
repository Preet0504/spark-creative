-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a security definer function to check if user can view a profile
CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer_id uuid, _profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Users can always view their own profile
    _viewer_id = _profile_id
    OR
    -- Admins can view all profiles
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _viewer_id AND role = 'admin'
    )
    OR
    -- Teachers can view profiles of students in their sections
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.course_sections cs ON cs.id = e.section_id
      WHERE e.student_id = _profile_id
        AND cs.instructor_id = _viewer_id
    )
    OR
    -- Students can view their instructor profiles
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.course_sections cs ON cs.id = e.section_id
      WHERE e.student_id = _viewer_id
        AND cs.instructor_id = _profile_id
    )
    OR
    -- Users can view classmates (students in same sections)
    EXISTS (
      SELECT 1 FROM public.enrollments e1
      JOIN public.enrollments e2 ON e1.section_id = e2.section_id
      WHERE e1.student_id = _viewer_id
        AND e2.student_id = _profile_id
        AND e1.status = 'enrolled'
        AND e2.status = 'enrolled'
    )
    OR
    -- Teachers can view other teachers who instruct the same courses
    EXISTS (
      SELECT 1 FROM public.course_sections cs1
      JOIN public.course_sections cs2 ON cs1.course_id = cs2.course_id
      WHERE cs1.instructor_id = _viewer_id
        AND cs2.instructor_id = _profile_id
    )
$$;

-- Create restrictive policy for viewing profiles
CREATE POLICY "Users can view relevant profiles"
ON public.profiles
FOR SELECT
USING (public.can_view_profile(auth.uid(), id));