"use client"

import { useState } from "react"
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
  BarChart,
  Bar,
  Tooltip,
  Legend,
} from "recharts"
import { Zap, Clock, Target, Award, TrendingUp } from "lucide-react"

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
              {`${entry.name}: ${entry.value}ms`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Generate reaction time history data
  const generateReactionTimeData = () => {
    if (!gameData?.history || gameData.history.length === 0) {
      return []
    }

    return gameData.history
      .filter((entry: any) => entry.metrics?.allTimes && entry.metrics.allTimes.length > 0)
      .slice(-10) // Get last 10 sessions
      .map((entry: any, sessionIndex: number) => {
        const date = new Date(entry.date)
        return {
          name: `Session ${sessionIndex + 1}`,
          date: date.toLocaleDateString(),
          avgTime: entry.metrics.avgReactionTime,
          bestTime: entry.metrics.bestReactionTime,
        }
      })
  }

  // Generate round time data
  const generateRoundTimeData = () => {
    if (!gameData?.fastestRounds || gameData.fastestRounds.length === 0) {
      return []
    }

    return gameData.fastestRounds.map((round: any) => ({
      name: `Round ${round.round}`,
      time: round.time,
    }))
  }

  const reactionTimeData = generateReactionTimeData()
  const roundTimeData = generateRoundTimeData()

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
            No data available yet. Play Lightning Reflexes to track your reaction time!
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
        <CardDescription>Detailed performance metrics for Lightning Reflexes game</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Stats */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="text-2xl font-bold text-yellow-600">{gameData.bestScore || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Best Reaction Time</p>
              <p className="text-2xl font-bold text-yellow-600">{formatTime(gameData.bestReactionTime || 0)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Times Played</p>
              <p className="text-lg font-medium">{gameData.timesPlayed || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Reaction Time</p>
              <p className="text-lg font-medium">{formatTime(gameData.avgReactionTime || 0)}</p>
              {gameData.improvement && Number.parseFloat(gameData.improvement) > 0 && (
                <Badge variant="outline" className="mt-1 text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {gameData.improvement}% faster
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for different stats */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Total Rounds</span>
                </div>
                <p className="text-xl font-bold text-orange-600">{gameData.totalRoundsPlayed || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Consistency</span>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {gameData.history && gameData.history.length > 0
                    ? `${Math.round(gameData.history[gameData.history.length - 1]?.metrics?.consistency || 0)}ms`
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Performance Summary</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {gameData.bestReactionTime < 200
                  ? "Exceptional reaction time! You're in the top percentile of players."
                  : gameData.bestReactionTime < 300
                    ? "Great reaction time! You have above-average reflexes."
                    : gameData.bestReactionTime < 400
                      ? "Good reaction time. With practice, you can improve further."
                      : "Keep practicing to improve your reaction time."}
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Improvement Potential</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The average human reaction time is between 200-250ms. Your current best is {gameData.bestReactionTime}
                ms, which is {gameData.bestReactionTime < 250 ? "better than" : "approaching"} the average.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {reactionTimeData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reactionTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#8884d8"
                      name="Avg Time"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bestTime"
                      stroke="#82ca9d"
                      name="Best Time"
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
                  No history data available yet. Play more games to see your progress!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rounds" className="mt-4">
            {roundTimeData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roundTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="time" name="Reaction Time" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No round data available yet. Play more games to see your round-by-round performance!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
