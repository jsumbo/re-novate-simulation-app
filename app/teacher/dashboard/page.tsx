import { FacilitatorDashboard } from "@/components/teacher/teacher-dashboard"
import { requireFacilitatorAuth, getFacilitatorDashboardData } from "@/lib/auth/facilitator-server-actions"

export default async function TeacherDashboardPage() {
  // Require authentication - will redirect to login if not authenticated
  const user = await requireFacilitatorAuth()

  // Get dashboard data for the authenticated facilitator's school
  const result = await getFacilitatorDashboardData(user.school.id)

  const { students, sessions, decisions, progress } = result.success 
    ? result.data 
    : { students: [], sessions: [], decisions: [], progress: [] }

  return (
    <FacilitatorDashboard 
      user={user} 
      students={students} 
      sessions={sessions} 
      decisions={decisions} 
      progress={progress} 
    />
  )
}
