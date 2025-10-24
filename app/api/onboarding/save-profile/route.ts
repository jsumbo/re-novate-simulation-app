import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      interestArea,
      avatar,
      quizScore,
      skillLevel,
      goals,
      motivation,
      aspirations,
      learningPreference
    } = body

    if (!userId || !interestArea) {
      return NextResponse.json(
        { error: 'User ID and interest area are required' },
        { status: 400 }
      )
    }

    // Save to student_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .upsert({
        user_id: userId,
        interest_area: interestArea,
        avatar_config: avatar,
        skill_level: skillLevel,
        motivation,
        aspirations,
        learning_preference: learningPreference,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile save error:', profileError)
      throw profileError
    }

    // Save quiz results
    if (quizScore !== undefined) {
      const { error: quizError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          quiz_type: 'onboarding',
          interest_area: interestArea,
          score: quizScore,
          total_questions: 3,
          completed_at: new Date().toISOString()
        })

      if (quizError) {
        console.error('Quiz save error:', quizError)
        // Don't fail the whole request for quiz save errors
      }
    }

    // Save learning goals
    if (goals && goals.length > 0) {
      const goalRecords = goals.map((goal: any) => ({
        user_id: userId,
        goal_text: goal.text,
        goal_category: goal.category,
        status: 'active',
        created_at: new Date().toISOString()
      }))

      const { error: goalsError } = await supabase
        .from('learning_goals')
        .insert(goalRecords)

      if (goalsError) {
        console.error('Goals save error:', goalsError)
        // Don't fail the whole request for goals save errors
      }
    }

    // Update user's career_path field for compatibility
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        career_path: interestArea,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) {
      console.error('User update error:', userError)
      // Don't fail the whole request for user update errors
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Onboarding profile saved successfully'
    })

  } catch (error) {
    console.error('Save profile error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to save profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}