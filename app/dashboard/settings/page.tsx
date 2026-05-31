'use client';
// app/dashboard/settings/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { KeyRound, Mail, UserX, Trash2, Download, Loader2, ShieldAlert, Eye, EyeOff, AlertTriangle, Eraser, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { tasks, getStats } = useTaskStore();
  const router = useRouter();
  const supabase = createClient();

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Change email
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Danger zone
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [clearingTasks, setClearingTasks] = useState(false);
  const [resettingStreak, setResettingStreak] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const stats = getStats();

  // ── Change Password ──────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) { toast.error('Fill in all fields'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated! 🔑');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Change Email ─────────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) { toast.error('Enter a valid email'); return; }
    if (newEmail === user?.email) { toast.error('That is already your email'); return; }
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success('Check your new email to confirm the change! 📧');
      setNewEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  // ── Export Data ──────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = [
        ['Title', 'Status', 'Priority', 'Due Date', 'Created At'],
        ...tasks.map(t => [t.title, t.status, t.priority, t.due_date ?? '', t.created_at]),
      ];
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `todei-tasks-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Tasks exported! 📤');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // ── Clear Completed Tasks ────────────────────────────────────────────────
  const handleClearCompleted = async () => {
    setClearingTasks(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user!.id)
        .eq('status', 'completed');
      if (error) throw error;
      toast.success('Completed tasks cleared! 🧹');
      setShowClearModal(false);
      window.location.reload();
    } catch {
      toast.error('Failed to clear tasks');
    } finally {
      setClearingTasks(false);
    }
  };

  // ── Reset Streak ─────────────────────────────────────────────────────────
  const handleResetStreak = async () => {
    setResettingStreak(true);
    try {
      const { error } = await (supabase
  .from('daily_activities') as any)
  .update({ streak: 0 })
  .eq('user_id', user!.id);
      if (error) throw error;
      toast.success('Streak reset to 0 🔄');
    } catch {
      toast.error('Failed to reset streak');
    } finally {
      setResettingStreak(false);
    }
  };

  // ── Deactivate ───────────────────────────────────────────────────────────
  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: false, deactivated: true }),
      });
      await signOut();
      toast.success('Account deactivated. You can reactivate by logging back in.');
    } catch {
      toast.error('Failed to deactivate account');
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  // ── Delete Account ───────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeletingAccount(true);
    try {
      // Delete all user data
      await supabase.from('tasks').delete().eq('user_id', user!.id);
      await supabase.from('daily_activities').delete().eq('user_id', user!.id);
      await supabase.from('profiles').delete().eq('id', user!.id);
      // Delete auth user via API
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      await signOut();
      router.push('/');
      toast.success('Account deleted. Goodbye 💔');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account. Contact support.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          Settings ⚙️
        </h1>
        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Manage your account security and data
        </p>
      </div>

      {/* ── Change Password ── */}
      <div className="card">
        <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          <KeyRound size={18} /> Change Password
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="input-field pr-10" placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="input-field pr-10" placeholder="Repeat new password" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs font-semibold text-red-500">Passwords don't match</p>
          )}
          <button onClick={handleChangePassword} disabled={savingPassword || !newPassword || !confirmPassword}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40">
            {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* ── Change Email ── */}
      <div className="card">
        <h2 className="text-lg font-extrabold mb-1 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          <Mail size={18} /> Change Email
        </h2>
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
          Current: <strong>{user?.email}</strong>
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Email Address</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              className="input-field" placeholder="new@email.com" />
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            A confirmation link will be sent to your new email.
          </p>
          <button onClick={handleChangeEmail} disabled={savingEmail || !newEmail}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40">
            {savingEmail ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {savingEmail ? 'Sending...' : 'Update Email'}
          </button>
        </div>
      </div>

      {/* ── Data Management ── */}
      <div className="card">
        <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          <Download size={18} /> Data Management
        </h2>
        <div className="flex flex-col gap-3">
          {/* Export */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Export Tasks</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Download all your tasks as CSV — {tasks.length} tasks</p>
            </div>
            <button onClick={handleExport} disabled={exporting}
              className="btn-secondary text-sm flex items-center gap-1.5 flex-shrink-0 disabled:opacity-40">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export
            </button>
          </div>

          {/* Clear completed */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Clear Completed Tasks</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stats.completed} completed tasks will be deleted</p>
            </div>
            <button onClick={() => setShowClearModal(true)} disabled={stats.completed === 0}
              className="text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 flex-shrink-0 transition-all disabled:opacity-30"
              style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }}>
              <Eraser size={14} /> Clear
            </button>
          </div>

          {/* Reset streak */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Reset Streak</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Resets your habit streak back to 0</p>
            </div>
            <button onClick={handleResetStreak} disabled={resettingStreak}
              className="text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 flex-shrink-0 transition-all"
              style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }}>
              {resettingStreak ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card" style={{ border: '1.5px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.02)' }}>
        <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: '#ef4444' }}>
          <ShieldAlert size={18} /> Danger Zone
        </h2>
        <div className="flex flex-col gap-3">
          {/* Deactivate */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Deactivate Account</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Hides your profile. You can reactivate by logging in again.</p>
            </div>
            <button onClick={() => setShowDeactivateModal(true)}
              className="text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 flex-shrink-0 transition-all"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
              <UserX size={14} /> Deactivate
            </button>
          </div>

          {/* Delete account */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: '#ef4444' }}>Delete Account</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Permanently delete your account and all data. Irreversible.</p>
            </div>
            <button onClick={() => setShowDeleteModal(true)}
              className="text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 flex-shrink-0 transition-all"
              style={{ backgroundColor: '#ef4444', color: 'white' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* ── CLEAR TASKS MODAL ── */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="card w-full max-w-sm animate-bounce-in text-center">
            <div className="text-4xl mb-3">🧹</div>
            <h3 className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>Clear completed tasks?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>This will permanently delete all {stats.completed} completed tasks. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleClearCompleted} disabled={clearingTasks}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: '#ca8a04', color: 'white' }}>
                {clearingTasks ? <Loader2 size={14} className="animate-spin" /> : <Eraser size={14} />}
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEACTIVATE MODAL ── */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="card w-full max-w-sm animate-bounce-in text-center">
            <div className="text-4xl mb-3">😴</div>
            <h3 className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>Deactivate account?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Your profile will be hidden and you'll be signed out. Log back in anytime to reactivate.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeactivateModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeactivate} disabled={deactivating}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: '#ef4444', color: 'white' }}>
                {deactivating ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="card w-full max-w-sm animate-bounce-in">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">💀</div>
              <h3 className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: '#ef4444' }}>Delete account permanently?</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This will delete ALL your tasks, habits, badges, and account data. <strong>This cannot be undone.</strong></p>
            </div>
            <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#ef4444' }}>Type DELETE to confirm:</p>
              <input
                type="text" value={confirmDeleteText}
                onChange={e => setConfirmDeleteText(e.target.value)}
                className="input-field text-center font-bold tracking-widest"
                placeholder="DELETE"
                style={{ borderColor: confirmDeleteText === 'DELETE' ? '#ef4444' : undefined }}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setConfirmDeleteText(''); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeleteAccount}
                disabled={deletingAccount || confirmDeleteText !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ backgroundColor: '#ef4444', color: 'white' }}>
                {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}