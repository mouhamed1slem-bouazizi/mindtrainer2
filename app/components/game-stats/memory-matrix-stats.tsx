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
} from "recharts"
import { Brain, Clock, Target, Award, TrendingUp } from "lucide-react"

interface MemoryMatrixStatsProps {
  gameData: any
}

export function MemoryMatrixStats({ gameData }: MemoryMatrixStatsProps) {
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
              {`${entry.name}: ${entry.value}${entry.name.includes("Time") ? "ms" : ""}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Generate level time data
  const generateLevelTimeData = () => {
    if (!gameData?.levelTimes || gameData.levelTimes.length === 0) {
      return []
    }

    // Group by level and find fastest time for each level
    const levelMap = new Map()
    gameData.levelTimes.forEach((lt: any) => {
      if (!levelMap.has(lt.level) || lt.time < levelMap.get(lt.level).time) {
        levelMap.set(lt.level, lt)
      }
    })

    // Convert to array and sort by level
    return Array.from(levelMap.values())
      .sort((a, b) => a.level - b.level)
      .map((lt: any) => ({
        name: `Level ${lt.level}`,
        time: lt.time,
      }))
  }

  // Generate level progress data
  const generateLevelProgressData = () => {
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
          level: entry.level || 0,
          score: entry.score || 0,
        }
      })
  }

  const levelTimeData = generateLevelTimeData()
  const levelProgressData = generateLevelProgressData()

  // If no data, show placeholder
  if (!gameData || gameData.timesPlayed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Memory Matrix Statistics
          </CardTitle>
          <CardDescription>Play Memory Matrix to see your statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Brain className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            No data available yet. Play Memory Matrix to track your memory skills!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Memory Matrix Statistics
        </CardTitle>
        <CardDescription>Detailed performance metrics for Memory Matrix game</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Stats */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="text-2xl font-bold text-purple-600">{gameData.bestScore || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Highest Level</p>
              <p className="text-2xl font-bold text-purple-600">{gameData.bestLevel || 0}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Times Played</p>
              <p className="text-lg font-medium">{gameData.timesPlayed || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fastest Level</p>
              <p className="text-lg font-medium">
                {gameData.fastestLevel
                  ? `${formatTime(gameData.fastestLevel.time)} (Level ${gameData.fastestLevel.level})`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for different stats */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="levels">Levels</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Avg Time Per Level</span>
                </div>
                <p className="text-xl font-bold text-blue-600">{formatTime(gameData.averageTimePerLevel || 0)}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Total Time Played</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {gameData.totalTimePlayed ? `${Math.round(gameData.totalTimePlayed / 60000)}m` : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Memory Performance</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {gameData.bestLevel >= 20
                  ? "Exceptional memory capacity! You're in the top percentile of players."
                  : gameData.bestLevel >= 15
                    ? "Great memory skills! You have above-average visual memory."
                    : gameData.bestLevel >= 10
                      ? "Good memory capacity. With practice, you can improve further."
                      : "Keep practicing to improve your visual memory skills."}
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Memory Capacity</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The average person can remember 5-9 items in sequence. You've reached level {gameData.bestLevel || 0},
                which demonstrates {gameData.bestLevel >= 9 ? "above average" : "developing"} memory capacity.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="levels" className="mt-4">
            {levelTimeData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="time" name="Completion Time" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No level time data available yet. Play more games to see your level completion times!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            {levelProgressData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={levelProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="level"
                      stroke="#8884d8"
                      name="Level Reached"
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
