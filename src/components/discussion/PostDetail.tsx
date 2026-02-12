import { useState } from 'react';
import { DiscussionPost, useDiscussionReplies, useCreateReply, useToggleLike, useToggleEndorse } from '@/hooks/useDiscussion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, Award, ArrowLeft, Pin, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  post: DiscussionPost;
  isInstructor: boolean;
  onBack: () => void;
}

export default function PostDetail({ post, isInstructor, onBack }: Props) {
  const { user } = useAuth();
  const { data: replies = [], isLoading } = useDiscussionReplies(post.id);
  const createReply = useCreateReply();
  const toggleLike = useToggleLike();
  const toggleEndorse = useToggleEndorse();
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    await createReply.mutateAsync({ post_id: post.id, author_id: user.id, content: replyContent.trim() });
    setReplyContent('');
  };

  const authorName = (p?: { first_name: string | null; last_name: string | null }) =>
    p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown' : 'Unknown';

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to posts
      </Button>

      {/* Original post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.is_pinned && <Badge variant="secondary"><Pin className="w-3 h-3 mr-1" />Pinned</Badge>}
            {post.is_resolved && <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{post.title}</h2>
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{post.author_profile?.first_name?.[0]}{post.author_profile?.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{authorName(post.author_profile)}</span>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading replies...</p>
        ) : (
          <div className="space-y-3">
            {replies.map(reply => (
              <Card key={reply.id} className={reply.is_endorsed ? 'border-green-300 bg-green-500/5' : ''}>
                <CardContent className="pt-4 pb-3">
                  {reply.is_endorsed && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-200 mb-2">
                      <Award className="w-3 h-3 mr-1" /> Instructor Endorsed
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{reply.author_profile?.first_name?.[0]}{reply.author_profile?.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{authorName(reply.author_profile)}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap mb-2">{reply.content}</p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 ${reply.user_liked ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={() => user && toggleLike.mutate({ userId: user.id, replyId: reply.id, liked: !!reply.user_liked })}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">{reply.likes_count || 0}</span>
                    </Button>
                    {isInstructor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 ${reply.is_endorsed ? 'text-green-600' : 'text-muted-foreground'}`}
                        onClick={() => user && toggleEndorse.mutate({ replyId: reply.id, endorsed: reply.is_endorsed, endorsedBy: user.id })}
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">{reply.is_endorsed ? 'Endorsed' : 'Endorse'}</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      <form onSubmit={handleReply} className="space-y-3">
        <Textarea
          value={replyContent}
          onChange={e => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
          rows={3}
          required
          maxLength={5000}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={createReply.isPending || !replyContent.trim()}>
            {createReply.isPending ? 'Posting...' : 'Reply'}
          </Button>
        </div>
      </form>
    </div>
  );
}
