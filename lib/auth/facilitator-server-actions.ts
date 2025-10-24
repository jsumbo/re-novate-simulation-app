"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export interface FacilitatorSession {
  id: string
  facilitator_code: string
  full_name: string
  role: "teacher"
  school: {
    id: string
    name: string
    code: string
  }
}

export interface FacilitatorLoginData {
  schoolId: string
  accessCode: string
}

export async function authenticateFacilitatorAction(data: FacilitatorLoginData) {
  const supabase = await getSupabaseServerClient()
  
  if (!supabase) {
    return {
      success: false,
      error: "Database connection failed"
    }
  }

  try {
    // Use the simplified database function to authenticate facilitator
    const { data: authResult, error } = await supabase.rpc('authenticate_facilitator_simple', {
      p_school_id: data.schoolId,
      p_access_code: data.accessCode
    })

    if (error) {
      console.error('Facilitator authentication error:', error)
      return {
        success: false,
        error: error.message || "Authentication failed"
      }
    }

    if (!authResult || authResult.length === 0) {
      return {
        success: false,
        error: "Invalid facilitator code or access denied"
      }
    }

    const facilitator = authResult[0]

    // Create session data
    const sessionData: FacilitatorSession = {
      id: facilitator.facilitator_id,
      facilitator_code: facilitator.facilitator_code,
      full_name: facilitator.full_name,
      role: "teacher",
      school: {
        id: data.schoolId,
        name: facilitator.school_name,
        code: facilitator.school_code
      }
    }

    // Set secure session cookie
    const cookieStore = cookies()
    cookieStore.set('facilitator_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return {
      success: true,
      facilitator: sessionData
    }
  } catch (error) {
    console.error('Facilitator authentication error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    }
  }
}

export async function getFacilitatorSession(): Promise<FacilitatorSession | null> {
  try {
    const cookieStore = cookies()
    const facilitatorData = cookieStore.get('facilitator_session')
    
    if (!facilitatorData) {
      return null
    }

    const session = JSON.parse(facilitatorData.value)
    
    // Verify the session is still valid by checking the database
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return null
    }

    const { data: facilitator, error } = await supabase
      .from('facilitators')
      .select(`
        id,
        facilitator_code,
        full_name,
        is_active,
        schools!inner(id, name, code)
      `)
      .eq('id', session.id)
      .eq('is_active', true)
      .single()

    if (error || !facilitator) {
      return null
    }

    return {
      id: facilitator.id,
      facilitator_code: facilitator.facilitator_code,
      full_name: facilitator.full_name,
      role: "teacher",
      school: {
        id: facilitator.schools.id,
        name: facilitator.schools.name,
        code: facilitator.schools.code
      }
    }
  } catch (error) {
    console.error('Error getting facilitator session:', error)
    return null
  }
}

export async function requireFacilitatorAuth(): Promise<FacilitatorSession> {
  const session = await getFacilitatorSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
}

export async function facilitatorLogoutAction() {
  const cookieStore = cookies()
  cookieStore.delete('facilitator_session')
  redirect('/login')
}

export async function getFacilitatorDashboardData(schoolId: string) {
  const supabase = await getSupabaseServerClient()
  
  if (!supabase) {
    return { 
      success: false, 
      data: { students: [], sessions: [], decisions: [], progress: [] } 
    }
  }

  try {
    // Get students from the same school
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, participant_id, username, full_name, career_path, created_at')
      .eq('role', 'student')
      .eq('school_id', schoolId)
      .order('full_name', { ascending: true })

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return { success: false, data: { students: [], sessions: [], decisions: [], progress: [] } }
    }

    const studentIds = (students || []).map(s => s.id)

    if (studentIds.length === 0) {
      return {
        success: true,
        data: { students: [], sessions: [], decisions: [], progress: [] }
      }
    }

    // Get all data for these students
    const [sessionsResult, decisionsResult, progressResult] = await Promise.all([
      // Sessions
      supabase
        .from('sessions')
        .select('*')
        .in('user_id', studentIds),

      // Decisions  
      supabase
        .from('decisions')
        .select('*')
        .in('user_id', studentIds),

      // Progress
      supabase
        .from('progress')
        .select('*')
        .in('user_id', studentIds)
    ])

    return {
      success: true,
      data: {
        students: students || [],
        sessions: sessionsResult.data || [],
        decisions: decisionsResult.data || [],
        progress: progressResult.data || []
      }
    }
  } catch (error) {
    console.error('Error fetching facilitator dashboard data:', error)
    return { 
      success: false, 
      data: { students: [], sessions: [], decisions: [], progress: [] } 
    }
  }
}