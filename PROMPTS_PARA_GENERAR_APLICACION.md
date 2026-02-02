# 📝 Prompts para Generar la Aplicación - sAPI IA Projects

Este documento contiene todos los prompts organizados en secuencia para generar la aplicación completa desde cero utilizando GitHub Copilot o cualquier asistente de IA.

**Actualizado:** 2026-01-29  
**Proyecto:** Hackathon NTT DATA 2026 - sAPI IA Projects  
**GitHub Team:** Backend API

---

## 🎯 Índice de Prompts

1. [Inicialización del Proyecto](#1-inicialización-del-proyecto)
2. [Configuración de Base de Datos](#2-configuración-de-base-de-datos)
3. [Modelos de Datos](#3-modelos-de-datos)
4. [Servicio de IA Axet LLM](#4-servicio-de-ia-axet-llm)
5. [Controladores](#5-controladores)
6. [Servicios de Negocio](#6-servicios-de-negocio)
7. [Rutas y Middlewares](#7-rutas-y-middlewares)
8. [Servidor Principal](#8-servidor-principal)
9. [Documentación Swagger](#9-documentación-swagger)
10. [Scripts Utilitarios](#10-scripts-utilitarios)
11. [Dockerización](#11-dockerización)
12. [Deployment](#12-deployment)

---

## 🚀 Tecnologías Utilizadas

- **Runtime:** Node.js 20.x
- **Framework:** Express 4.18
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Sequelize 6.35
- **IA:** Axet LLM Enabler (Azure OpenAI GPT-5.1)
- **Documentación:** Swagger/OpenAPI 3.0
- **Seguridad:** Helmet, CORS
- **Validación:** Joi
- **Testing:** Jest, Supertest
- **Deployment:** Vercel (Serverless)

---

## 1. Inicialización del Proyecto

### Prompt 1.1: Crear estructura inicial

```
Crea un proyecto Node.js Express para una API REST de gestión de proyectos con análisis mediante IA. 

Requisitos:
- Node.js 20.x
- Express 4.18
- TypeScript NO (usar JavaScript puro)
- Estructura MVC: models, controllers, services, routes, config
- Middlewares: helmet, cors, compression, morgan
- Validación con Joi
- PostgreSQL con Supabase
- Integración con Axet LLM Enabler de NTT DATA
- Documentación con Swagger

Genera el package.json con todas las dependencias necesarias incluyendo:
- express, axios, dotenv, pg, @supabase/supabase-js
- helmet, cors, compression, morgan, joi
- swagger-jsdoc, swagger-ui-express
- nodemon como dev dependency

Incluye scripts para:
- start: iniciar servidor
- dev: desarrollo con nodemon
- db:migrate: ejecutar migraciones
- db:seed: cargar datos semilla
- test: ejecutar tests con jest
```

### Prompt 1.2: Crear estructura de carpetas

```
Crea la siguiente estructura de carpetas para el proyecto:

```
/
├── src/
│   ├── config/         # Configuraciones
│   ├── models/         # Modelos de datos
│   ├── controllers/    # Controladores
│   ├── services/       # Servicios de negocio y externos
│   ├── routes/         # Definición de rutas
│   ├── middlewares/    # Middlewares personalizados
│   ├── database/       # Migraciones y seeds
│   │   ├── migrations/
│   │   └── seeds/
│   └── server.js       # Punto de entrada
├── api/                # Serverless functions
├── tests/              # Tests unitarios
├── .env.example        # Variables de entorno ejemplo
├── .gitignore
├── Dockerfile
├── vercel.json
└── README.md
```
```

### Prompt 1.3: Configurar .env.example

```
Crea un archivo .env.example con todas las variables de entorno necesarias para:

1. Servidor:
   - PORT
   - NODE_ENV

2. Base de datos Supabase:
   - SUPABASE_URL
   - SUPABASE_KEY
   - SUPABASE_SERVICE_KEY

3. Axet LLM Enabler:
   - AXET_MOCK_MODE (para desarrollo sin acceso real)
   - AXET_BASE_URL
   - AXET_PROJECT_ID
   - AXET_USER_ID
   - AXET_ASSET_ID
   - AXET_MODEL
   - AXET_TOKEN_URL
   - AXET_TOKEN_AUTH
   - AXET_FLOW_ID
   - AXET_ENVIRONMENT
   - AXET_USER_OKTA_ID

Incluye comentarios explicativos para cada variable.
```

---

## 2. Configuración de Base de Datos

### Prompt 2.1: Configurar Supabase

```
Crea src/config/supabase.js que:

1. Importe @supabase/supabase-js
2. Cree un cliente Supabase usando las variables de entorno:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY (usar service key para bypass RLS)
3. Configure opciones adecuadas:
   - autoRefreshToken: true
   - persistSession: false (para servidor)
4. Exporte el cliente como default
5. Incluya función testConnection() para verificar conectividad
6. Maneje errores de conexión con logs descriptivos
```

### Prompt 2.2: Crear script de migraciones SQL

```
Crea src/database/migrations/run-migrations.js que ejecute las siguientes migraciones SQL en Supabase:

1. Tabla projects:
   - id: UUID PRIMARY KEY (default uuid_generate_v4())
   - code: VARCHAR(50) UNIQUE NOT NULL
   - name: VARCHAR(255) NOT NULL
   - description: TEXT
   - status: VARCHAR(50)
   - leader: VARCHAR(255)
   - start_date: DATE
   - end_date: DATE
   - actual_progress: INTEGER DEFAULT 0
   - planned_progress: INTEGER
   - budget_total: NUMERIC(15,2)
   - budget_consumed: NUMERIC(15,2)
   - ai_analysis: JSONB (para almacenar análisis IA)
   - ai_last_analysis_date: TIMESTAMP
   - ai_risk_level: VARCHAR(20)
   - created_at: TIMESTAMP DEFAULT NOW()
   - updated_at: TIMESTAMP DEFAULT NOW()

2. Tabla tasks:
   - id: UUID PRIMARY KEY
   - project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
   - task_code: VARCHAR(50) UNIQUE NOT NULL
   - name: VARCHAR(255) NOT NULL
   - description: TEXT
   - stage: VARCHAR(100)
   - status: VARCHAR(50)
   - milestone: VARCHAR(100)
   - responsible: VARCHAR(255)
   - start_date: DATE
   - end_date: DATE
   - actual_progress: INTEGER DEFAULT 0
   - ai_risk_level: VARCHAR(20)
   - ai_validation: JSONB
   - created_at: TIMESTAMP DEFAULT NOW()
   - updated_at: TIMESTAMP DEFAULT NOW()

3. Tabla project_history:
   - id: UUID PRIMARY KEY
   - project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
   - title: VARCHAR(255) NOT NULL
   - description: TEXT
   - date: DATE NOT NULL
   - created_at: TIMESTAMP DEFAULT NOW()

4. Tabla documents (opcional):
   - id: UUID PRIMARY KEY
   - project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
   - name: VARCHAR(255) NOT NULL
   - type: VARCHAR(50)
   - url: TEXT
   - uploaded_at: TIMESTAMP DEFAULT NOW()

Incluye índices para:
- projects.code
- tasks.task_code
- tasks.project_id
- project_history.project_id

El script debe:
- Conectarse a Supabase
- Ejecutar cada migración en orden
- Manejar errores si la tabla ya existe
- Loggear progreso
```

### Prompt 2.3: Crear script de seeds

```
Crea src/database/seeds/run-seeds.js que inserte datos de prueba:

1. 5 proyectos de ejemplo con diferentes estados:
   - PROJ-001: Migración Cloud (Activo, 65% progreso)
   - PROJ-002: Implementación CRM (Activo, 40% progreso)
   - PROJ-003: Modernización Backend (Completado, 100%)
   - PROJ-004: Dashboard Analytics (En Pausa, 20%)
   - PROJ-005: Security Audit (Activo, 85%)

2. Para cada proyecto, 5-10 tareas con:
   - Diferentes etapas: Análisis, Diseño, Desarrollo, Testing, Deployment
   - Estados variados: Pendiente, En Progreso, Completado, Bloqueado
   - Milestones: M1, M2, M3
   - Responsables diferentes
   - Fechas realistas
   - Progreso variado

3. Historial de proyecto para cada proyecto (2-3 entradas)

Utiliza datos realistas de proyectos de tecnología.
Incluye cálculo automático de presupuestos y fechas coherentes.
```

---

## 3. Modelos de Datos

### Prompt 3.1: Crear modelo Project

```
Crea src/models/Project.js con una clase que encapsule operaciones CRUD para proyectos:

Métodos requeridos:
- static async findAll(filters = {}) // Buscar todos con filtros opcionales
- static async findById(id) // Buscar por ID
- static async findByCode(code) // Buscar por código
- static async create(projectData) // Crear proyecto
- static async update(id, projectData) // Actualizar proyecto
- static async delete(id) // Eliminar proyecto
- static async updateAIAnalysis(id, analysis) // Actualizar análisis IA
- static async getHistory(projectId) // Obtener historial
- static async addHistory(projectId, historyData) // Agregar entrada historial
- static async getDashboardStats(filters = {}) // Estadísticas dashboard

Validaciones:
- code debe ser único
- fechas: start_date debe ser anterior a end_date
- progress entre 0 y 100
- budget_consumed no puede exceder budget_total

Incluye:
- Manejo de errores con mensajes descriptivos
- Uso del cliente Supabase
- Sanitización de datos de entrada
- Logs para debugging
```

### Prompt 3.2: Crear modelo Task

```
Crea src/models/Task.js con operaciones CRUD para tareas:

Métodos:
- static async findByProject(projectId, filters = {})
- static async findByCode(taskCode)
- static async create(projectId, taskData)
- static async update(taskCode, taskData)
- static async delete(taskCode)
- static async updateRiskLevel(taskCode, riskLevel)
- static async getTaskStats(projectId)

Validaciones:
- task_code único
- project_id debe existir (foreign key)
- fechas coherentes
- progress 0-100

Cálculos automáticos:
- Detectar si tarea está bloqueada
- Calcular días restantes
- Identificar dependencias críticas
```

### Prompt 3.3: Crear modelo ProjectHistory

```
Crea src/models/ProjectHistory.js para gestionar historial de cambios:

Métodos:
- static async findByProject(projectId)
- static async create(projectId, historyData)
- static async delete(id)

Ordena por fecha descendente por defecto.
```

### Prompt 3.4: Crear index de modelos

```
Crea src/models/index.js que exporte todos los modelos:

```javascript
module.exports = {
  Project: require('./Project'),
  Task: require('./Task'),
  ProjectHistory: require('./ProjectHistory')
};
```
```

---

## 4. Servicio de IA Axet LLM

### Prompt 4.1: Crear servicio Axet LLM principal

```
Crea src/services/axetLLM.service.js implementando el servicio de IA con Axet LLM Enabler.

Requisitos:

1. Clase AxetLLMService con:
   - Constructor que configure:
     * Modo mock (AXET_MOCK_MODE) para desarrollo
     * Configuración Axet desde variables de entorno
     * Cache de token de acceso

2. Gestión de tokens:
   - Método _getAccessToken() que:
     * Llame al endpoint AXET_TOKEN_URL
     * Use AXET_TOKEN_AUTH como Bearer token
     * Envíe axetFlowId, environment, userOktaId
     * Cachee el token por 50 minutos
     * Maneje renovación automática

3. Método principal analyzeProject(projectData):
   - Si mockMode=true, retorna análisis mock realista
   - Si no, llama a Axet API con:
     * URL: ${AXET_BASE_URL}/api/llm-enabler/v2/openai/ntt/${projectId}/v1/responses
     * Headers: Authorization, Content-Type, axet-project-id, axet-user-id, axet-asset-id
     * Body: { model, input: [{ role: 'system', content }, { role: 'user', content }] }
   - Parsea respuesta JSON
   - Valida estructura
   - Retorna análisis estructurado

4. Prompting avanzado:
   - _getSystemPrompt(): Define rol de "Project Management Analyst AI" experto en ITIL, PMP, PRINCE2
   - _buildProjectAnalysisPrompt(projectData): Construye prompt con:
     * Resumen del proyecto
     * Métricas calculadas (schedule health, budget health, task stats)
     * Contexto de tareas (pendientes, bloqueadas, críticas)
     * Historial reciente
     * Solicitud de análisis estructurado en JSON

5. Output JSON esperado:
```json
{
  "status": "string",
  "healthScore": 0-100,
  "risks": [
    {
      "category": "Schedule|Budget|Resources|Quality|Scope",
      "severity": "Critical|High|Medium|Low",
      "description": "string",
      "impact": "string",
      "mitigation": "string"
    }
  ],
  "recommendations": [
    {
      "priority": "Critical|High|Medium|Low",
      "action": "string",
      "rationale": "string",
      "expectedImpact": "string"
    }
  ],
  "insights": ["string"],
  "predictedCompletionDate": "YYYY-MM-DD",
  "confidenceLevel": 0-100
}
```

6. Modo Mock:
   - Generar análisis basado en métricas del proyecto
   - Identificar riesgos según desviaciones
   - Calcular healthScore algorítmicamente
   - Simular latencia realista (500-1000ms)

7. Manejo de errores:
   - Try-catch con logs descriptivos
   - Retry logic para fallos de red
   - Fallback a modo mock en caso de error crítico
```

### Prompt 4.2: Método de análisis de riesgo de tareas

```
Agrega a src/services/axetLLM.service.js el método analyzeTaskRisk(taskData):

Debe:
1. Evaluar factores de riesgo:
   - Desviación de fechas
   - Progreso vs tiempo transcurrido
   - Estado (bloqueado = alto riesgo)
   - Dependencias
   - Responsable (carga de trabajo)

2. Calcular riskScore (0-100)

3. Retornar:
```json
{
  "riskLevel": "low|medium|high|critical",
  "riskScore": 0-100,
  "factors": ["factor1", "factor2"],
  "recommendations": ["recomendación1"]
}
```

4. En modo mock, usar lógica algorítmica basada en:
   - Días restantes vs progreso
   - Estado de la tarea
   - Dependencias bloqueadas
```

---

## 5. Controladores

### Prompt 5.1: Crear controlador de proyectos

```
Crea src/controllers/project.controller.js con los siguientes métodos:

1. getAllProjects(req, res):
   - Extraer query params para filtros
   - Llamar a Project.findAll(filters)
   - Retornar { success: true, data: projects, count: projects.length }

2. getProjectById(req, res):
   - Extraer :id de params
   - Llamar a Project.findById(id)
   - Si no existe, retornar 404
   - Retornar { success: true, data: project }

3. createProject(req, res):
   - Validar body con Joi
   - Llamar a Project.create(body)
   - Retornar 201 con proyecto creado

4. updateProject(req, res):
   - Validar :id y body
   - Verificar que proyecto existe
   - Llamar a Project.update(id, body)
   - Retornar proyecto actualizado

5. deleteProject(req, res):
   - Verificar que proyecto existe
   - Llamar a Project.delete(id)
   - Retornar 204

6. getProjectAIAnalysis(req, res):
   - Obtener proyecto completo con tareas e historial
   - Verificar si hay análisis en caché (ai_analysis y ai_last_analysis_date)
   - Si refresh=true en query o caché > 1 hora, llamar a AxetLLMService.analyzeProject()
   - Actualizar Project.updateAIAnalysis()
   - Retornar análisis con metadata

7. getDashboardStats(req, res):
   - Extraer filtros de query
   - Llamar a Project.getDashboardStats(filters)
   - Calcular métricas agregadas
   - Retornar estadísticas

8. getProjectHistory(req, res):
   - Obtener historial del proyecto
   - Retornar ordenado por fecha desc

9. addProjectHistory(req, res):
   - Validar body
   - Agregar entrada al historial
   - Retornar entrada creada

Incluir:
- Try-catch en cada método
- Logging con detalles
- Validación de entrada con Joi
- Respuestas consistentes { success, data/error, message }
- Status codes apropiados
```

### Prompt 5.2: Crear controlador de tareas

```
Crea src/controllers/task.controller.js con métodos:

1. getTasksByProject(req, res):
   - Extraer projectId de params
   - Extraer filtros de query (taskCode, stage, status, milestone, responsible, riskLevel)
   - Llamar a Task.findByProject(projectId, filters)
   - Retornar tareas

2. getTaskByCode(req, res):
   - Extraer taskCode
   - Llamar a Task.findByCode(taskCode)
   - Si no existe, 404
   - Retornar tarea

3. createTask(req, res):
   - Validar projectId y body
   - Crear tarea con Task.create()
   - Analizar riesgo con AxetLLMService.analyzeTaskRisk()
   - Actualizar tarea con riesgo
   - Retornar 201

4. updateTask(req, res):
   - Validar taskCode y body
   - Actualizar con Task.update()
   - Re-analizar riesgo
   - Retornar tarea actualizada

5. deleteTask(req, res):
   - Verificar existencia
   - Eliminar con Task.delete()
   - Retornar 204

6. getTaskRiskAnalysis(req, res):
   - Obtener tarea completa
   - Llamar a AxetLLMService.analyzeTaskRisk()
   - Retornar análisis de riesgo

Incluir validaciones Joi y manejo de errores.
```

---

## 6. Servicios de Negocio

### Prompt 6.1: Crear servicio de proyectos

```
Crea src/services/project.service.js con lógica de negocio avanzada:

1. calculateProjectMetrics(project, tasks):
   - Schedule Health:
     * Calcular días totales, días transcurridos, días restantes
     * Calcular progreso esperado vs actual
     * Detectar desviación de cronograma
   - Budget Health:
     * Calcular burn rate
     * Proyectar costo final
     * Detectar sobrecosto potencial
   - Task Health:
     * Contar tareas por estado
     * Calcular tasa de completitud
     * Identificar tareas críticas/bloqueadas
   - Retornar objeto con todas las métricas

2. determineRiskLevel(metrics):
   - Evaluar múltiples factores:
     * Desviación de cronograma > 10% = riesgo alto
     * Sobrecosto proyectado > 15% = riesgo alto
     * Tareas bloqueadas > 3 = riesgo medio
     * Health score < 60 = riesgo alto
   - Retornar: 'low' | 'medium' | 'high' | 'critical'

3. calculateHealthScore(metrics):
   - Fórmula ponderada:
     * Schedule health: 30%
     * Budget health: 30%
     * Task completion: 25%
     * Risk factors: 15%
   - Retornar score 0-100

4. formatProjectForAnalysis(project, tasks, history):
   - Estructurar datos para IA
   - Incluir todas las métricas calculadas
   - Preparar contexto completo

5. validateAnalysisResponse(response):
   - Verificar estructura JSON
   - Validar campos requeridos
   - Sanitizar datos
   - Retornar booleano y errores

Exportar todas las funciones.
```

---

## 7. Rutas y Middlewares

### Prompt 7.1: Crear rutas de proyectos

```
Crea src/routes/project.routes.js con Express Router:

Rutas:
- GET /api/projects -> getAllProjects
- GET /api/projects/dashboard/stats -> getDashboardStats
- GET /api/projects/:id -> getProjectById
- POST /api/projects -> createProject
- PUT /api/projects/:id -> updateProject
- DELETE /api/projects/:id -> deleteProject
- GET /api/projects/:id/ai-analysis -> getProjectAIAnalysis
- GET /api/projects/:id/history -> getProjectHistory
- POST /api/projects/:id/history -> addProjectHistory

Incluir:
- Importar controladores
- Middlewares de validación Joi
- Comentarios Swagger/JSDoc para cada ruta
```

### Prompt 7.2: Crear rutas de tareas

```
Crea src/routes/task.routes.js:

Rutas:
- GET /api/tasks/project/:projectId -> getTasksByProject
- GET /api/tasks/:taskCode -> getTaskByCode
- POST /api/tasks/project/:projectId -> createTask
- PUT /api/tasks/:taskCode -> updateTask
- DELETE /api/tasks/:taskCode -> deleteTask
- GET /api/tasks/:taskCode/ai-risk-analysis -> getTaskRiskAnalysis

Incluir validaciones y documentación Swagger.
```

### Prompt 7.3: Crear middleware de manejo de errores

```
Crea src/middlewares/errorHandler.js:

Middleware que capture errores y retorne respuestas consistentes:

```javascript
function errorHandler(err, req, res, next) {
  console.error(err);
  
  // Error de validación Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.details
    });
  }
  
  // Error de base de datos
  if (err.code) {
    return res.status(500).json({
      success: false,
      error: 'Database Error',
      message: err.message
    });
  }
  
  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}
```
```

### Prompt 7.4: Crear middleware de validación

```
Crea src/middlewares/validation.js con funciones de validación Joi:

Schemas:
1. projectSchema - Validar creación/actualización de proyecto
2. taskSchema - Validar creación/actualización de tarea
3. historySchema - Validar entrada de historial
4. queryFiltersSchema - Validar query params

Exportar funciones validate(schema) que retornen middleware Express.
```

---

## 8. Servidor Principal

### Prompt 8.1: Crear servidor Express

```
Crea src/server.js como punto de entrada principal:

Debe:
1. Importar dependencias:
   - express
   - helmet, cors, compression, morgan
   - dotenv
   - Rutas: project.routes, task.routes
   - Config: supabase
   - Middlewares: errorHandler
   - swagger setup

2. Configurar Express:
   - helmet() para seguridad
   - cors({ origin: '*' }) o específico
   - compression() para gzip
   - express.json() y express.urlencoded()
   - morgan('dev') para logs HTTP

3. Registrar rutas:
   - /api/projects -> projectRoutes
   - /api/tasks -> taskRoutes
   - /api-docs -> swagger UI
   - /health -> health check endpoint

4. Health check endpoint:
```javascript
app.get('/health', async (req, res) => {
  try {
    // Test DB connection
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: error ? 'ERROR' : 'OK',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message
    });
  }
});
```

5. Middleware de error al final

6. Iniciar servidor:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
```

7. Exportar app para testing
```

---

## 9. Documentación Swagger

### Prompt 9.1: Configurar Swagger

```
Crea src/config/swagger.js con configuración Swagger/OpenAPI:

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'sAPI IA Projects - API Documentation',
      version: '1.0.0',
      description: 'API REST para gestión inteligente de proyectos con análisis mediante IA usando Axet LLM Enabler de NTT DATA',
      contact: {
        name: 'GitHub Team',
        email: 'support@example.com'
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
        url: 'https://your-production-url.vercel.app',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Project: {
          type: 'object',
          required: ['code', 'name', 'status'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string', example: 'PROJ-001' },
            name: { type: 'string', example: 'Migración Cloud' },
            description: { type: 'string' },
            status: { type: 'string', example: 'Activo' },
            leader: { type: 'string', example: 'Juan Pérez' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            actual_progress: { type: 'integer', minimum: 0, maximum: 100 },
            planned_progress: { type: 'integer' },
            budget_total: { type: 'number', format: 'decimal' },
            budget_consumed: { type: 'number', format: 'decimal' },
            ai_risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
          }
        },
        Task: {
          type: 'object',
          required: ['task_code', 'name', 'project_id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            project_id: { type: 'string', format: 'uuid' },
            task_code: { type: 'string', example: 'TASK-001' },
            name: { type: 'string' },
            description: { type: 'string' },
            stage: { type: 'string' },
            status: { type: 'string' },
            milestone: { type: 'string' },
            responsible: { type: 'string' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            actual_progress: { type: 'integer' }
          }
        },
        AIAnalysis: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            healthScore: { type: 'integer', minimum: 0, maximum: 100 },
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  severity: { type: 'string' },
                  description: { type: 'string' },
                  impact: { type: 'string' },
                  mitigation: { type: 'string' }
                }
              }
            },
            recommendations: { type: 'array', items: { type: 'object' } },
            insights: { type: 'array', items: { type: 'string' } },
            predictedCompletionDate: { type: 'string', format: 'date' },
            confidenceLevel: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path a archivos con anotaciones JSDoc
};

const specs = swaggerJsdoc(options);

module.exports = specs;
```
```

### Prompt 9.2: Agregar documentación JSDoc a rutas

```
Agrega comentarios JSDoc a src/routes/project.routes.js para documentar cada endpoint en Swagger:

Ejemplo para GET /api/projects:

```javascript
/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener todos los proyectos
 *     description: Retorna lista de proyectos con filtros opcionales
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filtrar por código de proyecto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filtrar por nivel de riesgo
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 count:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', projectController.getAllProjects);
```

Aplica esto a TODAS las rutas de proyectos y tareas.
```

---

## 10. Scripts Utilitarios

### Prompt 10.1: Script de test de conexión

```
Crea test-connection.js en la raíz que:

1. Cargue dotenv
2. Importe cliente Supabase
3. Intente conectarse y hacer query simple
4. Imprima resultado con colores (green=success, red=error)
5. Salga con código 0 o 1

Útil para verificar configuración antes de iniciar servidor.
```

### Prompt 10.2: Script para seed de Supabase

```
Crea seed-data-supabase.js que:

1. Conecte a Supabase
2. Limpie datos existentes (DELETE con confirmación)
3. Inserte proyectos de ejemplo
4. Inserte tareas para cada proyecto
5. Inserte historial
6. Imprima estadísticas de inserción

Debe ser idempotente (puede ejecutarse múltiples veces).
```

---

## 11. Dockerización

### Prompt 11.1: Crear Dockerfile

```
Crea Dockerfile optimizado para Node.js 20.x:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/server.js"]
```

Incluye:
- Multi-stage build para optimizar tamaño
- Usuario no root
- Health check
- Variables de entorno configurables
```

### Prompt 11.2: Crear docker-compose.yml

```
Crea docker-compose.yml para desarrollo local con PostgreSQL:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: projects-db
    environment:
      POSTGRES_DB: projects_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: projects-api
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NODE_ENV: development
      DATABASE_URL: postgres://admin:admin123@postgres:5432/projects_db
      AXET_MOCK_MODE: true
    volumes:
      - ./src:/app/src
      - ./node_modules:/app/node_modules

volumes:
  postgres_data:
```

Útil para desarrollo sin Supabase.
```

---

## 12. Deployment

### Prompt 12.1: Configurar Vercel

```
Crea vercel.json para deployment serverless:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

Crea api/index.js:

```javascript
const app = require('../src/server');

module.exports = app;
```

Esto permite que Vercel sirva la API como serverless function.
```

### Prompt 12.2: Configurar GitHub Actions CI/CD

```
Crea .github/workflows/ci-cd.yml:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        AXET_MOCK_MODE: true
    
    - name: Check code coverage
      run: npm run test -- --coverage
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```
```

### Prompt 12.3: Crear README de deployment

```
Crea VERCEL-DEPLOYMENT.md con guía paso a paso para:

1. Crear cuenta Vercel
2. Conectar repositorio GitHub
3. Configurar variables de entorno en Vercel Dashboard
4. Deploy manual vs automático
5. Monitoreo de logs
6. Rollback en caso de errores
7. Custom domain setup

Incluye screenshots o descripciones detalladas.
```

---

## 📋 Resumen de Secuencia de Ejecución

### Orden recomendado para usar los prompts:

1. **Inicialización** (Prompts 1.1 - 1.3)
   - Crear proyecto Node.js
   - Estructura de carpetas
   - Configurar .env

2. **Base de Datos** (Prompts 2.1 - 2.3)
   - Configurar Supabase
   - Crear migraciones
   - Crear seeds

3. **Modelos** (Prompts 3.1 - 3.4)
   - Implementar modelos de datos
   - CRUD operations

4. **Servicio IA** (Prompts 4.1 - 4.2)
   - Implementar Axet LLM service
   - Prompting avanzado
   - Análisis de proyectos y tareas

5. **Controladores** (Prompts 5.1 - 5.2)
   - Lógica de endpoints
   - Validaciones

6. **Servicios** (Prompt 6.1)
   - Lógica de negocio
   - Cálculo de métricas

7. **Rutas** (Prompts 7.1 - 7.4)
   - Definir endpoints
   - Middlewares

8. **Servidor** (Prompt 8.1)
   - Configurar Express
   - Integrar todo

9. **Documentación** (Prompts 9.1 - 9.2)
   - Swagger/OpenAPI
   - JSDoc

10. **Scripts** (Prompts 10.1 - 10.2)
    - Utilidades
    - Testing

11. **Docker** (Prompts 11.1 - 11.2)
    - Containerización
    - Desarrollo local

12. **Deployment** (Prompts 12.1 - 12.3)
    - Vercel
    - CI/CD
    - Documentación

---

## 🎯 Tips para Mejores Resultados

### Al usar estos prompts con GitHub Copilot:

1. **Contexto**: Asegúrate de que Copilot tenga visibilidad de archivos relacionados
2. **Iterativo**: Revisa y ajusta cada generación antes de pasar al siguiente prompt
3. **Validación**: Prueba cada componente antes de continuar
4. **Personalización**: Adapta los prompts a tus necesidades específicas
5. **Documentación**: Mantén comentarios descriptivos en el código generado

### Verificaciones entre fases:

- **Después de DB**: Ejecutar migraciones y seeds exitosamente
- **Después de Modelos**: Test unitarios de CRUD
- **Después de IA**: Validar respuestas en modo mock
- **Después de Endpoints**: Test con Postman/Thunder Client
- **Antes de Deploy**: Health checks y tests de integración

---

## 📚 Recursos Adicionales

- [Documentación Axet LLM Enabler](https://axet-docs.nttdata.com)
- [Supabase Docs](https://supabase.com/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OpenAI Prompting Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Vercel Deployment](https://vercel.com/docs)

---

## 🤝 Mantenimiento y Evolución

### Próximas funcionalidades sugeridas:

1. **Autenticación y Autorización**
   ```
   Implementa autenticación JWT con roles (Admin, PM, Developer) y autorización basada en roles para endpoints sensibles.
   ```

2. **WebSockets para Updates en Tiempo Real**
   ```
   Agrega Socket.io para notificaciones en tiempo real cuando se actualiza el estado de proyectos o se completan análisis IA.
   ```

3. **Export de Reportes**
   ```
   Implementa generación de reportes PDF/Excel con análisis IA usando librerías como pdfkit o exceljs.
   ```

4. **Cache con Redis**
   ```
   Agrega caching de análisis IA con Redis para mejorar performance y reducir llamadas a Axet API.
   ```

5. **Rate Limiting**
   ```
   Implementa rate limiting con express-rate-limit para proteger la API de abuso.
   ```

6. **Tests Automatizados**
   ```
   Crea suite completa de tests con Jest y Supertest cubriendo:
   - Unit tests para modelos y servicios
   - Integration tests para endpoints
   - E2E tests para flujos completos
   ```

7. **Monitoring y Observability**
   ```
   Integra herramientas de monitoring:
   - Application Insights (Azure)
   - Datadog
   - New Relic
   - Prometheus + Grafana
   ```

---

**Desarrollado para Hackathon NTT DATA 2025**  
**GitHub Team - sAPI IA Projects**

---

## 📄 Licencia

Este documento y los prompts están bajo licencia MIT. Libre para usar, modificar y distribuir.
