'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import AuthModal from '@/components/AuthModal';
import SandpackEditor from './components/SandpackEditor';
import { initialFiles } from '@/app/data/initialProject-react';

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuthStore();
  const { mounted: themeLoaded } = useThemeStore();
  
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'ide'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isMounted && !authLoading) {
      if (isAuthenticated()) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    }
  }, [isMounted, authLoading, isAuthenticated]);

  // Navigation handlers
  const handleGetStarted = () => {
    if (isAuthenticated()) {
      setCurrentView('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };

  const handleOpenIDE = (project = null) => {
    if (project) {
      setCurrentProject(project);
    } else {
      // Create default project
      setCurrentProject({
        name: 'New Project',
        files: initialFiles,
      });
    }
    setCurrentView('ide');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentProject(null);
  };

  // Show loading until everything is initialized
  if (!isMounted || authLoading || !themeLoaded) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading CipherStudio...</p>
        </div>
      </div>
    );
  }

  // Render different views based on current state
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (currentView === 'dashboard') {
    return <Dashboard onOpenIDE={handleOpenIDE} />;
  }

  if (currentView === 'ide' && currentProject) {
    return (
      <SandpackEditor 
        project={currentProject} 
        onBack={handleBackToDashboard}
      />
    );
  }

  // Fallback
  return (
    <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
