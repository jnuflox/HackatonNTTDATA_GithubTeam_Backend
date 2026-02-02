const supabase = require('./src/config/supabase');

/**
 * Add 'code' column to projects table using Supabase RPC or SQL
 * Note: Since Supabase client doesn't support ALTER TABLE directly,
 * this script will use the REST API to execute SQL
 */
async function addCodeColumn() {
  try {
    console.log('🔧 Adding "code" column to projects table...\n');

    // Try to add the column using Supabase's SQL editor API
    // This requires proper permissions on your Supabase instance
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;
        
        CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
      `
    });

    if (error) {
      console.error('⚠️  Could not add column via RPC. Error:', error.message);
      console.log('\n📋 Please execute the following SQL manually in Supabase:');
      console.log('-----------------------------------------------------------');
      console.log(`
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);

-- Optional: Generate codes for existing projects
UPDATE projects 
SET code = CONCAT(
  CASE 
    WHEN name LIKE '%CRM%' THEN 'CRM'
    WHEN name LIKE '%Migr%' OR name LIKE '%Cloud%' THEN 'MIG'
    WHEN name LIKE '%App%' OR name LIKE '%Móvil%' THEN 'APP'
    WHEN name LIKE '%Reserv%' THEN 'RES'
    WHEN name LIKE '%Recursos%' OR name LIKE '%RRHH%' THEN 'RRHH'
    WHEN name LIKE '%IoT%' OR name LIKE '%Monitor%' THEN 'IOT'
    WHEN name LIKE '%ERP%' OR name LIKE '%SAP%' THEN 'ERP'
    ELSE 'PRJ'
  END,
  '-',
  EXTRACT(YEAR FROM start_date),
  '-',
  LPAD(id::TEXT, 3, '0')
)
WHERE code IS NULL;
      `);
      console.log('-----------------------------------------------------------\n');
      return;
    }

    console.log('✅ Column "code" added successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please execute the following SQL manually in Supabase SQL Editor:');
    console.log('-----------------------------------------------------------');
    console.log(`
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
    `);
    console.log('-----------------------------------------------------------\n');
  }
}

addCodeColumn();
