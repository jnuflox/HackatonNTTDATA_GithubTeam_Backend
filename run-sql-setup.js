/**
 * Script para ejecutar SQL directamente en Supabase usando Node.js
 * Ejecuta: node run-sql-setup.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Cadena de conexión con password codificado URL
// Password original: Peru.123$%#
// Password codificado: Peru.123%24%25%23 ($ → %24, % → %25, # → %23)
const connectionString = 'postgresql://postgres:Peru.123%24%25%23@db.kciarhxwyyzjptnfraif.supabase.co:5432/postgres';

// Configuración del cliente
const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function executeSQLFile() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   CREACIÓN DE BASE DE DATOS EN SUPABASE');
    console.log('   Proyecto: hackatonaxet');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Conectar
        console.log('🔄 Conectando a Supabase...');
        await client.connect();
        console.log('✅ Conectado exitosamente\n');

        // Leer archivo SQL
        const sqlFile = path.join(__dirname, '..', 'supabase-setup.sql');
        console.log('📄 Leyendo archivo SQL:', sqlFile);
        
        if (!fs.existsSync(sqlFile)) {
            throw new Error('No se encontró el archivo supabase-setup.sql');
        }

        const sql = fs.readFileSync(sqlFile, 'utf8');
        console.log('✅ Archivo SQL cargado\n');

        // Ejecutar SQL
        console.log('🚀 Ejecutando SQL en Supabase...');
        console.log('   (Esto puede tardar 10-20 segundos)\n');
        
        await client.query(sql);
        
        console.log('✅ SQL ejecutado exitosamente\n');

        // Verificar tablas creadas
        console.log('🔍 Verificando tablas creadas...\n');
        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('projects', 'tasks', 'documents', 'project_history')
            ORDER BY tablename;
        `);

        console.log('Tablas creadas:');
        result.rows.forEach(row => {
            console.log(`   ✅ ${row.tablename}`);
        });

        // Verificar datos de ejemplo
        console.log('\n🔍 Verificando datos de ejemplo...\n');
        
        const projectCount = await client.query('SELECT COUNT(*) as count FROM projects');
        const taskCount = await client.query('SELECT COUNT(*) as count FROM tasks');
        
        console.log(`   📊 Proyectos: ${projectCount.rows[0].count}`);
        console.log(`   📊 Tareas: ${taskCount.rows[0].count}`);

        // Mostrar proyecto de ejemplo
        const projects = await client.query('SELECT id, name, status, priority FROM projects LIMIT 1');
        if (projects.rows.length > 0) {
            console.log('\n📝 Proyecto de ejemplo creado:');
            console.log(`   ID: ${projects.rows[0].id}`);
            console.log(`   Nombre: ${projects.rows[0].name}`);
            console.log(`   Estado: ${projects.rows[0].status}`);
            console.log(`   Prioridad: ${projects.rows[0].priority}`);
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ BASE DE DATOS CREADA EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('🎯 Próximos pasos:');
        console.log('   1. Inicia el API: npm start');
        console.log('   2. Prueba el endpoint: http://localhost:3000/api/v1/projects');
        console.log('   3. O levanta Docker: docker compose up -d\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\n📋 Detalles del error:');
        console.error(error);
        console.log('\n💡 Solución alternativa:');
        console.log('   1. Ve a: https://supabase.com/dashboard/project/kciarhxwyyzjptnfraif/sql/new');
        console.log('   2. Copia el contenido de supabase-setup.sql');
        console.log('   3. Pega y ejecuta en el SQL Editor de Supabase\n');
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Ejecutar
executeSQLFile();
