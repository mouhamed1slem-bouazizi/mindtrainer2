"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { Trophy, Target, Brain, Zap, TrendingUp, Calendar, Award, Activity } from "lucide-react"

interface OverviewTabProps {
  data: any
  loading: boolean
}

export function OverviewTab({ data, loading }: OverviewTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
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

  const { userStats, gameData, recentSessions } = data

  // Calculate KPIs
  const totalSessions = recentSessions?.length || 0
  const totalScore =
    userStats?.achievements?.reduce((sum: number, achievement: any) => sum + (achievement.score || 0), 0) || 0
  const avgReactionTime = userStats?.avgReactionTime || 0
  const streakDays = calculateStreakDays(recentSessions)

  // Calculate brain itch impact
  const brainItchSessions = recentSessions?.filter((session: any) => session.category === "brain-itch") || []
  const brainItchImpact = calculateBrainItchImpact(brainItchSessions, recentSessions)

  // Prepare chart data
  const performanceData = generatePerformanceData(recentSessions)
  const gameDistribution = calculateGameDistribution(gameData)

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"]

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Total Score</span>
            </div>
            <div className="text-2xl font-bold">{totalScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Sessions</span>
            </div>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              <Activity className="inline h-3 w-3 mr-1" />
              {brainItchSessions.length} brain itch sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Avg Reaction</span>
            </div>
            <div className="text-2xl font-bold">{avgReactionTime}ms</div>
            <p className="text-xs text-muted-foreground">
              <Brain className="inline h-3 w-3 mr-1" />
              {avgReactionTime < 350 ? "Excellent" : avgReactionTime < 450 ? "Good" : "Improving"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">Streak</span>
            </div>
            <div className="text-2xl font-bold">{streakDays}</div>
            <p className="text-xs text-muted-foreground">
              <Award className="inline h-3 w-3 mr-1" />
              Days active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brain Itch Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Brain Itch Impact Analysis
          </CardTitle>
          <CardDescription>How brain itch category sessions contribute to your cognitive improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Brain Improvement Score</span>
                  <span>{brainItchImpact.improvementScore}%</span>
                </div>
                <Progress value={brainItchImpact.improvementScore} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Brain Itch Sessions</p>
                  <p className="text-lg font-semibold">{brainItchSessions.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Impact Factor</p>
                  <p className="text-lg font-semibold">{brainItchImpact.impactFactor.toFixed(2)}x</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Key Benefits</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enhanced neuroplasticity through targeted challenges</li>
                <li>• Improved cognitive flexibility and adaptation</li>
                <li>• Accelerated learning through difficulty progression</li>
                <li>• Strengthened neural pathways in problem-solving</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your cognitive performance trends over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              score: {
                label: "Performance Score",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-score)"
                  fill="var(--color-score)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Game Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Game Distribution</CardTitle>
            <CardDescription>Your training focus across different cognitive domains</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gameDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gameDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest cognitive milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats?.achievements?.slice(0, 4).map((achievement: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{achievement.name || "Cognitive Milestone"}</p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description || "Achievement unlocked"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements yet</p>
                  <p className="text-sm">Complete more sessions to unlock achievements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper functions
function calculateStreakDays(sessions: any[]): number {
  if (!sessions || sessions.length === 0) return 0

  const today = new Date()
  let streak = 0
  const currentDate = new Date(today)

  // Sort sessions by date
  const sortedSessions = sessions
    .map((session) => new Date(session.timestamp?.toDate?.() || session.date))
    .sort((a, b) => b.getTime() - a.getTime())

  for (let i = 0; i < 30; i++) {
    const hasSessionOnDate = sortedSessions.some(
      (sessionDate) => sessionDate.toDateString() === currentDate.toDateString(),
    )

    if (hasSessionOnDate) {
      streak++
    } else if (streak > 0) {
      break
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

function calculateBrainItchImpact(brainItchSessions: any[], allSessions: any[]) {
  const totalSessions = allSessions?.length || 1
  const brainItchCount = brainItchSessions?.length || 0

  const brainItchPercentage = (brainItchCount / totalSessions) * 100
  const impactFactor = brainItchCount > 0 ? 1 + brainItchPercentage / 100 : 1
  const improvementScore = Math.min(brainItchPercentage * 2, 100)

  return {
    improvementScore: Math.round(improvementScore),
    impactFactor,
    brainItchPercentage: Math.round(brainItchPercentage),
  }
}

function generatePerformanceData(sessions: any[]) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      score: 0,
      fullDate: date.toDateString(),
    }
  })

  sessions?.forEach((session) => {
    const sessionDate = new Date(session.timestamp?.toDate?.() || session.date).toDateString()
    const dayData = last30Days.find((day) => day.fullDate === sessionDate)
    if (dayData) {
      dayData.score += session.score || 0
    }
  })

  return last30Days.map(({ fullDate, ...day }) => day)
}

function calculateGameDistribution(gameData: any) {
  const games = [
    { name: "Memory", value: gameData?.memory?.timesPlayed || 0 },
    { name: "Attention", value: gameData?.attention?.timesPlayed || 0 },
    { name: "Reaction", value: gameData?.reaction?.timesPlayed || 0 },
    { name: "Task Switcher", value: gameData?.taskSwitcher?.timesPlayed || 0 },
  ]

  return games.filter((game) => game.value > 0)
}
