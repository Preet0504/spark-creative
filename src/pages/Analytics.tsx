import { useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCourses } from '@/hooks/useCourses';
import { useSchools } from '@/hooks/useSchools';
import { useSections } from '@/hooks/useSections';
import { useAllEnrollments } from '@/hooks/useAllEnrollments';
import { useAllUsersWithRoles } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, BookOpen, GraduationCap, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: schools } = useSchools();
  const { data: sections } = useSections();
  const { data: enrollments, isLoading: enrollmentsLoading } = useAllEnrollments();
  const { data: users, isLoading: usersLoading } = useAllUsersWithRoles();

  const isLoading = coursesLoading || enrollmentsLoading || usersLoading;

  const stats = useMemo(() => {
    const studentCount = users?.filter((u) => u.role === 'student').length || 0;
    const teacherCount = users?.filter((u) => u.role === 'teacher').length || 0;
    const adminCount = users?.filter((u) => u.role === 'admin').length || 0;

    return {
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalAdmins: adminCount,
      totalCourses: courses?.length || 0,
      totalSchools: schools?.length || 0,
      totalSections: sections?.length || 0,
      totalEnrollments: enrollments?.length || 0,
    };
  }, [users, courses, schools, sections, enrollments]);

  const enrollmentsByStatus = useMemo(() => {
    if (!enrollments) return [];
    const statusCounts: Record<string, number> = {};
    enrollments.forEach((e) => {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  const coursesBySemester = useMemo(() => {
    if (!courses) return [];
    const semesterCounts: Record<string, number> = {};
    courses.forEach((c) => {
      semesterCounts[c.semester] = (semesterCounts[c.semester] || 0) + 1;
    });
    return Object.entries(semesterCounts).map(([name, count]) => ({ name, count }));
  }, [courses]);

  const usersByRole = useMemo(() => {
    return [
      { name: 'Students', value: stats.totalStudents, fill: 'hsl(var(--primary))' },
      { name: 'Teachers', value: stats.totalTeachers, fill: 'hsl(var(--secondary))' },
      { name: 'Admins', value: stats.totalAdmins, fill: 'hsl(var(--accent))' },
    ];
  }, [stats]);

  const topCoursesByEnrollment = useMemo(() => {
    if (!enrollments || !courses) return [];
    const enrollmentCounts: Record<string, number> = {};
    enrollments.forEach((e) => {
      enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1;
    });
    return courses
      .map((c) => ({ name: c.code, enrollments: enrollmentCounts[c.id] || 0 }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);
  }, [enrollments, courses]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const chartConfig = {
    count: { label: 'Count', color: 'hsl(var(--primary))' },
    enrollments: { label: 'Enrollments', color: 'hsl(var(--primary))' },
    value: { label: 'Count' },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Overview of system statistics and trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Courses by Semester */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Courses by Semester
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={coursesBySemester}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={usersByRole}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Courses by Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCoursesByEnrollment.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No enrollment data yet.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={topCoursesByEnrollment} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSections}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Active and completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Students per Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCourses > 0
                  ? Math.round(stats.totalEnrollments / stats.totalCourses)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Based on enrollments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
