import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { CommunityPage } from "@/components/student/community-page"
import { getCommunityStudents, getCommunityLeaderboard } from "@/lib/supabase/community-database"

export default async function StudentCommunityPage() {
  const user = await getSession()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  // Pre-fetch community data on server for better security and performance
  const [studentsResult, leaderboardResult] = await Promise.all([
    getCommunityStudents(user.id),
    getCommunityLeaderboard(20) // Get top 20 for leaderboard
  ])

  const initialData = {
    students: studentsResult.success ? studentsResult.data : [],
    leaderboard: leaderboardResult.success ? leaderboardResult.data : []
  }

  return <CommunityPage user={user} initialData={initialData} />
}