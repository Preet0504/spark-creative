import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Building2,
  BarChart3,
  MessageSquare,
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Course Catalog' },
    { to: '/my-courses', icon: ClipboardList, label: 'My Courses' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
  ];

  const teacherLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-courses', icon: BookOpen, label: 'My Courses' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/schools', icon: Building2, label: 'Schools' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const links = profile?.role === 'student' ? studentLinks 
    : profile?.role === 'teacher' ? teacherLinks 
    : adminLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sidebar-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-lg">UniCourse</h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role} Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-foreground font-semibold text-sm">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="sidebar-link w-full text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
