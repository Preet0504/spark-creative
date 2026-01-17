import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const getSignedUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('submissions')
    .createSignedUrl(filePath, 3600); // 1 hour expiry
  
  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
  return data.signedUrl;
};

export interface Assignment {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_points: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string | null;
  file_name: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
}

export const useAssignments = (sectionId?: string) => {
  return useQuery({
    queryKey: ['assignments', sectionId],
    queryFn: async () => {
      let query = supabase.from('assignments').select('*');
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }
      const { data, error } = await query.order('due_date', { ascending: true });
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!sectionId || sectionId === undefined,
  });
};

export const useStudentAssignments = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-assignments', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      // Get student's enrolled sections
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('section_id')
        .eq('student_id', studentId)
        .eq('status', 'enrolled');
      
      if (enrollError) throw enrollError;
      if (!enrollments?.length) return [];
      
      const sectionIds = enrollments.map(e => e.section_id);
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .in('section_id', sectionIds)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!studentId,
  });
};

export const useTeacherAssignments = (instructorId?: string) => {
  return useQuery({
    queryKey: ['teacher-assignments', instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      
      // Get teacher's sections
      const { data: sections, error: secError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('instructor_id', instructorId);
      
      if (secError) throw secError;
      if (!sections?.length) return [];
      
      const sectionIds = sections.map(s => s.id);
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .in('section_id', sectionIds)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!instructorId,
  });
};

export const useSubmissions = (assignmentId?: string) => {
  return useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId);
      if (error) throw error;
      return data as AssignmentSubmission[];
    },
    enabled: !!assignmentId,
  });
};

export const useStudentSubmission = (assignmentId?: string, studentId?: string) => {
  return useQuery({
    queryKey: ['submission', assignmentId, studentId],
    queryFn: async () => {
      if (!assignmentId || !studentId) return null;
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .maybeSingle();
      if (error) throw error;
      return data as AssignmentSubmission | null;
    },
    enabled: !!assignmentId && !!studentId,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast.success('Assignment created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create assignment: ' + error.message);
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Assignment> & { id: string }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast.success('Assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update assignment: ' + error.message);
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      toast.success('Assignment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete assignment: ' + error.message);
    },
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      studentId, 
      file 
    }: { 
      assignmentId: string; 
      studentId: string; 
      file: File 
    }) => {
      // Upload file
      const filePath = `${studentId}/${assignmentId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Store the file path (not public URL since bucket is private)
      // We'll generate signed URLs when displaying
      
      // Create or update submission
      const { data, error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: studentId,
          file_url: filePath,
          file_name: file.name,
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'assignment_id,student_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission'] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Assignment submitted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to submit assignment: ' + error.message);
    },
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      submissionId, 
      grade, 
      feedback,
      gradedBy 
    }: { 
      submissionId: string; 
      grade: number; 
      feedback?: string;
      gradedBy: string;
    }) => {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          grade,
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: gradedBy,
        })
        .eq('id', submissionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission'] });
      toast.success('Submission graded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to grade submission: ' + error.message);
    },
  });
};
