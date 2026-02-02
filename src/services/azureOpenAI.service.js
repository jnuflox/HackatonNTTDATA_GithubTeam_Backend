const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

/**
 * Azure OpenAI Service
 * Implements advanced prompting techniques for project analysis
 * - Chain-of-Thought reasoning
 * - Few-shot learning
 * - Role-based prompting
 * - Structured output
 */
class AzureOpenAIService {
  constructor() {
    this.mockMode = process.env.AZURE_OPENAI_MOCK_MODE === 'true';
    
    if (!this.mockMode) {
      this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      this.apiKey = process.env.AZURE_OPENAI_API_KEY;
      this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
      this.apiVersion = process.env.AZURE_OPENAI_API_VERSION;
      
      this.client = new OpenAIClient(
        this.endpoint,
        new AzureKeyCredential(this.apiKey)
      );
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
      const response = await this.client.getChatCompletions(
        this.deploymentName,
        [
          {
            role: 'system',
            content: this._getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.3, // Lower for more deterministic analysis
          maxTokens: 2000,
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      );

      const content = response.choices[0].message.content;
      return this._parseAnalysisResponse(content);
      
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error);
      throw new Error('Failed to analyze project with AI');
    }
  }

  /**
   * System prompt with role definition and output structure
   */
  _getSystemPrompt() {
    return `You are an expert Project Management Analyst AI specialized in ITIL, PMP, and PRINCE2 methodologies.

Your expertise includes:
- Risk assessment and mitigation strategies
- Schedule analysis and deviation detection
- Resource allocation optimization
- Budget tracking and forecasting
- Stakeholder communication recommendations

You must analyze project data and provide structured insights in JSON format.

Output Structure:
{
  "status": "string - Overall project health assessment",
  "risks": [
    {
      "category": "Schedule|Budget|Resources|Quality|Scope",
      "severity": "High|Medium|Low",
      "description": "Detailed risk description",
      "impact": "Potential impact on project",
      "mitigation": "Recommended mitigation strategy"
    }
  ],
  "recommendations": [
    {
      "priority": "Critical|High|Medium|Low",
      "action": "Recommended action",
      "rationale": "Why this action is important",
      "expectedImpact": "Expected outcome"
    }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2"
  ],
  "healthScore": number (0-100),
  "predictedCompletionDate": "YYYY-MM-DD",
  "confidenceLevel": number (0-100)
}

Use Chain-of-Thought reasoning: Analyze step-by-step before concluding.
Be specific, actionable, and data-driven in your recommendations.`;
  }

  /**
   * Build comprehensive project analysis prompt using Few-Shot technique
   */
  _buildProjectAnalysisPrompt(projectData) {
    const { project, tasks = [], history = [] } = projectData;

    // Calculate key metrics
    const deviation = project.actual_progress - project.planned_progress;
    const tasksCompleted = tasks.filter(t => t.status === 'Completada').length;
    const tasksTotal = tasks.length;
    const tasksBlocked = tasks.filter(t => t.status === 'Bloqueada').length;

    // Build prompt with structured context
    return `# Project Analysis Request

## Project Overview
- **Code**: ${project.code}
- **Name**: ${project.name}
- **Status**: ${project.status}
- **Leader**: ${project.leader}
- **Timeline**: ${project.start_date} to ${project.end_date}
- **Planned Progress**: ${project.planned_progress}%
- **Actual Progress**: ${project.actual_progress}%
- **Deviation**: ${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}%

## Financial Data
- **Budget Total**: $${project.budget_total || 0}
- **Budget Consumed**: $${project.budget_consumed || 0}
- **Budget Consumed %**: ${project.budget_total ? ((project.budget_consumed / project.budget_total) * 100).toFixed(2) : 0}%

## Task Statistics
- **Total Tasks**: ${tasksTotal}
- **Completed**: ${tasksCompleted}
- **In Progress**: ${tasks.filter(t => t.status === 'En Progreso').length}
- **Pending**: ${tasks.filter(t => t.status === 'Pendiente').length}
- **Blocked**: ${tasksBlocked}
- **Completion Rate**: ${tasksTotal > 0 ? ((tasksCompleted / tasksTotal) * 100).toFixed(2) : 0}%

## Recent Changes (Last ${Math.min(history.length, 5)})
${history.slice(0, 5).map(h => `- ${h.date}: ${h.title} - ${h.description}`).join('\n') || 'No recent history'}

## High-Risk Tasks
${tasks.filter(t => t.ai_risk_level === 'high' || t.ai_risk_level === 'critical')
  .slice(0, 5)
  .map(t => `- ${t.task_code}: ${t.name} (${t.status})`)
  .join('\n') || 'No high-risk tasks identified'}

## Analysis Instructions

Please analyze this project using the following framework:

### Step 1: Health Assessment
Evaluate overall project health considering:
- Schedule adherence (deviation analysis)
- Budget utilization vs progress
- Task completion rate
- Blocked tasks impact

### Step 2: Risk Identification
Identify specific risks in these categories:
- **Schedule Risks**: Delays, critical path issues
- **Budget Risks**: Overspending, burn rate
- **Resource Risks**: Bottlenecks, dependencies
- **Quality Risks**: Blocked tasks, rework
- **Scope Risks**: Scope creep indicators

### Step 3: Predictive Analysis
Based on current data:
- Predict realistic completion date
- Forecast budget overrun probability
- Identify critical tasks needing attention

### Step 4: Actionable Recommendations
Provide prioritized actions for:
1. Critical issues requiring immediate attention
2. High-priority optimization opportunities
3. Preventive measures for identified risks

## Few-Shot Example

Given a project with:
- Deviation: -5% (behind schedule)
- Budget consumed: 40%, Progress: 30%
- Blocked tasks: 3 out of 20

Expected analysis includes:
- Risk: High schedule risk due to negative deviation
- Risk: Medium budget risk (spending faster than progress)
- Recommendation: Unblock the 3 tasks immediately
- Recommendation: Review resource allocation
- Health Score: ~65/100
- Confidence: 85%

Now analyze the project data above and provide comprehensive structured JSON output.`;
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
   * Mock AI analysis for development (when AZURE_OPENAI_MOCK_MODE=true)
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
        mitigation: 'Revisar el cronograma, reasignar recursos críticos y considerar reducir alcance no esencial'
      });
      recommendations.push({
        priority: 'Critical',
        action: 'Realizar sesión de replanning con el equipo',
        rationale: 'La desviación supera el 10%, indicando problemas estructurales en la planificación',
        expectedImpact: 'Realinear expectativas y compromisos con stakeholders'
      });
    } else if (deviationAbs > 5) {
      healthScore -= 10;
      risks.push({
        category: 'Schedule',
        severity: 'Medium',
        description: `Desviación moderada de ${deviation.toFixed(1)}% en el avance del proyecto`,
        impact: 'Requiere monitoreo cercano para evitar escalamiento',
        mitigation: 'Implementar checkpoints semanales y revisar tareas críticas'
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
        mitigation: 'Revisar gastos, negociar con proveedores y optimizar uso de recursos'
      });
      recommendations.push({
        priority: 'High',
        action: 'Auditar gastos y establecer controles de presupuesto más estrictos',
        rationale: 'El burn rate actual proyecta un sobrecosto del 15-20%',
        expectedImpact: 'Contener gastos y mantener el proyecto dentro del presupuesto'
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
        mitigation: 'Resolver bloqueadores de forma urgente, escalar si es necesario'
      });
      recommendations.push({
        priority: 'Critical',
        action: 'Desbloquear inmediatamente las tareas críticas',
        rationale: 'Las tareas bloqueadas generan efecto cascada negativo',
        expectedImpact: 'Restaurar flujo de trabajo normal'
      });
    }

    // Positive indicators
    if (deviation > 0 && deviation <= 5) {
      recommendations.push({
        priority: 'Low',
        action: 'Documentar buenas prácticas del equipo',
        rationale: 'El proyecto está adelantado, capturar factores de éxito',
        expectedImpact: 'Replicar éxito en futuros proyectos'
      });
    }

    // General recommendations
    recommendations.push({
      priority: 'Medium',
      action: 'Realizar retrospectiva con el equipo',
      rationale: 'Identificar oportunidades de mejora continua',
      expectedImpact: 'Mejorar eficiencia y moral del equipo'
    });

    // Calculate predicted completion
    const daysTotal = this._daysBetween(project.start_date, project.end_date);
    const daysElapsed = this._daysBetween(project.start_date, new Date());
    const progressRate = daysElapsed > 0 ? project.actual_progress / daysElapsed : 0;
    const predictedDays = progressRate > 0 ? (100 / progressRate) : daysTotal;
    const predictedDate = this._addDays(project.start_date, predictedDays);

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
        `${tasks.length - tasksCompleted} tareas pendientes de ${tasks.length} totales`
      ],
      healthScore,
      predictedCompletionDate: predictedDate,
      confidenceLevel: healthScore > 70 ? 85 : 65
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

module.exports = new AzureOpenAIService();
