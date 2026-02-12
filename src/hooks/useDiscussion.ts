import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface DiscussionPost {
  id: string;
  section_id: string;
  course_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  author_profile?: { first_name: string | null; last_name: string | null; profile_picture: string | null };
  replies_count?: number;
  likes_count?: number;
  user_liked?: boolean;
}

export interface DiscussionReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_endorsed: boolean;
  endorsed_by: string | null;
  created_at: string;
  updated_at: string;
  author_profile?: { first_name: string | null; last_name: string | null; profile_picture: string | null };
  likes_count?: number;
  user_liked?: boolean;
}

export function useDiscussionPosts(sectionId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['discussion-posts', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];

      const { data: posts, error } = await supabase
        .from('discussion_posts')
        .select('*')
        .eq('section_id', sectionId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author profiles, reply counts, likes
      const authorIds = [...new Set((posts || []).map(p => p.author_id))];
      const postIds = (posts || []).map(p => p.id);

      const [profilesRes, repliesRes, likesRes, userLikesRes] = await Promise.all([
        authorIds.length > 0
          ? supabase.from('profiles').select('id, first_name, last_name, profile_picture').in('id', authorIds)
          : { data: [] },
        postIds.length > 0
          ? supabase.from('discussion_replies').select('post_id').in('post_id', postIds)
          : { data: [] },
        postIds.length > 0
          ? supabase.from('discussion_likes').select('post_id').in('post_id', postIds).not('post_id', 'is', null)
          : { data: [] },
        postIds.length > 0 && user
          ? supabase.from('discussion_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds).not('post_id', 'is', null)
          : { data: [] },
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const replyCounts = new Map<string, number>();
      (repliesRes.data || []).forEach(r => replyCounts.set(r.post_id, (replyCounts.get(r.post_id) || 0) + 1));
      const likeCounts = new Map<string, number>();
      (likesRes.data || []).forEach(l => { if (l.post_id) likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1); });
      const userLikedSet = new Set((userLikesRes.data || []).map(l => l.post_id));

      return (posts || []).map(p => ({
        ...p,
        author_profile: profileMap.get(p.author_id),
        replies_count: replyCounts.get(p.id) || 0,
        likes_count: likeCounts.get(p.id) || 0,
        user_liked: userLikedSet.has(p.id),
      })) as DiscussionPost[];
    },
    enabled: !!sectionId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!sectionId) return;
    const channel = supabase
      .channel(`discussion-posts-${sectionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discussion_posts', filter: `section_id=eq.${sectionId}` },
        () => queryClient.invalidateQueries({ queryKey: ['discussion-posts', sectionId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sectionId, queryClient]);

  return query;
}

export function useDiscussionReplies(postId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['discussion-replies', postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data: replies, error } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('post_id', postId)
        .order('is_endorsed', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const authorIds = [...new Set((replies || []).map(r => r.author_id))];
      const replyIds = (replies || []).map(r => r.id);

      const [profilesRes, likesRes, userLikesRes] = await Promise.all([
        authorIds.length > 0
          ? supabase.from('profiles').select('id, first_name, last_name, profile_picture').in('id', authorIds)
          : { data: [] },
        replyIds.length > 0
          ? supabase.from('discussion_likes').select('reply_id').in('reply_id', replyIds).not('reply_id', 'is', null)
          : { data: [] },
        replyIds.length > 0 && user
          ? supabase.from('discussion_likes').select('reply_id').eq('user_id', user.id).in('reply_id', replyIds).not('reply_id', 'is', null)
          : { data: [] },
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const likeCounts = new Map<string, number>();
      (likesRes.data || []).forEach(l => { if (l.reply_id) likeCounts.set(l.reply_id, (likeCounts.get(l.reply_id) || 0) + 1); });
      const userLikedSet = new Set((userLikesRes.data || []).map(l => l.reply_id));

      return (replies || []).map(r => ({
        ...r,
        author_profile: profileMap.get(r.author_id),
        likes_count: likeCounts.get(r.id) || 0,
        user_liked: userLikedSet.has(r.id),
      })) as DiscussionReply[];
    },
    enabled: !!postId,
  });

  useEffect(() => {
    if (!postId) return;
    const channel = supabase
      .channel(`discussion-replies-${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discussion_replies', filter: `post_id=eq.${postId}` },
        () => queryClient.invalidateQueries({ queryKey: ['discussion-replies', postId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId, queryClient]);

  return query;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { section_id: string; course_id: string; author_id: string; title: string; content: string }) => {
      const { error } = await supabase.from('discussion_posts').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      toast.success('Post created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { post_id: string; author_id: string; content: string }) => {
      const { error } = await supabase.from('discussion_replies').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-replies'] });
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      toast.success('Reply posted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, postId, replyId, liked }: { userId: string; postId?: string; replyId?: string; liked: boolean }) => {
      if (liked) {
        // Unlike
        let query = supabase.from('discussion_likes').delete().eq('user_id', userId);
        if (postId) query = query.eq('post_id', postId);
        if (replyId) query = query.eq('reply_id', replyId);
        const { error } = await query;
        if (error) throw error;
      } else {
        const insert: any = { user_id: userId };
        if (postId) insert.post_id = postId;
        if (replyId) insert.reply_id = replyId;
        const { error } = await supabase.from('discussion_likes').insert(insert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      queryClient.invalidateQueries({ queryKey: ['discussion-replies'] });
    },
  });
}

export function useToggleEndorse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replyId, endorsed, endorsedBy }: { replyId: string; endorsed: boolean; endorsedBy: string }) => {
      const { error } = await supabase
        .from('discussion_replies')
        .update({ is_endorsed: !endorsed, endorsed_by: !endorsed ? endorsedBy : null })
        .eq('id', replyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-replies'] });
      toast.success('Endorsement updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, pinned }: { postId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('discussion_posts')
        .update({ is_pinned: !pinned })
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      toast.success('Pin updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleResolved() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, resolved }: { postId: string; resolved: boolean }) => {
      const { error } = await supabase
        .from('discussion_posts')
        .update({ is_resolved: !resolved })
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      toast.success('Status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('discussion_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      toast.success('Post deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
