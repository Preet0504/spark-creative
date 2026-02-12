import { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useSections } from '@/hooks/useSections';
import { useCourses } from '@/hooks/useCourses';
import { useDiscussionPosts, DiscussionPost } from '@/hooks/useDiscussion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import CreatePostDialog from '@/components/discussion/CreatePostDialog';
import PostCard from '@/components/discussion/PostCard';
import PostDetail from '@/components/discussion/PostDetail';

const Discussion = () => {
  const { user, profile } = useAuth();
  const { data: enrollments = [] } = useEnrollments(user?.id);
  const { data: sections = [] } = useSections();
  const { data: courses = [] } = useCourses();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<DiscussionPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';

  // Filter sections based on role
  const availableSections = useMemo(() => {
    if (isAdmin) return sections;
    if (isTeacher) return sections.filter(s => s.instructor_id === user?.id);
    // Student: only enrolled sections
    const enrolledSectionIds = new Set(enrollments.map(e => e.section_id));
    return sections.filter(s => enrolledSectionIds.has(s.id));
  }, [sections, enrollments, isTeacher, isAdmin, user?.id]);

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedCourse = selectedSection ? courses.find(c => c.id === selectedSection.course_id) : null;
  const isInstructor = isAdmin || (isTeacher && selectedSection?.instructor_id === user?.id);

  const { data: posts = [], isLoading } = useDiscussionPosts(selectedSectionId || undefined);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }, [posts, searchQuery]);

  const getSectionLabel = (section: typeof sections[0]) => {
    const course = courses.find(c => c.id === section.course_id);
    return course ? `${course.code} - ${course.title} (${section.section})` : section.section;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discussion Forum</h1>
          <p className="text-muted-foreground">Ask questions, share ideas, and collaborate with classmates</p>
        </div>

        {/* Section selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedSectionId} onValueChange={v => { setSelectedSectionId(v); setSelectedPost(null); }}>
            <SelectTrigger className="sm:w-[400px]">
              <SelectValue placeholder="Select a course section" />
            </SelectTrigger>
            <SelectContent>
              {availableSections.map(s => (
                <SelectItem key={s.id} value={s.id}>{getSectionLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSectionId && !selectedPost && (
            <>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {selectedCourse && (
                <CreatePostDialog sectionId={selectedSectionId} courseId={selectedCourse.id} />
              )}
            </>
          )}
        </div>

        {/* Content */}
        {!selectedSectionId ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Select a course section to view its discussion forum</p>
          </div>
        ) : selectedPost ? (
          <PostDetail post={selectedPost} isInstructor={isInstructor} onBack={() => setSelectedPost(null)} />
        ) : isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>{searchQuery ? 'No posts match your search' : 'No posts yet. Be the first to start a discussion!'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} isInstructor={isInstructor} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Discussion;
