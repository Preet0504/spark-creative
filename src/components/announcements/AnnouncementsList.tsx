import { useAnnouncements, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementsListProps {
  showDelete?: boolean;
}

const AnnouncementsList = ({ showDelete = false }: AnnouncementsListProps) => {
  const { profile } = useAuth();
  const { data: announcements = [], isLoading } = useAnnouncements(showDelete ? undefined : profile?.role);
  const deleteMutation = useDeleteAnnouncement();

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-destructive bg-destructive/5';
      case 'high':
        return 'border-l-warning bg-warning/5';
      case 'low':
        return 'border-l-muted-foreground bg-muted/30';
      default:
        return 'border-l-primary bg-primary/5';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'low':
        return <Info className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-destructive/10 text-destructive`;
      case 'high':
        return `${baseClasses} bg-warning/10 text-warning`;
      case 'low':
        return `${baseClasses} bg-muted text-muted-foreground`;
      default:
        return `${baseClasses} bg-primary/10 text-primary`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No announcements at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map(announcement => (
        <div
          key={announcement.id}
          className={`p-4 rounded-lg border-l-4 ${getPriorityStyles(announcement.priority)}`}
        >
          <div className="flex items-start gap-3">
            {getPriorityIcon(announcement.priority)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">{announcement.title}</h4>
                <span className={getPriorityBadge(announcement.priority)}>
                  {announcement.priority}
                </span>
                {announcement.target_role && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {announcement.target_role}s only
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-2">{announcement.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                {announcement.expires_at && (
                  <span> · Expires {formatDistanceToNow(new Date(announcement.expires_at), { addSuffix: true })}</span>
                )}
              </p>
            </div>
            {showDelete && (
              <button
                onClick={() => deleteMutation.mutate(announcement.id)}
                disabled={deleteMutation.isPending}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsList;
