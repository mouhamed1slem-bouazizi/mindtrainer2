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
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Trophy, Clock, Target, Brain, Zap, Eye } from "lucide-react"

interface ProgressDashboardProps {
  gameData: any
  userStats: any
}

export function ProgressDashboard({ gameData, userStats }: ProgressDashboardProps) {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 10)
    return `${seconds}.${ms.toString().padStart(2, "0")}s`
  }

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

  // Memory Matrix Timing Component
  const MemoryMatrixTiming = () => {
    const memoryGameData = gameData.memory
    const levelTimesData = memoryGameData?.levelTimes || []

    if (levelTimesData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Memory Matrix Timing
            </CardTitle>
            <CardDescription>Complete some Memory Matrix levels to see timing statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-8">
              No timing data available yet. Play the Memory Matrix game to start tracking your performance!
            </p>
          </CardContent>
        </Card>
      )
    }

    // Group level times by level for analysis
    const levelTimesByLevel = levelTimesData.reduce(
      (acc, lt) => {
        if (!acc[lt.level]) acc[lt.level] = []
        acc[lt.level].push(lt.time)
        return acc
      },
      {} as Record<number, number[]>,
    )

    // Create chart data for level times
    const levelTimesChartData = Object.entries(levelTimesByLevel)
      .map(([level, times]) => ({
        level: Number.parseInt(level),
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        bestTime: Math.min(...times),
        attempts: times.length,
      }))
      .sort((a, b) => a.level - b.level)
      .slice(0, 20) // Show first 20 levels

    // Recent performance trend (last 10 sessions)
    const recentSessions = memoryGameData?.history?.slice(-10) || []
    const sessionTimingData = recentSessions.map((session, index) => ({
      session: index + 1,
      averageTime: session.averageTimePerLevel || 0,
      totalTime: session.totalSessionTime || 0,
      levelsCompleted: session.level || 0,
      date: new Date(session.date).toLocaleDateString(),
    }))

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Memory Matrix Timing Statistics
            </CardTitle>
            <CardDescription>Performance metrics for Memory Matrix game</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Timing Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Fastest Level</span>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  {memoryGameData?.fastestLevel ? formatTime(memoryGameData.fastestLevel.time) : "N/A"}
                </p>
                {memoryGameData?.fastestLevel && (
                  <p className="text-xs text-purple-500">Level {memoryGameData.fastestLevel.level}</p>
                )}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Average Time</span>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {memoryGameData?.averageTimePerLevel ? formatTime(memoryGameData.averageTimePerLevel) : "N/A"}
                </p>
                <p className="text-xs text-blue-500">Per Level</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Playing Time</span>
                  <span className="text-lg font-bold text-green-600">
                    {memoryGameData?.totalTimePlayed
                      ? `${Math.round(memoryGameData.totalTimePlayed / 60000)}m ${Math.round((memoryGameData.totalTimePlayed % 60000) / 1000)}s`
                      : "0m 0s"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Levels with Timing Data</span>
                  <span className="text-lg font-bold text-orange-600">{Object.keys(levelTimesByLevel).length}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Level Completions</span>
                  <span className="text-lg font-bold text-indigo-600">{levelTimesData.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Times Chart */}
        {levelTimesChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Level Completion Times</CardTitle>
              <CardDescription>Average and best times by level for Memory Matrix</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  averageTime: {
                    label: "Average Time",
                    color: "hsl(var(--chart-1))",
                  },
                  bestTime: {
                    label: "Best Time",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelTimesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [formatTime(value as number), ""]}
                    />
                    <Bar dataKey="averageTime" fill="var(--color-averageTime)" name="Average Time" />
                    <Bar dataKey="bestTime" fill="var(--color-bestTime)" name="Best Time" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Session Performance Trend */}
        {sessionTimingData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Memory Matrix Session Performance</CardTitle>
              <CardDescription>Average time per level across recent sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  averageTime: {
                    label: "Avg Time (ms)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionTimingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [formatTime(value as number), "Average Time"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageTime"
                      stroke="var(--color-averageTime)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-averageTime)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Lightning Reflexes Timing Component
  const LightningReflexesTiming = () => {
    const reactionGameData = gameData.reaction

    if (!reactionGameData?.bestReactionTime || reactionGameData.bestReactionTime === 999) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Lightning Reflexes Timing
            </CardTitle>
            <CardDescription>Complete some Lightning Reflexes games to see timing statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-8">
              No timing data available yet. Play the Lightning Reflexes game to start tracking your reaction times!
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Lightning Reflexes Timing Statistics
          </CardTitle>
          <CardDescription>Reaction time performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Best Reaction Time</span>
              </div>
              <p className="text-xl font-bold text-yellow-600">{reactionGameData.bestReactionTime}ms</p>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Average Reaction</span>
              </div>
              <p className="text-xl font-bold text-orange-600">
                {reactionGameData.avgReactionTime || userStats.avgReactionTime}ms
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Games Played</span>
              <span className="text-lg font-bold text-blue-600">{reactionGameData.timesPlayed || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Focus Filter Timing Component
  const FocusFilterTiming = () => {
    const attentionGameData = gameData.attention

    if (!attentionGameData?.timesPlayed || attentionGameData.timesPlayed === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Focus Filter Timing
            </CardTitle>
            <CardDescription>Complete some Focus Filter games to see timing statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center py-8">
              No timing data available yet. Play the Focus Filter game to start tracking your attention performance!
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Focus Filter Timing Statistics
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
              <p className="text-xl font-bold text-blue-600">{Math.round(attentionGameData.accuracy || 0)}%</p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Games Played</span>
              </div>
              <p className="text-xl font-bold text-green-600">{attentionGameData.timesPlayed}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Best Score</span>
              <span className="text-lg font-bold text-purple-600">{attentionGameData.bestScore || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold">Progress Dashboard</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="timing">Game Timing</TabsTrigger>
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
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {gameData.memory?.averageTimePerLevel ? formatTime(gameData.memory.averageTimePerLevel) : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">Avg Level Time</p>
                    <Badge variant="secondary" className="mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      -5%
                    </Badge>
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
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Lightning Fast</p>
                      <p className="text-sm text-gray-500">
                        {gameData.memory?.fastestLevel
                          ? `Level ${gameData.memory.fastestLevel.level} in ${formatTime(gameData.memory.fastestLevel.time)}`
                          : "Complete a level quickly"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Personal Best</Badge>
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
                  <p className="text-2xl font-bold">
                    {gameData.memory?.totalTimePlayed
                      ? `${Math.round(gameData.memory.totalTimePlayed / 60000)}m`
                      : "23m"}
                  </p>
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

        <TabsContent value="timing" className="space-y-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Game-Specific Timing Statistics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Performance metrics and timing data organized by individual games
              </p>
            </div>

            {/* Memory Matrix Timing */}
            <MemoryMatrixTiming />

            {/* Lightning Reflexes Timing */}
            <LightningReflexesTiming />

            {/* Focus Filter Timing */}
            <FocusFilterTiming />
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
