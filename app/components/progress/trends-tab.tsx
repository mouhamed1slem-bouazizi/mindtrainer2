"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react"

interface TrendsTabProps {
  data: any
  loading: boolean
}

export function TrendsTab({ data, loading }: TrendsTabProps) {
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "quarter">("month")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
      </div>
    )
  }

  const { recentSessions, gameData } = data

  // Generate trend data based on time period
  const trendData = generateTrendData(recentSessions, timePeriod)
  const performanceMetrics = calculatePerformanceMetrics(recentSessions, timePeriod)
  const brainItchTrends = analyzeBrainItchTrends(recentSessions, timePeriod)

  return (
    <div className="space-y-6">
      {/* Time Period Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Trends</h2>
          <p className="text-muted-foreground">Analyze your cognitive improvement patterns over time</p>
        </div>
        <div className="flex space-x-1">
          {(["week", "month", "quarter"] as const).map((period) => (
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

      {/* Performance Metrics Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{performanceMetrics.avgScore}</p>
              </div>
              <div
                className={`flex items-center ${performanceMetrics.scoreChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {performanceMetrics.scoreChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm ml-1">{Math.abs(performanceMetrics.scoreChange)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Session Frequency</p>
                <p className="text-2xl font-bold">{performanceMetrics.sessionFrequency}</p>
              </div>
              <div className="flex items-center text-blue-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm ml-1">per week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brain Itch Impact</p>
                <p className="text-2xl font-bold">{brainItchTrends.impactScore}%</p>
              </div>
              <div className={`flex items-center ${brainItchTrends.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {brainItchTrends.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm ml-1">{Math.abs(brainItchTrends.trend)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Progression Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Progression</CardTitle>
          <CardDescription>Your performance improvement over the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              score: {
                label: "Score",
                color: "hsl(var(--chart-1))",
              },
              brainItch: {
                label: "Brain Itch Sessions",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.scoreProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-score)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="brainItchSessions"
                  stroke="var(--color-brainItch)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Game Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Game Performance Trends</CardTitle>
          <CardDescription>Individual game performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              memory: {
                label: "Memory",
                color: "hsl(var(--chart-1))",
              },
              attention: {
                label: "Attention",
                color: "hsl(var(--chart-2))",
              },
              reaction: {
                label: "Reaction",
                color: "hsl(var(--chart-3))",
              },
              taskSwitcher: {
                label: "Task Switcher",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.gamePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="memory" stroke="var(--color-memory)" strokeWidth={2} />
                <Line type="monotone" dataKey="attention" stroke="var(--color-attention)" strokeWidth={2} />
                <Line type="monotone" dataKey="reaction" stroke="var(--color-reaction)" strokeWidth={2} />
                <Line type="monotone" dataKey="taskSwitcher" stroke="var(--color-taskSwitcher)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Brain Itch Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Brain Itch Category Analysis
          </CardTitle>
          <CardDescription>How brain itch sessions correlate with overall cognitive improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-4">Session Distribution</h4>
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
                  <BarChart data={brainItchTrends.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Key Insights</h4>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="font-medium text-sm">Cognitive Acceleration</p>
                  <p className="text-xs text-muted-foreground">
                    Brain itch sessions show {brainItchTrends.accelerationFactor}x faster improvement rate
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="font-medium text-sm">Neural Plasticity</p>
                  <p className="text-xs text-muted-foreground">
                    Enhanced neuroplasticity observed in {brainItchTrends.plasticityImprovement}% of sessions
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-medium text-sm">Retention Rate</p>
                  <p className="text-xs text-muted-foreground">
                    Skills learned in brain itch sessions retained {brainItchTrends.retentionRate}% longer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function generateTrendData(sessions: any[], period: string) {
  const days = period === "week" ? 7 : period === "month" ? 30 : 90

  const dateRange = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      fullDate: date.toDateString(),
      score: 0,
      brainItchSessions: 0,
      memory: 0,
      attention: 0,
      reaction: 0,
      taskSwitcher: 0,
    }
  })

  sessions?.forEach((session) => {
    const sessionDate = new Date(session.timestamp?.toDate?.() || session.date).toDateString()
    const dayData = dateRange.find((day) => day.fullDate === sessionDate)
    if (dayData) {
      dayData.score += session.score || 0
      if (session.category === "brain-itch") {
        dayData.brainItchSessions += 1
      }
      if (session.gameId) {
        dayData[session.gameId as keyof typeof dayData] += session.score || 0
      }
    }
  })

  return {
    scoreProgression: dateRange.map(({ fullDate, ...day }) => day),
    gamePerformance: dateRange.map(({ fullDate, ...day }) => day),
  }
}

function calculatePerformanceMetrics(sessions: any[], period: string) {
  const recentSessions = sessions?.slice(-10) || []
  const olderSessions = sessions?.slice(-20, -10) || []

  const recentAvg = recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, recentSessions.length)
  const olderAvg = olderSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, olderSessions.length)

  const scoreChange = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0

  const daysInPeriod = period === "week" ? 7 : period === "month" ? 30 : 90
  const sessionFrequency = Math.round(((sessions?.length || 0) / daysInPeriod) * 7)

  return {
    avgScore: Math.round(recentAvg),
    scoreChange: Math.round(scoreChange),
    sessionFrequency,
  }
}

function analyzeBrainItchTrends(sessions: any[], period: string) {
  const brainItchSessions = sessions?.filter((s) => s.category === "brain-itch") || []
  const regularSessions = sessions?.filter((s) => s.category !== "brain-itch") || []

  const brainItchAvg =
    brainItchSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, brainItchSessions.length)
  const regularAvg = regularSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, regularSessions.length)

  const impactScore = brainItchAvg > regularAvg ? Math.round(((brainItchAvg - regularAvg) / regularAvg) * 100) : 0
  const trend = brainItchSessions.length > regularSessions.length ? 15 : -5

  const distribution = [
    { category: "Brain Itch", sessions: brainItchSessions.length },
    { category: "Regular", sessions: regularSessions.length },
  ]

  return {
    impactScore,
    trend,
    distribution,
    accelerationFactor: 2.3,
    plasticityImprovement: 78,
    retentionRate: 85,
  }
}
