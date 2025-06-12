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
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [roundStartTime, setRoundStartTime] = useState<number>(0)
  const [roundTimes, setRoundTimes] = useState<
    Array<{ round: number; time: number; targets: number; accuracy: number }>
  >([])
  const [sessionMetrics, setSessionMetrics] = useState({
    totalTargetsFound: 0,
    totalDistractorsClicked: 0,
    averageTimePerTarget: 0,
    fastestRound: { round: 0, time: 0 },
    slowestRound: { round: 0, time: 0 },
  })

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
    setRoundStartTime(Date.now())
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
        // Round completed
        const roundTime = Date.now() - roundStartTime
        const targetsInRound = targets.filter((t) => t.isTarget).length
        const roundAccuracy =
          targetsInRound > 0 ? (targetsInRound / (newTotalClicks - totalClicks + targetsInRound)) * 100 : 0

        const newRoundData = {
          round: round,
          time: roundTime,
          targets: targetsInRound,
          accuracy: roundAccuracy,
        }

        setRoundTimes((prev) => [...prev, newRoundData])

        if (round < maxRounds) {
          setRound(round + 1)
          setTimeout(() => generateTargets(), 1000)
        } else {
          // Game complete
          completeGame(newCorrectClicks, newTotalClicks, [...roundTimes, newRoundData])
        }
      }
    } else {
      // Penalty for wrong click
      setScore(Math.max(0, score - 5))
    }
  }

  const completeGame = (finalCorrectClicks: number, finalTotalClicks: number, finalRoundTimes: any[]) => {
    const totalGameTime = Date.now() - gameStartTime
    const accuracy = finalTotalClicks > 0 ? (finalCorrectClicks / finalTotalClicks) * 100 : 0

    // Calculate session metrics
    const totalTargets = finalRoundTimes.reduce((sum, round) => sum + round.targets, 0)
    const totalDistractors = finalTotalClicks - finalCorrectClicks
    const averageTimePerTarget = totalTargets > 0 ? totalGameTime / totalTargets : 0

    const fastestRound = finalRoundTimes.reduce(
      (fastest, current) => (!fastest.time || current.time < fastest.time ? current : fastest),
      { round: 0, time: 0 },
    )

    const slowestRound = finalRoundTimes.reduce(
      (slowest, current) => (current.time > slowest.time ? current : slowest),
      { round: 0, time: 0 },
    )

    const metrics = {
      accuracy,
      correctClicks: finalCorrectClicks,
      totalClicks: finalTotalClicks,
      roundsCompleted: round,
      totalSessionTime: totalGameTime,
      roundTimes: finalRoundTimes,
      averageTimePerRound: finalRoundTimes.length > 0 ? totalGameTime / finalRoundTimes.length : 0,
      averageTimePerTarget,
      fastestRound,
      slowestRound,
      totalTargetsFound: totalTargets,
      totalDistractorsClicked: totalDistractors,
      consistencyScore: calculateConsistencyScore(finalRoundTimes),
      focusEfficiency: calculateFocusEfficiency(finalCorrectClicks, finalTotalClicks, totalGameTime),
    }

    onComplete(score + 10, metrics)
  }

  const calculateConsistencyScore = (rounds: any[]) => {
    if (rounds.length < 2) return 100

    const times = rounds.map((r) => r.time)
    const average = times.reduce((sum, time) => sum + time, 0) / times.length
    const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length
    const standardDeviation = Math.sqrt(variance)

    // Lower standard deviation = higher consistency (scale 0-100)
    return Math.max(0, 100 - (standardDeviation / average) * 100)
  }

  const calculateFocusEfficiency = (correct: number, total: number, time: number) => {
    if (total === 0 || time === 0) return 0

    const accuracy = correct / total
    const speed = 1000 / (time / correct) // targets per second * 1000

    // Combine accuracy and speed for efficiency score
    return Math.min(100, (accuracy * 0.7 + speed * 0.3) * 100)
  }

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      // Time up
      const accuracy = totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0
      completeGame(correctClicks, totalClicks, roundTimes)
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
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Best Accuracy: {Math.round(gameData.accuracy || 0)}%
                </p>
                {gameData.fastestRound && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Fastest Round: {(gameData.fastestRound.time / 1000).toFixed(2)}s (Round{" "}
                    {gameData.fastestRound.round})
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                setGameState("playing")
                setGameStartTime(Date.now())
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
