import { Course, CourseSection } from '@/types';
import { getSchoolById, getSectionsByCourseId } from '@/data/sampleData';
import { Clock, Users, BookOpen, ChevronRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

const CourseCard = ({ course, onEnroll, isEnrolled }: CourseCardProps) => {
  const school = getSchoolById(course.schoolId);
  const sections = getSectionsByCourseId(course.id);
  const totalEnrolled = sections.reduce((sum, s) => sum + s.enrolled, 0);
  const availableSpots = (course.maxStudents * sections.length) - totalEnrolled;

  const semesterColors = {
    fall: 'badge-teal',
    spring: 'badge-success',
    summer: 'badge-warning',
  };

  return (
    <div className="course-card group">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-primary">{course.code}</span>
              <span className={`badge ${semesterColors[course.semester]}`}>
                {course.semester}
              </span>
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{school?.name}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{course.credits} Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{availableSpots} spots left</span>
          </div>
        </div>

        {course.prerequisites.length > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            Prerequisites: {course.prerequisites.length} course(s) required
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          {isEnrolled ? (
            <span className="badge badge-success">Enrolled</span>
          ) : onEnroll ? (
            <button
              onClick={() => onEnroll(course.id)}
              className="btn-primary text-sm py-2 px-4"
            >
              Enroll Now
            </button>
          ) : null}
          <button className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
