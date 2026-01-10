import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CourseCard from '@/components/courses/CourseCard';
import SectionSelectDialog from '@/components/enrollment/SectionSelectDialog';
import { useCourses } from '@/hooks/useCourses';
import { useSchools } from '@/hooks/useSchools';
import { useEnrollments, useEnroll } from '@/hooks/useEnrollments';
import { useSections } from '@/hooks/useSections';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Courses = () => {
  const { profile, user } = useAuth();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: schools = [] } = useSchools();
  const { data: enrollments = [] } = useEnrollments(user?.id);
  const { data: sections = [] } = useSections();
  const enrollMutation = useEnroll();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  
  // Section selection dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const enrolledCourseIds = enrollments.map(e => e.course_id);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesSchool = selectedSchool === 'all' || course.school_id === selectedSchool;
    const matchesSemester = selectedSemester === 'all' || course.semester === selectedSemester;
    
    return matchesSearch && matchesSchool && matchesSemester;
  });

  const handleEnrollClick = (courseId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to enroll');
      return;
    }

    if (enrolledCourseIds.includes(courseId)) {
      toast.error('You are already enrolled in this course');
      return;
    }

    const course = courses.find(c => c.id === courseId);
    const courseSections = sections.filter(s => s.course_id === courseId);

    // If only one section, enroll directly
    if (courseSections.length === 1) {
      enrollMutation.mutate({
        courseId,
        sectionId: courseSections[0].id,
        studentId: user.id,
      });
    } else if (courseSections.length > 1) {
      // Multiple sections, show selection dialog
      setSelectedCourseForEnroll({
        id: courseId,
        title: course?.title || 'Unknown Course',
      });
      setSectionDialogOpen(true);
    } else {
      toast.error('No available sections for this course');
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    if (!user?.id || !selectedCourseForEnroll) return;

    enrollMutation.mutate(
      {
        courseId: selectedCourseForEnroll.id,
        sectionId,
        studentId: user.id,
      },
      {
        onSuccess: () => {
          setSectionDialogOpen(false);
          setSelectedCourseForEnroll(null);
        },
      }
    );
  };

  if (coursesLoading) {
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
          <h1 className="text-3xl font-bold text-foreground">Course Catalog</h1>
          <p className="text-muted-foreground mt-2">
            Browse and enroll in available courses for the upcoming semester.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="card-elevated p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by name, code, or description..."
                className="input-field pl-12"
              />
            </div>

            {/* School Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="input-field pl-12 pr-10 appearance-none cursor-pointer"
              >
                <option value="all">All Schools</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Semester Filter */}
            <div className="relative min-w-[150px]">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="input-field pr-10 appearance-none cursor-pointer"
              >
                <option value="all">All Semesters</option>
                <option value="fall">Fall</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredCourses.length}</span> courses
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Enrolled:</span>
            <span className="font-semibold text-primary">{enrolledCourseIds.length}</span>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, i) => (
            <div 
              key={course.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CourseCard
                course={course}
                isEnrolled={enrolledCourseIds.includes(course.id)}
                onEnroll={profile?.role === 'student' ? handleEnrollClick : undefined}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Section Selection Dialog */}
      {selectedCourseForEnroll && (
        <SectionSelectDialog
          open={sectionDialogOpen}
          onOpenChange={(open) => {
            setSectionDialogOpen(open);
            if (!open) setSelectedCourseForEnroll(null);
          }}
          courseId={selectedCourseForEnroll.id}
          courseName={selectedCourseForEnroll.title}
          onSelectSection={handleSectionSelect}
          isEnrolling={enrollMutation.isPending}
        />
      )}
    </MainLayout>
  );
};

export default Courses;
