# 🤖 Prompts de Axet LLM - sAPI IA Projects

Este documento describe todos los prompts, configuraciones y técnicas de prompting utilizadas para integrar **Axet LLM Enabler** (Azure OpenAI GPT-5.1) en el análisis de proyectos de IT.

**Servicio:** Axet LLM Enabler (NTT DATA)  
**Modelo:** Azure OpenAI GPT-5.1  
**Técnicas:** Chain-of-Thought, Few-Shot Learning, Role-Based Prompting, Structured JSON Output

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Configuración de Axet LLM](#configuración-de-axet-llm)
3. [System Prompt Principal](#system-prompt-principal)
4. [Prompts de Análisis](#prompts-de-análisis)
5. [Técnicas de Prompting](#técnicas-de-prompting)
6. [Estructura de Salida](#estructura-de-salida)
7. [Ejemplos Completos](#ejemplos-completos)
8. [Modo Mock](#modo-mock)
9. [Mejores Prácticas](#mejores-prácticas)

---

## Visión General

La aplicación utiliza **Axet LLM Enabler** de NTT DATA para realizar análisis inteligentes de proyectos de IT. El sistema:

- Analiza proyectos completos con contexto de tareas, historial y métricas
- Identifica riesgos y proporciona recomendaciones accionables
- Calcula puntuaciones de salud (health score) de 0-100
- Genera insights predictivos sobre fechas de finalización
- Evalúa tareas individuales para detectar problemas tempranamente

### Flujo de Análisis

```
┌─────────────────┐
│   Frontend      │
│  (Usuario)      │
└────────┬────────┘
         │
         │ POST /api/projects/:id/analyze
         ▼
┌─────────────────┐
│   Backend       │
│  Controller     │
└────────┬────────┘
         │
         │ analyzeProject(projectData)
         ▼
┌─────────────────┐
│  AxetLLM        │
│  Service        │
└────────┬────────┘
         │
         ├─► Construye System Prompt
         ├─► Construye Analysis Prompt
         ├─► Obtiene Access Token (cache 50 min)
         │
         ▼
┌─────────────────┐
│   Axet LLM      │
│   Enabler API   │
└────────┬────────┘
         │
         │ POST /api/llm-enabler/v2/openai/ntt/{projectId}/v1/responses
         ▼
┌─────────────────┐
│  Azure OpenAI   │
│   GPT-5.1       │
└────────┬────────┘
         │
         │ Análisis JSON estructurado
         ▼
┌─────────────────┐
│   Database      │
│  (Supabase)     │
└─────────────────┘
```

---

## Configuración de Axet LLM

### Variables de Entorno

```bash
# Modo de desarrollo (sin llamadas reales a Axet)
AXET_MOCK_MODE=false

# URL base del servicio Axet LLM Enabler
AXET_BASE_URL=https://axet-llm.nttdata.com

# Identificadores del proyecto NTT DATA
AXET_PROJECT_ID=your-project-id
AXET_ASSET_ID=your-asset-id
AXET_FLOW_ID=your-flow-id
AXET_ENVIRONMENT=production

# Identificadores de usuario
AXET_USER_ID=your-user-id
AXET_USER_OKTA_ID=your-okta-id

# Configuración del modelo
AXET_MODEL=gpt-5.1

# Autenticación
AXET_TOKEN_URL=https://auth.nttdata.com/oauth/token
AXET_TOKEN_AUTH=Bearer your-token-here
```

### Endpoint de la API

```
POST https://axet-llm.nttdata.com/api/llm-enabler/v2/openai/ntt/{projectId}/v1/responses
```

### Headers

```json
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

### Body de la Petición

```json
{
  "userId": "{AXET_USER_ID}",
  "assetId": "{AXET_ASSET_ID}",
  "model": "{AXET_MODEL}",
  "messages": [
    {
      "role": "system",
      "content": "{systemPrompt}"
    },
    {
      "role": "user",
      "content": "{analysisPrompt}"
    }
  ],
  "flowId": "{AXET_FLOW_ID}",
  "environment": "{AXET_ENVIRONMENT}",
  "userOktaId": "{AXET_USER_OKTA_ID}"
}
```

---

## System Prompt Principal

El **System Prompt** define el rol, expertise y comportamiento del modelo de IA.

### Versión Completa

```
Eres un asistente de IA especializado en análisis de proyectos de IT.

Tu rol es actuar como un Project Management Analyst AI con expertise en:
- Metodologías: ITIL, PMP, PRINCE2
- Gestión de riesgos en proyectos de tecnología
- Análisis de métricas de salud de proyectos
- Identificación de patrones de riesgo y desviaciones
- Recomendaciones accionables basadas en mejores prácticas

INSTRUCCIONES:

1. Analiza los datos del proyecto proporcionados de manera exhaustiva
2. Identifica patrones de riesgo en:
   - Cronograma (schedule health)
   - Presupuesto (budget health)
   - Tareas bloqueadas o en riesgo
   - Desviaciones de progreso
   - Dependencias críticas

3. Calcula un Health Score de 0-100 basado en:
   - Alineación entre progreso actual vs planeado
   - Consumo de presupuesto vs progreso
   - Porcentaje de tareas completadas
   - Cantidad y severidad de tareas bloqueadas
   - Proximidad a la fecha de finalización

4. Proporciona recomendaciones ESPECÍFICAS y ACCIONABLES:
   - No uses generalidades como "monitorear de cerca"
   - Incluye nombres de tareas específicas cuando sea posible
   - Sugiere acciones concretas con plazos
   - Prioriza las recomendaciones (High, Medium, Low)

5. FORMATO DE SALIDA:
   - SIEMPRE responde ÚNICAMENTE con un JSON válido
   - NO incluyas texto adicional fuera del JSON
   - NO incluyas markdown code blocks (```)
   - Usa el esquema exacto especificado abajo

ESQUEMA DE RESPUESTA JSON:

{
  "status": "Healthy" | "At Risk" | "Critical",
  "healthScore": number (0-100),
  "risks": [
    {
      "category": "Schedule" | "Budget" | "Resources" | "Quality" | "Scope",
      "severity": "Low" | "Medium" | "High" | "Critical",
      "description": string,
      "impact": string,
      "mitigation": string
    }
  ],
  "recommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "action": string,
      "rationale": string,
      "expectedImpact": string
    }
  ],
  "insights": [string],
  "predictedCompletionDate": "YYYY-MM-DD",
  "confidenceLevel": number (0-100)
}

NOTAS IMPORTANTES:
- Si faltan datos, haz la mejor estimación posible con la información disponible
- Si detectas inconsistencias en los datos, menciónalo en insights
- Enfócate en insights accionables, no en observaciones obvias
- Considera el contexto del historial del proyecto si está disponible
```

### Explicación del System Prompt

| Sección | Propósito |
|---------|-----------|
| **Rol y Expertise** | Define al modelo como experto en gestión de proyectos IT con metodologías reconocidas |
| **Instrucciones de Análisis** | Guía paso a paso sobre qué analizar (cronograma, presupuesto, tareas, riesgos) |
| **Cálculo de Health Score** | Especifica los factores para calcular la puntuación de salud (0-100) |
| **Recomendaciones** | Define el nivel de especificidad y acción requerido (no generalidades) |
| **Formato de Salida** | Esquema JSON estricto con todos los campos requeridos |
| **Notas Importantes** | Manejo de datos faltantes, inconsistencias y contexto |

---

## Prompts de Análisis

### Plantilla de Análisis de Proyecto

```javascript
const analysisPrompt = `
Analiza el siguiente proyecto de IT y proporciona un análisis completo:

=== INFORMACIÓN DEL PROYECTO ===
Nombre: ${projectData.name}
Código: ${projectData.code}
Líder: ${projectData.leader}
Estado: ${projectData.status}

Fechas:
- Inicio: ${projectData.start_date}
- Fin planeada: ${projectData.end_date}
- Fecha actual: ${new Date().toISOString().split('T')[0]}
- Días transcurridos: ${daysElapsed}
- Días restantes: ${daysRemaining}
- Duración total: ${totalDays} días

Progreso:
- Progreso actual: ${projectData.actual_progress}%
- Progreso planeado: ${projectData.planned_progress}%
- Desviación: ${progressDeviation}%

Presupuesto:
- Total: $${projectData.budget_total}
- Consumido: $${projectData.budget_consumed}
- Restante: $${budgetRemaining}
- % Consumido: ${budgetPercentage}%
- % Progreso: ${projectData.actual_progress}%
- Desviación presupuesto: ${budgetDeviation}%

=== MÉTRICAS DEL PROYECTO ===
Schedule Health: ${scheduleHealth}%
Budget Health: ${budgetHealth}%

Total de Tareas: ${tasks.length}
- Completadas: ${completedTasks} (${completedPercentage}%)
- En Progreso: ${inProgressTasks}
- Pendientes: ${pendingTasks}
- Bloqueadas: ${blockedTasks}

Progreso Promedio de Tareas: ${avgTaskProgress}%

=== TAREAS CRÍTICAS ===

Tareas Pendientes (${pendingTasks}):
${pendingTasksList}

Tareas Bloqueadas (${blockedTasks}):
${blockedTasksList}

Tareas Atrasadas (${lateTasks}):
${lateTasksList}

=== HISTORIAL DEL PROYECTO ===
${historyText}

=== SOLICITUD ===
Basándote en toda esta información:

1. Evalúa la salud general del proyecto (Health Score 0-100)
2. Identifica riesgos específicos por categoría (Schedule, Budget, Resources, Quality, Scope)
3. Proporciona recomendaciones accionables y priorizadas
4. Genera insights sobre patrones y predicciones
5. Estima la fecha de finalización real con nivel de confianza

RESPONDE ÚNICAMENTE CON EL JSON ESTRUCTURADO.
`;
```

### Componentes del Prompt

#### 1. Información del Proyecto

```
=== INFORMACIÓN DEL PROYECTO ===
Nombre: Migración a Cloud
Código: PROJ-001
Líder: Juan Pérez
Estado: Activo

Fechas:
- Inicio: 2026-01-01
- Fin planeada: 2026-06-30
- Fecha actual: 2026-01-25
- Días transcurridos: 24
- Días restantes: 156
- Duración total: 180 días
```

**Propósito:** Proporcionar contexto básico del proyecto y cronograma.

#### 2. Métricas de Progreso y Presupuesto

```
Progreso:
- Progreso actual: 65%
- Progreso planeado: 70%
- Desviación: -5%

Presupuesto:
- Total: $500,000
- Consumido: $325,000
- Restante: $175,000
- % Consumido: 65%
- % Progreso: 65%
- Desviación presupuesto: 0%
```

**Propósito:** Permitir análisis de desviaciones y eficiencia presupuestaria.

#### 3. Salud del Cronograma y Presupuesto

```
=== MÉTRICAS DEL PROYECTO ===
Schedule Health: 85%
Budget Health: 100%
```

**Cálculo de Schedule Health:**
```javascript
const scheduleHealth = Math.max(0, 100 - Math.abs(progressDeviation));
// Si desviación es -5%, entonces scheduleHealth = 95%
```

**Cálculo de Budget Health:**
```javascript
const budgetHealth = Math.max(0, 100 - Math.abs(budgetDeviation));
// Si desviación es 0%, entonces budgetHealth = 100%
```

#### 4. Estadísticas de Tareas

```
Total de Tareas: 45
- Completadas: 28 (62%)
- En Progreso: 12 (27%)
- Pendientes: 3 (7%)
- Bloqueadas: 2 (4%)

Progreso Promedio de Tareas: 68%
```

**Propósito:** Dar visibilidad del estado de ejecución del proyecto.

#### 5. Tareas Críticas

```
=== TAREAS CRÍTICAS ===

Tareas Pendientes (3):
- [TASK-045] Pruebas de carga (M3) - Responsable: Carlos López - Fin: 2026-02-15
- [TASK-046] Documentación técnica (M3) - Responsable: María García - Fin: 2026-02-20

Tareas Bloqueadas (2):
- [TASK-032] Migración de datos (M2) - Bloqueada desde: 2026-01-15 - Responsable: Ana Martínez
- [TASK-033] Configuración de seguridad (M2) - Bloqueada desde: 2026-01-20 - Responsable: Pedro Sánchez

Tareas Atrasadas (1):
- [TASK-028] Revisión de arquitectura (M2) - Fin planeada: 2026-01-20 - Progreso: 80%
```

**Propósito:** Identificar puntos críticos que requieren atención inmediata.

#### 6. Historial del Proyecto

```
=== HISTORIAL DEL PROYECTO ===

Eventos recientes:
- 2026-01-20: Cambio de alcance - Se agregaron requisitos de seguridad adicionales
- 2026-01-15: Actualización de progreso - Milestone M1 completado
- 2026-01-10: Cambio de equipo - Se asignó nuevo líder técnico
```

**Propósito:** Dar contexto histórico para entender cambios y evolución.

---

## Técnicas de Prompting

### 1. Chain-of-Thought (CoT)

Instruir al modelo para razonar paso a paso:

```
Basándote en toda esta información:

1. Evalúa la salud general del proyecto (Health Score 0-100)
2. Identifica riesgos específicos por categoría
3. Proporciona recomendaciones accionables y priorizadas
4. Genera insights sobre patrones y predicciones
5. Estima la fecha de finalización real
```

**Beneficio:** Mejora la precisión al forzar razonamiento estructurado.

### 2. Few-Shot Learning

Aunque no usamos ejemplos explícitos en el prompt, el esquema JSON actúa como guía:

```json
{
  "status": "Healthy" | "At Risk" | "Critical",
  "healthScore": number (0-100),
  "risks": [
    {
      "category": "Schedule" | "Budget" | "Resources" | "Quality" | "Scope",
      "severity": "Low" | "Medium" | "High" | "Critical",
      "description": string,
      "impact": string,
      "mitigation": string
    }
  ]
}
```

**Beneficio:** Formato consistente y parseable.

### 3. Role-Based Prompting

Definir un rol experto específico:

```
Eres un asistente de IA especializado en análisis de proyectos de IT.

Tu rol es actuar como un Project Management Analyst AI con expertise en:
- Metodologías: ITIL, PMP, PRINCE2
- Gestión de riesgos en proyectos de tecnología
```

**Beneficio:** Respuestas más especializadas y contextuales.

### 4. Structured JSON Output

Forzar respuesta JSON sin texto adicional:

```
5. FORMATO DE SALIDA:
   - SIEMPRE responde ÚNICAMENTE con un JSON válido
   - NO incluyas texto adicional fuera del JSON
   - NO incluyas markdown code blocks (```)
```

**Beneficio:** Respuestas parseables y programáticas.

### 5. Constraint-Based Prompting

Definir restricciones claras:

```
4. Proporciona recomendaciones ESPECÍFICAS y ACCIONABLES:
   - No uses generalidades como "monitorear de cerca"
   - Incluye nombres de tareas específicas cuando sea posible
   - Sugiere acciones concretas con plazos
```

**Beneficio:** Respuestas útiles y accionables, no vagas.

---

## Estructura de Salida

### Esquema JSON Completo

```typescript
interface AIAnalysis {
  status: "Healthy" | "At Risk" | "Critical";
  healthScore: number; // 0-100
  risks: Risk[];
  recommendations: Recommendation[];
  insights: string[];
  predictedCompletionDate: string; // YYYY-MM-DD
  confidenceLevel: number; // 0-100
}

interface Risk {
  category: "Schedule" | "Budget" | "Resources" | "Quality" | "Scope";
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  impact: string;
  mitigation: string;
}

interface Recommendation {
  priority: "High" | "Medium" | "Low";
  action: string;
  rationale: string;
  expectedImpact: string;
}
```

### Ejemplo de Respuesta Real

```json
{
  "status": "At Risk",
  "healthScore": 72,
  "risks": [
    {
      "category": "Schedule",
      "severity": "Medium",
      "description": "El proyecto está 5% por debajo del progreso esperado (70% planeado vs 65% actual)",
      "impact": "Potencial retraso de 10-15 días en la fecha de finalización si no se corrige",
      "mitigation": "Aumentar recursos en tareas críticas del milestone M3 y revisar cronograma de tareas pendientes"
    },
    {
      "category": "Resources",
      "severity": "High",
      "description": "2 tareas bloqueadas desde hace más de 5 días (TASK-032 y TASK-033)",
      "impact": "Bloquea el inicio de 5 tareas dependientes en el milestone M3",
      "mitigation": "Asignar recursos adicionales o escalar con líder técnico para desbloquear TASK-032"
    },
    {
      "category": "Quality",
      "severity": "Low",
      "description": "Tareas de pruebas (TASK-045) pendientes a solo 3 semanas de la fecha límite",
      "impact": "Riesgo de encontrar bugs críticos tarde en el ciclo",
      "mitigation": "Iniciar pruebas de carga en paralelo con desarrollo final de M2"
    }
  ],
  "recommendations": [
    {
      "priority": "High",
      "action": "Desbloquear TASK-032 (Migración de datos) y TASK-033 (Configuración de seguridad) en las próximas 48 horas",
      "rationale": "Estas tareas están bloqueando el inicio de 5 tareas del milestone M3 y llevan más de 5 días bloqueadas",
      "expectedImpact": "Recuperar 3-5% de progreso y evitar retraso de 2 semanas"
    },
    {
      "priority": "High",
      "action": "Adelantar el inicio de TASK-045 (Pruebas de carga) para ejecutar en paralelo con desarrollo de M2",
      "rationale": "Solo quedan 3 semanas para la fecha límite y las pruebas pueden revelar problemas críticos",
      "expectedImpact": "Reducir riesgo de bugs en producción en 40%"
    },
    {
      "priority": "Medium",
      "action": "Revisar asignación de recursos para completar TASK-028 (Revisión de arquitectura) que está al 80%",
      "rationale": "Esta tarea está atrasada 5 días y está bloqueando decisiones arquitectónicas",
      "expectedImpact": "Desbloquear 2 tareas dependientes y alinear progreso con cronograma"
    },
    {
      "priority": "Medium",
      "action": "Realizar checkpoint de progreso semanal con el equipo para identificar impedimentos temprano",
      "rationale": "La desviación del cronograma sugiere falta de visibilidad sobre bloqueadores",
      "expectedImpact": "Mejorar predictibilidad y reducir sorpresas en 30%"
    }
  ],
  "insights": [
    "El presupuesto está perfectamente alineado con el progreso (65% consumido, 65% progreso), lo cual es excelente",
    "El Schedule Health de 85% indica una desviación moderada que aún es recuperable",
    "62% de tareas completadas con 68% de progreso promedio sugiere buen avance en tareas activas",
    "El cambio de alcance del 2026-01-20 (requisitos de seguridad adicionales) puede explicar la desviación de progreso",
    "El milestone M1 fue completado a tiempo según el historial, lo cual es positivo",
    "Las 2 tareas bloqueadas representan solo 4% del total, pero su impacto en dependencias es crítico"
  ],
  "predictedCompletionDate": "2026-07-15",
  "confidenceLevel": 75
}
```

---

## Ejemplos Completos

### Ejemplo 1: Proyecto Saludable

**Input:**
```javascript
{
  name: "Sistema de Facturación",
  code: "PROJ-002",
  leader: "María García",
  status: "Activo",
  start_date: "2026-01-01",
  end_date: "2026-04-30",
  actual_progress: 72,
  planned_progress: 70,
  budget_total: 200000,
  budget_consumed: 140000,
  tasks: [
    { status: "Completado", actual_progress: 100 },
    { status: "En Progreso", actual_progress: 80 },
    // ... más tareas
  ]
}
```

**Output:**
```json
{
  "status": "Healthy",
  "healthScore": 92,
  "risks": [
    {
      "category": "Quality",
      "severity": "Low",
      "description": "Faltan pruebas de integración en módulo de pagos",
      "impact": "Posibles bugs en producción",
      "mitigation": "Programar sesión de pruebas para la próxima semana"
    }
  ],
  "recommendations": [
    {
      "priority": "Medium",
      "action": "Completar documentación técnica antes del milestone M4",
      "rationale": "La documentación facilita la transición a operaciones",
      "expectedImpact": "Reducir tiempo de onboarding en 50%"
    }
  ],
  "insights": [
    "El proyecto va 2% por encima del progreso planeado, excelente desempeño",
    "Budget health en 100%, gasto perfectamente alineado con avance"
  ],
  "predictedCompletionDate": "2026-04-25",
  "confidenceLevel": 88
}
```

### Ejemplo 2: Proyecto en Riesgo Crítico

**Input:**
```javascript
{
  name: "Modernización Legacy",
  code: "PROJ-003",
  leader: "Carlos López",
  status: "Activo",
  start_date: "2025-09-01",
  end_date: "2026-02-28",
  actual_progress: 45,
  planned_progress: 85,
  budget_total: 800000,
  budget_consumed: 720000,
  tasks: [
    { status: "Bloqueado", actual_progress: 30 },
    { status: "Bloqueado", actual_progress: 20 },
    { status: "Atrasado", actual_progress: 60 },
    // ... más tareas
  ]
}
```

**Output:**
```json
{
  "status": "Critical",
  "healthScore": 28,
  "risks": [
    {
      "category": "Schedule",
      "severity": "Critical",
      "description": "Desviación de progreso de -40% (45% actual vs 85% planeado)",
      "impact": "Retraso estimado de 3-4 meses en la entrega",
      "mitigation": "Escalar a dirección para re-planificación completa del cronograma"
    },
    {
      "category": "Budget",
      "severity": "Critical",
      "description": "90% del presupuesto consumido con solo 45% de progreso",
      "impact": "Déficit presupuestario de $350,000 - $400,000 estimado",
      "mitigation": "Detener trabajo no crítico y solicitar extensión presupuestaria urgente"
    },
    {
      "category": "Resources",
      "severity": "Critical",
      "description": "15 tareas bloqueadas, parálisis del proyecto",
      "impact": "Imposibilidad de avanzar sin intervención",
      "mitigation": "Reunión de crisis con stakeholders para desbloquear recursos"
    }
  ],
  "recommendations": [
    {
      "priority": "High",
      "action": "ACCIÓN INMEDIATA: Congelar nuevo trabajo y enfocar equipo en desbloquear tareas críticas",
      "rationale": "El proyecto está en crisis, necesita intervención de emergencia",
      "expectedImpact": "Evitar colapso total del proyecto"
    },
    {
      "priority": "High",
      "action": "Convocar Project Recovery Board en 24 horas con PMO y Dirección",
      "rationale": "La desviación requiere decisiones ejecutivas sobre alcance, plazo y presupuesto",
      "expectedImpact": "Plan de rescate con recursos adicionales o reducción de alcance"
    },
    {
      "priority": "High",
      "action": "Realizar análisis de causa raíz de los bloqueos y presentar informe en 48 horas",
      "rationale": "Entender por qué hay 15 tareas bloqueadas es crítico para cualquier plan de recuperación",
      "expectedImpact": "Identificar problemas sistémicos y evitar recurrencia"
    }
  ],
  "insights": [
    "ALERTA CRÍTICA: El proyecto requiere intervención ejecutiva inmediata",
    "El ratio de consumo presupuestario (90%) vs progreso (45%) indica ineficiencia severa de 2:1",
    "15 tareas bloqueadas sugieren problemas estructurales (dependencias externas, recursos, decisiones)",
    "Sin intervención, el proyecto fallará con certeza del 95%",
    "Recomendación: Considerar pausa formal del proyecto para re-planificación"
  ],
  "predictedCompletionDate": "2026-06-30",
  "confidenceLevel": 35
}
```

---

## Modo Mock

Para desarrollo y testing sin acceso a Axet LLM, el servicio incluye un **modo mock** que genera análisis algorítmicos.

### Activación

```bash
AXET_MOCK_MODE=true
```

### Lógica del Mock

```javascript
// Algoritmo de Health Score en modo mock
let healthScore = 75; // Base

// Penalización por desviación de progreso
if (progressDeviation < 0) {
  healthScore -= Math.abs(progressDeviation);
}

// Penalización por desviación de presupuesto
if (budgetDeviation > 10) {
  healthScore -= budgetDeviation * 0.5;
}

// Penalización por tareas bloqueadas
if (blockedTasks > 0) {
  healthScore -= blockedTasks * 5;
}

// Penalización por bajo porcentaje de tareas completadas
if (completedPercentage < 50) {
  healthScore -= (50 - completedPercentage) * 0.5;
}

healthScore = Math.max(0, Math.min(100, healthScore));
```

### Generación de Riesgos Mock

```javascript
const risks = [];

// Riesgo de cronograma si hay desviación
if (progressDeviation < -5) {
  risks.push({
    category: "Schedule",
    severity: progressDeviation < -15 ? "High" : "Medium",
    description: `Desviación de progreso: ${Math.abs(progressDeviation)}%`,
    impact: "Posible retraso en la entrega",
    mitigation: "Revisar asignación de recursos"
  });
}

// Riesgo de presupuesto si hay sobre-gasto
if (budgetDeviation > 10) {
  risks.push({
    category: "Budget",
    severity: budgetDeviation > 20 ? "High" : "Medium",
    description: `Sobre-gasto: ${budgetDeviation}%`,
    impact: "Exceder presupuesto asignado",
    mitigation: "Controlar gastos y revisar scope"
  });
}

// Riesgo de recursos si hay tareas bloqueadas
if (blockedTasks > 0) {
  risks.push({
    category: "Resources",
    severity: blockedTasks > 3 ? "High" : "Medium",
    description: `${blockedTasks} tareas bloqueadas`,
    impact: "Retraso en entregables dependientes",
    mitigation: "Desbloquear tareas prioritarias"
  });
}
```

**Beneficio:** Permite desarrollo y testing sin dependencia de Axet LLM.

---

## Mejores Prácticas

### 1. Proporcionar Contexto Rico

✅ **Hacer:**
- Incluir métricas calculadas (schedule health, budget health)
- Listar tareas críticas con detalles (responsables, fechas)
- Agregar historial de eventos recientes
- Calcular desviaciones y ratios

❌ **Evitar:**
- Enviar solo datos crudos sin procesar
- Omitir fechas o información de progreso
- No incluir contexto de tareas bloqueadas

### 2. Estructurar Datos Claramente

✅ **Hacer:**
```
=== SECCIÓN CLARA ===
Dato: Valor
Dato: Valor

=== OTRA SECCIÓN ===
...
```

❌ **Evitar:**
```
Proyecto: XXX Estado: YYY Progreso: ZZZ... (todo junto)
```

### 3. Solicitar Salida Específica

✅ **Hacer:**
```
RESPONDE ÚNICAMENTE CON EL JSON ESTRUCTURADO.
NO incluyas texto adicional fuera del JSON.
```

❌ **Evitar:**
```
Dame un análisis del proyecto (vago)
```

### 4. Validar y Sanitizar Input

```javascript
// Validar que los datos existen antes de enviar
if (!projectData.name || !projectData.code) {
  throw new Error('Datos de proyecto incompletos');
}

// Sanitizar valores nulos
const safeData = {
  ...projectData,
  leader: projectData.leader || 'No asignado',
  description: projectData.description || 'Sin descripción',
  budget_total: projectData.budget_total || 0
};
```

### 5. Manejar Errores de Parsing

```javascript
try {
  const analysis = JSON.parse(response.data.choices[0].message.content);
  return analysis;
} catch (error) {
  console.error('Error parseando respuesta de IA:', error);
  
  // Intentar limpiar la respuesta
  let cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanedContent);
  } catch (retryError) {
    throw new Error('No se pudo parsear la respuesta de IA');
  }
}
```

### 6. Cachear Tokens de Acceso

```javascript
let cachedToken = null;
let tokenExpiration = null;

async function getAccessToken() {
  // Reutilizar token si aún es válido (50 minutos)
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
    return cachedToken;
  }
  
  // Obtener nuevo token
  const response = await axios.post(AXET_TOKEN_URL, {
    // ... credenciales
  });
  
  cachedToken = response.data.access_token;
  tokenExpiration = Date.now() + (50 * 60 * 1000); // 50 minutos
  
  return cachedToken;
}
```

### 7. Implementar Retry Logic

```javascript
async function analyzeWithRetry(projectData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeProject(projectData);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes de reintentar (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 8. Monitorear Calidad de Respuestas

```javascript
function validateAIResponse(analysis) {
  const requiredFields = ['status', 'healthScore', 'risks', 'recommendations'];
  
  for (const field of requiredFields) {
    if (!analysis[field]) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
  
  // Validar rangos
  if (analysis.healthScore < 0 || analysis.healthScore > 100) {
    throw new Error('healthScore fuera de rango');
  }
  
  // Validar tipos
  if (!Array.isArray(analysis.risks) || !Array.isArray(analysis.recommendations)) {
    throw new Error('risks y recommendations deben ser arrays');
  }
  
  return true;
}
```

---

## Recursos Adicionales

- **Documentación Axet LLM Enabler:** [Contactar NTT DATA]
- **Azure OpenAI Best Practices:** https://learn.microsoft.com/azure/ai-services/openai/
- **Prompt Engineering Guide:** https://platform.openai.com/docs/guides/prompt-engineering
- **Structured Output Guide:** https://platform.openai.com/docs/guides/structured-outputs

---

## Soporte

Para problemas con Axet LLM Enabler:
- **Email:** axet-support@nttdata.com
- **Portal:** https://axet-support.nttdata.com
- **Slack:** #axet-llm-support

---

**Última actualización:** 2026-01-29  
**Versión de prompts:** 2.1.0  
**Hackathon NTT DATA 2026** - GitHub Team
