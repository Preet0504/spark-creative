import MainLayout from '@/components/layout/MainLayout';
import CreateAnnouncementDialog from '@/components/announcements/CreateAnnouncementDialog';
import AnnouncementsList from '@/components/announcements/AnnouncementsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

const Announcements = () => {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground mt-2">
              Manage system-wide announcements and notifications.
            </p>
          </div>
          <CreateAnnouncementDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">--</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementsList showDelete />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Announcements;
