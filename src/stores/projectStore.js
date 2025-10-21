import { create } from 'zustand';
import { toast } from 'react-toastify';
import projectAPI from '../services/projectAPI';

const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const projects = await projectAPI.getProjects();
      set({ projects: projects || [], loading: false });
      toast.success('Projects loaded successfully');
      return projects;
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || 'Failed to load projects');
      throw error;
    }
  },

  createProject: async (projectData) => {
    set({ loading: true });
    try {
      const created = await projectAPI.createProject(projectData);
      set((state) => ({ projects: [...state.projects, created], loading: false }));
      toast.success('Project created successfully');
      return created;
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || 'Failed to create project');
      throw error;
    }
  },

  fetchProjectById: async (projectId) => {
    set({ loading: true });
    try {
      const project = await projectAPI.getProject(projectId);
      set({ currentProject: project, loading: false });
      toast.success('Project loaded successfully');
      return project;
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || 'Failed to load project');
      throw error;
    }
  },
  updateProject: async (projectId, updates) => {
    set({ loading: true });
    try {
      const updated = await projectAPI.updateProject(projectId, updates);
      set((state) => ({
        projects: state.projects.map((p) => (p._id === updated._id ? updated : p)),
        currentProject: state.currentProject && state.currentProject._id === updated._id ? updated : state.currentProject,
        loading: false,
      }));
      toast.success('Project updated successfully');
      return updated;
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || 'Failed to update project');
      throw error;
    }
  },
}));

export default useProjectStore;