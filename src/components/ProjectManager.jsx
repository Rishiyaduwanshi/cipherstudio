"use client"
import React, { useState, useEffect } from "react";
import { initialFiles } from '@/data/initialProject-react';
import { toast } from 'react-toastify';
import projectAPI from '@/services/projectAPI';
import { useRouter } from 'next/navigation';

export default function ProjectManager({ project, setProject }) {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Save project to database
  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const projectToSave = {
        name: projectName.trim(),
        description: projectDescription.trim(),
        files: project?.files || initialFiles,
        visibility: isPublic ? 'public' : 'private',
        settings: project?.settings || { framework: 'react' },
      };

      // If project has an ID, update it, otherwise create new
      const savedProject = project?._id ? 
        await projectAPI.updateProject(project._id, projectToSave) :
        await projectAPI.createProject(projectToSave);

      // Update local project with server data
      setProject({
        ...project,
        _id: savedProject._id || savedProject.id,
        name: savedProject.name,
        description: savedProject.description,
        isPublic: savedProject.visibility === 'public'
      });

      // Update localStorage
      localStorage.setItem('cipherstudio-project', JSON.stringify({
        ...project,
        id: savedProject._id,
        name: savedProject.name
      }));

      setProjectName('');
      setProjectDescription('');
      setIsPublic(false);
      setShowSaveModal(false);
      
  // Success notification
  toast.success(`Project "${savedProject.name || 'Untitled'}" saved successfully`);
  // Refresh saved projects list so the modal shows the latest server project
  await loadSavedProjects();

    } catch (error) {
      setError(error.message || 'Failed to save project');
      console.error('❌ Save error:', error);
      if (error && (error.statusCode === 401 || error.status === 401 || error?.response?.status === 401)) {
        // Redirect to signin if backend says user is unauthorized
        router.push('/signin');
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  // Create new project (local only)
  const handleNewProject = () => {
    if (!projectName.trim()) return;
    const localProject = {
      name: projectName.trim(),
      description: projectDescription.trim() || '',
      files: initialFiles,
      visibility: isPublic ? 'public' : 'private',
      settings: { framework: 'react' },
    };
    setProject(localProject);
    try {
      localStorage.setItem('cipherstudio-temp', JSON.stringify(localProject));
    } catch (e) {}
    setShowProjectModal(false);
    setProjectName('');
    setProjectDescription('');
    setIsPublic(false);
  try { router.push('/projects'); } catch (e) {}
  };

  // Load projects from database
  const loadSavedProjects = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch server-side projects (if authenticated)
      let serverProjects = [];
      try {
        const resp = await projectAPI.getProjects({ limit: 20 });
        serverProjects = Array.isArray(resp) ? resp : (resp.projects || resp);
      } catch (e) {
        // ignore server errors here — we'll fall back to localStorage
        console.warn('Failed to fetch server projects', e);
      }

      // Map server projects to a normalized shape with a stable listId
      const serverEntries = (serverProjects || []).map(p => ({
        source: 'server',
        id: p._id || p.id,
        name: p.name || 'Untitled',
        files: p.files || {},
        project: p,
        listId: `server-${p._id || p.id}`
      }));

      // Collect localStorage-based saved projects
      const localEntries = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cipherstudio-project')) {
          try {
            const proj = JSON.parse(localStorage.getItem(key));
            localEntries.push({
              source: 'local',
              storageKey: key,
              name: proj?.name || 'Local project',
              files: proj?.files || {},
              project: proj,
              listId: `local-${key}`
            });
          } catch (e) {
            console.warn('Failed to parse local project', key, e);
          }
        }
      }

      setSavedProjects([...serverEntries, ...localEntries]);
    } catch (error) {
      setError(error.message || 'Failed to load projects');
      console.error('❌ Load projects error:', error);
      
      // (local entries already collected above in the happy path)
    } finally {
      setLoading(false);
    }
    
    setShowLoadModal(true);
  };

  const saveProjectAs = () => {
    try {
      const projectId = `cipherstudio-project-${Date.now()}`;
      localStorage.setItem(projectId, JSON.stringify(project));
      toast.success(`Project "${project?.name || 'Untitled'}" saved locally`);
    } catch (e) {
      console.error('Save local project failed', e);
      toast.error('Failed to save project locally');
    }
  };

  const saveProjectToServer = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const savedProject = project._id ? 
        await projectAPI.updateProject(project._id, project) :
        await projectAPI.createProject(project);
        
      // update current project with server response
      setProject(prev => ({ ...(prev || {}), ...savedProject }));
      toast.success('Project saved to server');
      // refresh list so it includes server project
      await loadSavedProjects();
    } catch (e) {
      console.error('Save to server failed', e);
      if (e?.response?.status === 401) {
        router.push('/signin');
        return;
      }
      toast.error(e?.response?.data?.message || e?.message || 'Failed to save to server');
    } finally {
      setSaving(false);
    }
  };

  const loadLocalProject = (storageKey) => {
    try {
      const savedProject = JSON.parse(localStorage.getItem(storageKey));
      if (savedProject) {
        setProject(savedProject);
        localStorage.setItem('cipherstudio-project', JSON.stringify(savedProject));
        toast.success(`Loaded local project: ${savedProject?.name || 'Untitled'}`);
      }
    } catch (e) {
      console.error('Load local project failed', e);
      toast.error('Failed to load local project');
    } finally {
      setShowLoadModal(false);
    }
  };

  const loadServerProject = async (projectId) => {
    setLoading(true);
    try {
      const p = await projectAPI.getProject(projectId);
      if (p) {
        setProject(p);
        toast.success(`Loaded project: ${p?.name || 'Untitled'}`);
      }
    } catch (e) {
      console.error('Load server project failed', e);
      toast.error(e?.message || 'Failed to load server project');
    } finally {
      setLoading(false);
      setShowLoadModal(false);
    }
  };

  return (
    <>
      {/* Project Actions */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowProjectModal(true)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            New Project
          </button>
          {project && (
            <>
              <button
                onClick={saveProjectAs}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Save As
              </button>
              <button
                onClick={saveProjectToServer}
                disabled={saving}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save to Server'}
              </button>
              <button
                onClick={loadSavedProjects}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Load Project
              </button>
            </>
          )}
        </div>

        {/* Projects Grid */}
        {savedProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProjects.map((proj) => (
              <div 
                key={proj.listId}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  if (proj.source === 'server') loadServerProject(proj.id);
                  else loadLocalProject(proj.storageKey);
                }}
              >
                <h3 className="text-white font-medium mb-2">{proj.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    {Object.keys(proj.files || {}).length} files
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    proj.source === 'server' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {proj.source === 'server' ? 'Server' : 'Local'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            try {
              const blob = new Blob([JSON.stringify(project || {}, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${project?.name || 'project'}-project.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Downloaded project');
            } catch (e) {
              console.error('Download failed', e);
              toast.error('Download failed');
            }
          }}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Download
        </button>
      </div>

      {/* New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-white text-lg mb-4">Create New Project</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full p-2 bg-gray-700 text-white rounded mb-4"
              onKeyUp={(e) => e.key === 'Enter' && handleNewProject()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Project Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-white text-lg mb-4">Load Saved Project</h3>
              {savedProjects.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No saved projects found</p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((proj) => (
                  <div
                    key={proj.listId}
                    onClick={() => {
                      if (proj.source === 'server') return loadServerProject(proj.id);
                      return loadLocalProject(proj.storageKey);
                    }}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-white font-medium">{proj.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {Object.keys(proj.files || {}).length} files
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 px-2 py-1 bg-gray-600 rounded">
                      {proj.source === 'server' ? 'Server' : 'Local'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}