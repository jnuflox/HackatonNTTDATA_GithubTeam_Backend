$(document).ready(function () {
    // ============================================
    // CONFIGURATION
    // ============================================
    
    const MOCKUP_MODE = false;
    const API_ENDPOINT = 'http://localhost:3000/api/projects/dashboard/stats';

    // ============================================
    // APPLICATION STATE
    // ============================================
    
    const appState = {
        allProjects: [],
        filteredProjects: [],
        filters: {
            period: 'all',
            status: '',
            risk: ''
        },
        charts: {}
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        setupEventListeners();
        loadDashboardData();
    }

    function setupEventListeners() {
        $('#refreshBtn').on('click', function() {
            refreshDashboard();
        });

        $('#applyFiltersBtn').on('click', function() {
            applyFilters();
        });

        // Update filters state when changed
        $('#filterPeriod, #filterStatus, #filterRisk').on('change', function() {
            const filterId = $(this).attr('id');
            const value = $(this).val();
            
            if (filterId === 'filterPeriod') appState.filters.period = value;
            if (filterId === 'filterStatus') appState.filters.status = value;
            if (filterId === 'filterRisk') appState.filters.risk = value;
        });
    }

    // ============================================
    // DATA LOADING
    // ============================================
    
    async function loadDashboardData() {
        showLoading(true);
        
        try {
            let dashboardData;
            
            if (MOCKUP_MODE) {
                if (typeof window.mockProjectsData === 'undefined') {
                    throw new Error('Mock data not loaded');
                }
                dashboardData = window.mockProjectsData;
                await new Promise(resolve => setTimeout(resolve, 800));
            } else {
                const response = await fetch(API_ENDPOINT);
                if (!response.ok) throw new Error('Error al cargar datos');
                const result = await response.json();
                dashboardData = result.success ? result.data : result;
                
                // Also load individual projects for detailed views
                const projectsResponse = await fetch('http://localhost:3000/api/projects');
                const projectsResult = await projectsResponse.json();
                appState.allProjects = projectsResult.success ? projectsResult.data : projectsResult;
            }
            
            // Update dashboard with stats
            if (!MOCKUP_MODE) {
                updateDashboardStats(dashboardData);
            } else {
                appState.allProjects = dashboardData;
                applyFilters();
            }
            
            updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            alert('Error al cargar el dashboard. Por favor, intente nuevamente.');
        } finally {
            showLoading(false);
        }
    }
    
    function updateDashboardStats(stats) {
        // Validate stats structure
        if (!stats) {
            console.error('No stats data received');
            return;
        }
        
        // Update overview stats with safe access
        const overview = stats.overview || {};
        $('#totalProjects').text(overview.totalProjects || 0);
        $('#totalTasks').text(overview.totalTasks || 0);
        $('#completionRate').text(`${overview.completionRate || 0}%`);
        $('#totalBudget').text(`$${(overview.totalBudget || 0).toLocaleString()}`);
        
        // Validate projects data exists before rendering charts
        const projects = stats.projects || {};
        
        // Update status distribution
        if (projects.byStatus) {
            renderStatusChart(projects.byStatus);
        }
        
        // Update priority distribution  
        if (projects.byPriority) {
            renderPriorityChart(projects.byPriority);
        }
        
        // Update risk distribution
        if (projects.byRisk) {
            renderRiskChart(projects.byRisk);
        }
        
        // Render project tables with actual projects
        applyFilters();
    }

    function renderStatusChart(statusData) {
        // Expected format: { Activo: count, Completado: count, "En Pausa": count }
        if (!statusData || typeof statusData !== 'object') {
            console.warn('Invalid status data for chart');
            return;
        }
        
        // Filter out null/undefined keys and values
        const validEntries = Object.entries(statusData).filter(([key, value]) => 
            key != null && key !== '' && value != null && typeof value === 'number'
        );
        
        if (validEntries.length === 0) {
            console.warn('No valid status data for chart');
            const chartElement = document.querySelector("#statusChart");
            if (chartElement) {
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay datos de estado disponibles</div>';
            }
            return;
        }
        
        const categories = validEntries.map(([key]) => key);
        const data = validEntries.map(([, value]) => value);
        
        // Validate data is not all zeros
        if (data.every(v => v === 0)) {
            console.warn('All status data is zero');
            const chartElement = document.querySelector("#statusChart");
            if (chartElement) {
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay datos de estado disponibles</div>';
            }
            return;
        }
        
        const options = {
            series: [{
                name: 'Proyectos',
                data: data
            }],
            chart: {
                type: 'bar',
                height: 200,
                toolbar: { show: false }
            },
            colors: ['#667eea'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                }
            },
            xaxis: {
                categories: categories
            }
        };
        
        const chartElement = document.querySelector("#statusChart");
        if (chartElement) {
            // Clear any previous content
            chartElement.innerHTML = '';
            if (appState.charts.status) {
                appState.charts.status.destroy();
            }
            appState.charts.status = new ApexCharts(chartElement, options);
            appState.charts.status.render();
        }
    }

    function renderPriorityChart(priorityData) {
        // Expected format: { Alta: count, Media: count, Baja: count }
        if (!priorityData || typeof priorityData !== 'object') {
            console.warn('Invalid priority data for chart');
            return;
        }
        
        // Filter out null/undefined keys and values
        const validEntries = Object.entries(priorityData).filter(([key, value]) => 
            key != null && key !== '' && value != null && typeof value === 'number'
        );
        
        if (validEntries.length === 0) {
            console.warn('No valid priority data for chart');
            const chartElement = document.querySelector("#priorityChart");
            if (chartElement) {
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay datos de prioridad disponibles</div>';
            }
            return;
        }
        
        const labels = validEntries.map(([key]) => key);
        const series = validEntries.map(([, value]) => value);
        
        // Validate data is not all zeros
        if (series.every(v => v === 0)) {
            console.warn('All priority data is zero');
            const chartElement = document.querySelector("#priorityChart");
            if (chartElement) {
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay datos de prioridad disponibles</div>';
            }
            return;
        }
        
        const options = {
            series: series,
            chart: {
                type: 'donut',
                height: 250
            },
            labels: labels,
            colors: ['#ef4444', '#f59e0b', '#10b981'],
            legend: {
                position: 'bottom',
                fontSize: '12px'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val, opts) {
                    return opts.w.config.series[opts.seriesIndex];
                }
            }
        };
        
        const chartElement = document.querySelector("#priorityChart");
        if (chartElement) {
            chartElement.innerHTML = '';
            if (appState.charts.priority) {
                appState.charts.priority.destroy();
            }
            appState.charts.priority = new ApexCharts(chartElement, options);
            appState.charts.priority.render();
        }
    }

    function renderRiskChart(riskData) {
        // Expected format: { Alto: count, Medio: count, Bajo: count }
        if (!riskData || typeof riskData !== 'object') {
            console.warn('Invalid risk data for chart');
            return;
        }
        
        // Filter out null/undefined keys and values
        const validEntries = Object.entries(riskData).filter(([key, value]) => 
            key != null && key !== '' && value != null && typeof value === 'number'
        );
        
        if (validEntries.length === 0) {
            console.warn('No valid risk data for chart');
            const chartElement = document.querySelector("#riskChart");
            if (chartElement) {
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay datos de riesgo disponibles</div>';
            }
            return;
        }
        
        const categories = validEntries.map(([key]) => key);
        const data = validEntries.map(([, value]) => value);
        
        // Validate data is not all zeros
        if (data.every(v => v === 0)) {
            console.warn('All risk data is zero');
            const chartElement = document.querySelector("#riskChart");
            if (chartElement) {
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay datos de riesgo disponibles</div>';
            }
            return;
        }
        
        const options = {
            series: [{
                name: 'Proyectos',
                data: data
            }],
            chart: {
                type: 'bar',
                height: 200,
                toolbar: { show: false }
            },
            colors: ['#ef4444', '#f59e0b', '#10b981'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
                    distributed: true
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                }
            },
            xaxis: {
                categories: categories
            },
            legend: {
                show: false
            }
        };
        
        const chartElement = document.querySelector("#riskChart");
        if (chartElement) {
            chartElement.innerHTML = '';
            if (appState.charts.risk) {
                appState.charts.risk.destroy();
            }
            appState.charts.risk = new ApexCharts(chartElement, options);
            appState.charts.risk.render();
        }
    }

    async function refreshDashboard() {
        const btn = $('#refreshBtn');
        btn.prop('disabled', true);
        btn.html('🔄 Actualizando...');
        
        await loadDashboardData();
        
        btn.prop('disabled', false);
        btn.html('🔄 Actualizar');
    }

    // ============================================
    // FILTERING
    // ============================================
    
    function applyFilters() {
        const { period, status, risk } = appState.filters;
        
        let filtered = [...appState.allProjects];
        
        // Filter by period
        if (period !== 'all') {
            const now = new Date('2026-01-28');
            
            filtered = filtered.filter(project => {
                const startDate = new Date(project.startDate);
                const endDate = new Date(project.endDate);
                
                switch (period) {
                    case 'current':
                        return project.status === 'Activo';
                    
                    case 'last30':
                        const thirtyDaysAgo = new Date(now);
                        thirtyDaysAgo.setDate(now.getDate() - 30);
                        return startDate >= thirtyDaysAgo || endDate >= thirtyDaysAgo;
                    
                    case 'q1-2026':
                        return (startDate >= new Date('2026-01-01') && startDate < new Date('2026-04-01')) ||
                               (endDate >= new Date('2026-01-01') && endDate < new Date('2026-04-01'));
                    
                    case '2026':
                        return startDate.getFullYear() === 2026 || endDate.getFullYear() === 2026;
                    
                    case '2025':
                        return startDate.getFullYear() === 2025 || endDate.getFullYear() === 2025;
                    
                    default:
                        return true;
                }
            });
        }
        
        // Filter by status
        if (status) {
            filtered = filtered.filter(p => p.status === status);
        }
        
        // Filter by risk level
        if (risk) {
            filtered = filtered.filter(p => {
                const deviation = Math.abs(p.actualProgress - p.plannedProgress);
                const riskLevel = deviation <= 5 ? 'green' : deviation <= 10 ? 'yellow' : 'red';
                return riskLevel === risk;
            });
        }
        
        appState.filteredProjects = filtered;
        renderDashboard();
    }

    // ============================================
    // RENDERING
    // ============================================
    
    function renderDashboard() {
        const projects = appState.filteredProjects;
        
        if (projects.length === 0) {
            showEmptyState();
            return;
        }
        
        renderKPIs(projects);
        renderCharts(projects);
        renderCriticalProjects(projects);
        renderFailureAnalysis(projects);
        renderRecommendations(projects);
        
        $('#mainContent').show();
    }

    function renderKPIs(projects) {
        // Calculate KPIs
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'Activo').length;
        
        // Budget calculations
        let totalBudget = 0;
        let totalConsumed = 0;
        projects.forEach(p => {
            if (p.financialSummary) {
                totalBudget += p.financialSummary.budgetTotal || 0;
                totalConsumed += p.financialSummary.budgetConsumed || 0;
            }
        });
        
        // Risk calculations
        const projectsAtRisk = projects.filter(p => {
            const deviation = Math.abs(p.actualProgress - p.plannedProgress);
            return deviation > 5;
        }).length;
        
        // Portfolio health (0-100)
        let healthScore = 100;
        projects.forEach(p => {
            const deviation = Math.abs(p.actualProgress - p.plannedProgress);
            if (deviation > 10) healthScore -= 10;
            else if (deviation > 5) healthScore -= 3;
            if (p.status === 'En Pausa') healthScore -= 5;
            if (p.status === 'Cancelado') healthScore -= 8;
        });
        healthScore = Math.max(0, healthScore);
        
        // AI Validation rate
        let totalTasks = 0;
        let validatedTasks = 0;
        projects.forEach(p => {
            if (p.tasks) {
                p.tasks.forEach(t => {
                    totalTasks++;
                    if (t.aiValidationStatus === 'OK') validatedTasks++;
                });
            }
        });
        const validationRate = totalTasks > 0 ? ((validatedTasks / totalTasks) * 100).toFixed(1) : 100;
        
        // Render KPI cards
        const kpisHTML = `
            <div class="kpi-card info">
                <div class="kpi-header">
                    <div class="kpi-label">Total Proyectos</div>
                    <div class="kpi-icon">📁</div>
                </div>
                <div class="kpi-value">${totalProjects}</div>
                <div class="kpi-subtitle">${activeProjects} activos en este momento</div>
            </div>
            
            <div class="kpi-card ${totalConsumed > totalBudget * 0.9 ? 'danger' : 'success'}">
                <div class="kpi-header">
                    <div class="kpi-label">Inversión Total</div>
                    <div class="kpi-icon">💰</div>
                </div>
                <div class="kpi-value">${formatCurrency(totalBudget)}</div>
                <div class="kpi-subtitle">Consumido: ${formatCurrency(totalConsumed)} (${((totalConsumed/totalBudget)*100).toFixed(1)}%)</div>
            </div>
            
            <div class="kpi-card ${projectsAtRisk > totalProjects * 0.3 ? 'danger' : projectsAtRisk > 0 ? 'warning' : 'success'}">
                <div class="kpi-header">
                    <div class="kpi-label">Proyectos en Riesgo</div>
                    <div class="kpi-icon">⚠️</div>
                </div>
                <div class="kpi-value">${projectsAtRisk}</div>
                <div class="kpi-subtitle">De ${totalProjects} proyectos totales (${((projectsAtRisk/totalProjects)*100).toFixed(1)}%)</div>
            </div>
            
            <div class="kpi-card ${healthScore >= 85 ? 'success' : healthScore >= 70 ? 'warning' : 'danger'}">
                <div class="kpi-header">
                    <div class="kpi-label">Salud del Portafolio</div>
                    <div class="kpi-icon">❤️</div>
                </div>
                <div class="kpi-value">${healthScore.toFixed(0)}/100</div>
                <div class="kpi-subtitle">Índice de salud general del portafolio</div>
            </div>
            
            <div class="kpi-card ${validationRate >= 80 ? 'success' : validationRate >= 60 ? 'warning' : 'danger'}">
                <div class="kpi-header">
                    <div class="kpi-label">Validación IA</div>
                    <div class="kpi-icon">🤖</div>
                </div>
                <div class="kpi-value">${validationRate}%</div>
                <div class="kpi-subtitle">${validatedTasks}/${totalTasks} tareas validadas exitosamente</div>
            </div>
        `;
        
        $('#kpiGrid').html(kpisHTML);
    }

    function renderCharts(projects) {
        renderRiskMatrixChart(projects);
        renderRiskDistributionChart(projects);
        renderProgressTrendsChart(projects);
        renderBudgetDistributionChart(projects);
        renderTimelineChart(projects);
    }

    function renderRiskMatrixChart(projects) {
        // Validate projects array
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            console.warn('No projects data for risk matrix chart');
            return;
        }
        
        // Prepare data for scatter plot (Budget Deviation vs Time Deviation)
        const series = [{
            name: 'Riesgo Crítico',
            data: []
        }, {
            name: 'Riesgo Medio',
            data: []
        }, {
            name: 'Riesgo Bajo',
            data: []
        }];
        
        projects.forEach(project => {
            // Safe access to project properties
            if (!project) return;
            
            const actualProgress = project.actualProgress || 0;
            const plannedProgress = project.plannedProgress || 0;
            const timeDeviation = actualProgress - plannedProgress;
            let budgetDeviation = 0;
            
            if (project.financialSummary) {
                const progressPercent = actualProgress;
                const budgetPercent = project.financialSummary.budgetConsumedPercent || 0;
                budgetDeviation = budgetPercent - progressPercent;
            }
            
            const deviation = Math.abs(timeDeviation);
            const dataPoint = {
                x: timeDeviation,
                y: budgetDeviation,
                name: project.code || 'N/A',
                projectName: project.name || 'Sin nombre'
            };
            
            if (deviation > 10) {
                series[0].data.push(dataPoint);
            } else if (deviation > 5) {
                series[1].data.push(dataPoint);
            } else {
                series[2].data.push(dataPoint);
            }
        });
        
        const options = {
            series: series,
            chart: {
                height: 400,
                type: 'scatter',
                zoom: {
                    enabled: true,
                    type: 'xy'
                },
                toolbar: {
                    show: true
                }
            },
            colors: ['#ef4444', '#f59e0b', '#10b981'],
            xaxis: {
                title: {
                    text: 'Desviación Temporal (% Real - % Planificado)',
                    style: {
                        fontSize: '13px',
                        fontWeight: 600
                    }
                },
                tickAmount: 10,
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0) + '%';
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Desviación Presupuestal (% Presupuesto - % Avance)',
                    style: {
                        fontSize: '13px',
                        fontWeight: 600
                    }
                },
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0) + '%';
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                fontSize: '13px',
                fontWeight: 600
            },
            markers: {
                size: 8
            },
            tooltip: {
                custom: function({series, seriesIndex, dataPointIndex, w}) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    return `<div style="padding: 10px;">
                        <strong>${data.name}</strong><br/>
                        ${data.projectName}<br/>
                        <span style="color: #667eea;">Desv. Temporal:</span> ${data.x.toFixed(1)}%<br/>
                        <span style="color: #764ba2;">Desv. Presupuestal:</span> ${data.y.toFixed(1)}%
                    </div>`;
                }
            },
            annotations: {
                xaxis: [{
                    x: 0,
                    borderColor: '#999',
                    strokeDashArray: 5,
                    label: {
                        text: 'En Plan'
                    }
                }],
                yaxis: [{
                    y: 0,
                    borderColor: '#999',
                    strokeDashArray: 5
                }]
            }
        };
        
        if (appState.charts.riskMatrix) {
            appState.charts.riskMatrix.destroy();
        }
        appState.charts.riskMatrix = new ApexCharts(document.querySelector("#riskMatrixChart"), options);
        appState.charts.riskMatrix.render();
    }

    function renderRiskDistributionChart(projects) {
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            console.warn('No projects data for risk distribution chart');
            return;
        }
        
        const riskCounts = {
            green: 0,
            yellow: 0,
            red: 0
        };
        
        projects.forEach(p => {
            if (!p) return;
            const actualProgress = p.actualProgress || 0;
            const plannedProgress = p.plannedProgress || 0;
            const deviation = Math.abs(actualProgress - plannedProgress);
            if (deviation <= 5) riskCounts.green++;
            else if (deviation <= 10) riskCounts.yellow++;
            else riskCounts.red++;
        });
        
        const options = {
            series: [riskCounts.green, riskCounts.yellow, riskCounts.red],
            chart: {
                type: 'donut',
                height: 350
            },
            labels: ['✓ Riesgo Bajo', '⚠ Riesgo Medio', '✕ Riesgo Alto'],
            colors: ['#10b981', '#f59e0b', '#ef4444'],
            legend: {
                position: 'bottom',
                fontSize: '13px',
                fontWeight: 600
            },
            dataLabels: {
                enabled: true,
                formatter: function(val, opts) {
                    return opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '16px',
                    fontWeight: 700
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Proyectos',
                                fontSize: '14px',
                                fontWeight: 600,
                                formatter: function(w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                }
                            }
                        }
                    }
                }
            }
        };
        
        if (appState.charts.riskDistribution) {
            appState.charts.riskDistribution.destroy();
        }
        appState.charts.riskDistribution = new ApexCharts(document.querySelector("#riskDistributionChart"), options);
        appState.charts.riskDistribution.render();
    }

    function renderProgressTrendsChart(projects) {
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            console.warn('No projects data for progress trends chart');
            return;
        }
        
        const categories = [];
        const plannedData = [];
        const actualData = [];
        
        projects.slice(0, 10).forEach(p => {
            if (!p) return;
            categories.push(p.code || 'N/A');
            plannedData.push(p.plannedProgress || 0);
            actualData.push(p.actualProgress || 0);
        });
        
        const options = {
            series: [{
                name: 'Progreso Planificado',
                data: plannedData
            }, {
                name: 'Progreso Real',
                data: actualData
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            colors: ['#cbd5e1', '#667eea'],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '70%',
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                },
                offsetY: -20,
                style: {
                    fontSize: '11px',
                    colors: ['#304758']
                }
            },
            xaxis: {
                categories: categories,
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Porcentaje de Avance (%)',
                    style: {
                        fontSize: '13px',
                        fontWeight: 600
                    }
                },
                max: 100
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                fontSize: '13px',
                fontWeight: 600
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val.toFixed(1) + '%';
                    }
                }
            }
        };
        
        if (appState.charts.progressTrends) {
            appState.charts.progressTrends.destroy();
        }
        appState.charts.progressTrends = new ApexCharts(document.querySelector("#progressTrendsChart"), options);
        appState.charts.progressTrends.render();
    }

    function renderBudgetDistributionChart(projects) {
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            console.warn('No projects data for budget distribution chart');
            return;
        }
        
        const categories = [];
        const budgetData = [];
        
        projects.filter(p => p && p.financialSummary).slice(0, 8).forEach(p => {
            categories.push(p.code || 'N/A');
            budgetData.push(p.financialSummary.budgetTotal || 0);
        });
        
        const options = {
            series: [{
                name: 'Presupuesto Total',
                data: budgetData
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            colors: ['#10b981'],
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    horizontal: true,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return formatCurrency(val);
                },
                offsetX: 50,
                style: {
                    fontSize: '11px',
                    fontWeight: 600
                }
            },
            xaxis: {
                categories: categories,
                labels: {
                    formatter: function(val) {
                        return formatCurrency(val);
                    },
                    style: {
                        fontSize: '11px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return formatCurrency(val);
                    }
                }
            }
        };
        
        if (appState.charts.budgetDistribution) {
            appState.charts.budgetDistribution.destroy();
        }
        appState.charts.budgetDistribution = new ApexCharts(document.querySelector("#budgetDistributionChart"), options);
        appState.charts.budgetDistribution.render();
    }

    function renderTimelineChart(projects) {
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            console.warn('No projects data for timeline chart');
            return;
        }
        
        const series = [];
        
        projects.filter(p => p && p.status === 'Activo').slice(0, 8).forEach(p => {
            const startDate = p.startDate || p.start_date;
            const endDate = p.endDate || p.end_date;
            
            if (!startDate || !endDate) return;
            
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            
            const actualProgress = p.actualProgress || 0;
            const plannedProgress = p.plannedProgress || 0;
            
            series.push({
                name: p.code || 'N/A',
                data: [{
                    x: 'Timeline',
                    y: [start, end],
                    fillColor: getColorByDeviation(actualProgress - plannedProgress)
                }]
            });
        });
        
        const options = {
            series: series,
            chart: {
                height: 350,
                type: 'rangeBar',
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '80%'
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                    format: 'MMM yyyy',
                    style: {
                        fontSize: '11px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                }
            },
            tooltip: {
                custom: function({seriesIndex, dataPointIndex, w}) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    const start = new Date(data.y[0]);
                    const end = new Date(data.y[1]);
                    return `<div style="padding: 10px;">
                        <strong>${w.config.series[seriesIndex].name}</strong><br/>
                        Inicio: ${formatDate(start)}<br/>
                        Fin: ${formatDate(end)}
                    </div>`;
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                fontSize: '12px'
            }
        };
        
        if (appState.charts.timeline) {
            appState.charts.timeline.destroy();
        }
        appState.charts.timeline = new ApexCharts(document.querySelector("#timelineChart"), options);
        appState.charts.timeline.render();
    }

    function renderCriticalProjects(projects) {
        const criticalProjects = projects.filter(p => {
            const deviation = Math.abs(p.actualProgress - p.plannedProgress);
            return deviation > 10 || p.status === 'En Pausa';
        });
        
        if (criticalProjects.length === 0) {
            $('#criticalProjectsBody').parent().parent().hide();
            $('#noCriticalProjects').show();
            return;
        }
        
        $('#criticalProjectsBody').parent().parent().show();
        $('#noCriticalProjects').hide();
        
        let tableHTML = '';
        
        criticalProjects.forEach(project => {
            const deviation = project.actualProgress - project.plannedProgress;
            const deviationAbs = Math.abs(deviation);
            const riskLevel = deviationAbs > 10 ? 'red' : deviationAbs > 5 ? 'yellow' : 'green';
            const riskIcon = riskLevel === 'red' ? '🔴' : riskLevel === 'yellow' ? '🟡' : '🟢';
            
            let financialStatus = 'N/A';
            if (project.financialSummary) {
                const budgetPercent = project.financialSummary.budgetConsumedPercent;
                const progressPercent = project.actualProgress;
                const budgetDeviation = budgetPercent - progressPercent;
                
                if (budgetDeviation > 20) {
                    financialStatus = '<span style="color: #ef4444; font-weight: 600;">⚠️ Crítico</span>';
                } else if (budgetDeviation > 10) {
                    financialStatus = '<span style="color: #f59e0b; font-weight: 600;">⚠ Alerta</span>';
                } else {
                    financialStatus = '<span style="color: #10b981; font-weight: 600;">✓ OK</span>';
                }
            }
            
            let riskReasons = 'N/A';
            if (project.tasks) {
                const reasons = new Set();
                project.tasks.forEach(t => {
                    if (t.aiRiskReasons && t.aiRiskReasons.length > 0) {
                        t.aiRiskReasons.forEach(r => reasons.add(r));
                    }
                });
                if (reasons.size > 0) {
                    riskReasons = Array.from(reasons).slice(0, 2).join('; ');
                }
            }
            
            tableHTML += `
                <tr>
                    <td><a href="../projects/page-project-detail.html?id=${project.id}" class="project-code">${project.code}</a></td>
                    <td><strong>${project.name}</strong></td>
                    <td>${project.leader}</td>
                    <td><span class="risk-badge ${riskLevel}">${riskIcon} ${riskLevel === 'red' ? 'ALTO' : riskLevel === 'yellow' ? 'MEDIO' : 'BAJO'}</span></td>
                    <td><span class="deviation-value ${deviation >= 0 ? 'positive' : 'negative'}">${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%</span></td>
                    <td>${financialStatus}</td>
                    <td style="font-size: 12px; max-width: 300px;">${riskReasons}</td>
                    <td><a href="../projects/page-project-detail.html?id=${project.id}" style="color: #667eea; text-decoration: none; font-weight: 600;">Ver detalles →</a></td>
                </tr>
            `;
        });
        
        $('#criticalProjectsBody').html(tableHTML);
    }

    function renderFailureAnalysis(projects) {
        // Analyze failure patterns
        const failurePatterns = {
            apiIssues: 0,
            lowCoverage: 0,
            gitlabGaps: 0,
            resourceIssues: 0,
            delayedTasks: 0,
            blockedTasks: 0
        };
        
        const specificIssues = {
            apiIssues: [],
            lowCoverage: [],
            gitlabGaps: [],
            resourceIssues: [],
            delayedTasks: [],
            blockedTasks: []
        };
        
        projects.forEach(project => {
            if (project.tasks) {
                project.tasks.forEach(task => {
                    // Check for API issues
                    if (task.aiRiskReasons) {
                        task.aiRiskReasons.forEach(reason => {
                            if (reason.toLowerCase().includes('api') || reason.toLowerCase().includes('terceros')) {
                                failurePatterns.apiIssues++;
                                specificIssues.apiIssues.push(`${project.code}: ${task.taskName}`);
                            }
                            if (reason.toLowerCase().includes('coverage') || reason.toLowerCase().includes('tests')) {
                                failurePatterns.lowCoverage++;
                                specificIssues.lowCoverage.push(`${project.code}: ${task.taskName}`);
                            }
                            if (reason.toLowerCase().includes('gitlab') || reason.toLowerCase().includes('commits')) {
                                failurePatterns.gitlabGaps++;
                                specificIssues.gitlabGaps.push(`${project.code}: ${task.taskName}`);
                            }
                            if (reason.toLowerCase().includes('recursos') || reason.toLowerCase().includes('equipo')) {
                                failurePatterns.resourceIssues++;
                                specificIssues.resourceIssues.push(`${project.code}: ${task.taskName}`);
                            }
                        });
                    }
                    
                    // Check for delayed tasks
                    if (task.deviation < -10) {
                        failurePatterns.delayedTasks++;
                        specificIssues.delayedTasks.push(`${project.code}: ${task.taskName} (${task.deviation.toFixed(0)}%)`);
                    }
                    
                    // Check for blocked tasks
                    if (task.status === 'Bloqueada') {
                        failurePatterns.blockedTasks++;
                        specificIssues.blockedTasks.push(`${project.code}: ${task.taskName}`);
                    }
                });
            }
        });
        
        let failureHTML = '';
        
        if (failurePatterns.apiIssues > 0) {
            failureHTML += `
                <div class="failure-card">
                    <div class="failure-card-header">
                        <div class="failure-icon">🔌</div>
                        <div class="failure-title">Problemas con APIs de Terceros</div>
                    </div>
                    <div class="failure-count">${failurePatterns.apiIssues}</div>
                    <div class="failure-description">Tareas bloqueadas o retrasadas por dependencias externas. Esto representa un riesgo crítico que requiere planes de contingencia.</div>
                    <ul class="failure-list">
                        ${specificIssues.apiIssues.slice(0, 3).map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (failurePatterns.lowCoverage > 0) {
            failureHTML += `
                <div class="failure-card">
                    <div class="failure-card-header">
                        <div class="failure-icon">🧪</div>
                        <div class="failure-title">Baja Cobertura de Tests</div>
                    </div>
                    <div class="failure-count">${failurePatterns.lowCoverage}</div>
                    <div class="failure-description">Tareas con cobertura de pruebas insuficiente según SonarQube. Esto aumenta el riesgo de bugs en producción.</div>
                    <ul class="failure-list">
                        ${specificIssues.lowCoverage.slice(0, 3).map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (failurePatterns.gitlabGaps > 0) {
            failureHTML += `
                <div class="failure-card">
                    <div class="failure-card-header">
                        <div class="failure-icon">📝</div>
                        <div class="failure-title">Problemas en GitLab</div>
                    </div>
                    <div class="failure-count">${failurePatterns.gitlabGaps}</div>
                    <div class="failure-description">Tareas sin código, commits inconsistentes o MRs pendientes. Indica falta de seguimiento en control de versiones.</div>
                    <ul class="failure-list">
                        ${specificIssues.gitlabGaps.slice(0, 3).map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (failurePatterns.delayedTasks > 0) {
            failureHTML += `
                <div class="failure-card">
                    <div class="failure-card-header">
                        <div class="failure-icon">⏰</div>
                        <div class="failure-title">Tareas Críticamente Retrasadas</div>
                    </div>
                    <div class="failure-count">${failurePatterns.delayedTasks}</div>
                    <div class="failure-description">Tareas con desviación mayor a -10%. Requiere análisis de causa raíz y plan de recuperación inmediato.</div>
                    <ul class="failure-list">
                        ${specificIssues.delayedTasks.slice(0, 3).map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (failurePatterns.blockedTasks > 0) {
            failureHTML += `
                <div class="failure-card">
                    <div class="failure-card-header">
                        <div class="failure-icon">🚧</div>
                        <div class="failure-title">Tareas Bloqueadas</div>
                    </div>
                    <div class="failure-count">${failurePatterns.blockedTasks}</div>
                    <div class="failure-description">Tareas completamente bloqueadas esperando resolución de impedimentos. Impacto directo en cronograma.</div>
                    <ul class="failure-list">
                        ${specificIssues.blockedTasks.slice(0, 3).map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (failureHTML === '') {
            failureHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">Excelente trabajo</div>
                    <div class="empty-state-text">No se han detectado patrones críticos de fallo en el portafolio actual.</div>
                </div>
            `;
        }
        
        $('#failureGrid').html(failureHTML);
    }

    function renderRecommendations(projects) {
        const recommendations = [];
        
        // Analyze portfolio and generate recommendations
        const criticalCount = projects.filter(p => Math.abs(p.actualProgress - p.plannedProgress) > 10).length;
        const pausedCount = projects.filter(p => p.status === 'En Pausa').length;
        
        if (criticalCount > 0) {
            recommendations.push({
                title: 'Gestión de Proyectos Críticos',
                text: `Hay ${criticalCount} proyecto(s) con desviación crítica. Convocar reuniones de emergencia y desarrollar planes de recuperación inmediatos.`
            });
        }
        
        if (pausedCount > 0) {
            recommendations.push({
                title: 'Reactivación de Proyectos',
                text: `${pausedCount} proyecto(s) en pausa. Revisar motivos de pausa y definir fechas de reactivación o cierre formal.`
            });
        }
        
        // Budget recommendations
        let overBudgetCount = 0;
        projects.forEach(p => {
            if (p.financialSummary) {
                const deviation = p.financialSummary.budgetConsumedPercent - p.actualProgress;
                if (deviation > 10) overBudgetCount++;
            }
        });
        
        if (overBudgetCount > 0) {
            recommendations.push({
                title: 'Control Presupuestal',
                text: `${overBudgetCount} proyecto(s) con consumo presupuestal por encima del avance. Implementar revisiones financieras semanales.`
            });
        }
        
        // Quality recommendations
        recommendations.push({
            title: 'Mejora de Calidad',
            text: 'Establecer revisiones de código obligatorias y mantener coverage de tests por encima del 80% en todos los proyectos.'
        });
        
        recommendations.push({
            title: 'Automatización de Validaciones',
            text: 'El predictor IA está identificando patrones exitosamente. Continuar alimentando el sistema con datos históricos para mejorar precisión.'
        });
        
        recommendations.push({
            title: 'Gestión de Dependencias',
            text: 'Crear matriz de dependencias externas (APIs, proveedores) con planes de contingencia para mitigar riesgos de bloqueo.'
        });
        
        let recsHTML = '';
        recommendations.forEach(rec => {
            recsHTML += `
                <div class="recommendation-item">
                    <div class="recommendation-item-title">${rec.title}</div>
                    <div class="recommendation-item-text">${rec.text}</div>
                </div>
            `;
        });
        
        $('#recommendationsGrid').html(recsHTML);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function showLoading(show) {
        if (show) {
            $('#loadingState').addClass('active');
            $('#mainContent').hide();
        } else {
            $('#loadingState').removeClass('active');
        }
    }

    function showEmptyState() {
        $('#mainContent').hide();
        $('#loadingState').html(`
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No hay datos</div>
                <div class="empty-state-text">No se encontraron proyectos con los filtros aplicados.</div>
            </div>
        `).addClass('active');
    }

    function updateLastUpdateTime() {
        const now = new Date();
        const formatted = `${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`;
        $('#lastUpdate').text(`Última actualización: ${formatted}`);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    function getColorByDeviation(deviation) {
        const absDeviation = Math.abs(deviation);
        if (absDeviation <= 5) return '#10b981';
        if (absDeviation <= 10) return '#f59e0b';
        return '#ef4444';
    }

    // ============================================
    // START APPLICATION
    // ============================================
    
    init();
});
