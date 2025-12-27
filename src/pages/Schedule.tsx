import MainLayout from '@/components/layout/MainLayout';
import { courses, sampleEnrollments, getSectionsByCourseId } from '@/data/sampleData';
import { Clock, MapPin, BookOpen } from 'lucide-react';

const Schedule = () => {
  const enrolledCourses = courses.filter(c => 
    sampleEnrollments.some(e => e.courseId === c.id && e.status === 'enrolled')
  );

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Build schedule data
  const scheduleData: Record<string, Array<{ course: typeof courses[0], section: any, startHour: number, duration: number }>> = {};
  
  days.forEach(day => {
    scheduleData[day] = [];
  });

  enrolledCourses.forEach(course => {
    const sections = getSectionsByCourseId(course.id);
    const section = sections[0];
    if (section) {
      section.schedule.days.forEach((day: string) => {
        const [start] = section.schedule.time.split('-');
        const startHour = parseInt(start.split(':')[0]);
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
                {timeSlots.map((time, hourIndex) => {
                  const hour = parseInt(time.split(':')[0]);
                  
                  return (
                    <tr key={time} className="border-b border-border/50 last:border-0">
                      <td className="p-4 text-sm text-muted-foreground align-top">
                        {time}
                      </td>
                      {days.map(day => {
                        const item = getScheduleItem(day, hour);
                        const colorIndex = item ? enrolledCourses.findIndex(c => c.id === item.course.id) % colors.length : 0;
                        
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
            {enrolledCourses.map((course, i) => {
              const colorIndex = i % colors.length;
              const sections = getSectionsByCourseId(course.id);
              const section = sections[0];
              
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
      </div>
    </MainLayout>
  );
};

export default Schedule;
