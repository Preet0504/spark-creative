import { DiscussionPost } from '@/hooks/useDiscussion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Pin, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToggleLike, useTogglePin, useToggleResolved, useDeletePost } from '@/hooks/useDiscussion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  post: DiscussionPost;
  isInstructor: boolean;
  onClick: () => void;
}

export default function PostCard({ post, isInstructor, onClick }: Props) {
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const togglePin = useTogglePin();
  const toggleResolved = useToggleResolved();
  const deletePost = useDeletePost();

  const authorName = post.author_profile
    ? `${post.author_profile.first_name || ''} ${post.author_profile.last_name || ''}`.trim() || 'Unknown'
    : 'Unknown';
  const initials = `${post.author_profile?.first_name?.[0] || ''}${post.author_profile?.last_name?.[0] || ''}`;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {post.is_pinned && <Badge variant="secondary" className="text-xs"><Pin className="w-3 h-3 mr-1" />Pinned</Badge>}
              {post.is_resolved && <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>}
            </div>
            <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{authorName}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 ${post.user_liked ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => user && toggleLike.mutate({ userId: user.id, postId: post.id, liked: !!post.user_liked })}
            >
              <ThumbsUp className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">{post.likes_count || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" onClick={onClick}>
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">{post.replies_count || 0}</span>
            </Button>
            {isInstructor && (
              <>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => togglePin.mutate({ postId: post.id, pinned: post.is_pinned })}>
                  <Pin className={`w-3.5 h-3.5 ${post.is_pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleResolved.mutate({ postId: post.id, resolved: post.is_resolved })}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${post.is_resolved ? 'text-green-500' : 'text-muted-foreground'}`} />
                </Button>
              </>
            )}
            {(user?.id === post.author_id || isInstructor) && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => deletePost.mutate(post.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
