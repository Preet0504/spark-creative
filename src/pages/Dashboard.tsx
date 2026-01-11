import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useSchools } from '@/hooks/useSchools';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useSections } from '@/hooks/useSections';
import { useUsersByRole } from '@/hooks/useUsers';
import { useEnrollmentsWithDetails } from '@/hooks/useAllEnrollments';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/ui/stat-card';
import CourseCard from '@/components/courses/CourseCard';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  Building2,
  Loader2,
  UserPlus
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(user?.id);
  const { data: sections = [] } = useSections();
  
  // Admin-specific data
  const { data: students = [] } = useUsersByRole('student');
  const { data: teachers = [] } = useUsersByRole('teacher');
  const { data: allEnrollments = [] } = useEnrollmentsWithDetails();

  const enrolledCourses = courses.filter(c => 
    enrollments.some(e => e.course_id === c.id)
  );

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

  // Get teacher's name for matching sections
  const teacherFullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';
  
  // Filter sections taught by this teacher (match by last name in instructor field)
  const teacherSections = sections.filter(s => 
    profile?.lastName && s.instructor.toLowerCase().includes(profile.lastName.toLowerCase())
  );
  
  // Get courses taught by this teacher
  const teacherCourseIds = [...new Set(teacherSections.map(s => s.course_id))];
  const teacherCourses = courses.filter(c => teacherCourseIds.includes(c.id));
  
  // Total students in teacher's sections
  const totalTeacherStudents = teacherSections.reduce((sum, s) => sum + s.enrolled, 0);
  
  // Get recent enrollments for teacher's courses
  const teacherEnrollments = allEnrollments.filter(e => 
    teacherCourseIds.includes(e.course_id)
  ).slice(0, 4);

  const isLoading = coursesLoading || schoolsLoading || enrollmentsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Student Dashboard
  if (profile?.role === 'student') {
    return (
      <MainLayout>
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile.firstName || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's an overview of your academic progress this semester.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Enrolled Courses"
              value={enrolledCourses.length}
              subtitle="This semester"
              icon={BookOpen}
            />
            <StatCard
              title="Total Credits"
              value={totalCredits}
              subtitle="of 18 max credits"
              icon={Award}
              variant="primary"
            />
            <StatCard
              title="GPA"
              value="N/A"
              subtitle="Grades not posted"
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Upcoming"
              value={enrolledCourses.length}
              subtitle="Classes today"
              icon={Calendar}
            />
          </div>

          {/* Current Courses */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
              <a href="/my-courses" className="text-sm text-primary font-medium hover:underline">
                View All →
              </a>
            </div>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.slice(0, 3).map((course, i) => (
                  <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <CourseCard course={course} isEnrolled />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Start by browsing available courses</p>
                <a href="/courses" className="btn-primary inline-block">Browse Courses</a>
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Today's Schedule</h2>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((course, i) => {
                  const section = sections.find(s => s.course_id === course.id);
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="w-24 text-sm font-medium text-primary">
                        {section?.schedule.time || 'TBA'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.code} • {section?.schedule.room || 'TBA'}</p>
                      </div>
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No classes scheduled</p>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Teacher Dashboard
  if (profile?.role === 'teacher') {
    return (
      <MainLayout>
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {profile.firstName || 'Professor'}! 📚
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your courses and track student progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Teaching Courses"
              value={teacherCourses.length}
              subtitle="This semester"
              icon={BookOpen}
            />
            <StatCard
              title="Total Students"
              value={totalTeacherStudents}
              subtitle="Across all sections"
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Sections"
              value={teacherSections.length}
              subtitle="Active sections"
              icon={Calendar}
              variant="success"
            />
            <StatCard
              title="Avg. Enrolled"
              value={teacherSections.length > 0 ? Math.round(totalTeacherStudents / teacherSections.length) : 0}
              subtitle="Per section"
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-elevated p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">My Courses</h2>
              {teacherCourses.length > 0 ? (
                <div className="space-y-3">
                  {teacherCourses.map((course) => {
                    const courseSections = teacherSections.filter(s => s.course_id === course.id);
                    const totalEnrolled = courseSections.reduce((sum, s) => sum + s.enrolled, 0);
                    return (
                      <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {courseSections.length} section{courseSections.length !== 1 ? 's' : ''} • {totalEnrolled} students
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No courses assigned yet</p>
                </div>
              )}
            </div>

            <div className="card-elevated p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Recent Enrollments</h2>
              {teacherEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {teacherEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <UserPlus className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{enrollment.studentName}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.courseName}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recent enrollments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Admin Dashboard
  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard 🎓
          </h1>
          <p className="text-muted-foreground mt-2">
            System overview and management tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon={BookOpen}
          />
          <StatCard
            title="Active Students"
            value={students.length}
            icon={GraduationCap}
            variant="primary"
          />
          <StatCard
            title="Faculty Members"
            value={teachers.length}
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Schools"
            value={schools.length}
            icon={Building2}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Schools Overview</h2>
            {schools.length > 0 ? (
              <div className="space-y-4">
                {schools.map((school) => {
                  const schoolCourses = courses.filter(c => c.school_id === school.id);
                  return (
                    <div key={school.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{school.name}</p>
                        <p className="text-sm text-muted-foreground">Dean: {school.dean}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{schoolCourses.length}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No schools configured</p>
              </div>
            )}
          </div>

          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/courses-admin')}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
              >
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Manage Courses</span>
              </button>
              <button
                onClick={() => navigate('/schedule')}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">View Schedule</span>
              </button>
              <button
                onClick={() => navigate('/my-courses')}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">View Enrollments</span>
              </button>
            </div>

            {/* Recent Enrollments for Admin */}
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Recent Activity</h2>
            {allEnrollments.length > 0 ? (
              <div className="space-y-3">
                {allEnrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{enrollment.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{enrollment.courseName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
