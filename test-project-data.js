const axios = require('axios');

async function testProjectData() {
  try {
    console.log('Testing project API...\n');
    
    const response = await axios.get('http://localhost:3000/api/projects');
    const projects = response.data.data || response.data;
    
    if (projects && projects.length > 0) {
      const project = projects[0];
      console.log('✅ Project Data:');
      console.log(`   Código: ${project.code || 'MISSING'}`);
      console.log(`   Estado: ${project.status || 'MISSING'}`);
      console.log(`   Líder: ${project.leader || 'MISSING'}`);
      console.log(`   Progreso Planificado: ${project.plannedProgress !== undefined ? project.plannedProgress + '%' : 'MISSING'}`);
      console.log(`   Progreso Real: ${project.actualProgress !== undefined ? project.actualProgress + '%' : 'MISSING'}`);
      console.log(`   Nombre: ${project.name}`);
      console.log(`\n✅ Total projects: ${projects.length}`);
    } else {
      console.log('❌ No projects found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProjectData();
