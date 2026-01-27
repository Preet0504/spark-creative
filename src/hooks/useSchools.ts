import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SchoolWithDean {
  id: string;
  name: string;
  dean: string;
  dean_id: string | null;
  created_at: string;
  deanProfile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          deanProfile:profiles!schools_dean_id_fkey(first_name, last_name)
        `)
        .order('name');
      
      if (error) throw error;
      return data as SchoolWithDean[];
    },
  });
}

// Helper to get dean display name
export function getDeanDisplayName(school: SchoolWithDean): string {
  if (school.deanProfile) {
    const firstName = school.deanProfile.first_name || '';
    const lastName = school.deanProfile.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
  }
  return 'Not assigned';
}
