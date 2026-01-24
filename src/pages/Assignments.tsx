import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSections } from '@/hooks/useSections';
import { useCourses } from '@/hooks/useCourses';
import {
  useTeacherAssignments,
  useStudentAssignments,
  useSubmissions,
  Assignment,
  AssignmentSubmission,
  SubmissionWithStudent,
  getSignedUrl,
} from '@/hooks/useAssignments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import CreateAssignmentDialog from '@/components/assignments/CreateAssignmentDialog';
import SubmissionDialog from '@/components/assignments/SubmissionDialog';
import GradeSubmissionDialog from '@/components/assignments/GradeSubmissionDialog';

// Component to display file link with signed URL
const SubmissionFileLink = ({ filePath, fileName }: { filePath: string | null; fileName: string | null }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUrl = async () => {
      if (filePath) {
        setLoading(true);
        const url = await getSignedUrl(filePath);
        setSignedUrl(url);
        setLoading(false);
      }
    };
    fetchUrl();
  }, [filePath]);

  if (!filePath) return <span className="text-muted-foreground">No file</span>;
  if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
  if (!signedUrl) return <span className="text-muted-foreground">{fileName}</span>;

  return (
    <a 
      href={signedUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {fileName}
    </a>
  );
};

const Assignments = () => {
  const { user, profile } = useAuth();
  const { data: sections = [] } = useSections();
  const { data: courses = [] } = useCourses();
  
  
  const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'admin';
  
  const { data: teacherAssignments = [], isLoading: teacherLoading } = useTeacherAssignments(
    isTeacherOrAdmin ? user?.id : undefined
  );
  const { data: studentAssignments = [], isLoading: studentLoading } = useStudentAssignments(
    !isTeacherOrAdmin ? user?.id : undefined
  );
  
  const assignments = isTeacherOrAdmin ? teacherAssignments : studentAssignments;
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);

  const { data: submissions = [] } = useSubmissions(viewingAssignmentId || undefined);

  const teacherSections = sections
    .filter(s => s.instructor_id === user?.id || profile?.role === 'admin')
    .map(s => ({
      ...s,
      course: courses.find(c => c.id === s.course_id),
    }));

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? `Section ${section.section}` : '';
  };


  const getDueStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return 'overdue';
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDue <= 24) return 'due-soon';
    return 'upcoming';
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    setViewingAssignmentId(assignment.id);
    setSelectedAssignment(assignment);
  };

  const handleGradeSubmission = (submission: SubmissionWithStudent) => {
    setSelectedSubmission(submission);
    setSelectedStudentName(submission.studentName);
    setGradeDialogOpen(true);
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialogOpen(true);
  };

  const isLoading = teacherLoading || studentLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">
              {isTeacherOrAdmin ? 'Create and manage assignments' : 'View and submit your assignments'}
            </p>
          </div>
          {isTeacherOrAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isTeacherOrAdmin ? 'Your Assignments' : 'My Assignments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {isTeacherOrAdmin 
                  ? 'No assignments created yet. Click "Create Assignment" to get started.'
                  : 'No assignments available.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map(assignment => {
                    const dueStatus = getDueStatus(assignment.due_date);
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{getCourseName(assignment.course_id)}</TableCell>
                        <TableCell>{getSectionName(assignment.section_id)}</TableCell>
                        <TableCell>
                          {assignment.due_date 
                            ? format(new Date(assignment.due_date), 'PPp')
                            : 'No due date'}
                        </TableCell>
                        <TableCell>{assignment.max_points}</TableCell>
                        <TableCell>
                          {dueStatus === 'overdue' && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                          {dueStatus === 'due-soon' && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Due Soon
                            </Badge>
                          )}
                          {dueStatus === 'upcoming' && (
                            <Badge variant="outline">Upcoming</Badge>
                          )}
                          {!dueStatus && <Badge variant="outline">Open</Badge>}
                        </TableCell>
                        <TableCell>
                          {isTeacherOrAdmin ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewSubmissions(assignment)}
                            >
                              View Submissions
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSubmitAssignment(assignment)}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Submit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Submissions view for teachers */}
        {isTeacherOrAdmin && viewingAssignmentId && selectedAssignment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Submissions for: {selectedAssignment.title}</span>
                <Button variant="ghost" size="sm" onClick={() => setViewingAssignmentId(null)}>
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No submissions yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map(submission => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.studentName}
                        </TableCell>
                        <TableCell>
                          <SubmissionFileLink filePath={submission.file_url} fileName={submission.file_name} />
                        </TableCell>
                        <TableCell>
                          {format(new Date(submission.submitted_at), 'PPp')}
                        </TableCell>
                        <TableCell>
                          {submission.grade !== null ? (
                            <Badge variant="outline">
                              {submission.grade}/{selectedAssignment.max_points}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            {submission.grade !== null ? 'Edit Grade' : 'Grade'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <CreateAssignmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        sections={teacherSections}
        userId={user?.id || ''}
      />

      <SubmissionDialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
        assignment={selectedAssignment}
        studentId={user?.id || ''}
      />

      <GradeSubmissionDialog
        open={gradeDialogOpen}
        onOpenChange={setGradeDialogOpen}
        submission={selectedSubmission}
        assignment={selectedAssignment}
        studentName={selectedStudentName}
        graderId={user?.id || ''}
      />
    </MainLayout>
  );
};

export default Assignments;
