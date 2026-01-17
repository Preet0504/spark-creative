-- Add unique constraint for student submissions
ALTER TABLE public.assignment_submissions 
ADD CONSTRAINT assignment_submissions_assignment_student_unique 
UNIQUE (assignment_id, student_id);