 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useAuthStore from '@/stores/authStore';
import { ROUTES } from '@/constants';

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail || !password) {
      setLoading(false);
      toast.error('Email and password are required');
      return;
    }
    const res = await login(trimmedEmail, password);
    setLoading(false);
    if (res && res.success) {
      toast.success('Signed in');
      router.push(ROUTES.PROJECTS);
    } else {
      // Show server message if available, and log detailed payload for debugging
      console.error('Sign-in failed response:', res?.details || res);
      const msg = res?.error || res?.message || (res?.details && JSON.stringify(res.details)) || 'Failed to sign in';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-slate-800 rounded">
  <h2 className="text-xl mb-4">Sign in</h2>
  <label htmlFor="email" className="block text-sm mb-2">Email</label>
  <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-2 rounded bg-slate-700" />
  <label htmlFor="password" className="block text-sm mb-2">Password</label>
  <input id="password" name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 rounded bg-slate-700" />
        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-white" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
