const taskService = require('../services/task.service');

class TaskController {
  /**
   * GET /api/tasks/project/:projectId
   */
  async getTasksByProject(req, res) {
    try {
      const { projectId } = req.params;
      const filters = {
        taskCode: req.query.taskCode,
        stage: req.query.stage,
        status: req.query.status,
        milestone: req.query.milestone,
        responsible: req.query.responsible,
        riskLevel: req.query.riskLevel
      };

      const tasks = await taskService.getTasksByProject(projectId, filters);

      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Error in getTasksByProject:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener tareas'
      });
    }
  }

  /**
   * GET /api/tasks/:taskCode
   */
  async getTaskByCode(req, res) {
    try {
      const { taskCode } = req.params;
      const task = await taskService.getTaskByCode(taskCode);

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error in getTaskByCode:', error);
      
      if (error.message === 'Task not found') {
        res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al obtener tarea'
        });
      }
    }
  }

  /**
   * POST /api/tasks/project/:projectId
   */
  async createTask(req, res) {
    try {
      const { projectId } = req.params;
      const task = await taskService.createTask(projectId, req.body);

      // Analyze risk
      const riskAnalysis = taskService.analyzeTaskRisk(task);
      await task.update({
        ai_risk_level: riskAnalysis.riskLevel,
        ai_validation: {
          riskScore: riskAnalysis.riskScore,
          factors: riskAnalysis.factors,
          analyzedAt: new Date()
        }
      });

      res.status(201).json({
        success: true,
        data: task,
        message: 'Tarea creada exitosamente'
      });
    } catch (error) {
      console.error('Error in createTask:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message || 'Error al crear tarea'
        });
      }
    }
  }

  /**
   * PUT /api/tasks/:taskCode
   */
  async updateTask(req, res) {
    try {
      const { taskCode } = req.params;
      const task = await taskService.updateTask(taskCode, req.body);

      // Re-analyze risk after update
      const riskAnalysis = taskService.analyzeTaskRisk(task);
      await task.update({
        ai_risk_level: riskAnalysis.riskLevel,
        ai_validation: {
          ...task.ai_validation,
          riskScore: riskAnalysis.riskScore,
          factors: riskAnalysis.factors,
          lastAnalyzedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: task,
        message: 'Tarea actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error in updateTask:', error);
      
      if (error.message === 'Task not found') {
        res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message || 'Error al actualizar tarea'
        });
      }
    }
  }

  /**
   * DELETE /api/tasks/:taskCode
   */
  async deleteTask(req, res) {
    try {
      const { taskCode } = req.params;
      const result = await taskService.deleteTask(taskCode);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in deleteTask:', error);
      
      if (error.message === 'Task not found') {
        res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al eliminar tarea'
        });
      }
    }
  }

  /**
   * GET /api/tasks/project/:projectId/statistics
   */
  async getTaskStatistics(req, res) {
    try {
      const { projectId } = req.params;
      const stats = await taskService.getTaskStatistics(projectId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getTaskStatistics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener estadísticas de tareas'
      });
    }
  }

  /**
   * GET /api/tasks/:taskCode/risk-analysis
   */
  async getTaskRiskAnalysis(req, res) {
    try {
      const { taskCode } = req.params;
      const task = await taskService.getTaskByCode(taskCode);
      const riskAnalysis = taskService.analyzeTaskRisk(task);

      res.json({
        success: true,
        data: {
          task: {
            code: task.task_code,
            name: task.name,
            status: task.status
          },
          riskAnalysis
        }
      });
    } catch (error) {
      console.error('Error in getTaskRiskAnalysis:', error);
      
      if (error.message === 'Task not found') {
        res.status(404).json({
          success: false,
          error: 'Tarea no encontrada'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al analizar riesgo de tarea'
        });
      }
    }
  }
}

module.exports = new TaskController();
