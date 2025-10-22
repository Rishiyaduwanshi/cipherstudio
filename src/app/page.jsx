 'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthStore();

  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'editor'
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading && isAuthenticated()) {
      router.push('/projects'); 
    }
  }, [isMounted, authLoading, isAuthenticated, router]);

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      router.push('/projects');
    } else {
      router.push('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to CipherStudio</h1>
      <p className="text-lg mb-8">Build and manage your React projects with ease.</p>
      <button
        onClick={handleGetStarted}
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
      >
        Get Started
      </button>
    </div>
  );
}
