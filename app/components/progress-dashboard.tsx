"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Brain, Zap, Trophy } from "lucide-react"

interface ProgressDashboardProps {
  gameData: any
  userStats: any
}

export function ProgressDashboard({ gameData, userStats }: ProgressDashboardProps) {
  // Mock data for charts
  const weeklyProgress = [
    { day: "Mon", score: 450, reactionTime: 320 },
    { day: "Tue", score: 480, reactionTime: 310 },
    { day: "Wed", score: 520, reactionTime: 295 },
    { day: "Thu", score: 490, reactionTime: 305 },
    { day: "Fri", score: 560, reactionTime: 285 },
    { day: "Sat", score: 580, reactionTime: 275 },
    { day: "Sun", score: 620, reactionTime: 265 },
  ]

  const cognitiveProfile = [
    { domain: "Memory", score: 85, fullMark: 100 },
    { domain: "Attention", score: 72, fullMark: 100 },
    { domain: "Speed", score: 90, fullMark: 100 },
    { domain: "Reflexes", score: 88, fullMark: 100 },
    { domain: "Executive", score: 65, fullMark: 100 },
    { domain: "Problem Solving", score: 78, fullMark: 100 },
  ]

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold">Progress Dashboard</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="games">Game Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalScore}</p>
                    <p className="text-xs text-gray-500">Total Score</p>
                    <Badge variant="secondary" className="mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.avgReactionTime}ms</p>
                    <p className="text-xs text-gray-500">Avg Reaction</p>
                    <Badge variant="secondary" className="mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      -8%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Speed Demon</p>
                      <p className="text-sm text-gray-500">Reaction time under 300ms</p>
                    </div>
                  </div>
                  <Badge>New!</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Memory Master</p>
                      <p className="text-sm text-gray-500">Perfect recall in memory game</p>
                    </div>
                  </div>
                  <Badge variant="secondary">2 days ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
              <CardDescription>Your training summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-gray-500">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">23m</p>
                  <p className="text-sm text-gray-500">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Progress</CardTitle>
              <CardDescription>Your daily performance over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-score)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-score)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Reaction Time Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reaction Time</CardTitle>
              <CardDescription>Lower is better - your speed improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  reactionTime: {
                    label: "Reaction Time (ms)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="reactionTime"
                      stroke="var(--color-reactionTime)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-reactionTime)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {/* Cognitive Profile Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cognitive Profile</CardTitle>
              <CardDescription>Your strengths across different domains</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={cognitiveProfile}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--color-score)"
                      fill="var(--color-score)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
              <CardTitle className="text-lg">Memory Matrix Performance</CardTitle>
              <CardDescription>Your level progression over time.</CardDescription>
            </CardHeader>
            <CardContent>
              {gameData.memory?.history && gameData.memory.history.length > 1 ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <p className="font-bold text-xl">{gameData.memory.bestLevel || 0}</p>
                      <p className="text-xs text-gray-500">Highest Level</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl">{gameData.memory.bestScore || 0}</p>
                      <p className="text-xs text-gray-500">Best Score</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl">
                        {Math.round(
                          gameData.memory.history.reduce((acc, cur) => acc + cur.accuracy, 0) /
                            gameData.memory.history.length,
                        ) || 0}
                        %
                      </p>
                      <p className="text-xs text-gray-500">Avg Accuracy</p>
                    </div>
                  </div>
                  <ChartContainer
                    config={{
                      level: {
                        label: "Level",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={gameData.memory.history.map((h) => ({
                          ...h,
                          date: new Date(h.date).toLocaleDateString(),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="level" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="level"
                          stroke="var(--color-level)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-level)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Play the Memory Matrix game a few more times to see your progress chart here!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
