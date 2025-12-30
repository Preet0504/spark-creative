import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type School = Database['public']['Tables']['schools']['Row'];

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as School[];
    },
  });
}
