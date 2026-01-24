import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSections } from '@/hooks/useSections';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollmentsWithDetails } from '@/hooks/useAllEnrollments';
import { Users, BookOpen, Loader2, Mail, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Students = () => {
  const { profile } = useAuth();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const { data: courses = [] } = useCourses();
  const { data: allEnrollments = [], isLoading: enrollmentsLoading } = useEnrollmentsWithDetails();

  // Get teacher's sections
  const teacherSections = sections.filter(s => 
    profile?.lastName && s.instructor.toLowerCase().includes(profile.lastName.toLowerCase())
  );
  
  const teacherCourseIds = [...new Set(teacherSections.map(s => s.course_id))];
  
  // Get enrollments for teacher's sections
  const teacherEnrollments = allEnrollments.filter(e => 
    teacherSections.some(s => s.id === e.section_id)
  );

  // Group students by course
  const studentsByCourse = teacherCourseIds.map(courseId => {
    const course = courses.find(c => c.id === courseId);
    const courseSections = teacherSections.filter(s => s.course_id === courseId);
    const courseEnrollments = teacherEnrollments.filter(e => e.course_id === courseId);
    
    return {
      course,
      sections: courseSections,
      students: courseEnrollments
    };
  });

  const isLoading = sectionsLoading || enrollmentsLoading;

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
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground mt-2">
            View and manage students enrolled in your courses.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{teacherEnrollments.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{teacherCourseIds.length}</p>
                <p className="text-sm text-muted-foreground">Courses Teaching</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{teacherSections.length}</p>
                <p className="text-sm text-muted-foreground">Active Sections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students by Course */}
        {studentsByCourse.length > 0 ? (
          <div className="space-y-6">
            {studentsByCourse.map(({ course, sections: courseSections, students }) => (
              <div key={course?.id} className="card-elevated overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{course?.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {course?.code} • {courseSections.length} section{courseSections.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {students.length} student{students.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                
                {students.length > 0 ? (
                  <div className="divide-y divide-border">
                    {students.map((enrollment) => {
                      const section = courseSections.find(s => s.id === enrollment.section_id);
                      return (
                        <div 
                          key={enrollment.id} 
                          className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {enrollment.studentName?.split(' ').map(n => n[0]).join('') || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{enrollment.studentName}</p>
                              <p className="text-sm text-muted-foreground">
                                Section {section?.section} • Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {enrollment.grade && (
                              <Badge variant="outline" className="font-semibold">
                                Grade: {enrollment.grade}
                              </Badge>
                            )}
                            <Badge 
                              variant={enrollment.status === 'enrolled' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {enrollment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students enrolled yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No students yet</h3>
            <p className="text-muted-foreground">
              You don't have any students enrolled in your courses yet.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Students;