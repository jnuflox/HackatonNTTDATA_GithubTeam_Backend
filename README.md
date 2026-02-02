# sAPI IA Projects - Backend Hackathon NTT DATA

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-4.18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-orange)
![AI](https://img.shields.io/badge/AI-Axet%20LLM-purple)

API REST Node.js para gestión inteligente de proyectos con análisis mediante IA usando **Axet Conector LLM** de NTT DATA y base de datos PostgreSQL en Supabase.

## 🚀 Características Principales

### 🤖 Análisis IA Avanzado

- **Análisis Predictivo de Proyectos**: Evaluación automática de salud, riesgos y recomendaciones
- **Prompting Avanzado**: Implementa Chain-of-Thought, Few-Shot Learning y Role-Based Prompting
- **Detección de Riesgos**: Identificación automática de riesgos en Schedule, Budget, Resources, Quality y Scope
- **Predicciones Inteligentes**: Estimación de fechas de completitud y probabilidad de sobrecostos

### 📊 Gestión de Proyectos

- CRUD completo de proyectos y tareas
- Dashboard con estadísticas en tiempo real
- Historial de cambios por proyecto
- Filtros avanzados y búsqueda
- Métricas automáticas de progreso y desviaciones

### 🛡️ Seguridad y Performance

- Helmet para seguridad HTTP
- CORS configurado
- Compresión de respuestas
- Rate limiting
- Validación con Joi
- Logging estructurado con Morgan

### 📖 Documentación API

- Swagger/OpenAPI integrado
- Endpoint interactivo: `/api-docs`
- Schemas detallados de request/response

## 📁 Estructura del Proyecto

```
HackatonNTTDATA_GithubTeam_Backend/
├── api/
│   └── index.js                    # Serverless function para Vercel
├── src/
│   ├── server.js                   # Punto de entrada
│   ├── config/
│   │   ├── database.js            # Config PostgreSQL/Supabase
│   │   ├── sequelize.js           # ORM Sequelize (opcional)
│   │   ├── supabase.js            # Cliente Supabase
│   │   └── swagger.js             # Config Swagger/OpenAPI
│   ├── controllers/
│   │   ├── project.controller.js  # Controlador proyectos
│   │   └── task.controller.js     # Controlador tareas
│   ├── services/
│   │   ├── axetLLM.service.js     # Servicio IA Axet LLM
│   │   └── project.service.js     # Lógica negocio proyectos
│   ├── models/
│   │   ├── Project.js             # Modelo Proyecto
│   │   ├── Task.js                # Modelo Tarea
│   │   ├── ProjectHistory.js      # Modelo Historial
│   │   └── Document.js            # Modelo Documentos
│   ├── routes/
│   │   ├── project.routes.js      # Rutas proyectos
│   │   └── task.routes.js         # Rutas tareas
│   └── database/
│       ├── migrations/            # Migraciones DB
│       └── seeds/                 # Datos semilla
├── Dockerfile                      # Container Docker
├── vercel.json                     # Config Vercel
├── package.json
├── PROMPTS_DOCUMENTATION.md        # Documentación prompts IA
└── README.md
```

## 🛠️ Tecnologías

### Backend

- **Node.js 20.x**: Entorno de ejecución
- **Express 4.18**: Framework web
- **Sequelize**: ORM para PostgreSQL (opcional)
- **Supabase**: Base de datos PostgreSQL gestionada

### Inteligencia Artificial

- **Axet LLM Enabler**: Servicio NTT DATA para modelos GPT
- **Azure OpenAI GPT-5.1**: Modelo de análisis
- **Advanced Prompting**: Chain-of-Thought, Few-Shot, Role-Based

### Seguridad y Middlewares

- **Helmet**: Seguridad HTTP headers
- **CORS**: Cross-Origin Resource Sharing
- **Compression**: Compresión gzip
- **Morgan**: Logging HTTP
- **Joi**: Validación de datos

### Documentación

- **Swagger UI**: Interfaz interactiva
- **swagger-jsdoc**: Generación automática docs

### Testing (Configurado)

- **Jest**: Framework testing
- **Supertest**: Testing HTTP

## 🚦 Inicio Rápido

### Prerrequisitos

- Node.js 20.x o superior
- PostgreSQL 14+ o cuenta Supabase
- Acceso a Axet LLM Enabler (NTT DATA)

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/jnuflox/HackatonNTTDATA_GithubTeam_Backend.git
cd HackatonNTTDATA_GithubTeam_Backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase Database
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_KEY=tu-supabase-service-role-key

# Axet LLM Enabler Configuration
AXET_MOCK_MODE=false
AXET_BASE_URL=https://axet-pre.nttdata.com
AXET_PROJECT_ID=tu-project-id
AXET_USER_ID=tu-user-id
AXET_ASSET_ID=tu-asset-id
AXET_MODEL=gpt-5.1

# Axet Token Management
AXET_TOKEN_URL=https://talkg.activos-coe.deptapps.everis.cloud/g
AXET_TOKEN_AUTH=Bearer_token_aqui
AXET_FLOW_ID=tu-flow-id
AXET_ENVIRONMENT=DEV
AXET_USER_OKTA_ID=tu-okta-id
```

4. **Ejecutar migraciones y seeds**

```bash
npm run db:migrate
npm run db:seed
```

5. **Iniciar servidor**

```bash
# Desarrollo con hot-reload
npm run dev

# Producción
npm start
```

6. **Acceder a la API**

- API: http://localhost:3000
- Documentación: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## 📚 Endpoints API

### Projects

#### `GET /api/projects`

Obtener todos los proyectos con filtros opcionales.

**Query Parameters:**

- `code` - Filtrar por código de proyecto
- `status` - Filtrar por estado (Activo, Completado, etc.)
- `startDate` - Filtrar por fecha inicio
- `endDate` - Filtrar por fecha fin
- `riskLevel` - Filtrar por nivel de riesgo (low, medium, high, critical)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "PROJ-001",
      "name": "Migración Cloud",
      "status": "Activo",
      "leader": "Juan Pérez",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "actual_progress": 65,
      "planned_progress": 60,
      "budget_total": 500000,
      "budget_consumed": 300000,
      "ai_risk_level": "medium"
    }
  ],
  "count": 1
}
```

#### `GET /api/projects/:id`

Obtener proyecto por ID con todos sus detalles.

#### `POST /api/projects`

Crear nuevo proyecto.

**Request Body:**

```json
{
  "code": "PROJ-002",
  "name": "Implementación CRM",
  "description": "Descripción del proyecto",
  "status": "Activo",
  "leader": "María González",
  "start_date": "2024-02-01",
  "end_date": "2024-08-31",
  "budget_total": 300000,
  "actual_progress": 0
}
```

#### `PUT /api/projects/:id`

Actualizar proyecto existente.

#### `DELETE /api/projects/:id`

Eliminar proyecto.

#### `GET /api/projects/:id/ai-analysis`

Obtener análisis IA del proyecto.

**Query Parameters:**

- `refresh=true` - Forzar nuevo análisis (ignora caché)

**Response:**

```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "code": "PROJ-001",
      "name": "Migración Cloud",
      "status": "Activo"
    },
    "analysis": {
      "status": "Proyecto en buen estado general con algunos puntos de atención",
      "healthScore": 75,
      "risks": [
        {
          "category": "Schedule",
          "severity": "Medium",
          "description": "Desviación de 5% en cronograma",
          "impact": "Posible retraso en entregables",
          "mitigation": "Revisar recursos críticos"
        }
      ],
      "recommendations": [
        {
          "priority": "High",
          "action": "Desbloquear tareas críticas",
          "rationale": "3 tareas bloqueadas afectan ruta crítica",
          "expectedImpact": "Recuperar 2 semanas en cronograma"
        }
      ],
      "insights": [
        "Tasa de completitud: 65%",
        "Proyecto adelantado 5% respecto al plan"
      ],
      "predictedCompletionDate": "2024-11-15",
      "confidenceLevel": 85
    },
    "lastAnalysisDate": "2024-02-02T10:30:00Z",
    "riskLevel": "medium"
  }
}
```

#### `GET /api/projects/dashboard/stats`

Obtener estadísticas del dashboard.

**Query Parameters:**

- `status` - Filtrar por estado
- `period` - Período (week, month, quarter, year)
- `risk` - Filtrar por nivel de riesgo

**Response:**

```json
{
  "success": true,
  "data": {
    "totalProjects": 15,
    "activeProjects": 10,
    "completedProjects": 5,
    "projectsByStatus": {
      "Activo": 10,
      "Completado": 5
    },
    "projectsByRisk": {
      "low": 3,
      "medium": 7,
      "high": 4,
      "critical": 1
    },
    "averageProgress": 62.5,
    "totalBudget": 5000000,
    "budgetConsumed": 3200000,
    "tasksStats": {
      "total": 450,
      "completed": 280,
      "inProgress": 120,
      "blocked": 15
    }
  }
}
```

#### `GET /api/projects/:id/history`

Obtener historial de cambios del proyecto.

#### `POST /api/projects/:id/history`

Agregar entrada al historial.

**Request Body:**

```json
{
  "title": "Actualización de alcance",
  "description": "Se agregaron 3 módulos adicionales",
  "date": "2024-02-01"
}
```

### Tasks

#### `GET /api/tasks/project/:projectId`

Obtener tareas de un proyecto.

**Query Parameters:**

- `taskCode` - Filtrar por código de tarea
- `stage` - Filtrar por etapa
- `status` - Filtrar por estado
- `milestone` - Filtrar por hito
- `responsible` - Filtrar por responsable
- `riskLevel` - Filtrar por nivel de riesgo

#### `GET /api/tasks/:taskCode`

Obtener tarea por código.

#### `POST /api/tasks/project/:projectId`

Crear nueva tarea (incluye análisis de riesgo automático).

**Request Body:**

```json
{
  "task_code": "TASK-001",
  "name": "Diseño arquitectura",
  "description": "Diseñar arquitectura de microservicios",
  "stage": "Diseño",
  "status": "En Progreso",
  "milestone": "M1",
  "responsible": "Ana Martínez",
  "start_date": "2024-02-01",
  "end_date": "2024-02-15",
  "actual_progress": 40
}
```

#### `PUT /api/tasks/:taskCode`

Actualizar tarea (re-analiza riesgo automáticamente).

#### `DELETE /api/tasks/:taskCode`

Eliminar tarea.

#### `GET /api/tasks/:taskCode/ai-risk-analysis`

Obtener análisis de riesgo IA de la tarea.

**Response:**

```json
{
  "success": true,
  "data": {
    "task": {
      "task_code": "TASK-001",
      "name": "Diseño arquitectura"
    },
    "riskAnalysis": {
      "riskLevel": "medium",
      "riskScore": 55,
      "factors": [
        "Tarea en progreso con 40% completitud",
        "Dependencias identificadas: 3 tareas",
        "Tiempo restante: 5 días"
      ]
    }
  }
}
```

## 🤖 Sistema de Análisis IA

### Arquitectura del Servicio IA

El sistema utiliza **Axet LLM Enabler** de NTT DATA para conectar con modelos GPT de Azure OpenAI, implementando técnicas avanzadas de prompting.

### Técnicas de Prompting Implementadas

1. **Chain-of-Thought (CoT) Reasoning**

   - El modelo analiza paso a paso antes de concluir
   - Mejora precisión y reduce respuestas impulsivas
2. **Few-Shot Learning**

   - Proporciona ejemplos concretos del análisis esperado
   - Establece estándares de calidad y formato
3. **Role-Based Prompting**

   - Define rol de "Project Management Analyst AI"
   - Especializado en ITIL, PMP, PRINCE2
4. **Structured Output**

   - Respuesta en formato JSON estructurado
   - Facilita parsing y validación automática
5. **Contextual Data Injection**

   - Inyecta datos específicos del proyecto
   - Métricas calculadas y organizadas

### Proceso de Análisis

```mermaid
graph LR
    A[Cliente] --> B[API Endpoint]
    B --> C[Project Service]
    C --> D[Axet LLM Service]
    D --> E[Get Access Token]
    E --> F[Build Prompt]
    F --> G[Call Axet API]
    G --> H[Azure OpenAI GPT-5.1]
    H --> I[Parse Response]
    I --> J[Validate JSON]
    J --> K[Cache Result]
    K --> L[Return Analysis]
```

### Métricas Analizadas

- **Schedule Health**: Desviaciones, adherencia a cronograma
- **Budget Health**: Burn rate, proyección de sobrecostos
- **Task Health**: Tasa de completitud, tareas bloqueadas
- **Resource Health**: Cuellos de botella, dependencias
- **Overall Health**: Score 0-100

### Modo Mock

Para desarrollo sin acceso a Axet:

```env
AXET_MOCK_MODE=true
```

Genera análisis realistas basados en métricas del proyecto.

## 🗄️ Base de Datos

### Modelo de Datos

#### Tabla: `projects`

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  leader VARCHAR(255),
  start_date DATE,
  end_date DATE,
  actual_progress INTEGER DEFAULT 0,
  planned_progress INTEGER,
  budget_total NUMERIC(15,2),
  budget_consumed NUMERIC(15,2),
  ai_analysis JSONB,
  ai_last_analysis_date TIMESTAMP,
  ai_risk_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `tasks`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  task_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stage VARCHAR(100),
  status VARCHAR(50),
  milestone VARCHAR(100),
  responsible VARCHAR(255),
  start_date DATE,
  end_date DATE,
  actual_progress INTEGER DEFAULT 0,
  ai_risk_level VARCHAR(20),
  ai_validation JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: `project_history`

```sql
CREATE TABLE project_history (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐳 Docker

### Build

```bash
docker build -t api-ia-projects .
```

### Run

```bash
docker run -p 3000:3000 --env-file .env api-ia-projects
```

## ☁️ Despliegue

### Vercel (Serverless)

1. **Instalar Vercel CLI**

```bash
npm i -g vercel
```

2. **Deploy**

```bash
vercel
```

3. **Configurar variables de entorno en Vercel Dashboard**

### Otras Plataformas

- **Heroku**: Incluye Procfile
- **AWS EC2/ECS**: Usa Dockerfile
- **Azure App Service**: Compatible con Node.js 20.x
- **Railway**: Auto-deploy desde GitHub

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Con coverage
npm test -- --coverage
```

## 📄 Documentación Adicional

- [PROMPTS_DOCUMENTATION.md](./PROMPTS_DOCUMENTATION.md) - Documentación detallada de prompts IA
- [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) - Guía de despliegue en Vercel

## 🔧 Scripts NPM

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "db:migrate": "node src/database/migrations/run-migrations.js",
  "db:seed": "node src/database/seeds/run-seeds.js",
  "test": "jest --coverage"
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE)

## 👥 Equipo

**GitHub Team - Hackathon NTT DATA 2024**

## 🙏 Agradecimientos

- NTT DATA por Axet LLM Enabler
- Supabase por PostgreSQL hosting
- OpenAI/Azure por modelos GPT

## 📞 Soporte

Para preguntas o issues, abrir un ticket en GitHub Issues.

---

**Desarrollado con ❤️ para Hackathon NTT DATA 2024**
