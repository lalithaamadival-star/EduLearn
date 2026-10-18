import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { Button } from '../../components/ui/Button';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Lock, Mail, ArrowRight, LogIn } from 'lucide-react';

export function SignInPage() {
  const { login } = useAuth();
  const { announce } = useAuditoryOrientation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password, role);
      announce(`Signed in successfully as ${user.full_name}. Entering ${user.role.toLowerCase()} portal.`, 'polite');
      if (user.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg = err.message || 'Unable to authenticate. Please verify your credentials.';
      setError(msg);
      announce(`Authentication failed: ${msg}`, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 font-sans">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
          <SymbolIcon name="accessibility" className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sign In to AccessEd</h1>
        <p className="text-xs text-slate-400">
          Enter your registered email and password to access your personalized learning space.
        </p>
      </div>

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        {error && (
          <div role="alert" className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="signin-email" className="block text-xs font-semibold text-slate-200">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signin-password" className="block text-xs font-semibold text-slate-200">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="signin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signin-role" className="block text-xs font-semibold text-slate-200">
            Select Workspace Portal
          </label>
          <select
            id="signin-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <option value="STUDENT">Student Learning Workspace</option>
            <option value="TEACHER">Teacher Curriculum Suite</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2"
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/get-started" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
          Create Real Account
        </Link>
      </div>
    </div>
  );
}
