'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loggedIn = !!user;

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 p-3 flex items-center justify-between shadow"
      style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-lg">
          CipherStudio
        </Link>
        <nav className="flex gap-3 text-sm ml-4">
          <Link href="/projects" className="hidden md:inline">
            Projects
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {loggedIn ? (
          <>
            <span className="text-sm">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm px-2 py-1 border rounded"
            >
              Signout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/signin" className="text-sm px-2 py-1 border rounded">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-2 py-1 border rounded bg-green-600 text-white hover:bg-green-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
