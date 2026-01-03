import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UpdateUserRoleData {
  userId: string;
  role: AppRole;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleData) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User role updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update user role', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Delete enrollments
      const { error: enrollError } = await supabase
        .from('enrollments')
        .delete()
        .eq('student_id', userId);

      if (enrollError) throw enrollError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast({ title: 'User removed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove user', description: error.message, variant: 'destructive' });
    },
  });
}
