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
      interactionType,
      context,
      aiResponse,
      rating
    } = body

    if (!userId || !interactionType || !aiResponse) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if userId is a UUID or participant ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    
    const insertData: any = {
      interaction_type: interactionType,
      context: context || {},
      ai_response: aiResponse,
      feedback_rating: rating,
      created_at: new Date().toISOString()
    }

    // If it's a UUID, use user_id; if not, use participant_id
    if (isUUID) {
      insertData.user_id = userId
    } else {
      insertData.participant_id = userId
    }

    const { data, error } = await supabase
      .from('ai_interactions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('AI interaction tracking error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'AI interaction tracked successfully'
    })

  } catch (error) {
    console.error('Track AI interaction error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to track AI interaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}