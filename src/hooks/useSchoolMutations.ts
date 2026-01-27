import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateSchoolData {
  name: string;
  dean_id: string | null;
}

interface UpdateSchoolData {
  id: string;
  name: string;
  dean_id: string | null;
}

export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSchoolData) => {
      const { data: school, error } = await supabase
        .from('schools')
        .insert({ name: data.name, dean: '', dean_id: data.dean_id })
        .select()
        .single();

      if (error) throw error;
      return school;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({ title: 'School created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create school', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, dean_id }: UpdateSchoolData) => {
      const { data: school, error } = await supabase
        .from('schools')
        .update({ name, dean: '', dean_id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return school;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({ title: 'School updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update school', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({ title: 'School deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete school', description: error.message, variant: 'destructive' });
    },
  });
}
