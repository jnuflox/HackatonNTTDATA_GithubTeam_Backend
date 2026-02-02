$(document).ready(function () {
    // ============================================
    // CONFIGURATION
    // ============================================
    
    // Set to true to use mock data, false to use real API
    const MOCKUP_MODE = false;
    
    // API endpoints (when not in mockup mode)
    const API_ENDPOINTS = {
        list: 'http://localhost:3000/api/projects',
        create: 'http://localhost:3000/api/projects',
        update: 'http://localhost:3000/api/projects',
        delete: 'http://localhost:3000/api/projects'
    };

    // ============================================
    // APPLICATION STATE
    // ============================================
    
    const appState = {
        projects: [],           // All projects from API
        filteredProjects: [],   // Projects after applying filters
        currentProject: null,   // Project being edited
        filters: {
            code: '',
            status: '',
            startDate: '',
            endDate: '',
            deviation: ''       // NEW: Deviation filter
        }
    };

    // ============================================
    // DEVIATION CALCULATION (ITIL/PMP Standards)
    // ============================================
    
    /**
     * Calculate deviation and return status based on ITIL/PMP standards
     * Green (≤5%): On track
     * Yellow (5-10%): Minor deviation, monitoring required
     * Red (>10%): Critical deviation, corrective action needed
     */
    function calculateDeviationStatus(plannedProgress, actualProgress) {
        const deviation = actualProgress - plannedProgress;
        const deviationAbs = Math.abs(deviation);
        
        let status = 'green';
        let icon = '🟢';
        
        if (deviationAbs > 10) {
            status = 'red';
            icon = '🔴';
        } else if (deviationAbs > 5) {
            status = 'yellow';
            icon = '🟡';
        }
        
        return {
            deviation: deviation,
            deviationAbs: deviationAbs,
            status: status,
            icon: icon
        };
    }

    // ============================================
    // DATA LOADING
    // ============================================
    
    async function loadProjects() {
        showLoading(true);
        
        try {
            let projects;
            
            if (MOCKUP_MODE) {
                // Use mock data
                projects = await mockGetProjects();
            } else {
                // Call real API
                const response = await $.ajax({
                    url: API_ENDPOINTS.list,
                    method: 'GET',
                    dataType: 'json'
                });
                projects = response.data || response;
            }
            
            appState.projects = projects;
            applyFilters();
            
        } catch (error) {
            console.error('Error loading projects:', error);
            showAlert('error', 'Error al cargar los proyectos. Por favor, intente nuevamente.');
            appState.projects = [];
            appState.filteredProjects = [];
            renderProjectsList();
        } finally {
            showLoading(false);
        }
    }

    // ============================================
    // FILTERING
    // ============================================
    
    function applyFilters() {
        const { code, status, startDate, endDate, deviation } = appState.filters;
        
        appState.filteredProjects = appState.projects.filter(project => {
            // Filter by code (partial match, case insensitive)
            if (code && !project.code.toLowerCase().includes(code.toLowerCase())) {
                return false;
            }
            
            // Filter by status (exact match)
            if (status && project.status !== status) {
                return false;
            }
            
            // Filter by date range (overlapping dates)
            if (startDate || endDate) {
                const projectStart = new Date(project.startDate);
                const projectEnd = new Date(project.endDate);
                
                // Check if project date range overlaps with filter date range
                if (startDate) {
                    const filterStart = new Date(startDate);
                    // Project must end after or on filter start date
                    if (projectEnd < filterStart) {
                        return false;
                    }
                }
                
                if (endDate) {
                    const filterEnd = new Date(endDate);
                    // Project must start before or on filter end date
                    if (projectStart > filterEnd) {
                        return false;
                    }
                }
            }
            
            // Filter by deviation level (NEW)
            if (deviation) {
                const deviationCalc = calculateDeviationStatus(project.plannedProgress, project.actualProgress);
                const deviationAbs = deviationCalc.deviationAbs;
                
                if (deviation === 'on-track' && deviationAbs > 5) {
                    return false;
                }
                if (deviation === 'at-risk' && (deviationAbs <= 5 || deviationAbs > 10)) {
                    return false;
                }
                if (deviation === 'critical' && deviationAbs <= 10) {
                    return false;
                }
            }
            
            return true;
        });
        
        renderProjectsList();
    }

    // ============================================
    // RENDERING
    // ============================================
    
    function renderProjectsList() {
        const tbody = $('#projectsTableBody');
        const emptyState = $('#emptyState');
        const tableContainer = $('#tableContainer');
        const resultsCount = $('#resultsCount');
        
        // Update results count
        const count = appState.filteredProjects.length;
        resultsCount.text(`${count} proyecto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`);
        
        // Clear table
        tbody.empty();
        
        if (appState.filteredProjects.length === 0) {
            tableContainer.hide();
            emptyState.show();
            return;
        }
        
        tableContainer.show();
        emptyState.hide();
        
        // Render each project
        appState.filteredProjects.forEach(project => {
            // Safe access to project properties with defaults
            if (!project) return;
            
            const plannedProgress = project.plannedProgress || project.planned_progress || 0;
            const actualProgress = project.actualProgress || project.actual_progress || 0;
            const deviation = calculateDeviationStatus(plannedProgress, actualProgress);
            const statusClass = `project-status-${(project.status || 'activo').toLowerCase().replace(/\s+/g, '-')}`;
            
            const row = `
                <tr>
                    <td>
                        <strong>${escapeHtml(project.code)}</strong>
                        ${project.managementPath ? `<br><a href="${escapeHtml(project.managementPath)}" target="_blank" style="font-size: 11px; color: #667eea; text-decoration: none;" title="${escapeHtml(project.managementSystem)}: ${escapeHtml(project.managementPath)}">🔗 ${escapeHtml(project.managementSystem || 'Abrir')}</a>` : ''}
                    </td>
                    <td>${escapeHtml(project.name)}</td>
                    <td><span class="project-status-badge ${statusClass}">${escapeHtml(project.status)}</span></td>
                    <td>${escapeHtml(project.leader)}</td>
                    <td>${formatDate(project.startDate || project.start_date)}</td>
                    <td>${formatDate(project.endDate || project.end_date)}</td>
                    <td>${plannedProgress.toFixed(1)}%</td>
                    <td>${actualProgress.toFixed(1)}%</td>
                    <td>
                        <div class="project-deviation">
                            <span class="project-deviation-icon">${deviation.icon}</span>
                            <span class="project-deviation-value">${deviation.deviation > 0 ? '+' : ''}${deviation.deviation.toFixed(1)}%</span>
                        </div>
                    </td>
                    <td>
                        <div class="project-actions">
                            <button class="project-btn project-btn-primary project-btn-icon" onclick="openAIAnalysis('${project.id}')" title="Historial y Análisis IA">
                                🤖 IA
                            </button>
                            <button class="project-btn project-btn-primary project-btn-icon" onclick="viewProjectDetail('${project.id}')" title="Ver detalle de tareas">
                                👁️ Detalle
                            </button>
                            <button class="project-btn project-btn-primary project-btn-icon" onclick="editProject('${project.id}')" title="Configurar proyecto">
                                ⚙️ Configuración
                            </button>
                            <button class="project-btn project-btn-danger project-btn-icon" onclick="deleteProject('${project.id}')" title="Eliminar proyecto">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            tbody.append(row);
        });
    }

    // ============================================
    // MODAL TABS RENDERING (NEW)
    // ============================================
    
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
                    <div style="font-size: 14px; margin-top: 5px;">Crea el proyecto para ver el análisis de IA</div>
                </div>
            `);
            return;
        }
        
        const deviation = calculateDeviationStatus(project.plannedProgress, project.actualProgress);
        const aiData = project.aiAnalysis || generateAIAnalysis(project, deviation);
        
        let html = `
            <!-- Estado General -->
            <div class="ai-block">
                <div class="ai-block-header">
                    <span class="ai-icon-badge">📊</span>
                    <h3 class="ai-block-label">Estado del Proyecto</h3>
                </div>
                <div class="ai-block-body">
                    <p class="ai-paragraph">${aiData.status}</p>
                </div>
            </div>
            
            <!-- Riesgos Identificados -->
            <div class="ai-block">
                <div class="ai-block-header">
                    <span class="ai-icon-badge">⚠️</span>
                    <h3 class="ai-block-label">Riesgos Identificados</h3>
                </div>
                <div class="ai-block-body">
                    <ul class="ai-item-list">
        `;
        
        aiData.risks.forEach(risk => {
            html += `<li><span class="${risk.level}">${risk.label}</span>: ${risk.text}</li>`;
        });
        
        html += `
                    </ul>
                </div>
            </div>
            
            <!-- Planes de Acción -->
            <div class="ai-block">
                <div class="ai-block-header">
                    <span class="ai-icon-badge">⚙️</span>
                    <h3 class="ai-block-label">Planes de Acción Recomendados</h3>
                </div>
                <div class="ai-block-body">
                    <ul class="ai-item-list">
        `;
        
        aiData.actions.forEach(action => {
            html += `<li>${action}</li>`;
        });
        
        html += `
                    </ul>
                </div>
            </div>
            
            <!-- Sugerencias -->
            <div class="ai-block">
                <div class="ai-block-header">
                    <span class="ai-icon-badge">💡</span>
                    <h3 class="ai-block-label">Sugerencias de Mejora</h3>
                </div>
                <div class="ai-block-body">
                    <ul class="ai-item-list">
        `;
        
        aiData.suggestions.forEach(suggestion => {
            html += `<li>${suggestion}</li>`;
        });
        
        html += `
                    </ul>
                </div>
            </div>
        `;
        
        container.html(html);
    }
    
    function generateAIAnalysis(project, deviation) {
        let status = '';
        let risks = [];
        let actions = [];
        let suggestions = [];
        
        // Generar estado basado en la desviación
        if (deviation.status === 'green') {
            status = `El proyecto "${project.name}" se encuentra en buen estado con una desviación de ${deviation.deviation > 0 ? '+' : ''}${deviation.deviation.toFixed(1)}%. El avance está alineado con la planificación establecida y no se identifican problemas críticos en este momento.`;
        } else if (deviation.status === 'yellow') {
            status = `El proyecto "${project.name}" presenta una desviación moderada de ${deviation.deviation > 0 ? '+' : ''}${deviation.deviation.toFixed(1)}%. Se requiere monitoreo cercano para evitar que la situación empeore. Es momento de revisar los procesos actuales.`;
        } else {
            status = `El proyecto "${project.name}" está en estado crítico con una desviación significativa de ${deviation.deviation > 0 ? '+' : ''}${deviation.deviation.toFixed(1)}%. Se requiere acción inmediata para reconducir el proyecto y evitar mayores impactos.`;
        }
        
        // Generar riesgos
        if (deviation.deviation < -10) {
            risks.push({ level: 'risk-badge-high', label: 'ALTO', text: 'Retraso crítico en el cronograma que puede comprometer las fechas de entrega' });
            risks.push({ level: 'risk-badge-high', label: 'ALTO', text: 'Posible pérdida de confianza del cliente o stakeholders' });
            risks.push({ level: 'risk-badge-medium', label: 'MEDIO', text: 'Necesidad potencial de recursos adicionales no planificados' });
        } else if (deviation.deviation < -5) {
            risks.push({ level: 'risk-badge-medium', label: 'MEDIO', text: 'Desviación en el cronograma que requiere atención' });
            risks.push({ level: 'risk-badge-low', label: 'BAJO', text: 'Posible necesidad de reprogramación de actividades' });
        } else if (deviation.deviation > 10) {
            risks.push({ level: 'risk-badge-medium', label: 'MEDIO', text: 'Avance acelerado puede indicar subestimación de tareas' });
            risks.push({ level: 'risk-badge-medium', label: 'MEDIO', text: 'Posible sobreasignación de recursos afectando otros proyectos' });
        } else if (deviation.deviation > 5) {
            risks.push({ level: 'risk-badge-low', label: 'BAJO', text: 'Avance superior al planificado - validar calidad de entregables' });
        } else {
            risks.push({ level: 'risk-badge-low', label: 'BAJO', text: 'No se identifican riesgos críticos en este momento' });
        }
        
        // Estado del proyecto
        if (project.status === 'En Pausa') {
            risks.push({ level: 'risk-badge-high', label: 'ALTO', text: 'Proyecto en pausa - riesgo de pérdida de contexto del equipo' });
        } else if (project.status === 'Cancelado') {
            risks.push({ level: 'risk-badge-high', label: 'ALTO', text: 'Proyecto cancelado - evaluar lecciones aprendidas' });
        }
        
        // Generar acciones
        if (deviation.status === 'red') {
            actions.push('Convocar reunión de emergencia con el equipo de proyecto y stakeholders clave');
            actions.push('Realizar análisis de causa raíz para identificar los factores de la desviación');
            actions.push('Desarrollar plan de recuperación con hitos claros y responsables definidos');
            actions.push('Considerar reasignación de recursos o ajuste de alcance si es necesario');
            actions.push('Establecer reportes de seguimiento diarios hasta recuperar el ritmo');
        } else if (deviation.status === 'yellow') {
            actions.push('Incrementar la frecuencia de seguimiento semanal del proyecto');
            actions.push('Revisar dependencias críticas y posibles bloqueos');
            actions.push('Validar disponibilidad y productividad del equipo');
            actions.push('Preparar plan de contingencia preventivo');
        } else {
            actions.push('Mantener el ritmo actual de trabajo y seguimiento');
            actions.push('Documentar buenas prácticas para replicar en otros proyectos');
            actions.push('Preparar siguientes fases con anticipación');
        }
        
        // Generar sugerencias
        suggestions.push('Implementar reunión diaria de 15 minutos para sincronización del equipo');
        suggestions.push('Utilizar tableros visuales (Kanban) para mejorar la transparencia del avance');
        suggestions.push('Establecer métricas de calidad además de las métricas de avance');
        suggestions.push('Considerar automatización de tareas repetitivas para mejorar eficiencia');
        suggestions.push('Mantener registro de riesgos actualizado y revisarlo semanalmente');
        suggestions.push('Fomentar comunicación proactiva entre el equipo y stakeholders');
        
        return {
            status,
            risks,
            actions,
            suggestions
        };
    }

    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    
    function openModal(project = null) {
        const modal = $('#projectModal');
        const modalTitle = $('#modalTitle');
        const form = $('#projectForm')[0];
        
        // Clear previous alerts
        $('#modalAlert').empty();
        
        // Reset form
        form.reset();
        $('#projectId').val('');
        
        // Reset document uploads
        projectDocuments.l1 = null;
        projectDocuments.rfp = null;
        projectDocuments.propuestaTecnica = null;
        projectDocuments.gecoExcel = null;
        $('#docL1').val('');
        $('#docRFP').val('');
        $('#docPropuesta').val('');
        $('#docGECO').val('');
        updateDocumentStatus('docL1Status', '', '');
        updateDocumentStatus('docRFPStatus', '', '');
        updateDocumentStatus('docPropuestaStatus', '', '');
        updateDocumentStatus('docGECOStatus', '', '');
        
        // Reset tabs to first panel
        $('.nav-tab-btn').removeClass('selected');
        $('.nav-tab-btn[data-panel="form"]').addClass('selected');
        $('.tab-panel').removeClass('visible');
        $('#panelForm').addClass('visible');
        
        if (project) {
            // Edit mode - only configuration (removed timeline and AI analysis)
            modalTitle.text('Configurar Proyecto');
            appState.currentProject = project;
            
            // Populate form
            $('#projectId').val(project.id);
            $('#projectCode').val(project.code);
            $('#projectName').val(project.name);
            $('#projectStatus').val(project.status);
            $('#projectLeader').val(project.leader);
            $('#projectStartDate').val(project.startDate);
            $('#projectEndDate').val(project.endDate);
            $('#projectPlannedProgress').val(project.plannedProgress);
            $('#projectActualProgress').val(project.actualProgress);
            $('#projectManagementSystem').val(project.managementSystem || '');
            $('#projectManagementPath').val(project.managementPath || '');
            
            // Show/hide management path field based on selection
            if (project.managementSystem && project.managementSystem !== 'Otro') {
                $('#managementPathGroup').show();
            }
            
            // Render attached documents
            renderAttachedDocuments(project);
        } else {
            // Create mode
            modalTitle.text('Nuevo Proyecto');
            appState.currentProject = null;
            
            // Clear attached documents
            $('#attachedDocumentsList').hide();
        }
        
        modal.addClass('active');
    }

    function closeModal() {
        $('#projectModal').removeClass('active');
        appState.currentProject = null;
        $('#projectForm')[0].reset();
        $('#modalAlert').empty();
    }

    // ============================================
    // DOCUMENT UPLOAD MANAGEMENT
    // ============================================

    const projectDocuments = {
        l1: null,
        rfp: null,
        propuestaTecnica: null,
        gecoExcel: null
    };

    /**
     * Validate document file before upload
     */
    function validateProjectDocument(file, documentType) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        let allowedExtensions;

        // GECO only accepts Excel files
        if (documentType === 'gecoExcel') {
            allowedExtensions = ['.xls', '.xlsx', '.xlsm'];
        } else {
            allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.xlsm'];
        }

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'El archivo excede el tamaño máximo de 10MB'
            };
        }

        // Check extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            return {
                valid: false,
                error: `Formato no válido. Permitidos: ${allowedExtensions.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Simulate document upload to mock API
     */
    async function simulateProjectDocumentUpload(file, documentType) {
        return new Promise((resolve, reject) => {
            const delay = 800 + Math.random() * 1200;

            setTimeout(() => {
                // 95% success rate
                if (Math.random() < 0.95) {
                    resolve({
                        success: true,
                        documentType: documentType,
                        fileName: file.name,
                        url: `https://mock-storage.company.com/documents/${generateId()}/${file.name}`,
                        uploadDate: new Date().toISOString()
                    });
                } else {
                    reject({
                        error: true,
                        message: 'Error al procesar el documento'
                    });
                }
            }, delay);
        });
    }

    /**
     * Handle document file selection
     */
    function handleDocumentUpload(documentType, fileInputId, statusElementId) {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];

        if (!file) {
            projectDocuments[documentType] = null;
            updateDocumentStatus(statusElementId, '', '');
            return;
        }

        // Validate file
        const validation = validateProjectDocument(file, documentType);

        if (!validation.valid) {
            updateDocumentStatus(statusElementId, validation.error, 'error');
            fileInput.value = '';
            projectDocuments[documentType] = null;
            return;
        }

        // Store file info
        projectDocuments[documentType] = {
            file: file,
            name: file.name,
            size: file.size
        };

        updateDocumentStatus(statusElementId, `✓ ${file.name} (${formatFileSize(file.size)})`, 'success');
    }

    /**
     * Update document status message
     */
    function updateDocumentStatus(elementId, message, type) {
        const element = $(`#${elementId}`);
        element.text(message);

        if (type === 'success') {
            element.css('color', '#10b981');
        } else if (type === 'error') {
            element.css('color', '#ef4444');
        } else {
            element.css('color', '#64748b');
        }
    }

    /**
     * Render attached documents for editing
     */
    function renderAttachedDocuments(project) {
        const container = $('#attachedDocumentsContainer');
        const list = $('#attachedDocumentsList');

        if (!project || !project.documents) {
            list.hide();
            return;
        }

        const docs = project.documents;
        const hasAnyDocument = docs.l1 || docs.rfp || docs.propuestaTecnica || docs.gecoExcel;

        if (!hasAnyDocument) {
            list.hide();
            return;
        }

        list.show();
        container.empty();

        const documentLabels = {
            l1: '📄 L1 (Comité)',
            rfp: '📋 RFP',
            propuestaTecnica: '📑 Propuesta Técnica',
            gecoExcel: '📊 GECO (Project Economic Management)'
        };

        Object.keys(documentLabels).forEach(key => {
            if (docs[key]) {
                const doc = docs[key];
                const html = `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <div>
                            <div style="font-size: 13px; font-weight: 600; color: #334155;">
                                ${documentLabels[key]}
                            </div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                                ${doc.name} • ${formatDateTime(doc.uploadDate)}
                            </div>
                        </div>
                        <a href="${doc.url}" target="_blank" style="padding: 6px 12px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600;">
                            Ver
                        </a>
                    </div>
                `;
                container.append(html);
            }
        });
    }

    /**
     * Process and upload documents when saving project
     */
    async function processProjectDocuments(projectId) {
        const uploadedDocs = {
            l1: null,
            rfp: null,
            propuestaTecnica: null,
            gecoExcel: null
        };

        const docTypes = ['l1', 'rfp', 'propuestaTecnica', 'gecoExcel'];

        for (const docType of docTypes) {
            if (projectDocuments[docType]) {
                try {
                    const result = await simulateProjectDocumentUpload(
                        projectDocuments[docType].file,
                        docType
                    );
                    uploadedDocs[docType] = {
                        name: result.fileName,
                        url: result.url,
                        uploadDate: result.uploadDate
                    };
                } catch (error) {
                    console.error(`Error uploading ${docType}:`, error);
                }
            }
        }

        return uploadedDocs;
    }

    /**
     * Format file size for display
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // ============================================
    // CRUD OPERATIONS
    // ============================================
    
    async function saveProject() {
        const form = $('#projectForm')[0];
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form data
        const projectData = {
            id: $('#projectId').val() || generateId(),
            code: $('#projectCode').val().trim(),
            name: $('#projectName').val().trim(),
            status: $('#projectStatus').val(),
            leader: $('#projectLeader').val().trim(),
            startDate: $('#projectStartDate').val(),
            endDate: $('#projectEndDate').val(),
            plannedProgress: parseFloat($('#projectPlannedProgress').val()),
            actualProgress: parseFloat($('#projectActualProgress').val()),
            managementSystem: $('#projectManagementSystem').val(),
            managementPath: $('#projectManagementPath').val().trim()
        };
        
        // Validate dates
        if (new Date(projectData.startDate) > new Date(projectData.endDate)) {
            showModalAlert('error', 'La fecha de inicio no puede ser posterior a la fecha fin.');
            return;
        }
        
        // Validate percentages
        if (projectData.plannedProgress < 0 || projectData.plannedProgress > 100) {
            showModalAlert('error', 'El porcentaje planificado debe estar entre 0 y 100.');
            return;
        }
        
        if (projectData.actualProgress < 0 || projectData.actualProgress > 100) {
            showModalAlert('error', 'El porcentaje de avance debe estar entre 0 y 100.');
            return;
        }
        
        // Show loading state
        setSaveButtonLoading(true);
        
        try {
            const isEdit = appState.currentProject !== null;
            
            if (MOCKUP_MODE) {
                // Use mock API
                if (isEdit) {
                    await mockUpdateProject(projectData);
                } else {
                    await mockCreateProject(projectData);
                }
            } else {
                // Call real API
                const method = isEdit ? 'PUT' : 'POST';
                const url = isEdit ? `${API_ENDPOINTS.update}/${projectData.id}` : API_ENDPOINTS.create;
                
                await $.ajax({
                    url: url,
                    method: method,
                    contentType: 'application/json',
                    data: JSON.stringify(projectData)
                });
            }
            
            // Reload projects and close modal
            await loadProjects();
            closeModal();
            
            showAlert('success', isEdit ? 'Proyecto actualizado correctamente.' : 'Proyecto creado correctamente.');
            
        } catch (error) {
            console.error('Error saving project:', error);
            showModalAlert('error', 'Error al guardar el proyecto. Por favor, intente nuevamente.');
        } finally {
            setSaveButtonLoading(false);
        }
    }

    async function deleteProject(projectId) {
        const project = appState.projects.find(p => p.id === projectId);
        
        if (!project) {
            return;
        }
        
        if (!confirm(`¿Está seguro que desea eliminar el proyecto "${project.name}"?`)) {
            return;
        }
        
        try {
            if (MOCKUP_MODE) {
                await mockDeleteProject(projectId);
            } else {
                await $.ajax({
                    url: `${API_ENDPOINTS.delete}/${projectId}`,
                    method: 'DELETE'
                });
            }
            
            await loadProjects();
            showAlert('success', 'Proyecto eliminado correctamente.');
            
        } catch (error) {
            console.error('Error deleting project:', error);
            showAlert('error', 'Error al eliminar el proyecto. Por favor, intente nuevamente.');
        }
    }

    // ============================================
    // MOCK API FUNCTIONS
    // ============================================
    
    async function mockGetProjects() {
        // Simulate API delay
        await sleep(500);
        
        // Load mock data from external file
        if (typeof window.mockProjectsData !== 'undefined') {
            return window.mockProjectsData;
        }
        
        // Fallback mock data
        return [
            {
                id: '1',
                code: 'PRJ-001',
                name: 'Implementación Sistema CRM',
                status: 'Activo',
                leader: 'María González',
                startDate: '2026-01-15',
                endDate: '2026-06-30',
                plannedProgress: 25.0,
                actualProgress: 28.5
            }
        ];
    }

    async function mockCreateProject(projectData) {
        await sleep(500);
        console.log('Mock: Create project', projectData);
        return { success: true, data: projectData };
    }

    async function mockUpdateProject(projectData) {
        await sleep(500);
        console.log('Mock: Update project', projectData);
        return { success: true, data: projectData };
    }

    async function mockDeleteProject(projectId) {
        await sleep(500);
        console.log('Mock: Delete project', projectId);
        return { success: true };
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function generateId() {
        return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================
    // UI HELPER FUNCTIONS
    // ============================================
    
    function showLoading(show) {
        const loadingState = $('#loadingState');
        const tableContainer = $('#tableContainer');
        const emptyState = $('#emptyState');
        
        if (show) {
            loadingState.addClass('active');
            tableContainer.hide();
            emptyState.hide();
        } else {
            loadingState.removeClass('active');
        }
    }

    function showAlert(type, message) {
        const alertClass = `project-alert-${type}`;
        const alertHtml = `
            <div class="project-alert ${alertClass}">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${message}
            </div>
        `;
        
        // Insert alert at the top of the container
        const container = $('.project-container');
        container.prepend(alertHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            container.find('.project-alert').first().fadeOut(400, function() {
                $(this).remove();
            });
        }, 5000);
    }

    function showModalAlert(type, message) {
        const alertClass = `project-alert-${type}`;
        const alertHtml = `
            <div class="project-alert ${alertClass}">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${message}
            </div>
        `;
        
        $('#modalAlert').html(alertHtml);
    }

    function setSaveButtonLoading(loading) {
        const spinner = $('#saveSpinner');
        const buttonText = $('#saveButtonText');
        const saveButton = $('#btnSaveProject');
        
        if (loading) {
            spinner.show();
            buttonText.text('Guardando...');
            saveButton.prop('disabled', true);
        } else {
            spinner.hide();
            buttonText.text('Guardar');
            saveButton.prop('disabled', false);
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    // Search button
    $('#btnSearch').on('click', function() {
        appState.filters.code = $('#filterCode').val().trim();
        appState.filters.status = $('#filterStatus').val();
        appState.filters.startDate = $('#filterStartDate').val();
        appState.filters.endDate = $('#filterEndDate').val();
        appState.filters.deviation = $('#filterDeviation').val();
        
        applyFilters();
    });

    // Clear filters button
    $('#btnClearFilters').on('click', function() {
        $('#filterCode').val('');
        $('#filterStatus').val('');
        $('#filterStartDate').val('');
        $('#filterEndDate').val('');
        $('#filterDeviation').val('');
        
        appState.filters = {
            code: '',
            status: '',
            startDate: '',
            endDate: '',
            deviation: ''
        };
        
        applyFilters();
    });

    // New project button
    $('#btnNewProject').on('click', function() {
        openModal();
    });

    // Close modal buttons
    $('#btnCloseModal, #btnCancelModal').on('click', function() {
        closeModal();
    });

    // Close modal when clicking outside
    $('#projectModal').on('click', function(e) {
        if ($(e.target).is('#projectModal')) {
            closeModal();
        }
    });

    // Save project button
    $('#btnSaveProject').on('click', function() {
        saveProject();
    });

    // Submit form on Enter key
    $('#projectForm').on('submit', function(e) {
        e.preventDefault();
        saveProject();
    });

    // Tab navigation (NEW)
    $(document).on('click', '.nav-tab-btn', function() {
        const panelId = $(this).data('panel');
        
        // Update button states
        $('.nav-tab-btn').removeClass('selected');
        $(this).addClass('selected');
        
        // Update panel visibility
        $('.tab-panel').removeClass('visible');
        $(`#panel${panelId.charAt(0).toUpperCase() + panelId.slice(1)}`).addClass('visible');
    });

    // Management system change - show/hide path field
    $('#projectManagementSystem').on('change', function() {
        const selectedSystem = $(this).val();
        const pathGroup = $('#managementPathGroup');
        const pathInput = $('#projectManagementPath');
        
        if (selectedSystem && selectedSystem !== 'Otro') {
            pathGroup.show();
            // Set placeholder based on system
            if (selectedSystem === 'Jira') {
                pathInput.attr('placeholder', 'Ej: https://company.atlassian.net/browse/PRJ-001');
            } else if (selectedSystem === 'Project') {
                pathInput.attr('placeholder', 'Ej: \\\\servidor\\proyectos\\proyecto.mpp');
            } else if (selectedSystem === 'Excel') {
                pathInput.attr('placeholder', 'Ej: \\\\servidor\\proyectos\\proyecto.xlsx');
            }
        } else {
            pathGroup.hide();
            pathInput.val('');
        }
    });

    // Document upload handlers
    $('#docL1').on('change', function() {
        handleDocumentUpload('l1', 'docL1', 'docL1Status');
    });

    $('#docRFP').on('change', function() {
        handleDocumentUpload('rfp', 'docRFP', 'docRFPStatus');
    });

    $('#docPropuesta').on('change', function() {
        handleDocumentUpload('propuestaTecnica', 'docPropuesta', 'docPropuestaStatus');
    });

    $('#docGECO').on('change', function() {
        handleDocumentUpload('gecoExcel', 'docGECO', 'docGECOStatus');
    });

    // ============================================
    // GLOBAL FUNCTIONS (for onclick handlers)
    // ============================================
    
    window.viewProjectDetail = function(projectId) {
        // Save current filters and scroll position for navigation back
        sessionStorage.setItem('projectFilters', JSON.stringify(appState.filters));
        sessionStorage.setItem('scrollPosition', window.scrollY);
        
        // Navigate to detail page
        window.location.href = `page-project-detail.html?id=${projectId}`;
    };
    
    window.openAIAnalysis = function(projectId) {
        // Save current filters and scroll position for navigation back
        sessionStorage.setItem('projectFilters', JSON.stringify(appState.filters));
        sessionStorage.setItem('scrollPosition', window.scrollY);
        
        // Navigate to IA analysis page
        window.location.href = `page-project-ia.html?id=${projectId}`;
    };
    
    window.editProject = function(projectId) {
        // Convert to number for comparison since IDs might be strings or numbers
        const id = parseInt(projectId);
        const project = appState.projects.find(p => p.id === id || p.id === projectId);
        if (project) {
            openModal(project);
        } else {
            console.error(`Project with ID ${projectId} not found in appState.projects`);
        }
    };

    window.deleteProject = deleteProject;

    // ============================================
    // INITIALIZATION
    // ============================================
    
    // Restore filters and scroll position if coming back from detail page
    function restoreState() {
        const savedFilters = sessionStorage.getItem('projectFilters');
        const savedScroll = sessionStorage.getItem('scrollPosition');
        
        if (savedFilters) {
            try {
                appState.filters = JSON.parse(savedFilters);
                
                // Restore filter inputs
                $('#filterCode').val(appState.filters.code || '');
                $('#filterStatus').val(appState.filters.status || '');
                $('#filterStartDate').val(appState.filters.startDate || '');
                $('#filterEndDate').val(appState.filters.endDate || '');
                $('#filterDeviation').val(appState.filters.deviation || '');
                
                // Clear from sessionStorage
                sessionStorage.removeItem('projectFilters');
            } catch (e) {
                console.error('Error restoring filters:', e);
            }
        }
        
        if (savedScroll) {
            // Restore scroll position after content loads
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScroll));
                sessionStorage.removeItem('scrollPosition');
            }, 100);
        }
    }
    
    // Load projects on page load
    restoreState();
    loadProjects();
});
