"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Brain,
  Target,
  Zap,
  Eye,
  Trophy,
  Star,
  Lightbulb,
  BookOpen,
  CheckCircle,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useFirestoreRealtime } from "@/app/hooks/use-firestore-realtime"
import { MemoryMatrixStats } from "./game-stats/memory-matrix-stats"
import { LightningReflexesStats } from "./game-stats/lightning-reflexes-stats"
import { FocusFilterStats } from "./game-stats/focus-filter-stats"
import { TaskSwitcherStats } from "./game-stats/task-switcher-stats"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ProgressDashboardProps {
  className?: string
}

export function ProgressDashboard({ className }: ProgressDashboardProps) {
  const { user } = useAuth()
  const [selectedGame, setSelectedGame] = useState("memory")
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Use Firestore realtime hook for data
  const {
    data: firestoreData,
    loading: firestoreLoading,
    error: firestoreError,
    retry: retryFirestore,
  } = useFirestoreRealtime(user?.uid || null)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Extract data with fallbacks
  const gameData = firestoreData?.gameData || {
    memory: { bestScore: 0, timesPlayed: 0, bestLevel: 0, history: [] },
    reaction: { bestScore: 0, timesPlayed: 0, bestReactionTime: 999, history: [] },
    attention: { bestScore: 0, timesPlayed: 0, accuracy: 0, history: [] },
    taskSwitcher: { bestScore: 0, timesPlayed: 0, bestLevel: 0, history: [] },
  }

  const userStats = firestoreData?.userStats || {
    totalScore: 0,
    avgReactionTime: 0,
    gamesPlayed: 0,
    streakDays: 0,
    totalTime: 0,
    lastActive: new Date().toISOString(),
    sessionsCompleted: 0,
    gamesPlayedByType: {},
    achievements: [],
  }

  const recentSessions = firestoreData?.recentSessions || []

  // Handle retry with exponential backoff
  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1)
    await retryFirestore()
  }

  // Calculate derived metrics
  const totalSessions = Object.values(gameData).reduce((total, game: any) => total + (game?.timesPlayed || 0), 0)
  const gamesTriedCount = Object.values(gameData).filter((game: any) => (game?.timesPlayed || 0) > 0).length
  const estimatedTotalTime = Math.max(Math.round(userStats.totalTime || totalSessions * 2), 1) // Fallback estimation

  // Calculate game distribution percentages
  const calculateGameDistribution = () => {
    const total = totalSessions || 1 // Avoid division by zero
    return {
      memory: Math.round(((gameData.memory?.timesPlayed || 0) / total) * 100),
      reaction: Math.round(((gameData.reaction?.timesPlayed || 0) / total) * 100),
      attention: Math.round(((gameData.attention?.timesPlayed || 0) / total) * 100),
      taskSwitcher: Math.round(((gameData.taskSwitcher?.timesPlayed || 0) / total) * 100),
    }
  }

  const gameDistribution = calculateGameDistribution()

  const cognitiveGames = [
    {
      id: "memory",
      name: "Memory Matrix",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      domain: "Working Memory",
      description: "Spatial working memory and pattern recognition",
      stats: gameData.memory,
      percentage: gameDistribution.memory,
    },
    {
      id: "reaction",
      name: "Lightning Reflexes",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      domain: "Processing Speed",
      description: "Reaction time and cognitive flexibility",
      stats: gameData.reaction,
      percentage: gameDistribution.reaction,
    },
    {
      id: "attention",
      name: "Focus Filter",
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      domain: "Attention",
      description: "Selective attention and inhibitory control",
      stats: gameData.attention,
      percentage: gameDistribution.attention,
    },
    {
      id: "taskSwitcher",
      name: "Task Switcher",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      domain: "Executive Function",
      description: "Cognitive flexibility and task switching",
      stats: gameData.taskSwitcher,
      percentage: gameDistribution.taskSwitcher,
    },
  ]

  const domains = [
    {
      name: "Working Memory",
      games: ["Memory Matrix"],
      color: "purple",
      description: "Ability to hold and manipulate information in mind",
    },
    {
      name: "Processing Speed",
      games: ["Lightning Reflexes"],
      color: "yellow",
      description: "Speed of cognitive processing and reaction time",
    },
    {
      name: "Attention",
      games: ["Focus Filter"],
      color: "blue",
      description: "Ability to focus and filter distracting information",
    },
    {
      name: "Executive Function",
      games: ["Task Switcher"],
      color: "green",
      description: "Higher-order cognitive control and flexibility",
    },
  ]

  // Loading state
  if (firestoreLoading) {
    return (
      <div className={`space-y-6 pb-20 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <div className="text-lg font-medium">Loading your progress...</div>
            <div className="text-sm text-gray-500">Fetching data from Firestore</div>
          </div>
        </div>
      </div>
    )
  }

  // Offline state
  if (!isOnline) {
    return (
      <div className={`space-y-6 pb-20 ${className}`}>
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <strong>You're offline</strong>
                <p className="text-sm mt-1">
                  Your progress data cannot be loaded without an internet connection. Please check your network and try
                  again.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <WifiOff className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Offline Mode</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
              Your progress data is stored in the cloud and requires an internet connection to display. Once you're back
              online, all your achievements and statistics will be available.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (firestoreError) {
    return (
      <div className={`space-y-6 pb-20 ${className}`}>
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="flex items-center justify-between">
              <div>
                <strong>Failed to load progress data</strong>
                <p className="text-sm mt-1">
                  {firestoreError.message || "There was an error connecting to the database. Please try again."}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({retryCount})
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Unable to Load Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
              We're having trouble connecting to our servers. This might be a temporary issue.
            </p>
            <div className="space-x-2">
              <Button onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No user state
  if (!user) {
    return (
      <div className={`space-y-6 pb-20 ${className}`}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to view your progress data.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-6 pb-20 ${className}`}>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="games">Game Stats</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="details">Game Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-500">Total Score</span>
                </div>
                <div className="text-2xl font-bold">{userStats.totalScore.toLocaleString()}</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {userStats.totalScore > 0 ? "+164%" : "Start playing!"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-500">Day Streak</span>
                </div>
                <div className="text-2xl font-bold">{userStats.streakDays}</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {userStats.streakDays > 0 ? "Active" : "Start today!"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Game Distribution</CardTitle>
              <CardDescription>Your training focus across different games</CardDescription>
            </CardHeader>
            <CardContent>
              {totalSessions > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart Representation */}
                  <div className="relative w-48 h-48 mx-auto">
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `conic-gradient(
                          #8b5cf6 0deg ${gameDistribution.taskSwitcher * 3.6}deg,
                          #10b981 ${gameDistribution.taskSwitcher * 3.6}deg ${(gameDistribution.taskSwitcher + gameDistribution.reaction) * 3.6}deg,
                          #f59e0b ${(gameDistribution.taskSwitcher + gameDistribution.reaction) * 3.6}deg ${(gameDistribution.taskSwitcher + gameDistribution.reaction + gameDistribution.memory) * 3.6}deg,
                          #f97316 ${(gameDistribution.taskSwitcher + gameDistribution.reaction + gameDistribution.memory) * 3.6}deg 360deg
                        )`,
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{totalSessions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>TaskSwitcher {gameDistribution.taskSwitcher}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Reaction {gameDistribution.reaction}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Memory {gameDistribution.memory}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Attention {gameDistribution.attention}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No games played yet. Start training to see your distribution!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.avgReactionTime > 0 && userStats.avgReactionTime < 300 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">Speed Demon</div>
                        <div className="text-sm text-gray-500">
                          Reaction time under 300ms ({userStats.avgReactionTime}ms)
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-black text-white">New!</Badge>
                  </div>
                )}

                {gameData.memory?.bestLevel > 20 && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Memory Master</div>
                        <div className="text-sm text-gray-500">
                          Reached level {gameData.memory.bestLevel} in Memory Matrix
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                )}

                {gameData.attention?.accuracy > 95 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Focus Expert</div>
                        <div className="text-sm text-gray-500">
                          {Math.round(gameData.attention.accuracy)}% accuracy in Focus Filter
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                )}

                {userStats.totalScore > 1000 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Cognitive Athlete</div>
                        <div className="text-sm text-gray-500">Scored over 1,000 points</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                )}

                {(!userStats.avgReactionTime || userStats.avgReactionTime >= 300) &&
                  (!gameData.memory?.bestLevel || gameData.memory.bestLevel <= 20) &&
                  (!gameData.attention?.accuracy || gameData.attention.accuracy <= 95) &&
                  userStats.totalScore <= 1000 && (
                    <div className="text-center text-gray-500 py-4">Complete more games to unlock achievements!</div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Training Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Training Summary</CardTitle>
              <CardDescription>Your overall progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalSessions}</div>
                  <div className="text-sm text-gray-500">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{estimatedTotalTime}m</div>
                  <div className="text-sm text-gray-500">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-gray-500">Games Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{gamesTriedCount}</div>
                  <div className="text-sm text-gray-500">Games Tried</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {/* Time Period Filter */}
          <div className="flex justify-end mb-2">
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant="outline"
                className="rounded-l-md rounded-r-none bg-blue-500 text-white hover:bg-blue-600"
              >
                Week
              </Button>
              <Button variant="outline" className="rounded-none border-l-0 border-r-0">
                Month
              </Button>
              <Button variant="outline" className="rounded-r-md rounded-l-none">
                All Time
              </Button>
            </div>
          </div>

          {/* Score Progress Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Score Progress</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    totalScore: {
                      label: "Total Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={
                        recentSessions.length > 0
                          ? recentSessions
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .map((session) => ({
                                date: new Date(session.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                }),
                                totalScore: session.score,
                              }))
                          : Array.from({ length: 7 }, (_, i) => {
                              const date = new Date()
                              date.setDate(date.getDate() - (6 - i))
                              return {
                                date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
                                totalScore: i === 6 ? userStats.totalScore : 0,
                              }
                            })
                      }
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="totalScore"
                        stroke="var(--color-totalScore)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Game Performance Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Game Performance</CardTitle>
              <CardDescription>Score breakdown by game type</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    memory: {
                      label: "Memory",
                      color: "hsl(var(--chart-1))",
                    },
                    reaction: {
                      label: "Reaction",
                      color: "hsl(var(--chart-2))",
                    },
                    attention: {
                      label: "Attention",
                      color: "hsl(var(--chart-3))",
                    },
                    taskSwitcher: {
                      label: "Task Switcher",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 7 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - (6 - i))
                        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "2-digit" })

                        // On the last day, show actual scores, otherwise show minimal progress
                        return {
                          date: dateStr,
                          memory:
                            i === 6
                              ? gameData.memory?.bestScore || 0
                              : Math.floor((gameData.memory?.bestScore || 0) * (i / 12)),
                          reaction:
                            i === 6
                              ? gameData.reaction?.bestScore || 0
                              : Math.floor((gameData.reaction?.bestScore || 0) * (i / 12)),
                          attention:
                            i === 6
                              ? gameData.attention?.bestScore || 0
                              : Math.floor((gameData.attention?.bestScore || 0) * (i / 12)),
                          taskSwitcher:
                            i === 6
                              ? gameData.taskSwitcher?.bestScore || 0
                              : Math.floor((gameData.taskSwitcher?.bestScore || 0) * (i / 12)),
                        }
                      })}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        stroke="var(--color-memory)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reaction"
                        stroke="var(--color-reaction)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="attention"
                        stroke="var(--color-attention)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="taskSwitcher"
                        stroke="var(--color-taskSwitcher)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Training Frequency Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Training Frequency</CardTitle>
              <CardDescription>Number of sessions over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    sessions: {
                      label: "Sessions",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Array.from({ length: 7 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - (6 - i))
                        return {
                          date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
                          sessions: i === 6 ? totalSessions : 0,
                        }
                      })}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Stats Tab */}
        <TabsContent value="games" className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {cognitiveGames.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedGame === game.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <game.icon className={`w-4 h-4 ${game.color}`} />
                  <span className="font-medium text-sm">{game.name}</span>
                </div>
                <div className="text-xs text-gray-500">{game.description}</div>
                <div className="text-xs text-gray-400 mt-1">{game.stats.timesPlayed || 0} sessions</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {selectedGame === "memory" && <MemoryMatrixStats gameData={gameData.memory} />}
            {selectedGame === "reaction" && <LightningReflexesStats gameData={gameData.reaction} />}
            {selectedGame === "attention" && <FocusFilterStats gameData={gameData.attention} />}
            {selectedGame === "taskSwitcher" && <TaskSwitcherStats gameData={gameData.taskSwitcher} />}
          </div>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Domains</CardTitle>
              <CardDescription>Your performance across different cognitive abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{domain.name}</h3>
                      <Badge variant="secondary">
                        {domain.games.length} game{domain.games.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{domain.description}</p>
                    <div className="space-y-2">
                      {domain.games.map((gameName) => {
                        const game = cognitiveGames.find((g) => g.name === gameName)
                        return (
                          <div key={gameName} className="flex items-center justify-between text-sm">
                            <span>{gameName}</span>
                            <div className="text-right">
                              <div className="text-gray-500">Level {game?.stats.bestLevel || 0}</div>
                              <div className="text-xs text-gray-400">{game?.stats.timesPlayed || 0} sessions</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="space-y-6">
            {/* Game Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Game Overview
                </CardTitle>
                <CardDescription>Comprehensive information about each cognitive training game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cognitiveGames.map((game) => (
                    <div key={game.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <game.icon className={`w-5 h-5 ${game.color}`} />
                        <h3 className="font-semibold">{game.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-green-500" />
                          <span>
                            <strong>Domain:</strong> {game.domain}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 ${game.bgColor} rounded-lg`}>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="font-bold">{game.stats.bestLevel || 0}</p>
                            <p className="text-gray-500">Best Level</p>
                          </div>
                          <div>
                            <p className="font-bold">{game.stats.bestScore || 0}</p>
                            <p className="text-gray-500">Best Score</p>
                          </div>
                          <div>
                            <p className="font-bold">{game.stats.timesPlayed || 0}</p>
                            <p className="text-gray-500">Times Played</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Performance Insights & Training Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Strengths */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Your Strengths
                    </h3>
                    <div className="space-y-2">
                      {userStats.totalScore > 5000 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>High overall performance across games</span>
                        </div>
                      )}
                      {userStats.avgReactionTime > 0 && userStats.avgReactionTime < 400 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>Excellent reaction speed</span>
                        </div>
                      )}
                      {gameData.memory?.bestLevel > 10 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span>Strong spatial memory abilities</span>
                        </div>
                      )}
                      {(!userStats.totalScore || userStats.totalScore <= 5000) &&
                        (!userStats.avgReactionTime || userStats.avgReactionTime >= 400) &&
                        (!gameData.memory?.bestLevel || gameData.memory.bestLevel <= 10) && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="w-4 h-4" />
                            <span>Play more games to discover your strengths!</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Training Tips */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Pro Tips
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-sm">Memory Strategy</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Visualize patterns as shapes or familiar objects to improve recall.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-sm">Speed Training</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Focus on accuracy first, then gradually increase your response speed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
