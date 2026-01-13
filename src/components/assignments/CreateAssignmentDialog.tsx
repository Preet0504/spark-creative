import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAssignment, useUpdateAssignment, Assignment } from '@/hooks/useAssignments';

interface Section {
  id: string;
  section: string;
  course_id: string;
  course?: {
    code: string;
    title: string;
  };
}

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: Section[];
  userId: string;
  assignment?: Assignment | null;
}

const CreateAssignmentDialog = ({
  open,
  onOpenChange,
  sections,
  userId,
  assignment,
}: CreateAssignmentDialogProps) => {
  const [title, setTitle] = useState(assignment?.title || '');
  const [description, setDescription] = useState(assignment?.description || '');
  const [sectionId, setSectionId] = useState(assignment?.section_id || '');
  const [dueDate, setDueDate] = useState(
    assignment?.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : ''
  );
  const [maxPoints, setMaxPoints] = useState(assignment?.max_points?.toString() || '100');

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const selectedSection = sections.find(s => s.id === sectionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title,
      description: description || null,
      section_id: sectionId,
      course_id: selectedSection?.course_id || '',
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      max_points: parseInt(maxPoints) || 100,
      created_by: userId,
    };

    if (assignment) {
      updateMutation.mutate({ id: assignment.id, ...data }, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSectionId('');
    setDueDate('');
    setMaxPoints('100');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select value={sectionId} onValueChange={setSectionId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.course?.code} - Section {section.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assignment instructions..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPoints">Max Points</Label>
              <Input
                id="maxPoints"
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !sectionId || !title}>
              {isLoading ? 'Saving...' : assignment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
