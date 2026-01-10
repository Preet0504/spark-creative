import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface GradeAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: {
    id: string;
    studentName: string;
    courseName: string;
    currentGrade: string | null;
  } | null;
}

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'I', 'P'];

const GradeAssignmentDialog = ({ open, onOpenChange, enrollment }: GradeAssignmentDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedGrade, setSelectedGrade] = useState(enrollment?.currentGrade || '');

  const updateGradeMutation = useMutation({
    mutationFn: async ({ enrollmentId, grade }: { enrollmentId: string; grade: string }) => {
      const { error } = await supabase
        .from('enrollments')
        .update({ grade })
        .eq('id', enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
      toast.success('Grade updated successfully');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to update grade: ' + error.message);
    },
  });

  if (!enrollment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Grade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Student</p>
            <p className="font-medium">{enrollment.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Course</p>
            <p className="font-medium">{enrollment.courseName}</p>
          </div>
          <div className="space-y-2">
            <Label>Grade</Label>
            <Select
              value={selectedGrade}
              onValueChange={setSelectedGrade}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateGradeMutation.mutate({ enrollmentId: enrollment.id, grade: selectedGrade })}
              disabled={!selectedGrade || updateGradeMutation.isPending}
            >
              {updateGradeMutation.isPending ? 'Saving...' : 'Save Grade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeAssignmentDialog;
