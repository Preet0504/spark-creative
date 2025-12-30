import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Course = Database['public']['Tables']['courses']['Row'];
type School = Database['public']['Tables']['schools']['Row'];

export interface CourseWithSchool extends Course {
  schools: School | null;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, schools(*)')
        .order('code');
      
      if (error) throw error;
      return data as CourseWithSchool[];
    },
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, schools(*)')
        .eq('id', courseId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CourseWithSchool | null;
    },
    enabled: !!courseId,
  });
}
