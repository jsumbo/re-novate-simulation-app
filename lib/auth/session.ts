"use server"

import { cookies } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"


const SESSION_COOKIE_NAME = "renovate_session"

export async function setSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    return null // No database connection, no user session
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*, schools(*)")
    .eq("id", sessionCookie.value)
    .single()

  if (error || !user) {
    return null
  }

  return user
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
