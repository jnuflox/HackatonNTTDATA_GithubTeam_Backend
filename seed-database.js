require('dotenv').config();
const supabase = require('./src/config/supabase');

const projects = [
  {
    name: 'Sistema de Gestión de Inventario',
    description: 'Desarrollo de sistema web para control de inventario en tiempo real con integración IoT',
    status: 'in_progress',
    priority: 'high',
    start_date: '2026-01-15',
    end_date: '2026-06-30',
    budget: 50000,
    estimated_hours: 400,
    actual_hours: 180,
    progress: 45,
    project_manager: 'Ana García',
    team_size: 5,
    technology_stack: ['Node.js', 'PostgreSQL', 'React', 'IoT']
  },
  {
    name: 'Plataforma E-Learning Corporativa',
    description: 'Plataforma de capacitación online para empleados con certificaciones',
    status: 'planning',
    priority: 'medium',
    start_date: '2026-02-01',
    end_date: '2026-08-31',
    budget: 75000,
    estimated_hours: 600,
    progress: 0,
    project_manager: 'Carlos Mendoza',
    team_size: 6,
    technology_stack: ['Vue.js', 'MySQL', 'Node.js', 'WebRTC']
  },
  {
    name: 'App Móvil de Delivery',
    description: 'Aplicación móvil multiplataforma para servicio de entregas',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-12-01',
    end_date: '2026-04-30',
    budget: 120000,
    estimated_hours: 800,
    actual_hours: 620,
    progress: 78,
    project_manager: 'Luis Torres',
    team_size: 8,
    technology_stack: ['React Native', 'Firebase', 'Google Maps', 'Stripe']
  },
  {
    name: 'Sistema CRM Personalizado',
    description: 'CRM adaptado a las necesidades específicas de ventas y marketing',
    status: 'in_progress',
    priority: 'high',
    start_date: '2026-01-10',
    end_date: '2026-07-15',
    budget: 95000,
    estimated_hours: 700,
    actual_hours: 320,
    progress: 46,
    project_manager: 'María Rodríguez',
    team_size: 7,
    technology_stack: ['Angular', 'PostgreSQL', '.NET Core', 'Redis']
  },
  {
    name: 'Portal de Autoservicio Cliente',
    description: 'Portal web para que clientes gestionen sus servicios y consultas',
    status: 'completed',
    priority: 'medium',
    start_date: '2025-09-01',
    end_date: '2025-12-31',
    budget: 45000,
    estimated_hours: 350,
    actual_hours: 365,
    progress: 100,
    project_manager: 'Pedro Sánchez',
    team_size: 4,
    technology_stack: ['React', 'Node.js', 'MongoDB']
  },
  {
    name: 'Sistema de Business Intelligence',
    description: 'Dashboard ejecutivo con análisis de datos y reportes automáticos',
    status: 'planning',
    priority: 'high',
    start_date: '2026-03-01',
    end_date: '2026-09-30',
    budget: 85000,
    estimated_hours: 550,
    progress: 0,
    project_manager: 'Sandra López',
    team_size: 5,
    technology_stack: ['Power BI', 'Python', 'SQL Server', 'Azure']
  },
  {
    name: 'Integración Multi-Sistema ERP',
    description: 'Integración de sistemas legacy con nuevo ERP corporativo',
    status: 'review',
    priority: 'critical',
    start_date: '2026-01-20',
    end_date: '2026-10-31',
    budget: 150000,
    estimated_hours: 1000,
    actual_hours: 450,
    progress: 45,
    project_manager: 'Jorge Martínez',
    team_size: 10,
    technology_stack: ['SAP', 'Java', 'Oracle', 'MuleSoft']
  },
  {
    name: 'App de Gestión de Proyectos',
    description: 'Herramienta interna para seguimiento de proyectos y tareas',
    status: 'in_progress',
    priority: 'medium',
    start_date: '2026-01-05',
    end_date: '2026-05-31',
    budget: 35000,
    estimated_hours: 300,
    actual_hours: 185,
    progress: 62,
    project_manager: 'Laura Fernández',
    team_size: 3,
    technology_stack: ['Vue.js', 'Node.js', 'PostgreSQL']
  },
  {
    name: 'Sistema de Reservas Online',
    description: 'Plataforma web para reservas de servicios con pagos integrados',
    status: 'completed',
    priority: 'high',
    start_date: '2025-10-01',
    end_date: '2026-01-31',
    budget: 65000,
    estimated_hours: 450,
    actual_hours: 470,
    progress: 100,
    project_manager: 'Roberto Díaz',
    team_size: 5,
    technology_stack: ['React', 'Express', 'Stripe', 'PostgreSQL']
  },
  {
    name: 'Chatbot con IA',
    description: 'Asistente virtual con IA para atención al cliente 24/7',
    status: 'planning',
    priority: 'medium',
    start_date: '2026-02-15',
    end_date: '2026-06-15',
    budget: 55000,
    estimated_hours: 400,
    progress: 0,
    project_manager: 'Carmen Ruiz',
    team_size: 4,
    technology_stack: ['Python', 'Azure OpenAI', 'Flask', 'Redis']
  },
  {
    name: 'Sistema de Monitoreo IoT',
    description: 'Plataforma para monitoreo de sensores y dispositivos IoT en tiempo real',
    status: 'in_progress',
    priority: 'high',
    start_date: '2026-01-08',
    end_date: '2026-08-30',
    budget: 110000,
    estimated_hours: 750,
    actual_hours: 350,
    progress: 47,
    project_manager: 'Miguel Ángel Castro',
    team_size: 6,
    technology_stack: ['Node.js', 'MQTT', 'InfluxDB', 'Grafana']
  },
  {
    name: 'Portal de Recursos Humanos',
    description: 'Sistema integral para gestión de RRHH, nóminas y evaluaciones',
    status: 'planning',
    priority: 'medium',
    start_date: '2026-03-01',
    end_date: '2026-11-30',
    budget: 90000,
    estimated_hours: 650,
    progress: 0,
    project_manager: 'Elena Jiménez',
    team_size: 7,
    technology_stack: ['Angular', '.NET Core', 'SQL Server']
  }
];

async function seedDatabase() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  try {
    // Insert projects
    console.log('📦 Insertando proyectos...');
    const { data: insertedProjects, error: projectsError } = await supabase
      .from('projects')
      .insert(projects)
      .select();

    if (projectsError) {
      throw new Error(`Error insertando proyectos: ${projectsError.message}`);
    }

    console.log(`✅ ${insertedProjects.length} proyectos insertados\n`);

    // Prepare tasks
    const tasks = [];
    
    insertedProjects.forEach((project, index) => {
      const numTasks = Math.floor(Math.random() * 5) + 3; // 3-7 tasks per project
      
      for (let i = 0; i < numTasks; i++) {
        const taskNames = [
          'Análisis de Requerimientos', 'Diseño de Arquitectura', 'Desarrollo Backend',
          'Desarrollo Frontend', 'Pruebas de Integración', 'Despliegue en Producción',
          'Documentación Técnica', 'Capacitación de Usuarios', 'Optimización de Rendimiento'
        ];
        
        const assignees = [
          'Ana García', 'Carlos Mendoza', 'Luis Torres', 'María Rodríguez',
          'Pedro Sánchez', 'Sandra López', 'Jorge Martínez', 'Laura Fernández'
        ];
        
        const statuses = ['pending', 'in_progress', 'review', 'completed', 'blocked'];
        const priorities = ['low', 'medium', 'high', 'critical'];
        
        const estimatedHours = (Math.floor(Math.random() * 60) + 20);
        const actualHours = Math.floor(estimatedHours * (0.8 + Math.random() * 0.4));
        
        const task = {
          project_id: project.id,
          title: taskNames[Math.floor(Math.random() * taskNames.length)],
          description: `Tarea ${i + 1} del proyecto ${project.name}`,
          assigned_to: assignees[Math.floor(Math.random() * assignees.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          estimated_hours: estimatedHours,
          actual_hours: actualHours,
          due_date: project.end_date
        };
        
        tasks.push(task);
      }
    });

    // Insert tasks
    console.log('📋 Insertando tareas...');
    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (tasksError) {
      throw new Error(`Error insertando tareas: ${tasksError.message}`);
    }

    console.log(`✅ ${insertedTasks.length} tareas insertadas\n`);

    // Insert project history
    console.log('📜 Insertando historial de proyectos...');
    const historyEntries = [];
    
    insertedProjects.slice(0, 5).forEach(project => {
      historyEntries.push({
        project_id: project.id,
        action: 'status_change',
        field_changed: 'status',
        old_value: 'planning',
        new_value: project.status,
        changed_by: project.project_manager,
        change_description: `Cambio de estado a ${project.status}`
      });
    });

    const { data: insertedHistory, error: historyError } = await supabase
      .from('project_history')
      .insert(historyEntries)
      .select();

    if (historyError) {
      throw new Error(`Error insertando historial: ${historyError.message}`);
    }

    console.log(`✅ ${insertedHistory.length} entradas de historial insertadas\n`);

    // Insert documents
    console.log('📄 Insertando documentos...');
    const documents = [];
    
    insertedProjects.slice(0, 6).forEach(project => {
      const docTypes = [
        { name: 'Especificación Técnica', type: 'specification', size: 2500000 },
        { name: 'Manual de Usuario', type: 'manual', size: 1800000 },
        { name: 'Plan de Proyecto', type: 'plan', size: 1200000 }
      ];
      
      docTypes.forEach(doc => {
        documents.push({
          project_id: project.id,
          name: doc.name,
          type: doc.type,
          file_path: `/documents/proj-${project.id}/${doc.name.toLowerCase().replace(/ /g, '-')}.pdf`,
          file_size: doc.size,
          mime_type: 'application/pdf',
          created_by: project.project_manager
        });
      });
    });

    const { data: insertedDocs, error: docsError } = await supabase
      .from('documents')
      .insert(documents)
      .select();

    if (docsError) {
      throw new Error(`Error insertando documentos: ${docsError.message}`);
    }

    console.log(`✅ ${insertedDocs.length} documentos insertados\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ SEED COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📦 Proyectos:  ${insertedProjects.length}`);
    console.log(`📋 Tareas:     ${insertedTasks.length}`);
    console.log(`📜 Historial:  ${insertedHistory.length}`);
    console.log(`📄 Documentos: ${insertedDocs.length}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🔗 Accede a:');
    console.log('   • API: http://localhost:3000/api/projects');
    console.log('   • Swagger: http://localhost:3000/api-docs\n');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

seedDatabase();
