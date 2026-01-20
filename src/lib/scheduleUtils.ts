import { SectionSchedule } from '@/hooks/useSections';

interface TimeRange {
  start: number; // minutes from midnight
  end: number;
}

/**
 * Parse a time string like "9:00 AM - 10:30 AM" into start and end minutes
 */
function parseTimeRange(timeString: string): TimeRange | null {
  if (!timeString || timeString === 'TBD') return null;
  
  // Handle formats like "9:00 AM - 10:30 AM" or "9:00-10:30"
  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
  const match = timeString.match(timePattern);
  
  if (!match) return null;
  
  let [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;
  
  let startH = parseInt(startHour);
  let endH = parseInt(endHour);
  const startM = parseInt(startMin);
  const endM = parseInt(endMin);
  
  // Convert to 24-hour format if AM/PM is specified
  if (startPeriod) {
    if (startPeriod.toUpperCase() === 'PM' && startH !== 12) startH += 12;
    if (startPeriod.toUpperCase() === 'AM' && startH === 12) startH = 0;
  }
  
  if (endPeriod) {
    if (endPeriod.toUpperCase() === 'PM' && endH !== 12) endH += 12;
    if (endPeriod.toUpperCase() === 'AM' && endH === 12) endH = 0;
  }
  
  return {
    start: startH * 60 + startM,
    end: endH * 60 + endM,
  };
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Check if two schedules have any overlapping days
 */
function daysOverlap(daysA: string[], daysB: string[]): boolean {
  const normalizedA = daysA.map(d => d.toLowerCase().trim());
  const normalizedB = daysB.map(d => d.toLowerCase().trim());
  return normalizedA.some(day => normalizedB.includes(day));
}

export interface ScheduleConflict {
  conflictingSection: {
    id: string;
    section: string;
    courseId: string;
    courseName?: string;
    courseCode?: string;
  };
  conflictDays: string[];
  conflictTime: string;
}

/**
 * Check if a new section conflicts with any enrolled sections
 */
export function checkScheduleConflicts(
  newSectionSchedule: SectionSchedule,
  enrolledSections: Array<{
    id: string;
    section: string;
    course_id: string;
    schedule: SectionSchedule;
    courseName?: string;
    courseCode?: string;
  }>
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  
  const newTimeRange = parseTimeRange(newSectionSchedule.time);
  if (!newTimeRange || !newSectionSchedule.days.length) {
    return conflicts; // Can't determine conflicts if schedule is incomplete
  }
  
  for (const enrolledSection of enrolledSections) {
    const enrolledTimeRange = parseTimeRange(enrolledSection.schedule.time);
    if (!enrolledTimeRange || !enrolledSection.schedule.days.length) {
      continue; // Skip sections with incomplete schedules
    }
    
    // Check if days overlap
    const overlappingDays = newSectionSchedule.days.filter(day =>
      enrolledSection.schedule.days.some(
        enrolledDay => enrolledDay.toLowerCase() === day.toLowerCase()
      )
    );
    
    if (overlappingDays.length === 0) continue;
    
    // Check if times overlap
    if (timeRangesOverlap(newTimeRange, enrolledTimeRange)) {
      conflicts.push({
        conflictingSection: {
          id: enrolledSection.id,
          section: enrolledSection.section,
          courseId: enrolledSection.course_id,
          courseName: enrolledSection.courseName,
          courseCode: enrolledSection.courseCode,
        },
        conflictDays: overlappingDays,
        conflictTime: enrolledSection.schedule.time,
      });
    }
  }
  
  return conflicts;
}

/**
 * Format conflict message for display
 */
export function formatConflictMessage(conflicts: ScheduleConflict[]): string {
  if (conflicts.length === 0) return '';
  
  return conflicts
    .map(conflict => {
      const courseInfo = conflict.conflictingSection.courseCode 
        ? `${conflict.conflictingSection.courseCode} Section ${conflict.conflictingSection.section}`
        : `Section ${conflict.conflictingSection.section}`;
      return `${courseInfo} on ${conflict.conflictDays.join(', ')} at ${conflict.conflictTime}`;
    })
    .join('; ');
}
