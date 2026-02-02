-- Migración para agregar campos AI al esquema de Supabase
-- Fecha: 2026-02-02
-- Descripción: Agrega los campos ai_analysis, ai_last_analysis_date y ai_risk_level
--              para soportar el nuevo sistema de análisis AI con Axet LLM

-- 1. Agregar campo ai_analysis (JSONB para almacenar el análisis completo)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';

-- 2. Agregar campo ai_last_analysis_date (timestamp del último análisis)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_last_analysis_date TIMESTAMP WITH TIME ZONE;

-- 3. Crear tipo ENUM para ai_risk_level
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE risk_level AS ENUM ('green', 'yellow', 'red');
    END IF;
END $$;

-- 4. Agregar campo ai_risk_level
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_risk_level risk_level;

-- 5. Crear índice para mejorar consultas por risk level
CREATE INDEX IF NOT EXISTS idx_projects_ai_risk_level ON projects(ai_risk_level);

-- 6. Crear índice para mejorar consultas por fecha de análisis
CREATE INDEX IF NOT EXISTS idx_projects_ai_last_analysis_date ON projects(ai_last_analysis_date);

-- 7. Agregar comentarios para documentar los campos
COMMENT ON COLUMN projects.ai_analysis IS 'Análisis AI completo en formato JSON con 9 campos: status, healthScore, risks, recommendations, insights, predictedCompletionDate, confidenceLevel, keyMetrics';
COMMENT ON COLUMN projects.ai_last_analysis_date IS 'Fecha y hora del último análisis AI ejecutado';
COMMENT ON COLUMN projects.ai_risk_level IS 'Nivel de riesgo calculado desde healthScore: green (>=80), yellow (>=60), red (<60)';

-- 8. (Opcional) Migrar datos existentes de campos antiguos a nuevos
-- Si quieres preservar los datos de ai_recommendations, ai_risk_assessment, etc.
-- puedes construir un objeto JSON inicial aquí

-- Ejemplo de migración de datos antiguos (comentado por seguridad):
/*
UPDATE projects 
SET ai_analysis = jsonb_build_object(
    'recommendations', COALESCE(ai_recommendations, '[]'::jsonb),
    'risks', COALESCE(ai_risk_assessment, '[]'::jsonb),
    'insights', COALESCE(ai_effort_estimation, '[]'::jsonb),
    'status', ai_analysis_status
)
WHERE ai_recommendations IS NOT NULL 
   OR ai_risk_assessment IS NOT NULL 
   OR ai_effort_estimation IS NOT NULL
   OR ai_analysis_status IS NOT NULL;
*/

-- 9. Después de ejecutar esta migración, ejecuta el script Node.js para poblar los campos:
-- node populate-ai-fields.js
-- Este script ejecutará análisis AI para todos los proyectos y llenará los campos automáticamente

-- Verificar que los campos se crearon correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND column_name IN ('ai_analysis', 'ai_last_analysis_date', 'ai_risk_level')
ORDER BY column_name;
