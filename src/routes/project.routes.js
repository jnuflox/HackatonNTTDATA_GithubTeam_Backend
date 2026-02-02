const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');

/**
 * @swagger
 * /api/projects/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Projects]
 *     description: Retrieve aggregated statistics for executive dashboard
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 */
// Dashboard stats
router.get('/dashboard/stats', projectController.getDashboardStats.bind(projectController));

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     description: Retrieve a list of all projects
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     description: Create a new project with AI analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sistema de Gestión de Inventario
 *               description:
 *                 type: string
 *                 example: Sistema web para control de inventario en tiempo real
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, on_hold, completed, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Projects CRUD
router.get('/', projectController.getAllProjects.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     description: Retrieve a specific project by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     description: Update an existing project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     description: Delete a project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', projectController.getProjectById.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}/ai-analysis:
 *   get:
 *     summary: Get AI analysis for project
 *     tags: [AI Analysis]
 *     description: Get AI-powered analysis and insights for a specific project using Azure OpenAI
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: AI analysis retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// AI Analysis
router.get('/:id/ai-analysis', projectController.getProjectAIAnalysis.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}/history:
 *   get:
 *     summary: Get project history
 *     tags: [Projects]
 *     description: Retrieve the change history for a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project history retrieved successfully
 *   post:
 *     summary: Add history entry
 *     tags: [Projects]
 *     description: Add a new entry to project history
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               change_type:
 *                 type: string
 *               field_changed:
 *                 type: string
 *               old_value:
 *                 type: string
 *               new_value:
 *                 type: string
 *               changed_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: History entry added successfully
 */
// History
router.get('/:id/history', projectController.getProjectHistory.bind(projectController));
router.post('/:id/history', projectController.addHistoryEntry.bind(projectController));

module.exports = router;
