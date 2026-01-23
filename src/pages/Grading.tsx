import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useSections } from '@/hooks/useSections';
import { useAllEnrollments } from '@/hooks/useAllEnrollments';
import { useAllUsersWithRoles } from '@/hooks/useUsers';
import GradeAssignmentDialog from '@/components/grading/GradeAssignmentDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, GraduationCap, Loader2, Download, Edit2 } from 'lucide-react';
import { exportToCSV, formatDateForExport } from '@/lib/exportUtils';

const Grading = () => {
  const { profile } = useAuth();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: sections = [] } = useSections();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useAllEnrollments();
  const { data: users = [] } = useAllUsersWithRoles();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  // For teachers, only show their sections
  const teacherSections = profile?.role === 'teacher'
    ? sections.filter(s => s.instructor === `${profile.firstName} ${profile.lastName}`)
    : sections;

  const teacherCourseIds = new Set(teacherSections.map(s => s.course_id));
  const filteredCourses = profile?.role === 'teacher'
    ? courses.filter(c => teacherCourseIds.has(c.id))
    : courses;

  // Build enriched enrollments list
  const enrichedEnrollments = enrollments
    .filter(e => {
      if (profile?.role === 'teacher') {
        const section = teacherSections.find(s => s.id === e.section_id);
        return !!section;
      }
      return true;
    })
    .map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      const section = sections.find(s => s.id === enrollment.section_id);
      const student = users.find(u => u.id === enrollment.student_id);
      const studentName = student 
        ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student'
        : 'Unknown Student';

      return {
        ...enrollment,
        courseName: course?.title || 'Unknown Course',
        courseCode: course?.code || '',
        sectionName: section?.section || '',
        instructor: section?.instructor || '',
        studentName,
      };
    })
    .filter(e => {
      const matchesSearch =
        e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = selectedCourse === 'all' || e.course_id === selectedCourse;

      return matchesSearch && matchesCourse;
    });

  const handleExport = () => {
    const exportData = enrichedEnrollments.map(e => ({
      'Student Name': e.studentName,
      'Course Code': e.courseCode,
      'Course Name': e.courseName,
      'Section': e.sectionName,
      'Instructor': e.instructor,
      'Status': e.status,
      'Grade': e.grade || 'Not Graded',
      'Enrolled At': formatDateForExport(e.enrolled_at),
    }));

    exportToCSV(exportData, `grades_${new Date().toISOString().split('T')[0]}`);
  };

  const isLoading = coursesLoading || enrollmentsLoading;

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grading</h1>
            <p className="text-muted-foreground mt-2">
              Assign and manage student grades for your courses.
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Grades
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{enrichedEnrollments.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-success">
                {enrichedEnrollments.filter(e => e.grade).length}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-warning">
                {enrichedEnrollments.filter(e => !e.grade).length}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{filteredCourses.length}</span>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {filteredCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grades Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No enrollments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  enrichedEnrollments.map(enrollment => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{enrollment.courseCode}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.courseName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.sectionName}</TableCell>
                      <TableCell>{enrollment.instructor}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          enrollment.status === 'enrolled'
                            ? 'bg-success/10 text-success'
                            : enrollment.status === 'dropped'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {enrollment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {enrollment.grade ? (
                          <span className={`px-2 py-1 rounded font-medium ${
                            enrollment.grade.startsWith('A')
                              ? 'bg-success/10 text-success'
                              : enrollment.grade.startsWith('B')
                              ? 'bg-primary/10 text-primary'
                              : enrollment.grade.startsWith('C')
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {enrollment.grade}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEnrollment({
                              id: enrollment.id,
                              studentName: enrollment.studentName,
                              courseName: `${enrollment.courseCode} - ${enrollment.courseName}`,
                              currentGrade: enrollment.grade,
                            });
                            setGradeDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Grade
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <GradeAssignmentDialog
          open={gradeDialogOpen}
          onOpenChange={setGradeDialogOpen}
          enrollment={selectedEnrollment}
        />
      </div>
    </MainLayout>
  );
};

export default Grading;
