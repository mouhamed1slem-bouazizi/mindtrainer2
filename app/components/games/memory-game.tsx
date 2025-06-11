"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain } from "lucide-react"

interface MemoryGameProps {
  onComplete: (score: number, metrics: any) => void
  onBack: () => void
  gameData?: any
}

export function MemoryGame({ onComplete, onBack, gameData }: MemoryGameProps) {
  const [gameState, setGameState] = useState<"instructions" | "showing" | "input" | "result">("instructions")
  const [sequence, setSequence] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [showTime, setShowTime] = useState(3000)
  const [startTime, setStartTime] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])

  const gridSize = 4
  const maxLevel = 10

  const generateSequence = (length: number) => {
    const newSequence = []
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * (gridSize * gridSize)))
    }
    return newSequence
  }

  const startLevel = () => {
    const newSequence = generateSequence(currentLevel + 2)
    setSequence(newSequence)
    setUserInput([])
    setGameState("showing")

    setTimeout(() => {
      setGameState("input")
      setStartTime(Date.now())
    }, showTime)
  }

  const handleCellClick = (index: number) => {
    if (gameState !== "input") return

    const newInput = [...userInput, index]
    setUserInput(newInput)

    const reactionTime = Date.now() - startTime
    setReactionTimes([...reactionTimes, reactionTime])

    // Check if sequence is complete
    if (newInput.length === sequence.length) {
      const correct = newInput.every((val, idx) => val === sequence[idx])

      if (correct) {
        setScore(score + currentLevel * 10)
        if (currentLevel < maxLevel) {
          setCurrentLevel(currentLevel + 1)
          setTimeout(() => startLevel(), 1000)
        } else {
          // Game complete
          const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
          onComplete(score + currentLevel * 10, {
            level: currentLevel,
            avgReactionTime,
            accuracy: 100,
            totalTime: Date.now() - startTime,
          })
        }
      } else {
        // Game over
        const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        onComplete(score, {
          level: currentLevel,
          avgReactionTime,
          accuracy: (newInput.filter((val, idx) => val === sequence[idx]).length / sequence.length) * 100,
          totalTime: Date.now() - startTime,
        })
      }
    }
  }

  if (gameState === "instructions") {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Memory Matrix</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Goal:</strong> Remember and recreate the sequence of highlighted squares.
              </p>
              <p className="text-sm">
                <strong>Instructions:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Watch the sequence of squares that light up</li>
                <li>• After the sequence ends, tap the squares in the same order</li>
                <li>• Each level adds more squares to remember</li>
                <li>• Get the sequence wrong and the game ends</li>
              </ul>
              <p className="text-sm">
                <strong>Scoring:</strong> 10 points × level number for each correct sequence
              </p>
            </div>

            {gameData?.bestScore && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium">Your Best Score: {gameData.bestScore}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Times Played: {gameData.timesPlayed}</p>
              </div>
            )}

            <Button
              onClick={() => {
                setGameState("showing")
                startLevel()
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
        <h2 className="text-xl font-bold">Memory Matrix</h2>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium">Level {currentLevel}</span>
          <span className="text-gray-500 ml-2">Score: {score}</span>
        </div>
        <Progress value={(currentLevel / maxLevel) * 100} className="w-24 h-2" />
      </div>

      {/* Game Status */}
      <Card>
        <CardContent className="p-4 text-center">
          {gameState === "showing" && <p className="text-lg font-medium">Watch the sequence...</p>}
          {gameState === "input" && (
            <p className="text-lg font-medium">
              Tap the squares in order ({userInput.length}/{sequence.length})
            </p>
          )}
        </CardContent>
      </Card>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const isHighlighted = gameState === "showing" && sequence.includes(index)
          const isUserSelected = userInput.includes(index)

          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`
                aspect-square rounded-lg border-2 transition-all duration-200
                ${
                  isHighlighted
                    ? "bg-blue-500 border-blue-600 shadow-lg"
                    : isUserSelected
                      ? "bg-green-200 border-green-400 dark:bg-green-800 dark:border-green-600"
                      : "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                }
                ${gameState === "input" ? "cursor-pointer" : "cursor-default"}
              `}
              disabled={gameState !== "input"}
            />
          )
        })}
      </div>

      {/* Neuroscience Insight */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Brain Training:</strong> This exercise strengthens your working memory and visual-spatial
            processing, primarily engaging the prefrontal cortex and parietal lobe.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
