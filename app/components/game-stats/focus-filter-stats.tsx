"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ScatterChart,
  Scatter,
} from "recharts"
import { Eye, Clock, Target, Award, TrendingUp, Zap } from "lucide-react"

interface FocusFilterStatsProps {
  gameData: any
}

export function FocusFilterStats({ gameData }: FocusFilterStatsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Format time helper
  const formatTime = (ms: number) => {
    if (!ms || ms === 0) return "0.00s"
    const seconds = Math.floor(ms / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}s`
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

  // Generate round performance data
  const generateRoundPerformanceData = () => {
    if (!gameData?.history || gameData.history.length === 0) {
      return []
    }

    const latestSession = gameData.history[gameData.history.length - 1]
    if (!latestSession?.roundTimes) return []

    return latestSession.roundTimes.map((round: any) => ({
      name: `Round ${round.round}`,
      time: round.time,
      accuracy: round.accuracy,
      targets: round.targets,
    }))
  }

  // Generate session progress data
  const generateSessionProgressData = () => {
    if (!gameData?.history || gameData.history.length === 0) {
      return []
    }

    return gameData.history
      .slice(-10) // Get last 10 sessions
      .map((entry: any, sessionIndex: number) => {
        const date = new Date(entry.date)
        return {
          name: `Session ${sessionIndex + 1}`,
          date: date.toLocaleDateString(),
          accuracy: entry.accuracy || 0,
          score: entry.score || 0,
          avgTimePerTarget: entry.metrics?.averageTimePerTarget || 0,
        }
      })
  }

  // Generate accuracy vs speed scatter data
  const generateAccuracySpeedData = () => {
    if (!gameData?.history || gameData.history.length === 0) {
      return []
    }

    return gameData.history.map((entry: any, index: number) => ({
      accuracy: entry.accuracy || 0,
      speed: entry.metrics?.averageTimePerTarget ? 1000 / entry.metrics.averageTimePerTarget : 0,
      session: index + 1,
    }))
  }

  const roundPerformanceData = generateRoundPerformanceData()
  const sessionProgressData = generateSessionProgressData()
  const accuracySpeedData = generateAccuracySpeedData()

  // If no data, show placeholder
  if (!gameData || gameData.timesPlayed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Focus Filter Statistics
          </CardTitle>
          <CardDescription>Play Focus Filter to see your statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Eye className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            No data available yet. Play Focus Filter to track your attention and focus skills!
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
          Focus Filter Statistics
        </CardTitle>
        <CardDescription>Detailed performance metrics for Focus Filter game</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Stats */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="text-2xl font-bold text-blue-600">{gameData.bestScore || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Best Accuracy</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(gameData.accuracy || 0)}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Times Played</p>
              <p className="text-lg font-medium">{gameData.timesPlayed || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fastest Round</p>
              <p className="text-lg font-medium">
                {gameData.fastestRound
                  ? `${formatTime(gameData.fastestRound.time)} (Round ${gameData.fastestRound.round})`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for different stats */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Focus Efficiency</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {gameData.focusEfficiency ? Math.round(gameData.focusEfficiency) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Consistency Score</span>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  {gameData.consistencyScore ? Math.round(gameData.consistencyScore) : 0}%
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Attention Performance</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {gameData.accuracy >= 90
                  ? "Exceptional attention control! You have excellent selective attention skills."
                  : gameData.accuracy >= 75
                    ? "Great focus abilities! Your attention filtering is above average."
                    : gameData.accuracy >= 60
                      ? "Good attention skills. With practice, you can improve your focus."
                      : "Keep practicing to enhance your selective attention and focus control."}
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Cognitive Benefits</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Focus Filter trains your selective attention, which is crucial for filtering distractions and
                maintaining concentration. This skill transfers to improved focus in daily tasks and better cognitive
                control.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="rounds" className="mt-4">
            {roundPerformanceData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roundPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="time" name="Completion Time" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No round data available yet. Play more games to see your round-by-round performance!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            {sessionProgressData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#8884d8"
                        name="Accuracy %"
                        strokeWidth={2}
                        dot={{ fill: "#8884d8" }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="score"
                        stroke="#82ca9d"
                        name="Score"
                        strokeWidth={2}
                        dot={{ fill: "#82ca9d" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {accuracySpeedData.length > 0 && (
                  <div className="h-[300px]">
                    <h4 className="text-sm font-medium mb-2">Accuracy vs Speed Analysis</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={accuracySpeedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="accuracy" name="Accuracy %" />
                        <YAxis dataKey="speed" name="Speed (targets/sec)" />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter name="Sessions" data={accuracySpeedData} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No progress data available yet. Play more games to track your improvement!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
