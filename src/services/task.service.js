const supabase = require('../config/supabase');

/**
 * Task Service
 * Handles business logic for tasks
 */
class TaskService {
  /**
   * Get tasks by project with optional filters
   * @param {string} projectId - Project UUID
   * @param {Object} filters - Optional filters (taskCode, stage, status, milestone, responsible, riskLevel)
   * @returns {Array} - Array of tasks
   */
  async getTasksByProject(projectId, filters = {}) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.taskCode) {
        query = query.ilike('task_code', `%${filters.taskCode}%`);
      }
      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.milestone) {
        query = query.eq('milestone', filters.milestone);
      }
      if (filters.responsible) {
        query = query.ilike('responsible', `%${filters.responsible}%`);
      }
      if (filters.riskLevel) {
        query = query.eq('ai_risk_level', filters.riskLevel);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching tasks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTasksByProject:', error);
      throw error;
    }
  }

  /**
   * Get task by task code
   * @param {string} taskCode - Task code
   * @returns {Object} - Task object
   */
  async getTaskByCode(taskCode) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_code', taskCode)
        .single();

      if (error || !data) {
        throw new Error('Task not found');
      }

      return data;
    } catch (error) {
      console.error('Error in getTaskByCode:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param {string} projectId - Project UUID
   * @param {Object} taskData - Task data
   * @returns {Object} - Created task
   */
  async createTask(projectId, taskData) {
    try {
      // Verify project exists
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      // Generate task code if not provided
      const taskCode = taskData.task_code || await this.generateTaskCode(projectId);

      const newTask = {
        project_id: projectId,
        task_code: taskCode,
        name: taskData.name,
        description: taskData.description || null,
        stage: taskData.stage,
        milestone: taskData.milestone || null,
        status: taskData.status || 'Pendiente',
        responsible: taskData.responsible || null,
        start_date: taskData.start_date || null,
        end_date: taskData.end_date || null,
        actual_progress: taskData.actual_progress || 0,
        ai_risk_level: null,
        ai_validation: null,
        ai_recommendations: null
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating task: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  }

  /**
   * Update task by task code
   * @param {string} taskCode - Task code
   * @param {Object} updates - Fields to update
   * @returns {Object} - Updated task
   */
  async updateTask(taskCode, updates) {
    try {
      // Get existing task
      const existingTask = await this.getTaskByCode(taskCode);

      const updatedFields = {
        name: updates.name !== undefined ? updates.name : existingTask.name,
        description: updates.description !== undefined ? updates.description : existingTask.description,
        stage: updates.stage !== undefined ? updates.stage : existingTask.stage,
        milestone: updates.milestone !== undefined ? updates.milestone : existingTask.milestone,
        status: updates.status !== undefined ? updates.status : existingTask.status,
        responsible: updates.responsible !== undefined ? updates.responsible : existingTask.responsible,
        start_date: updates.start_date !== undefined ? updates.start_date : existingTask.start_date,
        end_date: updates.end_date !== undefined ? updates.end_date : existingTask.end_date,
        actual_progress: updates.actual_progress !== undefined ? updates.actual_progress : existingTask.actual_progress,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updatedFields)
        .eq('task_code', taskCode)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating task: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  }

  /**
   * Delete task by task code
   * @param {string} taskCode - Task code
   * @returns {Object} - Result message
   */
  async deleteTask(taskCode) {
    try {
      // Verify task exists
      await this.getTaskByCode(taskCode);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_code', taskCode);

      if (error) {
        throw new Error(`Error deleting task: ${error.message}`);
      }

      return { message: 'Tarea eliminada exitosamente' };
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  }

  /**
   * Get task statistics for a project
   * @param {string} projectId - Project UUID
   * @returns {Object} - Task statistics
   */
  async getTaskStatistics(projectId) {
    try {
      const tasks = await this.getTasksByProject(projectId);

      const stats = {
        total: tasks.length,
        byStatus: {
          Pendiente: 0,
          'En Progreso': 0,
          Completada: 0,
          Bloqueada: 0,
          Cancelada: 0
        },
        byRiskLevel: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
          unknown: 0
        },
        averageProgress: 0,
        completionRate: 0
      };

      let totalProgress = 0;

      tasks.forEach(task => {
        // Count by status
        if (stats.byStatus[task.status] !== undefined) {
          stats.byStatus[task.status]++;
        }

        // Count by risk level
        const riskLevel = task.ai_risk_level || 'unknown';
        if (stats.byRiskLevel[riskLevel] !== undefined) {
          stats.byRiskLevel[riskLevel]++;
        }

        // Accumulate progress
        totalProgress += task.actual_progress || 0;
      });

      // Calculate averages
      if (tasks.length > 0) {
        stats.averageProgress = Math.round(totalProgress / tasks.length);
        stats.completionRate = Math.round((stats.byStatus.Completada / tasks.length) * 100);
      }

      return stats;
    } catch (error) {
      console.error('Error in getTaskStatistics:', error);
      throw error;
    }
  }

  /**
   * Analyze task risk based on multiple factors
   * @param {Object} task - Task object
   * @returns {Object} - Risk analysis with level, score, and factors
   */
  analyzeTaskRisk(task) {
    const factors = [];
    let riskScore = 0;

    // Factor 1: Status (30 points)
    if (task.status === 'Bloqueada') {
      riskScore += 30;
      factors.push({
        factor: 'Estado bloqueado',
        impact: 'high',
        description: 'La tarea está bloqueada y no puede avanzar'
      });
    } else if (task.status === 'Pendiente') {
      riskScore += 10;
      factors.push({
        factor: 'Estado pendiente',
        impact: 'medium',
        description: 'La tarea no ha iniciado'
      });
    }

    // Factor 2: Progress vs Deadline (40 points)
    if (task.end_date) {
      const today = new Date();
      const endDate = new Date(task.end_date);
      const daysUntilDeadline = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      const progress = task.actual_progress || 0;

      if (daysUntilDeadline < 0 && progress < 100) {
        riskScore += 40;
        factors.push({
          factor: 'Tarea atrasada',
          impact: 'critical',
          description: `La tarea debía finalizar hace ${Math.abs(daysUntilDeadline)} días y está al ${progress}%`
        });
      } else if (daysUntilDeadline <= 7 && progress < 70) {
        riskScore += 30;
        factors.push({
          factor: 'Fecha límite próxima',
          impact: 'high',
          description: `Quedan ${daysUntilDeadline} días y la tarea está al ${progress}%`
        });
      } else if (daysUntilDeadline <= 14 && progress < 50) {
        riskScore += 20;
        factors.push({
          factor: 'Progreso bajo',
          impact: 'medium',
          description: `Quedan ${daysUntilDeadline} días y el progreso es solo ${progress}%`
        });
      }
    }

    // Factor 3: Progress stagnation (20 points)
    if (task.status === 'En Progreso' && task.actual_progress < 30) {
      riskScore += 15;
      factors.push({
        factor: 'Progreso estancado',
        impact: 'medium',
        description: 'La tarea está en progreso pero con avance menor al 30%'
      });
    }

    // Factor 4: No responsible assigned (10 points)
    if (!task.responsible || task.responsible.trim() === '') {
      riskScore += 10;
      factors.push({
        factor: 'Sin responsable asignado',
        impact: 'low',
        description: 'La tarea no tiene un responsable claramente asignado'
      });
    }

    // Determine risk level based on score
    let riskLevel;
    if (riskScore >= 70) {
      riskLevel = 'critical';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      factors,
      recommendations: this.generateTaskRecommendations(task, factors, riskLevel)
    };
  }

  /**
   * Generate recommendations based on risk analysis
   * @param {Object} task - Task object
   * @param {Array} factors - Risk factors
   * @param {string} riskLevel - Risk level
   * @returns {Array} - Array of recommendations
   */
  generateTaskRecommendations(task, factors, riskLevel) {
    const recommendations = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push({
        priority: 'high',
        action: 'Escalar tarea a líder de proyecto inmediatamente',
        rationale: 'El nivel de riesgo requiere atención urgente'
      });
    }

    factors.forEach(factor => {
      if (factor.factor === 'Estado bloqueado') {
        recommendations.push({
          priority: 'high',
          action: 'Identificar y resolver bloqueador de la tarea',
          rationale: 'La tarea bloqueada impide el avance del proyecto'
        });
      }

      if (factor.factor === 'Tarea atrasada') {
        recommendations.push({
          priority: 'high',
          action: 'Revisar fecha límite y reasignar recursos si es necesario',
          rationale: 'La tarea está fuera de tiempo y requiere intervención'
        });
      }

      if (factor.factor === 'Fecha límite próxima') {
        recommendations.push({
          priority: 'medium',
          action: 'Aumentar dedicación de recursos a esta tarea',
          rationale: 'Se acerca la fecha límite y el progreso es insuficiente'
        });
      }

      if (factor.factor === 'Sin responsable asignado') {
        recommendations.push({
          priority: 'medium',
          action: 'Asignar responsable a la tarea',
          rationale: 'Las tareas sin responsable tienen baja probabilidad de completarse'
        });
      }
    });

    // Add general recommendation
    if (recommendations.length === 0 && riskLevel === 'low') {
      recommendations.push({
        priority: 'low',
        action: 'Continuar con monitoreo regular de la tarea',
        rationale: 'La tarea está en buen estado'
      });
    }

    return recommendations;
  }

  /**
   * Generate unique task code
   * @param {string} projectId - Project UUID
   * @returns {string} - Generated task code
   */
  async generateTaskCode(projectId) {
    try {
      // Get project code
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('code')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      // Count existing tasks for this project
      const { count, error: countError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (countError) {
        throw new Error(`Error counting tasks: ${countError.message}`);
      }

      const taskNumber = (count || 0) + 1;
      const taskCode = `${project.code}-T${String(taskNumber).padStart(3, '0')}`;

      return taskCode;
    } catch (error) {
      console.error('Error generating task code:', error);
      // Fallback to random code if generation fails
      return `TASK-${Date.now()}`;
    }
  }
}

module.exports = new TaskService();
