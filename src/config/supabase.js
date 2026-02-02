/**
 * Cliente de Supabase para operaciones REST API
 * Usa esto cuando la conexión directa PostgreSQL está bloqueada
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://kciarhxwyyzjptnfraif.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey || supabaseAnonKey === 'REEMPLAZAR_CON_ANON_KEY') {
    console.warn('⚠️  SUPABASE_ANON_KEY no está configurado en el archivo .env');
    console.warn('   Obtén el anon key desde: https://supabase.com/dashboard/project/kciarhxwyyzjptnfraif/settings/api');
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey || 'temporal-key', {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

module.exports = supabase;
