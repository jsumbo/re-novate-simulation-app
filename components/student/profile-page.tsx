"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, ArrowLeft, Users, Target, LogOut } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import Link from "next/link"

interface ProfilePageProps {
  user: any
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [username, setUsername] = useState(user.username || "")
  const [profileImage, setProfileImage] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold">RE-Novate</h2>
          <p className="text-gray-400 text-sm">{user.username || user.participant_id}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">
            <Target className="h-4 w-4" />
            Dashboard
          </Link>
          <a href="/student/profile" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-black font-medium">
            <Users className="h-4 w-4" />
            Profile
          </a>
          <Link href="/student/community" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">
            <Users className="h-4 w-4" />
            Community
          </Link>
        </nav>
        
        <form action={logout} className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white w-full text-left">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="bg-black text-white text-2xl">
                      {(user.username || user.participant_id).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.username || user.participant_id}</h3>
                  <p className="text-gray-600">Student ID: {user.participant_id}</p>
                  <p className="text-gray-600">School: {user.schools?.name}</p>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nickname</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit
                    </Button>
                  ) : (
                    <Button onClick={handleSave} className="bg-black hover:bg-gray-800 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Career Path</Label>
                  <p className="text-sm text-gray-600 mt-1">{user.career_path}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}