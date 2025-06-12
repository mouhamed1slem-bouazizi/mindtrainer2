"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { Trophy, Target, Brain, Zap, Eye, RotateCcw, Calendar, Wifi, WifiOff } from "lucide-react"
import { useFirestoreRealtime } from "@/app/hooks/use-firestore-realtime"
import { useAuth } from "@/contexts/auth-context"

export function ProgressDashboard() {
  const { user } = useAuth()
  const { data, loading, error, retry } = useFirestoreRealtime(user?.uid || null)
  const [selectedGame, setSelectedGame] = useState("memory")
  const [timePeriod, setTimePeriod] = useState("month")

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading your progress...
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-red-600">
            <WifiOff className="h-4 w-4" />
            Connection issue
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Unable to load your progress data</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={retry} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use default data if no data available
  const safeData = data || {
    gameData: {
      memory: { bestScore: 0, timesPlayed: 0, bestLevel: 0, history: [] },
      reaction: { bestScore: 0, timesPlayed: 0, bestReactionTime: 999, history: [] },
      attention: { bestScore: 0, timesPlayed: 0, accuracy: 0, history: [] },
      taskSwitcher: { bestScore: 0, timesPlayed: 0, bestLevel: 0, history: [] },
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
    sessionHistory: [],
    processedData: {
      dailyScores: [],
      gamePerformance: [],
      trainingFrequency: [],
      weeklyStats: { totalSessions: 0, totalScore: 0, avgScore: 0, gameStats: {}, period: "7 days" },
      monthlyStats: { totalSessions: 0, totalScore: 0, avgScore: 0, gameStats: {}, period: "30 days" },
    },
  }

  const { gameData, userStats, recentSessions, processedData } = safeData

  // Game configurations
  const games = [
    {
      id: "memory",
      name: "Memory Matrix",
      icon: Brain,
      color: "bg-blue-500",
      description: "Test your working memory with pattern sequences",
      primarySkills: ["Working Memory", "Pattern Recognition"],
      brainAreas: ["Prefrontal Cortex", "Parietal Cortex"],
      data: gameData.memory,
    },
    {
      id: "reaction",
      name: "Lightning Reflexes",
      icon: Zap,
      color: "bg-yellow-500",
      description: "Measure and improve your reaction speed",
      primarySkills: ["Processing Speed", "Motor Response"],
      brainAreas: ["Motor Cortex", "Cerebellum"],
      data: gameData.reaction,
    },
    {
      id: "attention",
      name: "Focus Filter",
      icon: Eye,
      color: "bg-green-500",
      description: "Enhance your selective attention and focus",
      primarySkills: ["Selective Attention", "Cognitive Control"],
      brainAreas: ["Anterior Cingulate", "Frontal Cortex"],
      data: gameData.attention,
    },
    {
      id: "taskSwitcher",
      name: "Task Switcher",
      icon: RotateCcw,
      color: "bg-purple-500",
      description: "Improve cognitive flexibility and multitasking",
      primarySkills: ["Cognitive Flexibility", "Task Switching"],
      brainAreas: ["Prefrontal Cortex", "Basal Ganglia"],
      data: gameData.taskSwitcher,
    },
  ]

  const selectedGameData = games.find((game) => game.id === selectedGame)

  // Calculate domain performance
  const domainPerformance = [
    {
      domain: "Memory",
      score: Math.round((gameData.memory.bestScore / 100) * 100) || 0,
      level:
        gameData.memory.bestScore > 80
          ? "Expert"
          : gameData.memory.bestScore > 60
            ? "Advanced"
            : gameData.memory.bestScore > 40
              ? "Intermediate"
              : "Beginner",
      sessions: gameData.memory.timesPlayed,
    },
    {
      domain: "Attention",
      score: Math.round((gameData.attention.bestScore / 100) * 100) || 0,
      level:
        gameData.attention.bestScore > 80
          ? "Expert"
          : gameData.attention.bestScore > 60
            ? "Advanced"
            : gameData.attention.bestScore > 40
              ? "Intermediate"
              : "Beginner",
      sessions: gameData.attention.timesPlayed,
    },
    {
      domain: "Processing Speed",
      score:
        gameData.reaction.bestReactionTime < 300
          ? 90
          : gameData.reaction.bestReactionTime < 400
            ? 75
            : gameData.reaction.bestReactionTime < 500
              ? 60
              : 40,
      level:
        gameData.reaction.bestReactionTime < 300
          ? "Expert"
          : gameData.reaction.bestReactionTime < 400
            ? "Advanced"
            : gameData.reaction.bestReactionTime < 500
              ? "Intermediate"
              : "Beginner",
      sessions: gameData.reaction.timesPlayed,
    },
    {
      domain: "Cognitive Flexibility",
      score: Math.round((gameData.taskSwitcher.bestScore / 100) * 100) || 0,
      level:
        gameData.taskSwitcher.bestScore > 80
          ? "Expert"
          : gameData.taskSwitcher.bestScore > 60
            ? "Advanced"
            : gameData.taskSwitcher.bestScore > 40
              ? "Intermediate"
              : "Beginner",
      sessions: gameData.taskSwitcher.timesPlayed,
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wifi className="h-4 w-4 text-green-500" />
          <span>{recentSessions.length} sessions • Live data</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="games">Game Stats</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Score</span>
                </div>
                <div className="text-2xl font-bold">{userStats.totalScore.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all games</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Games Played</span>
                </div>
                <div className="text-2xl font-bold">{userStats.gamesPlayed}</div>
                <p className="text-xs text-muted-foreground">Total sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Avg Reaction</span>
                </div>
                <div className="text-2xl font-bold">{userStats.avgReactionTime}ms</div>
                <p className="text-xs text-muted-foreground">Response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Streak</span>
                </div>
                <div className="text-2xl font-bold">{userStats.streakDays}</div>
                <p className="text-xs text-muted-foreground">Days active</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.slice(0, 5).map((session, index) => (
                    <div key={session.id || index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{session.gameId || "Unknown Game"}</p>
                          <p className="text-sm text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Score: {session.score || 0}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.duration ? `${Math.round(session.duration / 1000)}s` : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent sessions</p>
                  <p className="text-sm">Start playing games to see your activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Time Period Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Time Period:</span>
            <div className="flex space-x-1">
              {["week", "month", "all"].map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Score Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Score Progress</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  totalScore: {
                    label: "Total Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.dailyScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="totalScore"
                      stroke="var(--color-totalScore)"
                      fill="var(--color-totalScore)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Game Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Game Performance</CardTitle>
              <CardDescription>Performance by game type</CardDescription>
            </CardHeader>
            <CardContent>
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
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.gamePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="memory" stroke="var(--color-memory)" />
                    <Line type="monotone" dataKey="reaction" stroke="var(--color-reaction)" />
                    <Line type="monotone" dataKey="attention" stroke="var(--color-attention)" />
                    <Line type="monotone" dataKey="taskSwitcher" stroke="var(--color-taskSwitcher)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Training Frequency */}
          <Card>
            <CardHeader>
              <CardTitle>Training Frequency</CardTitle>
              <CardDescription>Sessions per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sessions: {
                    label: "Sessions",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData.trainingFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Stats Tab */}
        <TabsContent value="games" className="space-y-6">
          {/* Game Selection */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => (
              <Card
                key={game.id}
                className={`cursor-pointer transition-all ${selectedGame === game.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedGame(game.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${game.color}`}>
                      <game.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{game.name}</p>
                      <p className="text-sm text-muted-foreground">{game.data.timesPlayed} sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Game Details */}
          {selectedGameData && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <selectedGameData.icon className="h-5 w-5" />
                    <span>{selectedGameData.name}</span>
                  </CardTitle>
                  <CardDescription>{selectedGameData.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGameData.primarySkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Brain Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGameData.brainAreas.map((area) => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Best Score</p>
                      <p className="text-2xl font-bold">{selectedGameData.data.bestScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Times Played</p>
                      <p className="text-2xl font-bold">{selectedGameData.data.timesPlayed}</p>
                    </div>
                    {selectedGameData.id === "reaction" && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Best Reaction Time</p>
                        <p className="text-2xl font-bold">{selectedGameData.data.bestReactionTime}ms</p>
                      </div>
                    )}
                    {selectedGameData.id === "attention" && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-2xl font-bold">{selectedGameData.data.accuracy}%</p>
                      </div>
                    )}
                    {(selectedGameData.id === "memory" || selectedGameData.id === "taskSwitcher") && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Best Level</p>
                        <p className="text-2xl font-bold">{selectedGameData.data.bestLevel}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {domainPerformance.map((domain) => (
              <Card key={domain.domain}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{domain.domain}</span>
                    <Badge
                      variant={
                        domain.level === "Expert" ? "default" : domain.level === "Advanced" ? "secondary" : "outline"
                      }
                    >
                      {domain.level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Performance</span>
                      <span>{domain.score}%</span>
                    </div>
                    <Progress value={domain.score} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">{domain.sessions} training sessions completed</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
