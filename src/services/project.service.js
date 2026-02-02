const supabase = require('../config/supabase');
const axetLLMService = require('./axetLLM.service');

/**
 * Calculate risk level from AI analysis health score
 * @param {Object} analysis - AI analysis object with healthScore
 * @returns {string} - Risk level: 'green', 'yellow', or 'red'
 */
function calculateRiskLevel(analysis) {
  if (!analysis || typeof analysis.healthScore !== 'number') {
    return 'yellow'; // Default to yellow if no score available
  }
  
  const score = analysis.healthScore;
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

class ProjectService {
  // Transform database fields (snake_case) to frontend fields (camelCase)
  transformProject(project) {
    if (!project) return null;
    
    // Generate code if not present
    let code = project.project_code || project.code;
    if (!code && project.name && project.id) {
      // Generate code dynamically: PREFIX-YEAR-ID
      const prefix = this.getProjectPrefix(project.name);
      const year = project.start_date ? new Date(project.start_date).getFullYear() : new Date().getFullYear();
      const paddedId = String(project.id).padStart(3, '0');
      code = `${prefix}-${year}-${paddedId}`;
    }
    
    // Calculate planned progress based on dates
    const plannedProgress = this.calculatePlannedProgress(project.start_date, project.end_date);
    
    // Use actual progress from progress field or calculate it
    const actualProgress = project.actual_progress || project.progress || 0;
    
    // Map status from English to Spanish
    const statusMap = {
      'in_progress': 'Activo',
      'completed': 'Completado',
      'planning': 'En Planificación',
      'on_hold': 'En Pausa',
      'cancelled': 'Cancelado'
    };
    const status = statusMap[project.status] || project.status || 'Activo';
    
    return {
      ...project,
      code: code || `PRJ-${project.id}`,
      status: status,
      startDate: project.start_date || project.startDate,
      endDate: project.end_date || project.endDate,
      plannedProgress: plannedProgress,
      actualProgress: actualProgress,
      leader: project.project_manager || project.leader || 'No asignado',
      aiRiskLevel: project.ai_risk_assessment?.level || project.ai_risk_level || project.aiRiskLevel,
      managementSystem: project.management_system || project.managementSystem,
      managementPath: project.management_path || project.managementPath
    };
  }

  // Calculate planned progress based on project timeline
  calculatePlannedProgress(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // If project hasn't started yet
    if (today < start) return 0;
    
    // If project has ended
    if (today > end) return 100;
    
    // Calculate percentage based on elapsed time
    const totalDuration = end - start;
    const elapsedDuration = today - start;
    const plannedProgress = (elapsedDuration / totalDuration) * 100;
    
    return Math.min(100, Math.max(0, plannedProgress));
  }

  // Helper to determine project code prefix based on name
  getProjectPrefix(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('crm')) return 'CRM';
    if (nameLower.includes('migr') || nameLower.includes('cloud')) return 'MIG';
    if (nameLower.includes('app') || nameLower.includes('móvil') || nameLower.includes('movil')) return 'APP';
    if (nameLower.includes('reserv')) return 'RES';
    if (nameLower.includes('recursos') || nameLower.includes('rrhh')) return 'RRHH';
    if (nameLower.includes('iot') || nameLower.includes('monitor')) return 'IOT';
    if (nameLower.includes('erp') || nameLower.includes('sap')) return 'ERP';
    if (nameLower.includes('portal')) return 'PRT';
    if (nameLower.includes('sistema')) return 'SYS';
    return 'PRJ';
  }

  // Calculate planned progress based on project timeline
  calculatePlannedProgress(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    const totalDuration = end - start;
    const elapsedDuration = today - start;
    const plannedProgress = (elapsedDuration / totalDuration) * 100;
    
    return Math.min(100, Math.max(0, Math.round(plannedProgress)));
  }

  async getAllProjects(filters = {}) {
    let query = supabase
      .from('projects')
      .select('*, tasks(*)')
      .order('created_at', { ascending: false });

    if (filters.code) {
      query = query.ilike('project_code', `%${filters.code}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('end_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('start_date', filters.endDate);
    }

    if (filters.riskLevel) {
      query = query.eq('ai_risk_level', filters.riskLevel);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }

    // Transform all projects
    const transformedData = (data || []).map(project => this.transformProject(project));
    return transformedData;
  }

  async getProjectById(projectId) {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, tasks(*), project_history(*), documents(*)')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Project not found');
      }
      throw new Error(`Error fetching project: ${error.message}`);
    }

    if (project.project_history) {
      project.project_history.sort((a, b) => new Date(b.change_date) - new Date(a.change_date));
    }

    // Transform project with tasks
    const transformedProject = this.transformProject(project);
    
    // Transform tasks if they exist
    if (transformedProject.tasks && Array.isArray(transformedProject.tasks)) {
      transformedProject.tasks = transformedProject.tasks.map(task => ({
        ...task,
        taskCode: task.task_code || task.taskCode,
        taskName: task.task_name || task.taskName,
        startDate: task.start_date || task.startDate,
        endDate: task.end_date || task.endDate,
        plannedProgress: task.planned_progress || task.plannedProgress || 0,
        actualProgress: task.actual_progress || task.actualProgress || 0,
        aiRiskLevel: task.ai_risk_level || task.aiRiskLevel,
        aiValidationStatus: task.ai_validation_status || task.aiValidationStatus,
        aiRiskReasons: task.ai_risk_reasons || task.aiRiskReasons || []
      }));
    }

    return transformedProject;
  }

  async createProject(projectData) {
    const projectCode = await this.generateProjectCode();

    const newProject = {
      project_code: projectCode,
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || 'planning',
      priority: projectData.priority || 'medium',
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      budget: projectData.budget || null,
      ai_analysis: null,
      ai_last_analysis_date: null,
      ai_risk_level: null
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }

    try {
      const aiAnalysis = await axetLLMService.analyzeProject(project);
      const riskLevel = calculateRiskLevel(aiAnalysis);
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          ai_analysis: aiAnalysis,
          ai_last_analysis_date: new Date().toISOString(),
          ai_risk_level: riskLevel
        })
        .eq('id', project.id);

      if (!updateError) {
        project.ai_analysis = aiAnalysis;
        project.ai_last_analysis_date = new Date().toISOString();
        project.ai_risk_level = riskLevel;
      }
    } catch (aiError) {
      console.error('AI Analysis error:', aiError);
    }

    return project;
  }

  async updateProject(projectId, updates) {
    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Project not found');
      }
      throw new Error(`Error updating project: ${error.message}`);
    }

    return project;
  }

  async deleteProject(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }

    return { message: 'Project deleted successfully' };
  }

  async getProjectAIAnalysis(projectId) {
    const project = await this.getProjectById(projectId);
    
    if (project.ai_analysis) {
      return project.ai_analysis;
    }

    const aiAnalysis = await axetLLMService.analyzeProject(project);
    const riskLevel = calculateRiskLevel(aiAnalysis);
    
    await supabase
      .from('projects')
      .update({ 
        ai_analysis: aiAnalysis,
        ai_last_analysis_date: new Date().toISOString(),
        ai_risk_level: riskLevel
      })
      .eq('id', projectId);

    return aiAnalysis;
  }

  /**
   * Get project with AI analysis (called by controller)
   * @param {string} projectId - Project ID
   * @param {boolean} forceRefresh - Force new AI analysis
   * @returns {Promise<Object>} - Project with AI analysis
   */
  async getProjectWithAIAnalysis(projectId, forceRefresh = false) {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      throw new Error('Project not found');
    }

    // If force refresh or no analysis exists, generate new analysis
    if (forceRefresh || !project.ai_analysis) {
      const aiAnalysis = await axetLLMService.analyzeProject(project);
      const riskLevel = calculateRiskLevel(aiAnalysis);
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          ai_analysis: aiAnalysis,
          ai_last_analysis_date: new Date().toISOString(),
          ai_risk_level: riskLevel
        })
        .eq('id', projectId);

      if (!updateError) {
        project.ai_analysis = aiAnalysis;
        project.ai_last_analysis_date = new Date().toISOString();
        project.ai_risk_level = riskLevel;
      }
    }

    return project;
  }

  async getProjectHistory(projectId) {
    const { data: history, error } = await supabase
      .from('project_history')
      .select('*')
      .eq('project_id', projectId)
      .order('change_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching project history: ${error.message}`);
    }

    return history || [];
  }

  async addHistoryEntry(projectId, historyData) {
    const newEntry = {
      project_id: parseInt(projectId),
      change_type: historyData.change_type,
      field_changed: historyData.field_changed,
      old_value: historyData.old_value,
      new_value: historyData.new_value,
      changed_by: historyData.changed_by,
      change_date: new Date().toISOString()
    };

    const { data: entry, error } = await supabase
      .from('project_history')
      .insert([newEntry])
      .select()
      .single();

    if (error) {
      throw new Error(`Error adding history entry: ${error.message}`);
    }

    return entry;
  }

  async getDashboardStats() {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*, tasks(*)');

    if (projectsError) {
      throw new Error(`Error fetching dashboard stats: ${projectsError.message}`);
    }

    const totalProjects = projects.length;
    const projectsByStatus = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const projectsByPriority = projects.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {});

    const allTasks = projects.flatMap(p => p.tasks || []);
    const totalTasks = allTasks.length;
    const tasksByStatus = allTasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;

    const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const avgBudget = totalProjects > 0 ? totalBudget / totalProjects : 0;

    const projectsByRisk = projects.reduce((acc, p) => {
      const risk = p.ai_risk_level || 'unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    return {
      overview: {
        totalProjects,
        totalTasks,
        completionRate: parseFloat(completionRate),
        totalBudget: parseFloat(totalBudget.toFixed(2)),
        avgBudget: parseFloat(avgBudget.toFixed(2))
      },
      projects: {
        byStatus: projectsByStatus,
        byPriority: projectsByPriority,
        byRisk: projectsByRisk
      },
      tasks: {
        total: totalTasks,
        byStatus: tasksByStatus,
        completed: completedTasks
      }
    };
  }

  async generateProjectCode() {
    const year = new Date().getFullYear();
    
    const { count, error } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .ilike('project_code', `PROJ-${year}-%`);

    if (error) {
      console.error('Error counting projects:', error);
    }

    const nextNumber = (count || 0) + 1;
    return `PROJ-${year}-${String(nextNumber).padStart(3, '0')}`;
  }

  calculateProgress(project) {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }

    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    return (completedTasks / project.tasks.length * 100).toFixed(2);
  }
}

module.exports = new ProjectService();
