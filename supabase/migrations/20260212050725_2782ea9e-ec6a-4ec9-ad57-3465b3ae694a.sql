
-- Discussion posts table
CREATE TABLE public.discussion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Discussion replies table
CREATE TABLE public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_endorsed BOOLEAN NOT NULL DEFAULT false,
  endorsed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Discussion likes table (can like posts or replies)
CREATE TABLE public.discussion_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT likes_target_check CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
);

-- Enable RLS
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_likes ENABLE ROW LEVEL SECURITY;

-- Helper function: can user access this section's forum?
CREATE OR REPLACE FUNCTION public.can_access_forum(_user_id UUID, _section_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Enrolled student
    SELECT 1 FROM public.enrollments
    WHERE student_id = _user_id AND section_id = _section_id AND status = 'enrolled'
  ) OR EXISTS (
    -- Instructor
    SELECT 1 FROM public.course_sections
    WHERE id = _section_id AND instructor_id = _user_id
  ) OR EXISTS (
    -- Admin
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Posts policies
CREATE POLICY "Users can view posts in their sections"
ON public.discussion_posts FOR SELECT
USING (can_access_forum(auth.uid(), section_id));

CREATE POLICY "Users can create posts in their sections"
ON public.discussion_posts FOR INSERT
WITH CHECK (can_access_forum(auth.uid(), section_id) AND auth.uid() = author_id);

CREATE POLICY "Authors can update their posts"
ON public.discussion_posts FOR UPDATE
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
  SELECT 1 FROM public.course_sections WHERE id = section_id AND instructor_id = auth.uid()
));

CREATE POLICY "Authors can delete their posts"
ON public.discussion_posts FOR DELETE
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Replies policies
CREATE POLICY "Users can view replies"
ON public.discussion_replies FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.discussion_posts p
  WHERE p.id = post_id AND can_access_forum(auth.uid(), p.section_id)
));

CREATE POLICY "Users can create replies"
ON public.discussion_replies FOR INSERT
WITH CHECK (auth.uid() = author_id AND EXISTS (
  SELECT 1 FROM public.discussion_posts p
  WHERE p.id = post_id AND can_access_forum(auth.uid(), p.section_id)
));

CREATE POLICY "Authors and instructors can update replies"
ON public.discussion_replies FOR UPDATE
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
  SELECT 1 FROM public.discussion_posts p
  JOIN public.course_sections cs ON cs.id = p.section_id
  WHERE p.id = post_id AND cs.instructor_id = auth.uid()
));

CREATE POLICY "Authors can delete replies"
ON public.discussion_replies FOR DELETE
USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'::app_role));

-- Likes policies
CREATE POLICY "Users can view likes"
ON public.discussion_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like"
ON public.discussion_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.discussion_likes FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_discussion_posts_updated_at
BEFORE UPDATE ON public.discussion_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
BEFORE UPDATE ON public.discussion_replies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_replies;
