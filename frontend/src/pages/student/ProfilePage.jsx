import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { useAccessibility } from '../../features/accessibility/AccessibilityContext';
import { SymbolIcon } from '../../components/ui/SymbolIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Building, ShieldCheck, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { preferences } = useAccessibility();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-2xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
          Account & Credentials
        </span>
        <h1 className="text-3xl font-extrabold text-white">User Profile</h1>
        <p className="text-xs text-slate-400">
          Personal identification and sensory modality preferences.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl font-bold font-mono">
            {user?.full_name?.charAt(0) || 'R'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{user?.full_name || 'Rahul Verma'}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{user?.role || 'STUDENT'}</Badge>
              <span className="text-xs text-slate-400">{user?.organization || 'AccessEd Cohort'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-800">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Email Address</span>
            <div className="font-semibold text-slate-200">{user?.email || 'rahul.verma@accessed.edu'}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Preferred Language</span>
            <div className="font-semibold text-indigo-400 uppercase font-mono">{preferences.selected_language}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-2xs text-slate-400 font-mono">AccessEd Auth v1.0 • Supabase RLS Protected</span>
          <Button variant="danger" size="sm" onClick={logout} icon={LogOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
