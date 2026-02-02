require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const supabase = require('./config/supabase');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins in development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'IA Projects API Docs'
}));

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Check API and database connection status
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('projects').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Connected (Supabase REST API)',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'IA Projects Management API',
    version: '1.0.0',
    description: 'API para gestión de proyectos con análisis IA usando Azure OpenAI',
    endpoints: {
      health: 'GET /health',
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        aiAnalysis: 'GET /api/projects/:id/ai-analysis',
        history: 'GET /api/projects/:id/history',
        addHistory: 'POST /api/projects/:id/history',
        dashboardStats: 'GET /api/projects/dashboard/stats'
      },
      tasks: {
        listByProject: 'GET /api/tasks/project/:projectId',
        create: 'POST /api/tasks/project/:projectId',
        get: 'GET /api/tasks/:taskCode',
        update: 'PUT /api/tasks/:taskCode',
        delete: 'DELETE /api/tasks/:taskCode',
        statistics: 'GET /api/tasks/project/:projectId/statistics',
        riskAnalysis: 'GET /api/tasks/:taskCode/risk-analysis'
      }
    },
    features: [
      'Gestión completa de proyectos (CRUD)',
      'Gestión de tareas por proyecto',
      'Análisis IA con Azure OpenAI',
      'Cálculo de riesgos y desviaciones',
      'Historial de cambios',
      'Dashboard ejecutivo con estadísticas',
      'Integración con PostgreSQL'
    ]
  });
});

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test Supabase connection only in non-Vercel environments
    if (process.env.VERCEL !== '1') {
      console.log('🔄 Testing Supabase connection...');
      const { error } = await supabase.from('projects').select('id').limit(1);
      
      if (error) {
        console.error('❌ Cannot connect to Supabase:', error.message);
        process.exit(1);
      }
      
      console.log('✅ Supabase REST API connected successfully');
    }

    // Start listening only if not in Vercel (Vercel handles this)
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
        console.log(`📄 API Endpoints: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Database: Supabase REST API`);
        console.log(`🤖 Axet LLM Mock Mode: ${process.env.AXET_MOCK_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
        console.log('='.repeat(60));
      });
    } else {
      console.log('🚀 Server ready for Vercel serverless deployment');
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
