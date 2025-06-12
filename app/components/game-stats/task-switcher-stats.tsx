"use client"

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
  ScatterChart,
  Scatter,
  Tooltip,
  Legend,
} from "recharts"
import { Brain, Clock, Target, TrendingUp, TrendingDown, Award, Activity, RotateCcw, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface TaskSwitcherStatsProps {
  gameData: any
}

export function TaskSwitcherStats({ gameData }: TaskSwitcherStatsProps) {
  if (!gameData || !gameData.history || gameData.history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Task Switcher Statistics
          </CardTitle>
          <CardDescription>Cognitive flexibility and task switching performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No Task Switcher data available yet.</p>
            <p className="text-sm text-gray-400 mt-2">Play the game to see detailed statistics!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process game data
  const sessions = gameData.history || []
  const totalSessions = sessions.length
  const bestLevel = Math.max(...sessions.map((s: any) => s.level || 0), 0)
  const bestScore = Math.max(...sessions.map((s: any) => s.score || 0), 0)
  const avgAccuracy =
    sessions.length > 0 ? sessions.reduce((sum: number, s: any) => sum + (s.accuracy || 0), 0) / sessions.length : 0
  const avgReactionTime =
    sessions.length > 0
      ? sessions.reduce((sum: number, s: any) => sum + (s.metrics?.avgReactionTime || 0), 0) / sessions.length
      : 0
  const totalTaskSwitches = sessions.reduce((sum: number, s: any) => sum + (s.metrics?.taskSwitches || 0), 0)
  const avgSwitchCost =
    sessions.length > 0
      ? sessions.reduce((sum: number, s: any) => sum + (s.metrics?.switchCost || 0), 0) / sessions.length
      : 0

  // Prepare chart data
  const sessionData = sessions.map((session: any, index: number) => ({
    session: index + 1,
    level: session.level || 0,
    score: session.score || 0,
    accuracy: session.accuracy || 0,
    reactionTime: session.metrics?.avgReactionTime || 0,
    switchCost: session.metrics?.switchCost || 0,
    taskSwitches: session.metrics?.taskSwitches || 0,
    cognitiveFlexibility: session.metrics?.cognitiveFlexibility || 0,
    date: session.date ? format(new Date(session.date), "MMM dd") : `Session ${index + 1}`,
  }))

  // Level distribution
  const levelDistribution = sessions.reduce((acc: any, session: any) => {
    const levelRange = Math.floor((session.level - 1) / 10) * 10 + 1
    const key = `${levelRange}-${levelRange + 9}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const levelDistributionData = Object.entries(levelDistribution).map(([range, count]) => ({
    range,
    count,
  }))

  // Performance trends
  const recentSessions = sessionData.slice(-10)
  const improvementTrend =
    recentSessions.length > 1
      ? recentSessions[recentSessions.length - 1].cognitiveFlexibility - recentSessions[0].cognitiveFlexibility
      : 0

  // Switch cost analysis
  const switchCostData = sessions
    .filter((s: any) => s.metrics?.switchCost !== undefined)
    .map((session: any, index: number) => ({
      session: index + 1,
      switchCost: session.metrics.switchCost,
      accuracy: session.accuracy || 0,
    }))

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Task Switcher Statistics
          </CardTitle>
          <CardDescription>Cognitive flexibility and task switching performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Best Level</span>
              </div>
              <p className="text-xl font-bold text-purple-600">{bestLevel}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Avg Accuracy</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{avgAccuracy.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Avg Time</span>
              </div>
              <p className="text-xl font-bold text-green-600">{Math.round(avgReactionTime)}ms</p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Total Switches</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{totalTaskSwitches}</p>
            </div>
          </div>

          {improvementTrend !== 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {improvementTrend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  Cognitive Flexibility {improvementTrend > 0 ? "Improved" : "Declined"} by{" "}
                  {Math.abs(improvementTrend).toFixed(1)} points in recent sessions
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="switching">Switching</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Progress</CardTitle>
              <CardDescription>Your performance across all sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="level" stroke="#8884d8" strokeWidth={2} name="Level Reached" />
                    <Line
                      type="monotone"
                      dataKey="cognitiveFlexibility"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Cognitive Flexibility"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Level Distribution</CardTitle>
              <CardDescription>Frequency of levels reached</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accuracy vs Reaction Time</CardTitle>
              <CardDescription>Speed-accuracy tradeoff analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="reactionTime" name="Reaction Time (ms)" />
                    <YAxis dataKey="accuracy" name="Accuracy (%)" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Sessions" data={sessionData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics Over Time</CardTitle>
              <CardDescription>Tracking accuracy and reaction time trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Accuracy (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="reactionTime"
                      stroke="#ff8042"
                      strokeWidth={2}
                      name="Reaction Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="switching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Switching Analysis</CardTitle>
              <CardDescription>Switch cost and cognitive flexibility metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Average Switch Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(avgSwitchCost)}ms</p>
                  <p className="text-sm text-gray-500">Time penalty for switching tasks</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Switch Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {avgSwitchCost > 0 ? Math.max(0, 100 - avgSwitchCost / 10).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-gray-500">Lower switch cost = higher efficiency</p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={switchCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="switchCost"
                      stroke="#ff8042"
                      strokeWidth={2}
                      name="Switch Cost (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Switches per Session</CardTitle>
              <CardDescription>Number of task switches over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="taskSwitches" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cognitive Flexibility Assessment</CardTitle>
              <CardDescription>Analysis of your task switching abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Strengths</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {avgAccuracy > 80 && <li>• High accuracy performance</li>}
                      {avgReactionTime < 800 && <li>• Fast reaction times</li>}
                      {avgSwitchCost < 200 && <li>• Low switch cost</li>}
                      {bestLevel > 50 && <li>• Advanced level progression</li>}
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Areas for Improvement</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {avgAccuracy < 70 && <li>• Focus on accuracy</li>}
                      {avgReactionTime > 1200 && <li>• Work on response speed</li>}
                      {avgSwitchCost > 300 && <li>• Reduce switch cost</li>}
                      {bestLevel < 25 && <li>• Practice more levels</li>}
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Cognitive Insights</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        Flexibility Score: <strong>{Math.round(avgAccuracy - avgSwitchCost / 10)}</strong>
                      </p>
                      <p>
                        Sessions Played: <strong>{totalSessions}</strong>
                      </p>
                      <p>
                        Best Performance: <strong>Level {bestLevel}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Summary</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {avgAccuracy > 85 && avgSwitchCost < 200
                      ? "Excellent cognitive flexibility! You demonstrate strong task switching abilities with minimal switch costs."
                      : avgAccuracy > 70 && avgSwitchCost < 300
                        ? "Good cognitive flexibility. Continue practicing to reduce switch costs and improve accuracy."
                        : "Keep practicing! Focus on maintaining accuracy while reducing the time penalty when switching between tasks."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
