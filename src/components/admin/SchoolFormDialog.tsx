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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAllUsersWithRoles } from '@/hooks/useUsers';

const schoolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  dean_id: z.string().nullable(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

interface SchoolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SchoolFormValues) => void;
  initialData?: { id: string; name: string; dean_id: string | null } | null;
  isLoading?: boolean;
}

export function SchoolFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: SchoolFormDialogProps) {
  const { data: users = [] } = useAllUsersWithRoles();
  
  // Filter to show admins and teachers as potential deans
  const eligibleDeans = users.filter(u => u.role === 'admin' || u.role === 'teacher');

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      dean_id: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ name: initialData.name, dean_id: initialData.dean_id });
    } else {
      form.reset({ name: '', dean_id: null });
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dean_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dean</FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dean" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No dean assigned</SelectItem>
                      {eligibleDeans.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName || ''} {user.lastName || ''} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
