import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { OrientationBar } from '../features/accessibility/OrientationBar';
import { useAuditoryOrientation } from '../features/accessibility/AuditoryOrientationContext';
import { useAuth } from '../features/auth/AuthContext';
import { SymbolIcon } from '../components/ui/SymbolIcon';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  FileCheck2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Sliders,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';

export function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { updateOrientation } = useAuditoryOrientation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentNavItems = [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/student/courses', label: 'My Learning', icon: BookOpen },
    { to: '/student/documents', label: 'Study Materials', icon: FileText },
    { to: '/student/explore', label: 'Explore Courses', icon: Compass },
    { to: '/student/assignments', label: 'Assignments', icon: FileCheck2 },
    { to: '/student/revision', label: 'Revision', icon: RotateCcw },
    { to: '/student/ai-tutor', label: 'AI Tutor', icon: Sparkles },
    { to: '/student/progress', label: 'Progress & Mastery', icon: TrendingUp },
    { to: '/student/accessibility-center', label: 'Accessibility Center', icon: Sliders },
    { to: '/student/profile', label: 'Profile', icon: User },
    { to: '/contact', label: 'Support & Contact', icon: HelpCircle }
  ];

  // Update orientation state on route change
  useEffect(() => {
    const current = studentNavItems.find(item =>
      item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    const locTitle = current ? `Student ${current.label}` : 'Student Learning Portal';
    updateOrientation({
      location: locTitle,
      section: 'Primary Student Workspace',
      actions: ['Navigate courses', 'Launch Lesson Reader', 'Consult AI Tutor', 'Review mistakes']
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <a href="#student-main" className="skip-to-content">
        Skip to student workspace
      </a>

      {/* Global Auditory Orientation Bar */}
      <OrientationBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          aria-label="Student Navigation"
          className="hidden lg:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800 shrink-0"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <Link to="/student" className="flex items-center gap-2" aria-label="AccessEd Student Portal">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <SymbolIcon name="accessibility" className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-white font-mono text-sm">AccessEd</span>
                <span className="block text-3xs text-indigo-400 uppercase tracking-widest">Student Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {studentNavItems.map(item => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Account & Sign Out */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
            <div className="flex items-center justify-between px-2 text-2xs text-slate-400">
              <span>ACTIVE LEARNER</span>
              <span className="text-emerald-400 font-semibold">ONLINE</span>
            </div>
            <div className="px-2 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 truncate">{user?.full_name || 'Enrolled Student'}</div>
              <div className="text-3xs text-slate-400 truncate">{user?.email || user?.organization || 'AccessEd Cohort'}</div>
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

        {/* Mobile Header & Sidebar Drawer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 py-2 px-4 flex justify-around items-center">
          <Link to="/student" className="flex flex-col items-center gap-1 text-xs text-slate-300">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-3xs">Home</span>
          </Link>
          <Link to="/student/courses" className="flex flex-col items-center gap-1 text-xs text-slate-300">
            <BookOpen className="w-5 h-5" />
            <span className="text-3xs">Lessons</span>
          </Link>
          <Link to="/student/ai-tutor" className="flex flex-col items-center gap-1 text-xs text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-3xs">AI Tutor</span>
          </Link>
          <Link to="/student/revision" className="flex flex-col items-center gap-1 text-xs text-slate-300">
            <RotateCcw className="w-5 h-5" />
            <span className="text-3xs">Revision</span>
          </Link>
          <Link to="/student/accessibility-center" className="flex flex-col items-center gap-1 text-xs text-slate-300">
            <Sliders className="w-5 h-5" />
            <span className="text-3xs">A11y</span>
          </Link>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main id="student-main" tabIndex="-1" className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 focus-visible:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
