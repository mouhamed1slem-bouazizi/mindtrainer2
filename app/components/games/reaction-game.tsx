"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Zap } from "lucide-react"

interface ReactionGameProps {
  onComplete: (score: number, metrics: any) => void
  onBack: () => void
  gameData?: any
}

export function ReactionGame({ onComplete, onBack, gameData }: ReactionGameProps) {
  const [gameState, setGameState] = useState<"instructions" | "waiting" | "ready" | "clicked" | "complete">(
    "instructions",
  )
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [waitTime, setWaitTime] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const totalRounds = 5

  const startRound = () => {
    setGameState("waiting")
    const randomWait = Math.random() * 3000 + 1000 // 1-4 seconds
    setWaitTime(randomWait)

    timeoutRef.current = setTimeout(() => {
      setStartTime(Date.now())
      setGameState("ready")
    }, randomWait)
  }

  const handleClick = () => {
    if (gameState === "waiting") {
      // Too early!
      clearTimeout(timeoutRef.current)
      setGameState("instructions")
      return
    }

    if (gameState === "ready") {
      const reactionTime = Date.now() - startTime
      const newTimes = [...reactionTimes, reactionTime]
      setReactionTimes(newTimes)
      setGameState("clicked")

      setTimeout(() => {
        if (currentRound + 1 < totalRounds) {
          setCurrentRound(currentRound + 1)
          startRound()
        } else {
          // Game complete
          const avgTime = newTimes.reduce((a, b) => a + b, 0) / newTimes.length
          const bestTime = Math.min(...newTimes)
          const score = Math.max(0, 1000 - avgTime) // Higher score for faster reactions

          onComplete(Math.round(score), {
            avgReactionTime: avgTime,
            bestReactionTime: bestTime,
            allTimes: newTimes,
            consistency: Math.max(...newTimes) - Math.min(...newTimes),
            roundsCompleted: totalRounds,
            reactionTimes: newTimes,
            date: new Date().toISOString(),
            gameCompletionTime: Date.now() - startTime, // Total game time
            accuracyRate: 100, // Lightning reflexes has 100% accuracy since you can't click wrong
            levelReached: totalRounds,
          })
        }
      }, 1500)
    }
  }

  if (gameState === "instructions") {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Lightning Reflexes</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Goal:</strong> Test your reaction time by clicking as fast as possible when the screen turns
                green.
              </p>
              <p className="text-sm">
                <strong>Instructions:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Wait for the screen to turn green</li>
                <li>• Click immediately when it changes</li>
                <li>• Don't click too early or you'll restart</li>
                <li>• Complete 5 rounds for your average</li>
              </ul>
              <p className="text-sm">
                <strong>Scoring:</strong> Faster reactions = higher score
              </p>
            </div>

            {gameData?.bestScore && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium">Your Best Score: {gameData.bestScore}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Best Reaction: {gameData.bestReactionTime}ms</p>
              </div>
            )}

            <Button
              onClick={() => {
                setCurrentRound(0)
                setReactionTimes([])
                startRound()
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
        <h2 className="text-xl font-bold">Lightning Reflexes</h2>
      </div>

      {/* Round Counter */}
      <div className="text-center">
        <p className="text-lg font-medium">
          Round {currentRound + 1} of {totalRounds}
        </p>
        {reactionTimes.length > 0 && (
          <p className="text-sm text-gray-500">Last: {reactionTimes[reactionTimes.length - 1]}ms</p>
        )}
      </div>

      {/* Game Area */}
      <div
        className={`
          min-h-96 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center
          ${
            gameState === "waiting"
              ? "bg-red-500 border-red-600"
              : gameState === "ready"
                ? "bg-green-500 border-green-600"
                : gameState === "clicked"
                  ? "bg-blue-500 border-blue-600"
                  : "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          }
        `}
        onClick={handleClick}
      >
        <div className="text-center text-white">
          {gameState === "waiting" && (
            <div>
              <p className="text-2xl font-bold mb-2">Wait...</p>
              <p className="text-lg">Don't click yet!</p>
            </div>
          )}
          {gameState === "ready" && (
            <div>
              <p className="text-3xl font-bold mb-2">GO!</p>
              <p className="text-lg">Click now!</p>
            </div>
          )}
          {gameState === "clicked" && (
            <div>
              <p className="text-2xl font-bold mb-2">{reactionTimes[reactionTimes.length - 1]}ms</p>
              <p className="text-lg">Great reaction!</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {reactionTimes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
                </p>
                <p className="text-sm text-gray-500">Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.min(...reactionTimes)}ms</p>
                <p className="text-sm text-gray-500">Best</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neuroscience Insight */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Brain Training:</strong> This exercise improves your motor cortex response time and strengthens the
            neural pathways between visual processing and motor execution.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
