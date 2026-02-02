const { Project, Task, ProjectHistory, Document } = require('../../models');

/**
 * Seed database with initial data
 */
async function runSeeds() {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const projectCount = await Project.count();
    if (projectCount > 0) {
      console.log('⚠️  Database already has data. Clearing for re-seeding...');
      // Clear all data for re-seeding
      await Document.destroy({ where: {} });
      await ProjectHistory.destroy({ where: {} });
      await Task.destroy({ where: {} });
      await Project.destroy({ where: {} });
      console.log('✅ Previous data cleared');
    }

    // Create projects with diverse scenarios
    console.log('Creating projects...');
    
    // PROJECT 1: En curso SIN RIESGO - Sistema CRM
    const project1 = await Project.create({
      code: 'PRJ-2026-001',
      name: 'Implementación Sistema CRM Corporativo',
      status: 'Activo',
      leader: 'María González',
      start_date: '2026-01-15',
      end_date: '2026-06-30',
      planned_progress: 25.0,
      actual_progress: 28.5,
      management_system: 'Jira',
      management_path: 'https://company.atlassian.net/browse/PRJ-001',
      budget_total: 500000,
      budget_consumed: 125000,
      ai_risk_level: 'green'
    });

    // PROJECT 2: En curso CON RIESGO MEDIO - Migración Cloud
    const project2 = await Project.create({
      code: 'PRJ-2026-002',
      name: 'Migración Infrastructure Cloud Azure',
      status: 'Activo',
      leader: 'Carlos Ramírez',
      start_date: '2026-01-01',
      end_date: '2026-08-31',
      planned_progress: 20.0,
      actual_progress: 12.0,
      management_system: 'Microsoft Project',
      management_path: '\\\\servidor\\proyectos\\migracion-nube.mpp',
      budget_total: 800000,
      budget_consumed: 180000,
      ai_risk_level: 'yellow'
    });

    // PROJECT 3: En curso CON RIESGO ALTO - App Móvil
    const project3 = await Project.create({
      code: 'PRJ-2026-003',
      name: 'Desarrollo Aplicación Móvil Clientes',
      status: 'Activo',
      leader: 'Ana Martínez',
      start_date: '2025-11-01',
      end_date: '2026-04-30',
      planned_progress: 65.0,
      actual_progress: 45.0,
      management_system: 'Azure DevOps',
      management_path: 'https://dev.azure.com/company/mobile-app',
      budget_total: 350000,
      budget_consumed: 295000,
      ai_risk_level: 'red'
    });

    // PROJECT 4: Completado SIN RIESGO
    const project4 = await Project.create({
      code: 'PRJ-2025-015',
      name: 'Sistema de Reservas Online',
      status: 'Completado',
      leader: 'Roberto Silva',
      start_date: '2025-09-01',
      end_date: '2025-12-20',
      planned_progress: 100.0,
      actual_progress: 100.0,
      management_system: 'Jira',
      management_path: 'https://company.atlassian.net/browse/PRJ-015',
      budget_total: 250000,
      budget_consumed: 245000,
      ai_risk_level: 'green'
    });

    // PROJECT 5: En curso SIN RIESGO - Portal RRHH
    const project5 = await Project.create({
      code: 'PRJ-2026-004',
      name: 'Portal de Recursos Humanos',
      status: 'Activo',
      leader: 'Laura Fernández',
      start_date: '2026-01-20',
      end_date: '2026-05-15',
      planned_progress: 18.0,
      actual_progress: 22.0,
      management_system: 'Trello',
      management_path: 'https://trello.com/b/abc123/portal-rrhh',
      budget_total: 180000,
      budget_consumed: 38000,
      ai_risk_level: 'green'
    });

    // PROJECT 6: En planificación
    const project6 = await Project.create({
      code: 'PRJ-2026-005',
      name: 'Sistema de Monitoreo IoT',
      status: 'En Pausa',
      leader: 'Jorge Mendoza',
      start_date: '2026-03-01',
      end_date: '2026-09-30',
      planned_progress: 5.0,
      actual_progress: 2.0,
      management_system: 'Azure DevOps',
      management_path: 'https://dev.azure.com/company/iot-monitoring',
      budget_total: 650000,
      budget_consumed: 15000,
      ai_risk_level: 'green'
    });

    // PROJECT 7: En curso CON RIESGO - ERP
    const project7 = await Project.create({
      code: 'PRJ-2025-018',
      name: 'Implementación ERP SAP',
      status: 'Activo',
      leader: 'Patricia Ruiz',
      start_date: '2025-10-01',
      end_date: '2026-06-30',
      planned_progress: 35.0,
      actual_progress: 28.0,
      management_system: 'Microsoft Project',
      management_path: '\\\\servidor\\proyectos\\erp-sap.mpp',
      budget_total: 1200000,
      budget_consumed: 450000,
      ai_risk_level: 'yellow'
    });

    console.log('✅ Projects created');

    // Create tasks for projects
    console.log('Creating tasks...');
    
    // Tasks for Project 1 (CRM - En curso SIN RIESGO)
    await Task.create({
      project_id: project1.id,
      task_code: 'PRJ-2026-001-T001',
      name: 'Análisis de Requerimientos',
      description: 'Levantamiento y documentación de requerimientos del CRM',
      stage: 'Análisis',
      milestone: 'M1 - Kick-off',
      status: 'Completada',
      responsible: 'Juan Pérez',
      start_date: '2026-01-15',
      end_date: '2026-01-25',
      planned_hours: 80,
      actual_hours: 75,
      progress_percentage: 100,
      priority: 'Alta',
      ai_risk_level: 'low'
    });

    await Task.create({
      project_id: project1.id,
      task_code: 'PRJ-2026-001-T002',
      name: 'Diseño de Base de Datos',
      description: 'Diseño del modelo de datos del CRM',
      stage: 'Diseño',
      milestone: 'M1 - Kick-off',
      status: 'En Progreso',
      responsible: 'María López',
      start_date: '2026-01-26',
      end_date: '2026-02-10',
      planned_hours: 60,
      actual_hours: 45,
      progress_percentage: 75,
      priority: 'Alta',
      ai_risk_level: 'low'
    });

    await Task.create({
      project_id: project1.id,
      task_code: 'PRJ-2026-001-T003',
      name: 'Desarrollo de APIs REST',
      description: 'Desarrollo de APIs REST para el CRM',
      stage: 'Desarrollo',
      milestone: 'M2 - MVP',
      status: 'Pendiente',
      responsible: 'Carlos Gómez',
      start_date: '2026-02-11',
      end_date: '2026-03-15',
      planned_hours: 120,
      actual_hours: 0,
      progress_percentage: 0,
      priority: 'Alta',
      ai_risk_level: 'low'
    });

    // Tasks for Project 2 (Migración - En curso CON RIESGO MEDIO)
    await Task.create({
      project_id: project2.id,
      task_code: 'PRJ-2026-002-T001',
      name: 'Evaluación de Infraestructura Actual',
      description: 'Análisis de infraestructura on-premise existente',
      stage: 'Análisis',
      milestone: 'M1 - Assessment',
      status: 'Completada',
      responsible: 'Diego Torres',
      start_date: '2026-01-01',
      end_date: '2026-01-15',
      planned_hours: 100,
      actual_hours: 105,
      progress_percentage: 100,
      priority: 'Crítica',
      ai_risk_level: 'medium'
    });

    await Task.create({
      project_id: project2.id,
      task_code: 'PRJ-2026-002-T002',
      name: 'Diseño Arquitectura Azure',
      description: 'Diseño de arquitectura cloud en Azure',
      stage: 'Diseño',
      milestone: 'M1 - Assessment',
      status: 'En Progreso',
      responsible: 'Sofia Vargas',
      start_date: '2026-01-16',
      end_date: '2026-02-15',
      planned_hours: 150,
      actual_hours: 120,
      progress_percentage: 60,
      priority: 'Crítica',
      ai_risk_level: 'medium'
    });

    await Task.create({
      project_id: project2.id,
      task_code: 'PRJ-2026-002-T003',
      name: 'Migración Base de Datos',
      description: 'Migración de bases de datos a Azure SQL',
      stage: 'Migración',
      milestone: 'M2 - First Wave',
      status: 'Bloqueada',
      responsible: 'Ricardo Morales',
      start_date: '2026-02-16',
      end_date: '2026-03-30',
      planned_hours: 200,
      actual_hours: 15,
      progress_percentage: 5,
      priority: 'Crítica',
      ai_risk_level: 'high'
    });

    // Tasks for Project 3 (App Móvil - En curso CON RIESGO ALTO)
    await Task.create({
      project_id: project3.id,
      task_code: 'PRJ-2026-003-T001',
      name: 'Diseño UX/UI',
      description: 'Diseño de interfaces de usuario',
      stage: 'Diseño',
      milestone: 'M1 - Design',
      status: 'Completada',
      responsible: 'Elena Castro',
      start_date: '2025-11-01',
      end_date: '2025-11-30',
      planned_hours: 120,
      actual_hours: 130,
      progress_percentage: 100,
      priority: 'Alta',
      ai_risk_level: 'low'
    });

    await Task.create({
      project_id: project3.id,
      task_code: 'PRJ-2026-003-T002',
      name: 'Desarrollo Backend',
      description: 'Desarrollo de servicios backend',
      stage: 'Desarrollo',
      milestone: 'M2 - Beta',
      status: 'En Progreso',
      responsible: 'Fernando Ríos',
      start_date: '2025-12-01',
      end_date: '2026-02-28',
      planned_hours: 300,
      actual_hours: 280,
      progress_percentage: 85,
      priority: 'Crítica',
      ai_risk_level: 'high'
    });

    await Task.create({
      project_id: project3.id,
      task_code: 'PRJ-2026-003-T003',
      name: 'Desarrollo Frontend Móvil',
      description: 'Desarrollo de aplicación móvil React Native',
      stage: 'Desarrollo',
      milestone: 'M2 - Beta',
      status: 'En Progreso',
      responsible: 'Gabriela Ortiz',
      start_date: '2026-01-01',
      end_date: '2026-03-31',
      planned_hours: 350,
      actual_hours: 210,
      progress_percentage: 50,
      priority: 'Crítica',
      ai_risk_level: 'high'
    });

    await Task.create({
      project_id: project3.id,
      task_code: 'PRJ-2026-003-T004',
      name: 'Pruebas de Integración',
      description: 'Pruebas de integración y performance',
      stage: 'Testing',
      milestone: 'M3 - Release',
      status: 'Bloqueada',
      responsible: 'Hugo Delgado',
      start_date: '2026-04-01',
      end_date: '2026-04-25',
      planned_hours: 100,
      actual_hours: 0,
      progress_percentage: 0,
      priority: 'Alta',
      ai_risk_level: 'medium'
    });

    // Tasks for Project 4 (Reservas - COMPLETADO)
    await Task.create({
      project_id: project4.id,
      task_code: 'PRJ-2025-015-T001',
      name: 'Desarrollo Sistema Reservas',
      description: 'Desarrollo completo del sistema',
      stage: 'Desarrollo',
      milestone: 'M1 - MVP',
      status: 'Completada',
      responsible: 'Ivana Sánchez',
      start_date: '2025-09-01',
      end_date: '2025-11-15',
      planned_hours: 400,
      actual_hours: 395,
      progress_percentage: 100,
      priority: 'Alta',
      ai_risk_level: 'low'
    });

    await Task.create({
      project_id: project4.id,
      task_code: 'PRJ-2025-015-T002',
      name: 'Despliegue a Producción',
      description: 'Despliegue y configuración en producción',
      stage: 'Despliegue',
      milestone: 'M2 - Production',
      status: 'Completada',
      responsible: 'Roberto Silva',
      start_date: '2025-11-16',
      end_date: '2025-12-20',
      planned_hours: 80,
      actual_hours: 85,
      progress_percentage: 100,
      priority: 'Crítica',
      ai_risk_level: 'low'
    });

    // Tasks for Project 5 (Portal RRHH - En curso SIN RIESGO)
    await Task.create({
      project_id: project5.id,
      task_code: 'PRJ-2026-004-T001',
      name: 'Análisis Procesos RRHH',
      description: 'Análisis de procesos de recursos humanos',
      stage: 'Análisis',
      milestone: 'M1 - Discovery',
      status: 'Completada',
      responsible: 'Julia Navarro',
      start_date: '2026-01-20',
      end_date: '2026-01-31',
      planned_hours: 60,
      actual_hours: 55,
      progress_percentage: 100,
      priority: 'Media',
      ai_risk_level: 'low'
    });

    await Task.create({
      project_id: project5.id,
      task_code: 'PRJ-2026-004-T002',
      name: 'Desarrollo Portal Web',
      description: 'Desarrollo del portal web de RRHH',
      stage: 'Desarrollo',
      milestone: 'M2 - Development',
      status: 'En Progreso',
      responsible: 'Kevin Paredes',
      start_date: '2026-02-01',
      end_date: '2026-04-15',
      planned_hours: 280,
      actual_hours: 85,
      progress_percentage: 30,
      priority: 'Alta',
      ai_risk_level: 'low'
    });

    // Tasks for Project 7 (ERP - En curso CON RIESGO)
    await Task.create({
      project_id: project7.id,
      task_code: 'PRJ-2025-018-T001',
      name: 'Configuración Módulos SAP',
      description: 'Configuración de módulos base de SAP',
      stage: 'Configuración',
      milestone: 'M1 - Setup',
      status: 'En Progreso',
      responsible: 'Luis Méndez',
      start_date: '2025-10-01',
      end_date: '2026-01-31',
      planned_hours: 500,
      actual_hours: 480,
      progress_percentage: 90,
      priority: 'Crítica',
      ai_risk_level: 'medium'
    });

    await Task.create({
      project_id: project7.id,
      task_code: 'PRJ-2025-018-T002',
      name: 'Migración de Datos',
      description: 'Migración de datos del sistema legacy',
      stage: 'Migración',
      milestone: 'M2 - Data Migration',
      status: 'En Progreso',
      responsible: 'Mónica Herrera',
      start_date: '2026-01-15',
      end_date: '2026-04-15',
      planned_hours: 350,
      actual_hours: 120,
      progress_percentage: 25,
      priority: 'Crítica',
      ai_risk_level: 'high'
    });

    await Task.create({
      project_id: project7.id,
      task_code: 'PRJ-2025-018-T003',
      name: 'Capacitación Usuarios',
      description: 'Capacitación de usuarios finales',
      stage: 'Capacitación',
      milestone: 'M3 - Training',
      status: 'Pendiente',
      responsible: 'Patricia Ruiz',
      start_date: '2026-05-01',
      end_date: '2026-06-15',
      planned_hours: 200,
      actual_hours: 0,
      progress_percentage: 0,
      priority: 'Media',
      ai_risk_level: 'low'
    });

    console.log('✅ Tasks created');

    // Create history entries
    console.log('Creating history entries...');
    
    // History for Project 1
    await ProjectHistory.create({
      project_id: project1.id,
      date: new Date('2026-01-29T09:30:00'),
      title: 'Actualización de Progreso',
      description: 'Avance actualizado de 25% a 28.5%',
      reason: 'El equipo completó antes de tiempo el módulo de autenticación',
      change_type: 'progress_update',
      user: 'María González'
    });

    await ProjectHistory.create({
      project_id: project1.id,
      date: new Date('2026-01-20T14:15:00'),
      title: 'Incorporación de Recursos',
      description: 'Se agregaron 2 desarrolladores adicionales al equipo',
      reason: 'Necesidad de acelerar la fase de desarrollo',
      change_type: 'team_change',
      user: 'María González'
    });

    // History for Project 2 (con riesgo)
    await ProjectHistory.create({
      project_id: project2.id,
      date: new Date('2026-01-28T16:45:00'),
      title: 'Retraso Identificado',
      description: 'Progreso menor al planificado: 12% vs 20% esperado',
      reason: 'Complejidad mayor a la estimada en la evaluación de infraestructura',
      change_type: 'schedule_change',
      user: 'Carlos Ramírez'
    });

    await ProjectHistory.create({
      project_id: project2.id,
      date: new Date('2026-01-25T10:00:00'),
      title: 'Incremento de Presupuesto',
      description: 'Presupuesto incrementado de $800k a $850k',
      reason: 'Costos adicionales de licenciamiento Azure',
      change_type: 'budget_change',
      user: 'Carlos Ramírez'
    });

    // History for Project 3 (riesgo alto)
    await ProjectHistory.create({
      project_id: project3.id,
      date: new Date('2026-01-31T11:20:00'),
      title: 'Alerta de Riesgo Alto',
      description: 'Proyecto marcado con riesgo alto por presupuesto',
      reason: 'Presupuesto consumido al 84% con solo 45% de avance',
      change_type: 'risk_assessment',
      user: 'Sistema IA'
    });

    await ProjectHistory.create({
      project_id: project3.id,
      date: new Date('2026-01-26T09:00:00'),
      title: 'Revisión de Alcance',
      description: 'Se redujo alcance para cumplir con fecha límite',
      reason: 'Retraso acumulado de 3 semanas en desarrollo',
      change_type: 'scope_change',
      user: 'Ana Martínez'
    });

    // History for Project 5
    await ProjectHistory.create({
      project_id: project5.id,
      date: new Date('2026-01-30T14:30:00'),
      title: 'Avance Adelantado',
      description: 'Progreso de 22% supera el 18% planificado',
      reason: 'Análisis completado más rápido de lo esperado',
      change_type: 'progress_update',
      user: 'Laura Fernández'
    });

    // History for Project 7 (con riesgo)
    await ProjectHistory.create({
      project_id: project7.id,
      date: new Date('2026-01-27T15:15:00'),
      title: 'Riesgo Medio Identificado',
      description: 'Progreso menor al planificado: 28% vs 35% esperado',
      reason: 'Problemas de integración con sistemas legacy',
      change_type: 'risk_assessment',
      user: 'Patricia Ruiz'
    });

    console.log('✅ History entries created');

    // Create documents
    console.log('Creating documents...');
    
    // Documents for Project 1
    await Document.create({
      project_id: project1.id,
      document_type: 'l1',
      name: 'L1_CRM_Project.pdf',
      url: 'https://mock-storage.company.com/documents/PRJ-001/L1_CRM_Project.pdf',
      upload_date: new Date('2026-01-15T09:00:00'),
      version: '1.0',
      uploaded_by: 'María González'
    });

    await Document.create({
      project_id: project1.id,
      document_type: 'geco_excel',
      name: 'GECO_PRJ-001_Q1_2026.xlsx',
      url: 'https://mock-storage.company.com/documents/PRJ-001/GECO_PRJ-001_Q1_2026.xlsx',
      upload_date: new Date('2026-01-15T10:00:00'),
      version: '1.0',
      uploaded_by: 'María González'
    });

    // Documents for Project 2
    await Document.create({
      project_id: project2.id,
      document_type: 'l1',
      name: 'L1_Migracion_Cloud.pdf',
      url: 'https://mock-storage.company.com/documents/PRJ-002/L1_Migracion_Cloud.pdf',
      upload_date: new Date('2026-01-01T09:00:00'),
      version: '1.1',
      uploaded_by: 'Carlos Ramírez'
    });

    // Documents for Project 3
    await Document.create({
      project_id: project3.id,
      document_type: 'l1',
      name: 'L1_App_Movil.pdf',
      url: 'https://mock-storage.company.com/documents/PRJ-003/L1_App_Movil.pdf',
      upload_date: new Date('2025-11-01T09:00:00'),
      version: '2.0',
      uploaded_by: 'Ana Martínez'
    });

    await Document.create({
      project_id: project3.id,
      document_type: 'geco_excel',
      name: 'GECO_PRJ-003_Q1_2026.xlsx',
      url: 'https://mock-storage.company.com/documents/PRJ-003/GECO_PRJ-003_Q1_2026.xlsx',
      upload_date: new Date('2026-01-31T14:00:00'),
      version: '1.3',
      uploaded_by: 'Ana Martínez'
    });

    console.log('✅ Documents created');

    console.log('✅ Database seeding completed successfully');
    console.log('');
    console.log('Summary:');
    console.log('- 7 Projects created');
    console.log('- Multiple tasks per project');
    console.log('- Project history entries');
    console.log('- Project documents');
    console.log('');
    console.log('Projects by risk level:');
    console.log('- GREEN (Sin riesgo): 4 proyectos');
    console.log('- YELLOW (Riesgo medio): 2 proyectos');
    console.log('- RED (Riesgo alto): 1 proyecto');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
