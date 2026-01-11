import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WaitlistEntry {
  id: string;
  student_id: string;
  section_id: string;
  course_id: string;
  position: number;
  created_at: string;
}

export function useWaitlistBySection(sectionId: string | undefined) {
  return useQuery({
    queryKey: ['waitlist', 'section', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .eq('section_id', sectionId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as WaitlistEntry[];
    },
    enabled: !!sectionId,
  });
}

export function useStudentWaitlist(studentId: string | undefined) {
  return useQuery({
    queryKey: ['waitlist', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WaitlistEntry[];
    },
    enabled: !!studentId,
  });
}

export function useWaitlistMutations() {
  const queryClient = useQueryClient();

  const joinWaitlist = useMutation({
    mutationFn: async ({ studentId, sectionId, courseId }: { studentId: string; sectionId: string; courseId: string }) => {
      // Get next position
      const { data: existing } = await supabase
        .from('waitlist')
        .select('position')
        .eq('section_id', sectionId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 1;

      const { error } = await supabase
        .from('waitlist')
        .insert({
          student_id: studentId,
          section_id: sectionId,
          course_id: courseId,
          position: nextPosition,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
    },
  });

  const leaveWaitlist = useMutation({
    mutationFn: async (waitlistId: string) => {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', waitlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
    },
  });

  return { joinWaitlist, leaveWaitlist };
}
