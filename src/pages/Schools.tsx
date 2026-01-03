import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useSchools } from '@/hooks/useSchools';
import { useCourses } from '@/hooks/useCourses';
import { useCreateSchool, useUpdateSchool, useDeleteSchool } from '@/hooks/useSchoolMutations';
import { SchoolFormDialog } from '@/components/admin/SchoolFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from 'lucide-react';

interface School {
  id: string;
  name: string;
  dean: string;
}

export default function Schools() {
  const { data: schools, isLoading } = useSchools();
  const { data: courses } = useCourses();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const getCourseCount = (schoolId: string) => {
    return courses?.filter((c) => c.school_id === schoolId).length || 0;
  };

  const handleCreate = () => {
    setSelectedSchool(null);
    setFormOpen(true);
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setFormOpen(true);
  };

  const handleDelete = (school: School) => {
    setSelectedSchool(school);
    setDeleteOpen(true);
  };

  const handleSubmit = (data: { name: string; dean: string }) => {
    if (selectedSchool) {
      updateSchool.mutate({ id: selectedSchool.id, ...data }, {
        onSuccess: () => setFormOpen(false),
      });
    } else {
      createSchool.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedSchool) {
      deleteSchool.mutate(selectedSchool.id, {
        onSuccess: () => setDeleteOpen(false),
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schools</h1>
            <p className="text-muted-foreground">Manage academic schools and departments</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              All Schools ({schools?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schools?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No schools found. Add your first school to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Dean</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools?.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.dean}</TableCell>
                      <TableCell>{getCourseCount(school.id)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(school)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(school)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <SchoolFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={selectedSchool}
        isLoading={createSchool.isPending || updateSchool.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Delete School"
        description={`Are you sure you want to delete "${selectedSchool?.name}"? This action cannot be undone.`}
        isLoading={deleteSchool.isPending}
      />
    </MainLayout>
  );
}
