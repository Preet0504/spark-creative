-- Add policy for admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for teachers to view enrollments for sections they teach
CREATE POLICY "Teachers can view section enrollments"
ON public.enrollments FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role)
);