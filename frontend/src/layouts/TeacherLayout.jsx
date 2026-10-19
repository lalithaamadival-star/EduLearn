import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OrientationBar } from '../features/accessibility/OrientationBar';
import { useAuditoryOrientation } from '../features/accessibility/AuditoryOrientationContext';
import { useAuth } from '../features/auth/AuthContext';
import { SymbolIcon } from '../components/ui/SymbolIcon';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCode,
  FileText,
  HelpCircle,
  BarChart3,
  Sparkles,
  Eye,
  Settings,
  Layers,
  ShieldAlert,
  LogOut
} from 'lucide-react';

export function TeacherLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { updateOrientation } = useAuditoryOrientation();

  const teacherNavItems = [
    { to: '/teacher', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/teacher/classes', label: 'Class Operations', icon: Users },
    { to: '/teacher/courses', label: 'Course Management', icon: BookOpen },
    { to: '/teacher/documents', label: 'Document OCR Pipeline', icon: FileText },
    { to: '/teacher/assignments', label: 'Assignments & Submissions', icon: FileCode },
    { to: '/teacher/accessibility-preview', label: 'Accessibility Previewer', icon: Eye },
    { to: '/teacher/ai-assistant', label: 'Teacher AI Co-pilot', icon: Sparkles },
    { to: '/teacher/analytics', label: 'Pedagogical Analytics', icon: BarChart3 },
    { to: '/contact', label: 'Support & Contact', icon: HelpCircle }
  ];

  useEffect(() => {
    const current = teacherNavItems.find(item =>
      item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    const locTitle = current ? `Teacher ${current.label}` : 'Teacher Operational Suite';
    updateOrientation({
      location: locTitle,
      section: 'Curriculum & Operational Control',
      actions: ['Review OCR documents', 'Audit accessibility', 'Review student submissions', 'Draft lessons']
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <a href="#teacher-main" className="skip-to-content">
        Skip to teacher console
      </a>

      {/* Global Auditory Orientation Bar */}
      <OrientationBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Operational Sidebar (Dense & Structured) */}
        <aside
          aria-label="Teacher Administrative Navigation"
          className="w-64 bg-slate-925 border-r border-slate-800 flex flex-col shrink-0"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <Link to="/teacher" className="flex items-center gap-2.5" aria-label="AccessEd Teacher Suite">
              <div className="w-8 h-8 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <SymbolIcon name="learning" className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-white font-mono text-sm">AccessEd</span>
                <span className="block text-3xs text-amber-400 uppercase tracking-widest font-semibold">Teacher Suite</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1 text-3xs uppercase font-bold text-slate-400 tracking-wider">
              Management
            </div>
            {teacherNavItems.map(item => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Teacher Account & Sign Out */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
            <div className="px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 truncate">{user?.full_name || 'Educator Account'}</div>
              <div className="text-3xs text-slate-400 truncate">{user?.email || user?.organization || 'Dept of Computing'}</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              className="w-full text-xs text-rose-300 hover:text-rose-200 hover:border-rose-700/60"
              onClick={() => {
                logout();
                navigate('/signin');
              }}
            >
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main id="teacher-main" tabIndex="-1" className="flex-1 p-6 lg:p-8 focus-visible:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
