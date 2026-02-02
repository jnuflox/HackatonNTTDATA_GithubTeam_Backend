# Documentación de Prompts - API IA Projects

Este documento detalla todos los prompts utilizados en la API para análisis de proyectos mediante Azure OpenAI.

## Índice

1. [Prompt del Sistema (System Prompt)](#prompt-del-sistema)
2. [Prompt de Análisis de Proyecto](#prompt-de-análisis-de-proyecto)
3. [Prompt de Análisis de Riesgo de Tareas](#prompt-de-análisis-de-riesgo-de-tareas)
4. [Técnicas de Prompting Utilizadas](#técnicas-de-prompting-utilizadas)
5. [Configuración de Parámetros](#configuración-de-parámetros)
6. [Integración con Axet LLM Enabler](#integración-con-axet-llm-enabler)

---

## Prompt del Sistema

### Ubicación
`src/services/azureOpenAI.service.js` - Método `_getSystemPrompt()`

### Propósito
Define el rol, expertise y estructura de salida del modelo AI para análisis de proyectos.

### Versión Actualizada

```text
You are an expert Project Management Analyst AI specialized in ITIL, PMP, and PRINCE2 methodologies.

Your expertise includes:
- Risk assessment and mitigation strategies
- Schedule analysis and deviation detection
- Resource allocation optimization
- Budget tracking and forecasting
- Stakeholder communication recommendations

You must analyze project data and provide structured insights in JSON format.

Output Structure:
{
  "status": "string - Overall project health assessment",
  "risks": [
    {
      "category": "Schedule|Budget|Resources|Quality|Scope",
      "severity": "High|Medium|Low",
      "description": "Detailed risk description",
      "impact": "Potential impact on project",
      "mitigation": "Recommended mitigation strategy"
    }
  ],
  "recommendations": [
    {
      "priority": "Critical|High|Medium|Low",
      "action": "Recommended action",
      "rationale": "Why this action is important",
      "expectedImpact": "Expected outcome"
    }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2"
  ],
  "healthScore": number (0-100),
  "predictedCompletionDate": "YYYY-MM-DD",
  "confidenceLevel": number (0-100)
}

Use Chain-of-Thought reasoning: Analyze step-by-step before concluding.
Be specific, actionable, and data-driven in your recommendations.
```

### Características Clave
- **Rol definido**: Project Management Analyst AI
- **Metodologías**: ITIL, PMP, PRINCE2
- **Estructura JSON**: Salida estructurada y parseable
- **Chain-of-Thought**: Razonamiento paso a paso
- **Accionable**: Recomendaciones específicas y prácticas

---

## Prompt de Análisis de Proyecto

### Ubicación
`src/services/azureOpenAI.service.js` - Método `_buildProjectAnalysisPrompt(projectData)`

### Propósito
Construye un prompt detallado con datos del proyecto para análisis comprehensivo.

### Estructura del Prompt

#### 1. Resumen del Proyecto

```text
# Project Analysis Request

## Project Overview
- **Code**: ${project.code}
- **Name**: ${project.name}
- **Status**: ${project.status}
- **Leader**: ${project.leader}
- **Timeline**: ${project.start_date} to ${project.end_date}
- **Planned Progress**: ${project.planned_progress}%
- **Actual Progress**: ${project.actual_progress}%
- **Deviation**: ${deviation}%
```

**Variables Dinámicas:**
- `project.code`: Código único del proyecto
- `project.name`: Nombre del proyecto
- `project.status`: Estado actual (Activo, Completado, etc.)
- `project.leader`: Líder del proyecto
- `project.start_date`: Fecha de inicio
- `project.end_date`: Fecha de finalización
- `project.planned_progress`: Progreso planificado basado en timeline
- `project.actual_progress`: Progreso real del proyecto
- `deviation`: Desviación calculada (actual - planificado)

#### 2. Datos Financieros

```text
## Financial Data
- **Budget Total**: $${project.budget_total}
- **Budget Consumed**: $${project.budget_consumed}
- **Budget Consumed %**: ${budgetConsumedPercent}%
```

**Variables Dinámicas:**
- `project.budget_total`: Presupuesto total asignado
- `project.budget_consumed`: Presupuesto consumido hasta la fecha
- `budgetConsumedPercent`: Porcentaje de presupuesto consumido

#### 3. Estadísticas de Tareas

```text
## Task Statistics
- **Total Tasks**: ${tasksTotal}
- **Completed**: ${tasksCompleted}
- **In Progress**: ${tasksInProgress}
- **Pending**: ${tasksPending}
- **Blocked**: ${tasksBlocked}
- **Completion Rate**: ${completionRate}%
```

**Variables Dinámicas:**
- `tasksTotal`: Total de tareas del proyecto
- `tasksCompleted`: Tareas completadas
- `tasksInProgress`: Tareas en progreso
- `tasksPending`: Tareas pendientes
- `tasksBlocked`: Tareas bloqueadas
- `completionRate`: Tasa de completitud

#### 4. Cambios Recientes

```text
## Recent Changes (Last ${count})
${history.map(h => `- ${h.date}: ${h.title} - ${h.description}`).join('\n')}
```

**Variables Dinámicas:**
- `history`: Array de cambios recientes del proyecto
- Muestra últimos 5 cambios con fecha, título y descripción

#### 5. Tareas de Alto Riesgo

```text
## High-Risk Tasks
${highRiskTasks.map(t => `- ${t.task_code}: ${t.name} (${t.status})`).join('\n')}
```

**Variables Dinámicas:**
- `highRiskTasks`: Tareas con nivel de riesgo alto o crítico
- Muestra código, nombre y estado de cada tarea

#### 6. Instrucciones de Análisis

```text
## Analysis Instructions

Please analyze this project using the following framework:

### Step 1: Health Assessment
Evaluate overall project health considering:
- Schedule adherence (deviation analysis)
- Budget utilization vs progress
- Task completion rate
- Blocked tasks impact

### Step 2: Risk Identification
Identify specific risks in these categories:
- **Schedule Risks**: Delays, critical path issues
- **Budget Risks**: Overspending, burn rate
- **Resource Risks**: Bottlenecks, dependencies
- **Quality Risks**: Blocked tasks, rework
- **Scope Risks**: Scope creep indicators

### Step 3: Predictive Analysis
Based on current data:
- Predict realistic completion date
- Forecast budget overrun probability
- Identify critical tasks needing attention

### Step 4: Actionable Recommendations
Provide prioritized actions for:
1. Critical issues requiring immediate attention
2. High-priority optimization opportunities
3. Preventive measures for identified risks
```

**Framework de Análisis:**
1. **Evaluación de Salud**: Análisis general del estado del proyecto
2. **Identificación de Riesgos**: Categorización en 5 tipos de riesgos
3. **Análisis Predictivo**: Proyecciones y pronósticos
4. **Recomendaciones Accionables**: Acciones priorizadas

#### 7. Ejemplo Few-Shot

```text
## Few-Shot Example

Given a project with:
- Deviation: -5% (behind schedule)
- Budget consumed: 40%, Progress: 30%
- Blocked tasks: 3 out of 20

Expected analysis includes:
- Risk: High schedule risk due to negative deviation
- Risk: Medium budget risk (spending faster than progress)
- Recommendation: Unblock the 3 tasks immediately
- Recommendation: Review resource allocation
- Health Score: ~65/100
- Confidence: 85%

Now analyze the project data above and provide comprehensive structured JSON output.
```

**Propósito del Few-Shot:**
- Proporciona un ejemplo concreto de análisis esperado
- Demuestra cómo interpretar las métricas
- Establece el nivel de detalle requerido

---

## Técnicas de Prompting Utilizadas

### 1. **Chain-of-Thought (CoT) Reasoning**

**Descripción**: Instrucción al modelo para razonar paso a paso antes de dar conclusiones.

**Implementación**:
```text
Use Chain-of-Thought reasoning: Analyze step-by-step before concluding.
```

**Beneficios**:
- Mejora la precisión del análisis
- Reduce respuestas impulsivas
- Facilita el debugging del razonamiento

### 2. **Few-Shot Learning**

**Descripción**: Proporciona ejemplos concretos del tipo de análisis esperado.

**Implementación**: Sección "Few-Shot Example" con caso específico y análisis esperado.

**Beneficios**:
- Guía el formato de respuesta
- Establece estándares de calidad
- Reduce ambigüedad en las expectativas

### 3. **Role-Based Prompting**

**Descripción**: Define un rol específico y expertise para el modelo.

**Implementación**:
```text
You are an expert Project Management Analyst AI specialized in ITIL, PMP, and PRINCE2 methodologies.
```

**Beneficios**:
- Contextualiza la perspectiva del análisis
- Activa conocimiento especializado
- Mejora consistencia de respuestas

### 4. **Structured Output**

**Descripción**: Define estructura JSON exacta esperada en la respuesta.

**Implementación**: Schema JSON detallado con tipos de datos y campos requeridos.

**Beneficios**:
- Facilita parsing automático
- Reduce errores de formato
- Permite validación de respuesta

### 5. **Contextual Data Injection**

**Descripción**: Inyecta datos específicos del proyecto en formato estructurado.

**Implementación**: Secciones organizadas con métricas calculadas (Overview, Financial, Tasks, etc.).

**Beneficios**:
- Análisis basado en datos reales
- Información organizada y accesible
- Facilita identificación de patrones

### 6. **Step-by-Step Framework**

**Descripción**: Proporciona framework de 4 pasos para análisis sistemático.

**Implementación**: Analysis Instructions con pasos numerados y objetivos claros.

**Beneficios**:
- Análisis más completo y sistemático
- Reduce omisiones importantes
- Estructura lógica de razonamiento

---

## Configuración de Parámetros

---

## Prompt de Análisis de Riesgo de Tareas

### Ubicación
`src/services/task.service.js` - Método `analyzeTaskRisk(task)`

### Propósito
Evalúa automáticamente el nivel de riesgo de una tarea basándose en múltiples factores como estado, progreso, fechas límite y dependencias.

### Algoritmo de Análisis

#### Factores de Riesgo Evaluados

**1. Estado de la Tarea**
```javascript
// Estados de alto riesgo
if (status === 'Bloqueada') riskScore += 40;
if (status === 'Retrasada') riskScore += 35;
if (status === 'Pendiente' && daysUntilDue < 3) riskScore += 25;
```

**2. Progreso vs Tiempo Transcurrido**
```javascript
// Si el progreso está significativamente por debajo del tiempo transcurrido
const timeProgress = (daysElapsed / totalDays) * 100;
const progressGap = timeProgress - actualProgress;

if (progressGap > 20) riskScore += 30;
if (progressGap > 10) riskScore += 15;
```

**3. Proximidad a Fecha Límite**
```javascript
// Tareas cerca de la fecha límite con bajo progreso
if (daysUntilDue <= 3 && actualProgress < 80) riskScore += 25;
if (daysUntilDue <= 7 && actualProgress < 50) riskScore += 15;
```

**4. Duración y Complejidad**
```javascript
// Tareas de larga duración con bajo progreso
if (totalDays > 30 && actualProgress < 30) riskScore += 10;
```

### Niveles de Riesgo

| Risk Score | Risk Level | Color | Descripción |
|-----------|-----------|-------|-------------|
| 0-24 | `low` | 🟢 Verde | Tarea saludable, progreso normal |
| 25-49 | `medium` | 🟡 Amarillo | Requiere monitoreo, posibles retrasos |
| 50-74 | `high` | 🟠 Naranja | Riesgo significativo, acción requerida |
| 75-100 | `critical` | 🔴 Rojo | Riesgo crítico, intervención urgente |

### Ejemplo de Análisis

**Entrada:**
```json
{
  "task_code": "TASK-042",
  "name": "Integración API Payment Gateway",
  "status": "En Progreso",
  "start_date": "2024-01-15",
  "end_date": "2024-02-15",
  "actual_progress": 35
}
```

**Análisis (hoy: 2024-02-10):**
- Días totales: 31
- Días transcurridos: 26 (84% del tiempo)
- Progreso actual: 35%
- Gap de progreso: 49% (84% - 35%)
- Días hasta vencimiento: 5

**Cálculo de Riesgo:**
```javascript
let riskScore = 0;
riskScore += 30; // Gap de progreso > 20%
riskScore += 25; // < 7 días y progreso < 50%
// Total: 55 puntos
```

**Resultado:**
```json
{
  "riskLevel": "high",
  "riskScore": 55,
  "factors": [
    "Progreso (35%) significativamente por debajo del tiempo transcurrido (84%)",
    "Quedan solo 5 días para completar 65% restante",
    "Requiere aceleración inmediata o extensión de plazo"
  ]
}
```

### Factores Documentados

La API retorna factores específicos que explican el nivel de riesgo:

```javascript
factors: [
  "Tarea bloqueada - requiere intervención inmediata",
  "Progreso: 35% con 84% del tiempo transcurrido",
  "Días restantes: 5 días",
  "Gap de progreso: 49% por debajo de lo esperado",
  "Tarea de duración extendida (31 días) con bajo avance"
]
```

### Uso en API

**Endpoint:** `GET /api/tasks/:taskCode/ai-risk-analysis`

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {
      "task_code": "TASK-042",
      "name": "Integración API Payment Gateway",
      "status": "En Progreso"
    },
    "riskAnalysis": {
      "riskLevel": "high",
      "riskScore": 55,
      "factors": [
        "Progreso (35%) significativamente por debajo del tiempo transcurrido (84%)",
        "Quedan solo 5 días para completar 65% restante"
      ],
      "recommendations": [
        "Asignar recursos adicionales al equipo",
        "Revisar impedimentos técnicos",
        "Considerar extensión de plazo",
        "Escalar a Project Manager"
      ]
    }
  }
}
```

---

## Técnicas de Prompting Utilizadas

**Ubicación**: `src/services/azureOpenAI.service.js` - Método `analyzeProject()`

```javascript
{
  temperature: 0.3,           // Lower for more deterministic analysis
  maxTokens: 2000,            // Maximum response length
  topP: 0.95,                 // Nucleus sampling
  frequencyPenalty: 0,        // No penalty for repetition
  presencePenalty: 0          // No penalty for new topics
}
```

### Explicación de Parámetros

#### **temperature: 0.3**
- **Rango**: 0.0 - 2.0
- **Valor bajo (0.3)**: Respuestas más determinísticas y conservadoras
- **Propósito**: Para análisis de riesgo, se prefiere consistencia sobre creatividad
- **Efecto**: Reduce variabilidad entre análisis de proyectos similares

#### **maxTokens: 2000**
- **Propósito**: Limita longitud de respuesta
- **Justificación**: Suficiente para análisis detallado sin exceder límites
- **Consideración**: Respuestas más largas pueden requerir ajuste

#### **topP: 0.95**
- **Rango**: 0.0 - 1.0
- **Descripción**: Nucleus sampling - considera top 95% de probabilidad acumulada
- **Efecto**: Balancea diversidad con coherencia

#### **frequencyPenalty: 0**
- **Rango**: -2.0 - 2.0
- **Valor 0**: No penaliza repetición de tokens
- **Justificación**: Permite mencionar mismos conceptos cuando sea necesario

#### **presencePenalty: 0**
- **Rango**: -2.0 - 2.0
- **Valor 0**: No penaliza introducción de nuevos tokens
- **Justificación**: Permite explorar diferentes aspectos del análisis

---

## Variables de Entorno

### Configuración Requerida

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Mock Mode (Development)
AZURE_OPENAI_MOCK_MODE=false
```

### Descripción de Variables

- **AZURE_OPENAI_ENDPOINT**: URL del recurso Azure OpenAI
- **AZURE_OPENAI_API_KEY**: Clave de autenticación
- **AZURE_OPENAI_DEPLOYMENT_NAME**: Nombre del deployment (modelo)
- **AZURE_OPENAI_API_VERSION**: Versión de la API a utilizar
- **AZURE_OPENAI_MOCK_MODE**: Activa modo simulación para desarrollo

---

## Modo Mock

### Propósito
Permite desarrollo y testing sin consumir créditos de Azure OpenAI.

### Ubicación
`src/services/azureOpenAI.service.js` - Método `_mockAnalyzeProject()`

### Lógica de Análisis Mock

El modo mock simula análisis realista basado en:

1. **Desviación del Schedule**
   - Desviación > 10%: Riesgo Alto, Health Score -20
   - Desviación > 5%: Riesgo Medio, Health Score -10

2. **Riesgo Presupuestario**
   - Budget consumido > Progress + 10%: Riesgo Alto, Health Score -15

3. **Tareas Bloqueadas**
   - Por cada tarea bloqueada: Health Score -5
   - > 2 tareas bloqueadas: Riesgo Alto

4. **Proyección de Fecha**
   - Calcula tasa de progreso real
   - Extrapola fecha de finalización realista

### Ejemplo de Análisis Mock

```javascript
{
  status: "Proyecto requiere atención en áreas críticas identificadas",
  risks: [
    {
      category: "Schedule",
      severity: "High",
      description: "El proyecto presenta una desviación de -8.5% respecto al plan original",
      impact: "Alto riesgo de no cumplir con la fecha de entrega planificada",
      mitigation: "Revisar el cronograma, reasignar recursos críticos"
    }
  ],
  recommendations: [
    {
      priority: "Critical",
      action: "Realizar sesión de replanning con el equipo",
      rationale: "La desviación supera el 10%",
      expectedImpact: "Realinear expectativas con stakeholders"
    }
  ],
  insights: [
    "Tasa de completitud de tareas: 75.0%",
    "Salud general del proyecto: 65/100",
    "Proyecto atrasado 8.5% - requiere acción"
  ],
  healthScore: 65,
  predictedCompletionDate: "2024-06-15",
  confidenceLevel: 65
}
```

---

## Flujo de Análisis

### Diagrama de Flujo

```
1. Llamada a analyzeProject(projectData)
   ↓
2. Verificación mockMode
   ↓ (Si false)
3. Construcción de prompts
   - _getSystemPrompt()
   - _buildProjectAnalysisPrompt()
   ↓
4. Llamada a Azure OpenAI
   - client.getChatCompletions()
   - Con parámetros configurados
   ↓
5. Recepción de respuesta
   ↓
6. Parsing de respuesta
   - _parseAnalysisResponse()
   - Extracción de JSON
   - Validación de campos
   ↓
7. Retorno de análisis estructurado
```

### Manejo de Errores

```javascript
try {
  // Llamada a Azure OpenAI
} catch (error) {
  console.error('Error calling Azure OpenAI:', error);
  throw new Error('Failed to analyze project with AI');
}
```

**Errores Comunes**:
- Timeout de API
- Credenciales inválidas
- Límite de rate exceeded
- JSON malformado en respuesta

---

## Mejores Prácticas

### 1. **Prompt Engineering**
- ✅ Usar instrucciones claras y específicas
- ✅ Proporcionar contexto relevante
- ✅ Incluir ejemplos (Few-Shot)
- ✅ Definir estructura de salida
- ❌ Prompts ambiguos o vagos

### 2. **Optimización de Parámetros**
- ✅ Temperature bajo (0.2-0.4) para análisis consistente
- ✅ MaxTokens suficiente pero no excesivo
- ✅ TopP alto (0.9-0.95) para balance
- ❌ Temperature alta para tareas analíticas

### 3. **Manejo de Datos**
- ✅ Calcular métricas antes de enviar al prompt
- ✅ Formatear datos de manera legible
- ✅ Incluir solo datos relevantes
- ❌ Enviar datos crudos sin procesar

### 4. **Validación de Respuestas**
- ✅ Parsear y validar JSON
- ✅ Verificar campos requeridos
- ✅ Manejar respuestas malformadas
- ❌ Asumir formato correcto siempre

### 5. **Costos y Eficiencia**
- ✅ Usar modo mock en desarrollo
- ✅ Cachear análisis cuando sea posible
- ✅ Limitar llamadas innecesarias
- ❌ Analizar proyectos en cada request

---

## Referencias

### Documentación Azure OpenAI
- [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/)
- [Best Practices for Prompt Engineering](https://learn.microsoft.com/azure/ai-services/openai/concepts/prompt-engineering)

### Metodologías Mencionadas
- **ITIL**: Information Technology Infrastructure Library
- **PMP**: Project Management Professional
- **PRINCE2**: Projects IN Controlled Environments

### Técnicas de Prompting
- Chain-of-Thought Reasoning
- Few-Shot Learning
- Zero-Shot Learning
- Role-Based Prompting

---

## Changelog

### Versión 1.0.0 (Actual)
- ✅ Prompt de sistema con rol especializado
- ✅ Análisis de proyecto con framework estructurado
- ✅ Few-Shot learning con ejemplo concreto
- ✅ Salida JSON estructurada
- ✅ Modo mock para desarrollo
- ✅ Parámetros optimizados para análisis

### Mejoras Futuras
- [ ] Análisis de tareas individuales
- [ ] Análisis comparativo entre proyectos
- [ ] Recomendaciones personalizadas por rol
- [ ] Análisis de tendencias históricas
- [ ] Detección de anomalías automática

---

## Contacto y Soporte

Para preguntas sobre los prompts o sugerencias de mejora, consultar la documentación del proyecto o contactar al equipo de desarrollo.

**Última actualización**: 2 de febrero de 2026
