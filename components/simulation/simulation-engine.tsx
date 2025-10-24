"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Users, Target, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { SimulationResponse, SimulationOption } from "@/lib/simulation/types"

interface SimulationEngineProps {
  user: any
}

export function SimulationEngine({ user }: SimulationEngineProps) {
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentRound, setCurrentRound] = useState(1)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    loadSimulation()
  }, [])

  const loadSimulation = async () => {
    setIsLoading(true)
    try {
      // This would call the AI generation service
      const mockSimulation: SimulationResponse = {
        scenario: {
          id: "sim_001",
          title: "Startup Funding Crisis",
          context: `Your ${user.career_path} startup in Monrovia is facing a critical funding shortage.`,
          situation: "With only 2 months of runway left, you need to make a decision that could determine the future of your business.",
          challenge: "Secure additional funding or pivot your business model to extend runway",
          stakeholders: ["investors", "employees", "customers", "co-founders"],
          constraints: ["limited_time", "cash_flow", "team_morale"],
          success_metrics: ["runway_extension", "team_retention", "product_development"],
          difficulty_level: 3,
          estimated_time: 15
        },
        options: [
          {
            id: "option_1",
            text: "Aggressively pursue venture capital funding with a revised pitch deck",
            reasoning: "Your background gives you credibility with investors, and the market timing might be right for your industry.",
            immediate_consequences: ["High time investment", "Team focus on fundraising", "Potential investor meetings"],
            long_term_effects: ["Possible significant funding", "Diluted equity", "Investor oversight"],
            skill_development: { networking: 3, presentation: 2, strategic_thinking: 2 },
            risk_level: "high",
            resource_impact: {
              budget_change: -5000,
              time_required: "3-4 weeks",
              team_involvement: ["founders", "key_employees"]
            }
          },
          {
            id: "option_2", 
            text: "Pivot to a leaner business model and bootstrap growth",
            reasoning: "Reducing costs and focusing on revenue generation could provide sustainable growth without external funding.",
            immediate_consequences: ["Cost reduction measures", "Product simplification", "Team restructuring"],
            long_term_effects: ["Sustainable growth", "Maintained control", "Slower scaling"],
            skill_development: { financial_management: 3, operations: 2, adaptability: 3 },
            risk_level: "medium",
            resource_impact: {
              budget_change: 2000,
              time_required: "2-3 weeks", 
              team_involvement: ["core_team"]
            }
          },
          {
            id: "option_3",
            text: "Explore strategic partnerships and revenue-sharing agreements",
            reasoning: "Partnering with established companies could provide resources and market access while sharing risks.",
            immediate_consequences: ["Partnership negotiations", "Revenue model adjustments", "Market validation"],
            long_term_effects: ["Shared growth opportunities", "Strategic alliances", "Collaborative innovation"],
            skill_development: { partnership: 3, negotiation: 2, business_development: 2 },
            risk_level: "medium",
            resource_impact: {
              budget_change: -1000,
              time_required: "4-5 weeks",
              team_involvement: ["business_development", "legal"]
            }
          }
        ],
        ai_context: "As your AI mentor, I'll help you analyze each option based on your career path and previous decisions.",
        learning_objectives: [
          "Understand funding strategies for startups",
          "Learn to balance risk and reward in critical decisions", 
          "Develop skills in stakeholder management",
          "Practice resource allocation under pressure"
        ]
      }
      
      setSimulation(mockSimulation)
    } catch (error) {
      console.error("Error loading simulation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleSubmitDecision = async () => {
    if (!selectedOption || !simulation) return
    
    setIsLoading(true)
    try {
      // Submit decision to backend
      const result = await submitDecision(selectedOption, simulation.scenario.id, user.id, currentRound)
      
      if (result.success) {
        // Show results and feedback
        setShowResult(true)
        
        // Record the decision for future AI generation
        await recordSimulationData(user.id, simulation, selectedOption, result.feedback)
      }
    } catch (error) {
      console.error("Error submitting decision:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitDecision = async (optionId: string, scenarioId: string, userId: string, round: number) => {
    // This would call your backend API
    const response = await fetch('/api/simulation/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId, scenarioId, userId, round })
    })
    return response.json()
  }

  const recordSimulationData = async (userId: string, simulation: SimulationResponse, selectedOption: string, feedback: any) => {
    // Record user decision data for AI learning
    const simulationData = {
      userId,
      scenarioId: simulation.scenario.id,
      selectedOption,
      feedback,
      timestamp: new Date().toISOString(),
      userContext: {
        careerPath: user.career_path,
        round: currentRound,
        difficulty: simulation.scenario.difficulty_level
      }
    }
    
    // Store in localStorage for now, would be database in production
    const existingData = JSON.parse(localStorage.getItem('simulationHistory') || '[]')
    existingData.push(simulationData)
    localStorage.setItem('simulationHistory', JSON.stringify(existingData))
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized simulation...</p>
        </div>
      </div>
    )
  }

  if (!simulation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load simulation</p>
          <Button onClick={loadSimulation}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/student/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Business Simulation</h1>
            <p className="text-gray-600">Round {currentRound} of 5</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>~{simulation.scenario.estimated_time} minutes</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={(currentRound / 5) * 100} className="h-2" />
        </div>

        {/* Scenario */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">{simulation.scenario.title}</CardTitle>
                <Badge variant="outline" className="mb-2">
                  Difficulty: {simulation.scenario.difficulty_level}/5
                </Badge>
              </div>
              <Badge className={`${getRiskColor('medium')}`}>
                {user.career_path}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Context</h3>
              <p className="text-gray-700">{simulation.scenario.context}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Situation</h3>
              <p className="text-gray-700">{simulation.scenario.situation}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Challenge</h3>
              <p className="text-gray-700 font-medium">{simulation.scenario.challenge}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Stakeholders</h4>
                <div className="flex flex-wrap gap-1">
                  {simulation.scenario.stakeholders.map((stakeholder) => (
                    <Badge key={stakeholder} variant="secondary" className="text-xs">
                      {stakeholder}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Constraints</h4>
                <div className="flex flex-wrap gap-1">
                  {simulation.scenario.constraints.map((constraint) => (
                    <Badge key={constraint} variant="outline" className="text-xs">
                      {constraint.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Success Metrics</h4>
                <div className="flex flex-wrap gap-1">
                  {simulation.scenario.success_metrics.map((metric) => (
                    <Badge key={metric} variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {metric.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Your Options</h2>
          {simulation.options.map((option, index) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedOption === option.id 
                  ? 'border-black bg-black text-white shadow-lg transform scale-[1.02]' 
                  : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                    selectedOption === option.id 
                      ? 'bg-white text-black' 
                      : 'bg-black text-white'
                  }`}>
                    {selectedOption === option.id ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${selectedOption === option.id ? 'text-white' : 'text-gray-900'}`}>
                      {option.text}
                    </h3>
                    <p className={`text-sm mb-3 ${selectedOption === option.id ? 'text-gray-200' : 'text-gray-600'}`}>
                      {option.reasoning}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className={`font-medium mb-1 flex items-center gap-1 ${selectedOption === option.id ? 'text-white' : 'text-gray-900'}`}>
                          <TrendingUp className="h-3 w-3" />
                          Immediate Effects
                        </h4>
                        <ul className={`space-y-1 ${selectedOption === option.id ? 'text-gray-200' : 'text-gray-600'}`}>
                          {option.immediate_consequences.map((consequence, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-gray-400">•</span>
                              {consequence}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className={`font-medium mb-1 flex items-center gap-1 ${selectedOption === option.id ? 'text-white' : 'text-gray-900'}`}>
                          <Target className="h-3 w-3" />
                          Long-term Impact
                        </h4>
                        <ul className={`space-y-1 ${selectedOption === option.id ? 'text-gray-200' : 'text-gray-600'}`}>
                          {option.long_term_effects.map((effect, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-gray-400">•</span>
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-4">
                        <Badge className={getRiskColor(option.risk_level)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {option.risk_level} risk
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {option.resource_impact.time_required}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        {Object.entries(option.skill_development).map(([skill, points]) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            +{points} {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Context */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">AI Mentor Guidance</h3>
                <p className="text-blue-800 text-sm">{simulation.ai_context}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {showResult && selectedOption && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Decision Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Your Choice:</h3>
                  <p className="text-green-800">
                    {simulation.options.find(opt => opt.id === selectedOption)?.text}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">AI Feedback:</h3>
                  <p className="text-green-800">
                    Excellent decision! Your choice demonstrates strong entrepreneurial thinking and understanding of the Liberian business context. This approach will help develop your {user.career_path} skills.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-green-200">
                  <div className="flex gap-2">
                    <Badge className="bg-green-600 text-white">Score: 85/100</Badge>
                    <Badge variant="outline" className="border-green-600 text-green-700">+3 Leadership</Badge>
                    <Badge variant="outline" className="border-green-600 text-green-700">+2 Strategy</Badge>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setCurrentRound(currentRound + 1)
                      setSelectedOption(null)
                      setShowResult(false)
                      loadSimulation()
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Next Round
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {!showResult && (
          <div className="flex justify-center">
            <Button 
              onClick={handleSubmitDecision}
              disabled={!selectedOption || isLoading}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Submit Decision'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}