"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, Eye, Zap, Target, Puzzle, Calculator, MessageSquare, Map, Heart } from "lucide-react"
import { MemoryGame } from "./games/memory-game"
import { ReactionGame } from "./games/reaction-game"
import { AttentionGame } from "./games/attention-game"

const cognitiveGames = [
  {
    id: "memory",
    title: "Memory Matrix",
    description: "Remember and recall sequences of patterns",
    domain: "Memory",
    icon: Brain,
    color: "bg-purple-500",
    difficulty: "Medium",
    duration: "2-3 min",
    component: MemoryGame,
  },
  {
    id: "reaction",
    title: "Lightning Reflexes",
    description: "Test your reaction time and speed",
    domain: "Processing Speed",
    icon: Zap,
    color: "bg-yellow-500",
    difficulty: "Easy",
    duration: "1-2 min",
    component: ReactionGame,
  },
  {
    id: "attention",
    title: "Focus Filter",
    description: "Filter relevant information from distractions",
    domain: "Attention",
    icon: Eye,
    color: "bg-blue-500",
    difficulty: "Hard",
    duration: "3-4 min",
    component: AttentionGame,
  },
  {
    id: "executive",
    title: "Task Switcher",
    description: "Manage multiple tasks and priorities",
    domain: "Executive Control",
    icon: Target,
    color: "bg-green-500",
    difficulty: "Hard",
    duration: "4-5 min",
  },
  {
    id: "problem",
    title: "Logic Puzzles",
    description: "Solve complex reasoning challenges",
    domain: "Problem-Solving",
    icon: Puzzle,
    color: "bg-indigo-500",
    difficulty: "Medium",
    duration: "3-4 min",
  },
  {
    id: "numerical",
    title: "Number Crunch",
    description: "Quick mathematical calculations",
    domain: "Numerical Skills",
    icon: Calculator,
    color: "bg-red-500",
    difficulty: "Easy",
    duration: "2-3 min",
  },
  {
    id: "language",
    title: "Word Flow",
    description: "Language processing and vocabulary",
    domain: "Language",
    icon: MessageSquare,
    color: "bg-pink-500",
    difficulty: "Medium",
    duration: "3-4 min",
  },
  {
    id: "spatial",
    title: "Space Navigator",
    description: "Spatial reasoning and visualization",
    domain: "Spatial Reasoning",
    icon: Map,
    color: "bg-teal-500",
    difficulty: "Hard",
    duration: "4-5 min",
  },
  {
    id: "stress",
    title: "Calm Control",
    description: "Stress regulation and mindfulness",
    domain: "Stress Regulation",
    icon: Heart,
    color: "bg-orange-500",
    difficulty: "Easy",
    duration: "5-6 min",
  },
]

interface GameLibraryProps {
  gameData: any
  onGameComplete: (gameId: string, score: number, metrics: any) => void
  onBack: () => void
}

export function GameLibrary({ gameData, onGameComplete, onBack }: GameLibraryProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameFilter, setGameFilter] = useState<string>("all")

  const selectedGameData = cognitiveGames.find((game) => game.id === selectedGame)

  if (selectedGame && selectedGameData?.component) {
    const GameComponent = selectedGameData.component
    return (
      <GameComponent
        onComplete={(score: number, metrics: any) => {
          onGameComplete(selectedGame, score, metrics)
          setSelectedGame(null)
        }}
        onBack={() => setSelectedGame(null)}
        gameData={gameData[selectedGame]}
      />
    )
  }

  const filteredGames =
    gameFilter === "all"
      ? cognitiveGames
      : cognitiveGames.filter((game) => game.domain.toLowerCase().includes(gameFilter))

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold">Game Library</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={gameFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setGameFilter("all")}>
          All Games
        </Button>
        <Button
          variant={gameFilter === "memory" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("memory")}
        >
          Memory
        </Button>
        <Button
          variant={gameFilter === "attention" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("attention")}
        >
          Focus
        </Button>
        <Button
          variant={gameFilter === "processing speed" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("processing speed")}
        >
          Speed
        </Button>
        <Button
          variant={gameFilter === "executive control" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("executive control")}
        >
          Executive
        </Button>
        <Button
          variant={gameFilter === "problem-solving" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("problem-solving")}
        >
          Problem Solving
        </Button>
        <Button
          variant={gameFilter === "spatial reasoning" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("spatial reasoning")}
        >
          Spatial
        </Button>
        <Button
          variant={gameFilter === "language" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("language")}
        >
          Language
        </Button>
        <Button
          variant={gameFilter === "numerical skills" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("numerical skills")}
        >
          Numerical
        </Button>
        <Button
          variant={gameFilter === "stress regulation" ? "default" : "outline"}
          size="sm"
          onClick={() => setGameFilter("stress regulation")}
        >
          Stress
        </Button>
      </div>

      {/* Games Grid */}
      <div className="space-y-3">
        {filteredGames.map((game) => {
          const Icon = game.icon
          const userGameData = gameData[game.id]
          const bestScore = userGameData?.bestScore || 0
          const timesPlayed = userGameData?.timesPlayed || 0

          return (
            <Card key={game.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{game.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {game.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{game.duration}</span>
                        <span>{game.domain}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {bestScore > 0 && <Badge variant="outline">Best: {bestScore}</Badge>}
                        {timesPlayed > 0 && <span className="text-gray-500">{timesPlayed}x played</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3" onClick={() => setSelectedGame(game.id)}>
                  {timesPlayed > 0 ? "Play Again" : "Start Game"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
