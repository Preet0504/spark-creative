import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useSections } from '@/hooks/useSections';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useCourseMaterials } from '@/hooks/useCourseMaterials';
import MaterialsList from '@/components/materials/MaterialsList';
import AddMaterialDialog from '@/components/materials/AddMaterialDialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';

const Materials = () => {
  const { user, profile } = useAuth();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const { data: courses = [] } = useCourses();
  const { data: enrollments = [] } = useEnrollments(user?.id);

  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';
  const isStudent = profile?.role === 'student';

  // Get relevant sections based on role
  const relevantSections = isStudent
    ? sections.filter((s) =>
        enrollments.some((e) => e.section_id === s.id && e.status === 'enrolled')
      )
    : isTeacher
    ? sections.filter((s) => s.instructor_id === user?.id)
    : sections;

  // Auto-select first section if none selected
  if (!selectedSectionId && relevantSections.length > 0) {
    setSelectedSectionId(relevantSections[0].id);
  }

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedCourse = courses.find((c) => c.id === selectedSection?.course_id);

  const { data: materials = [], isLoading: materialsLoading } =
    useCourseMaterials(selectedSectionId);

  const canManage = isAdmin || (isTeacher && selectedSection?.instructor_id === user?.id);

  if (sectionsLoading) {
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
            <h1 className="text-3xl font-bold text-foreground">Course Materials</h1>
            <p className="text-muted-foreground mt-2">
              {isTeacher
                ? 'Upload and manage learning materials for your sections.'
                : 'Access learning materials for your enrolled courses.'}
            </p>
          </div>

          {canManage && selectedSectionId && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          )}
        </div>

        {relevantSections.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Sections Available
            </h2>
            <p className="text-muted-foreground">
              {isStudent
                ? "You're not enrolled in any sections yet. Enroll in a course to access materials."
                : isTeacher
                ? "You're not assigned to any sections yet. Contact an administrator."
                : 'No sections have been created yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Section Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Section
              </label>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {relevantSections.map((section) => {
                    const course = courses.find((c) => c.id === section.course_id);
                    return (
                      <SelectItem key={section.id} value={section.id}>
                        {course?.code} - {course?.title} (Section {section.section})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Section Info */}
            {selectedSection && selectedCourse && (
              <div className="card-elevated p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {selectedCourse.code}: {selectedCourse.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Section {selectedSection.section} • Instructor:{' '}
                      {selectedSection.instructor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {materials.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Materials</p>
                  </div>
                </div>
              </div>
            )}

            {/* Materials List */}
            <MaterialsList
              materials={materials}
              isLoading={materialsLoading}
              canManage={canManage}
            />
          </>
        )}

        {/* Add Material Dialog */}
        {selectedSection && selectedCourse && (
          <AddMaterialDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            sectionId={selectedSection.id}
            courseId={selectedCourse.id}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Materials;
