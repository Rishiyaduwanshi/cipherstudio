 'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to {APP_CONFIG.APP_NAME}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            An online React IDE. Write, edit, and preview your code in real-time.
          </p>
          <button
            onClick={handleGetStarted}
            className={`${UI.BUTTON_PRIMARY} text-lg px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105`}
          >
            Get Started →
          </button>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => router.push(ROUTES.EXPLORE)}
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Explore Public Projects
            </button>
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            Login to use the full-featured IDE
          </p>
        </div>

        {/* IDE Screenshot - First Thing User Sees */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700 mb-16">
          <h2 className="text-3xl font-bold mb-4 text-center">Full-Featured IDE</h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Code editor with file explorer and live preview
          </p>
          <div className="rounded-lg overflow-hidden shadow-2xl border border-slate-600">
            <Image
              src="/IDE.png"
              alt="IDE Interface"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-semibold mb-2">Code Editor</h3>
            <p className="text-gray-400">VS Code-like editing experience with syntax highlighting</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-xl font-semibold mb-2">Live Preview</h3>
            <p className="text-gray-400">See your changes in real-time as you code</p>
          </div>
        </div>

        {/* Screenshots Section */}
        <div className="space-y-16">
          {/* Projects Screenshot */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold mb-4 text-center">Your Projects Dashboard</h2>
            <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
              All your projects in one place
            </p>
            <div className="rounded-lg overflow-hidden shadow-2xl border border-slate-600">
              <Image
                src="/Projects.png"
                alt="Projects Dashboard"
                width={1920}
                height={1080}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to start coding?</h2>
          <p className="text-gray-400 mb-8">Sign up now and create your first project!</p>
          <button
            onClick={handleGetStarted}
            className={`${UI.BUTTON_PRIMARY} text-lg px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105`}
          >
            Start Building Now →
          </button>
        </div>
      </div>
    </div>
  );
}
