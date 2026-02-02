/**
 * Test de conexión a Supabase usando REST API
 * Este método funciona incluso cuando la conexión directa PostgreSQL está bloqueada
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');

async function testSupabaseConnection() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   PRUEBA DE CONEXIÓN A SUPABASE (REST API)');
    console.log('   Proyecto: hackatonaxet');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🔗 URL:', process.env.SUPABASE_URL);
    console.log('🔑 Anon Key configurado:', process.env.SUPABASE_ANON_KEY ? '✅' : '❌');
    console.log('');

    try {
        // Test 1: Verificar tablas
        console.log('🔄 Test 1: Verificando tablas existentes...');
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('count')
            .limit(1);

        if (projectsError) throw projectsError;
        console.log('   ✅ Tabla "projects" accesible\n');

        // Test 2: Obtener proyectos
        console.log('🔄 Test 2: Consultando proyectos...');
        const { data: projectList, error: listError, count } = await supabase
            .from('projects')
            .select('id, name, status, priority', { count: 'exact' })
            .limit(5);

        if (listError) throw listError;

        console.log(`   ✅ ${count} proyecto(s) encontrado(s)`);
        if (projectList && projectList.length > 0) {
            console.log('\n   📊 Proyectos:');
            projectList.forEach(p => {
                console.log(`      • ID: ${p.id} - ${p.name}`);
                console.log(`        Estado: ${p.status} | Prioridad: ${p.priority}`);
            });
        }
        console.log('');

        // Test 3: Verificar tareas
        console.log('🔄 Test 3: Verificando tareas...');
        const { data: tasks, error: tasksError, count: tasksCount } = await supabase
            .from('tasks')
            .select('id, title, status', { count: 'exact' })
            .limit(5);

        if (tasksError) throw tasksError;
        console.log(`   ✅ ${tasksCount} tarea(s) encontrada(s)\n`);

        // Test 4: Insertar proyecto de prueba
        console.log('🔄 Test 4: Probando inserción...');
        const { data: newProject, error: insertError } = await supabase
            .from('projects')
            .insert({
                name: 'Proyecto de Prueba API',
                description: 'Proyecto creado desde Node.js usando Supabase SDK',
                status: 'planning',
                priority: 'medium',
                start_date: '2026-02-01',
                technology_stack: ['Node.js', 'Supabase', 'REST API']
            })
            .select()
            .single();

        if (insertError) throw insertError;
        console.log('   ✅ Proyecto de prueba insertado correctamente');
        console.log(`   ID del nuevo proyecto: ${newProject.id}\n`);

        // Test 5: Actualizar proyecto
        console.log('🔄 Test 5: Probando actualización...');
        const { error: updateError } = await supabase
            .from('projects')
            .update({ progress: 25 })
            .eq('id', newProject.id);

        if (updateError) throw updateError;
        console.log('   ✅ Proyecto actualizado correctamente\n');

        // Test 6: Eliminar proyecto de prueba
        console.log('🔄 Test 6: Limpiando proyecto de prueba...');
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', newProject.id);

        if (deleteError) throw deleteError;
        console.log('   ✅ Proyecto de prueba eliminado\n');

        // Resumen final
        console.log('═══════════════════════════════════════════════════════');
        console.log('   ✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🎉 Supabase REST API está funcionando correctamente!');
        console.log('');
        console.log('📝 Próximos pasos:');
        console.log('   1. Iniciar el servidor: npm start');
        console.log('   2. Acceder al API: http://localhost:3000/api/v1/projects');
        console.log('   3. O levantar con Docker: docker compose up -d\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\n📋 Detalles del error:');
        console.error(error);
        
        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verifica que el SUPABASE_ANON_KEY en .env sea correcto');
        console.log('   2. Confirma que las tablas existen en Supabase');
        console.log('   3. Revisa los permisos RLS en Supabase (si está habilitado)');
        console.log('   4. Ve a: https://supabase.com/dashboard/project/kciarhxwyyzjptnfraif/editor\n');
        
        process.exit(1);
    }
}

// Ejecutar tests
testSupabaseConnection();
