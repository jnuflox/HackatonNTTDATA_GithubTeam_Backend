const supabase = require('./src/config/supabase');

/**
 * Seed database with complete project data using Supabase client
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with Supabase...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('project_history').delete().neq('id', 0);
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Existing data cleared\n');

    // Create projects
    console.log('📁 Creating projects...');
    
    const projectsData = [
      {
        code: 'CRM-2026-001',
        name: 'Implementación Sistema CRM Corporativo',
        description: 'Sistema CRM integral para gestión de clientes y ventas',
        status: 'in_progress',
        priority: 'high',
        start_date: '2026-01-15',
        end_date: '2026-06-30',
        estimated_hours: 1000,
        actual_hours: 285,
        budget: 500000,
        progress: 29,
        client_name: 'Corporativo XYZ',
        project_manager: 'María González',
        team_size: 8,
        technology_stack: ['Node.js', 'React', 'PostgreSQL', 'Azure'],
        business_objectives: 'Centralizar gestión de clientes y automatizar procesos de ventas',
        success_criteria: 'Sistema funcionando con 500+ usuarios, reducir tiempo de ventas en 40%',
        ai_risk_assessment: { level: 'low', reasons: ['Progreso adelantado', 'Presupuesto controlado'] }
      },
      {
        code: 'MIG-2026-002',
        name: 'Migración Infrastructure Cloud Azure',
        description: 'Migración completa de infraestructura on-premise a Azure',
        status: 'in_progress',
        priority: 'critical',
        start_date: '2026-01-01',
        end_date: '2026-08-31',
        estimated_hours: 1500,
        actual_hours: 180,
        budget: 800000,
        progress: 12,
        client_name: 'Empresa Global Inc',
        project_manager: 'Carlos Ramírez',
        team_size: 10,
        technology_stack: ['Azure', 'Terraform', 'Docker', 'Kubernetes'],
        business_objectives: 'Reducir costos de infraestructura 30% y mejorar disponibilidad a 99.9%',
        success_criteria: 'Migración sin downtime, todos los servicios en la nube operativos',
        ai_risk_assessment: { level: 'medium', reasons: ['Retraso de 8%', 'Complejidad técnica alta'] }
      },
      {
        code: 'APP-2025-003',
        name: 'Desarrollo Aplicación Móvil Clientes',
        description: 'App móvil nativa para iOS y Android con funcionalidades de ecommerce',
        status: 'in_progress',
        priority: 'critical',
        start_date: '2025-11-01',
        end_date: '2026-04-30',
        estimated_hours: 850,
        actual_hours: 650,
        budget: 350000,
        progress: 45,
        client_name: 'Retail Tech SA',
        project_manager: 'Ana Martínez',
        team_size: 6,
        technology_stack: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
        business_objectives: 'Aumentar ventas móviles 60%, mejorar experiencia cliente',
        success_criteria: 'App publicada en stores, 10k+ descargas primer mes, rating 4+',
        ai_risk_assessment: { level: 'high', reasons: ['Presupuesto 84% consumido', 'Solo 45% avance', 'Riesgo de sobrecosto'] }
      },
      {
        code: 'RES-2025-004',
        name: 'Sistema de Reservas Online',
        description: 'Plataforma web para reservas online con pasarela de pagos integrada',
        status: 'completed',
        priority: 'high',
        start_date: '2025-09-01',
        end_date: '2025-12-20',
        estimated_hours: 600,
        actual_hours: 595,
        budget: 250000,
        progress: 100,
        client_name: 'Hoteles Premium',
        project_manager: 'Roberto Silva',
        team_size: 5,
        technology_stack: ['Vue.js', 'Python Django', 'PostgreSQL', 'Stripe'],
        business_objectives: 'Automatizar proceso de reservas, reducir costos operativos 50%',
        success_criteria: 'Sistema operativo 24/7, procesando 1000+ reservas/mes',
        ai_risk_assessment: { level: 'low', reasons: ['Proyecto completado exitosamente'] }
      },
      {
        code: 'RRHH-2026-005',
        name: 'Portal de Recursos Humanos',
        description: 'Portal interno para gestión de RRHH, nómina y evaluaciones',
        status: 'in_progress',
        priority: 'medium',
        start_date: '2026-01-20',
        end_date: '2026-05-15',
        estimated_hours: 550,
        actual_hours: 110,
        budget: 180000,
        progress: 22,
        client_name: 'Corporativo Nacional',
        project_manager: 'Laura Fernández',
        team_size: 4,
        technology_stack: ['Angular', 'Java Spring Boot', 'MySQL', 'Azure'],
        business_objectives: 'Digitalizar procesos RRHH, reducir tiempo administrativo 40%',
        success_criteria: 'Portal usado por 200+ empleados, automatización de nómina completa',
        ai_risk_assessment: { level: 'low', reasons: ['Progreso adelantado 4%', 'Sin bloqueos'] }
      },
      {
        code: 'IOT-2026-006',
        name: 'Sistema de Monitoreo IoT',
        description: 'Plataforma para monitoreo en tiempo real de dispositivos IoT industriales',
        status: 'planning',
        priority: 'medium',
        start_date: '2026-03-01',
        end_date: '2026-09-30',
        estimated_hours: 1200,
        actual_hours: 20,
        budget: 650000,
        progress: 2,
        client_name: 'Industrias Tech',
        project_manager: 'Jorge Mendoza',
        team_size: 7,
        technology_stack: ['Python', 'Kafka', 'InfluxDB', 'Grafana', 'AWS IoT'],
        business_objectives: 'Monitorear 5000+ dispositivos, predictive maintenance',
        success_criteria: 'Dashboard operativo, alertas en tiempo real, 99.5% uptime',
        ai_risk_assessment: { level: 'low', reasons: ['En fase inicial'] }
      },
      {
        code: 'ERP-2025-007',
        name: 'Implementación ERP SAP',
        description: 'Implementación y configuración de SAP S/4HANA para toda la organización',
        status: 'in_progress',
        priority: 'critical',
        start_date: '2025-10-01',
        end_date: '2026-06-30',
        estimated_hours: 2000,
        actual_hours: 560,
        budget: 1200000,
        progress: 28,
        client_name: 'Grupo Empresarial Internacional',
        project_manager: 'Patricia Ruiz',
        team_size: 15,
        technology_stack: ['SAP S/4HANA', 'Fiori', 'ABAP', 'Azure'],
        business_objectives: 'Integrar todos los procesos empresariales, visibilidad en tiempo real',
        success_criteria: 'ERP operativo en 5 países, 1000+ usuarios capacitados',
        ai_risk_assessment: { level: 'medium', reasons: ['Retraso 7%', 'Integración legacy compleja'] }
      }
    ];

    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .insert(projectsData)
      .select();

    if (projectError) throw projectError;
    console.log(`✅ ${projects.length} projects created\n`);

    // Create tasks for each project
    console.log('📋 Creating tasks...');
    
    const tasksData = [
      // Tasks for Project 1 (CRM - Sin riesgo)
      {
        project_id: projects[0].id,
        title: 'Análisis de Requerimientos CRM',
        description: 'Levantamiento y documentación de requerimientos del CRM',
        status: 'completed',
        priority: 'high',
        assigned_to: 'Juan Pérez',
        estimated_hours: 80,
        actual_hours: 75,
        due_date: '2026-01-25',
        completed_date: '2026-01-24'
      },
      {
        project_id: projects[0].id,
        title: 'Diseño de Base de Datos',
        description: 'Diseño del modelo de datos del CRM',
        status: 'in_progress',
        priority: 'high',
        assigned_to: 'María López',
        estimated_hours: 60,
        actual_hours: 45,
        due_date: '2026-02-10'
      },
      {
        project_id: projects[0].id,
        title: 'Desarrollo de APIs REST',
        description: 'Desarrollo de APIs REST para el CRM',
        status: 'pending',
        priority: 'high',
        assigned_to: 'Carlos Gómez',
        estimated_hours: 120,
        actual_hours: 0,
        due_date: '2026-03-15'
      },
      // Tasks for Project 2 (Migración - RIESGO MEDIO)
      {
        project_id: projects[1].id,
        title: 'Evaluación de Infraestructura',
        description: 'Análisis de infraestructura on-premise existente',
        status: 'completed',
        priority: 'critical',
        assigned_to: 'Diego Torres',
        estimated_hours: 100,
        actual_hours: 105,
        due_date: '2026-01-15',
        completed_date: '2026-01-15'
      },
      {
        project_id: projects[1].id,
        title: 'Diseño Arquitectura Azure',
        description: 'Diseño de arquitectura cloud en Azure',
        status: 'in_progress',
        priority: 'critical',
        assigned_to: 'Sofia Vargas',
        estimated_hours: 150,
        actual_hours: 90,
        due_date: '2026-02-15'
      },
      {
        project_id: projects[1].id,
        title: 'Migración Base de Datos',
        description: 'Migración de bases de datos a Azure SQL',
        status: 'blocked',
        priority: 'critical',
        assigned_to: 'Ricardo Morales',
        estimated_hours: 200,
        actual_hours: 15,
        due_date: '2026-03-30'
      },
      // Tasks for Project 3 (App Móvil - RIESGO ALTO)
      {
        project_id: projects[2].id,
        title: 'Diseño UX/UI',
        description: 'Diseño de interfaces de usuario',
        status: 'completed',
        priority: 'high',
        assigned_to: 'Elena Castro',
        estimated_hours: 120,
        actual_hours: 130,
        due_date: '2025-11-30',
        completed_date: '2025-11-29'
      },
      {
        project_id: projects[2].id,
        title: 'Desarrollo Backend',
        description: 'Desarrollo de servicios backend',
        status: 'in_progress',
        priority: 'critical',
        assigned_to: 'Fernando Ríos',
        estimated_hours: 300,
        actual_hours: 280,
        due_date: '2026-02-28'
      },
      {
        project_id: projects[2].id,
        title: 'Desarrollo Frontend Móvil',
        description: 'Desarrollo de aplicación móvil React Native',
        status: 'in_progress',
        priority: 'critical',
        assigned_to: 'Gabriela Ortiz',
        estimated_hours: 350,
        actual_hours: 210,
        due_date: '2026-03-31'
      },
      // Tasks for Project 4 (Completado)
      {
        project_id: projects[3].id,
        title: 'Desarrollo Sistema Reservas',
        description: 'Desarrollo completo del sistema',
        status: 'completed',
        priority: 'high',
        assigned_to: 'Ivana Sánchez',
        estimated_hours: 400,
        actual_hours: 395,
        due_date: '2025-11-15',
        completed_date: '2025-11-14'
      },
      {
        project_id: projects[3].id,
        title: 'Despliegue a Producción',
        description: 'Despliegue y configuración en producción',
        status: 'completed',
        priority: 'critical',
        assigned_to: 'Roberto Silva',
        estimated_hours: 80,
        actual_hours: 85,
        due_date: '2025-12-20',
        completed_date: '2025-12-19'
      },
      // Tasks for Project 5 (Portal RRHH - Sin riesgo)
      {
        project_id: projects[4].id,
        title: 'Análisis Procesos RRHH',
        description: 'Análisis de procesos de recursos humanos',
        status: 'completed',
        priority: 'medium',
        assigned_to: 'Julia Navarro',
        estimated_hours: 60,
        actual_hours: 55,
        due_date: '2026-01-31',
        completed_date: '2026-01-30'
      },
      {
        project_id: projects[4].id,
        title: 'Desarrollo Portal Web',
        description: 'Desarrollo del portal web de RRHH',
        status: 'in_progress',
        priority: 'high',
        assigned_to: 'Kevin Paredes',
        estimated_hours: 280,
        actual_hours: 85,
        due_date: '2026-04-15'
      },
      // Tasks for Project 7 (ERP - RIESGO MEDIO)
      {
        project_id: projects[6].id,
        title: 'Configuración Módulos SAP',
        description: 'Configuración de módulos base de SAP',
        status: 'in_progress',
        priority: 'critical',
        assigned_to: 'Luis Méndez',
        estimated_hours: 500,
        actual_hours: 450,
        due_date: '2026-01-31'
      },
      {
        project_id: projects[6].id,
        title: 'Migración de Datos Legacy',
        description: 'Migración de datos del sistema legacy',
        status: 'in_progress',
        priority: 'critical',
        assigned_to: 'Mónica Herrera',
        estimated_hours: 350,
        actual_hours: 85,
        due_date: '2026-04-15'
      }
    ];

    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .insert(tasksData)
      .select();

    if (taskError) throw taskError;
    console.log(`✅ ${tasks.length} tasks created\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\nSummary:');
    console.log(`- ${projects.length} Projects created`);
    console.log(`- ${tasks.length} Tasks created`);
    console.log('\nProjects by risk level:');
    console.log('- 🟢 GREEN (Sin riesgo): 4 proyectos');
    console.log('- 🟡 YELLOW (Riesgo medio): 2 proyectos');
    console.log('- 🔴 RED (Riesgo alto): 1 proyecto');
    console.log('\nProjects by status:');
    console.log('- in_progress: 5 proyectos');
    console.log('- completed: 1 proyecto');
    console.log('- paused: 1 proyecto');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Execute seeding
seedDatabase();
