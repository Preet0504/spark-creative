import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useUsersByRole } from '@/hooks/useUsers';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const sectionSchema = z.object({
  section: z.string().min(1, 'Section name is required').max(20),
  instructorId: z.string().min(1, 'Instructor is required'),
  days: z.array(z.string()).min(1, 'Select at least one day'),
  time: z.string().min(1, 'Time is required'),
  room: z.string().min(1, 'Room is required').max(50),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    section: string; 
    instructor: string; 
    instructor_id: string;
    schedule: { days: string[]; time: string; room: string } 
  }) => void;
  initialData?: {
    id: string;
    section: string;
    instructor: string;
    instructor_id?: string;
    schedule: { days: string[]; time: string; room: string };
  } | null;
  isLoading?: boolean;
  courseTitle?: string;
}

export function SectionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
  courseTitle,
}: SectionFormDialogProps) {
  const { data: teachers = [] } = useUsersByRole('teacher');
  
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section: '',
      instructorId: '',
      days: [],
      time: '',
      room: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      // Try to find the teacher by name if instructor_id is not set
      let instructorId = initialData.instructor_id || '';
      if (!instructorId && initialData.instructor) {
        const matchingTeacher = teachers.find(t => {
          const fullName = `${t.firstName || ''} ${t.lastName || ''}`.trim();
          return fullName.toLowerCase() === initialData.instructor.toLowerCase() ||
                 initialData.instructor.toLowerCase().includes((t.lastName || '').toLowerCase());
        });
        if (matchingTeacher) {
          instructorId = matchingTeacher.id;
        }
      }
      
      form.reset({
        section: initialData.section,
        instructorId,
        days: initialData.schedule.days,
        time: initialData.schedule.time,
        room: initialData.schedule.room,
      });
    } else {
      form.reset({
        section: '',
        instructorId: '',
        days: [],
        time: '',
        room: '',
      });
    }
  }, [initialData, form, teachers]);

  const handleSubmit = (data: SectionFormValues) => {
    const selectedTeacher = teachers.find(t => t.id === data.instructorId);
    const instructorName = selectedTeacher 
      ? `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`.trim()
      : 'Unknown';

    onSubmit({
      section: data.section,
      instructor: instructorName,
      instructor_id: data.instructorId,
      schedule: {
        days: data.days,
        time: data.time,
        room: data.room,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Section' : 'Add Section'}
            {courseTitle && <span className="text-muted-foreground font-normal"> - {courseTitle}</span>}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update section details' : 'Create a new section and assign an instructor'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.firstName || teacher.lastName 
                              ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
                              : `Teacher (${teacher.id.slice(0, 8)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="days"
              render={() => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <div className="flex gap-4">
                    {DAYS.map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="days"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, day]);
                                  } else {
                                    field.onChange(field.value?.filter((d) => d !== day));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{day}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
