import MainLayout from '@/components/layout/MainLayout';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useSections } from '@/hooks/useSections';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, BookOpen, Loader2 } from 'lucide-react';

const Schedule = () => {
  const { user, profile } = useAuth();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(user?.id);
  const { data: sections = [], isLoading: sectionsLoading } = useSections();

  const isTeacher = profile?.role === 'teacher';

  // For teachers: get sections where they are instructor
  const teacherSections = sections.filter(s => 
    s.instructor_id === user?.id || 
    (profile?.lastName && s.instructor.toLowerCase().includes(profile.lastName.toLowerCase()))
  );
  const teacherCourseIds = [...new Set(teacherSections.map(s => s.course_id))];
  const teacherCourses = courses.filter(c => teacherCourseIds.includes(c.id));

  // For students: get enrolled courses
  const enrolledCourses = courses.filter(c => 
    enrollments.some(e => e.course_id === c.id)
  );

  // Use teacher courses or student enrolled courses based on role
  const displayCourses = isTeacher ? teacherCourses : enrolledCourses;
  const displaySections = isTeacher ? teacherSections : sections.filter(s => 
    enrollments.some(e => e.section_id === s.id)
  );

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Build schedule data
  const scheduleData: Record<string, Array<{ course: typeof courses[0], section: typeof sections[0], startHour: number, duration: number }>> = {};
  
  days.forEach(day => {
    scheduleData[day] = [];
  });

  displayCourses.forEach(course => {
    const section = displaySections.find(s => s.course_id === course.id);
    if (section) {
      section.schedule.days.forEach((day: string) => {
        const timeMatch = section.schedule.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        let startHour = 9; // Default
        if (timeMatch) {
          startHour = parseInt(timeMatch[1]);
          const isPM = timeMatch[3]?.toLowerCase() === 'pm';
          if (isPM && startHour !== 12) startHour += 12;
          if (!isPM && startHour === 12) startHour = 0;
        }
        const duration = section.schedule.time.includes('30') ? 1.5 : 1;
        
        scheduleData[day].push({ course, section, startHour, duration });
      });
    }
  });

  const getScheduleItem = (day: string, hour: number) => {
    return scheduleData[day]?.find(item => item.startHour === hour);
  };

  const colors = [
    'bg-primary/20 border-primary/40 text-primary',
    'bg-success/20 border-success/40 text-success',
    'bg-warning/20 border-warning/40 text-warning',
    'bg-teal-200/50 border-teal-400/40 text-teal-700',
  ];

  const isLoading = coursesLoading || enrollmentsLoading || sectionsLoading;

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Weekly Schedule</h1>
          <p className="text-muted-foreground mt-2">
            View your class schedule for the current week.
          </p>
        </div>

        {displayCourses.length === 0 ? (
          <div className="text-center py-16 card-elevated">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No classes scheduled</h3>
            <p className="text-muted-foreground mb-4">
              {isTeacher ? 'No sections assigned to you yet.' : 'Enroll in courses to see your schedule.'}
            </p>
            {!isTeacher && (
              <a href="/courses" className="btn-primary inline-block">
                Browse Courses
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Schedule Grid */}
            <div className="card-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-20 p-4 text-left text-sm font-medium text-muted-foreground">
                        Time
                      </th>
                      {days.map(day => (
                        <th key={day} className="p-4 text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => {
                      const hour = parseInt(time.split(':')[0]);
                      
                      return (
                        <tr key={time} className="border-b border-border/50 last:border-0">
                          <td className="p-4 text-sm text-muted-foreground align-top">
                            {time}
                          </td>
                          {days.map(day => {
                            const item = getScheduleItem(day, hour);
                            const colorIndex = item ? displayCourses.findIndex(c => c.id === item.course.id) % colors.length : 0;
                            
                            return (
                              <td key={day} className="p-2 align-top h-20">
                                {item && (
                                  <div 
                                    className={`p-3 rounded-lg border-l-4 ${colors[colorIndex]} h-full transition-all hover:scale-[1.02]`}
                                  >
                                    <p className="font-semibold text-sm">{item.course.code}</p>
                                    <p className="text-xs mt-1 opacity-80 line-clamp-1">
                                      {item.course.title}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                                      <MapPin className="w-3 h-3" />
                                      <span>{item.section.schedule.room}</span>
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 card-elevated p-4">
              <h3 className="font-medium text-foreground mb-4">Your Courses</h3>
              <div className="flex flex-wrap gap-4">
                {displayCourses.map((course, i) => {
                  const colorIndex = i % colors.length;
                  const section = displaySections.find(s => s.course_id === course.id);
                  
                  return (
                    <div 
                      key={course.id}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg ${colors[colorIndex].replace('text-', 'bg-').split(' ')[0]}`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-sm">{course.code}</p>
                        <p className="text-xs opacity-80">{section?.schedule.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Schedule;
