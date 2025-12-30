import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export function useEnrollments(userId?: string) {
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', userId)
        .eq('status', 'enrolled');
      
      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!userId,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      courseId, 
      sectionId, 
      studentId 
    }: { 
      courseId: string; 
      sectionId: string; 
      studentId: string;
    }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          section_id: sectionId,
          student_id: studentId,
          status: 'enrolled',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Successfully enrolled in course!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll in course');
    },
  });
}

export function useDropCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Successfully dropped course');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to drop course');
    },
  });
}
