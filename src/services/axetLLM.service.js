const axios = require('axios');

/**
 * NTT Data Axet LLM Enabler Service
 * Implements advanced prompting techniques for project analysis
 * - Chain-of-Thought reasoning
 * - Few-shot learning
 * - Role-based prompting
 * - Structured output
 */
class AxetLLMService {
  constructor() {
    this.mockMode = process.env.AXET_MOCK_MODE === 'true';
    
    if (!this.mockMode) {
      // Axet configuration
      this.baseUrl = process.env.AXET_BASE_URL || 'https://axet-pre.nttdata.com';
      this.projectId = process.env.AXET_PROJECT_ID;
      this.userId = process.env.AXET_USER_ID;
      this.assetId = process.env.AXET_ASSET_ID;
      this.model = process.env.AXET_MODEL || 'gpt-5.1';
      
      // Token management
      this.tokenUrl = process.env.AXET_TOKEN_URL || 'https://talkg.activos-coe.deptapps.everis.cloud/g';
      this.tokenAuth = process.env.AXET_TOKEN_AUTH; // Bearer token for getting token
      this.axetFlowId = process.env.AXET_FLOW_ID;
      this.environment = process.env.AXET_ENVIRONMENT || 'DEV';
      this.userOktaId = process.env.AXET_USER_OKTA_ID;
      
      this.accessToken = null;
      this.tokenExpiry = null;
    }
  }

  /**
   * Get or refresh access token
   */
  async _getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          axetFlowId: this.axetFlowId,
          enviroment: this.environment,
          userOktaId: this.userOktaId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.tokenAuth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.token || response.data.access_token;
      // Set expiry to 50 minutes (tokens usually last 1 hour)
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Axet access token:', error.message);
      throw new Error('Failed to authenticate with Axet service');
    }
  }

  /**
   * Analyze project with AI using advanced prompting techniques
   * @param {Object} projectData - Project data including tasks, history, etc.
   * @returns {Promise<Object>} - AI analysis result
   */
  async analyzeProject(projectData) {
    if (this.mockMode) {
      return this._mockAnalyzeProject(projectData);
    }

    const prompt = this._buildProjectAnalysisPrompt(projectData);
    
    try {
      // Get access token
      const token = await this._getAccessToken();
      
      // Build Axet LLM Enabler API URL
      const url = `${this.baseUrl}/api/llm-enabler/v2/openai/ntt/${this.projectId}/v1/responses`;
      
      // Call Axet API with proper structure
      const response = await axios.post(
        url,
        {
          model: this.model,
          input: [
            {
              role: 'system',
              content: this._getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'axet-project-id': this.projectId,
            'axet-user-id': this.userId,
            'axet-asset-id': this.assetId
          }
        }
      );

      // Extract content from Axet response
      // Response structure may vary, adjust based on actual API response
      const content = response.data.choices?.[0]?.message?.content || 
                     response.data.content || 
                     response.data.output;
      
      if (!content) {
        throw new Error('No content in Axet API response');
      }

      return this._parseAnalysisResponse(content);
      
    } catch (error) {
      console.error('Error calling Axet LLM Enabler:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error('Failed to analyze project with AI');
    }
  }

  /**
   * Enhanced system prompt with comprehensive role definition and output structure
   * Uses Role-Based Prompting and Structured Output techniques
   */
  _getSystemPrompt() {
    return `You are an expert Project Management Analyst AI with deep specialization in ITIL, PMP, PRINCE2, and Agile methodologies.

## Your Core Competencies:

### Risk Management
- Identify early warning signs of project risks across all domains
- Assess risk severity using quantitative metrics (probability × impact)
- Prioritize risks by criticality and urgency
- Recommend evidence-based mitigation strategies with clear action plans

### Schedule & Progress Analysis
- Detect schedule deviations and their root causes
- Analyze critical path impacts and dependencies
- Evaluate milestone achievement rates and trends
- Predict completion dates with confidence intervals

### Financial Analysis
- Monitor budget consumption vs project progress (Earned Value Analysis)
- Identify cost overruns and their contributing factors
- Forecast final costs using burn rate analysis
- Recommend cost optimization opportunities

### Resource & Quality Management
- Assess resource allocation efficiency
- Identify bottlenecks and blocked work items
- Evaluate team velocity and productivity trends
- Monitor quality indicators and technical debt

### Stakeholder Communication
- Generate executive-level summaries with key insights
- Prioritize information by business impact
- Translate technical issues into business language
- Recommend escalation paths for critical issues

## Output Requirements:

You MUST respond with valid JSON adhering to this exact structure:

{
  "status": "string - Concise 1-2 sentence project health summary",
  "healthScore": number (0-100, where 0=critical failure, 100=perfect health),
  "risks": [
    {
      "category": "Schedule|Budget|Resources|Quality|Scope|Technical|External",
      "severity": "Critical|High|Medium|Low",
      "description": "Clear, specific description of the risk (max 200 chars)",
      "impact": "Quantifiable impact on timeline, budget, quality, or deliverables",
      "mitigation": "Concrete, actionable mitigation strategy with specific steps",
      "estimatedEffort": "Time/resources required to mitigate (optional)"
    }
  ],
  "recommendations": [
    {
      "priority": "Critical|High|Medium|Low",
      "action": "Specific, actionable recommendation (verb-led, clear)",
      "rationale": "Data-driven justification with metrics or evidence",
      "expectedImpact": "Measurable expected outcome (time saved, cost reduced, risk mitigated)",
      "timeframe": "Suggested implementation timeframe (immediate/short-term/long-term)"
    }
  ],
  "insights": [
    "string - Data-driven insight with supporting metrics",
    "string - Pattern or trend identified from project data",
    "string - Success factor or concern requiring attention"
  ],
  "predictedCompletionDate": "YYYY-MM-DD - Evidence-based prediction",
  "confidenceLevel": number (0-100, based on data completeness and trend consistency),
  "keyMetrics": {
    "schedulePerformanceIndex": number (actual_progress / planned_progress),
    "costPerformanceIndex": number (planned_budget_at_progress / actual_spent),
    "taskCompletionRate": number (percentage),
    "criticalIssuesCount": number
  }
}

## Analysis Methodology:

1. **Data Assessment** (Step 1):
   - Review all provided metrics (progress, budget, tasks, timeline)
   - Identify data quality and completeness
   - Note any missing critical information

2. **Risk Identification** (Step 2):
   - Calculate Schedule Performance Index (SPI) = actual_progress / planned_progress
   - Calculate Cost Performance Index (CPI) = (planned_budget * progress) / actual_spent
   - Identify blocked tasks and their downstream impacts
   - Assess timeline pressure (days remaining vs work remaining)

3. **Impact Analysis** (Step 3):
   - Quantify the business impact of each identified risk
   - Prioritize risks by (severity × likelihood)
   - Consider cascading effects on dependent tasks/milestones

4. **Recommendation Synthesis** (Step 4):
   - Generate specific, actionable recommendations
   - Prioritize by urgency and impact
   - Ensure recommendations are resource-feasible
   - Include quick wins alongside strategic actions

## Quality Standards:

- ✅ Use data-driven analysis (reference specific metrics)
- ✅ Provide quantifiable insights whenever possible
- ✅ Be specific and actionable (avoid vague statements)
- ✅ Consider both immediate and strategic perspectives
- ✅ Balance optimism with realistic risk assessment
- ❌ Never make assumptions about missing data
- ❌ Avoid generic advice without project context
- ❌ Don't ignore negative indicators or warning signs

## Response Format:
- Return ONLY valid JSON (no markdown, no code blocks, no additional text)
- Ensure all arrays contain at least one element
- Validate that all required fields are present
- Keep descriptions concise but informative (optimize for clarity)

Use Chain-of-Thought reasoning internally: Analyze step-by-step following the 4-step methodology, then present conclusions in the structured JSON format.`;
  }

  /**
   * Build comprehensive project analysis prompt using advanced prompting techniques:
   * - Few-Shot Learning: Includes example analysis
   * - Contextual Data Injection: Rich, structured project data
   * - Chain-of-Thought guidance: Step-by-step analysis instructions
   */
  _buildProjectAnalysisPrompt(projectData) {
    const { project, tasks = [], history = [] } = projectData;

    // Calculate advanced metrics
    const deviation = project.actual_progress - project.planned_progress;
    const tasksCompleted = tasks.filter(t => t.status === 'Completada').length;
    const tasksInProgress = tasks.filter(t => t.status === 'En Progreso').length;
    const tasksPending = tasks.filter(t => t.status === 'Pendiente').length;
    const tasksBlocked = tasks.filter(t => t.status === 'Bloqueada').length;
    const tasksTotal = tasks.length;
    const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
    
    // Financial metrics
    const budgetTotal = project.budget_total || 0;
    const budgetConsumed = project.budget_consumed || 0;
    const budgetPercentage = budgetTotal > 0 ? (budgetConsumed / budgetTotal) * 100 : 0;
    
    // Performance indices (Earned Value Management)
    const schedulePerformanceIndex = project.planned_progress > 0 
      ? (project.actual_progress / project.planned_progress) 
      : 1;
    const costPerformanceIndex = budgetConsumed > 0
      ? ((budgetTotal * (project.actual_progress / 100)) / budgetConsumed)
      : 1;
    
    // Timeline analysis
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const today = new Date();
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const timeElapsedPercentage = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
    
    // Identify high-risk tasks
    const highRiskTasks = tasks
      .filter(t => ['Bloqueada', 'Retrasada'].includes(t.status) || 
                   (t.actual_progress < 50 && t.status === 'En Progreso'))
      .map(t => `- ${t.task_code}: ${t.name} (${t.status}${t.actual_progress ? `, ${t.actual_progress}% complete` : ''})`)
      .slice(0, 5);

    // Recent activity summary
    const recentHistory = history
      .slice(0, 3)
      .map(h => `- ${h.change_date || 'Recent'}: ${h.change_description}`)
      .join('\n') || 'No recent activity recorded';

    // Build comprehensive prompt
    return `# 📊 PROJECT ANALYSIS REQUEST

## 📋 Project Overview

**Project Identity:**
- **Code:** ${project.code}
- **Name:** ${project.name}
- **Status:** ${project.status}
- **Project Leader:** ${project.leader || 'Not assigned'}
- **Description:** ${project.description || 'No description provided'}

**Timeline:**
- **Start Date:** ${project.start_date}
- **End Date:** ${project.end_date}
- **Total Duration:** ${totalDays} days
- **Time Elapsed:** ${elapsedDays} days (${timeElapsedPercentage.toFixed(1)}%)
- **Time Remaining:** ${remainingDays} days

**Progress Metrics:**
- **Planned Progress:** ${project.planned_progress}%
- **Actual Progress:** ${project.actual_progress}%
- **Schedule Deviation:** ${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}%
- **Schedule Performance Index (SPI):** ${schedulePerformanceIndex.toFixed(2)} ${schedulePerformanceIndex >= 1 ? '✅' : '⚠️'}

---

## 💰 Financial Overview

**Budget Status:**
- **Total Budget:** $${budgetTotal.toLocaleString()}
- **Budget Consumed:** $${budgetConsumed.toLocaleString()}
- **Budget Remaining:** $${(budgetTotal - budgetConsumed).toLocaleString()}
- **Consumption Rate:** ${budgetPercentage.toFixed(2)}%
- **Cost Performance Index (CPI):** ${costPerformanceIndex.toFixed(2)} ${costPerformanceIndex >= 1 ? '✅' : '⚠️'}

**Financial Health:**
${budgetPercentage > project.actual_progress + 10 
  ? '⚠️ WARNING: Budget consumption exceeds progress - potential cost overrun'
  : budgetPercentage < project.actual_progress - 10
    ? '✅ POSITIVE: Budget underspend relative to progress'
    : '✅ Budget aligned with progress'}

---

## 📝 Task Statistics & Distribution

**Overall Statistics:**
- **Total Tasks:** ${tasksTotal}
- **Completed:** ${tasksCompleted} (${completionRate.toFixed(1)}%)
- **In Progress:** ${tasksInProgress}
- **Pending:** ${tasksPending}
- **Blocked:** ${tasksBlocked} ${tasksBlocked > 0 ? '⚠️ ATTENTION REQUIRED' : ''}

**Task Health Indicators:**
- **Completion Rate:** ${completionRate.toFixed(1)}%
- **Active Work Ratio:** ${tasksTotal > 0 ? ((tasksInProgress / tasksTotal) * 100).toFixed(1) : 0}%
- **Blocked Task Ratio:** ${tasksTotal > 0 ? ((tasksBlocked / tasksTotal) * 100).toFixed(1) : 0}%

${tasksBlocked > 0 ? `\n**⚠️ High-Risk/Blocked Tasks:**\n${highRiskTasks.join('\n')}` : ''}

---

## 📜 Recent Activity & Changes

${recentHistory}

---

## 🎯 ANALYSIS INSTRUCTIONS

Please perform a comprehensive 4-step analysis following the Chain-of-Thought methodology:

### Step 1: Data Assessment & Validation
- Review all metrics provided above
- Calculate additional performance indicators if needed
- Identify any data gaps or inconsistencies
- Note the overall data quality

### Step 2: Risk Identification & Quantification
- Evaluate Schedule Risk:
  * Compare SPI (${schedulePerformanceIndex.toFixed(2)}) against healthy threshold (>= 1.0)
  * Assess ${tasksBlocked} blocked task(s) impact on timeline
  * Analyze ${remainingDays} days remaining vs ${100 - project.actual_progress}% work left
  
- Evaluate Cost Risk:
  * Compare CPI (${costPerformanceIndex.toFixed(2)}) against healthy threshold (>= 1.0)
  * Assess burn rate: ${budgetPercentage.toFixed(1)}% spent vs ${project.actual_progress}% complete
  
- Evaluate Resource Risk:
  * ${tasksBlocked} blocked tasks may indicate resource constraints
  * ${tasksInProgress} active tasks vs team capacity
  
- Evaluate Quality/Scope Risk:
  * Review recent history for scope changes or quality issues
  * Assess if rapid progress indicates potential technical debt

### Step 3: Impact Analysis & Prioritization
- For each identified risk:
  * Quantify potential impact (days delayed, $ cost, quality degradation)
  * Assess likelihood (High/Medium/Low)
  * Calculate priority score (Impact × Likelihood)
  * Identify cascading effects on dependent tasks/milestones

### Step 4: Recommendation Synthesis
- Generate 3-5 actionable recommendations prioritized by:
  * Critical: Must address in next 48 hours
  * High: Address within 1-2 weeks
  * Medium: Address within sprint/month
  * Low: Monitor and plan for future
  
- For each recommendation:
  * Specify concrete actions (who, what, when)
  * Justify with data and metrics
  * Estimate effort required and expected benefit
  * Define success criteria

---

## 📌 EXAMPLE ANALYSIS (Few-Shot Reference)

**Example Project Context:**
\`\`\`
Project: E-Commerce Platform Migration
Duration: 180 days | Elapsed: 120 days (67%)
Planned Progress: 65% | Actual Progress: 58% (Deviation: -7%)
Budget: $800,000 | Spent: $560,000 (70%)
Tasks: 60 total | 32 complete | 18 in progress | 8 blocked
SPI: 0.89 | CPI: 0.93
\`\`\`

**Example Expected Output:**
\`\`\`json
{
  "status": "Project experiencing moderate schedule and budget pressure with 8 blocked tasks creating critical path risk",
  "healthScore": 68,
  "risks": [
    {
      "category": "Schedule",
      "severity": "High",
      "description": "7% behind schedule with 8 blocked tasks impacting critical path",
      "impact": "Current trajectory projects 12-15 day delay in go-live date, affecting Q4 revenue targets",
      "mitigation": "Immediately unblock 3 critical-path tasks by reassigning senior developers, escalate infrastructure dependencies to VP Engineering"
    },
    {
      "category": "Budget",
      "severity": "High",
      "description": "70% budget consumed at 58% completion indicates 19% cost overrun trajectory",
      "impact": "Projected final cost: $965,000 ($165k over budget, 21% overrun)",
      "mitigation": "Conduct immediate cost audit, reduce external contractor hours, negotiate fixed-price for remaining cloud migration work"
    }
  ],
  "recommendations": [
    {
      "priority": "Critical",
      "action": "Unblock 8 blocked tasks within 72 hours by addressing infrastructure and dependency issues",
      "rationale": "Blocked tasks on critical path directly delay go-live; each day costs $15k in opportunity cost",
      "expectedImpact": "Restore project velocity, prevent additional 2-week delay, save $210k in opportunity cost",
      "timeframe": "immediate"
    },
    {
      "priority": "High",
      "action": "Implement weekly burn rate review and enforce approval process for expenses >$5k",
      "rationale": "Current CPI of 0.93 indicates cost inefficiency; without intervention will exceed budget by $165k",
      "expectedImpact": "Reduce cost overrun to <10% ($80k), save $85k",
      "timeframe": "short-term"
    }
  ],
  "insights": [
    "SPI of 0.89 indicates project is losing ground; velocity must increase 26% to hit original target",
    "8 blocked tasks (13% of total) suggest systemic dependency management issue, not isolated incidents",
    "Budget consumption (70%) outpacing progress (58%) by 12 points is significant red flag",
    "Recent history shows 3 scope expansions without timeline adjustment - root cause of schedule pressure"
  ],
  "predictedCompletionDate": "2024-12-15",
  "confidenceLevel": 72,
  "keyMetrics": {
    "schedulePerformanceIndex": 0.89,
    "costPerformanceIndex": 0.93,
    "taskCompletionRate": 53,
    "criticalIssuesCount": 8
  }
}
\`\`\`

---

## 🎯 NOW ANALYZE THE PROJECT DATA PROVIDED ABOVE

Using the same level of detail, specificity, and quantification demonstrated in the example, analyze the current project.

**Requirements:**
- Reference specific metrics from the data (SPI, CPI, task counts, dates)
- Quantify impacts in concrete terms (days, dollars, percentages)
- Make predictions based on current trajectory
- Prioritize recommendations by urgency and business impact
- Provide at least 3 risks and 3 recommendations
- Include 4-6 data-driven insights
- Calculate all metrics in keyMetrics section
- Ensure healthScore reflects overall project status (0-40=critical, 41-60=at-risk, 61-80=caution, 81-100=healthy)

Return ONLY the JSON output (no markdown, no code fences, no additional text).`;
  }

  /**
   * Parse AI response and validate structure
   */
  _parseAnalysisResponse(content) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const analysis = JSON.parse(jsonStr);

      // Validate required fields
      if (!analysis.status || !analysis.risks || !analysis.recommendations) {
        throw new Error('Missing required fields in analysis');
      }

      return analysis;
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw content:', content);
      throw new Error('Failed to parse AI analysis response');
    }
  }

  /**
   * Mock AI analysis for development (when AXET_MOCK_MODE=true)
   */
  _mockAnalyzeProject(projectData) {
    const { project, tasks = [] } = projectData;
    const deviation = project.actual_progress - project.planned_progress;
    const deviationAbs = Math.abs(deviation);

    // Simulate realistic AI analysis
    const risks = [];
    const recommendations = [];
    let healthScore = 85;

    // Schedule risk assessment
    if (deviationAbs > 10) {
      healthScore -= 20;
      risks.push({
        category: 'Schedule',
        severity: 'High',
        description: `El proyecto presenta una desviación de ${deviation.toFixed(1)}% respecto al plan original`,
        impact: 'Alto riesgo de no cumplir con la fecha de entrega planificada',
        mitigation: 'Revisar el cronograma, reasignar recursos críticos y considerar reducir alcance no esencial',
        estimatedEffort: '40-80 hours'
      });
      recommendations.push({
        priority: 'Critical',
        action: 'Realizar sesión de replanning con el equipo',
        rationale: 'La desviación supera el 10%, indicando problemas estructurales en la planificación',
        expectedImpact: 'Realinear expectativas y compromisos con stakeholders',
        timeframe: 'immediate'
      });
    } else if (deviationAbs > 5) {
      healthScore -= 10;
      risks.push({
        category: 'Schedule',
        severity: 'Medium',
        description: `Desviación moderada de ${deviation.toFixed(1)}% en el avance del proyecto`,
        impact: 'Requiere monitoreo cercano para evitar escalamiento',
        mitigation: 'Implementar checkpoints semanales y revisar tareas críticas',
        estimatedEffort: '20-40 hours'
      });
    }

    // Budget risk assessment
    const budgetConsumedPercent = project.budget_total ? 
      (project.budget_consumed / project.budget_total) * 100 : 0;
    
    if (budgetConsumedPercent > project.actual_progress + 10) {
      healthScore -= 15;
      risks.push({
        category: 'Budget',
        severity: 'High',
        description: `Presupuesto consumido (${budgetConsumedPercent.toFixed(1)}%) supera significativamente el avance (${project.actual_progress}%)`,
        impact: 'Riesgo de sobrecosto al finalizar el proyecto',
        mitigation: 'Revisar gastos, negociar con proveedores y optimizar uso de recursos',
        estimatedEffort: '40-60 hours'
      });
      recommendations.push({
        priority: 'High',
        action: 'Auditar gastos y establecer controles de presupuesto más estrictos',
        rationale: 'El burn rate actual proyecta un sobrecosto del 15-20%',
        expectedImpact: 'Contener gastos y mantener el proyecto dentro del presupuesto',
        timeframe: 'short-term'
      });
    }

    // Task completion risk
    const tasksCompleted = tasks.filter(t => t.status === 'Completada').length;
    const tasksBlocked = tasks.filter(t => t.status === 'Bloqueada').length;
    const completionRate = tasks.length > 0 ? (tasksCompleted / tasks.length) * 100 : 0;

    if (tasksBlocked > 0) {
      healthScore -= 5 * tasksBlocked;
      risks.push({
        category: 'Resources',
        severity: tasksBlocked > 2 ? 'High' : 'Medium',
        description: `${tasksBlocked} tarea(s) bloqueada(s) impidiendo el avance normal`,
        impact: 'Retrasos en cadena y afectación a tareas dependientes',
        mitigation: 'Resolver bloqueadores de forma urgente, escalar si es necesario',
        estimatedEffort: tasksBlocked > 2 ? '60-100 hours' : '30-60 hours'
      });
      recommendations.push({
        priority: 'Critical',
        action: 'Desbloquear inmediatamente las tareas críticas',
        rationale: 'Las tareas bloqueadas generan efecto cascada negativo',
        expectedImpact: 'Restaurar flujo de trabajo normal',
        timeframe: 'immediate'
      });
    }

    // Positive indicators
    if (deviation > 0 && deviation <= 5) {
      recommendations.push({
        priority: 'Low',
        action: 'Documentar buenas prácticas del equipo',
        rationale: 'El proyecto está adelantado, capturar factores de éxito',
        expectedImpact: 'Replicar éxito en futuros proyectos',
        timeframe: 'long-term'
      });
    }

    // General recommendations
    recommendations.push({
      priority: 'Medium',
      action: 'Realizar retrospectiva con el equipo',
      rationale: 'Identificar oportunidades de mejora continua',
      expectedImpact: 'Mejorar eficiencia y moral del equipo',
      timeframe: 'short-term'
    });

    // Calculate predicted completion
    const daysTotal = this._daysBetween(project.start_date, project.end_date);
    const daysElapsed = this._daysBetween(project.start_date, new Date());
    const progressRate = daysElapsed > 0 ? project.actual_progress / daysElapsed : 0;
    const predictedDays = progressRate > 0 ? (100 / progressRate) : daysTotal;
    const predictedDate = this._addDays(project.start_date, predictedDays);

    // Calculate performance indices
    const schedulePerformanceIndex = project.planned_progress > 0 ? 
      (project.actual_progress / project.planned_progress) : 1;
    const costPerformanceIndex = project.budget_consumed > 0 ?
      ((project.budget_total * (project.actual_progress / 100)) / project.budget_consumed) : 1;

    return {
      status: healthScore >= 80 ? 
        'Proyecto en buen estado general con algunos puntos de atención' :
        healthScore >= 60 ?
        'Proyecto requiere atención en áreas críticas identificadas' :
        'Proyecto en riesgo alto, requiere intervención inmediata',
      risks,
      recommendations,
      insights: [
        `Tasa de completitud de tareas: ${completionRate.toFixed(1)}%`,
        `Salud general del proyecto: ${healthScore}/100`,
        deviation > 0 ? 
          `Proyecto adelantado ${deviation.toFixed(1)}% - mantener momentum` :
          `Proyecto atrasado ${Math.abs(deviation).toFixed(1)}% - requiere acción`,
        `${tasks.length - tasksCompleted} tareas pendientes de ${tasks.length} totales`,
        `SPI: ${schedulePerformanceIndex.toFixed(2)} | CPI: ${costPerformanceIndex.toFixed(2)}`
      ],
      healthScore,
      predictedCompletionDate: predictedDate,
      confidenceLevel: healthScore > 70 ? 85 : 65,
      keyMetrics: {
        schedulePerformanceIndex: parseFloat(schedulePerformanceIndex.toFixed(2)),
        costPerformanceIndex: parseFloat(costPerformanceIndex.toFixed(2)),
        taskCompletionRate: parseFloat(completionRate.toFixed(1)),
        criticalIssuesCount: tasksBlocked + risks.filter(r => r.severity === 'High').length
      }
    };
  }

  // Helper methods
  _daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
  }

  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }
}

module.exports = new AxetLLMService();
