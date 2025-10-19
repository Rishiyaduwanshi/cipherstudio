import { create } from 'zustand';
import { toast } from 'react-toastify';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,

  // Fetch projects from server
  fetchProjects: async () => {
    try {
      set({ loading: true });
      
      const response = await fetch('/api/projects', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      set({ projects: data.data || [], loading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      set({ loading: false });
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      const newProject = data.data;
      
      set(state => ({ 
        projects: [newProject, ...state.projects],
        currentProject: newProject
      }));
      
      toast.success('Project created successfully! 🚀');
      return { success: true, project: newProject };
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return { success: false, error: error.message };
    }
  },

  // Update project
  updateProject: async (projectId, updates) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const data = await response.json();
      const updatedProject = data.data;
      
      set(state => ({
        projects: state.projects.map(p => 
          p._id === projectId ? updatedProject : p
        ),
        currentProject: state.currentProject?._id === projectId ? updatedProject : state.currentProject
      }));
      
      toast.success('Project updated successfully! ✅');
      return { success: true, project: updatedProject };
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return { success: false, error: error.message };
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      set(state => ({
        projects: state.projects.filter(p => p._id !== projectId),
        currentProject: state.currentProject?._id === projectId ? null : state.currentProject
      }));
      
      toast.success('Project deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return { success: false, error: error.message };
    }
  },

  // Set current project
  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  // Clear all projects (on logout)
  clearProjects: () => {
    set({ projects: [], currentProject: null });
  }
}));

export default useProjectStore;