import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useCourses } from '@/hooks/useCourses';
import { useSections } from '@/hooks/useSections';
import { calculateGPA, getGradeColor, GRADE_POINTS } from '@/lib/gradeUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, GraduationCap, Award, TrendingUp, BookOpen } from 'lucide-react';

export default function Grades() {
  const { user } = useAuth();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(user?.id);
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: sections = [] } = useSections();

  const isLoading = enrollmentsLoading || coursesLoading;

  // Build grade entries
  const gradeEntries = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    const section = sections.find(s => s.id === enrollment.section_id);
    
    return {
      enrollmentId: enrollment.id,
      courseCode: course?.code || 'Unknown',
      courseName: course?.title || 'Unknown Course',
      credits: course?.credits || 0,
      grade: enrollment.grade,
      gradePoints: enrollment.grade ? GRADE_POINTS[enrollment.grade.toUpperCase()] : null,
      semester: course?.semester || 'Unknown',
      instructor: section?.instructor || 'TBA',
      status: enrollment.status,
    };
  });

  const { gpa, totalCredits, earnedCredits } = calculateGPA(gradeEntries);

  const gradedCourses = gradeEntries.filter(e => e.grade);
  const inProgressCourses = gradeEntries.filter(e => !e.grade && e.status === 'enrolled');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Grades</h1>
          <p className="text-muted-foreground mt-1">View your academic performance and GPA</p>
        </div>

        {/* GPA Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                  <p className="text-3xl font-bold text-foreground">{gpa.toFixed(2)}</p>
                </div>
              </div>
              <Progress value={(gpa / 4) * 100} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Award className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Earned</p>
                  <p className="text-2xl font-bold text-foreground">{earnedCredits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold text-foreground">{totalCredits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{inProgressCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Courses with Grades */}
        {gradedCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {gradedCourses.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{entry.courseCode}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.credits} credits
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.courseName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{entry.instructor}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getGradeColor(entry.grade)}`}>
                        {entry.grade || '-'}
                      </p>
                      {entry.gradePoints !== null && (
                        <p className="text-xs text-muted-foreground">
                          {entry.gradePoints.toFixed(1)} pts
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress Courses */}
        {inProgressCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {inProgressCourses.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{entry.courseCode}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.credits} credits
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.courseName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{entry.instructor}</p>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {gradeEntries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No courses yet</h3>
              <p className="text-muted-foreground">
                Enroll in courses to start building your academic record.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
