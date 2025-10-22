import axios from 'axios';
import { API_CONFIG } from '@/constants';



const RAW_API_BASE = API_CONFIG.BASE_URL;
function normalizeApiRoot(raw) {
  if (!raw) return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`;
  let r = String(raw).trim().replace(/\/+$/, '');
  
  if (!/\/api\/v\d+/i.test(r)) {
    r = `${r}/api/${API_CONFIG.API_VERSION}`;
  }
  return r;
}

const API_ROOT = normalizeApiRoot(RAW_API_BASE);
const PROJECTS_URL = `${API_ROOT}/projects`;


export const getProjects = async (params = {}) => {
  try {
    const response = await axios.get(PROJECTS_URL, { withCredentials: true, params });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    const responseError = error.response?.data || { message: 'Failed to fetch projects', status: error.response?.status };
    responseError.status = error.response?.status;
    throw responseError;
  }
};

export const getProject = async (projectId) => {
  try {
    const url = `${PROJECTS_URL}/${projectId}`;
    console.info('Requesting project:', url);
    const response = await axios.get(url, { withCredentials: true });
    return response.data.data.project; 
  } catch (error) {
    console.error('Error fetching project from', `${PROJECTS_URL}/${projectId}`, {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    
    try {
      const relUrl = `/api/v1/projects/${projectId}`;
      console.info('Attempting fallback request to', relUrl);
      const rel = await axios.get(relUrl, { withCredentials: true });
      return rel.data.data.project;
    } catch (err2) {
      console.error('Fallback fetch failed', {
        status: err2?.response?.status,
        data: err2?.response?.data,
        message: err2?.message,
      });

      const remoteData = error?.response?.data;
      const relData = err2?.response?.data;
      const fallbackMessage = {
        message:
          'Failed to fetch project from configured API and relative fallback. Ensure the backend server is running and NEXT_PUBLIC_API_BASE_URL is correct.',
        statusCode: (remoteData && remoteData.statusCode) || (relData && relData.statusCode) || 502,
        success: false,
        attempted: [
          `${PROJECTS_URL}/${projectId}`,
          `/api/v1/projects/${projectId}`,
        ],
      };

      
      throw remoteData || relData || fallbackMessage;
    }
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await axios.post(PROJECTS_URL, projectData, { withCredentials: true });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data.project;
  } catch (error) {
    console.error('Error creating project:', error);
    const responseError = error.response?.data || { message: 'Failed to create project', status: error.response?.status };
    responseError.status = error.response?.status;
    throw responseError;
  }
};

export const updateProject = async (projectId, updates) => {
  try {
    const response = await axios.put(`${PROJECTS_URL}/${projectId}`, updates, { withCredentials: true });
    return response.data.data.project;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error.response?.data || { message: 'Failed to update project' };
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await axios.delete(`${PROJECTS_URL}/${projectId}`, { withCredentials: true });
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error.response?.data || { message: 'Failed to delete project' };
  }
};


export const saveProject = async (projectPayload) => {
  const id = projectPayload._id || projectPayload.id;
  if (id) {
    return updateProject(id, projectPayload);
  }
  return createProject(projectPayload);
};

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  saveProject,
};