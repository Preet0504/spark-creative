import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCreatePost } from '@/hooks/useDiscussion';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  sectionId: string;
  courseId: string;
}

export default function CreatePostDialog({ sectionId, courseId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;
    await createPost.mutateAsync({
      section_id: sectionId,
      course_id: courseId,
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
    });
    setTitle('');
    setContent('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" /> New Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Discussion Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's your question?" required maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Details</Label>
            <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="Provide more context..." rows={5} required maxLength={5000} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
