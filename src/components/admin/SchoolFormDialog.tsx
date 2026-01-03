import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schoolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  dean: z.string().min(1, 'Dean is required').max(100),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

interface SchoolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SchoolFormValues) => void;
  initialData?: { id: string; name: string; dean: string } | null;
  isLoading?: boolean;
}

export function SchoolFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: SchoolFormDialogProps) {
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      dean: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ name: initialData.name, dean: initialData.dean });
    } else {
      form.reset({ name: '', dean: '' });
    }
  }, [initialData, form]);

  const handleSubmit = (data: SchoolFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit School' : 'Add School'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="School of Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dean</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
