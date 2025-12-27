import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { courses, sampleEnrollments, getSectionsByCourseId, getSchoolById } from '@/data/sampleData';
import { BookOpen, Clock, Users, MapPin, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const MyCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState(sampleEnrollments);

  const enrolledCourses = courses.filter(c => 
    enrollments.some(e => e.courseId === c.id && e.status === 'enrolled')
  );

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

  const handleDrop = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setEnrollments(enrollments.filter(e => e.courseId !== courseId));
    toast.success(`Dropped ${course?.title}`);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'student' 
              ? 'View and manage your current course enrollments.'
              : 'View your assigned courses and student enrollment.'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{enrolledCourses.length}</p>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </div>
          
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCredits}</p>
                <p className="text-sm text-muted-foreground">Total Credits</p>
              </div>
            </div>
          </div>
          
          <div className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Fall 2024</p>
                <p className="text-sm text-muted-foreground">Current Semester</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {enrolledCourses.map((course, i) => {
            const sections = getSectionsByCourseId(course.id);
            const section = sections[0];
            const school = getSchoolById(course.schoolId);

            return (
              <div 
                key={course.id}
                className="card-elevated p-6 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-primary">{course.code}</span>
                      <span className="badge badge-teal">{course.semester}</span>
                      <span className="badge badge-success">{course.credits} Credits</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{course.description}</p>
                    <p className="text-sm text-muted-foreground">{school?.name}</p>
                  </div>

                  {/* Section Details */}
                  {section && (
                    <div className="lg:w-72 p-4 rounded-lg bg-secondary/30">
                      <p className="font-medium text-foreground mb-3">Section {section.section}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{section.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{section.schedule.days.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{section.schedule.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Room {section.schedule.room}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {user?.role === 'student' && (
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleDrop(course.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Drop Course
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {enrolledCourses.length === 0 && (
          <div className="text-center py-16 card-elevated">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses enrolled</h3>
            <p className="text-muted-foreground mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <a href="/courses" className="btn-primary inline-block">
              Browse Courses
            </a>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyCourses;
