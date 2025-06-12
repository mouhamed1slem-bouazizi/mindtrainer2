"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Brain, Target, Zap, Eye, Trophy, Star, Lightbulb, BookOpen, CheckCircle } from "lucide-react"
import { MemoryMatrixStats } from "./game-stats/memory-matrix-stats"
import { LightningReflexesStats } from "./game-stats/lightning-reflexes-stats"
import { FocusFilterStats } from "./game-stats/focus-filter-stats"
import { TaskSwitcherStats } from "./game-stats/task-switcher-stats"

interface ProgressDashboardProps {
  gameData: any
  userStats: any
  isLoading?: boolean
}

export function ProgressDashboard({ gameData, userStats, isLoading }: ProgressDashboardProps) {
  const [selectedGame, setSelectedGame] = useState("memory")

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const cognitiveGames = [
    {
      id: "memory",
      name: "Memory Matrix",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      domain: "Working Memory",
      description: "Spatial working memory and pattern recognition",
      stats: gameData.memory || {},
    },
    {
      id: "reaction",
      name: "Lightning Reflexes",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      domain: "Processing Speed",
      description: "Reaction time and cognitive flexibility",
      stats: gameData.reaction || {},
    },
    {
      id: "attention",
      name: "Focus Filter",
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      domain: "Attention",
      description: "Selective attention and inhibitory control",
      stats: gameData.attention || {},
    },
    {
      id: "taskSwitcher",
      name: "Task Switcher",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      domain: "Executive Function",
      description: "Cognitive flexibility and task switching",
      stats: gameData.taskSwitcher || {},
    },
  ]

  const domains = [
    {
      name: "Working Memory",
      games: ["Memory Matrix"],
      color: "purple",
      description: "Ability to hold and manipulate information in mind",
    },
    {
      name: "Processing Speed",
      games: ["Lightning Reflexes"],
      color: "yellow",
      description: "Speed of cognitive processing and reaction time",
    },
    {
      name: "Attention",
      games: ["Focus Filter"],
      color: "blue",
      description: "Ability to focus and filter distracting information",
    },
    {
      name: "Executive Function",
      games: ["Task Switcher"],
      color: "green",
      description: "Higher-order cognitive control and flexibility",
    },
  ]

  return (
    <div className="space-y-6 pb-20">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="games">Game Stats</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="details">Game Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-500">Total Score</span>
                </div>
                <div className="text-2xl font-bold">{userStats.totalScore}</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +164%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-500">Day Streak</span>
                </div>
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Game Distribution</CardTitle>
              <CardDescription>Your training focus across different games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pie Chart Representation */}
                <div className="relative w-48 h-48 mx-auto">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(
              #8b5cf6 0deg 180deg,
              #10b981 180deg 230deg,
              #f59e0b 230deg 280deg,
              #f97316 280deg 360deg
            )`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-full"></div>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>TaskSwitcher 50%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Reaction 14%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Memory 14%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Attention 22%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.avgReactionTime < 300 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">Speed Demon</div>
                        <div className="text-sm text-gray-500">
                          Reaction time under 300ms ({userStats.avgReactionTime}ms)
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-black text-white">New!</Badge>
                  </div>
                )}

                {gameData.memory?.bestLevel > 20 && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Memory Master</div>
                        <div className="text-sm text-gray-500">
                          Reached level {gameData.memory.bestLevel} in Memory Matrix
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                )}

                {gameData.attention?.accuracy > 95 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Focus Expert</div>
                        <div className="text-sm text-gray-500">
                          {Math.round(gameData.attention.accuracy)}% accuracy in Focus Filter
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                )}

                {(!userStats.avgReactionTime || userStats.avgReactionTime >= 300) &&
                  (!gameData.memory?.bestLevel || gameData.memory.bestLevel <= 20) &&
                  (!gameData.attention?.accuracy || gameData.attention.accuracy <= 95) && (
                    <div className="text-center text-gray-500 py-4">Complete more games to unlock achievements!</div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Training Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Training Summary</CardTitle>
              <CardDescription>Your overall progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Object.values(gameData).reduce((total, game: any) => total + (game?.timesPlayed || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5m</div>
                  <div className="text-sm text-gray-500">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-gray-500">Games Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Object.values(gameData).filter((game: any) => (game?.timesPlayed || 0) > 0).length}
                  </div>
                  <div className="text-sm text-gray-500">Games Tried</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Performance Trends
              </CardTitle>
              <CardDescription>Track your cognitive improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.totalScore}</div>
                  <div className="text-sm text-gray-500">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.avgReactionTime}ms</div>
                  <div className="text-sm text-gray-500">Avg Reaction Time</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {cognitiveGames.map((game) => (
                    <div key={game.id} className={`p-3 rounded-lg ${game.bgColor}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <game.icon className={`w-4 h-4 ${game.color}`} />
                        <span className="font-medium text-sm">{game.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Best: Level {game.stats.bestLevel || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.totalScore > 1000 && (
                  <div className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Cognitive Athlete</div>
                      <div className="text-sm text-gray-500">Scored over 1,000 points</div>
                    </div>
                  </div>
                )}
                {userStats.avgReactionTime < 500 && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Lightning Fast</div>
                      <div className="text-sm text-gray-500">Average reaction under 500ms</div>
                    </div>
                  </div>
                )}
                {(!userStats.totalScore || userStats.totalScore <= 1000) &&
                  (!userStats.avgReactionTime || userStats.avgReactionTime >= 500) && (
                    <div className="text-center text-gray-500 py-4">Play more games to unlock achievements!</div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Stats Tab */}
        <TabsContent value="games" className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {cognitiveGames.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedGame === game.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <game.icon className={`w-4 h-4 ${game.color}`} />
                  <span className="font-medium text-sm">{game.name}</span>
                </div>
                <div className="text-xs text-gray-500">{game.description}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {selectedGame === "memory" && <MemoryMatrixStats data={gameData.memory} />}
            {selectedGame === "reaction" && <LightningReflexesStats data={gameData.reaction} />}
            {selectedGame === "attention" && <FocusFilterStats data={gameData.attention} />}
            {selectedGame === "taskSwitcher" && <TaskSwitcherStats data={gameData.taskSwitcher} />}
          </div>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Domains</CardTitle>
              <CardDescription>Your performance across different cognitive abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{domain.name}</h3>
                      <Badge variant="secondary">
                        {domain.games.length} game{domain.games.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{domain.description}</p>
                    <div className="space-y-2">
                      {domain.games.map((gameName) => {
                        const game = cognitiveGames.find((g) => g.name === gameName)
                        return (
                          <div key={gameName} className="flex items-center justify-between text-sm">
                            <span>{gameName}</span>
                            <span className="text-gray-500">Level {game?.stats.bestLevel || 0}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Details Tab - Enhanced Section */}
        <TabsContent value="details" className="space-y-4">
          <div className="space-y-6">
            {/* Game Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Game Overview
                </CardTitle>
                <CardDescription>Comprehensive information about each cognitive training game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Memory Matrix Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold">Memory Matrix</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A spatial working memory game that challenges your ability to remember and reproduce sequences of
                      highlighted squares. This game specifically targets your visuospatial sketchpad and enhances
                      pattern recognition abilities.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>
                          <strong>Primary Skill:</strong> Spatial Working Memory
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span>
                          <strong>Brain Areas:</strong> Prefrontal Cortex, Parietal Lobe
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-bold">{gameData.memory?.bestLevel || 0}</p>
                          <p className="text-gray-500">Best Level</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.memory?.bestScore || 0}</p>
                          <p className="text-gray-500">Best Score</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.memory?.timesPlayed || 0}</p>
                          <p className="text-gray-500">Times Played</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lightning Reflexes Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold">Lightning Reflexes</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A comprehensive reaction time and cognitive flexibility training program with 100 progressive
                      levels. Tests simple reactions, multi-target processing, pattern recognition, sequence memory, and
                      complex decision-making.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>
                          <strong>Primary Skill:</strong> Processing Speed & Flexibility
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span>
                          <strong>Brain Areas:</strong> Motor Cortex, Cerebellum
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-bold">
                            {gameData.reaction?.bestReactionTime && gameData.reaction.bestReactionTime < 999
                              ? `${gameData.reaction.bestReactionTime}ms`
                              : "N/A"}
                          </p>
                          <p className="text-gray-500">Best Time</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.reaction?.bestScore || 0}</p>
                          <p className="text-gray-500">Best Score</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.reaction?.timesPlayed || 0}</p>
                          <p className="text-gray-500">Times Played</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Focus Filter Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">Focus Filter</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      An attention training game that improves selective attention and inhibitory control. Players must
                      identify target stimuli while ignoring distractors, enhancing focus and concentration abilities.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>
                          <strong>Primary Skill:</strong> Selective Attention
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span>
                          <strong>Brain Areas:</strong> Anterior Cingulate Cortex
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-bold">{Math.round(gameData.attention?.accuracy || 0)}%</p>
                          <p className="text-gray-500">Best Accuracy</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.attention?.bestScore || 0}</p>
                          <p className="text-gray-500">Best Score</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.attention?.timesPlayed || 0}</p>
                          <p className="text-gray-500">Times Played</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Switcher Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Task Switcher</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A cognitive flexibility training program that challenges your ability to rapidly switch between
                      different mental tasks and rules. Enhances executive control and mental adaptability.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-500" />
                        <span>
                          <strong>Primary Skill:</strong> Cognitive Flexibility
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span>
                          <strong>Brain Areas:</strong> Prefrontal Cortex, ACC
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-bold">{gameData.taskSwitcher?.bestLevel || 0}</p>
                          <p className="text-gray-500">Best Level</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.taskSwitcher?.bestScore || 0}</p>
                          <p className="text-gray-500">Best Score</p>
                        </div>
                        <div>
                          <p className="font-bold">{gameData.taskSwitcher?.timesPlayed || 0}</p>
                          <p className="text-gray-500">Times Played</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Performance Insights & Training Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Strengths */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Your Strengths
                    </h3>
                    <div className="space-y-2">
                      {userStats.totalScore > 5000 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>High overall performance across games</span>
                        </div>
                      )}
                      {userStats.avgReactionTime < 400 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>Excellent reaction speed</span>
                        </div>
                      )}
                      {gameData.memory?.bestLevel > 10 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span>Strong spatial memory abilities</span>
                        </div>
                      )}
                      {(!userStats.totalScore || userStats.totalScore <= 5000) &&
                        (!userStats.avgReactionTime || userStats.avgReactionTime >= 400) &&
                        (!gameData.memory?.bestLevel || gameData.memory.bestLevel <= 10) && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="w-4 h-4" />
                            <span>Play more games to discover your strengths!</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Training Tips */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Pro Tips
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-sm">Memory Strategy</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Visualize patterns as shapes or familiar objects to improve recall.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-sm">Speed Training</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Focus on accuracy first, then gradually increase your response speed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
