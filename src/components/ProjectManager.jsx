'use client';
import React, { useState, useEffect } from 'react';
import { initialFiles } from '@/data/initialProject-react';
import { toast } from 'react-toastify';
import projectAPI from '@/services/projectAPI';
import { useRouter } from 'next/navigation';
import CreateProjectModal from './CreateProjectModal';
import DownloadButton from './DownloadButton';
import { getLocalProjects, saveLocalProject, getStorageItem, setStorageItem } from '@/utils/storage';
import { HTTP_STATUS, ROUTES, UI } from '@/constants';

export default function ProjectManager({ project, setProject }) {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadSavedProjects = async () => {
    setLoading(true);
    setShowLoadModal(true);

    try {
      let serverProjects = [];
      try {
        const resp = await projectAPI.getProjects({ limit: 20 });
        serverProjects = Array.isArray(resp) ? resp : resp.projects || resp;
      } catch (e) {
        console.warn('Failed to fetch server projects', e);
        if (e?.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          router.push(ROUTES.SIGNIN);
          return;
        }
        toast.error('Failed to fetch server projects');
      }

      const serverEntries = (serverProjects || []).map((p) => ({
        source: 'server',
        id: p._id || p.id,
        name: p.name || 'Untitled',
        files: p.files || {},
        project: p,
        listId: `server-${p._id || p.id}`,
      }));

      const localEntries = getLocalProjects();
      setSavedProjects([...serverEntries, ...localEntries]);
    } catch (error) {
      console.error('❌ Load projects error:', error);
      toast.error(error?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }

    setShowLoadModal(true);
  };

  const saveProjectAs = () => {
    try {
      saveLocalProject(project);
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
      // Make sure we're sending the latest file changes
      const currentProject = {
        ...project,
        files: project.files // Use the files directly from project state
      };
      
      const savedProject = project._id
        ? await projectAPI.updateProject(project._id, currentProject)
        : await projectAPI.createProject(currentProject);

      // update current project with server response but keep our local files
      setProject((prev) => ({ 
        ...(prev || {}), 
        ...savedProject,
        files: currentProject.files // Keep our current files
      }));
      
      toast.success('Project saved to server');

      if (!project._id && savedProject._id) {
        router.push(ROUTES.PROJECT_DETAIL(savedProject._id));
      }
    } catch (e) {
      console.error('Save to server failed', e);
      if (e?.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        router.push(ROUTES.SIGNIN);
        return;
      }
      toast.error(
        e?.response?.data?.message || e?.message || 'Failed to save to server'
      );
    } finally {
      setSaving(false);
    }
  };

  const loadLocalProject = (storageKey) => {
    try {
      const savedProject = getStorageItem(storageKey);
      if (savedProject) {
        setProject(savedProject);
        setStorageItem('cipherstudio-project', savedProject);
        toast.success(
          `Loaded local project: ${savedProject?.name || 'Untitled'}`
        );
      }
    } catch (e) {
      console.error('Load local project failed', e);
      toast.error('Failed to load local project');
    } finally {
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
            className="btn-success !py-1"
          >
            New Project
          </button>
          {project && (
            <>
              <button
                onClick={saveProjectAs}
                className="px-3 py-1 bg-info text-white rounded text-sm hover:bg-info-hover transition-colors"
              >
                Save to Local
              </button>
              <button
                onClick={saveProjectToServer}
                disabled={saving}
                className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-hover disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving...' : 'Save to Server'}
              </button>
              <button
                onClick={loadSavedProjects}
                className="px-3 py-1 bg-warning text-white rounded text-sm hover:bg-warning-hover transition-colors"
              >
                Load Project
              </button>

              <DownloadButton project={project} />
            </>
          )}
        </div>

        {/* Projects Grid - Only show in non-IDE mode */}
        {!project?._id && savedProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProjects.map((proj) => (
              <div
                key={proj.listId}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  if (proj.source === 'server') {
                    router.push(`/projects/${proj.id}`);
                  } else {
                    loadLocalProject(proj.storageKey);
                  }
                }}
              >
                <h3 className="text-white font-medium mb-2">{proj.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    {Object.keys(proj.files || {}).length} files
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      proj.source === 'server' ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    {proj.source === 'server' ? 'Server' : 'Local'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <CreateProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSuccess={(newProject) => {
          setProject(newProject);
          loadSavedProjects(); // Refresh the project list
          toast.success('Project created successfully!');
        }}
      />

      {/* Load Project Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-white text-lg mb-4">Load Saved Project</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className={UI.MINI_SPINNER_CLASS}></div>
              </div>
            ) : savedProjects.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No saved projects found
              </p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((proj) => (
                  <div
                    key={proj.listId}
                    onClick={() => {
                      if (proj.source === 'server') {
                        router.push(ROUTES.PROJECT_DETAIL(proj.id));
                        setShowLoadModal(false);
                      } else {
                        loadLocalProject(proj.storageKey);
                      }
                    }}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-white font-medium">{proj.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {Object.keys(proj.files || {}).length} files
                      </p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        proj.source === 'server' ? 'bg-primary' : 'bg-gray-600'
                      }`}
                    >
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
