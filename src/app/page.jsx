 'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { ROUTES, APP_CONFIG, UI } from '@/constants';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      router.push(ROUTES.PROJECTS);
    } else {
      router.push(ROUTES.SIGNIN);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to {APP_CONFIG.APP_NAME}</h1>
      <p className="text-lg mb-8">Build and manage your React projects with ease.</p>
      <button
        onClick={handleGetStarted}
        className={UI.BUTTON_PRIMARY}
      >
        Get Started
      </button>
    </div>
  );
}
