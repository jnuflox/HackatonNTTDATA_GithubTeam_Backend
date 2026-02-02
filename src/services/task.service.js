const supabase = require('../config/supabase');
const azureOpenAIService = require('./azureOpenAI.service');

class TaskService {
  async getTasksByProject(projectId) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }

    return tasks || [];
  }

  async getTaskByCode(taskCode) {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*, projects(*)')
      .eq('task_code', taskCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Task not found');
      }
      throw new Error(`Error fetching task: ${error.message}`);
    }

    return task;
  }

  async createTask(projectId, taskData) {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('project_code')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw new Error('Project not found');
    }

    const taskCode = await this.generateTaskCode(projectId, project.project_code);

    const newTask = {
      task_code: taskCode,
      project_id: parseInt(projectId),
      name: taskData.name,
      description: taskData.description,
      assigned_to: taskData.assigned_to,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      estimated_hours: taskData.estimated_hours || null,
      actual_hours: taskData.actual_hours || null,
      start_date: taskData.start_date || null,
      due_date: taskData.due_date || null,
      completion_date: null,
      risk_level: taskData.risk_level || 'medium'
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }

    return task;
  }

  async updateTask(taskCode, updates) {
    if (updates.status === 'completed' && !updates.completion_date) {
      updates.completion_date = new Date().toISOString();
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('task_code', taskCode)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Task not found');
      }
      throw new Error(`Error updating task: ${error.message}`);
    }

    return task;
  }

  async deleteTask(taskCode) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('task_code', taskCode);

    if (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }

    return { message: 'Task deleted successfully' };
  }

  async getTaskStatistics(projectId) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Error fetching task statistics: ${error.message}`);
    }

    const total = tasks.length;
    const byStatus = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = tasks.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});

    const byRisk = tasks.reduce((acc, t) => {
      acc[t.risk_level] = (acc[t.risk_level] || 0) + 1;
      return acc;
    }, {});

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completionRate = total > 0 ? (completedTasks.length / total * 100).toFixed(2) : 0;

    const totalEstimated = tasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
    const totalActual = tasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);

    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < new Date();
    }).length;

    return {
      total,
      byStatus,
      byPriority,
      byRisk,
      completed: completedTasks.length,
      completionRate: parseFloat(completionRate),
      overdue: overdueTasks,
      hours: {
        estimated: parseFloat(totalEstimated.toFixed(2)),
        actual: parseFloat(totalActual.toFixed(2)),
        variance: parseFloat((totalActual - totalEstimated).toFixed(2))
      }
    };
  }

  async getTaskRiskAnalysis(taskCode) {
    const task = await this.getTaskByCode(taskCode);

    if (task.ai_risk_analysis) {
      return task.ai_risk_analysis;
    }

    const riskAnalysis = await azureOpenAIService.analyzeTask(task);

    await supabase
      .from('tasks')
      .update({ ai_risk_analysis: riskAnalysis })
      .eq('task_code', taskCode);

    return riskAnalysis;
  }

  async generateTaskCode(projectId, projectCode) {
    const { count, error } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (error) {
      console.error('Error counting tasks:', error);
    }

    const nextNumber = (count || 0) + 1;
    return `TASK-${projectCode}-${String(nextNumber).padStart(3, '0')}`;
  }

  calculateTaskProgress(task) {
    if (!task.estimated_hours || task.estimated_hours === 0) {
      return task.status === 'completed' ? 100 : 0;
    }

    const actual = parseFloat(task.actual_hours) || 0;
    const estimated = parseFloat(task.estimated_hours);
    return Math.min((actual / estimated * 100), 100).toFixed(2);
  }

  calculateTimeVariance(task) {
    const estimated = parseFloat(task.estimated_hours) || 0;
    const actual = parseFloat(task.actual_hours) || 0;
    return (actual - estimated).toFixed(2);
  }
}

module.exports = new TaskService();
