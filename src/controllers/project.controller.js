const projectService = require('../services/project.service');

class ProjectController {
  /**
   * GET /api/projects
   */
  async getAllProjects(req, res) {
    try {
      const filters = {
        code: req.query.code,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        riskLevel: req.query.riskLevel
      };

      const projects = await projectService.getAllProjects(filters);

      res.json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener proyectos'
      });
    }
  }

  /**
   * GET /api/projects/:id
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error in getProjectById:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al obtener proyecto'
        });
      }
    }
  }

  /**
   * POST /api/projects
   */
  async createProject(req, res) {
    try {
      const project = await projectService.createProject(req.body);

      res.status(201).json({
        success: true,
        data: project,
        message: 'Proyecto creado exitosamente'
      });
    } catch (error) {
      console.error('Error in createProject:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error al crear proyecto'
      });
    }
  }

  /**
   * PUT /api/projects/:id
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body);

      res.json({
        success: true,
        data: project,
        message: 'Proyecto actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error in updateProject:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message || 'Error al actualizar proyecto'
        });
      }
    }
  }

  /**
   * DELETE /api/projects/:id
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const result = await projectService.deleteProject(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in deleteProject:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al eliminar proyecto'
        });
      }
    }
  }

  /**
   * GET /api/projects/:id/ai-analysis
   */
  async getProjectAIAnalysis(req, res) {
    try {
      const { id } = req.params;
      const forceRefresh = req.query.refresh === 'true';
      
      const project = await projectService.getProjectWithAIAnalysis(id, forceRefresh);

      res.json({
        success: true,
        data: {
          project: {
            id: project.id,
            code: project.code,
            name: project.name,
            status: project.status
          },
          analysis: project.ai_analysis,
          lastAnalysisDate: project.ai_last_analysis_date,
          riskLevel: project.ai_risk_level
        }
      });
    } catch (error) {
      console.error('Error in getProjectAIAnalysis:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al obtener análisis IA'
        });
      }
    }
  }

  /**
   * GET /api/projects/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      const filters = {
        status: req.query.status,
        period: req.query.period,
        riskLevel: req.query.risk
      };

      const stats = await projectService.getDashboardStats(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener estadísticas del dashboard'
      });
    }
  }

  /**
   * GET /api/projects/:id/history
   */
  async getProjectHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await projectService.getProjectHistory(id);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error in getProjectHistory:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener historial'
      });
    }
  }

  /**
   * POST /api/projects/:id/history
   */
  async addHistoryEntry(req, res) {
    try {
      const { id } = req.params;
      const history = await projectService.addHistoryEntry(id, req.body);

      res.status(201).json({
        success: true,
        data: history,
        message: 'Entrada de historial agregada exitosamente'
      });
    } catch (error) {
      console.error('Error in addHistoryEntry:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message || 'Error al agregar entrada de historial'
        });
      }
    }
  }
}

module.exports = new ProjectController();
