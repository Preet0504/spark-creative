import { useState } from 'react';
import { useSectionsByCourse } from '@/hooks/useSections';
import { useCourses } from '@/hooks/useCourses';
import { usePrerequisiteCheck } from '@/hooks/usePrerequisites';
import { useStudentWaitlist, useWaitlistMutations, useWaitlistBySection } from '@/hooks/useWaitlist';
import { useScheduleConflicts } from '@/hooks/useScheduleConflicts';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, Users, User, AlertTriangle, Clock3, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatConflictMessage } from '@/lib/scheduleUtils';

interface SectionSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  onSelectSection: (sectionId: string) => void;
  isEnrolling: boolean;
}

const SectionSelectDialog = ({
  open,
  onOpenChange,
  courseId,
  courseName,
  onSelectSection,
  isEnrolling,
}: SectionSelectDialogProps) => {
  const { user } = useAuth();
  const { data: sections = [], isLoading } = useSectionsByCourse(courseId);
  const { data: courses = [] } = useCourses();
  const { canEnroll, missingPrerequisites } = usePrerequisiteCheck(courseId, user?.id);
  const { data: studentWaitlist = [] } = useStudentWaitlist(user?.id);
  const { checkConflicts } = useScheduleConflicts(user?.id);
  const { joinWaitlist } = useWaitlistMutations();
  const [joiningWaitlist, setJoiningWaitlist] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const maxStudents = course?.max_students || 30;

  const handleJoinWaitlist = async (sectionId: string) => {
    if (!user) return;
    setJoiningWaitlist(sectionId);
    try {
      await joinWaitlist.mutateAsync({
        studentId: user.id,
        sectionId,
        courseId,
      });
      toast({
        title: 'Added to waitlist',
        description: 'You will be notified when a spot becomes available.',
      });
    } catch (error) {
      toast({
        title: 'Failed to join waitlist',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setJoiningWaitlist(null);
    }
  };

  const isOnWaitlist = (sectionId: string) => 
    studentWaitlist.some(w => w.section_id === sectionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Section</DialogTitle>
          <p className="text-sm text-muted-foreground">{courseName}</p>
        </DialogHeader>

        {/* Prerequisites Warning */}
        {!canEnroll && missingPrerequisites.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Prerequisites Required</AlertTitle>
            <AlertDescription>
              You must complete the following courses before enrolling:
              <div className="flex gap-2 mt-2 flex-wrap">
                {missingPrerequisites.map(prereq => (
                  <Badge key={prereq} variant="outline" className="bg-destructive/10">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading sections...</div>
        ) : sections.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No sections available for this course.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {sections.map(section => {
              const isFull = section.enrolled >= maxStudents;
              const onWaitlist = isOnWaitlist(section.id);
              const conflicts = checkConflicts(section.id);
              const hasConflict = conflicts.length > 0;

              return (
                <div
                  key={section.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !canEnroll || hasConflict
                      ? 'bg-muted/50 border-border cursor-not-allowed opacity-60'
                      : isFull
                        ? 'bg-muted/30 border-border'
                        : 'bg-card border-border hover:border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">Section {section.section}</span>
                        {isFull && (
                          <Badge variant="destructive" className="text-xs">
                            Full
                          </Badge>
                        )}
                        {hasConflict && (
                          <Badge variant="outline" className="text-xs border-destructive/60 text-destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Conflict
                          </Badge>
                        )}
                        {onWaitlist && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock3 className="w-3 h-3 mr-1" />
                            On Waitlist
                          </Badge>
                        )}
                      </div>
                      {hasConflict && (
                        <div className="mb-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                          Conflicts with: {formatConflictMessage(conflicts)}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{section.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{section.enrolled}/{maxStudents} enrolled</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{section.schedule.days.join(', ') || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{section.schedule.time || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="w-4 h-4" />
                          <span>{section.schedule.room || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {hasConflict ? (
                        <Button variant="ghost" size="sm" disabled>
                          Unavailable
                        </Button>
                      ) : !isFull ? (
                        <Button
                          onClick={() => onSelectSection(section.id)}
                          disabled={!canEnroll || isEnrolling}
                          size="sm"
                        >
                          {isEnrolling ? 'Enrolling...' : 'Enroll'}
                        </Button>
                      ) : !onWaitlist ? (
                        <Button
                          onClick={() => handleJoinWaitlist(section.id)}
                          disabled={!canEnroll || joiningWaitlist === section.id}
                          variant="outline"
                          size="sm"
                        >
                          {joiningWaitlist === section.id ? 'Joining...' : 'Join Waitlist'}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          On Waitlist
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionSelectDialog;
