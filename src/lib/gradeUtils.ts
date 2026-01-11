export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
};

export interface GradeEntry {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string | null;
  gradePoints: number | null;
}

export function calculateGPA(grades: GradeEntry[]): { gpa: number; totalCredits: number; earnedCredits: number } {
  const validGrades = grades.filter(g => g.grade && GRADE_POINTS[g.grade.toUpperCase()] !== undefined);
  
  if (validGrades.length === 0) {
    return { gpa: 0, totalCredits: 0, earnedCredits: 0 };
  }

  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  validGrades.forEach(entry => {
    const gradeUpper = entry.grade!.toUpperCase();
    const points = GRADE_POINTS[gradeUpper];
    
    if (points !== undefined) {
      totalPoints += points * entry.credits;
      totalCredits += entry.credits;
      
      // Earned credits (passing grade)
      if (points >= 1.0) {
        earnedCredits += entry.credits;
      }
    }
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return { 
    gpa: Math.round(gpa * 100) / 100, 
    totalCredits, 
    earnedCredits 
  };
}

export function getGradeColor(grade: string | null): string {
  if (!grade) return 'text-muted-foreground';
  
  const points = GRADE_POINTS[grade.toUpperCase()];
  if (points === undefined) return 'text-muted-foreground';
  
  if (points >= 3.7) return 'text-green-600 dark:text-green-400';
  if (points >= 3.0) return 'text-blue-600 dark:text-blue-400';
  if (points >= 2.0) return 'text-yellow-600 dark:text-yellow-400';
  if (points >= 1.0) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}
