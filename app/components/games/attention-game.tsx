"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye } from "lucide-react"

interface AttentionGameProps {
  onComplete: (score: number, metrics: any) => void
  onBack: () => void
  gameData?: any
}

export function AttentionGame({ onComplete, onBack, gameData }: AttentionGameProps) {
  const [gameState, setGameState] = useState<"instructions" | "playing" | "complete">("instructions")
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; isTarget: boolean }>>([])
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [correctClicks, setCorrectClicks] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)

  const maxRounds = 3
  const itemsPerRound = 8

  const generateTargets = () => {
    const newTargets = []
    for (let i = 0; i < itemsPerRound; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 70 + 15, // 15-85% of container height
        isTarget: Math.random() > 0.6, // 40% chance of being a target
      })
    }
    setTargets(newTargets)
  }

  const handleItemClick = (item: any) => {
    const newTotalClicks = totalClicks + 1
    setTotalClicks(newTotalClicks)

    if (item.isTarget) {
      const newCorrectClicks = correctClicks + 1
      setCorrectClicks(newCorrectClicks)
      setScore(score + 10)

      // Remove clicked target
      setTargets(targets.filter((t) => t.id !== item.id))

      // Check if all targets found
      const remainingTargets = targets.filter((t) => t.isTarget && t.id !== item.id)
      if (remainingTargets.length === 0) {
        if (round < maxRounds) {
          setRound(round + 1)
          setTimeout(() => generateTargets(), 1000)
        } else {
          // Game complete
          const accuracy = (newCorrectClicks / newTotalClicks) * 100
          onComplete(score + 10, {
            accuracy,
            correctClicks: newCorrectClicks,
            totalClicks: newTotalClicks,
            roundsCompleted: round,
          })
        }
      }
    } else {
      // Penalty for wrong click
      setScore(Math.max(0, score - 5))
    }
  }

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      // Time up
      const accuracy = totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0
      onComplete(score, {
        accuracy,
        correctClicks,
        totalClicks,
        roundsCompleted: round - 1,
      })
    }
  }, [gameState, timeLeft])

  if (gameState === "instructions") {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Focus Filter</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Goal:</strong> Find and click only the blue circles while ignoring red distractors.
              </p>
              <p className="text-sm">
                <strong>Instructions:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Click only the blue circles (targets)</li>
                <li>• Ignore the red circles (distractors)</li>
                <li>• Find all targets to advance to the next round</li>
                <li>• Complete 3 rounds within 30 seconds</li>
              </ul>
              <p className="text-sm">
                <strong>Scoring:</strong> +10 for correct clicks, -5 for wrong clicks
              </p>
            </div>

            {gameData?.bestScore && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium">Your Best Score: {gameData.bestScore}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Best Accuracy: {gameData.bestAccuracy}%</p>
              </div>
            )}

            <Button
              onClick={() => {
                setGameState("playing")
                generateTargets()
              }}
              className="w-full"
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold">Focus Filter</h2>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium">
            Round {round}/{maxRounds}
          </span>
          <span className="text-gray-500 ml-2">Score: {score}</span>
        </div>
        <div className="text-sm font-medium">Time: {timeLeft}s</div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-sm">
            Click the <span className="text-blue-500 font-bold">blue circles</span> only! Ignore the{" "}
            <span className="text-red-500 font-bold">red circles</span>.
          </p>
        </CardContent>
      </Card>

      {/* Game Area */}
      <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg h-96 border-2">
        {targets.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`
              absolute w-8 h-8 rounded-full transition-all duration-200 hover:scale-110
              ${item.isTarget ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"}
            `}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">{correctClicks}</p>
          <p className="text-xs text-gray-500">Correct</p>
        </div>
        <div>
          <p className="text-lg font-bold">{totalClicks - correctClicks}</p>
          <p className="text-xs text-gray-500">Missed</p>
        </div>
        <div>
          <p className="text-lg font-bold">{totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0}%</p>
          <p className="text-xs text-gray-500">Accuracy</p>
        </div>
      </div>

      {/* Neuroscience Insight */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Brain Training:</strong> This selective attention task strengthens your anterior cingulate cortex
            and improves your ability to filter relevant information from distractions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
