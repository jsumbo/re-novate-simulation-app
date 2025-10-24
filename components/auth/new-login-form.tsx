"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OfflineBanner } from "@/components/ui/offline-banner"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { loginExistingStudent } from "@/lib/auth/actions"


interface School {
  id: string
  name: string
  code: string
}

interface ValidationErrors {
  school?: string
  schoolCode?: string
  teacherCode?: string
}

export function NewLoginForm() {
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [schools, setSchools] = useState<School[]>([])
  const [schoolsLoading, setSchoolsLoading] = useState(true)

  // Student login state
  const [selectedSchool, setSelectedSchool] = useState("")
  const [studentSchoolCode, setStudentSchoolCode] = useState("")
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [participantId, setParticipantId] = useState("")

  // Facilitator login state
  const [teacherSchool, setTeacherSchool] = useState("")
  const [teacherSchoolCode, setTeacherSchoolCode] = useState("")
  const [teacherCode, setTeacherCode] = useState("")

  // Load schools on component mount
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        
        if (!supabase) {
          // Fallback to hardcoded schools if no database connection
          const fallbackSchools = [
            { id: "elwa", name: "ELWA Academy", code: "ELWA2024" },
            { id: "maria", name: "St. Maria Goretti Institute", code: "MARIA2024" },
            { id: "lott", name: "Lott Carey Mission School", code: "LOTT2024" },
            { id: "cummings", name: "Alexander B. Cummings Model School", code: "CUMMINGS2024" },
            { id: "tribe", name: "TRIBE Academy", code: "TRIBE2024" }
          ]
          setSchools(fallbackSchools)
          setSchoolsLoading(false)
          return
        }

        const { data: schools, error } = await supabase
          .from("schools")
          .select("id, name, code")
          .eq("is_active", true)
          .order("name")

        if (error) {
          console.error("Error loading schools:", error)
          // Use fallback schools on error
          const fallbackSchools = [
            { id: "elwa", name: "ELWA Academy", code: "ELWA2024" },
            { id: "maria", name: "St. Maria Goretti Institute", code: "MARIA2024" },
            { id: "lott", name: "Lott Carey Mission School", code: "LOTT2024" },
            { id: "cummings", name: "Alexander B. Cummings Model School", code: "CUMMINGS2024" },
            { id: "tribe", name: "TRIBE Academy", code: "TRIBE2024" }
          ]
          setSchools(fallbackSchools)
        } else {
          setSchools(schools || [])
        }
      } catch (err) {
        console.error("Error loading schools:", err)
        // Use fallback schools on error
        const fallbackSchools = [
          { id: "elwa", name: "ELWA Academy", code: "ELWA2024" },
          { id: "maria", name: "St. Maria Goretti Institute", code: "MARIA2024" },
          { id: "lott", name: "Lott Carey Mission School", code: "LOTT2024" },
          { id: "cummings", name: "Alexander B. Cummings Model School", code: "CUMMINGS2024" },
          { id: "tribe", name: "TRIBE Academy", code: "TRIBE2024" }
        ]
        setSchools(fallbackSchools)
      } finally {
        setSchoolsLoading(false)
      }
    }

    loadSchools()
  }, [])

  // Auto-generate 4-digit alphanumeric student ID
  const generateStudentId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Validation functions
  const validateStudentForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!selectedSchool) {
      errors.school = "Please select your school"
    }

    if (!studentSchoolCode.trim()) {
      errors.schoolCode = "School code is required"
    } else if (studentSchoolCode.length < 6) {
      errors.schoolCode = "School code must be at least 6 characters"
    }

    return errors
  }

  const validateTeacherForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!teacherSchool) {
      errors.school = "Please select your school"
    }

    if (!teacherSchoolCode.trim()) {
      errors.schoolCode = "School code is required"
    } else if (teacherSchoolCode.length < 6) {
      errors.schoolCode = "School code must be at least 6 characters"
    }

    if (!teacherCode.trim()) {
      errors.teacherCode = "Facilitator code is required"
    } else if (teacherCode.length < 3) {
      errors.teacherCode = "Facilitator code must be at least 3 characters"
    }

    return errors
  }

  // Real-time validation
  useEffect(() => {
    if (!isReturningUser && (touched.school || touched.schoolCode)) {
      setValidationErrors(validateStudentForm())
    }
  }, [selectedSchool, studentSchoolCode, touched, isReturningUser])

  useEffect(() => {
    if (touched.teacherSchool || touched.teacherSchoolCode || touched.teacherCode) {
      setValidationErrors(validateTeacherForm())
    }
  }, [teacherSchool, teacherSchoolCode, teacherCode, touched])

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
  }



  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setTouched({ school: true, schoolCode: true })

    // Check if offline
    if (!isOnline) {
      setError("You're currently offline. Please check your internet connection and try again.")
      return
    }

    // Handle returning user login
    if (isReturningUser) {
      if (!participantId.trim()) {
        setError("Please enter your participant ID")
        return
      }

      setIsLoading(true)
      try {
        const result = await loginExistingStudent(participantId.trim())
        
        if (result.success && result.user) {
          // Store user data and redirect to dashboard
          localStorage.setItem('currentUser', JSON.stringify(result.user))
          localStorage.setItem('selectedSchool', JSON.stringify(result.user.schools))
          router.push("/student/dashboard")
        } else {
          throw new Error(result.error || "Login failed")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again."
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Validate form for new users
    const errors = validateStudentForm()
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors above before continuing.")
      return
    }

    setIsLoading(true)

    try {
      // Find selected school from loaded schools list
      const school = schools.find(s => s.id === selectedSchool)
      
      if (!school) {
        throw new Error("Invalid school selection")
      }

      // Verify school code matches the selected school
      if (studentSchoolCode !== school.code) {
        throw new Error("Invalid school code for the selected school")
      }

      // Proceed with new user onboarding
      const generatedStudentId = generateStudentId()
      localStorage.setItem('generatedStudentId', generatedStudentId)
      localStorage.setItem('selectedSchool', JSON.stringify(school))
      router.push("/onboarding")
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setTouched({ teacherSchool: true, teacherSchoolCode: true, teacherCode: true })

    // Check if offline
    if (!isOnline) {
      setError("You're currently offline. Please check your internet connection and try again.")
      return
    }

    // Validate form
    const errors = validateTeacherForm()
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors above before continuing.")
      return
    }

    setIsLoading(true)

    try {
      // Import facilitator authentication server action
      const { authenticateFacilitatorAction } = await import('@/lib/auth/facilitator-server-actions')

      // Authenticate facilitator
      const result = await authenticateFacilitatorAction({
        schoolId: teacherSchool,
        accessCode: teacherSchoolCode,
        facilitatorCode: teacherCode
      })

      if (!result.success) {
        throw new Error(result.error || "Authentication failed")
      }

      // Successful authentication - redirect to facilitator dashboard
      router.push("/teacher/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-gray-200 shadow-lg bg-white">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600">
          Sign in to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {!isOnline && <OfflineBanner />}
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="student" className="text-xs sm:text-sm px-2 sm:px-4">Student Login</TabsTrigger>
            <TabsTrigger value="teacher" className="text-xs sm:text-sm px-2 sm:px-4">Facilitator Login</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4">
            <form onSubmit={handleStudentLogin} className="space-y-4">
              {!isReturningUser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="student-school" className="text-sm font-medium">Select Your School</Label>
                    <Select
                      value={selectedSchool}
                      onValueChange={(value) => {
                        setSelectedSchool(value)
                        handleFieldBlur('school')
                      }}
                      required
                      disabled={schoolsLoading}
                    >
                      <SelectTrigger className={`h-11 ${validationErrors.school && touched.school ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder={schoolsLoading ? "Loading schools..." : "Choose your school"} />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolsLoading ? (
                          <SelectItem value="loading" disabled>Loading schools...</SelectItem>
                        ) : (
                          schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {validationErrors.school && touched.school && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.school}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-school-code" className="text-sm font-medium">School Code</Label>
                    <Input
                      id="student-school-code"
                      type="text"
                      placeholder="Enter your school code"
                      value={studentSchoolCode}
                      onChange={(e) => setStudentSchoolCode(e.target.value.toUpperCase())}
                      onBlur={() => handleFieldBlur('schoolCode')}
                      required
                      disabled={isLoading}
                      className={`h-11 ${validationErrors.schoolCode && touched.schoolCode ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.schoolCode && touched.schoolCode && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.schoolCode}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {isReturningUser && (
                <div className="space-y-2">
                  <Label htmlFor="participant-id" className="text-sm font-medium">Your Participant ID</Label>
                  <Input
                    id="participant-id"
                    type="text"
                    placeholder="Enter your 4-digit ID (e.g., A1B2)"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value.toUpperCase().slice(0, 4))}
                    required
                    disabled={isLoading}
                    className="h-11 text-center text-lg font-mono tracking-widest"
                    maxLength={4}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Enter the 4-character ID you received when you first signed up
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsReturningUser(!isReturningUser)
                    setError("")
                    setValidationErrors({})
                    setTouched({})
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  {isReturningUser ? "New student?" : "Returning student?"}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white h-11 text-sm sm:text-base"
                disabled={isLoading || !isOnline || (isReturningUser ? !participantId.trim() : Object.keys(validationErrors).length > 0)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && (isReturningUser ? participantId.trim() : Object.keys(validationErrors).length === 0) && <CheckCircle2 className="mr-2 h-4 w-4" />}
                {isReturningUser ? "Sign In" : "Continue to Onboarding"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher" className="space-y-4">
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-school-select" className="text-sm font-medium">Select Your School</Label>
                <Select
                  value={teacherSchool}
                  onValueChange={(value) => {
                    setTeacherSchool(value)
                    handleFieldBlur('teacherSchool')
                  }}
                  required
                  disabled={schoolsLoading}
                >
                  <SelectTrigger className={`h-11 ${validationErrors.school && touched.teacherSchool ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={schoolsLoading ? "Loading schools..." : "Choose your school"} />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolsLoading ? (
                      <SelectItem value="loading" disabled>Loading schools...</SelectItem>
                    ) : (
                      schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {validationErrors.school && touched.teacherSchool && (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.school}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-school-code" className="text-sm font-medium">School Code</Label>
                <Input
                  id="teacher-school-code"
                  type="text"
                  placeholder="Enter your school code"
                  value={teacherSchoolCode}
                  onChange={(e) => setTeacherSchoolCode(e.target.value.toUpperCase())}
                  onBlur={() => handleFieldBlur('teacherSchoolCode')}
                  required
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.schoolCode && touched.teacherSchoolCode ? 'border-red-500' : ''}`}
                />
                {validationErrors.schoolCode && touched.teacherSchoolCode && (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.schoolCode}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-code" className="text-sm font-medium">Facilitator Code</Label>
                <Input
                  id="teacher-code"
                  type="text"
                  placeholder="Enter your facilitator code"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  onBlur={() => handleFieldBlur('teacherCode')}
                  required
                  disabled={isLoading}
                  className={`h-11 ${validationErrors.teacherCode && touched.teacherCode ? 'border-red-500' : ''}`}
                />
                {validationErrors.teacherCode && touched.teacherCode && (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.teacherCode}</span>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white h-11 text-sm sm:text-base"
                disabled={isLoading || !isOnline || Object.keys(validationErrors).length > 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && Object.keys(validationErrors).length === 0 && <CheckCircle2 className="mr-2 h-4 w-4" />}
                Sign In as Teacher
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}