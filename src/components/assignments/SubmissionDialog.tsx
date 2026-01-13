import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, File, CheckCircle } from 'lucide-react';
import { useSubmitAssignment, useStudentSubmission, Assignment } from '@/hooks/useAssignments';
import { format } from 'date-fns';

interface SubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  studentId: string;
}

const SubmissionDialog = ({
  open,
  onOpenChange,
  assignment,
  studentId,
}: SubmissionDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: existingSubmission } = useStudentSubmission(assignment?.id, studentId);
  const submitMutation = useSubmitAssignment();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !assignment) return;
    
    submitMutation.mutate({
      assignmentId: assignment.id,
      studentId,
      file: selectedFile,
    }, {
      onSuccess: () => {
        setSelectedFile(null);
        onOpenChange(false);
      },
    });
  };

  if (!assignment) return null;

  const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{assignment.title}</h3>
            {assignment.description && (
              <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
            )}
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Max Points:</span>{' '}
              <span className="font-medium">{assignment.max_points}</span>
            </div>
            {assignment.due_date && (
              <div>
                <span className="text-muted-foreground">Due:</span>{' '}
                <span className={`font-medium ${isPastDue ? 'text-destructive' : ''}`}>
                  {format(new Date(assignment.due_date), 'PPp')}
                </span>
              </div>
            )}
          </div>

          {existingSubmission && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Previously submitted: {existingSubmission.file_name}</span>
              </div>
              {existingSubmission.grade !== null && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Grade:</span>{' '}
                  <span className="font-medium">{existingSubmission.grade}/{assignment.max_points}</span>
                  {existingSubmission.feedback && (
                    <p className="text-muted-foreground mt-1">Feedback: {existingSubmission.feedback}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Upload File</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload (PDF, DOC, DOCX, JPG, PNG)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedFile || submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDialog;
