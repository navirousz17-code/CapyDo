'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
      if (data.user && data.session) {
        await fetch('/api/categories/seed', { method: 'POST' });
        toast.success('Welcome to CapyDo! 🦫');
        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign up';
      toast.error(msg.includes('already registered') ? 'Email already in use' : msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-bounce-in text-center">
        <div className="card p-8">
          <div className="w-16 h-16 bg-moss-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-moss-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-bark-600 mb-3" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Check your email! 📬
          </h2>
          <p className="text-bark-400 font-medium mb-5">
            We sent a confirmation link to <strong className="text-bark-600">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-bark-600 mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Create Account
        </h1>
        <p className="text-bark-400 font-medium">Join the CapyDo family! 🦫</p>
      </div>

      <div className="card">
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name" className="input-field" required autoComplete="name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com" className="input-field" required autoComplete="email" />
          </div>
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters" className="input-field pr-12" required autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-400 hover:text-bark-500 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-bark-400 mt-1 font-medium">Minimum 6 characters</p>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 mt-1">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-cream-200 text-center">
          <p className="text-bark-400 text-sm font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-moss-500 font-bold hover:text-moss-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}