/**
 * API Configuration for Frontend
 * 
 * This file centralizes all API endpoints and configuration
 * Set USE_DOCKER_API to true when running with Docker
 */

const API_CONFIG = {
  // Set to true when running in Docker, false for local development
  USE_DOCKER_API: false,
  
  // Base URLs
  LOCAL_API_BASE: 'http://localhost:3000/api',
  DOCKER_API_BASE: '/api',  // Proxied through Nginx
  
  // Get active base URL
  get BASE_URL() {
    return this.USE_DOCKER_API ? this.DOCKER_API_BASE : this.LOCAL_API_BASE;
  },
  
  // Endpoints
  ENDPOINTS: {
    // Projects
    PROJECTS: {
      LIST: '/projects',
      GET: '/projects/:id',
      CREATE: '/projects',
      UPDATE: '/projects/:id',
      DELETE: '/projects/:id',
      AI_ANALYSIS: '/projects/:id/ai-analysis',
      HISTORY: '/projects/:id/history',
      ADD_HISTORY: '/projects/:id/history',
      DASHBOARD_STATS: '/projects/dashboard/stats'
    },
    
    // Tasks
    TASKS: {
      LIST_BY_PROJECT: '/tasks/project/:projectId',
      CREATE: '/tasks/project/:projectId',
      GET: '/tasks/:taskCode',
      UPDATE: '/tasks/:taskCode',
      DELETE: '/tasks/:taskCode',
      STATISTICS: '/tasks/project/:projectId/statistics',
      RISK_ANALYSIS: '/tasks/:taskCode/risk-analysis'
    }
  },
  
  // Build full URL
  buildUrl(endpoint, params = {}) {
    let url = this.BASE_URL + endpoint;
    
    // Replace URL parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return url;
  },
  
  // Add query parameters
  addQueryParams(url, params = {}) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    return queryString ? `${url}?${queryString}` : url;
  }
};

/**
 * API Client with error handling and response parsing
 */
const ApiClient = {
  /**
   * Make HTTP request
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error ${response.status}`);
      }

      return data;
      
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  /**
   * GET request
   */
  async get(endpoint, params = {}, queryParams = {}) {
    const url = API_CONFIG.buildUrl(endpoint, params);
    const fullUrl = API_CONFIG.addQueryParams(url, queryParams);
    return this.request(fullUrl, { method: 'GET' });
  },

  /**
   * POST request
   */
  async post(endpoint, params = {}, body = {}) {
    const url = API_CONFIG.buildUrl(endpoint, params);
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  /**
   * PUT request
   */
  async put(endpoint, params = {}, body = {}) {
    const url = API_CONFIG.buildUrl(endpoint, params);
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  /**
   * DELETE request
   */
  async delete(endpoint, params = {}) {
    const url = API_CONFIG.buildUrl(endpoint, params);
    return this.request(url, { method: 'DELETE' });
  }
};

/**
 * API Service Methods
 */
const ProjectAPI = {
  /**
   * Get all projects with filters
   */
  async getAllProjects(filters = {}) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.PROJECTS.LIST,
      {},
      filters
    );
  },

  /**
   * Get project by ID
   */
  async getProjectById(projectId) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.PROJECTS.GET,
      { id: projectId }
    );
  },

  /**
   * Create project
   */
  async createProject(projectData) {
    return ApiClient.post(
      API_CONFIG.ENDPOINTS.PROJECTS.CREATE,
      {},
      projectData
    );
  },

  /**
   * Update project
   */
  async updateProject(projectId, projectData) {
    return ApiClient.put(
      API_CONFIG.ENDPOINTS.PROJECTS.UPDATE,
      { id: projectId },
      projectData
    );
  },

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    return ApiClient.delete(
      API_CONFIG.ENDPOINTS.PROJECTS.DELETE,
      { id: projectId }
    );
  },

  /**
   * Get AI analysis for project
   */
  async getProjectAIAnalysis(projectId, refresh = false) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.PROJECTS.AI_ANALYSIS,
      { id: projectId },
      { refresh: refresh.toString() }
    );
  },

  /**
   * Get project history
   */
  async getProjectHistory(projectId) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.PROJECTS.HISTORY,
      { id: projectId }
    );
  },

  /**
   * Add history entry
   */
  async addHistoryEntry(projectId, historyData) {
    return ApiClient.post(
      API_CONFIG.ENDPOINTS.PROJECTS.ADD_HISTORY,
      { id: projectId },
      historyData
    );
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(filters = {}) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.PROJECTS.DASHBOARD_STATS,
      {},
      filters
    );
  }
};

const TaskAPI = {
  /**
   * Get tasks by project
   */
  async getTasksByProject(projectId, filters = {}) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.TASKS.LIST_BY_PROJECT,
      { projectId },
      filters
    );
  },

  /**
   * Get task by code
   */
  async getTaskByCode(taskCode) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.TASKS.GET,
      { taskCode }
    );
  },

  /**
   * Create task
   */
  async createTask(projectId, taskData) {
    return ApiClient.post(
      API_CONFIG.ENDPOINTS.TASKS.CREATE,
      { projectId },
      taskData
    );
  },

  /**
   * Update task
   */
  async updateTask(taskCode, taskData) {
    return ApiClient.put(
      API_CONFIG.ENDPOINTS.TASKS.UPDATE,
      { taskCode },
      taskData
    );
  },

  /**
   * Delete task
   */
  async deleteTask(taskCode) {
    return ApiClient.delete(
      API_CONFIG.ENDPOINTS.TASKS.DELETE,
      { taskCode }
    );
  },

  /**
   * Get task statistics
   */
  async getTaskStatistics(projectId) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.TASKS.STATISTICS,
      { projectId }
    );
  },

  /**
   * Get task risk analysis
   */
  async getTaskRiskAnalysis(taskCode) {
    return ApiClient.get(
      API_CONFIG.ENDPOINTS.TASKS.RISK_ANALYSIS,
      { taskCode }
    );
  }
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.ApiClient = ApiClient;
  window.ProjectAPI = ProjectAPI;
  window.TaskAPI = TaskAPI;
}
