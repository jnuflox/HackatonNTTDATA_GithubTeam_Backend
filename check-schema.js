const supabase = require('./src/config/supabase');

async function checkSchema() {
  console.log('Checking existing projects structure...\n');
  
  // Get one existing project to see the schema
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }
  
  if (projects && projects.length > 0) {
    console.log('Project columns:', Object.keys(projects[0]));
    console.log('\nSample project:', JSON.stringify(projects[0], null, 2));
  } else {
    console.log('No projects found in database');
  }
  
  // Check tasks
  console.log('\n\nChecking tasks structure...\n');
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .limit(1);
    
  if (!taskError && tasks && tasks.length > 0) {
    console.log('Task columns:', Object.keys(tasks[0]));
  }
}

checkSchema();
