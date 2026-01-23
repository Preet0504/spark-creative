import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCourses } from '@/hooks/useCourses';
import { useSchools } from '@/hooks/useSchools';
import { useSections } from '@/hooks/useSections';
import { useCreateCourse, useUpdateCourse, useDeleteCourse } from '@/hooks/useCourseMutations';
import { useCreateSection, useUpdateSection, useDeleteSection } from '@/hooks/useSectionMutations';
import { CourseFormDialog } from '@/components/admin/CourseFormDialog';
import { SectionFormDialog } from '@/components/admin/SectionFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Users,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Course = Database['public']['Tables']['courses']['Row'];
type SemesterType = Database['public']['Enums']['semester_type'];

interface SectionData {
  id: string;
  section: string;
  instructor: string;
  schedule: { days: string[]; time: string; room: string };
  enrolled: number;
  course_id: string;
}

export default function CoursesAdmin() {
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: schools } = useSchools();
  const { data: sections } = useSections();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();

  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSectionOpen, setDeleteSectionOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const getSchoolName = (schoolId: string | null) => {
    return schools?.find((s) => s.id === schoolId)?.name || 'Unassigned';
  };

  const getCourseSections = (courseId: string) => {
    return sections?.filter((s) => s.course_id === courseId) || [];
  };

  const toggleExpanded = (courseId: string) => {
    const next = new Set(expandedCourses);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
    }
    setExpandedCourses(next);
  };

  const filteredCourses = courses?.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setCourseFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseFormOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setDeleteOpen(true);
  };

  const handleCourseSubmit = (data: {
    code: string;
    title: string;
    description?: string;
    credits: number;
    max_students: number;
    semester: SemesterType;
    school_id?: string;
  }) => {
    if (selectedCourse) {
      updateCourse.mutate({ id: selectedCourse.id, ...data }, {
        onSuccess: () => setCourseFormOpen(false),
      });
    } else {
      createCourse.mutate(data, {
        onSuccess: () => setCourseFormOpen(false),
      });
    }
  };

  const handleConfirmDeleteCourse = () => {
    if (selectedCourse) {
      deleteCourse.mutate(selectedCourse.id, {
        onSuccess: () => setDeleteOpen(false),
      });
    }
  };

  const handleAddSection = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSection(null);
    setSectionFormOpen(true);
  };

  const handleEditSection = (course: Course, section: SectionData) => {
    setSelectedCourse(course);
    setSelectedSection(section);
    setSectionFormOpen(true);
  };

  const handleDeleteSection = (section: SectionData) => {
    setSelectedSection(section);
    setDeleteSectionOpen(true);
  };

  const handleSectionSubmit = (data: {
    section: string;
    instructor: string;
    instructor_id?: string;
    schedule: { days: string[]; time: string; room: string };
  }) => {
    if (selectedSection) {
      updateSection.mutate({ id: selectedSection.id, ...data }, {
        onSuccess: () => setSectionFormOpen(false),
      });
    } else if (selectedCourse) {
      createSection.mutate({ course_id: selectedCourse.id, ...data }, {
        onSuccess: () => setSectionFormOpen(false),
      });
    }
  };

  const handleConfirmDeleteSection = () => {
    if (selectedSection) {
      deleteSection.mutate(selectedSection.id, {
        onSuccess: () => setDeleteSectionOpen(false),
      });
    }
  };

  if (coursesLoading) {
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
            <h1 className="text-3xl font-bold">Courses</h1>
            <p className="text-muted-foreground">Manage courses and their sections</p>
          </div>
          <Button onClick={handleCreateCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Courses ({filteredCourses?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCourses?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No courses found.</p>
            ) : (
              <div className="space-y-2">
                {filteredCourses?.map((course) => {
                  const courseSections = getCourseSections(course.id);
                  const isExpanded = expandedCourses.has(course.id);

                  return (
                    <Collapsible key={course.id} open={isExpanded}>
                      <div className="border rounded-lg">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleExpanded(course.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">{course.code}</span>
                                <span className="font-medium">{course.title}</span>
                                <Badge variant="outline">{course.semester}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {getSchoolName(course.school_id)} · {course.credits} credits ·{' '}
                                {courseSections.length} section(s)
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAddSection(course)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Section
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditCourse(course)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="border-t px-4 py-3 bg-muted/30">
                            {courseSections.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No sections yet.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Enrolled</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {courseSections.map((section) => (
                                    <TableRow key={section.id}>
                                      <TableCell className="font-medium">{section.section}</TableCell>
                                      <TableCell>{section.instructor}</TableCell>
                                      <TableCell>
                                        {section.schedule.days.join(', ')} {section.schedule.time}
                                      </TableCell>
                                      <TableCell>{section.schedule.room}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                          {section.enrolled}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditSection(course, section)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteSection(section)}
                                          >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CourseFormDialog
        open={courseFormOpen}
        onOpenChange={setCourseFormOpen}
        onSubmit={handleCourseSubmit}
        initialData={selectedCourse}
        isLoading={createCourse.isPending || updateCourse.isPending}
      />

      <SectionFormDialog
        open={sectionFormOpen}
        onOpenChange={setSectionFormOpen}
        onSubmit={handleSectionSubmit}
        initialData={selectedSection}
        isLoading={createSection.isPending || updateSection.isPending}
        courseTitle={selectedCourse?.title}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDeleteCourse}
        title="Delete Course"
        description={`Are you sure you want to delete "${selectedCourse?.code} - ${selectedCourse?.title}"? This will also delete all sections.`}
        isLoading={deleteCourse.isPending}
      />

      <DeleteConfirmDialog
        open={deleteSectionOpen}
        onOpenChange={setDeleteSectionOpen}
        onConfirm={handleConfirmDeleteSection}
        title="Delete Section"
        description={`Are you sure you want to delete section "${selectedSection?.section}"?`}
        isLoading={deleteSection.isPending}
      />
    </MainLayout>
  );
}
