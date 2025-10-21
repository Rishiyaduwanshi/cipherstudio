 'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useAuthStore from '@/stores/authStore';
import useProjectStore from '@/stores/projectStore';
import IDE from '../components/IDE';
import { initialFiles as demoInitialFiles } from '../data/initialProject-react';

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuthStore();

  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'editor'
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authLoading) {
      if (isAuthenticated()) {
        setCurrentView('editor');
      } else {
        setCurrentView('landing');
      }
    }
  }, [isMounted, authLoading, isAuthenticated]);

  const router = useRouter();
  const { createProject } = useProjectStore();
  const [editorFiles, setEditorFiles] = useState(null);

  const handleGetStarted = async () => {
    // If authenticated, create a backend project and open its editor page
    if (isAuthenticated()) {
      try {
        const created = await createProject({
          name: 'Untitled Project',
          files: demoInitialFiles,
          description: 'Created from Get Started',
          visibility: 'private',
          settings: { framework: 'react', autoSave: true },
        });

        if (created && (created._id || created.id)) {
          const id = created._id || created.id;
          router.push(`/projects/${id}`);
          return;
        }

        toast.error('Failed to create project');
      } catch (err) {
        console.error('Create project error:', err);
        toast.error(err?.message || 'Failed to create project');
      }
    }

    // Fallback: open the local demo editor (no backend)
    setEditorFiles(demoInitialFiles);
    setCurrentView('editor');
  };

  if (currentView === 'landing') {
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

  if (currentView === 'editor') {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <IDE initialFiles={editorFiles || demoInitialFiles} onBack={() => { setEditorFiles(null); setCurrentView('landing'); }} />
      </div>
    );
  }

  return null;
}
