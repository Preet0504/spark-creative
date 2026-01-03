import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export interface EnrollmentWithDetails extends Enrollment {
  studentName?: string;
  courseName?: string;
  sectionName?: string;
}

export function useAllEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useEnrollmentsWithDetails() {
  return useQuery({
    queryKey: ['enrollments', 'all-with-details'],
    queryFn: async () => {
      // Get enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });

      if (enrollError) throw enrollError;
      if (!enrollments || enrollments.length === 0) return [];

      // Get unique IDs
      const studentIds = [...new Set(enrollments.map(e => e.student_id))];
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];
      const sectionIds = [...new Set(enrollments.map(e => e.section_id))];

      // Fetch related data in parallel
      const [profilesRes, coursesRes, sectionsRes] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name').in('id', studentIds),
        supabase.from('courses').select('id, title, code').in('id', courseIds),
        supabase.from('course_sections').select('id, section').in('id', sectionIds),
      ]);

      const profiles = profilesRes.data || [];
      const courses = coursesRes.data || [];
      const sections = sectionsRes.data || [];

      // Map enrollments with details
      return enrollments.map(e => {
        const profile = profiles.find(p => p.id === e.student_id);
        const course = courses.find(c => c.id === e.course_id);
        const section = sections.find(s => s.id === e.section_id);

        return {
          ...e,
          studentName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
          courseName: course ? `${course.code} - ${course.title}` : 'Unknown Course',
          sectionName: section?.section || 'Unknown Section',
        } as EnrollmentWithDetails;
      });
    },
  });
}
