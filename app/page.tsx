"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Target,
  Zap,
  Trophy,
  Calendar,
  Settings,
  Play,
  TrendingUp,
  Award,
  Clock,
  LogOut,
  User,
} from "lucide-react"
import { GameLibrary } from "./components/game-library"
import { ProgressDashboard } from "./components/progress-dashboard"
import { TrainingPlan } from "./components/training-plan"
import { AICoach } from "./components/ai-coach"
import { ProfileSettings } from "./components/profile-settings"
import { useGameData } from "./hooks/use-game-data"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { redirect } from "next/navigation"

export default function MindTrainer() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { gameData, updateGameData, userStats, isLoading } = useGameData()
  const [dailyStreak, setDailyStreak] = useState(7)
  const [todayCompleted, setTodayCompleted] = useState(false)
  const { user, logOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/signin")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Redirect to the landing page if user is not authenticated
  if (!user) {
    redirect("/landing")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">MindTrainer</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Welcome, {user?.displayName || "Cognitive Athlete"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {dailyStreak} day streak
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} title="Profile">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 py-4">
              <TabsContent value="dashboard" className="mt-0">
                <DashboardView
                  userStats={userStats}
                  todayCompleted={todayCompleted}
                  onStartTraining={() => setActiveTab("games")}
                />
              </TabsContent>

              <TabsContent value="games" className="mt-0">
                <GameLibrary
                  gameData={gameData}
                  onGameComplete={updateGameData}
                  onBack={() => setActiveTab("dashboard")}
                />
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <ProgressDashboard gameData={gameData} userStats={userStats} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="plan" className="mt-0">
                <TrainingPlan userStats={userStats} />
              </TabsContent>

              <TabsContent value="coach" className="mt-0">
                <AICoach userStats={userStats} gameData={gameData} />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <ProfileSettings />
              </TabsContent>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t">
              <div className="max-w-md mx-auto">
                <TabsList className="grid w-full grid-cols-6 h-16 bg-transparent">
                  <TabsTrigger
                    value="dashboard"
                    className="flex flex-col gap-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Home</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="games"
                    className="flex flex-col gap-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-xs">Games</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="progress"
                    className="flex flex-col gap-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Progress</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="plan"
                    className="flex flex-col gap-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Plan</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="coach"
                    className="flex flex-col gap-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="text-xs">Coach</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex flex-col gap-1 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-xs">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function DashboardView({ userStats, todayCompleted, onStartTraining }: any) {
  return (
    <div className="space-y-4 pb-20">
      {/* Daily Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Today's Training</CardTitle>
            <Badge variant={todayCompleted ? "default" : "secondary"}>{todayCompleted ? "Complete" : "Pending"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Daily Goal Progress</span>
              <span>{todayCompleted ? "100%" : "0%"}</span>
            </div>
            <Progress value={todayCompleted ? 100 : 0} className="h-2" />
            <Button onClick={onStartTraining} className="w-full" variant={todayCompleted ? "outline" : "default"}>
              {todayCompleted ? "Extra Training" : "Start Today's Session"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalScore}</p>
                <p className="text-xs text-gray-500">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.avgReactionTime}ms</p>
                <p className="text-xs text-gray-500">Avg Reaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium">Speed Demon</p>
                <p className="text-sm text-gray-500">Reaction time under 300ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Memory Master</p>
                <p className="text-sm text-gray-500">Perfect recall in memory game</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
