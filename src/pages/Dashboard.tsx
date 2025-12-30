import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useSchools } from '@/hooks/useSchools';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useSections } from '@/hooks/useSections';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/ui/stat-card';
import CourseCard from '@/components/courses/CourseCard';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  Building2,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(user?.id);
  const { data: sections = [] } = useSections();

  const enrolledCourses = courses.filter(c => 
    enrollments.some(e => e.course_id === c.id)
  );

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

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
              value="3.75"
              subtitle="Current semester"
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
              value={courses.length > 4 ? 4 : courses.length}
              subtitle="This semester"
              icon={BookOpen}
            />
            <StatCard
              title="Total Students"
              value={sections.reduce((sum, s) => sum + s.enrolled, 0)}
              subtitle="Across all courses"
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Avg. Performance"
              value="85%"
              subtitle="Class average"
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Office Hours"
              value="6"
              subtitle="Hours this week"
              icon={Clock}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-elevated p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">My Courses</h2>
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => {
                  const section = sections.find(s => s.course_id === course.id);
                  return (
                    <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.code} • {section?.enrolled || 0} students</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-elevated p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'Assignment submitted', course: courses[0]?.code || 'CS101', time: '2 hours ago' },
                  { action: 'New enrollment', course: courses[1]?.code || 'CS201', time: '5 hours ago' },
                  { action: 'Grade posted', course: courses[0]?.code || 'CS101', time: '1 day ago' },
                  { action: 'Course material updated', course: courses[2]?.code || 'BUS101', time: '2 days ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.course}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
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
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Students"
            value="1,247"
            icon={GraduationCap}
            variant="primary"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Faculty Members"
            value="86"
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
          </div>

          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: 'Add New Course', icon: BookOpen },
                { label: 'Manage Users', icon: Users },
                { label: 'View Reports', icon: TrendingUp },
                { label: 'System Settings', icon: Building2 },
              ].map((action, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
