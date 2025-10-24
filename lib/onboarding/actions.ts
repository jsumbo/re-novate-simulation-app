"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { setSession } from "@/lib/auth/session"
import type { CareerPath } from "@/lib/types"
import { revalidatePath } from "next/cache"

interface OnboardingData {
  participantId: string
  schoolCode: string
  username?: string
  fullName?: string
  gender?: string
  dateOfBirth?: string
  studentClass?: string
  careerPath: CareerPath
  avatarConfig?: any
  skillsAssessment?: any
  goals?: any[]
  motivation?: string
  aspirations?: string
  learningPreference?: string
}

// Generate a unique 4-digit alphanumeric participant ID
async function generateUniqueParticipantId(supabase: any): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    let id = ''
    for (let i = 0; i < 4; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Check if this ID already exists
    const { data: existing } = await supabase
      .from("users")
      .select("participant_id")
      .eq("participant_id", id)
      .single()

    if (!existing) {
      return id // ID is unique
    }

    attempts++
  }

  throw new Error("Unable to generate unique participant ID")
}

export async function createStudentProfile(data: OnboardingData) {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  try {
    // First, find the school by code to get the real database ID
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("code", data.schoolCode)
      .eq("is_active", true)
      .single()

    if (schoolError || !school) {
      throw new Error("School not found")
    }

    // Generate a unique participant ID (ignore the one from localStorage)
    const uniqueParticipantId = await generateUniqueParticipantId(supabase)

    // Then create the user record with all onboarding data
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        participant_id: uniqueParticipantId,
        school_id: school.id,
        role: "student",
        career_path: data.careerPath,
        username: data.username,
        full_name: data.fullName,
        gender: data.gender,
        date_of_birth: data.dateOfBirth,
        student_class: data.studentClass
      })
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Then create the student profile with all onboarding data
    const { error: profileError } = await supabase
      .from("student_profiles")
      .insert({
        user_id: user.id,
        interest_area: data.careerPath,
        avatar_config: data.avatarConfig || {},
        skill_level: data.skillsAssessment?.level || 'Beginner',
        motivation: data.motivation,
        aspirations: data.aspirations,
        learning_preference: data.learningPreference,
        onboarding_completed: true,
        preferences: {
          student_class: data.studentClass,
          goals: data.goals,
          skills_assessment: data.skillsAssessment
        }
      })

    if (profileError) {
      throw profileError
    }

    // Initialize basic progress for all core skills
    const coreSkills = [
      'leadership',
      'communication',
      'problem_solving',
      'financial_literacy',
      'strategic_thinking',
      'innovation',
      'teamwork',
      'decision_making'
    ]

    const initialProgress = coreSkills.map(skill => ({
      user_id: user.id,
      skill_name: skill,
      skill_level: 0,
      total_scenarios_completed: 0,
      average_score: 0,
      improvement_rate: 0
    }))

    const { error: progressError } = await supabase
      .from("progress")
      .insert(initialProgress)

    if (progressError) {
      console.error("Error creating initial progress:", progressError)
      // Don't fail the whole process if progress creation fails
    }

    // Save quiz results if available
    if (data.skillsAssessment?.score) {
      const { error: quizError } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          quiz_type: 'onboarding_skills_assessment',
          interest_area: data.careerPath,
          score: data.skillsAssessment.score,
          total_questions: 10, // Assuming 10 questions in the quiz
          percentage: (data.skillsAssessment.score / 10) * 100,
          skill_level_determined: data.skillsAssessment.level,
          ai_summary: `Initial skill assessment completed during onboarding. Determined skill level: ${data.skillsAssessment.level}`
        })

      if (quizError) {
        console.error("Error saving quiz results:", quizError)
        // Don't fail the whole process
      }
    }

    // Save learning goals if available
    if (data.goals && data.goals.length > 0) {
      const goalInserts = data.goals.map(goal => ({
        user_id: user.id,
        goal_text: goal.text,
        goal_category: goal.category,
        status: 'active',
        priority: 'medium'
      }))

      const { error: goalsError } = await supabase
        .from("learning_goals")
        .insert(goalInserts)

      if (goalsError) {
        console.error("Error saving learning goals:", goalsError)
        // Don't fail the whole process
      }
    }

    // Set the user session
    await setSession(user.id)

    revalidatePath("/student/dashboard")
    return { success: true, user }
  } catch (error) {
    console.error("Error creating student profile:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message === "School not found") {
        return { success: false, error: "School not found. Please try logging in again." }
      }
      if (error.message.includes("duplicate key")) {
        return { success: false, error: "This participant ID is already registered." }
      }
      return { success: false, error: error.message }
    }
    
    return { success: false, error: "Failed to create student profile" }
  }
}

export async function updateCareerPath(userId: string, careerPath: CareerPath) {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  const { error } = await supabase.from("users").update({ career_path: careerPath }).eq("id", userId)

  if (error) {
    return { success: false, error: "Failed to update career path" }
  }

  revalidatePath("/student/dashboard")
  return { success: true }
}
