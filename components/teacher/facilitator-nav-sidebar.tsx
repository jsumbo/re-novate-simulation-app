"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard,
  Users, 
  LogOut, 
  BookOpen, 
  User,
  School,
  FileText,
  TrendingUp
} from "lucide-react"
import { facilitatorLogoutAction } from "@/lib/auth/facilitator-server-actions"

interface FacilitatorNavSidebarProps {
  user: any
  students: any[]
  sessions: any[]
  activeView: string
  onViewChange: (view: string) => void
}

export function FacilitatorNavSidebar({ 
  user, 
  students, 
  sessions,
  activeView,
  onViewChange
}: FacilitatorNavSidebarProps) {
  const activeStudents = new Set(sessions.filter((s) => s.status === "in_progress").map((s) => s.user_id)).size
  const completedSessions = sessions.filter((s) => s.status === "completed").length

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "students",
      label: "Students",
      icon: Users
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: BookOpen
    },
    {
      id: "performance",
      label: "Performance",
      icon: TrendingUp
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText
    }
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <School className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Facilitator Portal</h2>
            <p className="text-sm text-gray-600">{user.school?.name}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">{user.full_name}</p>
            <p className="text-xs text-gray-600">{user.facilitator_code}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start p-3 ${
                  isActive 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-300">
        <form action={facilitatorLogoutAction} className="w-full">
          <Button 
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:text-black hover:bg-gray-100 p-3"
            type="submit"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </form>
      </div>
    </div>
  )
}