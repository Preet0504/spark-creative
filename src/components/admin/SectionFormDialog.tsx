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
  instructor: z.string().min(1, 'Instructor is required').max(100),
  days: z.array(z.string()).min(1, 'Select at least one day'),
  time: z.string().min(1, 'Time is required'),
  room: z.string().min(1, 'Room is required').max(50),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { section: string; instructor: string; schedule: { days: string[]; time: string; room: string } }) => void;
  initialData?: {
    id: string;
    section: string;
    instructor: string;
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
  const { data: teachers } = useUsersByRole('teacher');
  
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section: '',
      instructor: '',
      days: [],
      time: '',
      room: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        section: initialData.section,
        instructor: initialData.instructor,
        days: initialData.schedule.days,
        time: initialData.schedule.time,
        room: initialData.schedule.room,
      });
    } else {
      form.reset({
        section: '',
        instructor: '',
        days: [],
        time: '',
        room: '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: SectionFormValues) => {
    onSubmit({
      section: data.section,
      instructor: data.instructor,
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
                      <Input placeholder="A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers?.map((teacher) => (
                          <SelectItem key={teacher.id} value={`${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.id}>
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
                      <Input placeholder="9:00 AM - 10:30 AM" {...field} />
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
                      <Input placeholder="Room 101" {...field} />
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
