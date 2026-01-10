import { useSectionsByCourse } from '@/hooks/useSections';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, User } from 'lucide-react';

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
  const { data: sections = [], isLoading } = useSectionsByCourse(courseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select a Section</DialogTitle>
          <p className="text-sm text-muted-foreground">{courseName}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading sections...</div>
        ) : sections.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No sections available for this course.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {sections.map(section => {
              const isFull = section.enrolled >= 30; // Assuming max 30 per section

              return (
                <div
                  key={section.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isFull
                      ? 'bg-muted/50 border-border cursor-not-allowed opacity-60'
                      : 'bg-card border-border hover:border-primary cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">Section {section.section}</span>
                        {isFull && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive">
                            Full
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{section.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{section.enrolled}/30 enrolled</span>
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
                    <Button
                      onClick={() => onSelectSection(section.id)}
                      disabled={isFull || isEnrolling}
                      size="sm"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll'}
                    </Button>
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
