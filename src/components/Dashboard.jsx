'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useProjectStore from '@/stores/projectStore';
import useAuthStore from '@/stores/authStore';
import { initialFiles as demoInitialFiles } from '@/data/initialProject-react';

export default function Dashboard() {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const loading = useProjectStore((s) => s.loading);

  useEffect(() => {
    fetchProjects().catch((err) => {
      console.error('Failed to load projects:', err);
      // If backend returned 401 — redirect to signin so user can authenticate
      if (err && (err.statusCode === 401 || err.status === 401 || err?.response?.status === 401)) {
        router.push('/signin');
        return;
      }
      toast.error(err?.message || 'Failed to load projects');
    });
  }, [fetchProjects, router]);

  const handleOpen = (id) => {
    router.push(`/projects/${id}`);
  };

  const { isAuthenticated } = useAuthStore();

  const handleNew = async () => {
    // Always open the IDE with a local demo/template so the user can edit before saving.
    const temp = {
      name: 'Untitled Project',
      files: demoInitialFiles,
      description: 'Created from Dashboard (local)'
    };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cipherstudio-temp', JSON.stringify(temp));
      }
    } catch (e) {
      console.warn('Failed to persist temp project:', e);
    }
    router.push('/ide');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Your Projects</h2>
        <div>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            New Project
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-slate-400">Loading projects...</div>
      )}

      {!loading && (!projects || projects.length === 0) && (
        <div className="text-slate-400">No projects found. Create one to get started!</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects && projects.map((p) => (
          <div key={p._id || p.id} className="bg-slate-800 p-4 rounded-md cursor-pointer hover:bg-slate-700" onClick={() => handleOpen(p._id || p.id)}>
            <h3 className="text-lg font-medium text-white">{p.name || 'Untitled'}</h3>
            <p className="text-sm text-slate-400 mt-2">{p.description || 'No description'}</p>
            <div className="text-xs text-slate-500 mt-2">{Object.keys(p.files || {}).length} files</div>
          </div>
        ))}
      </div>
    </div>
  );
}
