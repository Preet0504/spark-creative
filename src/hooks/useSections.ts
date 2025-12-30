import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, Json } from '@/integrations/supabase/types';

type CourseSection = Database['public']['Tables']['course_sections']['Row'];

export interface SectionSchedule {
  days: string[];
  time: string;
  room: string;
}

export interface ParsedSection extends Omit<CourseSection, 'schedule'> {
  schedule: SectionSchedule;
}

function parseSchedule(schedule: Json): SectionSchedule {
  if (typeof schedule === 'object' && schedule !== null && !Array.isArray(schedule)) {
    return {
      days: Array.isArray((schedule as Record<string, unknown>).days) 
        ? (schedule as Record<string, unknown>).days as string[] 
        : [],
      time: typeof (schedule as Record<string, unknown>).time === 'string' 
        ? (schedule as Record<string, unknown>).time as string 
        : '',
      room: typeof (schedule as Record<string, unknown>).room === 'string' 
        ? (schedule as Record<string, unknown>).room as string 
        : '',
    };
  }
  return { days: [], time: '', room: '' };
}

export function useSections() {
  return useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .order('section');
      
      if (error) throw error;
      return (data || []).map(section => ({
        ...section,
        schedule: parseSchedule(section.schedule),
      })) as ParsedSection[];
    },
  });
}

export function useSectionsByCourse(courseId: string) {
  return useQuery({
    queryKey: ['sections', 'course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('section');
      
      if (error) throw error;
      return (data || []).map(section => ({
        ...section,
        schedule: parseSchedule(section.schedule),
      })) as ParsedSection[];
    },
    enabled: !!courseId,
  });
}
