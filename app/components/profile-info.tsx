"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Trophy, Calendar, Clock, Target } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ProfileInfoProps {
  userStats?: any
  showDetailedStats?: boolean
}

export function ProfileInfo({ userStats, showDetailedStats = false }: ProfileInfoProps) {
  const { user } = useAuth()
  const [profilePicture, setProfilePicture] = useState("")
  const [age, setAge] = useState<number | null>(null)

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.profile) {
            setProfilePicture(userData.profile.profilePicture || "")

            // Calculate age if date of birth is available
            if (userData.profile.dateOfBirth) {
              const today = new Date()
              const birthDate = new Date(userData.profile.dateOfBirth)
              let calculatedAge = today.getFullYear() - birthDate.getFullYear()
              const monthDiff = today.getMonth() - birthDate.getMonth()

              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--
              }

              setAge(calculatedAge)
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error)
      }
    }

    loadProfileData()
  }, [user])

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              {profilePicture ? (
                <img src={profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <CardTitle>{user?.displayName || "Cognitive Athlete"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge>7-day streak</Badge>
                <Badge variant="secondary">Level 12</Badge>
                {age && <Badge variant="outline">{age} years old</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        {showDetailedStats && userStats && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{userStats.totalScore}</p>
                <p className="text-sm text-gray-500">Total Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.gamesPlayed}</p>
                <p className="text-sm text-gray-500">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(userStats.totalTime / 60)}h</p>
                <p className="text-sm text-gray-500">Total Time</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Stats Grid */}
      {showDetailedStats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-xl font-bold">2,450</p>
              <p className="text-xs text-gray-500">Best Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-xl font-bold">285ms</p>
              <p className="text-xs text-gray-500">Avg Reaction</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-xl font-bold">{age || "?"}</p>
              <p className="text-xs text-gray-500">Age</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-xl font-bold">42</p>
              <p className="text-xs text-gray-500">Games Played</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
