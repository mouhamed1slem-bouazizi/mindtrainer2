"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts"
import { Brain, Zap, Eye, RotateCcw, Target } from "lucide-react"

interface GameStatsTabProps {
  data: any
  loading: boolean
}

export function GameStatsTab({ data, loading }: GameStatsTabProps) {
  const [selectedGame, setSelectedGame] = useState("memory")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const { gameData, recentSessions } = data

  const games = [
    {
      id: "memory",
      name: "Memory Matrix",
      icon: Brain,
      color: "bg-purple-500",
      description: "Spatial working memory and pattern recognition",
      data: gameData?.memory || {},
      brainAreas: ["Prefrontal Cortex", "Hippocampus", "Parietal Cortex"],
    },
    {
      id: "attention",
      name: "Focus Filter",
      icon: Eye,
      color: "bg-blue-500",
      description: "Selective attention and cognitive control",
      data: gameData?.attention || {},
      brainAreas: ["Anterior Cingulate", "Frontal Cortex", "Parietal Cortex"],
    },
    {
      id: "reaction",
      name: "Lightning Reflexes",
      icon: Zap,
      color: "bg-yellow-500",
      description: "Processing speed and motor response",
      data: gameData?.reaction || {},
      brainAreas: ["Motor Cortex", "Cerebellum", "Brainstem"],
    },
    {
      id: "taskSwitcher",
      name: "Task Switcher",
      icon: RotateCcw,
      color: "bg-green-500",
      description: "Cognitive flexibility and executive function",
      data: gameData?.taskSwitcher || {},
      brainAreas: ["Prefrontal Cortex", "Anterior Cingulate", "Basal Ganglia"],
    },
  ]

  const selectedGameData = games.find((game) => game.id === selectedGame)
  const brainItchStats = calculateBrainItchStats(recentSessions, selectedGame)
  const cognitiveProfile = generateCognitiveProfile(gameData)

  return (
    <div className="space-y-6">
      {/* Game Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Game Statistics</h2>
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
                    <p className="text-sm text-muted-foreground">{game.data.timesPlayed || 0} sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Brain Itch Impact for Selected Game */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Brain Itch Impact - {selectedGameData?.name}
          </CardTitle>
          <CardDescription>
            How brain itch category sessions in {selectedGameData?.name} contribute to your cognitive improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Brain Improvement Score</span>
                  <span>{brainItchStats.improvementScore}%</span>
                </div>
                <Progress value={brainItchStats.improvementScore} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Brain Itch Sessions</p>
                  <p className="text-lg font-semibold">{brainItchStats.brainItchCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Improvement Rate</p>
                  <p className="text-lg font-semibold">{brainItchStats.improvementRate}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Cognitive Benefits</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enhanced neural pathway strengthening</li>
                <li>• Improved cognitive flexibility</li>
                <li>• Accelerated skill acquisition</li>
                <li>• Better problem-solving efficiency</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Brain Areas Activated</h4>
              <div className="flex flex-wrap gap-2">
                {selectedGameData?.brainAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Game Detailed Stats */}
      {selectedGameData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <selectedGameData.icon className="h-5 w-5" />
                <span>{selectedGameData.name} Performance</span>
              </CardTitle>
              <CardDescription>{selectedGameData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-2xl font-bold">{selectedGameData.data.bestScore || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Times Played</p>
                  <p className="text-2xl font-bold">{selectedGameData.data.timesPlayed || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">{selectedGameData.data.accuracy || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">{selectedGameData.data.averageTime || 0}ms</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Performance Level</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={calculatePerformanceLevel(selectedGameData.data)} className="flex-1" />
                  <Badge variant={getPerformanceBadge(selectedGameData.data)}>
                    {getPerformanceLabel(selectedGameData.data)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Recent performance in {selectedGameData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generateGameHistory(recentSessions, selectedGame)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="var(--color-score)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cognitive Profile Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Cognitive Profile Analysis
          </CardTitle>
          <CardDescription>Your cognitive strengths across different domains with brain itch impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartContainer
              config={{
                score: {
                  label: "Performance Score",
                  color: "hsl(var(--chart-1))",
                },
                brainItchBoost: {
                  label: "Brain Itch Boost",
                  color: "hsl(var(--chart-2))",
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
                    name="Base Performance"
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="var(--color-score)"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="With Brain Itch Boost"
                    dataKey="brainItchBoost"
                    stroke="var(--color-brainItchBoost)"
                    fill="var(--color-brainItchBoost)"
                    fillOpacity={0.1}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
              <h4 className="font-medium">Domain Analysis</h4>
              {cognitiveProfile.map((domain) => (
                <div key={domain.domain} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{domain.domain}</span>
                    <span>{domain.score}%</span>
                  </div>
                  <Progress value={domain.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Brain itch boost: +{domain.brainItchBoost - domain.score}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function calculateBrainItchStats(sessions: any[], gameId: string) {
  const gameSessions = sessions?.filter((s) => s.gameId === gameId) || []
  const brainItchSessions = gameSessions.filter((s) => s.category === "brain-itch")

  const brainItchCount = brainItchSessions.length
  const totalSessions = gameSessions.length

  const brainItchAvg = brainItchSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, brainItchCount)
  const regularAvg =
    gameSessions.filter((s) => s.category !== "brain-itch").reduce((sum, s) => sum + (s.score || 0), 0) /
    Math.max(1, totalSessions - brainItchCount)

  const improvementRate = regularAvg > 0 ? Math.round(((brainItchAvg - regularAvg) / regularAvg) * 100) : 0
  const improvementScore = Math.min(Math.max(improvementRate, 0), 100)

  return {
    brainItchCount,
    improvementScore,
    improvementRate: Math.max(improvementRate, 0),
  }
}

function calculatePerformanceLevel(gameData: any): number {
  const score = gameData.bestScore || 0
  const accuracy = gameData.accuracy || 0
  const timesPlayed = gameData.timesPlayed || 0

  return Math.min(score / 10 + accuracy + timesPlayed * 2, 100)
}

function getPerformanceBadge(gameData: any): "default" | "secondary" | "outline" {
  const level = calculatePerformanceLevel(gameData)
  if (level >= 80) return "default"
  if (level >= 60) return "secondary"
  return "outline"
}

function getPerformanceLabel(gameData: any): string {
  const level = calculatePerformanceLevel(gameData)
  if (level >= 80) return "Expert"
  if (level >= 60) return "Advanced"
  if (level >= 40) return "Intermediate"
  return "Beginner"
}

function generateGameHistory(sessions: any[], gameId: string) {
  const gameSessions = sessions?.filter((s) => s.gameId === gameId).slice(-10) || []

  return gameSessions.map((session, index) => ({
    session: `S${index + 1}`,
    score: session.score || 0,
    isBrainItch: session.category === "brain-itch",
  }))
}

function generateCognitiveProfile(gameData: any) {
  return [
    {
      domain: "Memory",
      score: Math.min((gameData?.memory?.bestScore || 0) / 10, 100),
      brainItchBoost: Math.min((gameData?.memory?.bestScore || 0) / 10 + 15, 100),
    },
    {
      domain: "Attention",
      score: gameData?.attention?.accuracy || 0,
      brainItchBoost: Math.min((gameData?.attention?.accuracy || 0) + 12, 100),
    },
    {
      domain: "Processing Speed",
      score: Math.max(100 - (gameData?.reaction?.avgReactionTime || 500) / 10, 0),
      brainItchBoost: Math.max(100 - (gameData?.reaction?.avgReactionTime || 500) / 10 + 18, 0),
    },
    {
      domain: "Flexibility",
      score: Math.min((gameData?.taskSwitcher?.bestScore || 0) / 8, 100),
      brainItchBoost: Math.min((gameData?.taskSwitcher?.bestScore || 0) / 8 + 20, 100),
    },
  ]
}
