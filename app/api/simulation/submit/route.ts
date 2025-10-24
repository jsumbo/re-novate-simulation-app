import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { optionId, scenarioId, userId, round } = await request.json()
    
    const supabase = await getSupabaseServerClient()
    
    if (!supabase) {
      // Mock response for offline mode
      return NextResponse.json({
        success: true,
        feedback: {
          ai_feedback: "Excellent decision! Your choice demonstrates strong entrepreneurial thinking and understanding of the Liberian business context.",
          outcome_score: 75 + Math.floor(Math.random() * 25), // 75-100
          skills_gained: {
            leadership: Math.floor(Math.random() * 3) + 1,
            strategic_thinking: Math.floor(Math.random() * 3) + 1,
            decision_making: Math.floor(Math.random() * 2) + 1
          }
        }
      })
    }

    // Generate AI feedback based on the decision
    const aiFeedback = await generateContextualFeedback(optionId, scenarioId, userId)
    const outcomeScore = calculateOutcomeScore(optionId, round)
    const skillsGained = calculateSkillsGained(optionId)

    // Save decision to database
    const { error: decisionError } = await supabase.from('decisions').insert({
      user_id: userId,
      scenario_id: scenarioId,
      selected_option: optionId,
      round_number: round,
      ai_feedback: aiFeedback,
      outcome_score: outcomeScore,
      skills_gained: skillsGained,
      created_at: new Date().toISOString()
    })

    if (decisionError) {
      console.error('Error saving decision:', decisionError)
    }

    // Update user progress
    await updateUserProgress(userId, skillsGained, outcomeScore, supabase)

    return NextResponse.json({
      success: true,
      feedback: {
        ai_feedback: aiFeedback,
        outcome_score: outcomeScore,
        skills_gained: skillsGained
      }
    })

  } catch (error) {
    console.error('Error processing simulation submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

async function generateContextualFeedback(optionId: string, scenarioId: string, userId: string): Promise<string> {
  // In a real implementation, this would use OpenAI or another AI service
  // For now, we'll use contextual templates
  
  const feedbackTemplates = [
    "Excellent choice! Your decision shows strong understanding of the Liberian business environment and demonstrates effective leadership skills.",
    "Good strategic thinking! This approach balances risk and opportunity well, which is crucial for entrepreneurial success in emerging markets.",
    "Thoughtful decision! Your choice reflects careful consideration of stakeholder interests and long-term business sustainability.",
    "Strong entrepreneurial mindset! This decision shows you understand the importance of resource management and strategic planning.",
    "Well-reasoned approach! Your choice demonstrates good understanding of market dynamics and customer needs in the local context."
  ]
  
  return feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)]
}

function calculateOutcomeScore(optionId: string, round: number): number {
  // Base score with some randomness
  const baseScore = 60 + Math.floor(Math.random() * 30) // 60-90
  
  // Bonus for later rounds (increased difficulty)
  const roundBonus = round * 2
  
  return Math.min(100, baseScore + roundBonus)
}

function calculateSkillsGained(optionId: string): Record<string, number> {
  // Different options develop different skills
  const skillMaps = [
    { leadership: 3, strategic_thinking: 2, communication: 1 },
    { problem_solving: 3, adaptability: 2, financial_management: 1 },
    { innovation: 3, networking: 2, risk_management: 1 }
  ]
  
  return skillMaps[Math.floor(Math.random() * skillMaps.length)]
}

async function updateUserProgress(userId: string, skillsGained: Record<string, number>, score: number, supabase: any) {
  for (const [skill, points] of Object.entries(skillsGained)) {
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_name', skill)
      .single()

    if (existing) {
      // Update existing progress
      const newLevel = existing.skill_level + points
      const newTotal = existing.total_scenarios_completed + 1
      const newAverage = (existing.average_score * existing.total_scenarios_completed + score) / newTotal

      await supabase
        .from('progress')
        .update({
          skill_level: newLevel,
          total_scenarios_completed: newTotal,
          average_score: newAverage,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      // Create new progress entry
      await supabase.from('progress').insert({
        user_id: userId,
        skill_name: skill,
        skill_level: points,
        total_scenarios_completed: 1,
        average_score: score
      })
    }
  }
}