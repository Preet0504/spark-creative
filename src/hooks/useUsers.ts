import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  role: AppRole;
}

export function useUsersByRole(role: AppRole) {
  return useQuery({
    queryKey: ['users', 'role', role],
    queryFn: async () => {
      // First get all user_ids with this role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', role);

      if (roleError) throw roleError;
      if (!roleData || roleData.length === 0) return [];

      const userIds = roleData.map(r => r.user_id);

      // Then get profiles for those users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) throw profileError;

      return (profiles || []).map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        profilePicture: p.profile_picture,
        role,
      })) as UserWithRole[];
    },
  });
}

export function useAllUsersWithRoles() {
  return useQuery({
    queryKey: ['users', 'all-with-roles'],
    queryFn: async () => {
      // Get all roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (roleError) throw roleError;
      if (!roleData || roleData.length === 0) return [];

      const userIds = [...new Set(roleData.map(r => r.user_id))];

      // Get profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Map profiles with roles
      return (profiles || []).map(p => {
        const userRole = roleData.find(r => r.user_id === p.id);
        return {
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          profilePicture: p.profile_picture,
          role: userRole?.role || 'student',
        } as UserWithRole;
      });
    },
  });
}

// Alias for backwards compatibility
export const useUsers = useAllUsersWithRoles;
