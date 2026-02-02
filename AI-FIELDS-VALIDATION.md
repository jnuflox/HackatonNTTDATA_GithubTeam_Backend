# 🔍 Validación de Campos AI en Supabase

## ❌ Problema Encontrado

La validación reveló que **los campos AI NO existen en la base de datos de Supabase**, lo que explica por qué los análisis AI no se estaban guardando correctamente.

### Estado Actual de la Base de Datos

#### ✅ Campos AI Antiguos (Existen pero están obsoletos):
- `ai_analysis_status` - STRING
- `ai_recommendations` - NULL
- `ai_risk_assessment` - NULL  
- `ai_effort_estimation` - NULL

#### ❌ Campos AI Nuevos (NO existen, requeridos por el código):
- `ai_analysis` - JSONB
- `ai_last_analysis_date` - TIMESTAMP
- `ai_risk_level` - ENUM('green', 'yellow', 'red')

## 📋 Esquema Actual de la Tabla `projects`

```
Total de columnas: 24

1.  id (number)
2.  name (string)
3.  description (string)
4.  status (string)
5.  priority (string)
6.  start_date (string)
7.  end_date (string)
8.  estimated_hours (number)
9.  actual_hours (number)
10. budget (number)
11. progress (number)
12. client_name (string)
13. project_manager (string)
14. team_size (number)
15. technology_stack (object)
16. business_objectives (string)
17. success_criteria (string)
18. risks_identified (NULL)
19. ai_analysis_status (string) ← ANTIGUO
20. ai_recommendations (NULL) ← ANTIGUO
21. ai_risk_assessment (NULL) ← ANTIGUO
22. ai_effort_estimation (NULL) ← ANTIGUO
23. created_at (string)
24. updated_at (string)
```

## 🛠️ Solución: Ejecutar Migración SQL

### Paso 1: Acceder al SQL Editor de Supabase

1. Ve a: https://supabase.com/dashboard/project/kciarhxwyyzjptnfraif/editor
2. Haz clic en **"SQL Editor"** en el menú lateral
3. Haz clic en **"New query"**

### Paso 2: Ejecutar la Migración

Copia y pega el contenido del archivo [`migrations/add-ai-fields.sql`](migrations/add-ai-fields.sql) en el editor SQL y ejecuta.

**La migración hará lo siguiente:**

```sql
-- 1. Agregar campo ai_analysis (JSONB)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';

-- 2. Agregar campo ai_last_analysis_date
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_last_analysis_date TIMESTAMP WITH TIME ZONE;

-- 3. Crear tipo ENUM risk_level
CREATE TYPE risk_level AS ENUM ('green', 'yellow', 'red');

-- 4. Agregar campo ai_risk_level
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_risk_level risk_level;

-- 5-6. Crear índices para optimizar consultas
CREATE INDEX idx_projects_ai_risk_level ON projects(ai_risk_level);
CREATE INDEX idx_projects_ai_last_analysis_date ON projects(ai_last_analysis_date);
```

### Paso 3: Verificar la Migración

Ejecuta el script de verificación:

```bash
node check-db-schema.js
```

Deberías ver:

```
CAMPOS AI ESPERADOS:
   ✅ ai_analysis
   ✅ ai_last_analysis_date
   ✅ ai_risk_level
```

## 🧪 Scripts de Validación Disponibles

### 1. `check-db-schema.js`
Verifica qué columnas existen en la tabla `projects`.

```bash
node check-db-schema.js
```

### 2. `validate-ai-fields.js`
Valida que los campos AI tienen datos y calcula estadísticas.

```bash
node validate-ai-fields.js
```

**Salida esperada después de la migración:**
- Total de proyectos con `ai_analysis`
- Cobertura de los 9 campos esperados
- Distribución de niveles de riesgo (verde/amarillo/rojo)
- Recomendaciones de acción

### 3. `run-migration.js`
Muestra las instrucciones para ejecutar la migración.

```bash
node run-migration.js
```

## 📊 Campos AI y su Estructura

### Campo `ai_analysis` (JSONB)

Contiene los **9 campos** del análisis de Axet LLM:

```json
{
  "status": "string",
  "healthScore": 0-100,
  "risks": [
    {
      "category": "string",
      "severity": "string",
      "description": "string",
      "impact": "string",
      "mitigation": "string",
      "estimatedEffort": "string"
    }
  ],
  "recommendations": [
    {
      "priority": "string",
      "action": "string",
      "rationale": "string",
      "expectedImpact": "string",
      "timeframe": "string"
    }
  ],
  "insights": ["string"],
  "predictedCompletionDate": "YYYY-MM-DD",
  "confidenceLevel": 0-100,
  "keyMetrics": {
    "schedulePerformanceIndex": number,
    "costPerformanceIndex": number,
    "taskCompletionRate": number,
    "criticalIssuesCount": number
  }
}
```

### Campo `ai_last_analysis_date` (TIMESTAMP)

Timestamp automático que se actualiza cada vez que se ejecuta un análisis AI.

### Campo `ai_risk_level` (ENUM)

Nivel de riesgo calculado automáticamente desde `healthScore`:
- `'green'` → healthScore >= 80
- `'yellow'` → healthScore >= 60 y < 80
- `'red'` → healthScore < 60

## 🔄 Flujo de Datos AI

```
1. Controller recibe request
   ↓
2. Service llama a axetLLM.analyzeProject()
   ↓
3. Axet LLM devuelve análisis con 9 campos
   ↓
4. Service calcula risk_level desde healthScore
   ↓
5. Service guarda en Supabase:
   - ai_analysis = objeto completo (9 campos)
   - ai_last_analysis_date = new Date()
   - ai_risk_level = 'green'|'yellow'|'red'
   ↓
6. Controller devuelve respuesta al cliente
```

## 🎯 Próximos Pasos

1. **✅ Ejecutar migración SQL** en Supabase (PASO CRÍTICO)
2. **✅ Verificar campos** con `node check-db-schema.js`
3. **✅ POBLAR CAMPOS AI** con `node populate-ai-fields.js` (NUEVO - Actualiza todos los proyectos)
4. **✅ Validar datos** con `node validate-ai-fields.js`
5. **✅ Probar endpoint** `POST /api/projects/:id/ai-analysis?refresh=true`
6. **✅ Verificar dashboard** usa `ai_risk_level` para filtros

## 🚀 Script de Población Automática

### `populate-ai-fields.js`

Script que **actualiza automáticamente** todos los proyectos que tienen campos AI vacíos o null.

**Qué hace:**
1. ✅ Consulta todos los proyectos de la base de datos
2. ✅ Identifica cuáles no tienen `ai_analysis`
3. ✅ Ejecuta análisis AI con Axet LLM para cada uno
4. ✅ Calcula automáticamente `ai_risk_level` desde `healthScore`
5. ✅ Actualiza `ai_last_analysis_date` con timestamp actual
6. ✅ Guarda los 3 campos en Supabase
7. ✅ Muestra progreso y estadísticas en tiempo real

**Uso:**
```bash
node populate-ai-fields.js
```

**Salida esperada:**
```
═══════════════════════════════════════════════════════════════
   POBLACIÓN DE CAMPOS AI EN PROYECTOS EXISTENTES
═══════════════════════════════════════════════════════════════

🔍 Consultando proyectos...
📊 Total de proyectos encontrados: 10
🎯 Proyectos que necesitan análisis AI: 10

PROCESANDO PROYECTOS:
[1/10] Procesando: Proyecto Alpha
   🤖 Ejecutando análisis AI...
   💾 Guardando resultados...
   ✅ Completado - Risk Level: green | Health Score: 85/100
   ⏳ Esperando 1s antes del siguiente...

[2/10] Procesando: Proyecto Beta
   ...

RESUMEN:
✅ Exitosos: 10/10
❌ Fallidos: 0/10

VERIFICACIÓN FINAL:
📊 Proyectos con ai_analysis: 10/10
📅 Proyectos con ai_last_analysis_date: 10/10
⚠️  Proyectos con ai_risk_level: 10/10

🎉 ¡ÉXITO! Todos los proyectos tienen análisis AI completo

DISTRIBUCIÓN DE NIVELES DE RIESGO:
🟢 Verde (>=80):    6 proyecto(s)
🟡 Amarillo (>=60): 3 proyecto(s)
🔴 Rojo (<60):      1 proyecto(s)
```

**Características:**
- ⏱️ Rate limiting (1 segundo entre requests para no saturar la API)
- 🔄 Manejo de errores individual por proyecto
- 📊 Estadísticas en tiempo real
- ✅ Verificación final automática
- 🎯 Solo procesa proyectos que lo necesitan (idempotente)

## ⚠️ Notas Importantes

- Los campos antiguos (`ai_analysis_status`, `ai_recommendations`, etc.) pueden dejarse por compatibilidad o eliminarse después de migrar los datos
- La migración usa `IF NOT EXISTS` para ser idempotente (puede ejecutarse múltiples veces sin error)
- Los índices mejoran el rendimiento de consultas por fecha y nivel de riesgo
- El campo `ai_analysis` es JSONB para flexibilidad futura en la estructura de análisis

## 📚 Archivos Relacionados

- [`migrations/add-ai-fields.sql`](migrations/add-ai-fields.sql) - Migración SQL
- [`src/services/project.service.js`](src/services/project.service.js) - Lógica de negocio
- [`src/models/Project.js`](src/models/Project.js) - Modelo Sequelize
- [`src/config/swagger.js`](src/config/swagger.js) - Documentación API
- [`check-db-schema.js`](check-db-schema.js) - Script de verificación
- [`validate-ai-fields.js`](validate-ai-fields.js) - Script de validación
- [`run-migration.js`](run-migration.js) - Instrucciones de migración
