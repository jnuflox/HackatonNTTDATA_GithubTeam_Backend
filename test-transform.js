const projectService = require('./src/services/project.service');

// Simular un proyecto de prueba
const testProject = {
  id: 1,
  name: 'Sistema CRM Corporativo',
  status: 'in_progress',
  start_date: '2026-01-15',
  end_date: '2026-06-30',
  progress: 29,
  project_manager: 'María González'
};

console.log('🧪 Testing transformProject function...\n');
console.log('📥 Input:', JSON.stringify(testProject, null, 2));

const transformed = projectService.transformProject(testProject);

console.log('\n📤 Output:', JSON.stringify({
  code: transformed.code,
  status: transformed.status,
  leader: transformed.leader,
  plannedProgress: transformed.plannedProgress,
  actualProgress: transformed.actualProgress,
  startDate: transformed.startDate,
  endDate: transformed.endDate
}, null, 2));

console.log('\n✅ All fields present:', 
  transformed.code && 
  transformed.status && 
  transformed.leader && 
  transformed.plannedProgress !== undefined &&
  transformed.actualProgress !== undefined);
