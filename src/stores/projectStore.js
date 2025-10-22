import { create } from 'zustand';
import { toast } from 'react-toastify';
import * as projectAPI from '../services/projectAPI';

const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const projects = await projectAPI.getProjects();
      set({ projects: projects || [], loading: false });
      return projects;
    } catch (error) {
      set({ loading: false });
      if (error.status === 401) {
        window.location.href = '/signin';
        return;
      }
      toast.error(error.message || 'Failed to load projects');
      throw error;
    }
  },

  createProject: async (projectData) => {
    set({ loading: true });
    try {
      const created = await projectAPI.createProject(projectData);
      set((state) => ({ 
        projects: [...state.projects, created], 
        loading: false 
      }));
      return created;
    } catch (error) {
      set({ loading: false });
      if (error.status === 401) {
        window.location.href = '/signin';
        return;
      }
      throw error;
    }
  },

  fetchProjectById: async (projectId) => {
    set({ loading: true });
    try {
      const project = await projectAPI.getProject(projectId);
      set({ currentProject: project, loading: false });
      return project;
    } catch (error) {
      set({ loading: false });
      if (error.status === 401) {
        window.location.href = '/signin';
        return;
      }
      if (error.status === 404) {
        toast.error('Project not found');
        return null;
      }
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
      return updated;
    } catch (error) {
      set({ loading: false });
      if (error.status === 401) {
        window.location.href = '/signin';
        return;
      }
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    set({ loading: true });
    try {
      await projectAPI.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== projectId),
        currentProject: state.currentProject && state.currentProject._id === projectId ? null : state.currentProject,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      if (error.status === 401) {
        window.location.href = '/signin';
        return;
      }
      throw error;
    }
  },
}));

export default useProjectStore;