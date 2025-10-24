import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      interestArea, 
      quizScore, 
      skillLevel, 
      goals, 
      motivation, 
      aspirations, 
      learningPreference,
      step 
    } = body

    // Validate required fields
    if (!interestArea || !step) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let prompt = ''
    let systemMessage = `You are an encouraging AI mentor for RE-Novate, an entrepreneurship education platform for Liberian secondary students. You provide personalized, friendly, and motivating feedback. Always be positive, supportive, and culturally aware. Use simple language appropriate for teenagers. Include relevant emojis to make your responses engaging.`

    switch (step) {
      case 'interest_selected':
        prompt = `A student just selected "${interestArea}" as their interest area. Provide encouraging feedback about their choice and briefly explain why this field is exciting and valuable in Liberia's growing economy. Keep it under 100 words.`
        break

      case 'quiz_completed':
        prompt = `A student completed a knowledge quiz in "${interestArea}" and scored ${quizScore} out of 3 (${skillLevel} level). Provide encouraging feedback about their performance, regardless of score. Emphasize that everyone starts somewhere and this is just the beginning of their learning journey. Keep it under 80 words.`
        break

      case 'goals_set':
        const goalsList = goals?.map((g: any) => g.text).join(', ') || 'learning goals'
        prompt = `A student set these learning goals in "${interestArea}": ${goalsList}. Provide encouraging feedback about their goal-setting and briefly explain how these goals will help them grow. Keep it under 100 words.`
        break

      case 'profile_complete':
        prompt = `A student completed their onboarding profile:
        - Interest: ${interestArea}
        - Skill Level: ${skillLevel}
        - Motivation: ${motivation}
        - Aspirations: ${aspirations}
        - Learning Style: ${learningPreference}
        
        Provide a personalized, encouraging message about their journey ahead. Mention specific aspects of their profile and how RE-Novate will help them achieve their dreams. Keep it under 150 words.`
        break

      default:
        prompt = `Provide general encouragement for a student starting their entrepreneurship learning journey in "${interestArea}". Keep it under 80 words.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const feedback = completion.choices[0]?.message?.content || "Great job! Keep up the amazing work! 🌟"

    return NextResponse.json({
      feedback,
      success: true
    })

  } catch (error) {
    console.error('AI Feedback Error:', error)
    
    // Provide fallback responses if AI fails
    const fallbackResponses = {
      interest_selected: "Excellent choice! 🌟 You've picked an amazing field that's full of opportunities. We're excited to help you explore and grow in this area!",
      quiz_completed: "Great job completing the quiz! 🧠 Remember, every expert was once a beginner. You're on the right path to learning amazing things!",
      goals_set: "Fantastic goals! 🎯 Setting clear objectives is the first step to success. We'll help you achieve every single one of them!",
      profile_complete: "Welcome to RE-Novate! 🚀 Your profile shows you're ready for an amazing learning adventure. Let's make your entrepreneurship dreams come true!",
      default: "You're doing great! 🌟 Keep up the excellent work on your learning journey!"
    }

    const step = body.step || 'default'
    const fallback = fallbackResponses[step as keyof typeof fallbackResponses] || fallbackResponses.default

    return NextResponse.json({
      feedback: fallback,
      success: true,
      fallback: true
    })
  }
}