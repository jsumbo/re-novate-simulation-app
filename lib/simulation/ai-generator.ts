"use server";

import {
  SimulationContext,
  SimulationScenario,
  SimulationOption,
  SimulationResponse,
  SimulationResult,
  SimulationTask,
} from "./types";
import { generateDetailedFeedback } from "./ai-feedback-generator";

// This would integrate with OpenAI or another AI service
// For now, we'll create a sophisticated template-based system

const SCENARIO_TEMPLATES = {
  startup: [
    {
      title: "The Funding Crunch Crisis",
      context:
        "Your fintech startup in Monrovia faces multiple simultaneous challenges: funding is running low (2 months runway), your lead developer just quit, a competitor launched a similar product, and the Central Bank of Liberia is considering new regulations that could affect your business model.",
      challenge:
        "Navigate this multi-faceted crisis by making strategic decisions across funding, team management, competitive positioning, and regulatory compliance.",
      stakeholders: [
        "investors",
        "remaining_employees",
        "customers",
        "co-founders",
        "regulatory_bodies",
        "competitors",
      ],
      constraints: [
        "limited_time",
        "cash_flow",
        "team_morale",
        "regulatory_uncertainty",
        "competitive_pressure",
      ],
      success_metrics: [
        "runway_extension",
        "team_stability",
        "market_position",
        "regulatory_compliance",
        "customer_retention",
      ],
    },
    {
      title: "Product-Market Fit Pivot",
      context:
        "After 6 months, user engagement is low and feedback suggests your product doesn't solve the right problem.",
      challenge:
        "Decide whether to pivot your product strategy or double down on current approach.",
      stakeholders: [
        "users",
        "investors",
        "development_team",
        "early_customers",
      ],
      constraints: [
        "development_resources",
        "market_timing",
        "competitive_pressure",
      ],
      success_metrics: [
        "user_engagement",
        "market_validation",
        "revenue_potential",
      ],
    },
    {
      title: "First Customer Acquisition",
      context:
        "Your product is ready but you haven't secured your first paying customer yet.",
      challenge:
        "Choose the best strategy to acquire your first customers in the Liberian market.",
      stakeholders: [
        "potential_customers",
        "team",
        "advisors",
        "local_community",
      ],
      constraints: ["marketing_budget", "brand_awareness", "trust_building"],
      success_metrics: [
        "customer_acquisition",
        "revenue_generation",
        "market_feedback",
      ],
    },
    {
      title: "Regulatory Compliance Nightmare",
      context: "New government regulations threaten to shut down your operations within 30 days unless you comply with complex new requirements.",
      challenge: "Navigate regulatory compliance while maintaining business operations and customer trust.",
      stakeholders: ["regulatory_bodies", "customers", "employees", "legal_advisors"],
      constraints: ["compliance_deadline", "legal_costs", "operational_disruption"],
      success_metrics: ["regulatory_approval", "business_continuity", "cost_management"]
    },
    {
      title: "Talent War: Key Employee Exodus",
      context: "Three of your top performers just received competing offers from a well-funded competitor, and they're considering leaving.",
      challenge: "Retain critical talent while managing budget constraints and team morale.",
      stakeholders: ["key_employees", "remaining_team", "competitors", "investors"],
      constraints: ["salary_budget", "equity_pool", "company_culture"],
      success_metrics: ["talent_retention", "team_productivity", "competitive_advantage"]
    },
    {
      title: "Supply Chain Disruption Crisis",
      context: "Your main supplier in Ghana has shut down operations, leaving you with 2 weeks of inventory and no immediate alternatives.",
      challenge: "Secure alternative supply chains while maintaining product quality and customer commitments.",
      stakeholders: ["customers", "suppliers", "logistics_partners", "investors"],
      constraints: ["inventory_levels", "quality_standards", "cost_increases"],
      success_metrics: ["supply_continuity", "customer_satisfaction", "cost_control"]
    },
    {
      title: "Co-founder Conflict",
      context:
        "You and your co-founder disagree on the company's direction and equity split.",
      challenge:
        "Resolve the conflict while maintaining the partnership and company momentum.",
      stakeholders: ["co-founder", "employees", "investors", "advisors"],
      constraints: [
        "relationship_dynamics",
        "legal_implications",
        "company_culture",
      ],
      success_metrics: [
        "partnership_stability",
        "team_confidence",
        "operational_continuity",
      ],
    },
  ],
  growth: [
    {
      title: "The Great Scaling Dilemma",
      context:
        "Your company is growing rapidly but team communication and culture are suffering.",
      challenge:
        "Balance rapid growth with maintaining company culture and operational efficiency.",
      stakeholders: [
        "existing_employees",
        "new_hires",
        "management",
        "customers",
      ],
      constraints: ["hiring_budget", "training_time", "cultural_integration"],
      success_metrics: [
        "employee_satisfaction",
        "productivity",
        "customer_satisfaction",
      ],
    },
    {
      title: "Digital Transformation Crossroads",
      context: "Your traditional business model is being disrupted by digital competitors, and customers are demanding online services.",
      challenge: "Transform your business digitally while maintaining existing operations and customer relationships.",
      stakeholders: ["traditional_customers", "digital_natives", "employees", "technology_partners"],
      constraints: ["technology_budget", "employee_skills", "customer_adoption"],
      success_metrics: ["digital_revenue", "customer_retention", "operational_efficiency"]
    },
    {
      title: "Acquisition Opportunity Dilemma",
      context: "A smaller competitor has approached you for acquisition, but it would stretch your resources and require significant integration effort.",
      challenge: "Evaluate whether to acquire the competitor or focus on organic growth.",
      stakeholders: ["acquisition_target", "employees", "customers", "investors"],
      constraints: ["financial_resources", "integration_complexity", "market_timing"],
      success_metrics: ["market_share", "revenue_growth", "integration_success"]
    },
    {
      title: "Market Expansion Decision",
      context:
        "Your business is successful locally and you're considering expanding to other West African markets.",
      challenge:
        "Decide whether to expand regionally or consolidate your position in Liberia first.",
      stakeholders: [
        "current_customers",
        "potential_customers",
        "investors",
        "regulatory_bodies",
      ],
      constraints: [
        "expansion_capital",
        "regulatory_compliance",
        "local_partnerships",
      ],
      success_metrics: [
        "market_penetration",
        "revenue_growth",
        "operational_efficiency",
      ],
    },
    {
      title: "Technology Investment",
      context:
        "Your manual processes are becoming bottlenecks as you scale operations.",
      challenge:
        "Choose the right technology investments to support growth without over-investing.",
      stakeholders: [
        "operations_team",
        "customers",
        "investors",
        "technology_partners",
      ],
      constraints: [
        "technology_budget",
        "implementation_time",
        "staff_training",
      ],
      success_metrics: [
        "operational_efficiency",
        "customer_satisfaction",
        "cost_reduction",
      ],
    },
  ],
  established: [
    {
      title: "Legacy System Modernization Crisis",
      context:
        "A new competitor with innovative technology is threatening your market position.",
      challenge:
        "Decide how to respond to competitive threats while maintaining current operations.",
      stakeholders: ["shareholders", "customers", "employees", "partners"],
      constraints: [
        "innovation_budget",
        "legacy_systems",
        "market_expectations",
      ],
      success_metrics: [
        "market_share",
        "innovation_speed",
        "customer_retention",
      ],
    },
  ],
};

const OPTION_TEMPLATES = {
  aggressive: {
    risk_level: "high" as const,
    patterns: [
      "Take bold action to {action} despite the risks",
      "Invest heavily in {solution} to gain competitive advantage",
      "Make dramatic changes to {area} immediately",
    ],
  },
  conservative: {
    risk_level: "low" as const,
    patterns: [
      "Take a measured approach to {action} with careful planning",
      "Gradually implement {solution} with pilot testing",
      "Maintain current {area} while making small improvements",
    ],
  },
  innovative: {
    risk_level: "medium" as const,
    patterns: [
      "Explore creative solutions for {problem} using new approaches",
      "Partner with others to {action} and share resources",
      "Redesign {area} with user-centered innovation",
    ],
  },
};

export async function generateSimulation(
  context: SimulationContext,
  userHistory?: any[]
): Promise<SimulationResponse> {
  // Analyze user history to avoid repetition and increase difficulty
  const usedScenarios = userHistory?.map((h) => h.scenarioType) || [];
  const userPerformance = calculateUserPerformance(userHistory);

  // Select appropriate scenario template based on business stage and history
  const templates =
    SCENARIO_TEMPLATES[context.businessStage] || SCENARIO_TEMPLATES.startup;
  const availableTemplates = templates.filter(
    (t) => !usedScenarios.includes(t.title)
  );
  const selectedTemplate =
    availableTemplates.length > 0
      ? availableTemplates[
          Math.floor(Math.random() * availableTemplates.length)
        ]
      : templates[Math.floor(Math.random() * templates.length)];

  // Generate contextual scenario with user history consideration
  const careerSpecificTitle = generateCareerSpecificTitle(selectedTemplate.title, context.user_background.career_path);
  
  const scenario: SimulationScenario = {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: careerSpecificTitle,
    context: `${selectedTemplate.context} Your ${context.user_background.career_path} background gives you unique insights into this situation.`,
    situation: generateSituation(context, selectedTemplate, userPerformance),
    challenge: selectedTemplate.challenge,
    stakeholders: selectedTemplate.stakeholders,
    constraints: selectedTemplate.constraints,
    success_metrics: selectedTemplate.success_metrics,
    difficulty_level: calculateDifficulty(context, userPerformance),
    estimated_time: 10 + Math.floor(Math.random() * 10), // 10-20 minutes
  };

  // Generate complex multi-task simulation
  const tasks = generateComplexTasks(context, scenario, userPerformance);

  // Create AI context for personalized experience
  const ai_context = generateAIContext(context, scenario);

  // Define learning objectives
  const learning_objectives = generateLearningObjectives(context, scenario);

  // Calculate total possible points
  const total_points = tasks.reduce(
    (sum, task) => sum + (task.required ? 20 : 10),
    0
  );

  return {
    scenario,
    tasks,
    ai_context,
    learning_objectives,
    total_points,
  };
}

function generateSituation(
  context: SimulationContext,
  template: any,
  userPerformance?: {
    averageScore: number;
    strongSkills: string[];
    weakSkills: string[];
  }
): string {
  let situations = [
    `In ${context.location}, your ${context.industry} business faces this challenge during ${context.market_conditions} market conditions.`,
    `With a team of ${
      context.resources.team_size
    } and a budget of $${context.resources.budget.toLocaleString()}, you must navigate this situation.`,
    `Given your ${context.user_background.career_path} expertise and current skill level, this scenario tests your decision-making abilities.`,
  ];

  // Add personalized situations based on user performance
  if (userPerformance) {
    if (userPerformance.averageScore > 80) {
      situations.push(
        `Your previous strong performance in ${userPerformance.strongSkills.join(
          " and "
        )} positions you well for this advanced challenge.`
      );
    } else if (userPerformance.averageScore < 60) {
      situations.push(
        `This scenario provides an opportunity to develop your ${userPerformance.weakSkills.join(
          " and "
        )} skills further.`
      );
    }

    if (userPerformance.weakSkills.length > 0) {
      situations.push(
        `Focus on applying ${userPerformance.weakSkills[0]} principles as you work through this situation.`
      );
    }
  }

  return situations[Math.floor(Math.random() * situations.length)];
}

function generateComplexTasks(
  context: SimulationContext,
  scenario: SimulationScenario,
  userPerformance?: any
): SimulationTask[] {
  const tasks: SimulationTask[] = [];

  // Better balance between task types based on difficulty and round
  const difficultyLevel = context.user_background.skill_level || 20;
  let selectedType: string;
  
  // Early rounds (1-2): More multiple choice for easier onboarding
  // Later rounds (3-5): More essays for deeper analysis
  if (difficultyLevel < 40) {
    selectedType = Math.random() < 0.6 ? 'multiple_choice' : 'short_answer';
  } else if (difficultyLevel < 80) {
    const types = ['multiple_choice', 'short_answer', 'essay'];
    selectedType = types[Math.floor(Math.random() * types.length)];
  } else {
    selectedType = Math.random() < 0.4 ? 'multiple_choice' : 'essay';
  }

  if (selectedType === "multiple_choice") {
    // Task 1: Strategic Decision (Multiple Choice)
    tasks.push({
      id: "strategic_decision",
      type: "multiple_choice",
      title: "Primary Strategic Response",
      description:
        "Choose your main strategic approach to address this crisis. Consider all stakeholders and long-term implications.",
      required: true,
      options: generateOptions(context, scenario),
    });
  } else if (selectedType === "essay") {
    // Task 1: Strategic Analysis (Essay)
    tasks.push({
      id: "strategic_analysis",
      type: "essay",
      title: "Comprehensive Strategic Analysis",
      description:
        "Provide a detailed analysis of the situation and develop a comprehensive strategic response.",
      prompt: generateEssayPrompt(scenario, context),
      required: true,
      constraints: {
        min_length: 300,
        max_length: 1500,
        word_limit: 750,
      },
      evaluation_criteria: [
        "Problem identification and root cause analysis",
        "Stakeholder impact assessment",
        "Strategic options evaluation",
        "Risk assessment and mitigation strategies",
        "Implementation roadmap and timeline",
        "Success metrics and monitoring plan",
      ],
    });
  } else {
    // Task 1: Strategic Response (Short Answer)
    tasks.push({
      id: "strategic_response",
      type: "short_answer",
      title: "Strategic Decision Rationale",
      description:
        "Explain your primary strategic decision and the reasoning behind it.",
      prompt: generateShortAnswerPrompt(scenario, context),
      required: true,
      constraints: {
        min_length: 100,
        max_length: 400,
        word_limit: 200,
      },
      evaluation_criteria: [
        "Clear decision articulation",
        "Logical reasoning process",
        "Consideration of key constraints",
        "Practical implementation approach",
      ],
    });
  }

  // Task 2: Budget Allocation
  tasks.push({
    id: "budget_allocation",
    type: "budget_allocation",
    title: "Emergency Budget Reallocation",
    description: `You have $${context.resources.budget.toLocaleString()} remaining. Allocate funds across critical areas to maximize survival and growth potential.`,
    required: true,
    constraints: {
      budget_limit: context.resources.budget,
    },
  });

  // Task 3: Action Plan (Text Input)
  tasks.push({
    id: "action_plan",
    type: "short_answer",
    title: "90-Day Action Plan",
    description:
      "Write a detailed 90-day action plan explaining how you will execute your strategy. Include specific milestones, timelines, and success metrics.",
    required: true,
    constraints: {
      max_length: 1000,
    },
  });

  // Task 4: Stakeholder Communication (Text Input)
  tasks.push({
    id: "stakeholder_communication",
    type: "short_answer",
    title: "Stakeholder Communication Strategy",
    description:
      "Draft key messages for different stakeholder groups. How will you communicate this crisis and your response plan?",
    required: true,
    constraints: {
      max_length: 800,
    },
  });

  // Task 5: Priority Ranking
  tasks.push({
    id: "priority_ranking",
    type: "priority_ranking",
    title: "Crisis Response Priorities",
    description:
      "Rank these crisis response activities in order of priority (1 = highest priority).",
    required: true,
    constraints: {
      max_items: 8,
    },
  });

  // Task 6: Risk Assessment Document (File Upload - Optional)
  tasks.push({
    id: "risk_assessment",
    type: "file_upload",
    title: "Risk Assessment Document",
    description:
      "Upload a detailed risk assessment document analyzing potential outcomes of your strategy (optional but recommended).",
    required: false,
    constraints: {
      file_types: ["pdf", "doc", "docx", "txt"],
    },
  });

  return tasks;
}

function generateOptions(
  context: SimulationContext,
  scenario: SimulationScenario
): SimulationOption[] {
  const optionTypes = ["aggressive", "conservative", "innovative"];

  return optionTypes.map((type, index) => {
    const template = OPTION_TEMPLATES[type as keyof typeof OPTION_TEMPLATES];

    return {
      id: `option_${index + 1}`,
      text: generateOptionText(type, scenario, context),
      reasoning: generateReasoning(type, context),
      immediate_consequences: generateConsequences("immediate", type, context),
      long_term_effects: generateConsequences("long_term", type, context),
      skill_development: generateSkillDevelopment(type, context),
      risk_level: template.risk_level,
      resource_impact: generateResourceImpact(type, context),
    };
  });
}

function generateOptionText(
  type: string,
  scenario: SimulationScenario,
  context: SimulationContext
): string {
  const actions = {
    aggressive: [
      `Immediately restructure operations to address ${scenario.challenge.toLowerCase()}`,
      `Launch an aggressive campaign to counter the current situation`,
      `Make bold strategic changes to transform the business model`,
    ],
    conservative: [
      `Carefully analyze the situation and implement gradual changes`,
      `Maintain current operations while making strategic adjustments`,
      `Take a measured approach with thorough risk assessment`,
    ],
    innovative: [
      `Develop a creative solution that leverages new technology or partnerships`,
      `Redesign the approach using innovative methods and user feedback`,
      `Explore unconventional strategies that could differentiate your business`,
    ],
  };

  const typeActions =
    actions[type as keyof typeof actions] || actions.conservative;
  return typeActions[Math.floor(Math.random() * typeActions.length)];
}

function generateReasoning(type: string, context: SimulationContext): string {
  const reasoning = {
    aggressive: `Given your ${context.user_background.career_path} background, taking bold action could leverage your expertise to create significant impact quickly.`,
    conservative: `With current market conditions being ${context.market_conditions}, a careful approach minimizes risk while maintaining stability.`,
    innovative: `Your industry experience in ${context.industry} positions you well to identify creative solutions that others might miss.`,
  };

  return reasoning[type as keyof typeof reasoning] || reasoning.conservative;
}

function generateConsequences(
  timeframe: "immediate" | "long_term",
  type: string,
  context: SimulationContext
): string[] {
  const consequences = {
    immediate: {
      aggressive: [
        "High resource consumption",
        "Rapid team mobilization",
        "Immediate market response",
      ],
      conservative: [
        "Minimal disruption",
        "Steady progress",
        "Maintained stability",
      ],
      innovative: [
        "Learning curve challenges",
        "Stakeholder curiosity",
        "Prototype development",
      ],
    },
    long_term: {
      aggressive: [
        "Potential high returns",
        "Market leadership position",
        "Increased competition response",
      ],
      conservative: [
        "Sustainable growth",
        "Risk mitigation",
        "Gradual market position improvement",
      ],
      innovative: [
        "Competitive differentiation",
        "New market opportunities",
        "Enhanced reputation for innovation",
      ],
    },
  };

  return (
    consequences[timeframe][
      type as keyof (typeof consequences)[typeof timeframe]
    ] || consequences[timeframe].conservative
  );
}

function generateSkillDevelopment(
  type: string,
  context: SimulationContext
): Record<string, number> {
  const skillMaps = {
    aggressive: { leadership: 3, risk_management: 2, strategic_thinking: 3 },
    conservative: { planning: 3, risk_assessment: 3, financial_management: 2 },
    innovative: { creativity: 3, problem_solving: 3, adaptability: 2 },
  };

  return skillMaps[type as keyof typeof skillMaps] || skillMaps.conservative;
}

function generateResourceImpact(type: string, context: SimulationContext): any {
  const impacts = {
    aggressive: {
      budget_change: -context.resources.budget * 0.3,
      time_required: "2-4 weeks",
      team_involvement: ["all_departments", "external_consultants"],
    },
    conservative: {
      budget_change: -context.resources.budget * 0.1,
      time_required: "6-8 weeks",
      team_involvement: ["core_team", "gradual_rollout"],
    },
    innovative: {
      budget_change: -context.resources.budget * 0.2,
      time_required: "4-6 weeks",
      team_involvement: ["r&d_team", "pilot_group"],
    },
  };

  return impacts[type as keyof typeof impacts] || impacts.conservative;
}

function calculateUserPerformance(userHistory?: any[]): {
  averageScore: number;
  strongSkills: string[];
  weakSkills: string[];
} {
  if (!userHistory || userHistory.length === 0) {
    return { averageScore: 0, strongSkills: [], weakSkills: [] };
  }

  const scores = userHistory.map((h) => h.feedback?.outcome_score || 0);
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Analyze skill development patterns
  const skillCounts: Record<string, number[]> = {};
  userHistory.forEach((h) => {
    if (h.feedback?.skills_gained) {
      Object.entries(h.feedback.skills_gained).forEach(
        ([skill, points]: [string, any]) => {
          if (!skillCounts[skill]) skillCounts[skill] = [];
          skillCounts[skill].push(points);
        }
      );
    }
  });

  const skillAverages = Object.entries(skillCounts).map(([skill, points]) => ({
    skill,
    average: points.reduce((sum, p) => sum + p, 0) / points.length,
  }));

  skillAverages.sort((a, b) => b.average - a.average);
  const strongSkills = skillAverages.slice(0, 3).map((s) => s.skill);
  const weakSkills = skillAverages.slice(-3).map((s) => s.skill);

  return { averageScore, strongSkills, weakSkills };
}

function calculateDifficulty(
  context: SimulationContext,
  userPerformance?: { averageScore: number }
): number {
  let difficulty = 1;

  if (context.businessStage === "growth") difficulty += 1;
  if (context.businessStage === "established") difficulty += 2;
  if (context.user_background.skill_level > 50) difficulty += 1;
  if (context.market_conditions.includes("volatile")) difficulty += 1;

  // Adjust based on user performance
  if (userPerformance && userPerformance.averageScore > 80) difficulty += 1;
  if (userPerformance && userPerformance.averageScore < 60)
    difficulty = Math.max(1, difficulty - 1);

  return Math.min(difficulty, 5);
}

function generateAIContext(
  context: SimulationContext,
  scenario: SimulationScenario
): string {
  return `As your AI mentor, I'll help you navigate this ${scenario.difficulty_level}/5 difficulty scenario. Your ${context.user_background.career_path} expertise and previous decisions will influence the outcomes. I'll provide personalized feedback based on your choice.`;
}

function generateLearningObjectives(
  context: SimulationContext,
  scenario: SimulationScenario
): string[] {
  return [
    `Develop ${context.user_background.career_path} decision-making skills`,
    `Learn to balance stakeholder interests in complex situations`,
    `Practice resource allocation under constraints`,
    `Understand long-term consequences of strategic decisions`,
  ];
}

// Generate comprehensive simulation results with detailed AI feedback
export async function generateSimulationResult(
  scenario: SimulationScenario,
  selectedOption: SimulationOption,
  context: SimulationContext,
  userHistory?: any[]
): Promise<SimulationResult> {
  // Generate detailed AI feedback
  const detailedFeedback = await generateDetailedFeedback(
    scenario,
    selectedOption,
    context,
    userHistory
  );

  // Calculate performance score based on decision quality
  const performanceScore = calculatePerformanceScore(
    selectedOption,
    scenario,
    context
  );

  // Generate skill gains based on the decision
  const skillGains = calculateSkillGains(
    selectedOption,
    context.user_background.career_path
  );

  // Generate outcome description
  const outcomeDescription = generateOutcomeDescription(
    selectedOption,
    scenario,
    performanceScore
  );

  // Generate consequences
  const consequences = {
    immediate: selectedOption.immediate_consequences,
    short_term: generateShortTermConsequences(selectedOption, scenario),
    long_term: selectedOption.long_term_effects,
  };

  // Generate context for next scenario
  const nextScenarioContext = generateNextScenarioContext(
    selectedOption,
    scenario,
    performanceScore
  );

  return {
    selected_option: selectedOption,
    outcome_description: outcomeDescription,
    consequences,
    skill_gains: skillGains,
    performance_score: performanceScore,
    ai_feedback: detailedFeedback,
    next_scenario_context: nextScenarioContext,
  };
}

function calculatePerformanceScore(
  selectedOption: SimulationOption,
  scenario: SimulationScenario,
  context: SimulationContext
): number {
  let baseScore = 70; // Base score

  // Adjust based on risk level and context
  if (selectedOption.risk_level === "medium") {
    baseScore += 10; // Balanced approach
  } else if (
    selectedOption.risk_level === "high" &&
    context.businessStage === "startup"
  ) {
    baseScore += 15; // High risk appropriate for startups
  } else if (
    selectedOption.risk_level === "low" &&
    context.businessStage === "established"
  ) {
    baseScore += 10; // Conservative approach for established businesses
  }

  // Adjust based on resource impact
  if (
    Math.abs(selectedOption.resource_impact.budget_change) <
    context.resources.budget * 0.2
  ) {
    baseScore += 5; // Efficient resource usage
  }

  // Add randomness for realism (±10 points)
  baseScore += Math.floor(Math.random() * 21) - 10;

  return Math.max(0, Math.min(100, baseScore));
}

function calculateSkillGains(
  selectedOption: SimulationOption,
  careerPath: string
): Record<string, number> {
  const baseGains = selectedOption.skill_development || {};

  // Add career-specific skill gains
  const careerSkills = {
    ceo: { strategic_thinking: 3, leadership: 2, decision_making: 3 },
    cto: { technical_leadership: 3, innovation: 2, system_thinking: 2 },
    marketing: { market_analysis: 3, creativity: 2, customer_insights: 2 },
    finance: { financial_analysis: 3, risk_management: 2, planning: 2 },
    operations: {
      process_optimization: 3,
      efficiency: 2,
      quality_management: 2,
    },
    sales: { relationship_building: 3, negotiation: 2, persuasion: 2 },
    hr: { people_management: 3, culture_building: 2, communication: 2 },
    product: { user_experience: 3, product_strategy: 2, innovation: 2 },
  };

  const relevantSkills =
    careerSkills[careerPath as keyof typeof careerSkills] || careerSkills.ceo;

  return { ...baseGains, ...relevantSkills };
}

function generateOutcomeDescription(
  selectedOption: SimulationOption,
  scenario: SimulationScenario,
  performanceScore: number
): string {
  const outcomes = {
    high: [
      "Your strategic decision has yielded excellent results, positioning your business for sustainable growth.",
      "The approach you chose has created significant competitive advantages and stakeholder confidence.",
      "Your decision-making process and execution have exceeded expectations, creating lasting positive impact.",
    ],
    medium: [
      "Your decision has produced solid results with room for optimization in future implementations.",
      "The chosen approach has achieved its primary objectives while highlighting areas for improvement.",
      "Your strategy has been effective overall, with valuable lessons learned for future scenarios.",
    ],
    low: [
      "While your decision faced challenges, it provided valuable learning opportunities for future growth.",
      "The approach encountered obstacles that offer important insights for refining your strategy.",
      "This experience, though challenging, has strengthened your decision-making capabilities.",
    ],
  };

  const category =
    performanceScore >= 80 ? "high" : performanceScore >= 60 ? "medium" : "low";
  const options = outcomes[category];
  return options[Math.floor(Math.random() * options.length)];
}

function generateShortTermConsequences(
  selectedOption: SimulationOption,
  scenario: SimulationScenario
): string[] {
  return [
    "Team morale and productivity adjustments based on the new direction",
    "Initial market and customer reactions to the strategic changes",
    "Resource allocation shifts and operational modifications",
    "Stakeholder feedback and relationship dynamics evolution",
  ].slice(0, 2);
}

function generateNextScenarioContext(
  selectedOption: SimulationOption,
  scenario: SimulationScenario,
  performanceScore: number
): string {
  const contexts = {
    high: "Your successful decision has opened new opportunities and challenges that require advanced strategic thinking.",
    medium:
      "The mixed results from your decision have created a complex situation requiring careful navigation.",
    low: "The challenges from your previous decision have created urgent issues that need immediate attention.",
  };

  const category =
    performanceScore >= 80 ? "high" : performanceScore >= 60 ? "medium" : "low";
  return contexts[category];
}
// Helper functions for generating different types of prompts
function generateEssayPrompt(
  scenario: SimulationScenario,
  context: SimulationContext
): string {
  const prompts = [
    `Analyze the situation described in "${
      scenario.title
    }" from multiple perspectives. In your essay, address the following:

1. **Situation Analysis**: What are the key challenges and opportunities present in this scenario? Consider both internal and external factors affecting your business.

2. **Stakeholder Impact**: How does this situation affect different stakeholders (${scenario.stakeholders.join(
      ", "
    )})? What are their likely concerns and expectations?

3. **Strategic Options**: Evaluate at least three different strategic approaches you could take. What are the pros and cons of each?

4. **Recommended Action**: Based on your analysis, what specific actions would you take and why? Include a timeline and resource allocation.

5. **Risk Management**: What are the potential risks of your chosen approach, and how would you mitigate them?

6. **Success Metrics**: How would you measure the success of your strategy? What key performance indicators would you track?

Consider the unique context of operating in ${context.location} within the ${
      context.industry
    } industry, with your background as a ${
      context.user_background.career_path
    } and current resources of ${context.resources.budget.toLocaleString()} budget and ${
      context.resources.team_size
    } team members.`,

    `You are facing the challenge described in "${
      scenario.title
    }". Write a comprehensive strategic response that demonstrates your understanding of the business environment and decision-making process.

Your essay should include:

**Executive Summary** (100-150 words): Briefly summarize the situation and your recommended approach.

**Problem Analysis** (200-300 words): 
- Identify the core problems and their root causes
- Analyze the constraints: ${scenario.constraints.join(", ")}
- Consider the market conditions in ${context.location}

**Strategic Framework** (250-400 words):
- Apply relevant business frameworks to analyze the situation
- Consider your ${
      context.user_background.career_path
    } expertise and how it applies
- Evaluate the competitive landscape and market dynamics

**Implementation Plan** (200-300 words):
- Outline specific steps and timeline
- Address resource allocation (budget: ${context.resources.budget.toLocaleString()}, team: ${
      context.resources.team_size
    } members)
- Define success metrics: ${scenario.success_metrics.join(", ")}

**Risk Assessment and Contingency Planning** (150-200 words):
- Identify potential risks and their likelihood
- Develop mitigation strategies
- Create contingency plans for different scenarios

Demonstrate critical thinking, practical application of business principles, and consideration of the unique challenges of operating in the Liberian business environment.`,
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

function generateShortAnswerPrompt(
  scenario: SimulationScenario,
  context: SimulationContext
): string {
  const prompts = [
    `Given the situation in "${
      scenario.title
    }", what would be your primary strategic decision and why? 

Consider:
- Your role as a ${context.user_background.career_path}
- Available resources (${context.resources.budget.toLocaleString()} budget, ${
      context.resources.team_size
    } team members)
- Key stakeholders: ${scenario.stakeholders.slice(0, 3).join(", ")}
- Operating context in ${context.location}

Provide a clear decision statement followed by 2-3 key reasons supporting your choice. Focus on practical implementation and expected outcomes.`,

    `How would you address the challenge presented in "${scenario.title}"? 

Your response should include:
1. Your specific decision/approach
2. Why this approach is appropriate given the constraints (${scenario.constraints
      .slice(0, 2)
      .join(", ")})
3. How you would implement it with your current resources
4. What immediate actions you would take

Keep your response focused and actionable, demonstrating your ${
      context.user_background.career_path
    } expertise.`,

    `Analyze the situation in "${scenario.title}" and propose your solution.

Address these key points:
- What is the most critical issue that needs immediate attention?
- What approach would you take and why?
- How does your ${context.user_background.career_path} background influence your decision?
- What would be your first three actions?

Provide specific, practical recommendations that can be implemented with your available resources in the ${context.location} market.`,
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}
// Generate career-specific titles for scenarios
function generateCareerSpecificTitle(baseTitle: string, careerPath: string): string {
  const careerPrefixes = {
    ceo: ["Executive Decision:", "Leadership Challenge:", "Strategic Crisis:", "CEO Dilemma:"],
    cto: ["Tech Leadership:", "Innovation Challenge:", "Technical Crisis:", "CTO Decision:"],
    marketing: ["Brand Challenge:", "Market Crisis:", "Customer Dilemma:", "Marketing Strategy:"],
    finance: ["Financial Crisis:", "Budget Challenge:", "Investment Decision:", "CFO Dilemma:"],
    operations: ["Operational Crisis:", "Process Challenge:", "Efficiency Dilemma:", "Operations Decision:"],
    sales: ["Revenue Challenge:", "Sales Crisis:", "Client Dilemma:", "Growth Decision:"],
    hr: ["People Challenge:", "Culture Crisis:", "Talent Dilemma:", "HR Decision:"],
    product: ["Product Crisis:", "User Challenge:", "Feature Dilemma:", "Product Decision:"]
  };

  const prefixes = careerPrefixes[careerPath as keyof typeof careerPrefixes] || careerPrefixes.ceo;
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Sometimes use prefix, sometimes use base title, sometimes combine
  const titleVariations = [
    `${randomPrefix} ${baseTitle}`,
    baseTitle,
    `${baseTitle} - ${careerPath.toUpperCase()} Perspective`,
    `${baseTitle}: A ${careerPath} Challenge`
  ];
  
  return titleVariations[Math.floor(Math.random() * titleVariations.length)];
}