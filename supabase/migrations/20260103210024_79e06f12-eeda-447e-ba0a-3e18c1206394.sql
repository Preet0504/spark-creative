-- Allow admins to insert new user roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage all enrollments
CREATE POLICY "Admins can insert enrollments"
ON public.enrollments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all enrollments"
ON public.enrollments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all enrollments"
ON public.enrollments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));