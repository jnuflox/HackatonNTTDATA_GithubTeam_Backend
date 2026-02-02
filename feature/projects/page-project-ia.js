$(document).ready(function () {
    // ============================================
    // CONFIGURATION
    // ============================================
    
    // Set to true to use mock data, false to use real API
    const MOCKUP_MODE = false;
    
    // API endpoint (when not in mockup mode)
    const API_ENDPOINT = 'http://localhost:3000/api/projects';

    // ============================================
    // APPLICATION STATE
    // ============================================
    
    const appState = {
        projectId: null,
        project: null,
        currentTab: 'timeline'
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        // Get project ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        appState.projectId = urlParams.get('id');
        
        if (!appState.projectId) {
            showError('No se especificó un proyecto');
            return;
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Load project data
        loadProject();
    }

    function setupEventListeners() {
        // Tab switching
        $('.ia-tab-btn').on('click', function() {
            const tab = $(this).data('tab');
            switchTab(tab);
        });
    }

    // ============================================
    // DATA LOADING
    // ============================================
    
    async function loadProject() {
        showLoading(true);
        
        try {
            let project;
            
            if (MOCKUP_MODE) {
                // Use mock data
                if (typeof window.mockProjectsData === 'undefined') {
                    throw new Error('Mock data not loaded');
                }
                
                project = window.mockProjectsData.find(p => p.id === appState.projectId);
                
                if (!project) {
                    throw new Error('Proyecto no encontrado');
                }
                
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                // Real API call
                const response = await fetch(`${API_ENDPOINT}/${appState.projectId}`);
                
                if (!response.ok) {
                    throw new Error('Error al cargar el proyecto');
                }
                
                const result = await response.json();
                // Handle both formats: direct object or wrapped in {success, data}
                project = result.data || result;
            }
            
            if (!project) {
                throw new Error('No se recibieron datos del proyecto');
            }
            
            appState.project = project;
            renderProjectInfo(project);
            renderTimeline(project);
            renderAIAnalysis(project);
            
            showLoading(false);
            showContent();
            
        } catch (error) {
            console.error('Error loading project:', error);
            showLoading(false);
            showError(error.message || 'Error al cargar el proyecto');
        }
    }

    // ============================================
    // RENDERING
    // ============================================
    
    function renderProjectInfo(project) {
        if (!project) {
            console.error('No project data available');
            return;
        }
        
        // Safe access with defaults
        const code = project.code || project.project_code || 'N/A';
        const name = project.name || 'Sin nombre';
        const leader = project.leader || 'No asignado';
        const status = project.status || 'Activo';
        const actualProgress = project.actualProgress || project.actual_progress || 0;
        const plannedProgress = project.plannedProgress || project.planned_progress || 0;
        
        $('#breadcrumbProjectCode').text(code);
        $('#projectName').text(name);
        $('#projectCode').text(code);
        $('#projectLeader').text(leader);
        $('#projectStatus').text(status);
        $('#projectProgress').text(`${actualProgress.toFixed(1)}% (Planificado: ${plannedProgress.toFixed(1)}%)`);
    }

    function renderTimeline(project) {
        const container = $('#timelineContainer');
        
        if (!project || !project.history || project.history.length === 0) {
            container.html(`
                <div class="empty-timeline">
                    <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                    <div style="font-size: 16px; font-weight: 600;">Sin historial de cambios</div>
                    <div style="font-size: 14px; margin-top: 5px;">Este proyecto aún no tiene cambios registrados</div>
                </div>
            `);
            return;
        }
        
        let html = '<div class="timeline-wrapper">';
        
        project.history.forEach(entry => {
            html += `
                <div class="timeline-entry">
                    <div class="entry-timestamp">${formatDateTime(entry.date)}</div>
                    <div class="entry-title">${escapeHtml(entry.title)}</div>
                    <div class="entry-description">${escapeHtml(entry.description)}</div>
                    ${entry.reason ? `<div class="entry-note"><strong>Motivo:</strong> ${escapeHtml(entry.reason)}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        container.html(html);
    }

    function renderAIAnalysis(project) {
        const container = $('#aiAnalysisContainer');
        
        if (!project) {
            container.html(`
                <div class="empty-timeline">
                    <div style="font-size: 48px; margin-bottom: 15px;">🤖</div>
                    <div style="font-size: 16px; font-weight: 600;">Análisis no disponible</div>
                    <div style="font-size: 14px; margin-top: 5px;">No se pudo cargar el análisis de IA</div>
                </div>
            `);
            return;
        }
        
        // Default AI analysis structure
        const aiAnalysis = project.aiAnalysis || generateDefaultAIAnalysis(project);
        
        let html = '<div class="ai-analysis-wrapper">';
        
        // Section 1: Estado del Proyecto
        html += `
            <div class="ai-section">
                <div class="ai-section-header">
                    <span class="ai-section-icon">📊</span>
                    <h3 class="ai-section-title">Estado del Proyecto</h3>
                </div>
                <div class="ai-status">
                    ${escapeHtml(aiAnalysis.status)}
                </div>
            </div>
        `;
        
        // Section 2: Riesgos Identificados
        html += `
            <div class="ai-section">
                <div class="ai-section-header">
                    <span class="ai-section-icon">⚠️</span>
                    <h3 class="ai-section-title">Riesgos Identificados</h3>
                </div>
        `;
        
        if (aiAnalysis.risks && aiAnalysis.risks.length > 0) {
            html += '<ul class="ai-risks-list">';
            aiAnalysis.risks.forEach(risk => {
                const riskClass = risk.severity.toLowerCase();
                const riskIcon = riskClass === 'high' ? '🔴' : riskClass === 'medium' ? '🟡' : '🟢';
                
                html += `
                    <li class="ai-risk-item ${riskClass}">
                        <span class="ai-risk-icon">${riskIcon}</span>
                        <div class="ai-risk-content">
                            <div class="ai-risk-category">${escapeHtml(risk.category)}</div>
                            <div class="ai-risk-description">${escapeHtml(risk.description)}</div>
                        </div>
                    </li>
                `;
            });
            html += '</ul>';
        } else {
            html += '<p style="color: #64748b;">No se han identificado riesgos significativos.</p>';
        }
        
        html += '</div>';
        
        // Section 3: Plan de Acción Recomendado
        html += `
            <div class="ai-section">
                <div class="ai-section-header">
                    <span class="ai-section-icon">🎯</span>
                    <h3 class="ai-section-title">Plan de Acción Recomendado</h3>
                </div>
        `;
        
        if (aiAnalysis.actionPlan && aiAnalysis.actionPlan.length > 0) {
            html += '<ul class="ai-actions-list">';
            aiAnalysis.actionPlan.forEach(action => {
                html += `
                    <li class="ai-action-item">
                        <span class="ai-action-icon">✓</span>
                        <div class="ai-action-content">
                            <div class="ai-action-title">${escapeHtml(action.title)}</div>
                            <div class="ai-action-description">${escapeHtml(action.description)}</div>
                        </div>
                    </li>
                `;
            });
            html += '</ul>';
        } else {
            html += '<p style="color: #64748b;">No hay acciones recomendadas en este momento.</p>';
        }
        
        html += '</div>';
        
        // Section 4: Sugerencias de Mejora
        html += `
            <div class="ai-section">
                <div class="ai-section-header">
                    <span class="ai-section-icon">💡</span>
                    <h3 class="ai-section-title">Sugerencias de Mejora</h3>
                </div>
        `;
        
        if (aiAnalysis.improvements && aiAnalysis.improvements.length > 0) {
            html += '<ul class="ai-suggestions-list">';
            aiAnalysis.improvements.forEach(improvement => {
                html += `
                    <li class="ai-suggestion-item">
                        <div class="ai-suggestion-title">${escapeHtml(improvement.title)}</div>
                        <div class="ai-suggestion-description">${escapeHtml(improvement.description)}</div>
                    </li>
                `;
            });
            html += '</ul>';
        } else {
            html += '<p style="color: #64748b;">No hay sugerencias de mejora disponibles.</p>';
        }
        
        html += '</div>';
        html += '</div>';
        
        container.html(html);
    }

    // ============================================
    // AI ANALYSIS GENERATION
    // ============================================
    
    function generateDefaultAIAnalysis(project) {
        const deviation = project.actualProgress - project.plannedProgress;
        const deviationAbs = Math.abs(deviation);
        
        let status = '';
        let risks = [];
        let actionPlan = [];
        let improvements = [];
        
        // Determine status based on deviation
        if (deviationAbs <= 5) {
            status = `El proyecto "${project.name}" se encuentra en buen estado, con una desviación mínima del ${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%. El avance actual (${project.actualProgress.toFixed(1)}%) está alineado con lo planificado (${project.plannedProgress.toFixed(1)}%).`;
            
            risks.push({
                category: 'Riesgo Bajo',
                severity: 'low',
                description: 'El proyecto mantiene una trayectoria estable sin desviaciones significativas.'
            });
            
            improvements.push({
                title: 'Continuar con el ritmo actual',
                description: 'Mantener las prácticas actuales de gestión y seguimiento del proyecto.'
            });
        } else if (deviationAbs <= 10) {
            status = `El proyecto "${project.name}" presenta una desviación moderada del ${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%. Se requiere monitoreo continuo para ${deviation < 0 ? 'recuperar el retraso' : 'mantener el adelanto'}.`;
            
            if (deviation < 0) {
                risks.push({
                    category: 'Retraso en Cronograma',
                    severity: 'medium',
                    description: 'El proyecto está retrasado respecto a la planificación. Se recomienda revisión de recursos.'
                });
                
                actionPlan.push({
                    title: 'Revisión de recursos',
                    description: 'Evaluar la disponibilidad y asignación de recursos para acelerar el avance.'
                });
                
                actionPlan.push({
                    title: 'Reunión de seguimiento',
                    description: 'Organizar reuniones semanales de seguimiento con el equipo.'
                });
            } else {
                risks.push({
                    category: 'Adelanto en Cronograma',
                    severity: 'medium',
                    description: 'El proyecto está adelantado. Verificar la calidad de los entregables.'
                });
                
                actionPlan.push({
                    title: 'Revisión de calidad',
                    description: 'Asegurar que el adelanto no comprometa la calidad de los entregables.'
                });
            }
            
            improvements.push({
                title: 'Ajustar planificación',
                description: 'Revisar y ajustar los hitos futuros basándose en el avance actual.'
            });
        } else {
            status = `⚠️ El proyecto "${project.name}" presenta una desviación crítica del ${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%. Se requieren acciones correctivas inmediatas.`;
            
            if (deviation < 0) {
                risks.push({
                    category: 'Retraso Crítico',
                    severity: 'high',
                    description: 'El proyecto tiene un retraso significativo que puede impactar la fecha de entrega final.'
                });
                
                risks.push({
                    category: 'Sobrecostes Potenciales',
                    severity: 'high',
                    description: 'El retraso puede generar sobrecostes por extensión de recursos.'
                });
                
                actionPlan.push({
                    title: 'Plan de recuperación urgente',
                    description: 'Desarrollar un plan detallado para recuperar el retraso, incluyendo posible reasignación de recursos.'
                });
                
                actionPlan.push({
                    title: 'Escalamiento a dirección',
                    description: 'Informar a la dirección sobre el estado crítico y solicitar apoyo.'
                });
                
                actionPlan.push({
                    title: 'Revisión de alcance',
                    description: 'Considerar la reprioritización de funcionalidades para cumplir con los plazos críticos.'
                });
            } else {
                risks.push({
                    category: 'Adelanto Excesivo',
                    severity: 'high',
                    description: 'El adelanto excesivo puede indicar problemas en la estimación o calidad comprometida.'
                });
                
                actionPlan.push({
                    title: 'Auditoría de calidad',
                    description: 'Realizar una auditoría exhaustiva de los entregables completados.'
                });
                
                actionPlan.push({
                    title: 'Revisión de estimaciones',
                    description: 'Analizar las causas del adelanto para mejorar futuras estimaciones.'
                });
            }
            
            improvements.push({
                title: 'Replantear metodología',
                description: 'Revisar los procesos de planificación y seguimiento para prevenir desviaciones futuras.'
            });
            
            improvements.push({
                title: 'Capacitación del equipo',
                description: 'Considerar capacitación adicional en gestión de proyectos y estimación.'
            });
        }
        
        // Add general risks based on status
        if (project.status === 'En Pausa') {
            risks.push({
                category: 'Proyecto En Pausa',
                severity: 'high',
                description: 'El proyecto está pausado. Se requiere definir plan de reactivación.'
            });
            
            actionPlan.push({
                title: 'Plan de reactivación',
                description: 'Definir fecha y recursos necesarios para reactivar el proyecto.'
            });
        }
        
        return {
            status,
            risks,
            actionPlan,
            improvements
        };
    }

    // ============================================
    // TAB SWITCHING
    // ============================================
    
    function switchTab(tab) {
        appState.currentTab = tab;
        
        // Update tab buttons
        $('.ia-tab-btn').removeClass('active');
        $(`.ia-tab-btn[data-tab="${tab}"]`).addClass('active');
        
        // Update tab panels
        $('.ia-tab-panel').removeClass('active');
        $(`#panel${tab.charAt(0).toUpperCase() + tab.slice(1)}`).addClass('active');
    }

    // ============================================
    // UI STATE MANAGEMENT
    // ============================================
    
    function showLoading(show) {
        if (show) {
            $('#loadingState').show();
            $('#errorState').hide();
            $('#contentArea').hide();
        } else {
            $('#loadingState').hide();
        }
    }

    function showError(message) {
        $('#loadingState').hide();
        $('#contentArea').hide();
        $('#errorState').show();
        $('#errorState .error-message').text(message);
    }

    function showContent() {
        $('#loadingState').hide();
        $('#errorState').hide();
        $('#contentArea').show();
    }

    // ============================================
    // NAVIGATION
    // ============================================
    
    window.goBack = function() {
        window.location.href = 'page-projects.html';
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) {
            return '';
        }
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
    // START APPLICATION
    // ============================================
    
    init();
});
