import { useCourses } from './useCourses';
import { useEnrollments } from './useEnrollments';

const PASSING_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'P'];

export function usePrerequisiteCheck(courseId: string | undefined, studentId: string | undefined) {
  const { data: courses = [] } = useCourses();
  const { data: enrollments = [] } = useEnrollments(studentId);

  const course = courses.find(c => c.id === courseId);
  const prerequisites = course?.prerequisites || [];

  if (!course || prerequisites.length === 0) {
    return { 
      canEnroll: true, 
      missingPrerequisites: [],
      completedPrerequisites: [],
    };
  }

  // Find completed courses with passing grades
  const completedCourseCodes = enrollments
    .filter(e => e.grade && PASSING_GRADES.includes(e.grade.toUpperCase()))
    .map(e => {
      const enrolledCourse = courses.find(c => c.id === e.course_id);
      return enrolledCourse?.code;
    })
    .filter(Boolean) as string[];

  const missingPrerequisites = prerequisites.filter(prereq => !completedCourseCodes.includes(prereq));
  const completedPrerequisites = prerequisites.filter(prereq => completedCourseCodes.includes(prereq));

  return {
    canEnroll: missingPrerequisites.length === 0,
    missingPrerequisites,
    completedPrerequisites,
  };
}

export function usePrerequisitesForCourse(courseId: string | undefined) {
  const { data: courses = [] } = useCourses();
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return { prerequisites: [], prerequisiteCourses: [] };
  }

  const prerequisites = course.prerequisites || [];
  const prerequisiteCourses = courses.filter(c => prerequisites.includes(c.code));

  return { prerequisites, prerequisiteCourses };
}
