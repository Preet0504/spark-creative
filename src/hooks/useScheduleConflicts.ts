import { useMemo } from 'react';
import { useEnrollments } from './useEnrollments';
import { useSections, ParsedSection } from './useSections';
import { useCourses } from './useCourses';
import { checkScheduleConflicts, ScheduleConflict } from '@/lib/scheduleUtils';

interface EnrichedSection extends ParsedSection {
  courseName?: string;
  courseCode?: string;
}

export function useScheduleConflicts(userId?: string) {
  const { data: enrollments = [] } = useEnrollments(userId);
  const { data: sections = [] } = useSections();
  const { data: courses = [] } = useCourses();

  // Get enrolled sections with course info
  const enrolledSections = useMemo((): EnrichedSection[] => {
    const result: EnrichedSection[] = [];
    for (const enrollment of enrollments) {
      const section = sections.find(s => s.id === enrollment.section_id);
      const course = courses.find(c => c.id === enrollment.course_id);
      if (section) {
        result.push({
          ...section,
          courseName: course?.title,
          courseCode: course?.code,
        });
      }
    }
    return result;
  }, [enrollments, sections, courses]);

  /**
   * Check if a section has conflicts with currently enrolled sections
   */
  const checkConflicts = (sectionId: string): ScheduleConflict[] => {
    const targetSection = sections.find(s => s.id === sectionId);
    if (!targetSection) return [];

    // Don't check against sections of the same course (they're alternatives)
    const otherEnrolledSections = enrolledSections.filter(
      s => s.course_id !== targetSection.course_id
    );

    return checkScheduleConflicts(targetSection.schedule, otherEnrolledSections);
  };

  /**
   * Check if a specific section has any conflicts
   */
  const hasConflicts = (sectionId: string): boolean => {
    return checkConflicts(sectionId).length > 0;
  };

  return {
    enrolledSections,
    checkConflicts,
    hasConflicts,
  };
}
