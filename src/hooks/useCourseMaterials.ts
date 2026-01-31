import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseMaterial {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  description: string | null;
  type: 'file' | 'link' | 'text';
  file_url: string | null;
  file_name: string | null;
  link_url: string | null;
  content: string | null;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useCourseMaterials = (sectionId?: string) => {
  return useQuery({
    queryKey: ['course-materials', sectionId],
    queryFn: async () => {
      let query = supabase
        .from('course_materials')
        .select('*')
        .order('order_index', { ascending: true });

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CourseMaterial[];
    },
    enabled: !!sectionId,
  });
};

export const useCourseMaterialsByCourse = (courseId?: string) => {
  return useQuery({
    queryKey: ['course-materials-by-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId!)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as CourseMaterial[];
    },
    enabled: !!courseId,
  });
};

export const useCourseMaterialMutations = () => {
  const queryClient = useQueryClient();

  const uploadFile = async (file: File, sectionId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${sectionId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    return fileName;
  };

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('course-materials')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  };

  const createMaterial = useMutation({
    mutationFn: async (data: {
      section_id: string;
      course_id: string;
      title: string;
      description?: string;
      type: 'file' | 'link' | 'text';
      file?: File;
      link_url?: string;
      content?: string;
      created_by: string;
    }) => {
      let file_url: string | null = null;
      let file_name: string | null = null;

      if (data.type === 'file' && data.file) {
        file_url = await uploadFile(data.file, data.section_id);
        file_name = data.file.name;
      }

      const { data: material, error } = await supabase
        .from('course_materials')
        .insert({
          section_id: data.section_id,
          course_id: data.course_id,
          title: data.title,
          description: data.description || null,
          type: data.type,
          file_url,
          file_name,
          link_url: data.type === 'link' ? data.link_url : null,
          content: data.type === 'text' ? data.content : null,
          created_by: data.created_by,
        })
        .select()
        .single();

      if (error) throw error;
      return material;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', variables.section_id] });
      queryClient.invalidateQueries({ queryKey: ['course-materials-by-course', variables.course_id] });
      toast.success('Material added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add material: ${error.message}`);
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      description?: string;
      link_url?: string;
      content?: string;
      order_index?: number;
    }) => {
      const { data: material, error } = await supabase
        .from('course_materials')
        .update({
          title: data.title,
          description: data.description,
          link_url: data.link_url,
          content: data.content,
          order_index: data.order_index,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return material;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-materials'] });
      toast.success('Material updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update material: ${error.message}`);
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (material: CourseMaterial) => {
      // Delete file from storage if exists
      if (material.file_url) {
        await supabase.storage.from('course-materials').remove([material.file_url]);
      }

      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', material.id);

      if (error) throw error;
      return material;
    },
    onSuccess: (material) => {
      queryClient.invalidateQueries({ queryKey: ['course-materials', material.section_id] });
      queryClient.invalidateQueries({ queryKey: ['course-materials-by-course', material.course_id] });
      toast.success('Material deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete material: ${error.message}`);
    },
  });

  return {
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getSignedUrl,
  };
};
