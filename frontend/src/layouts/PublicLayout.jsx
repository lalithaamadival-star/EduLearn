import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { OrientationBar } from '../features/accessibility/OrientationBar';
import { SymbolIcon } from '../components/ui/SymbolIcon';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/AuthContext';
import { Menu, X, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function PublicLayout() {
  const { user, isTeacher, isStudent } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/product', label: 'Product' },
    { to: '/accessibility', label: 'Accessibility' },
    { to: '/ai', label: 'AI Engine' },
    { to: '/solutions', label: 'Solutions' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1"
            aria-label="AccessEd Home"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <SymbolIcon name="accessibility" className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-white font-mono">
                Access<span className="text-indigo-400">Ed</span>
              </span>
              <span className="text-2xs text-slate-400 uppercase tracking-widest hidden sm:block">
                Inclusive Learning
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1.5 py-0.5 ${
                    isActive ? 'text-indigo-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth CTA Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={isTeacher ? "/teacher" : "/student"}>
                  <Button variant="primary" size="sm">
                    Enter {isTeacher ? "Teacher Portal" : "Student Portal"}
                  </Button>
                </Link>
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
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-200 hover:text-indigo-400"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">Sign In</Button>
              </Link>
              <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
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
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Portals</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/student" className="hover:text-white">Student Learning Portal</Link></li>
              <li><Link to="/teacher" className="hover:text-white">Teacher Operational Suite</Link></li>
              <li><Link to="/student/accessibility-center" className="hover:text-white">Accessibility Center</Link></li>
              <li><Link to="/accessibility-statement" className="hover:text-white">Accessibility Statement</Link></li>
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
