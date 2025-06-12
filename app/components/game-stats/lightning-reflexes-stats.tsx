"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { Zap, Clock, Target, Award, TrendingUp, Star, Trophy } from "lucide-react"

interface LightningReflexesStatsProps {
  gameData: any
}

export function LightningReflexesStats({ gameData }: LightningReflexesStatsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Format time helper
  const formatTime = (ms: number) => {
    if (!ms || ms === 0) return "0ms"
    return `${ms}ms`
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes("Time") ? "ms" : entry.name.includes("Accuracy") ? "%" : ""}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Generate level progression data
  const generateLevelProgressionData = () => {
    if (!gameData?.levelHistory || gameData.levelHistory.length === 0) {
      return []
    }

    return gameData.levelHistory.slice(-20).map((level: any) => ({
      name: `L${level.level}`,
      level: level.level,
      score: level.score,
      accuracy: level.accuracy,
      time: level.time,
    }))
  }

  // Generate reaction time distribution
  const generateReactionTimeData = () => {
    if (!gameData?.reactionTimes || gameData.reactionTimes.length === 0) {
      return []
    }

    const times = gameData.reactionTimes.slice(-50)
    const ranges = [
      { range: "0-200ms", min: 0, max: 200, count: 0 },
      { range: "200-400ms", min: 200, max: 400, count: 0 },
      { range: "400-600ms", min: 400, max: 600, count: 0 },
      { range: "600-800ms", min: 600, max: 800, count: 0 },
      { range: "800ms+", min: 800, max: Number.POSITIVE_INFINITY, count: 0 },
    ]

    times.forEach((time: number) => {
      const range = ranges.find((r) => time >= r.min && time < r.max)
      if (range) range.count++
    })

    return ranges
  }

  // Generate performance over time data
  const generatePerformanceData = () => {
    if (!gameData?.history || gameData.history.length === 0) {
      return []
    }

    return gameData.history.slice(-10).map((session: any, index: number) => {
      const date = new Date(session.date)
      return {
        name: `Session ${index + 1}`,
        date: date.toLocaleDateString(),
        score: session.score,
        accuracy: session.metrics?.avgAccuracy || 0,
        avgReactionTime: session.metrics?.avgReactionTime || 0,
        levelsCompleted: session.metrics?.levelsCompleted || 0,
      }
    })
  }

  const levelProgressionData = generateLevelProgressionData()
  const reactionTimeData = generateReactionTimeData()
  const performanceData = generatePerformanceData()

  // Calculate level progress
  const currentLevel = gameData?.levelReached || 1
  const levelProgress = (currentLevel / 100) * 100

  // If no data, show placeholder
  if (!gameData || gameData.timesPlayed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Lightning Reflexes Statistics
          </CardTitle>
          <CardDescription>Play Lightning Reflexes to see your statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Zap className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            No data available yet. Play Lightning Reflexes to track your progress through 100 levels!
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
          Lightning Reflexes Statistics
        </CardTitle>
        <CardDescription>Detailed performance metrics across 100 challenging levels</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Stats */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="text-2xl font-bold text-yellow-600">{gameData.bestScore || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Level</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-orange-600">{currentLevel}</p>
                <Badge variant="outline" className="text-xs">
                  {currentLevel >= 100
                    ? "MASTER"
                    : currentLevel >= 80
                      ? "EXPERT"
                      : currentLevel >= 60
                        ? "ADVANCED"
                        : currentLevel >= 40
                          ? "SKILLED"
                          : currentLevel >= 20
                            ? "INTERMEDIATE"
                            : "BEGINNER"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Level Progress</span>
              <span>{currentLevel}/100</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Times Played</p>
              <p className="text-lg font-medium">{gameData.timesPlayed || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Best Streak</p>
              <p className="text-lg font-medium">{gameData.bestStreak || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Reaction</p>
              <p className="text-lg font-medium">{formatTime(gameData.avgReactionTime || 0)}</p>
            </div>
          </div>
        </div>

        {/* Tabs for different stats */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="levels">Levels</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Best Reaction</span>
                </div>
                <p className="text-xl font-bold text-blue-600">{formatTime(gameData.bestReactionTime || 0)}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Avg Accuracy</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {gameData.history && gameData.history.length > 0
                    ? `${Math.round(gameData.history[gameData.history.length - 1]?.metrics?.avgAccuracy || 0)}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Achievement Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Speed Demon (Sub-200ms)</span>
                  <Badge variant={gameData.bestReactionTime < 200 ? "default" : "outline"}>
                    {gameData.bestReactionTime < 200 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Level Master (Level 50+)</span>
                  <Badge variant={currentLevel >= 50 ? "default" : "outline"}>
                    {currentLevel >= 50 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Perfect Streak (10+ Streak)</span>
                  <Badge variant={gameData.bestStreak >= 10 ? "default" : "outline"}>
                    {gameData.bestStreak >= 10 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Performance Insights</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentLevel >= 80
                  ? "You've mastered the advanced levels! Your reflexes are exceptional."
                  : currentLevel >= 50
                    ? "Great progress! You're developing excellent reaction skills."
                    : currentLevel >= 20
                      ? "Good improvement! Keep practicing to reach advanced levels."
                      : "You're just getting started. Focus on consistency and speed."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="levels" className="mt-4">
            {levelProgressionData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={levelProgressionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        name="Score"
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{Math.max(...levelProgressionData.map((l) => l.score))}</p>
                    <p className="text-sm text-gray-500">Best Level Score</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {Math.round(
                        levelProgressionData.reduce((sum, l) => sum + l.accuracy, 0) / levelProgressionData.length,
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-500">Avg Accuracy</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">
                      {Math.round(
                        levelProgressionData.reduce((sum, l) => sum + l.time, 0) / levelProgressionData.length / 1000,
                      )}
                      s
                    </p>
                    <p className="text-sm text-gray-500">Avg Time</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No level data available yet. Complete more levels to see your progression!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            {performanceData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      name="Score"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="levelsCompleted"
                      stroke="#82ca9d"
                      name="Levels Completed"
                      strokeWidth={2}
                      dot={{ fill: "#82ca9d" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No performance history available yet. Play more sessions to see your improvement!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            {reactionTimeData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reactionTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Reaction Count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Reaction Time Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your reaction times show{" "}
                    {reactionTimeData[0].count > reactionTimeData[4].count ? "excellent" : "good"} reflexes. Most
                    professional gamers achieve consistent sub-200ms reactions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No reaction time data available yet. Play more to analyze your reaction patterns!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
