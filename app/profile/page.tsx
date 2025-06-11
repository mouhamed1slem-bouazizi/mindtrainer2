"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Edit3,
  Save,
  X,
  Trophy,
  Calendar,
  Clock,
  Target,
  Camera,
  MapPin,
  Briefcase,
  Phone,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useEffect } from "react"

interface UserProfile {
  displayName: string
  dateOfBirth: string
  sex: string
  profilePicture: string
  bio: string
  location: string
  occupation: string
  phoneNumber: string
  emergencyContact: string
  fitnessGoals: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || "",
    dateOfBirth: "",
    sex: "",
    profilePicture: "",
    bio: "",
    location: "",
    occupation: "",
    phoneNumber: "",
    emergencyContact: "",
    fitnessGoals: "",
  })

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.profile) {
            setProfile((prev) => ({
              ...prev,
              ...userData.profile,
              displayName: user.displayName || userData.profile.displayName || "",
            }))
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }

    loadProfile()
  }, [user])

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For demo purposes, we'll use a data URL
      // In production, you'd upload to Firebase Storage
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile((prev) => ({
          ...prev,
          profilePicture: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profile.displayName,
      })

      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        displayName: profile.displayName,
        profile: profile,
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setProfile((prev) => ({
      ...prev,
      displayName: user?.displayName || "",
    }))
    setIsEditing(false)
    setError("")
  }

  const age = calculateAge(profile.dateOfBirth)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Profile Information</CardTitle>
                {!isEditing && (
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <Input value={profile.displayName || "Not set"} disabled className="bg-gray-50 dark:bg-gray-800" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => setProfile((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    ) : (
                      <Input
                        value={age ? `${age} years old` : "Not set"}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    {isEditing ? (
                      <Select
                        value={profile.sex}
                        onValueChange={(value) => setProfile((prev) => ({ ...prev, sex: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : "Not set"}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <Input
                    value={user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : ""}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>Tell us more about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[80px]">
                    <p className="text-sm">{profile.bio || "No bio added yet"}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  ) : (
                    <Input value={profile.location || "Not set"} disabled className="bg-gray-50 dark:bg-gray-800" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Occupation
                  </Label>
                  {isEditing ? (
                    <Input
                      id="occupation"
                      value={profile.occupation}
                      onChange={(e) => setProfile((prev) => ({ ...prev, occupation: e.target.value }))}
                      placeholder="Your job title"
                    />
                  ) : (
                    <Input value={profile.occupation || "Not set"} disabled className="bg-gray-50 dark:bg-gray-800" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <Input value={profile.phoneNumber || "Not set"} disabled className="bg-gray-50 dark:bg-gray-800" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  {isEditing ? (
                    <Input
                      id="emergencyContact"
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="Name and phone number"
                    />
                  ) : (
                    <Input
                      value={profile.emergencyContact || "Not set"}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitnessGoals">Cognitive Fitness Goals</Label>
                  {isEditing ? (
                    <Textarea
                      id="fitnessGoals"
                      value={profile.fitnessGoals}
                      onChange={(e) => setProfile((prev) => ({ ...prev, fitnessGoals: e.target.value }))}
                      placeholder="What do you want to achieve with MindTrainer?"
                      rows={2}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[60px]">
                      <p className="text-sm">{profile.fitnessGoals || "No goals set yet"}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Statistics</CardTitle>
              <CardDescription>Your MindTrainer journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">2,450</p>
                  <p className="text-sm text-gray-500">Total Score</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-sm text-gray-500">Games Played</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{age || "?"}</p>
                  <p className="text-sm text-gray-500">Age</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">3.2h</p>
                  <p className="text-sm text-gray-500">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
              <CardDescription>Your latest milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Speed Demon</p>
                      <p className="text-sm text-gray-500">Reaction time under 300ms</p>
                    </div>
                  </div>
                  <Badge>New!</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Memory Master</p>
                      <p className="text-sm text-gray-500">Perfect recall in memory game</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Earned</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Profile Complete</p>
                      <p className="text-sm text-gray-500">Added all profile information</p>
                    </div>
                  </div>
                  <Badge variant={profile.bio && profile.location && profile.occupation ? "default" : "secondary"}>
                    {profile.bio && profile.location && profile.occupation ? "Earned" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
