/**
 * API Service for project operations
 */

const API_BASE = '/api/projects';

class ProjectAPI {
  
  /**
   * Get user ID from localStorage or generate temporary one
   */
  getUserId() {
    if (typeof window === 'undefined') return 'anonymous';
    
    let userId = localStorage.getItem('cipher-studio-user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cipher-studio-user-id', userId);
    }
    return userId;
  }

  /**
   * Get all projects for current user
   */
  async getProjects(options = {}) {
    try {
      const { limit = 10, search = '', isPublic = false } = options;
      const userId = this.getUserId();
      
      const params = new URLSearchParams({
        owner: userId,
        limit: limit.toString(),
        public: isPublic.toString()
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE}?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get specific project by ID
   */
  async getProject(projectId) {
    try {
      const userId = this.getUserId();
      const params = new URLSearchParams({ owner: userId });
      
      const response = await fetch(`${API_BASE}/${projectId}?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch project');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Create new project
   */
  async createProject(projectData) {
    try {
      const userId = this.getUserId();
      
      const payload = {
        ...projectData,
        owner: userId
      };

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create project');
      }

      return data.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update existing project
   */
  async updateProject(projectId, updates) {
    try {
      const userId = this.getUserId();
      
      const payload = {
        ...updates,
        owner: userId
      };

      const response = await fetch(`${API_BASE}/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update project');
      }

      return data.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    try {
      const userId = this.getUserId();
      const params = new URLSearchParams({ owner: userId });

      const response = await fetch(`${API_BASE}/${projectId}?${params}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete project');
      }

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Auto-save project files (for real-time saving)
   */
  async autoSaveProject(projectId, files) {
    try {
      const userId = this.getUserId();
      
      const payload = {
        files,
        owner: userId,
        lastModified: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE}/${projectId}/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Auto-save failed');
      }

      return data.data;
    } catch (error) {
      console.error('Error auto-saving project:', error);
      throw error;
    }
  }

  /**
   * Save project with user interaction (save button)
   */
  async saveProject(project) {
    try {
      if (project.id) {
        // Update existing project
        return await this.updateProject(project.id, {
          name: project.name,
          description: project.description,
          files: project.files,
          isPublic: project.isPublic,
          tags: project.tags
        });
      } else {
        // Create new project
        return await this.createProject({
          name: project.name,
          description: project.description || '',
          files: project.files,
          template: 'react',
          isPublic: project.isPublic || false,
          tags: project.tags || []
        });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  /**
   * Search public projects
   */
  async searchPublicProjects(query, limit = 20) {
    try {
      const params = new URLSearchParams({
        search: query,
        public: 'true',
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE}?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      return data.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
}

// Export singleton instance
const projectAPI = new ProjectAPI();
export default projectAPI;