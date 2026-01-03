import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type SemesterType = Database['public']['Enums']['semester_type'];

interface CreateCourseData {
  code: string;
  title: string;
  description?: string;
  credits: number;
  max_students: number;
  semester: SemesterType;
  school_id?: string;
  prerequisites?: string[];
}

interface UpdateCourseData extends Partial<CreateCourseData> {
  id: string;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseData) => {
      const { data: course, error } = await supabase
        .from('courses')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create course', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCourseData) => {
      const { data: course, error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update course', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete course', description: error.message, variant: 'destructive' });
    },
  });
}
