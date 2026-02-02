const supabase = require('./src/config/supabase');

/**
 * Script para actualizar 10 proyectos en riesgo AMARILLO y 10 en riesgo ROJO
 * con datos completos y realistas
 */

// Proyectos con Riesgo AMARILLO (Yellow) - Riesgos moderados
const yellowRiskProjects = [
  {
    name: 'Modernización Portal Web Corporativo',
    description: 'Actualización del portal corporativo a tecnologías modernas con mejoras de UX/UI',
    status: 'in_progress',
    priority: 'high',
    start_date: '2025-12-01',
    end_date: '2026-05-31',
    estimated_hours: 800,
    actual_hours: 450,
    budget: 320000,
    progress: 52,
    client_name: 'Banco Nacional',
    project_manager: 'Sandra Torres',
    team_size: 6,
    technology_stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Azure', 'Tailwind CSS'],
    business_objectives: 'Mejorar experiencia usuario, aumentar conversión 35%, reducir tiempo carga 60%',
    success_criteria: 'Lighthouse score 90+, SEO optimizado, cumplir WCAG 2.1 AA',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Retraso moderado de 8%', 'Consumo presupuesto 67%', 'Dependencias técnicas sin resolver'] 
    },
    ai_analysis: {
      schedule_variance: -8,
      cost_performance_index: 0.85,
      risk_factors: ['Integraciones pendientes con sistemas legacy', 'Recursos compartidos con otros proyectos'],
      recommendations: ['Priorizar resolución de dependencias técnicas', 'Evaluar ampliación de equipo', 'Revisar alcance de integraciones']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Sistema de Facturación Electrónica',
    description: 'Implementación de sistema de facturación electrónica conforme a normativa fiscal',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2026-01-10',
    end_date: '2026-06-15',
    estimated_hours: 650,
    actual_hours: 380,
    budget: 280000,
    progress: 55,
    client_name: 'Retail Express',
    project_manager: 'Miguel Ángel Soto',
    team_size: 5,
    technology_stack: ['Java Spring Boot', 'Angular', 'Oracle DB', 'SAP Integration'],
    business_objectives: 'Cumplir con normativa fiscal, automatizar facturación 100%, reducir errores',
    success_criteria: 'Certificación SAT aprobada, procesar 10k+ facturas/día, integración SAP completa',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Cambios normativos recientes', 'Integración SAP más compleja de lo estimado', 'Testing regulatorio pendiente'] 
    },
    ai_analysis: {
      schedule_variance: -5,
      cost_performance_index: 0.88,
      risk_factors: ['Cambios en normativa fiscal', 'Dependencia de certificación externa', 'Complejidad integración SAP'],
      recommendations: ['Adelantar fase de certificación', 'Reforzar equipo de testing', 'Mantener buffer para cambios normativos']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Plataforma E-Learning Corporativa',
    description: 'Desarrollo de plataforma interna de capacitación y gestión del conocimiento',
    status: 'in_progress',
    priority: 'medium',
    start_date: '2025-11-15',
    end_date: '2026-04-30',
    estimated_hours: 700,
    actual_hours: 420,
    budget: 245000,
    progress: 58,
    client_name: 'Universidad Corporativa Tech',
    project_manager: 'Carmen Ruiz',
    team_size: 4,
    technology_stack: ['React', 'Node.js', 'MongoDB', 'AWS S3', 'WebRTC'],
    business_objectives: 'Capacitar 2000+ empleados, reducir costos capacitación externa 50%',
    success_criteria: 'Plataforma con video streaming, tracking de progreso, certificaciones automáticas',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Presupuesto consumido 70%', 'Funcionalidades de video streaming retrasadas', 'Equipo reducido'] 
    },
    ai_analysis: {
      schedule_variance: -6,
      cost_performance_index: 0.83,
      risk_factors: ['Implementación de streaming más costosa', 'Equipo pequeño para alcance', 'Requerimientos de escalabilidad subestimados'],
      recommendations: ['Priorizar features core', 'Considerar servicios de streaming externos', 'Revisar alcance fase 1']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'API Gateway Microservicios',
    description: 'Implementación de API Gateway y migración a arquitectura de microservicios',
    status: 'in_progress',
    priority: 'high',
    start_date: '2026-01-05',
    end_date: '2026-07-20',
    estimated_hours: 950,
    actual_hours: 520,
    budget: 420000,
    progress: 50,
    client_name: 'FinTech Solutions',
    project_manager: 'Roberto Mendoza',
    team_size: 8,
    technology_stack: ['Kong', 'Docker', 'Kubernetes', 'Node.js', 'Redis', 'Kafka'],
    business_objectives: 'Escalabilidad horizontal, reducir acoplamiento, mejorar tiempo respuesta 40%',
    success_criteria: 'Gateway procesando 100k requests/min, 15+ microservicios migrados',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Complejidad arquitectónica alta', 'Migración de servicios legacy lenta', 'Curva de aprendizaje del equipo'] 
    },
    ai_analysis: {
      schedule_variance: -7,
      cost_performance_index: 0.87,
      risk_factors: ['Migración legacy más compleja', 'Falta experiencia en microservicios del equipo', 'Testing de integración extensivo'],
      recommendations: ['Capacitación intensiva en microservicios', 'Priorizar migración servicios críticos', 'Reforzar testing automatizado']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Sistema de Business Intelligence',
    description: 'Implementación de plataforma BI con dashboards ejecutivos y reportes automáticos',
    status: 'in_progress',
    priority: 'high',
    start_date: '2025-12-10',
    end_date: '2026-06-10',
    estimated_hours: 850,
    actual_hours: 480,
    budget: 380000,
    progress: 53,
    client_name: 'Grupo Retail Internacional',
    project_manager: 'Daniela Vega',
    team_size: 7,
    technology_stack: ['Power BI', 'Azure Synapse', 'Python', 'SQL Server', 'DAX'],
    business_objectives: 'Centralizar datos de 20+ fuentes, decisiones data-driven en tiempo real',
    success_criteria: '50+ dashboards operativos, data refresh cada 15min, self-service BI',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Calidad de datos de fuentes heterogéneas', 'Transformaciones ETL más complejas', 'Cambios en requerimientos de visualización'] 
    },
    ai_analysis: {
      schedule_variance: -9,
      cost_performance_index: 0.84,
      risk_factors: ['Limpieza de datos subestimada', 'Fuentes de datos inconsistentes', 'Cambios frecuentes en métricas de negocio'],
      recommendations: ['Reforzar equipo de data quality', 'Establecer governance de datos', 'Congelar cambios de scope']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Automatización Testing QA',
    description: 'Implementación de framework de testing automatizado para CI/CD',
    status: 'in_progress',
    priority: 'medium',
    start_date: '2026-01-08',
    end_date: '2026-05-25',
    estimated_hours: 580,
    actual_hours: 340,
    budget: 195000,
    progress: 56,
    client_name: 'Software Factory Pro',
    project_manager: 'Fernando Castro',
    team_size: 4,
    technology_stack: ['Selenium', 'Cypress', 'Jest', 'GitHub Actions', 'Docker'],
    business_objectives: 'Reducir tiempo de testing 70%, aumentar cobertura a 85%, integrar CI/CD',
    success_criteria: '500+ test cases automatizados, ejecución en pipelines, reportes automáticos',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Aplicaciones legacy difíciles de testear', 'Falta de documentación de casos de prueba', 'Resistencia al cambio del equipo QA'] 
    },
    ai_analysis: {
      schedule_variance: -7,
      cost_performance_index: 0.86,
      risk_factors: ['Aplicaciones sin APIs testeables', 'Equipo QA no familiarizado con automatización', 'Mantenimiento de tests alto'],
      recommendations: ['Capacitación en testing automatizado', 'Refactorizar apps para testability', 'Empezar con smoke tests críticos']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Sistema de Gestión Documental',
    description: 'Plataforma de gestión documental con OCR, búsqueda inteligente y workflow',
    status: 'in_progress',
    priority: 'medium',
    start_date: '2025-11-20',
    end_date: '2026-05-15',
    estimated_hours: 720,
    actual_hours: 410,
    budget: 298000,
    progress: 54,
    client_name: 'Corporativo Legal',
    project_manager: 'Adriana Flores',
    team_size: 5,
    technology_stack: ['SharePoint', 'Azure Cognitive Services', 'C#', '.NET', 'Azure Storage'],
    business_objectives: 'Digitalizar 100k+ documentos, búsqueda semántica, reducir tiempo búsqueda 80%',
    success_criteria: 'OCR con 95%+ precisión, búsqueda en <2 segundos, workflows aprobados',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Precisión OCR inferior a esperada', 'Volumen de documentos mayor al estimado', 'Workflows complejos de configurar'] 
    },
    ai_analysis: {
      schedule_variance: -8,
      cost_performance_index: 0.82,
      risk_factors: ['Calidad variable de documentos escaneados', 'Necesidad de entrenamiento OCR customizado', 'Requerimientos de workflow cambiantes'],
      recommendations: ['Mejorar preprocessing de imágenes', 'Training adicional de modelo OCR', 'Simplificar workflows iniciales']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Migración Base de Datos Oracle a PostgreSQL',
    description: 'Migración de base de datos empresarial de Oracle a PostgreSQL',
    status: 'in_progress',
    priority: 'high',
    start_date: '2026-01-12',
    end_date: '2026-07-30',
    estimated_hours: 880,
    actual_hours: 490,
    budget: 365000,
    progress: 51,
    client_name: 'Empresa de Telecomunicaciones',
    project_manager: 'Gustavo Herrera',
    team_size: 6,
    technology_stack: ['PostgreSQL', 'Oracle', 'Python', 'pgLoader', 'AWS RDS'],
    business_objectives: 'Reducir costos de licenciamiento 60%, mejorar performance, open source',
    success_criteria: 'Migración sin pérdida de datos, downtime <4 horas, performance igual o superior',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Stored procedures propietarios complejos', 'Testing de regresión extensivo pendiente', 'Conocimiento limitado PostgreSQL en equipo'] 
    },
    ai_analysis: {
      schedule_variance: -9,
      cost_performance_index: 0.81,
      risk_factors: ['Conversión de PL/SQL a PL/pgSQL compleja', 'Performance tuning PostgreSQL requiere expertise', 'Testing exhaustivo necesario'],
      recommendations: ['Contratar experto PostgreSQL', 'Extender fase de testing', 'Plan de rollback robusto']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Portal de Proveedores B2B',
    description: 'Portal web para gestión de proveedores, órdenes de compra y facturación',
    status: 'in_progress',
    priority: 'medium',
    start_date: '2025-12-05',
    end_date: '2026-05-20',
    estimated_hours: 670,
    actual_hours: 390,
    budget: 275000,
    progress: 55,
    client_name: 'Manufactura Industrial',
    project_manager: 'Beatriz Moreno',
    team_size: 5,
    technology_stack: ['Vue.js', 'Laravel', 'MySQL', 'Azure', 'RESTful API'],
    business_objectives: 'Automatizar proceso compras, reducir tiempo aprobación 50%, integrar ERP',
    success_criteria: 'Portal usado por 200+ proveedores, integración ERP completa, móvil responsive',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Integración ERP más lenta de lo esperado', 'Onboarding proveedores complejo', 'Cambios en proceso de aprobación'] 
    },
    ai_analysis: {
      schedule_variance: -6,
      cost_performance_index: 0.85,
      risk_factors: ['ERP legacy difícil de integrar', 'Resistencia de proveedores al cambio', 'Proceso de aprobación no estandarizado'],
      recommendations: ['Simplificar integración ERP', 'Plan de change management para proveedores', 'Estandarizar workflows aprobación']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  },
  {
    name: 'Sistema de Monitoreo de Seguridad',
    description: 'Implementación de SIEM y herramientas de monitoreo de seguridad 24/7',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2026-01-15',
    end_date: '2026-06-30',
    estimated_hours: 750,
    actual_hours: 430,
    budget: 340000,
    progress: 53,
    client_name: 'Servicios Financieros',
    project_manager: 'Diego Paredes',
    team_size: 6,
    technology_stack: ['Splunk', 'ELK Stack', 'Azure Sentinel', 'Python', 'SOAR'],
    business_objectives: 'Detectar amenazas en tiempo real, compliance SOC 2, respuesta <15min',
    success_criteria: 'SIEM operativo 24/7, 50+ playbooks automatizados, cumplir ISO 27001',
    ai_risk_assessment: { 
      level: 'yellow', 
      reasons: ['Configuración de alertas genera falsos positivos', 'Integración con fuentes de datos pendiente', 'Falta de analistas especializados'] 
    },
    ai_analysis: {
      schedule_variance: -8,
      cost_performance_index: 0.83,
      risk_factors: ['Tuning de reglas SIEM complejo', 'Volumen de logs mayor al esperado', 'Necesidad de SOC especializado'],
      recommendations: ['Contratar analistas de seguridad', 'Ajustar umbrales de alertas', 'Priorizar integraciones críticas']
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'yellow'
  }
];

// Proyectos con Riesgo ROJO (Red) - Riesgos críticos
const redRiskProjects = [
  {
    name: 'Migración a Cloud Azure Completa',
    description: 'Migración completa de infraestructura on-premise a Azure Cloud con modernización de aplicaciones',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2024-10-01',
    end_date: '2026-03-31',
    estimated_hours: 3200,
    actual_hours: 2450,
    budget: 2800000,
    progress: 38,
    client_name: 'Corporación Global S.A.',
    project_manager: 'Roberto Méndez',
    team_size: 18,
    technology_stack: ['Azure', 'Kubernetes', 'Terraform', 'Docker', '.NET Core', 'React'],
    business_objectives: 'Reducir costos operativos 40%, mejorar escalabilidad, alta disponibilidad 99.99%',
    success_criteria: 'Migración exitosa de 200+ aplicaciones, RTO<4h, RPO<1h, cero pérdida de datos',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso crítico de 35%', 'Sobrecosto de 22%', 'Dependencias bloqueantes', 'Falta de expertise técnico'] 
    },
    ai_analysis: {
      schedule_variance: -35,
      cost_performance_index: 0.58,
      risk_factors: ['Aplicaciones legacy incompatibles', 'Resistencia al cambio organizacional', 'Licenciamiento Azure subestimado', 'Equipos sin capacitación cloud'],
      recommendations: ['Escalamiento urgente a CEO/CTO', 'Contratar Azure Solutions Architect', 'Replantear fases de migración', 'Budget adicional $800K', 'Capacitación intensiva equipo'],
      critical_issues: ['10 aplicaciones críticas bloqueadas', 'Performance degradado 45%', 'Costos Azure 30% sobre estimado'],
      impact_if_not_resolved: 'Posible cancelación proyecto, pérdida inversión $2M+, retroceso digital 2 años'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    name: 'Sistema Core Bancario Nueva Generación',
    description: 'Marketplace multi-país con pasarelas de pago locales y logística integrada',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-10-15',
    end_date: '2026-05-31',
    estimated_hours: 1800,
    actual_hours: 1450,
    budget: 980000,
    progress: 38,
    client_name: 'E-Commerce Corp',
    project_manager: 'Valeria Domínguez',
    team_size: 14,
    technology_stack: ['Node.js', 'React', 'PostgreSQL', 'Redis', 'Stripe', 'AWS'],
    business_objectives: 'Lanzar en 8 países, procesar $50M en transacciones año 1, mobile-first',
    success_criteria: 'Plataforma con 50k+ SKUs, 20+ métodos de pago, performance Black Friday',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso de 32%', 'Budget overrun 22%', 'Performance crítica insuficiente', 'Integraciones de pago fallando', 'Equipo sobrecargado'] 
    },
    ai_analysis: {
      schedule_variance: -32,
      cost_performance_index: 0.58,
      risk_factors: ['Arquitectura no escala', 'Integraciones pago muy complejas', 'Testing de carga insuficiente', 'Requerimientos multi-país subestimados', 'Technical debt acumulándose'],
      recommendations: ['Re-arquitectura urgente', 'Contratar equipo devops senior', 'Reducir scope países fase 1 a 3', 'Performance testing inmediato', 'Code freeze excepto bugs críticos'],
      critical_issues: ['Timeouts en checkout', 'Pasarelas pago no certificadas', 'Base datos no soporta carga esperada'],
      impact_if_not_resolved: 'Pérdida de lanzamiento navideño $20M en ventas, penalidades contractuales, posible litigio'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Sistema de Gestión Hospitalaria',
    description: 'Sistema integral de gestión hospitalaria con historias clínicas electrónicas',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-08-01',
    end_date: '2026-04-30',
    estimated_hours: 2200,
    actual_hours: 1780,
    budget: 1350000,
    progress: 36,
    client_name: 'Red Hospitalaria Nacional',
    project_manager: 'Dr. Luis Cervantes',
    team_size: 16,
    technology_stack: ['HL7 FHIR', 'C#', '.NET', 'SQL Server', 'Azure', 'DICOM'],
    business_objectives: 'Integrar 15 hospitales, historias clínicas digitales, interoperabilidad total',
    success_criteria: 'Sistema certificado HIPAA, integración con 10+ sistemas médicos, uptime 99.99%',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso crítico 36%', 'Certificaciones médicas pendientes', 'Problemas de seguridad detectados', 'Falta expertise en healthcare', 'Presupuesto agotado'] 
    },
    ai_analysis: {
      schedule_variance: -36,
      cost_performance_index: 0.55,
      risk_factors: ['Complejidad normativa subestimada', 'Equipo sin experiencia healthcare', 'Integraciones sistemas legacy fallando', 'Vulnerabilidades de seguridad críticas', 'Testing clínico insuficiente'],
      recommendations: ['Contratar consultores healthcare urgente', 'Auditoría de seguridad inmediata', 'Extender timeline 6 meses', 'Reforzar presupuesto $400k', 'Plan de mitigación de riesgos de vida'],
      critical_issues: ['Fallos en sistema de prescripción electrónica', 'Datos de pacientes en riesgo', 'No cumple estándares HL7'],
      impact_if_not_resolved: 'Riesgo de vida de pacientes, demandas legales, multas regulatorias millonarias, cierre de proyecto'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Migración SAP S/4HANA Multinacional',
    description: 'Migración de SAP ECC a S/4HANA en 12 países con operaciones 24/7',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-07-01',
    end_date: '2026-06-30',
    estimated_hours: 3000,
    actual_hours: 2350,
    budget: 2500000,
    progress: 34,
    client_name: 'Corporación Multinacional',
    project_manager: 'Patricia Ramos',
    team_size: 25,
    technology_stack: ['SAP S/4HANA', 'Fiori', 'ABAP', 'Azure', 'SAP BTP'],
    business_objectives: 'Migrar ERP en 12 países, procesos en tiempo real, reducir TCO 30%',
    success_criteria: 'Migración sin downtime, data integridad 100%, 5000+ usuarios operando',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso masivo 41%', 'Overrun presupuestal 28%', 'Calidad de datos crítica', 'Consultores SAP insuficientes', 'Resistencia organizacional extrema'] 
    },
    ai_analysis: {
      schedule_variance: -41,
      cost_performance_index: 0.51,
      risk_factors: ['Datos legacy no limpios', 'Custom code incompatible', 'Falta consultores SAP S/4', 'Procesos de negocio no estandarizados', 'Cambio organizacional fallando'],
      recommendations: ['Reevaluar viabilidad del proyecto', 'Contratar Big4 consulting', 'Limpieza de datos masiva inmediata', 'Change management agresivo', 'Considerar go-live por fases países'],
      critical_issues: ['Migraciones de datos fallando 40%', 'Custom code sin migrar', 'Falta training usuarios', 'Testing integración inadecuado'],
      impact_if_not_resolved: 'Paralización operaciones en múltiples países, pérdidas $50M+, despidos masivos, cancelación proyecto'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Sistema de Trading Algorítmico',
    description: 'Plataforma de trading de alta frecuencia con AI para predicción de mercados',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-10-01',
    end_date: '2026-04-30',
    estimated_hours: 1600,
    actual_hours: 1380,
    budget: 1200000,
    progress: 40,
    client_name: 'Hedge Fund International',
    project_manager: 'Ricardo Salazar',
    team_size: 12,
    technology_stack: ['C++', 'Python', 'TensorFlow', 'Kafka', 'TimescaleDB', 'FPGA'],
    business_objectives: 'Latencia <1ms, backtesting con 10+ años data, ROI 200% año 1',
    success_criteria: 'Sistema operando 24/7, certificado por exchanges, performance 99.999%',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso 38%', 'Latencia no cumple objetivo', 'Modelos AI no rentables', 'Problemas regulatorios', 'Budget sobrepasado 25%'] 
    },
    ai_analysis: {
      schedule_variance: -38,
      cost_performance_index: 0.57,
      risk_factors: ['Latencia 10x objetivo', 'Modelos AI perdiendo dinero en backtesting', 'Cumplimiento regulatorio complejo', 'Falta expertos trading', 'Infrastructure inadecuada'],
      recommendations: ['Consultoría quant finance urgente', 'Rediseño arquitectura para ultra-low latency', 'Revisión exhaustiva modelos AI', 'Hardware especializado FPGA', 'Asesoría legal regulatoria'],
      critical_issues: ['Sistema no cumple requisitos de latencia', 'Algoritmos con pérdidas', 'No certificado por exchanges', 'Riesgos de compliance'],
      impact_if_not_resolved: 'Pérdidas trading estimadas $30M, multas regulatorias, proyecto inviable comercialmente'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Implementación Sistema de Control Industrial',
    description: 'Sistema SCADA para control de procesos industriales críticos',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-09-15',
    end_date: '2026-05-15',
    estimated_hours: 1900,
    actual_hours: 1620,
    budget: 1450000,
    progress: 39,
    client_name: 'Industria Petroquímica',
    project_manager: 'Ing. Alberto Gómez',
    team_size: 15,
    technology_stack: ['SCADA', 'PLC Siemens', 'OPC UA', 'C++', 'Real-time OS', 'Cybersecurity ICS'],
    business_objectives: 'Control remoto 24/7, reducir downtime 80%, predictive maintenance',
    success_criteria: 'Sistema certificado SIL 3, redundancia N+1, cybersecurity IEC 62443',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso crítico 35%', 'Certificaciones de seguridad pendientes', 'Testing de seguridad insuficiente', 'Vulnerabilidades críticas detectadas', 'Personal no certificado'] 
    },
    ai_analysis: {
      schedule_variance: -35,
      cost_performance_index: 0.59,
      risk_factors: ['Seguridad industrial comprometida', 'Falta personal certificado SIL', 'Integraciones PLCs fallando', 'Cybersecurity inadecuada', 'Testing en planta insuficiente'],
      recommendations: ['Pausa inmediata para auditoría de seguridad', 'Contratar expertos SIL urgente', 'Penetration testing exhaustivo', 'Certificación personal prioritaria', 'Plan de contingencia operacional'],
      critical_issues: ['Sistema no cumple SIL 3', '8 vulnerabilidades críticas detectadas', 'Redundancia no funcionando', 'Riesgo de accidentes industriales'],
      impact_if_not_resolved: 'Riesgo de explosión/accidente industrial, muertes potenciales, multas millonarias, cierre de planta'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Plataforma de Telemedicina Nacional',
    description: 'Plataforma nacional de telemedicina con videoconferencia y prescripción electrónica',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-08-15',
    end_date: '2026-04-15',
    estimated_hours: 1700,
    actual_hours: 1480,
    budget: 1100000,
    progress: 41,
    client_name: 'Ministerio de Salud',
    project_manager: 'Dra. Isabel Morales',
    team_size: 13,
    technology_stack: ['WebRTC', 'React', 'Node.js', 'MongoDB', 'Azure', 'HL7'],
    business_objectives: 'Atender 50k+ consultas/mes, cobertura rural, reducir costos 60%',
    success_criteria: 'Plataforma operativa 24/7, HIPAA compliant, integración con seguros',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso 34%', 'Problemas de privacidad de datos', 'Quality de video insuficiente', 'No cumple regulaciones médicas', 'Infraestructura de red inadecuada'] 
    },
    ai_analysis: {
      schedule_variance: -34,
      cost_performance_index: 0.61,
      risk_factors: ['Ancho de banda rural insuficiente', 'Privacidad datos pacientes en riesgo', 'Calidad video no médica', 'Falta integración sistemas salud', 'Compliance regulatorio pendiente'],
      recommendations: ['Auditoría de privacidad urgente', 'Inversión en CDN y edge computing', 'Certificación médica prioritaria', 'Plan de rollout por zonas', 'Reforzar infraestructura red'],
      critical_issues: ['Datos médicos no encriptados correctamente', 'Video lag >2seg inaceptable', 'No certificado para práctica médica', 'Fallas de autenticación'],
      impact_if_not_resolved: 'Demandas por mala praxis, filtración datos sensibles, multas millonarias, proyecto inviable legalmente'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Sistema de Blockchain para Supply Chain',
    description: 'Plataforma blockchain para trazabilidad de supply chain de alimentos',
    status: 'in_progress',
    priority: 'high',
    start_date: '2025-09-01',
    end_date: '2026-05-30',
    estimated_hours: 1500,
    actual_hours: 1320,
    budget: 950000,
    progress: 37,
    client_name: 'Agro Industrias S.A.',
    project_manager: 'Marco Antonio Luna',
    team_size: 10,
    technology_stack: ['Hyperledger Fabric', 'Go', 'React', 'CouchDB', 'IoT Sensors', 'Azure'],
    business_objectives: 'Trazabilidad 100%, reducir fraude, compliance regulatorio alimentos',
    success_criteria: 'Red blockchain operativa, 100+ participantes, integración IoT completa',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso 37%', 'Adopción de participantes <20%', 'Performance blockchain inadecuada', 'Complejidad técnica subestimada', 'ROI no demostrado'] 
    },
    ai_analysis: {
      schedule_variance: -37,
      cost_performance_index: 0.56,
      risk_factors: ['Resistencia de participantes', 'Performance de red insuficiente', 'Costo de infraestructura alto', 'Falta expertise blockchain', 'IoT integration compleja'],
      recommendations: ['Change management agresivo', 'Optimización de smart contracts', 'POC con grupo reducido', 'Consultores blockchain senior', 'Revisar viabilidad técnica y económica'],
      critical_issues: ['Solo 15% participantes adoptando', 'Throughput 10x menor a requerido', 'Costos operativos 3x estimado', 'Smart contracts con bugs'],
      impact_if_not_resolved: 'Proyecto sin adopción, $950k perdidos, objetivos de negocio no alcanzados, posible cancelación'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Sistema de Comando y Control Emergencias',
    description: 'Sistema integrado de comando y control para respuesta a emergencias urbanas',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-07-15',
    end_date: '2026-03-31',
    estimated_hours: 2100,
    actual_hours: 1890,
    budget: 1650000,
    progress: 35,
    client_name: 'Gobierno Municipal',
    project_manager: 'Cmdt. Rafael Ortiz',
    team_size: 18,
    technology_stack: ['GIS', 'Real-time data', 'IoT', 'React', 'Node.js', 'PostgreSQL', 'Radio IP'],
    business_objectives: 'Reducir tiempo respuesta 50%, coordinar 5+ agencias, salvaguardar vidas',
    success_criteria: 'Sistema operativo 24/7/365, integración 911, uptime 99.99%',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso crítico 42%', 'Integraciones multiagencia fallando', 'Sistema no confiable', 'Testing inadecuado', 'Falta coordinación entre agencias'] 
    },
    ai_analysis: {
      schedule_variance: -42,
      cost_performance_index: 0.53,
      risk_factors: ['Coordinación interagencial fallando', 'Sistemas legacy incompatibles', 'Falta de confiabilidad crítica', 'Training insuficiente', 'Políticas de gobernanza no definidas'],
      recommendations: ['Intervención de autoridades superiores', 'Rediseño arquitectura integración', 'Testing exhaustivo 24/7', 'Training masivo multiagencia', 'Pilot en zona controlada'],
      critical_issues: ['Sistema falla bajo carga', 'Comunicación entre agencias no funciona', 'GIS con datos desactualizados', 'No cumple estándares emergencia'],
      impact_if_not_resolved: 'Pérdida de vidas en emergencias, responsabilidad gubernamental, escándalo público, cancelación forzada'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  },
  {
    
    name: 'Migración Data Center a Cloud Híbrido',
    description: 'Migración completa de data center on-premise a arquitectura cloud híbrida',
    status: 'in_progress',
    priority: 'critical',
    start_date: '2025-08-01',
    end_date: '2026-05-31',
    estimated_hours: 2300,
    actual_hours: 1950,
    budget: 1900000,
    progress: 38,
    client_name: 'Corporación Financiera',
    project_manager: 'Sergio Mendoza',
    team_size: 22,
    technology_stack: ['Azure', 'AWS', 'VMware', 'Terraform', 'Ansible', 'VPN', 'SD-WAN'],
    business_objectives: 'Reducir CAPEX 40%, elasticidad, disaster recovery <1hora',
    success_criteria: 'Migración de 500+ servidores, zero downtime, compliance bancario',
    ai_risk_assessment: { 
      level: 'red', 
      reasons: ['Retraso masivo 39%', 'Migraciones fallando 30%', 'Costos cloud 40% sobre estimado', 'Downtime en migraciones', 'Falta expertise cloud'] 
    },
    ai_analysis: {
      schedule_variance: -39,
      cost_performance_index: 0.54,
      risk_factors: ['Aplicaciones no cloud-ready', 'Bandwidth insuficiente', 'Costos cloud subestimados', 'Equipo sin experiencia', 'Dependencies no mapeadas', 'Problemas de compliance'],
      recommendations: ['Assessment completo de aplicaciones', 'Refactorización aplicaciones críticas', 'Contratar arquitectos cloud senior', 'Revisar modelo de costos', 'Extender timeline 9 meses'],
      critical_issues: ['30% migraciones con rollback', 'Downtime promedio 4 horas por migración', 'Aplicaciones legacy no migrables', 'Costos operativos explotando'],
      impact_if_not_resolved: 'Pérdida de SLA con clientes, sobrecostos $800k+, posible retorno a on-premise, fracaso de iniciativa digital'
    },
    ai_last_analysis_date: new Date().toISOString(),
    ai_risk_level: 'red'
  }
];

/**
 * Función principal para actualizar los proyectos
 */
async function updateRiskProjects() {
  try {
    console.log('🚀 Iniciando actualización de proyectos con riesgos...\n');
    
    // Actualizar proyectos de riesgo AMARILLO
    console.log('🟡 Actualizando 10 proyectos con RIESGO AMARILLO...');
    
    for (const project of yellowRiskProjects) {
      // Verificar si el proyecto ya existe
      const { data: existing, error: checkError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('name', project.name)
        .maybeSingle();

      if (checkError) {
        console.error(`   ❌ Error verificando proyecto ${project.name}:`, checkError.message);
        continue;
      }

      if (existing) {
        // Actualizar proyecto existente
        const { error: updateError } = await supabase
          .from('projects')
          .update(project)
          .eq('name', project.name);

        if (updateError) {
          console.error(`   ❌ Error actualizando ${project.name}:`, updateError.message);
        } else {
          console.log(`   ✅ Actualizado: ${project.name}`);
        }
      } else {
        // Insertar nuevo proyecto
        const { error: insertError } = await supabase
          .from('projects')
          .insert([project]);

        if (insertError) {
          console.error(`   ❌ Error insertando ${project.name}:`, insertError.message);
        } else {
          console.log(`   ✅ Creado: ${project.name}`);
        }
      }
    }

    console.log('\n🔴 Actualizando 10 proyectos con RIESGO ROJO...');
    
    // Actualizar proyectos de riesgo ROJO
    for (const project of redRiskProjects) {
      // Verificar si el proyecto ya existe
      const { data: existing, error: checkError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('name', project.name)
        .maybeSingle();

      if (checkError) {
        console.error(`   ❌ Error verificando proyecto ${project.name}:`, checkError.message);
        continue;
      }

      if (existing) {
        // Actualizar proyecto existente
        const { error: updateError } = await supabase
          .from('projects')
          .update(project)
          .eq('name', project.name);

        if (updateError) {
          console.error(`   ❌ Error actualizando ${project.name}:`, updateError.message);
        } else {
          console.log(`   ✅ Actualizado: ${project.name}`);
        }
      } else {
        // Insertar nuevo proyecto
        const { error: insertError } = await supabase
          .from('projects')
          .insert([project]);

        if (insertError) {
          console.error(`   ❌ Error insertando ${project.name}:`, insertError.message);
        } else {
          console.log(`   ✅ Creado: ${project.name}`);
        }
      }
    }

    console.log('\n✅ Actualización completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   🟡 Proyectos Riesgo AMARILLO: ${yellowRiskProjects.length}`);
    console.log(`   🔴 Proyectos Riesgo ROJO: ${redRiskProjects.length}`);
    console.log(`   📈 Total proyectos actualizados: ${yellowRiskProjects.length + redRiskProjects.length}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso de actualización:', error);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  updateRiskProjects()
    .then(() => {
      console.log('\n🎉 Proceso completado con éxito');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { updateRiskProjects, yellowRiskProjects, redRiskProjects };
