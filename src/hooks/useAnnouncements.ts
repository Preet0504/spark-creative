import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_role: 'student' | 'teacher' | 'admin' | null;
  created_by: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAnnouncements(userRole?: string) {
  return useQuery({
    queryKey: ['announcements', userRole],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by role or null (all roles)
      if (userRole) {
        query = query.or(`target_role.eq.${userRole},target_role.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter out expired announcements
      const now = new Date();
      return (data || []).filter((a: Announcement) => 
        !a.expires_at || new Date(a.expires_at) > now
      ) as Announcement[];
    },
  });
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_role?: 'student' | 'teacher' | 'admin' | null;
  expires_at?: string | null;
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnouncementData & { created_by: string }) => {
      const { error } = await supabase
        .from('announcements')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create announcement: ' + error.message);
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete announcement: ' + error.message);
    },
  });
}
