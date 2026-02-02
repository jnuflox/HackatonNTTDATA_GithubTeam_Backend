const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IA Projects Management API',
      version: '1.0.0',
      description: 'API RESTful para gestión de proyectos con análisis de inteligencia artificial usando Azure OpenAI',
      contact: {
        name: 'API Support',
        email: 'support@iaprojects.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.iaprojects.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Projects',
        description: 'Project management endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints'
      },
      {
        name: 'AI Analysis',
        description: 'AI-powered analysis endpoints'
      }
    ],
    components: {
      schemas: {
        Project: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            id: {
              type: 'integer',
              description: 'Project ID (auto-generated)',
              example: 1
            },
            project_code: {
              type: 'string',
              description: 'Unique project code',
              example: 'PROJ-2026-001'
            },
            name: {
              type: 'string',
              description: 'Project name',
              example: 'Sistema de Gestión de Inventario'
            },
            description: {
              type: 'string',
              description: 'Project description',
              example: 'Sistema web para control de inventario en tiempo real'
            },
            status: {
              type: 'string',
              enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
              default: 'planning',
              description: 'Project status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium',
              description: 'Project priority'
            },
            start_date: {
              type: 'string',
              format: 'date',
              description: 'Project start date',
              example: '2026-01-15'
            },
            end_date: {
              type: 'string',
              format: 'date',
              description: 'Project end date',
              example: '2026-06-30'
            },
            budget: {
              type: 'number',
              format: 'decimal',
              description: 'Project budget',
              example: 50000.00
            },
            ai_insights: {
              type: 'object',
              description: 'AI-generated insights from Azure OpenAI'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Task: {
          type: 'object',
          required: ['project_id', 'name', 'assigned_to'],
          properties: {
            id: {
              type: 'integer',
              description: 'Task ID (auto-generated)'
            },
            task_code: {
              type: 'string',
              description: 'Unique task code',
              example: 'TASK-PROJ-2026-001-001'
            },
            project_id: {
              type: 'integer',
              description: 'Associated project ID'
            },
            name: {
              type: 'string',
              description: 'Task name',
              example: 'Diseño de base de datos'
            },
            description: {
              type: 'string',
              description: 'Task description'
            },
            assigned_to: {
              type: 'string',
              description: 'Assigned team member',
              example: 'Juan Pérez'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'review', 'completed', 'blocked'],
              default: 'pending'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium'
            },
            estimated_hours: {
              type: 'number',
              format: 'decimal',
              example: 40
            },
            actual_hours: {
              type: 'number',
              format: 'decimal',
              example: 45
            },
            start_date: {
              type: 'string',
              format: 'date'
            },
            due_date: {
              type: 'string',
              format: 'date'
            },
            completion_date: {
              type: 'string',
              format: 'date'
            },
            risk_level: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical']
            },
            ai_risk_analysis: {
              type: 'object',
              description: 'AI risk analysis from Azure OpenAI'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message description'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'number',
              example: 3600.5
            },
            database: {
              type: 'string',
              example: 'Connected (Supabase REST API)'
            },
            environment: {
              type: 'string',
              example: 'development'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
