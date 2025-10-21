 'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import useAuthStore from '@/stores/authStore';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/signin');
  }, [isAuthenticated, router]);

  if (!isAuthenticated()) return null;
  return <Dashboard />;
}