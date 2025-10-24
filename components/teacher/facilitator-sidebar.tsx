"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  LogOut, 
  Settings, 
  Download, 
  BarChart3, 
  BookOpen, 
  Award,
  Search,
  Filter,
  ChevronRight,
  User,
  TrendingUp,
  Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { logout } from "@/lib/auth/actions"
import { exportToCSV } from "@/lib/teacher/export"

interface FacilitatorSidebarProps {
  user: any
  students: any[]
  sessions: any[]
  decisions: any[]
  progress: any[]
  onStudentSelect?: (student: any) => void
  selectedStudent?: any
}

export function FacilitatorSidebar({ 
  user, 
  students, 
  sessions, 
  decisions, 
  progress,
  onStudentSelect,
  selectedStudent 
}: FacilitatorSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "active" | "completed" | "at-risk">("all")

  // Filter students based on search and filter criteria
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.participant_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    const studentSessions = sessions.filter(s => s.user_id === student.id)
    const studentDecisions = decisions.filter(d => d.user_id === student.id)
    const avgScore = studentDecisions.length > 0 
      ? studentDecisions.reduce((sum, d) => sum + d.outcome_score, 0) / studentDecisions.length 
      : 0

    switch (filterBy) {
      case "active":
        return studentSessions.some(s => s.status === "in_progress")
      case "completed":
        return studentSessions.some(s => s.status === "completed")
      case "at-risk":
        return avgScore < 50 && studentDecisions.length > 0
      default:
        return true
    }
  })

  const getStudentStatus = (student: any) => {
    const studentSessions = sessions.filter(s => s.user_id === student.id)
    const studentDecisions = decisions.filter(d => d.user_id === student.id)
    const avgScore = studentDecisions.length > 0 
      ? studentDecisions.reduce((sum, d) => sum + d.outcome_score, 0) / studentDecisions.length 
      : 0

    if (studentSessions.some(s => s.status === "in_progress")) {
      return { status: "active", color: "bg-green-500", text: "Active" }
    }
    if (avgScore < 50 && studentDecisions.length > 0) {
      return { status: "at-risk", color: "bg-red-500", text: "At Risk" }
    }
    if (studentSessions.some(s => s.status === "completed")) {
      return { status: "completed", color: "bg-blue-500", text: "Completed" }
    }
    return { status: "inactive", color: "bg-gray-400", text: "Not Started" }
  }

  const handleExportData = () => {
    const studentPerformance = students.map(student => {
      const studentDecisions = decisions.filter(d => d.user_id === student.id)
      const avgScore = studentDecisions.length > 0
        ? Math.round(studentDecisions.reduce((sum, d) => sum + d.outcome_score, 0) / studentDecisions.length)
        : 0
      const totalSessions = sessions.filter(s => s.user_id === student.id).length

      return {
        full_name: student.full_name,
        participant_id: student.participant_id,
        career_path: student.career_path || "Not selected",
        sessions: totalSessions,
        decisions: studentDecisions.length,
        average_score: avgScore,
      }
    })

    exportToCSV(studentPerformance, `${user.school?.name || 'school'}_student_data`)
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{user.full_name}</h2>
            <p className="text-sm text-gray-600">{user.school?.name}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-900">{students.length}</div>
            <p className="text-xs text-emerald-700">Students</p>
          </div>
          <div className="text-center p-2 bg-teal-50 rounded-lg">
            <div className="text-lg font-bold text-teal-900">
              {sessions.filter(s => s.status === "completed").length}
            </div>
            <p className="text-xs text-teal-700">Completed</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-1">
          {["all", "active", "completed", "at-risk"].map((filter) => (
            <Button
              key={filter}
              variant={filterBy === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterBy(filter as any)}
              className="text-xs capitalize"
            >
              {filter === "at-risk" ? "At Risk" : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const studentStatus = getStudentStatus(student)
              const studentDecisions = decisions.filter(d => d.user_id === student.id)
              const avgScore = studentDecisions.length > 0 
                ? Math.round(studentDecisions.reduce((sum, d) => sum + d.outcome_score, 0) / studentDecisions.length)
                : 0
              const isSelected = selectedStudent?.id === student.id

              return (
                <Card 
                  key={student.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                  }`}
                  onClick={() => onStudentSelect?.(student)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${studentStatus.color}`} />
                        <span className="font-medium text-sm text-gray-900">
                          {student.full_name || student.participant_id}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">ID: {student.participant_id}</p>
                      <p className="text-xs text-gray-600">
                        {student.career_path || "No career path selected"}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {studentStatus.text}
                        </Badge>
                        {avgScore > 0 && (
                          <span className="text-xs font-medium text-gray-700">
                            Avg: {avgScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No students found</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleExportData}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Student Data
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        
        <Separator className="my-2" />
        
        <form action={logout} className="w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            type="submit"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}