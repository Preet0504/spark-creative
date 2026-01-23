import { Database } from '@/integrations/supabase/types';
import { Clock, Users, BookOpen, ChevronRight } from 'lucide-react';

type Course = Database['public']['Tables']['courses']['Row'];
type School = Database['public']['Tables']['schools']['Row'];

interface CourseWithSchool extends Course {
  schools: School | null;
}

interface CourseCardProps {
  course: CourseWithSchool;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

const CourseCard = ({ course, onEnroll, isEnrolled }: CourseCardProps) => {
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
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{course.schools?.name}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {course.description || 'No description available.'}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{course.credits} Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{course.max_students} max</span>
          </div>
        </div>

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="text-xs text-muted-foreground mb-4 px-3 py-2 rounded-lg bg-secondary/50">
            <span className="font-medium">Prerequisites:</span> {course.prerequisites.length} course(s) required
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          {isEnrolled ? (
            <span className="badge badge-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              Enrolled
            </span>
          ) : onEnroll ? (
            <button
              onClick={() => onEnroll(course.id)}
              className="btn-primary text-sm py-2 px-4"
            >
              Enroll Now
            </button>
          ) : (
            <span className="text-sm text-muted-foreground">View Only</span>
          )}
          <button className="flex items-center gap-1 text-sm text-primary font-medium hover:underline group/link">
            View Details
            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
