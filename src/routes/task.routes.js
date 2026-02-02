const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     summary: Get tasks by project
 *     tags: [Tasks]
 *     description: Retrieve all tasks for a specific project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of tasks for the project
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
 *                     $ref: '#/components/schemas/Task'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     description: Create a new task for a specific project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - assigned_to
 *             properties:
 *               name:
 *                 type: string
 *                 example: Diseño de base de datos
 *               description:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 example: Juan Pérez
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, review, completed, blocked]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               estimated_hours:
 *                 type: number
 *               start_date:
 *                 type: string
 *                 format: date
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Tasks by project
router.get('/project/:projectId', taskController.getTasksByProject.bind(taskController));
router.post('/project/:projectId', taskController.createTask.bind(taskController));

/**
 * @swagger
 * /api/tasks/project/{projectId}/statistics:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     description: Get aggregated statistics for tasks in a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 */
router.get('/project/:projectId/statistics', taskController.getTaskStatistics.bind(taskController));

/**
 * @swagger
 * /api/tasks/{taskCode}:
 *   get:
 *     summary: Get task by code
 *     tags: [Tasks]
 *     description: Retrieve a specific task by its unique code
 *     parameters:
 *       - in: path
 *         name: taskCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Task code (e.g., TASK-PROJ-2026-001-001)
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     description: Update an existing task
 *     parameters:
 *       - in: path
 *         name: taskCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     description: Delete a task by its code
 *     parameters:
 *       - in: path
 *         name: taskCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Individual tasks
router.get('/:taskCode', taskController.getTaskByCode.bind(taskController));
router.put('/:taskCode', taskController.updateTask.bind(taskController));
router.delete('/:taskCode', taskController.deleteTask.bind(taskController));

/**
 * @swagger
 * /api/tasks/{taskCode}/risk-analysis:
 *   get:
 *     summary: Get task risk analysis
 *     tags: [AI Analysis]
 *     description: Get AI-powered risk analysis for a specific task using Azure OpenAI
 *     parameters:
 *       - in: path
 *         name: taskCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk analysis retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Task risk analysis
router.get('/:taskCode/risk-analysis', taskController.getTaskRiskAnalysis.bind(taskController));

module.exports = router;
