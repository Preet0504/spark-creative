import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useGradeSubmission, AssignmentSubmission, Assignment, getSignedUrl } from '@/hooks/useAssignments';

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: AssignmentSubmission | null;
  assignment: Assignment | null;
  studentName: string;
  graderId: string;
}

const GradeSubmissionDialog = ({
  open,
  onOpenChange,
  submission,
  assignment,
  studentName,
  graderId,
}: GradeSubmissionDialogProps) => {
  const [grade, setGrade] = useState(submission?.grade?.toString() || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  
  const gradeMutation = useGradeSubmission();

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (submission?.file_url && open) {
        setLoadingUrl(true);
        const url = await getSignedUrl(submission.file_url);
        setSignedUrl(url);
        setLoadingUrl(false);
      }
    };
    fetchSignedUrl();
  }, [submission?.file_url, open]);

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade?.toString() || '');
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    
    gradeMutation.mutate({
      submissionId: submission.id,
      grade: parseFloat(grade),
      feedback: feedback || undefined,
      gradedBy: graderId,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!submission || !assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium">{studentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assignment</span>
              <span className="font-medium">{assignment.title}</span>
            </div>
          </div>

          {submission.file_url && (
            <div className="p-3 bg-muted rounded-lg">
              {loadingUrl ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading file link...
                </div>
              ) : signedUrl ? (
                <a 
                  href={signedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Submission: {submission.file_name}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">File: {submission.file_name}</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="grade">Grade (out of {assignment.max_points})</Label>
            <Input
              id="grade"
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max={assignment.max_points}
              step="0.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!grade || gradeMutation.isPending}>
              {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSubmissionDialog;
