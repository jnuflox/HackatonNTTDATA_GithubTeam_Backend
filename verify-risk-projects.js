require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function verifyRiskProjects() {
  try {
    console.log('🔍 Verificando proyectos con riesgos en la base de datos...\n');
    
    // Obtener proyectos con riesgo AMARILLO
    const { data: yellowProjects, error: yellowError } = await supabase
      .from('projects')
      .select('id, name, ai_risk_level, progress, budget, ai_analysis')
      .eq('ai_risk_level', 'yellow')
      .order('name');

    if (yellowError) {
      console.error('❌ Error obteniendo proyectos amarillos:', yellowError.message);
    } else {
      console.log(`🟡 PROYECTOS CON RIESGO AMARILLO: ${yellowProjects.length}`);
      yellowProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name}`);
        console.log(`      - Progreso: ${project.progress}%`);
        console.log(`      - Budget: $${project.budget.toLocaleString()}`);
        if (project.ai_analysis && project.ai_analysis.schedule_variance) {
          console.log(`      - Variación de cronograma: ${project.ai_analysis.schedule_variance}%`);
        }
      });
    }

    console.log('\n');

    // Obtener proyectos con riesgo ROJO
    const { data: redProjects, error: redError } = await supabase
      .from('projects')
      .select('id, name, ai_risk_level, progress, budget, ai_analysis')
      .eq('ai_risk_level', 'red')
      .order('name');

    if (redError) {
      console.error('❌ Error obteniendo proyectos rojos:', redError.message);
    } else {
      console.log(`🔴 PROYECTOS CON RIESGO ROJO: ${redProjects.length}`);
      redProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name}`);
        console.log(`      - Progreso: ${project.progress}%`);
        console.log(`      - Budget: $${project.budget.toLocaleString()}`);
        if (project.ai_analysis && project.ai_analysis.schedule_variance) {
          console.log(`      - Variación de cronograma: ${project.ai_analysis.schedule_variance}%`);
        }
      });
    }

    console.log('\n');
    console.log('📊 RESUMEN TOTAL:');
    console.log(`   🟡 Proyectos Riesgo AMARILLO: ${yellowProjects?.length || 0}`);
    console.log(`   🔴 Proyectos Riesgo ROJO: ${redProjects?.length || 0}`);
    console.log(`   📈 Total: ${(yellowProjects?.length || 0) + (redProjects?.length || 0)}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

verifyRiskProjects()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
