/**
 * Script para verificar el esquema actual de la tabla projects en Supabase
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');

async function checkSchema() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   VERIFICACIÓN DEL ESQUEMA DE LA TABLA PROJECTS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    try {
        // Obtener un proyecto de ejemplo para ver columnas disponibles
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }

        if (!projects || projects.length === 0) {
            console.log('⚠️  No hay proyectos en la base de datos');
            return;
        }

        const project = projects[0];
        const columns = Object.keys(project);

        console.log('📊 Columnas existentes en la tabla projects:\n');
        columns.forEach((col, index) => {
            const value = project[col];
            const type = value === null ? 'NULL' : typeof value;
            console.log(`   ${index + 1}. ${col} (${type})`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('CAMPOS AI ESPERADOS:');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const aiFields = ['ai_analysis', 'ai_last_analysis_date', 'ai_risk_level'];
        
        aiFields.forEach(field => {
            const exists = columns.includes(field);
            console.log(`   ${exists ? '✅' : '❌'} ${field}`);
        });

        const missingFields = aiFields.filter(f => !columns.includes(f));
        
        if (missingFields.length > 0) {
            console.log('\n❌ PROBLEMA ENCONTRADO:');
            console.log(`   Faltan ${missingFields.length} campo(s) AI en la base de datos:`);
            console.log(`   ${missingFields.join(', ')}\n`);
            console.log('📝 ACCIÓN REQUERIDA:');
            console.log('   Necesitas ejecutar una migración SQL en Supabase para agregar estos campos.\n');
        } else {
            console.log('\n✅ Todos los campos AI están presentes en la base de datos\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSchema()
    .then(() => {
        console.log('═══════════════════════════════════════════════════════════════');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
