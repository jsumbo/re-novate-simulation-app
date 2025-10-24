import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let interestArea = 'Business & Management' // Default fallback
  
  try {
    const body = await request.json()
    const { interestArea: requestedArea, difficulty = 'beginner' } = body
    
    if (!requestedArea) {
      return NextResponse.json(
        { error: 'Interest area is required' },
        { status: 400 }
      )
    }
    
    interestArea = requestedArea

    const prompt = `Create 3 multiple-choice questions for Liberian secondary students about "${interestArea}". 
    
    Requirements:
    - Difficulty level: ${difficulty}
    - Questions should be relevant to Liberian context when possible
    - Each question should have 4 options (A, B, C, D)
    - Include brief explanations for correct answers
    - Make questions practical and engaging for teenagers
    - Focus on foundational concepts, not advanced theory
    
    Format your response as a JSON array with this structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Brief explanation of why this is correct"
      }
    ]
    
    Only return the JSON array, no other text.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an educational content creator specializing in entrepreneurship education for African secondary students. Create engaging, culturally relevant quiz questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response - handle markdown code blocks
    let questions
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      questions = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', response)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the structure
    if (!Array.isArray(questions) || questions.length !== 3) {
      throw new Error('Invalid question format')
    }

    return NextResponse.json({
      questions,
      success: true
    })

  } catch (error) {
    console.error('AI Quiz Generation Error:', error)
    
    // Provide fallback questions based on interest area
    const fallbackQuestions = {
      "Business & Management": [
        {
          question: "What is the most important factor when starting a business?",
          options: ["Having lots of money", "Understanding your customers", "Having a fancy office", "Being the smartest person"],
          correctAnswer: 1,
          explanation: "Understanding your customers helps you create products they actually want!"
        },
        {
          question: "What does 'profit' mean in business?",
          options: ["Money you borrow", "Money left after paying expenses", "Money you invest", "Money you save"],
          correctAnswer: 1,
          explanation: "Profit is what's left when you subtract all your costs from your income."
        },
        {
          question: "Why is teamwork important in business?",
          options: ["It's not important", "Different people have different strengths", "It's required by law", "It makes work slower"],
          correctAnswer: 1,
          explanation: "Teams succeed because everyone brings unique skills and perspectives!"
        }
      ],
      "Technology & Innovation": [
        {
          question: "What is innovation?",
          options: ["Using old methods", "Creating new solutions to problems", "Copying others", "Avoiding change"],
          correctAnswer: 1,
          explanation: "Innovation is about finding creative new ways to solve problems!"
        },
        {
          question: "How can technology help solve problems?",
          options: ["It can't help", "By making tasks faster and easier", "Only for entertainment", "It creates more problems"],
          correctAnswer: 1,
          explanation: "Technology is a powerful tool that can make our lives better and solve real challenges."
        },
        {
          question: "What's the first step in creating a new app?",
          options: ["Writing code", "Understanding what problem it solves", "Designing the interface", "Finding investors"],
          correctAnswer: 1,
          explanation: "Before building anything, you need to understand what problem you're solving for users."
        }
      ]
    }

    // Use the interestArea from the original request body
    const questions = fallbackQuestions[interestArea as keyof typeof fallbackQuestions] || fallbackQuestions["Business & Management"]

    return NextResponse.json({
      questions,
      success: true,
      fallback: true
    })
  }
}