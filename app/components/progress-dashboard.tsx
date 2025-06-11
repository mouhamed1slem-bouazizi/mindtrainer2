"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Trophy,
  Clock,
  Target,
  Brain,
  Zap,
  Eye,
  AlertCircle,
  Activity,
  Award,
  BarChart2,
  Database,
} from "lucide-react"
import { format, subDays, isAfter, parseISO, differenceInDays } from "date-fns"
import { useFirestoreRealtime } from "../hooks/use-firestore-realtime"
import { useAuth } from "@/contexts/auth-context"

// First, add the imports for our new components at the top of the file
import { MemoryMatrixStats } from "./game-stats/memory-matrix-stats"
import { LightningReflexesStats } from "./game-stats/lightning-reflexes-stats"

interface ProgressDashboardProps {
  gameData?: any
  userStats?: any
  isLoading?: boolean
}

export function ProgressDashboard({
  gameData: propGameData,
  userStats: propUserStats,
  isLoading: propIsLoading = false,
}: ProgressDashboardProps) {
  const { user } = useAuth()
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<"week" | "month" | "all">("week")
  const [forceShowData, setForceShowData] = useState(false)

  // Default values for when no data is available
  const defaultUserData = {
    gameData: {
      memory: {
        bestScore: 0,
        timesPlayed: 0,
        bestLevel: 0,
        levelTimes: [],
        history: [],
        averageTimePerLevel: 0,
        fastestLevel: null,
      },
      reaction: {
        bestScore: 0,
        timesPlayed: 0,
        bestReactionTime: 999,
        history: [],
        avgReactionTime: 0,
      },
      attention: {
        bestScore: 0,
        timesPlayed: 0,
        accuracy: 0,
        history: [],
      },
    },
    userStats: {
      totalScore: 0,
      avgReactionTime: 0,
      gamesPlayed: 0,
      streakDays: 0,
      totalTime: 0,
      lastActive: new Date().toISOString(),
      sessionsCompleted: 0,
      gamesPlayedByType: {},
      achievements: [],
    },
    recentSessions: [],
  }

  // Use real-time data from Firestore with timeout protection
  const {
    data: userData,
    loading: userDataLoading,
    error: userDataError,
  } = useFirestoreRealtime("users", user?.uid || "", defaultUserData)

  // Force show data after 3 seconds regardless of loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Progress Dashboard: Force showing data after timeout")
      setForceShowData(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Use either the real-time data or the props data, with fallbacks
  const gameData = userData?.gameData || propGameData || defaultUserData.gameData
  const userStats = userData?.userStats || propUserStats || defaultUserData.userStats
  const recentSessions = userData?.recentSessions || []

  // Only show loading if we haven't forced showing data and we're actually loading
  const isLoading = !forceShowData && (userDataLoading || propIsLoading)

  const formatTime = (milliseconds: number) => {
    if (!milliseconds || milliseconds === 0) return "0.00s"
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 10)
    return `${seconds}.${ms.toString().padStart(2, "0")}s`
  }

  // Calculate streak days based on session history
  const streakDays = useMemo(() => {
    if (!recentSessions || recentSessions.length === 0) return 0

    try {
      // Sort sessions by date (newest first)
      const sortedSessions = [...recentSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Check if user played today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const mostRecentSession = new Date(sortedSessions[0].date)
      mostRecentSession.setHours(0, 0, 0, 0)

      // If most recent session is not today or yesterday, streak is broken
      if (differenceInDays(today, mostRecentSession) > 1) {
        return 0
      }

      // Count consecutive days with sessions
      let streak = 1
      let currentDate = mostRecentSession

      for (let i = 1; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].date)
        sessionDate.setHours(0, 0, 0, 0)

        // If this session was the previous day, increment streak
        if (differenceInDays(currentDate, sessionDate) === 1) {
          streak++
          currentDate = sessionDate
        } else if (differenceInDays(currentDate, sessionDate) > 1) {
          // Break in streak
          break
        }
        // If same day, continue checking
      }

      return streak
    } catch (error) {
      console.error("Error calculating streak:", error)
      return 0
    }
  }, [recentSessions])

  // Generate sample data for demonstration when no real data exists
  const generateSampleData = () => {
    const sampleData = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i)
      sampleData.push({
        date: date,
        dateStr: format(date, "MMM dd"),
        memory: Math.floor(Math.random() * 50) + 10,
        reaction: Math.floor(Math.random() * 30) + 5,
        attention: Math.floor(Math.random() * 40) + 15,
        totalScore: Math.floor(Math.random() * 100) + 50,
        sessions: Math.floor(Math.random() * 3) + 1,
      })
    }

    return sampleData
  }

  // Generate data for charts based on actual game history or sample data
  const generateChartData = () => {
    try {
      const now = new Date()
      const daysToShow = selectedTimeRange === "week" ? 7 : selectedTimeRange === "month" ? 30 : 90

      // Always generate at least some data for demonstration
      const progressData: any[] = []

      // Create date buckets for each day in the range
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = subDays(now, i)
        const dateStr = format(date, "MMM dd")
        progressData.push({
          date: date,
          dateStr: dateStr,
          memory: 0,
          reaction: 0,
          attention: 0,
          totalScore: 0,
          sessions: 0,
        })
      }

      // If we have real session data, use it
      if (recentSessions && recentSessions.length > 0) {
        const cutoffDate = subDays(now, daysToShow)

        recentSessions.forEach((session) => {
          try {
            const sessionDate = parseISO(session.date)
            if (isAfter(sessionDate, cutoffDate)) {
              const dateStr = format(sessionDate, "MMM dd")
              const dataPoint = progressData.find((d) => d.dateStr === dateStr)
              if (dataPoint) {
                dataPoint[session.gameId] = (dataPoint[session.gameId] || 0) + (session.score || 0)
                dataPoint.totalScore += session.score || 0
                dataPoint.sessions += 1
              }
            }
          } catch (error) {
            console.error("Error processing session:", session, error)
          }
        })
      } else if (!user || userDataError) {
        // Generate sample data for demonstration
        progressData.forEach((dataPoint, index) => {
          dataPoint.memory = Math.floor(Math.random() * 50) + 10
          dataPoint.reaction = Math.floor(Math.random() * 30) + 5
          dataPoint.attention = Math.floor(Math.random() * 40) + 15
          dataPoint.totalScore = dataPoint.memory + dataPoint.reaction + dataPoint.attention
          dataPoint.sessions = Math.floor(Math.random() * 3) + 1
        })
      }

      return progressData
    } catch (error) {
      console.error("Error generating chart data:", error)
      // Return sample data as fallback
      const sampleData = []
      const now = new Date()
      const daysToShow = selectedTimeRange === "week" ? 7 : selectedTimeRange === "month" ? 30 : 90

      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = subDays(now, i)
        sampleData.push({
          date: date,
          dateStr: format(date, "MMM dd"),
          memory: Math.floor(Math.random() * 50) + 10,
          reaction: Math.floor(Math.random() * 30) + 5,
          attention: Math.floor(Math.random() * 40) + 15,
          totalScore: Math.floor(Math.random() * 100) + 50,
          sessions: Math.floor(Math.random() * 3) + 1,
        })
      }
      return sampleData
    }
  }

  const chartData = useMemo(() => generateChartData(), [recentSessions, selectedTimeRange, user, userDataError])

  // Add debugging
  console.log("Chart data generated:", chartData)
  console.log("Recent sessions:", recentSessions)
  console.log("User:", user)
  console.log("User data error:", userDataError)

  // Calculate cognitive profile data based on actual game performance or sample data
  const cognitiveProfile = useMemo(() => {
    try {
      // Always return some data for demonstration
      const baseProfile = [
        { domain: "Memory", score: 0, fullMark: 100 },
        { domain: "Attention", score: 0, fullMark: 100 },
        { domain: "Speed", score: 0, fullMark: 100 },
        { domain: "Reflexes", score: 0, fullMark: 100 },
        { domain: "Executive", score: 0, fullMark: 100 },
        { domain: "Problem Solving", score: 0, fullMark: 100 },
      ]

      // If no user or error, show sample data
      if (!user || userDataError) {
        return [
          { domain: "Memory", score: 75, fullMark: 100 },
          { domain: "Attention", score: 60, fullMark: 100 },
          { domain: "Speed", score: 80, fullMark: 100 },
          { domain: "Reflexes", score: 70, fullMark: 100 },
          { domain: "Executive", score: 65, fullMark: 100 },
          { domain: "Problem Solving", score: 55, fullMark: 100 },
        ]
      }

      // Calculate actual scores
      baseProfile[0].score = gameData.memory?.bestScore
        ? Math.min(100, Math.round(gameData.memory.bestScore / 10 + (gameData.memory.bestLevel || 0) * 5))
        : 0
      baseProfile[1].score = Math.round(gameData.attention?.accuracy || 0)
      baseProfile[2].score =
        gameData.reaction?.bestReactionTime && gameData.reaction.bestReactionTime < 999
          ? Math.min(100, Math.round((1000 / gameData.reaction.bestReactionTime) * 30))
          : 0
      baseProfile[3].score = gameData.reaction?.bestScore
        ? Math.min(100, Math.round(gameData.reaction.bestScore / 10))
        : 0
      baseProfile[4].score = Math.min(100, Math.round((userStats.totalScore || 0) / 100))
      baseProfile[5].score = Math.min(100, Math.round((userStats.sessionsCompleted || 0) * 5))

      return baseProfile
    } catch (error) {
      console.error("Error calculating cognitive profile:", error)
      return [
        { domain: "Memory", score: 0, fullMark: 100 },
        { domain: "Attention", score: 0, fullMark: 100 },
        { domain: "Speed", score: 0, fullMark: 100 },
        { domain: "Reflexes", score: 0, fullMark: 100 },
        { domain: "Executive", score: 0, fullMark: 100 },
        { domain: "Problem Solving", score: 0, fullMark: 100 },
      ]
    }
  }, [gameData, userStats, user, userDataError])

  // Game distribution data
  const gameDistribution = useMemo(() => {
    try {
      // If no user or error, show sample data
      if (!user || userDataError) {
        return [
          { name: "Memory", value: 15 },
          { name: "Reaction", value: 12 },
          { name: "Attention", value: 8 },
        ]
      }

      const gamesPlayedByType = userStats.gamesPlayedByType || {}
      return Object.keys(gamesPlayedByType)
        .filter((gameId) => gamesPlayedByType[gameId] > 0)
        .map((gameId) => ({
          name: gameId.charAt(0).toUpperCase() + gameId.slice(1),
          value: gamesPlayedByType[gameId],
        }))
    } catch (error) {
      console.error("Error calculating game distribution:", error)
      return []
    }
  }, [userStats, user, userDataError])

  // Calculate achievements based on actual game data or show sample
  const achievements = useMemo(() => {
    try {
      // If no user or error, show sample achievements
      if (!user || userDataError) {
        return [
          {
            title: "Getting Started",
            description: "Welcome to MindTrainer! Start playing to earn real achievements.",
            icon: Award,
            color: "blue",
            isNew: true,
          },
        ]
      }

      const achievementsList = []

      // Speed Demon achievement
      if (gameData.reaction?.bestReactionTime && gameData.reaction.bestReactionTime < 300) {
        achievementsList.push({
          title: "Speed Demon",
          description: `Reaction time under 300ms (${gameData.reaction.bestReactionTime}ms)`,
          icon: Zap,
          color: "yellow",
          isNew: true,
        })
      }

      // Memory Master achievement
      if (gameData.memory?.bestLevel && gameData.memory.bestLevel >= 10) {
        achievementsList.push({
          title: "Memory Master",
          description: `Reached level ${gameData.memory.bestLevel} in Memory Matrix`,
          icon: Brain,
          color: "purple",
          isNew: false,
        })
      }

      // Focus Expert achievement
      if (gameData.attention?.accuracy && gameData.attention.accuracy >= 90) {
        achievementsList.push({
          title: "Focus Expert",
          description: `${Math.round(gameData.attention.accuracy)}% accuracy in Focus Filter`,
          icon: Eye,
          color: "blue",
          isNew: false,
        })
      }

      // Dedicated Trainer achievement
      if (userStats.sessionsCompleted && userStats.sessionsCompleted >= 10) {
        achievementsList.push({
          title: "Dedicated Trainer",
          description: `Completed ${userStats.sessionsCompleted} training sessions`,
          icon: Award,
          color: "green",
          isNew: false,
        })
      }

      // Consistency Streak achievement
      if (streakDays >= 3) {
        achievementsList.push({
          title: "Consistency Streak",
          description: `${streakDays} days training streak`,
          icon: Activity,
          color: "orange",
          isNew: streakDays >= 5,
        })
      }

      return achievementsList
    } catch (error) {
      console.error("Error calculating achievements:", error)
      return []
    }
  }, [gameData, userStats, streakDays, user, userDataError])

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"]

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{`${label || "Data Point"}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || "#8884d8" }}>
              {`${entry.name || "Value"}: ${entry.value || 0}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Replace the existing MemoryMatrixStats function with:
  const MemoryMatrixStatsSimple = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Memory Matrix Statistics
        </CardTitle>
        <CardDescription>Performance metrics for Memory Matrix game</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Best Level</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{gameData.memory?.bestLevel || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Times Played</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{gameData.memory?.timesPlayed || 0}</p>
          </div>
        </div>
        {(gameData.memory?.timesPlayed || 0) === 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-500">Play Memory Matrix to see detailed statistics!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Replace the existing LightningReflexesStats function with:
  const LightningReflexesStatsSimple = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Lightning Reflexes Statistics
        </CardTitle>
        <CardDescription>Reaction time performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Best Reaction</span>
            </div>
            <p className="text-xl font-bold text-yellow-600">
              {gameData.reaction?.bestReactionTime && gameData.reaction.bestReactionTime < 999
                ? `${gameData.reaction.bestReactionTime}ms`
                : "N/A"}
            </p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Times Played</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{gameData.reaction?.timesPlayed || 0}</p>
          </div>
        </div>
        {(gameData.reaction?.timesPlayed || 0) === 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-500">Play Lightning Reflexes to see detailed statistics!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const FocusFilterStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Focus Filter Statistics
        </CardTitle>
        <CardDescription>Attention and accuracy performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Best Accuracy</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{Math.round(gameData.attention?.accuracy || 0)}%</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Times Played</span>
            </div>
            <p className="text-xl font-bold text-green-600">{gameData.attention?.timesPlayed || 0}</p>
          </div>
        </div>
        {(gameData.attention?.timesPlayed || 0) === 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-500">Play Focus Filter to see detailed statistics!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Show loading state only briefly
  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <h2 className="text-xl font-bold">Progress Dashboard</h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading your progress data...</p>
            <p className="text-xs text-gray-400">This should only take a moment</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Progress Dashboard</h2>
        {userDataError && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Database className="w-4 h-4" />
            <span>Offline Mode</span>
          </div>
        )}
      </div>

      {userDataError && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                {!user
                  ? "Sign in to see your personal progress data"
                  : "Unable to load data from cloud. Showing sample data."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="timing">Game Stats</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="games">Game Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalScore || 0}</p>
                    <p className="text-xs text-gray-500">Total Score</p>
                    {userStats.totalScore > 0 && (
                      <Badge variant="secondary" className="mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />+{Math.max(5, Math.round(userStats.totalScore / 100))}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{streakDays}</p>
                    <p className="text-xs text-gray-500">Day Streak</p>
                    {streakDays > 0 && (
                      <Badge variant="secondary" className="mt-1">
                        <Activity className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Distribution</CardTitle>
              <CardDescription>Your training focus across different games</CardDescription>
            </CardHeader>
            <CardContent>
              {gameDistribution.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gameDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {gameDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BarChart2 className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    No game data available yet. Play some games to see your distribution!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                          <achievement.icon className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.isNew && <Badge>New!</Badge>}
                      {!achievement.isNew && <Badge variant="secondary">Earned</Badge>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Award className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    No achievements yet. Keep playing to earn your first achievement!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Summary</CardTitle>
              <CardDescription>Your overall progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{userStats.sessionsCompleted || 0}</p>
                  <p className="text-sm text-gray-500">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {userStats.totalTime ? `${Math.round(userStats.totalTime)}m` : "0m"}
                  </p>
                  <p className="text-sm text-gray-500">Total Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(gameData).length}</p>
                  <p className="text-sm text-gray-500">Games Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(userStats.gamesPlayedByType || {}).length}</p>
                  <p className="text-sm text-gray-500">Games Tried</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Time Range Selector */}
          <div className="flex justify-end mb-2">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setSelectedTimeRange("week")}
                className={`px-3 py-1 text-xs rounded-l-md border ${
                  selectedTimeRange === "week"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedTimeRange("month")}
                className={`px-3 py-1 text-xs border-t border-b ${
                  selectedTimeRange === "month"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setSelectedTimeRange("all")}
                className={`px-3 py-1 text-xs rounded-r-md border ${
                  selectedTimeRange === "all"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Progress</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateStr" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="totalScore"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Game Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Performance</CardTitle>
              <CardDescription>Score breakdown by game type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateStr" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="memory" stroke="#8884d8" strokeWidth={2} name="Memory" />
                    <Line type="monotone" dataKey="reaction" stroke="#82ca9d" strokeWidth={2} name="Reaction" />
                    <Line type="monotone" dataKey="attention" stroke="#ffc658" strokeWidth={2} name="Attention" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Frequency</CardTitle>
              <CardDescription>Number of sessions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateStr" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          {/* Game Selector */}
          <div className="flex overflow-x-auto pb-2 gap-2">
            <Button
              variant={selectedGame === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGame("all")}
            >
              All Games
            </Button>
            <Button
              variant={selectedGame === "memory" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGame("memory")}
            >
              <Brain className="w-4 h-4 mr-1" /> Memory Matrix
            </Button>
            <Button
              variant={selectedGame === "reaction" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGame("reaction")}
            >
              <Zap className="w-4 h-4 mr-1" /> Lightning Reflexes
            </Button>
            <Button
              variant={selectedGame === "attention" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGame("attention")}
            >
              <Eye className="w-4 h-4 mr-1" /> Focus Filter
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Game-Specific Statistics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Performance metrics and timing data organized by individual games
              </p>
            </div>

            {/* Game-specific stats based on selection */}
            {(selectedGame === "all" || selectedGame === "memory") &&
              (selectedGame === "memory" ? (
                <MemoryMatrixStats gameData={gameData.memory} />
              ) : (
                <MemoryMatrixStatsSimple />
              ))}
            {(selectedGame === "all" || selectedGame === "reaction") &&
              (selectedGame === "reaction" ? (
                <LightningReflexesStats gameData={gameData.reaction} />
              ) : (
                <LightningReflexesStatsSimple />
              ))}
            {(selectedGame === "all" || selectedGame === "attention") && <FocusFilterStats />}
          </div>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {/* Cognitive Profile Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cognitive Profile</CardTitle>
              <CardDescription>Your strengths across different domains</CardDescription>
            </CardHeader>
            <CardContent>
              {cognitiveProfile.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={cognitiveProfile}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="domain" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Brain className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    No cognitive profile data available yet. Play more games to build your profile!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Domain Breakdown */}
          <div className="space-y-3">
            {cognitiveProfile.map((domain) => (
              <Card key={domain.domain}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{domain.domain}</h3>
                    <Badge variant={domain.score >= 80 ? "default" : domain.score >= 60 ? "secondary" : "outline"}>
                      {domain.score}/100
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Performance Overview</CardTitle>
              <CardDescription>Summary of your performance across all games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <h3 className="font-medium">Memory Matrix</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="font-bold">{gameData.memory?.bestLevel || 0}</p>
                      <p className="text-gray-500">Best Level</p>
                    </div>
                    <div>
                      <p className="font-bold">{gameData.memory?.bestScore || 0}</p>
                      <p className="text-gray-500">Best Score</p>
                    </div>
                    <div>
                      <p className="font-bold">{gameData.memory?.timesPlayed || 0}</p>
                      <p className="text-gray-500">Times Played</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-medium">Lightning Reflexes</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="font-bold">
                        {gameData.reaction?.bestReactionTime && gameData.reaction.bestReactionTime < 999
                          ? `${gameData.reaction.bestReactionTime}ms`
                          : "N/A"}
                      </p>
                      <p className="text-gray-500">Best Time</p>
                    </div>
                    <div>
                      <p className="font-bold">{gameData.reaction?.bestScore || 0}</p>
                      <p className="text-gray-500">Best Score</p>
                    </div>
                    <div>
                      <p className="font-bold">{gameData.reaction?.timesPlayed || 0}</p>
                      <p className="text-gray-500">Times Played</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">Focus Filter</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="font-bold">{Math.round(gameData.attention?.accuracy || 0)}%</p>
                      <p className="text-gray-500">Best Accuracy</p>
                    </div>
                    <div>
                      <p className="font-bold">{gameData.attention?.bestScore || 0}</p>
                      <p className="text-gray-500">Best Score</p>
                    </div>
                    <div>
                      <p className="font-bold">{gameData.attention?.timesPlayed || 0}</p>
                      <p className="text-gray-500">Times Played</p>
                    </div>
                  </div>
                </div>
              </div>

              {Object.values(gameData).every((game) => (game?.timesPlayed || 0) === 0) && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Start playing games to see detailed performance statistics and track your improvement over time!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
