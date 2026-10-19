import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { OrientationBar } from '../features/accessibility/OrientationBar';
import { SymbolIcon } from '../components/ui/SymbolIcon';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/AuthContext';
import { useAuditoryOrientation } from '../features/accessibility/AuditoryOrientationContext';
import { Menu, X, ArrowRight, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';

export function PublicLayout() {
  const { user, isTeacher, isStudent, logout } = useAuth();
  const { updateOrientation } = useAuditoryOrientation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    let loc = 'AccessEd Home';
    if (location.pathname === '/product') loc = 'Product Overview';
    else if (location.pathname === '/accessibility') loc = 'Multimodal Accessibility Architecture';
    else if (location.pathname === '/ai') loc = 'Contextual AI Engine';
    else if (location.pathname === '/solutions') loc = 'Institutional Solutions';
    else if (location.pathname === '/about') loc = 'About AccessEd';
    else if (location.pathname === '/contact') loc = 'Contact & Support';
    else if (location.pathname === '/signin') loc = 'Sign In to AccessEd';
    else if (location.pathname === '/get-started') loc = 'Create AccessEd Account';
    else if (isTeacher) loc = 'Teacher Workspace Home';
    else if (isStudent) loc = 'Student Learning Home';

    updateOrientation({
      location: loc,
      section: isTeacher ? 'Teacher Workspace' : isStudent ? 'Student Workspace' : 'Public Ecosystem',
      actions: ['Explore platform', 'Access portal', 'Configure accessibility preferences']
    });
  }, [location.pathname, isTeacher, isStudent]);

  const teacherNavLinks = [
    { to: '/teacher', label: 'Dashboard' },
    { to: '/teacher/classes', label: 'Classes' },
    { to: '/teacher/courses', label: 'Courses' },
    { to: '/teacher/documents', label: 'Document OCR' },
    { to: '/teacher/assignments', label: 'Assignments' },
    { to: '/teacher/analytics', label: 'Analytics' },
    { to: '/contact', label: 'Contact' },
  ];

  const studentNavLinks = [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/courses', label: 'My Courses' },
    { to: '/student/assignments', label: 'Assignments' },
    { to: '/student/ai-tutor', label: 'AI Tutor' },
    { to: '/student/revision', label: 'Revision' },
    { to: '/student/accessibility-center', label: 'Accessibility' },
    { to: '/contact', label: 'Contact' },
  ];

  const publicNavLinks = [
    { to: '/', label: 'Home' },
    { to: '/product', label: 'Product' },
    { to: '/accessibility', label: 'Accessibility' },
    { to: '/ai', label: 'AI Engine' },
    { to: '/solutions', label: 'Solutions' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const activeNavLinks = isTeacher ? teacherNavLinks : isStudent ? studentNavLinks : publicNavLinks;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Skip to Content for Screen Readers & Keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Auditory Orientation Bar */}
      <OrientationBar />

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-[33px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark */}
          <Link
            to={isTeacher ? "/teacher" : isStudent ? "/student" : "/"}
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1 shrink-0"
            aria-label={isTeacher ? "AccessEd Teacher Suite" : isStudent ? "AccessEd Student Portal" : "AccessEd Home"}
          >
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isTeacher
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
            }`}>
              <SymbolIcon name={isTeacher ? "learning" : "accessibility"} className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-white font-mono">
                Access<span className={isTeacher ? "text-amber-400" : "text-indigo-400"}>Ed</span>
              </span>
              <span className="text-2xs text-slate-400 uppercase tracking-widest hidden sm:block">
                {isTeacher ? "Teacher Suite" : isStudent ? "Student Workspace" : "Inclusive Learning"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {activeNavLinks.map(link => {
              const isActive = link.to === '/'
                ? location.pathname === '/'
                : location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs lg:text-sm font-medium transition-colors px-2.5 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 ${
                    isTeacher
                      ? isActive
                        ? 'text-amber-300 font-semibold bg-amber-500/15 border border-amber-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : isActive
                        ? 'text-indigo-400 font-semibold bg-indigo-500/15 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Controls */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
                  isTeacher
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isTeacher ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className="font-semibold text-slate-100 truncate max-w-[120px]">{user.full_name}</span>
                  <span className={`text-3xs uppercase font-mono px-1.5 py-0.5 rounded ${
                    isTeacher ? 'bg-amber-900/80 text-amber-300 border border-amber-700/60' : 'bg-indigo-900/80 text-indigo-300 border border-indigo-700/60'
                  }`}>
                    {isTeacher ? 'Teacher' : 'Student'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-xs text-rose-300 hover:text-rose-200 border-rose-800/50 hover:bg-rose-950/40 focus-visible:ring-rose-400"
                  icon={LogOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/get-started">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 text-slate-300 hover:text-white rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
            {activeNavLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? isTeacher ? 'text-amber-300 font-semibold' : 'text-indigo-400 font-semibold'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-2 py-1 text-xs text-slate-300 flex items-center justify-between">
                    <span>Active: <strong className="text-white">{user.full_name}</strong></span>
                    <span className={`text-3xs uppercase font-mono px-1.5 py-0.5 rounded ${isTeacher ? 'bg-amber-950 text-amber-300' : 'bg-indigo-950 text-indigo-300'}`}>
                      {isTeacher ? 'Teacher' : 'Student'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-rose-300 hover:text-rose-200 border-rose-800/50 hover:bg-rose-950/40"
                    icon={LogOut}
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="main-content" tabIndex="-1" className="flex-1 focus-visible:outline-none">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <SymbolIcon name="accessibility" className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-white font-mono">AccessEd</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Learning should adapt to the learner." Inclusive learning platform engineering equivalent access across visual, auditory, and cognitive modes.
            </p>
            <div className="text-2xs text-slate-400">
              WCAG 2.2 AAA Target Conformance • Multi-Agent Resilient Architecture
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Platform</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/product" className="hover:text-white">Product Architecture</Link></li>
              <li><Link to="/accessibility" className="hover:text-white">One Lesson / Multiple Modes</Link></li>
              <li><Link to="/ai" className="hover:text-white">Contextual AI Tutor</Link></li>
              <li><Link to="/solutions" className="hover:text-white">Institutional Solutions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">
              {isTeacher ? "Teacher Suite" : isStudent ? "Student Workspace" : "Portals"}
            </h3>
            <ul className="space-y-2 text-xs">
              {isStudent ? (
                <>
                  <li><Link to="/student" className="hover:text-white font-medium text-indigo-300">Student Learning Portal</Link></li>
                  <li><Link to="/student/courses" className="hover:text-white">My Enrolled Courses</Link></li>
                  <li><Link to="/student/accessibility-center" className="hover:text-white">Accessibility Center</Link></li>
                  <li><Link to="/student/ai-tutor" className="hover:text-white">AI Tutor Session</Link></li>
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-rose-400 hover:text-rose-300 text-left transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              ) : isTeacher ? (
                <>
                  <li><Link to="/teacher" className="hover:text-white font-medium text-amber-300">Teacher Operational Suite</Link></li>
                  <li><Link to="/teacher/courses" className="hover:text-white">Course Management</Link></li>
                  <li><Link to="/teacher/classes" className="hover:text-white">Class Operations</Link></li>
                  <li><Link to="/teacher/documents" className="hover:text-white">Document OCR Pipeline</Link></li>
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-rose-400 hover:text-rose-300 text-left transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/signin" className="hover:text-white">Student Learning Portal</Link></li>
                  <li><Link to="/signin" className="hover:text-white">Teacher Operational Suite</Link></li>
                  <li><Link to="/accessibility-statement" className="hover:text-white">Accessibility Statement</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Trust & Ethics</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-white">Data Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-white">Our Mission & Principles</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact & Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-850 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 AccessEd Ecosystem. Designed for universal human comprehension.</p>
          <div className="flex items-center gap-4">
            <span>Alt+O for Auditory Orientation</span>
            <span>•</span>
            <span>Zero Dark Patterns</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
