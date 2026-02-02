$(document).ready(function () {
    // ============================================
    // CONFIGURATION
    // ============================================
    
    // Set to true to use mock data, false to use real API
    const MOCKUP_MODE = false;
    
    // API endpoints (when not in mockup mode)
    const API_ENDPOINTS = {
        getProject: 'http://localhost:3000/api/projects/:id',
        getTasks: 'http://localhost:3000/api/projects/:id/tasks'
    };

    // ============================================
    // APPLICATION STATE
    // ============================================
    
    const appState = {
        projectId: null,
        project: null,
        tasks: [],
        filteredTasks: [],
        filters: {
            taskCode: '',
            stage: '',
            milestone: '',
            status: '',
            responsible: '',
            riskLevel: ''
        }
    };

    // ============================================
    // URL PARAMETERS
    // ============================================
    
    function getProjectIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // ============================================
    // DATA LOADING
    // ============================================
    
    async function loadProjectData() {
        showLoading(true);
        
        try {
            appState.projectId = getProjectIdFromURL();
            
            if (!appState.projectId) {
                showError('No se especificó un ID de proyecto válido');
                return;
            }
            
            let projectData;
            
            if (MOCKUP_MODE) {
                // Use mock data
                projectData = await mockGetProjectById(appState.projectId);
            } else {
                // Call real API
                const response = await $.ajax({
                    url: API_ENDPOINTS.getProject.replace(':id', appState.projectId),
                    method: 'GET',
                    dataType: 'json'
                });
                projectData = response.data || response;
            }
            
            if (!projectData) {
                showError('No se encontró el proyecto solicitado');
                return;
            }
            
            appState.project = projectData;
            appState.tasks = projectData.tasks || [];
            
            renderProjectInfo();
            populateFilters();
            applyFilters();
            renderAIDashboard();
            renderFinancialAnalysis();
            
            // Show sections
            $('#projectInfoCard').show();
            $('#aiDashboard').show();
            $('#financialAnalysis').show();
            $('#taskFilters').show();
            $('#tasksSection').show();
            
        } catch (error) {
            console.error('Error loading project data:', error);
            showError('Error al cargar los datos del proyecto. Por favor, intente nuevamente.');
        } finally {
            showLoading(false);
        }
    }

    // ============================================
    // MOCK API FUNCTIONS
    // ============================================
    
    async function mockGetProjectById(projectId) {
        // Simulate network delay
        await delay(500);
        
        // Find project in mock data
        const project = window.mockProjectsData.find(p => p.id === projectId);
        
        if (!project) {
            return null;
        }
        
        return project;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================
    // RENDERING - PROJECT INFO
    // ============================================
    
    function renderProjectInfo() {
        const project = appState.project;
        
        if (!project) {
            console.error('No project data available');
            return;
        }
        
        // Update page title
        $('#projectTitle').text(project.name || 'Sin nombre');
        $('#breadcrumbCurrent').text(project.name || 'Sin nombre');
        document.title = `${project.name || 'Sin nombre'} - Detalle del Proyecto`;
        
        // Calculate deviation with safe defaults
        const actualProgress = project.actualProgress || 0;
        const plannedProgress = project.plannedProgress || 0;
        const deviation = actualProgress - plannedProgress;
        const deviationText = deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`;
        const deviationClass = Math.abs(deviation) <= 5 ? 'positive' : Math.abs(deviation) <= 10 ? 'neutral' : 'negative';
        
        // Status badge class
        const statusClass = getStatusClass(project.status || 'Activo');
        
        // Build info grid HTML
        const infoHTML = `
            <div class="project-info-item">
                <div class="project-info-label">Código</div>
                <div class="project-info-value">${escapeHtml(project.code)}</div>
            </div>
            <div class="project-info-item">
                <div class="project-info-label">Líder</div>
                <div class="project-info-value">${escapeHtml(project.leader)}</div>
            </div>
            <div class="project-info-item">
                <div class="project-info-label">Estado</div>
                <div class="project-info-value">
                    <span class="status-badge ${statusClass}">${escapeHtml(project.status)}</span>
                </div>
            </div>
            <div class="project-info-item">
                <div class="project-info-label">Periodo</div>
                <div class="project-info-value">${formatDate(project.startDate)} - ${formatDate(project.endDate)}</div>
            </div>
            <div class="project-info-item">
                <div class="project-info-label">Avance Real</div>
                <div class="project-info-value">${actualProgress.toFixed(1)}%</div>
            </div>
            <div class="project-info-item">
                <div class="project-info-label">Avance Planificado</div>
                <div class="project-info-value">${plannedProgress.toFixed(1)}%</div>
            </div>
            <div class="project-info-item">
                <div class="project-info-label">Desviación</div>
                <div class="project-info-value">
                    <span class="deviation-value ${deviationClass}">${deviationText}</span>
                </div>
            </div>
            ${project.managementSystem ? `
                <div class="project-info-item">
                    <div class="project-info-label">Sistema de Gestión</div>
                    <div class="project-info-value">
                        ${escapeHtml(project.managementSystem)}
                        ${project.managementPath ? `<br><a href="${escapeHtml(project.managementPath)}" target="_blank" class="project-info-link">🔗 Abrir en ${escapeHtml(project.managementSystem)}</a>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
        
        $('#projectInfoGrid').html(infoHTML);
    }

    // ============================================
    // RENDERING - AI DASHBOARD
    // ============================================
    
    function renderAIDashboard() {
        const tasks = appState.tasks;
        
        if (!tasks || tasks.length === 0) {
            $('#aiDashboard').hide();
            return;
        }
        
        // Calculate metrics
        const totalTasks = tasks.length;
        
        // Risk levels breakdown - with safe checks
        const riskBreakdown = {
            green: tasks.filter(t => t && t.aiRiskLevel === 'green').length,
            yellow: tasks.filter(t => t && t.aiRiskLevel === 'yellow').length,
            red: tasks.filter(t => t && t.aiRiskLevel === 'red').length
        };
        
        // Validation success rate - with safe checks
        const validatedTasks = tasks.filter(t => t && t.aiValidationStatus === 'OK').length;
        const validationRate = totalTasks > 0 ? ((validatedTasks / totalTasks) * 100).toFixed(1) : 0;
        
        // Critical deviations (>10%) - with safe checks
        const criticalDeviations = tasks.filter(t => t && t.deviation !== undefined && Math.abs(t.deviation) > 10).length;
        
        // Milestone distribution - with safe checks
        const milestones = {};
        tasks.forEach(task => {
            if (!task || !task.milestone) return;
            if (!milestones[task.milestone]) {
                milestones[task.milestone] = {
                    total: 0,
                    completed: 0
                };
            }
            milestones[task.milestone].total++;
            if (task.status === 'Completada') {
                milestones[task.milestone].completed++;
            }
        });
        
        // Build dashboard HTML
        const dashboardHTML = `
            <!-- Card 1: Risk Level Distribution -->
            <div class="ai-metric-card">
                <div class="ai-metric-header">
                    <div class="ai-metric-icon">🚦</div>
                </div>
                <div class="ai-metric-label">Distribución de Riesgos</div>
                <div class="ai-metric-value">${totalTasks}</div>
                <div class="ai-metric-subtitle">Tareas totales</div>
                <div class="ai-metric-breakdown">
                    <div class="ai-metric-item">
                        <div class="ai-metric-dot green"></div>
                        <span>${riskBreakdown.green} Bajo</span>
                    </div>
                    <div class="ai-metric-item">
                        <div class="ai-metric-dot yellow"></div>
                        <span>${riskBreakdown.yellow} Medio</span>
                    </div>
                    <div class="ai-metric-item">
                        <div class="ai-metric-dot red"></div>
                        <span>${riskBreakdown.red} Alto</span>
                    </div>
                </div>
            </div>
            
            <!-- Card 2: Validation Success Rate -->
            <div class="ai-metric-card">
                <div class="ai-metric-header">
                    <div class="ai-metric-icon">✅</div>
                </div>
                <div class="ai-metric-label">Validación IA Exitosa</div>
                <div class="ai-metric-value">${validationRate}%</div>
                <div class="ai-metric-subtitle">${validatedTasks} de ${totalTasks} tareas validadas</div>
            </div>
            
            <!-- Card 3: Critical Deviations -->
            <div class="ai-metric-card">
                <div class="ai-metric-header">
                    <div class="ai-metric-icon">⚠️</div>
                </div>
                <div class="ai-metric-label">Desviaciones Críticas</div>
                <div class="ai-metric-value">${criticalDeviations}</div>
                <div class="ai-metric-subtitle">Tareas con desviación >10%</div>
            </div>
            
            <!-- Card 4: Milestone Progress -->
            <div class="ai-metric-card">
                <div class="ai-metric-header">
                    <div class="ai-metric-icon">🎯</div>
                </div>
                <div class="ai-metric-label">Hitos del Proyecto</div>
                <div class="ai-metric-value">${Object.keys(milestones).length}</div>
                <div class="ai-metric-subtitle">Hitos totales</div>
            </div>
        `;
        
        $('#aiDashboardGrid').html(dashboardHTML);
    }

    // ============================================
    // RENDERING - FINANCIAL ANALYSIS
    // ============================================
    
    function renderFinancialAnalysis() {
        const project = appState.project;
        
        // Check if project and financial data exists
        if (!project || !project.financialSummary) {
            $('#financialAnalysis').hide();
            return;
        }
        
        const financial = project.financialSummary;
        const progressPercent = project.actualProgress || 0;
        const budgetPercent = financial.budgetConsumedPercent || 0;
        
        // Calculate financial risk
        const financialRisk = calculateFinancialRisks(progressPercent, budgetPercent, financial);
        
        // Build financial dashboard HTML
        const financialHTML = `
            <!-- Card 1: Budget vs Progress -->
            <div class="financial-card ${financialRisk.progressVsBudget.status}">
                <div class="financial-card-header">
                    <div>
                        <div class="financial-card-label">Progreso vs Presupuesto</div>
                        <div class="financial-alert-badge ${financialRisk.progressVsBudget.status}">
                            ${financialRisk.progressVsBudget.icon} ${financialRisk.progressVsBudget.label}
                        </div>
                    </div>
                    <div class="financial-card-icon">📊</div>
                </div>
                
                <div class="financial-gauge-container">
                    <div class="financial-gauge-bars">
                        <div class="financial-gauge-bar progress-bar" style="height: ${progressPercent}%;">
                            <div class="financial-gauge-label">Avance</div>
                            <div class="financial-gauge-value">${progressPercent.toFixed(1)}%</div>
                        </div>
                        <div class="financial-gauge-bar ${budgetPercent > progressPercent + 20 ? 'critical-bar' : 'budget-bar'}" style="height: ${budgetPercent}%;">
                            <div class="financial-gauge-label">Presupuesto</div>
                            <div class="financial-gauge-value">${budgetPercent.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
                
                <div class="financial-card-details">
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Presupuesto Total</span>
                        <span class="financial-detail-value">${formatCurrency(financial.budgetTotal)}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Presupuesto Consumido</span>
                        <span class="financial-detail-value">${formatCurrency(financial.budgetConsumed)}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Desviación</span>
                        <span class="financial-detail-value" style="color: ${financialRisk.progressVsBudget.status === 'danger' ? '#ef4444' : financialRisk.progressVsBudget.status === 'warning' ? '#f59e0b' : '#10b981'};">
                            ${financialRisk.progressVsBudget.deviation > 0 ? '+' : ''}${financialRisk.progressVsBudget.deviation.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Card 2: Invoicing Status -->
            <div class="financial-card ${financialRisk.invoicing.status}">
                <div class="financial-card-header">
                    <div>
                        <div class="financial-card-label">Estado de Facturación</div>
                        <div class="financial-alert-badge ${financialRisk.invoicing.status}">
                            ${financialRisk.invoicing.icon} ${financialRisk.invoicing.label}
                        </div>
                    </div>
                    <div class="financial-card-icon">💳</div>
                </div>
                
                <div class="financial-card-value">${financial.invoicesPaid}/${financial.invoicesTotal}</div>
                <div class="financial-card-subtitle">Facturas Pagadas</div>
                
                <div class="financial-card-details">
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Facturas Pagadas</span>
                        <span class="financial-detail-value" style="color: #10b981;">${financial.invoicesPaid}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Facturas Pendientes</span>
                        <span class="financial-detail-value" style="color: #ef4444;">${financial.invoicesPending}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Monto Pendiente</span>
                        <span class="financial-detail-value">${formatCurrency(financial.invoicesPendingAmount)}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">% Facturación Pagada</span>
                        <span class="financial-detail-value">${financialRisk.invoicing.paidPercent.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            <!-- Card 3: Milestones Status -->
            <div class="financial-card ${financialRisk.milestones.status}">
                <div class="financial-card-header">
                    <div>
                        <div class="financial-card-label">Hitos Aprobados</div>
                        <div class="financial-alert-badge ${financialRisk.milestones.status}">
                            ${financialRisk.milestones.icon} ${financialRisk.milestones.label}
                        </div>
                    </div>
                    <div class="financial-card-icon">🎯</div>
                </div>
                
                <div class="financial-card-value">${financial.milestonesApproved}/${financial.milestonesTotal}</div>
                <div class="financial-card-subtitle">Hitos Aprobados por Cliente</div>
                
                <div class="financial-card-details">
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Hitos Aprobados</span>
                        <span class="financial-detail-value" style="color: #10b981;">${financial.milestonesApproved}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">Hitos Pendientes</span>
                        <span class="financial-detail-value" style="color: #f59e0b;">${financial.milestonesPending}</span>
                    </div>
                    <div class="financial-detail-row">
                        <span class="financial-detail-label">% Aprobación</span>
                        <span class="financial-detail-value">${financialRisk.milestones.approvedPercent.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            <!-- Card 4: Overall Health -->
            <div class="financial-card ${financialRisk.overall.status}">
                <div class="financial-card-header">
                    <div>
                        <div class="financial-card-label">Salud Financiera</div>
                        <div class="financial-alert-badge ${financialRisk.overall.status}">
                            ${financialRisk.overall.icon} ${financialRisk.overall.label}
                        </div>
                    </div>
                    <div class="financial-card-icon">💰</div>
                </div>
                
                <div class="financial-card-value">${financialRisk.overall.score}/100</div>
                <div class="financial-card-subtitle">Índice de Salud</div>
                
                <div class="financial-card-details">
                    <div style="font-size: 13px; color: #64748b; line-height: 1.6;">
                        ${financialRisk.overall.message}
                    </div>
                </div>
            </div>
        `;
        
        $('#financialCardsGrid').html(financialHTML);
    }

    // ============================================
    // FINANCIAL RISK CALCULATION
    // ============================================
    
    function calculateFinancialRisks(progressPercent, budgetPercent, financial) {
        const deviation = budgetPercent - progressPercent;
        
        // 1. Progress vs Budget Risk
        let progressVsBudget = {
            deviation: deviation,
            status: 'success',
            label: 'SALUDABLE',
            icon: '✓'
        };
        
        if (deviation > 20) {
            progressVsBudget.status = 'danger';
            progressVsBudget.label = 'CRÍTICO';
            progressVsBudget.icon = '✕';
        } else if (deviation > 10) {
            progressVsBudget.status = 'warning';
            progressVsBudget.label = 'ALERTA';
            progressVsBudget.icon = '⚠';
        }
        
        // 2. Invoicing Risk
        const paidPercent = financial.invoicesTotal > 0 
            ? (financial.invoicesPaid / financial.invoicesTotal) * 100 
            : 0;
        
        let invoicing = {
            paidPercent: paidPercent,
            status: 'success',
            label: 'AL DÍA',
            icon: '✓'
        };
        
        if (paidPercent < 50) {
            invoicing.status = 'danger';
            invoicing.label = 'CRÍTICO';
            invoicing.icon = '✕';
        } else if (paidPercent < 75) {
            invoicing.status = 'warning';
            invoicing.label = 'PENDIENTE';
            invoicing.icon = '⚠';
        }
        
        // 3. Milestones Risk
        const approvedPercent = financial.milestonesTotal > 0 
            ? (financial.milestonesApproved / financial.milestonesTotal) * 100 
            : 0;
        
        let milestones = {
            approvedPercent: approvedPercent,
            status: 'success',
            label: 'EN PLAN',
            icon: '✓'
        };
        
        if (approvedPercent < 50 && progressPercent > 50) {
            milestones.status = 'danger';
            milestones.label = 'DESFASE';
            milestones.icon = '✕';
        } else if (approvedPercent < 75 && progressPercent > 75) {
            milestones.status = 'warning';
            milestones.label = 'RETRASO';
            milestones.icon = '⚠';
        }
        
        // 4. Overall Health Score (0-100)
        let healthScore = 100;
        
        // Budget deviation penalty
        if (deviation > 20) {
            healthScore -= 40;
        } else if (deviation > 10) {
            healthScore -= 20;
        } else if (deviation > 5) {
            healthScore -= 10;
        }
        
        // Invoicing penalty
        if (paidPercent < 50) {
            healthScore -= 30;
        } else if (paidPercent < 75) {
            healthScore -= 15;
        }
        
        // Milestones penalty
        if (approvedPercent < progressPercent - 20) {
            healthScore -= 30;
        } else if (approvedPercent < progressPercent - 10) {
            healthScore -= 15;
        }
        
        let overall = {
            score: Math.max(0, healthScore),
            status: 'success',
            label: 'EXCELENTE',
            icon: '✓',
            message: 'El proyecto muestra una salud financiera excelente con todos los indicadores en rango óptimo.'
        };
        
        if (healthScore < 50) {
            overall.status = 'danger';
            overall.label = 'CRÍTICO';
            overall.icon = '✕';
            overall.message = 'El proyecto presenta riesgos financieros críticos que requieren acción inmediata. Revisar consumo presupuestal, facturación y aprobación de hitos.';
        } else if (healthScore < 70) {
            overall.status = 'warning';
            overall.label = 'MODERADO';
            overall.icon = '⚠';
            overall.message = 'El proyecto muestra señales de alerta financiera. Se recomienda monitoreo cercano y acciones preventivas para evitar escalamiento de riesgos.';
        } else if (healthScore < 85) {
            overall.status = 'success';
            overall.label = 'BUENO';
            overall.icon = '✓';
            overall.message = 'El proyecto mantiene una salud financiera aceptable con algunos aspectos a mejorar. Continuar con seguimiento regular.';
        }
        
        return {
            progressVsBudget,
            invoicing,
            milestones,
            overall
        };
    }

    // ============================================
    // POPULATE FILTERS
    // ============================================
    
    function populateFilters() {
        const tasks = appState.tasks;
        
        if (!tasks || tasks.length === 0) {
            return;
        }
        
        // Get unique values
        const stages = [...new Set(tasks.map(t => t.stage))].sort();
        const milestones = [...new Set(tasks.map(t => t.milestone))].sort();
        const responsibles = [...new Set(tasks.map(t => t.responsible))].sort();
        
        // Populate Stage filter
        const stageSelect = $('#filterStage');
        stageSelect.find('option:not(:first)').remove();
        stages.forEach(stage => {
            stageSelect.append(`<option value="${escapeHtml(stage)}">${escapeHtml(stage)}</option>`);
        });
        
        // Populate Milestone filter
        const milestoneSelect = $('#filterMilestone');
        milestoneSelect.find('option:not(:first)').remove();
        milestones.forEach(milestone => {
            milestoneSelect.append(`<option value="${escapeHtml(milestone)}">${escapeHtml(milestone)}</option>`);
        });
        
        // Populate Responsible filter
        const responsibleSelect = $('#filterResponsible');
        responsibleSelect.find('option:not(:first)').remove();
        responsibles.forEach(responsible => {
            responsibleSelect.append(`<option value="${escapeHtml(responsible)}">${escapeHtml(responsible)}</option>`);
        });
    }

    // ============================================
    // FILTERING
    // ============================================
    
    function applyFilters() {
        const { taskCode, stage, milestone, status, responsible, riskLevel } = appState.filters;
        
        appState.filteredTasks = appState.tasks.filter(task => {
            // Filter by task code (partial match, case insensitive)
            if (taskCode && !task.taskCode.toLowerCase().includes(taskCode.toLowerCase())) {
                return false;
            }
            
            // Filter by stage (exact match)
            if (stage && task.stage !== stage) {
                return false;
            }
            
            // Filter by milestone (exact match)
            if (milestone && task.milestone !== milestone) {
                return false;
            }
            
            // Filter by status (exact match)
            if (status && task.status !== status) {
                return false;
            }
            
            // Filter by responsible (exact match)
            if (responsible && task.responsible !== responsible) {
                return false;
            }
            
            // Filter by risk level (exact match)
            if (riskLevel && task.aiRiskLevel !== riskLevel) {
                return false;
            }
            
            return true;
        });
        
        renderTasksTable();
    }

    // ============================================
    // RENDERING - TASKS TABLE
    // ============================================
    
    function renderTasksTable() {
        const tbody = $('#tasksTableBody');
        const emptyState = $('#emptyState');
        const tasksCount = $('#tasksCount');
        
        // Update count
        const count = appState.filteredTasks.length;
        tasksCount.text(`${count} tarea${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`);
        
        // Clear table
        tbody.empty();
        
        if (appState.filteredTasks.length === 0) {
            emptyState.show();
            return;
        }
        
        emptyState.hide();
        
        // Render each task
        appState.filteredTasks.forEach(task => {
            // Safe access to task properties
            if (!task) return;
            
            const statusClass = getStatusClass(task.status || 'Activo');
            const deviation = task.deviation || 0;
            const deviationClass = getDeviationClass(deviation);
            const deviationText = deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`;
            
            // Progress bar class
            const progressBarClass = Math.abs(deviation) > 10 ? 'danger' : Math.abs(deviation) > 5 ? 'warning' : '';
            
            // Risk level with safe defaults
            const aiRiskLevel = task.aiRiskLevel || 'green';
            const riskIcon = aiRiskLevel === 'green' ? '🟢' : aiRiskLevel === 'yellow' ? '🟡' : '🔴';
            const riskText = aiRiskLevel === 'green' ? 'Bajo' : aiRiskLevel === 'yellow' ? 'Medio' : 'Alto';
            const riskClass = aiRiskLevel;
            
            // Build tooltip content for AI risk reasons
            let tooltipContent = '';
            if (task.aiRiskReasons && task.aiRiskReasons.length > 0) {
                tooltipContent = `
                    <div class="tooltip-content">
                        <strong>Razones de Riesgo:</strong>
                        <ul>
                            ${task.aiRiskReasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            const actualProgress = task.actualProgress || 0;
            const plannedProgress = task.plannedProgress || 0;
            
            const row = `
                <tr>
                    <td><strong>${escapeHtml(task.taskCode)}</strong></td>
                    <td>${escapeHtml(task.taskName)}</td>
                    <td>${escapeHtml(task.stage)}</td>
                    <td>${escapeHtml(task.milestone)}</td>
                    <td>${formatDate(task.startDate)}</td>
                    <td>${formatDate(task.endDate)}</td>
                    <td><span class="status-badge ${statusClass}">${escapeHtml(task.status)}</span></td>
                    <td>
                        <div class="progress-bar-container">
                            <div class="progress-bar ${progressBarClass}" style="width: ${actualProgress}%">
                                ${actualProgress.toFixed(0)}%
                            </div>
                        </div>
                    </td>
                    <td>${plannedProgress.toFixed(1)}%</td>
                    <td>
                        <span class="deviation-value ${deviationClass}">${deviationText}</span>
                    </td>
                    <td>${escapeHtml(task.responsible)}</td>
                    <td style="text-align: center;">
                        ${renderValidationSemaphore(task)}
                    </td>
                    <td>
                        ${renderRiskSemaphore(task)}
                    </td>
                </tr>
            `;
            
            tbody.append(row);
        });
    }

    // ============================================
    // VALIDATION SEMAPHORE RENDERING
    // ============================================
    
    function renderValidationSemaphore(task) {
        // Check if aiValidationDetails exists
        if (!task.aiValidationDetails) {
            return '<span class="validation-badge warning">⚠ Sin Datos</span>';
        }
        
        // Count total and completed validations
        let totalValidations = 0;
        let completedValidations = 0;
        
        ['gitlab', 'sonarqube', 'jira'].forEach(source => {
            if (task.aiValidationDetails[source]) {
                task.aiValidationDetails[source].forEach(validation => {
                    totalValidations++;
                    if (validation.status === 'complete') {
                        completedValidations++;
                    }
                });
            }
        });
        
        // Calculate percentage
        const percentage = totalValidations > 0 ? (completedValidations / totalValidations) * 100 : 0;
        
        // Determine status color
        let statusClass = 'status-red';
        if (percentage >= 90) {
            statusClass = 'status-green';
        } else if (percentage >= 70) {
            statusClass = 'status-yellow';
        }
        
        // Return semaphore HTML
        return `
            <div class="ai-validation-semaphore ${statusClass}" 
                 data-task-code="${escapeHtml(task.taskCode)}"
                 onclick="showAIValidationModal('${escapeHtml(task.taskCode)}');"
                 title="Click para ver detalle de validaciones IA">
                <div class="ai-validation-score">
                    <span class="ai-validation-score-value">${completedValidations}/${totalValidations}</span>
                    <span class="ai-validation-score-total">${percentage.toFixed(0)}%</span>
                </div>
            </div>
        `;
    }
    
    function renderRiskSemaphore(task) {
        const riskIcon = task.aiRiskLevel === 'green' ? '🟢' : task.aiRiskLevel === 'yellow' ? '🟡' : '🔴';
        const riskText = task.aiRiskLevel === 'green' ? 'Bajo' : task.aiRiskLevel === 'yellow' ? 'Medio' : 'Alto';
        const riskClass = task.aiRiskLevel;
        
        return `
            <div class="risk-semaphore-clickable ${riskClass}" 
                 data-task-code="${escapeHtml(task.taskCode)}"
                 onclick="showAIValidationModal('${escapeHtml(task.taskCode)}');"
                 title="Click para ver detalle de riesgos">
                <span class="risk-icon">${riskIcon}</span>
                <span>${riskText}</span>
            </div>
        `;
    }
    
    // OLD FUNCTION - Keeping for backward compatibility if needed
    function renderValidationBadges(task) {
        let html = '';
        
        // Overall validation status
        if (task.aiValidationStatus === 'OK') {
            html += '<span class="validation-badge ok">✓ OK</span>';
        } else if (task.aiValidationStatus === 'Warning') {
            html += '<span class="validation-badge warning">⚠ Warning</span>';
        } else if (task.aiValidationStatus === 'Error') {
            html += '<span class="validation-badge error">✕ Error</span>';
        }
        
        // GitLab status
        if (task.gitlabStatus) {
            if (task.gitlabStatus === 'OK') {
                html += '<span class="validation-badge ok" title="GitLab: Código encontrado">🔗 Git</span>';
            } else if (task.gitlabStatus === 'Warning') {
                html += '<span class="validation-badge warning" title="GitLab: Código incompleto">🔗 Git</span>';
            } else {
                html += '<span class="validation-badge error" title="GitLab: Sin código">🔗 Git</span>';
            }
        }
        
        // Sonar status
        if (task.sonarStatus) {
            if (task.sonarStatus === 'OK') {
                html += '<span class="validation-badge ok" title="SonarQube: Coverage OK">📊 Sonar</span>';
            } else if (task.sonarStatus === 'Warning') {
                html += '<span class="validation-badge warning" title="SonarQube: Coverage bajo">📊 Sonar</span>';
            } else {
                html += '<span class="validation-badge error" title="SonarQube: Sin análisis">📊 Sonar</span>';
            }
        }
        
        return html;
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function getStatusClass(status) {
        const statusMap = {
            'Pendiente': 'pendiente',
            'En Progreso': 'en-progreso',
            'Completada': 'completada',
            'Bloqueada': 'bloqueada',
            'Activo': 'en-progreso',
            'En Pausa': 'bloqueada',
            'Completado': 'completada',
            'Cancelado': 'bloqueada'
        };
        return statusMap[status] || 'pendiente';
    }

    function getDeviationClass(deviation) {
        if (deviation > 0) return 'positive';
        if (deviation < 0) return 'negative';
        return 'neutral';
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatCurrency(amount) {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // ============================================
    // UI HELPER FUNCTIONS
    // ============================================
    
    function showLoading(show) {
        const loadingState = $('#loadingState');
        const sections = $('#projectInfoCard, #aiDashboard, #financialAnalysis, #taskFilters, #tasksSection');
        
        if (show) {
            loadingState.addClass('active');
            sections.hide();
        } else {
            loadingState.removeClass('active');
        }
    }

    function showError(message) {
        const alertHTML = `
            <div class="detail-alert detail-alert-error">
                ✕ ${message}
            </div>
        `;
        $('#alertContainer').html(alertHTML);
    }

    // ============================================
    // AI VALIDATION MODAL
    // ============================================
    
    window.showAIValidationModal = function(taskCode) {
        // Find the task
        const task = appState.tasks.find(t => t.taskCode === taskCode);
        
        if (!task) {
            console.error('Task not found:', taskCode);
            return;
        }
        
        // Update modal title
        $('#aiModalTitle').text(`Validación IA - ${task.taskCode}`);
        $('#aiModalSubtitle').html(`
            🤖 Análisis automático de GitLab, SonarQube y Jira | 
            <strong>${escapeHtml(task.taskName)}</strong>
        `);
        
        // Generate modal content
        const modalContent = generateAIValidationModalContent(task);
        $('#aiModalBody').html(modalContent);
        
        // Show modal
        $('#aiValidationModal').addClass('active');
        
        // Prevent body scroll
        $('body').css('overflow', 'hidden');
    };
    
    window.closeAIValidationModal = function() {
        $('#aiValidationModal').removeClass('active');
        $('body').css('overflow', '');
    };
    
    function generateAIValidationModalContent(task) {
        if (!task.aiValidationDetails) {
            return `
                <div class="ai-modal-empty">
                    <div class="ai-modal-empty-icon">📊</div>
                    <div class="ai-modal-empty-title">Sin Datos de Validación</div>
                    <div class="ai-modal-empty-text">No hay información de validación IA disponible para esta tarea</div>
                </div>
            `;
        }
        
        // Calculate summary metrics
        let totalValidations = 0;
        let completedValidations = 0;
        let gitlabTotal = 0, gitlabComplete = 0;
        let sonarTotal = 0, sonarComplete = 0;
        let jiraTotal = 0, jiraComplete = 0;
        
        if (task.aiValidationDetails.gitlab) {
            task.aiValidationDetails.gitlab.forEach(v => {
                gitlabTotal++;
                if (v.status === 'complete') gitlabComplete++;
            });
        }
        
        if (task.aiValidationDetails.sonarqube) {
            task.aiValidationDetails.sonarqube.forEach(v => {
                sonarTotal++;
                if (v.status === 'complete') sonarComplete++;
            });
        }
        
        if (task.aiValidationDetails.jira) {
            task.aiValidationDetails.jira.forEach(v => {
                jiraTotal++;
                if (v.status === 'complete') jiraComplete++;
            });
        }
        
        totalValidations = gitlabTotal + sonarTotal + jiraTotal;
        completedValidations = gitlabComplete + sonarComplete + jiraComplete;
        
        const percentage = totalValidations > 0 ? (completedValidations / totalValidations) * 100 : 0;
        const percentageClass = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red';
        
        // Build HTML
        let html = `
            <!-- Summary -->
            <div class="ai-validation-summary">
                <div class="ai-summary-metric">
                    <div class="ai-summary-metric-value ${percentageClass}">${percentage.toFixed(0)}%</div>
                    <div class="ai-summary-metric-label">Score General</div>
                </div>
                <div class="ai-summary-metric">
                    <div class="ai-summary-metric-value">${completedValidations}/${totalValidations}</div>
                    <div class="ai-summary-metric-label">Validaciones Completas</div>
                </div>
                <div class="ai-summary-metric">
                    <div class="ai-summary-metric-value ${gitlabComplete === gitlabTotal ? 'green' : 'red'}">${gitlabComplete}/${gitlabTotal}</div>
                    <div class="ai-summary-metric-label">GitLab</div>
                </div>
                <div class="ai-summary-metric">
                    <div class="ai-summary-metric-value ${sonarComplete === sonarTotal ? 'green' : 'red'}">${sonarComplete}/${sonarTotal}</div>
                    <div class="ai-summary-metric-label">SonarQube</div>
                </div>
                <div class="ai-summary-metric">
                    <div class="ai-summary-metric-value ${jiraComplete === jiraTotal ? 'green' : 'red'}">${jiraComplete}/${jiraTotal}</div>
                    <div class="ai-summary-metric-label">Jira</div>
                </div>
            </div>
        `;
        
        // GitLab Section
        if (task.aiValidationDetails.gitlab && task.aiValidationDetails.gitlab.length > 0) {
            html += `
                <div class="ai-validation-section">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">🔗</span>
                        <h3 class="ai-section-title">GitLab - Control de Versiones</h3>
                        <span class="ai-section-badge gitlab">GitLab</span>
                    </div>
                    <div class="ai-validation-cards">
                        ${task.aiValidationDetails.gitlab.map(validation => `
                            <div class="ai-validation-card ${validation.status}">
                                <div class="ai-card-header">
                                    <div class="ai-card-name">${escapeHtml(validation.name)}</div>
                                    <span class="ai-card-status-badge ${validation.status}">
                                        ${validation.status === 'complete' ? '✓ Completa' : '✕ Incompleta'}
                                    </span>
                                </div>
                                <div class="ai-card-summary">${escapeHtml(validation.aiSummary)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // SonarQube Section
        if (task.aiValidationDetails.sonarqube && task.aiValidationDetails.sonarqube.length > 0) {
            html += `
                <div class="ai-validation-section">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">📊</span>
                        <h3 class="ai-section-title">SonarQube - Calidad de Código</h3>
                        <span class="ai-section-badge sonarqube">SonarQube</span>
                    </div>
                    <div class="ai-validation-cards">
                        ${task.aiValidationDetails.sonarqube.map(validation => `
                            <div class="ai-validation-card ${validation.status}">
                                <div class="ai-card-header">
                                    <div class="ai-card-name">${escapeHtml(validation.name)}</div>
                                    <span class="ai-card-status-badge ${validation.status}">
                                        ${validation.status === 'complete' ? '✓ Completa' : '✕ Incompleta'}
                                    </span>
                                </div>
                                <div class="ai-card-summary">${escapeHtml(validation.aiSummary)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Jira Section
        if (task.aiValidationDetails.jira && task.aiValidationDetails.jira.length > 0) {
            html += `
                <div class="ai-validation-section">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">📋</span>
                        <h3 class="ai-section-title">Jira - Gestión de Proyecto</h3>
                        <span class="ai-section-badge jira">Jira</span>
                    </div>
                    <div class="ai-validation-cards">
                        ${task.aiValidationDetails.jira.map(validation => `
                            <div class="ai-validation-card ${validation.status}">
                                <div class="ai-card-header">
                                    <div class="ai-card-name">${escapeHtml(validation.name)}</div>
                                    <span class="ai-card-status-badge ${validation.status}">
                                        ${validation.status === 'complete' ? '✓ Completa' : '✕ Incompleta'}
                                    </span>
                                </div>
                                <div class="ai-card-summary">${escapeHtml(validation.aiSummary)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    // ============================================
    // NAVIGATION - BIDIRECTIONAL
    // ============================================
    
    function navigateBackToProjects() {
        // Restore saved filters and scroll position
        window.location.href = 'page-projects.html';
    }

    // Save current filters before leaving (when coming from projects page)
    function saveProjectsState() {
        // This would be called from page-projects.js before navigation
        // Here we just handle the restoration
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    // Back button
    $('#btnBack, #breadcrumbLink').on('click', function(e) {
        e.preventDefault();
        navigateBackToProjects();
    });

    // Apply filters button
    $('#btnApplyFilters').on('click', function() {
        appState.filters.taskCode = $('#filterTaskCode').val().trim();
        appState.filters.stage = $('#filterStage').val();
        appState.filters.milestone = $('#filterMilestone').val();
        appState.filters.status = $('#filterStatus').val();
        appState.filters.responsible = $('#filterResponsible').val();
        appState.filters.riskLevel = $('#filterRiskLevel').val();
        
        applyFilters();
    });

    // Clear filters button
    $('#btnClearFilters').on('click', function() {
        $('#filterTaskCode').val('');
        $('#filterStage').val('');
        $('#filterMilestone').val('');
        $('#filterStatus').val('');
        $('#filterResponsible').val('');
        $('#filterRiskLevel').val('');
        
        appState.filters = {
            taskCode: '',
            stage: '',
            milestone: '',
            status: '',
            responsible: '',
            riskLevel: ''
        };
        
        applyFilters();
    });

    // Enter key in filter inputs
    $('.task-input, .task-select').on('keypress', function(e) {
        if (e.which === 13) {
            $('#btnApplyFilters').click();
        }
    });

    // ============================================
    // MODAL EVENT LISTENERS
    // ============================================
    
    // Close modal button
    $('#aiModalClose').on('click', function() {
        closeAIValidationModal();
    });
    
    // Close modal when clicking outside
    $('#aiValidationModal').on('click', function(e) {
        if ($(e.target).hasClass('ai-modal-overlay')) {
            closeAIValidationModal();
        }
    });
    
    // Close modal with Escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#aiValidationModal').hasClass('active')) {
            closeAIValidationModal();
        }
    });

    // ============================================
    // INITIALIZATION
    // ============================================
    
    // Load project data on page load
    loadProjectData();
});
