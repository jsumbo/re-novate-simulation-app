"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAllSchools() {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  const { data: schools, error } = await supabase
    .from("schools")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name")

  if (error) {
    return { success: false, error: "Failed to fetch schools" }
  }

  return { success: true, schools }
}

export async function verifySchoolCode(schoolId: string, schoolCode: string) {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  const { data: school, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .eq("code", schoolCode.toUpperCase())
    .eq("is_active", true)
    .single()

  if (error || !school) {
    return { success: false, error: "Invalid school code for the selected school" }
  }

  return { success: true, school }
}

export async function createStudent(schoolId: string, participantId: string) {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  // Check if participant ID already exists
  const { data: existing } = await supabase.from("users").select("*").eq("participant_id", participantId).single()

  if (existing) {
    return { success: false, error: "This participant ID is already registered" }
  }

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      participant_id: participantId,
      school_id: schoolId,
      role: "student",
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: "Failed to create student account" }
  }

  return { success: true, user }
}



export async function loginExistingStudent(participantId: string) {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      schools(*),
      student_profiles(*)
    `)
    .eq("participant_id", participantId)
    .eq("role", "student")
    .single()

  if (error || !user) {
    return { success: false, error: "Student not found. Please check your participant ID." }
  }

  // Update last login timestamp
  await supabase.from("users").update({ 
    last_login: new Date().toISOString() 
  }).eq("id", user.id)

  // Set the user session
  const { setSession } = await import("@/lib/auth/session")
  await setSession(user.id)

  return { success: true, user }
}

export async function loginTeacher(participantId: string, schoolCode: string) {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return { success: false, error: "Database connection not available" }
  }

  // Verify school code first
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("*")
    .eq("verification_code", schoolCode.toUpperCase())
    .single()

  if (schoolError || !school) {
    return { success: false, error: "Invalid school verification code" }
  }

  // Check if teacher exists
  const { data: user, error } = await supabase
    .from("users")
    .select("*, schools(*)")
    .eq("participant_id", participantId)
    .eq("role", "teacher")
    .eq("school_id", school.id)
    .single()

  if (error || !user) {
    // Create teacher account if doesn't exist
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        participant_id: participantId,
        school_id: school.id,
        role: "teacher",
      })
      .select("*, schools(*)")
      .single()

    if (createError) {
      return { success: false, error: "Failed to create teacher account" }
    }

    return { success: true, user: newUser, isNewAccount: true }
  }

  // Update last active timestamp
  await supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id)

  return { success: true, user }
}

export async function logout() {
  revalidatePath("/")
  redirect("/")
}
