"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, Users, Target, Lightbulb, TrendingUp, AlertTriangle, Upload, DollarSign } from "lucide-react"
import Link from "next/link"
import { SimulationResponse, SimulationTask } from "@/lib/simulation/types"

interface EnhancedSimulationEngineProps {
  user: any
}

interface TaskResponse {
  taskId: string
  type: string
  response: any
}

export function EnhancedSimulationEngine({ user }: EnhancedSimulationEngineProps) {
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null)
  const [taskResponses, setTaskResponses] = useState<Record<string, any>>({})
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentRound, setCurrentRound] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [aiResults, setAiResults] = useState<any>(null)

  useEffect(() => {
    loadSimulation()
  }, [])

  const loadSimulation = async () => {
    setIsLoading(true)
    try {
      // This would call the enhanced AI generation service
      const mockSimulation: SimulationResponse = {
        scenario: {
          id: "complex_sim_001",
          title: "Multi-Crisis Startup Challenge",
          context: `Your fintech startup in Monrovia faces multiple simultaneous challenges: funding is running low (2 months runway), your lead developer just quit, a competitor launched a similar product, and the Central Bank of Liberia is considering new regulations.`,
          situation: "You're in a board meeting with investors, and they want a comprehensive response plan within 48 hours.",
          challenge: "Navigate this multi-faceted crisis by making strategic decisions across funding, team management, competitive positioning, and regulatory compliance.",
          stakeholders: ["investors", "remaining_employees", "customers", "co-founders", "regulatory_bodies", "competitors"],
          constraints: ["48_hour_deadline", "limited_cash_flow", "team_uncertainty", "regulatory_ambiguity", "competitive_pressure"],
          success_metrics: ["runway_extension", "team_stability", "market_position", "regulatory_compliance", "investor_confidence"],
          difficulty_level: 4,
          estimated_time: 25
        },
        tasks: [
          {
            id: 'strategic_decision',
            type: 'multiple_choice',
            title: 'Primary Strategic Response',
            description: 'Choose your main strategic approach to address this crisis. This decision will set the tone for all other actions.',
            required: true,
            options: [
              {
                id: 'option_1',
                text: 'Focus on aggressive fundraising while maintaining current operations',
                reasoning: 'Leverage existing investor relationships and market traction to secure bridge funding',
                immediate_consequences: ['High time investment in fundraising', 'Continued burn rate', 'Team uncertainty'],
                long_term_effects: ['Potential significant funding', 'Diluted equity', 'Investor oversight'],
                skill_development: { networking: 3, presentation: 2, strategic_thinking: 2 },
                risk_level: 'high',
                resource_impact: { budget_change: -15000, time_required: '3-4 weeks', team_involvement: ['founders', 'key_employees'] }
              },
              {
                id: 'option_2',
                text: 'Pivot to a leaner, profitable model immediately',
                reasoning: 'Cut costs dramatically and focus on revenue generation to achieve profitability',
                immediate_consequences: ['Significant cost reductions', 'Product simplification', 'Possible layoffs'],
                long_term_effects: ['Sustainable operations', 'Maintained control', 'Slower growth potential'],
                skill_development: { financial_management: 3, operations: 3, adaptability: 2 },
                risk_level: 'medium',
                resource_impact: { budget_change: 5000, time_required: '2-3 weeks', team_involvement: ['core_team'] }
              },
              {
                id: 'option_3',
                text: 'Seek strategic acquisition or merger with a larger company',
                reasoning: 'Join forces with an established player to survive and scale',
                immediate_consequences: ['Acquisition negotiations', 'Due diligence process', 'Team integration planning'],
                long_term_effects: ['Reduced independence', 'Access to resources', 'Accelerated growth'],
                skill_development: { negotiation: 3, business_development: 2, strategic_thinking: 2 },
                risk_level: 'medium',
                resource_impact: { budget_change: -5000, time_required: '6-8 weeks', team_involvement: ['founders', 'legal', 'finance'] }
              }
            ]
          },
          {
            id: 'budget_allocation',
            type: 'budget_allocation',
            title: 'Emergency Budget Reallocation',
            description: 'You have $50,000 remaining. Allocate funds across critical areas to maximize survival and growth potential over the next 3 months.',
            required: true,
            constraints: { budget_limit: 50000 }
          },
          {
            id: 'action_plan',
            type: 'text_input',
            title: '90-Day Survival & Growth Plan',
            description: 'Write a comprehensive 90-day action plan. Include specific milestones, timelines, success metrics, and contingency plans. Consider the Liberian market context and regulatory environment.',
            required: true,
            constraints: { max_length: 1500 }
          },
          {
            id: 'stakeholder_communication',
            type: 'text_input',
            title: 'Crisis Communication Strategy',
            description: 'Draft key messages for investors, employees, and customers. How will you maintain confidence while being transparent about challenges?',
            required: true,
            constraints: { max_length: 1000 }
          },
          {
            id: 'priority_ranking',
            type: 'priority_ranking',
            title: 'Crisis Response Priorities',
            description: 'Rank these activities in order of priority (1 = highest). Your ranking will determine resource allocation.',
            required: true,
            constraints: { max_items: 8 }
          }
        ],
        ai_context: "As your AI mentor, I'll analyze your comprehensive response across all tasks. Your decisions will be evaluated holistically, considering how well they work together as a cohesive strategy.",
        learning_objectives: [
          "Master crisis management in startup environments",
          "Learn to balance multiple stakeholder interests under pressure",
          "Develop comprehensive strategic planning skills",
          "Practice resource allocation under severe constraints",
          "Understand regulatory considerations in fintech"
        ],
        total_points: 100
      }
      
      setSimulation(mockSimulation)
    } catch (error) {
      console.error("Error loading simulation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskResponse = (taskId: string, response: any) => {
    setTaskResponses(prev => ({
      ...prev,
      [taskId]: response
    }))
  }

  const handleSubmitSimulation = async () => {
    if (!simulation) return
    
    setIsLoading(true)
    try {
      // Submit all task responses for comprehensive AI analysis
      const response = await fetch('/api/simulation/submit-complex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          scenarioId: simulation.scenario.id,
          taskResponses,
          round: currentRound,
          userContext: {
            careerPath: user.career_path,
            skillLevel: currentRound * 20
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAiResults(result.analysis)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Error submitting simulation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isSimulationComplete = () => {
    if (!simulation) return false
    const requiredTasks = simulation.tasks.filter(task => task.required)
    return requiredTasks.every(task => taskResponses[task.id] !== undefined)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized business simulation...</p>
        </div>
      </div>
    )
  }