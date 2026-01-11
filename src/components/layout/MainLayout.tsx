import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <AnnouncementBanner />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
