import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface SectionSchedule {
  days: string[];
  time: string;
  room: string;
}

interface CreateSectionData {
  course_id: string;
  section: string;
  instructor: string;
  schedule: SectionSchedule;
  enrolled?: number;
}

interface UpdateSectionData extends Partial<Omit<CreateSectionData, 'course_id'>> {
  id: string;
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSectionData) => {
      const { data: section, error } = await supabase
        .from('course_sections')
        .insert({
          course_id: data.course_id,
          section: data.section,
          instructor: data.instructor,
          schedule: data.schedule as unknown as Json,
          enrolled: data.enrolled,
        })
        .select()
        .single();

      if (error) throw error;
      return section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast({ title: 'Section created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create section', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, schedule, ...rest }: UpdateSectionData) => {
      const updateData: Record<string, unknown> = { ...rest };
      if (schedule) {
        updateData.schedule = schedule as unknown as Json;
      }
      const { data: section, error } = await supabase
        .from('course_sections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast({ title: 'Section updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update section', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast({ title: 'Section deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete section', description: error.message, variant: 'destructive' });
    },
  });
}
