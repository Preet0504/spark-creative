-- Create custom enum types
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE public.semester_type AS ENUM ('fall', 'spring', 'summer');
CREATE TYPE public.enrollment_status AS ENUM ('enrolled', 'pending', 'dropped');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dean TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  description TEXT,
  prerequisites TEXT[] DEFAULT '{}',
  semester public.semester_type NOT NULL DEFAULT 'fall',
  max_students INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create course_sections table
CREATE TABLE public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL,
  instructor TEXT NOT NULL,
  schedule JSONB NOT NULL DEFAULT '{"days": [], "time": "", "room": ""}',
  enrolled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (course_id, section)
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status public.enrollment_status NOT NULL DEFAULT 'enrolled',
  grade TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (student_id, section_id)
);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User roles policies (read-only for users)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Schools policies (public read)
CREATE POLICY "Anyone can view schools"
  ON public.schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schools"
  ON public.schools FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Courses policies (public read)
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Course sections policies (public read)
CREATE POLICY "Anyone can view sections"
  ON public.course_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage sections"
  ON public.course_sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enrollments policies
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll themselves"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own enrollments"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete own enrollments"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed data for schools
INSERT INTO public.schools (id, name, dean) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'School of Engineering', 'Dr. Robert Chen'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'School of Business', 'Dr. Sarah Johnson'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'School of Arts & Sciences', 'Dr. Michael Brown'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'School of Medicine', 'Dr. Emily Davis');

-- Seed data for courses
INSERT INTO public.courses (id, code, title, credits, school_id, description, prerequisites, semester, max_students) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CS101', 'Introduction to Computer Science', 3, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Fundamental concepts of programming and computational thinking.', '{}', 'fall', 30),
  ('22222222-2222-2222-2222-222222222222', 'CS201', 'Data Structures', 4, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Study of fundamental data structures and algorithms.', '{CS101}', 'spring', 25),
  ('33333333-3333-3333-3333-333333333333', 'BUS101', 'Introduction to Business', 3, 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Overview of business principles and practices.', '{}', 'fall', 40),
  ('44444444-4444-4444-4444-444444444444', 'BUS201', 'Marketing Fundamentals', 3, 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Core concepts of marketing strategy and consumer behavior.', '{BUS101}', 'spring', 35),
  ('55555555-5555-5555-5555-555555555555', 'ENG101', 'English Composition', 3, 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Develop writing skills for academic and professional contexts.', '{}', 'fall', 25),
  ('66666666-6666-6666-6666-666666666666', 'MATH201', 'Calculus I', 4, 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Introduction to differential calculus.', '{}', 'fall', 30),
  ('77777777-7777-7777-7777-777777777777', 'BIO101', 'Introduction to Biology', 4, 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'Fundamental concepts of biological sciences.', '{}', 'fall', 35),
  ('88888888-8888-8888-8888-888888888888', 'CHEM101', 'General Chemistry', 4, 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'Basic principles of chemistry and laboratory techniques.', '{}', 'spring', 30);

-- Seed data for course sections (using valid hex UUIDs)
INSERT INTO public.course_sections (id, course_id, section, instructor, schedule, enrolled) VALUES
  ('a0a01111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'A', 'Prof. Jane Smith', '{"days": ["Mon", "Wed", "Fri"], "time": "9:00 AM - 10:00 AM", "room": "Room 101"}', 18),
  ('a0a02222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'B', 'Prof. John Doe', '{"days": ["Tue", "Thu"], "time": "2:00 PM - 3:30 PM", "room": "Room 102"}', 22),
  ('b0b01111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'A', 'Prof. Jane Smith', '{"days": ["Mon", "Wed"], "time": "11:00 AM - 12:30 PM", "room": "Room 201"}', 15),
  ('c0c01111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'A', 'Prof. Mike Wilson', '{"days": ["Mon", "Wed", "Fri"], "time": "10:00 AM - 11:00 AM", "room": "Room 301"}', 28),
  ('d0d01111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'A', 'Prof. Sarah Lee', '{"days": ["Tue", "Thu"], "time": "9:00 AM - 10:30 AM", "room": "Room 302"}', 20),
  ('e0e01111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'A', 'Prof. Emily Brown', '{"days": ["Mon", "Wed", "Fri"], "time": "1:00 PM - 2:00 PM", "room": "Room 401"}', 18),
  ('f0f01111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'A', 'Prof. David Kim', '{"days": ["Tue", "Thu"], "time": "11:00 AM - 12:30 PM", "room": "Room 402"}', 22),
  ('a0b01111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'A', 'Prof. Lisa Chen', '{"days": ["Mon", "Wed"], "time": "3:00 PM - 4:30 PM", "room": "Lab 101"}', 25);