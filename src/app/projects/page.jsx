'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import useProjectStore from '@/stores/projectStore';
import { toast } from 'react-toastify';
import { FiTrash2, FiEdit3, FiPlus, FiGlobe, FiLock } from 'react-icons/fi';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    visibility: 'private',
    settings: { framework: 'react', autoSave: true }
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/signin');
      return;
    }
    
    // Load projects when authenticated
    fetchProjects().catch(err => 
      toast.error(err.message || 'Failed to load projects')
    );
  }, [isAuthenticated, router, fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      // Import initial files
      const { initialFiles } = await import('@/data/initialProject-react');
      
      await useProjectStore.getState().createProject({
        ...newProject,
        files: initialFiles,  // Use the boilerplate files
        settings: {
          ...newProject.settings,
          framework: 'react',  // Ensure framework is set
          autoSave: true
        }
      });
      setShowCreateModal(false);
      setNewProject({
        name: '',
        description: '',
        visibility: 'private',
        settings: { framework: 'react', autoSave: true }
      });
      toast.success('Project created successfully click to open in IDE!');
      fetchProjects(); 
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
      fetchProjects(); 
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const openInIDE = (projectId) => {
    router.push(`/projects/${projectId}`);
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="container mx-auto p-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> New Project
        </button>
      </div>
      
      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.visibility === 'public' ? (
                      <FiGlobe className="text-blue-400" title="Public" />
                    ) : (
                      <FiLock className="text-gray-400" title="Private" />
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => openInIDE(project._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FiEdit3 /> Open in IDE
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="p-2 text-red-400 hover:text-red-500 transition-colors"
                    title="Delete project"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No projects yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus /> Create your first project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-white">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="Project description (optional)"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={newProject.visibility}
                    onChange={e => setNewProject(p => ({ ...p, visibility: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}