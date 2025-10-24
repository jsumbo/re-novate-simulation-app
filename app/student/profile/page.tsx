import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { ProfilePage } from "@/components/student/profile-page"

export default async function StudentProfilePage() {
  const user = await getSession()

  if (!user || user.role !== "student") {
    redirect("/login")
  }

  return <ProfilePage user={user} />
}