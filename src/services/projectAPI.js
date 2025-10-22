import axios from 'axios';

// Use env variable when available, otherwise fall back to localhost.
// If the provided base URL doesn't include the API mount (/api/v#), append the default /api/v1
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
function normalizeApiRoot(raw) {
  if (!raw) return 'http://localhost:5000/api/v1';
  let r = String(raw).trim().replace(/\/+$/, '');
  // If a path like /api/v1 or /api/v2 is already present, keep it. Otherwise append /api/v1
  if (!/\/api\/v\d+/i.test(r)) {
    r = `${r}/api/v1`;
  }
  return r;
}

const API_ROOT = normalizeApiRoot(RAW_API_BASE);
const PROJECTS_URL = `${API_ROOT}/projects`;

/**
 * Return list of projects (array) — resolves to data.projects
 */
export const getProjects = async (params = {}) => {
  try {
    const response = await axios.get(PROJECTS_URL, { withCredentials: true, params });
    // server response shape: { message, statusCode, success, data: { projects } }
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
    return response.data.data.project; // single project object
  } catch (error) {
    console.error('Error fetching project from', `${PROJECTS_URL}/${projectId}`, {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    // Fallback: try relative path if server is proxied or same-origin
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

      // Prefer structured server responses when available
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

/**
 * Convenience alias the UI expects: saveProject will create or update depending on presence of id/_id
 */
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