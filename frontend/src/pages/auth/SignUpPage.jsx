import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useAuditoryOrientation } from '../../features/accessibility/AuditoryOrientationContext';
import { Button } from '../../components/ui/Button';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Mail, Lock, User, ArrowRight, Building } from 'lucide-react';

export function SignUpPage() {
  const { signup } = useAuth();
  const { announce } = useAuditoryOrientation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signup({
        email,
        password,
        full_name: fullName,
        role,
        organization: organization || (role === 'TEACHER' ? 'Department of Inclusive Computing' : 'AccessEd Learning Cohort')
      });

      announce(`Account successfully registered for ${user.full_name}. Entering ${user.role.toLowerCase()} portal.`, 'polite');
      if (user.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check details and retry.';
      setError(msg);
      announce(`Registration error: ${msg}`, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 font-sans">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
          <SymbolIcon name="accessibility" className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Create Real AccessEd Account</h1>
        <p className="text-xs text-slate-400">
          Sign up with your credentials to start learning or designing inclusive courses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        {error && (
          <div role="alert" className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-200">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              placeholder="e.g. Maya Patel"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-200">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              placeholder="name@university.edu"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-200">
            Password (at least 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="signup-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-role" className="block text-xs font-semibold text-slate-200">
            I am joining as:
          </label>
          <select
            id="signup-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <option value="STUDENT">Student (Self-Paced Accessible Learning)</option>
            <option value="TEACHER">Educator / Curriculum Creator</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-org" className="block text-xs font-semibold text-slate-200">
            Institution / Organization (Optional)
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="signup-org"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              placeholder="e.g. National Institute of Technology"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2"
          icon={ArrowRight}
        >
          Create Real Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
          Sign In
        </Link>
      </div>
    </div>
  );
}
