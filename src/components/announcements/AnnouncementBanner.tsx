import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { Bell, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

const AnnouncementBanner = () => {
  const { profile } = useAuth();
  const { data: announcements = [] } = useAnnouncements(profile?.role);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a.id));
  const urgentAnnouncement = activeAnnouncements.find(a => a.priority === 'urgent' || a.priority === 'high');

  if (!urgentAnnouncement) return null;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`${getPriorityStyles(urgentAnnouncement.priority)} px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {getPriorityIcon(urgentAnnouncement.priority)}
          <div>
            <span className="font-semibold">{urgentAnnouncement.title}:</span>{' '}
            <span>{urgentAnnouncement.content}</span>
          </div>
        </div>
        <button
          onClick={() => setDismissed([...dismissed, urgentAnnouncement.id])}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
