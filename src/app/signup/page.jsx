 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useAuthStore from '@/stores/authStore';
import { ROUTES } from '@/constants';

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (res && res.success) {
      toast.success('Account created');
      router.push(ROUTES.PROJECTS);
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-slate-800 rounded">
  <h2 className="text-xl mb-4">Sign up</h2>
  <label htmlFor="name" className="block text-sm mb-2">Name</label>
  <input id="name" name="name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-3 p-2 rounded bg-slate-700" />
  <label htmlFor="email" className="block text-sm mb-2">Email</label>
  <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-2 rounded bg-slate-700" />
  <label htmlFor="password" className="block text-sm mb-2">Password</label>
  <input id="password" name="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 rounded bg-slate-700" />
        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-primary rounded text-white hover:bg-primary-hover transition-colors disabled:opacity-60" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</button>
        </div>
      </form>
    </div>
  );
}
