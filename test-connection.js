/**
 * Script de Prueba de Conexión a Supabase
 * Ejecuta: node test-connection.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Intentar diferentes configuraciones
const configurations = [
    {
        name: 'Conexión Directa (db.xxx.supabase.co)',
        host: 'db.kciarhxwyyzjptnfraif.supabase.co',
        port: 5432,
        user: 'postgres',
        database: 'postgres'
    },
    {
        name: 'Conexión Pooler - Session Mode',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 5432,
        user: 'postgres.kciarhxwyyzjptnfraif',
        database: 'postgres'
    },
    {
        name: 'Conexión Pooler - Transaction Mode',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.kciarhxwyyzjptnfraif',
        database: 'postgres'
    },
    {
        name: 'Conexión con subdominio directo',
        host: 'kciarhxwyyzjptnfraif.supabase.co',
        port: 5432,
        user: 'postgres',
        database: 'postgres'
    }
];

const password = process.env.DB_PASSWORD || 'Peru.123$%#';

async function testConnection(config) {
    console.log(`\n🔄 Probando: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   User: ${config.user}`);
    
    const sequelize = new Sequelize(config.database, config.user, password, {
        host: config.host,
        port: config.port,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });

    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('SELECT version();');
        console.log(`   ✅ ¡ÉXITO! Conexión establecida`);
        console.log(`   PostgreSQL: ${results[0].version.split(' ')[0] + ' ' + results[0].version.split(' ')[1]}`);
        
        // Guardar configuración exitosa
        console.log(`\n📝 Configuración a usar en .env:`);
        console.log(`DB_HOST=${config.host}`);
        console.log(`DB_PORT=${config.port}`);
        console.log(`DB_USER=${config.user}`);
        console.log(`DB_NAME=${config.database}`);
        console.log(`DB_PASSWORD=${password}`);
        console.log(`DB_SSL=true`);
        
        await sequelize.close();
        return true;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        await sequelize.close();
        return false;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   PRUEBA DE CONEXIÓN A SUPABASE');
    console.log('   Proyecto: hackatonaxet');
    console.log('═══════════════════════════════════════════════════════');

    let success = false;
    
    for (const config of configurations) {
        const result = await testConnection(config);
        if (result) {
            success = true;
            break;
        }
        // Pequeña pausa entre intentos
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n═══════════════════════════════════════════════════════');
    if (success) {
        console.log('✅ Encontrada configuración válida');
        console.log('   Copia la configuración mostrada arriba a tu archivo .env');
    } else {
        console.log('❌ No se pudo conectar con ninguna configuración');
        console.log('\n💡 Solución alternativa:');
        console.log('   1. Ve a: https://supabase.com/dashboard/project/kciarhxwyyzjptnfraif/settings/database');
        console.log('   2. Copia la "Connection string" exacta');
        console.log('   3. Extrae host, port, user de la cadena');
        console.log('   4. O ejecuta el SQL directamente en el SQL Editor de Supabase');
    }
    console.log('═══════════════════════════════════════════════════════\n');
    
    process.exit(success ? 0 : 1);
}

main();
