import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CourseCard from '@/components/courses/CourseCard';
import { courses, schools, sampleEnrollments } from '@/data/sampleData';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(
    sampleEnrollments.filter(e => e.status === 'enrolled').map(e => e.courseId)
  );

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSchool = selectedSchool === 'all' || course.schoolId === selectedSchool;
    const matchesSemester = selectedSemester === 'all' || course.semester === selectedSemester;
    
    return matchesSearch && matchesSchool && matchesSemester;
  });

  const handleEnroll = (courseId: string) => {
    if (enrolledCourses.includes(courseId)) {
      toast.error('You are already enrolled in this course');
      return;
    }
    
    setEnrolledCourses([...enrolledCourses, courseId]);
    const course = courses.find(c => c.id === courseId);
    toast.success(`Successfully enrolled in ${course?.title}!`);
  };

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
            <span className="font-semibold text-primary">{enrolledCourses.length}</span>
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
                isEnrolled={enrolledCourses.includes(course.id)}
                onEnroll={user?.role === 'student' ? handleEnroll : undefined}
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
    </MainLayout>
  );
};

export default Courses;
