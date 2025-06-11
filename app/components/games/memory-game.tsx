"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain, Heart, CheckCircle, Clock } from "lucide-react"

interface GameSpecificData {
  bestScore?: number
  bestLevel?: number
  timesPlayed?: number
  levelTimes?: Array<{ level: number; time: number; date: string }>
  averageTimePerLevel?: number
  fastestLevel?: { level: number; time: number }
}

interface MemoryGameProps {
  onComplete: (score: number, metrics: any) => void
  onBack: () => void
  gameData?: GameSpecificData
}

type GameState =
  | "instructions"
  | "showing_animation"
  | "input"
  | "mistake"
  | "result"
  | "advancing"
  | "level_complete_feedback"

export function MemoryGame({ onComplete, onBack, gameData }: MemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>("instructions")
  const [lives, setLives] = useState(3)
  const [gameOverReason, setGameOverReason] = useState<"lives" | "completed">("lives")
  const [mistakeDetails, setMistakeDetails] = useState<{ userInput: number[]; correctSequence: number[] } | null>(null)
  const [sequence, setSequence] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [currentSequenceDisplayIndex, setCurrentSequenceDisplayIndex] = useState(0)
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null)
  const [gameCompleted, setGameCompleted] = useState(false)

  // Timing tracking
  const [levelStartTime, setLevelStartTime] = useState(0)
  const [currentLevelTime, setCurrentLevelTime] = useState(0)
  const [levelTimes, setLevelTimes] = useState<Array<{ level: number; time: number; date: string }>>([])
  const [sessionStartTime, setSessionStartTime] = useState(0)

  const [startTime, setStartTime] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])

  const gridSize = 4
  const maxLevel = 200

  // Timer effect for current level
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (levelStartTime > 0 && (gameState === "showing_animation" || gameState === "input")) {
      interval = setInterval(() => {
        setCurrentLevelTime(Date.now() - levelStartTime)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [levelStartTime, gameState])

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 10)
    return `${seconds}.${ms.toString().padStart(2, "0")}s`
  }

  const handlePlayAgain = useCallback(() => {
    setCurrentLevel(1)
    setScore(0)
    setLives(3)
    setGameCompleted(false)
    setLevelTimes([])
    setSessionStartTime(Date.now())
    startLevel()
  }, [])

  const getSequenceLength = useCallback((level: number) => {
    return 3 + Math.floor(level / 8)
  }, [])

  const getShowTimePerSquare = useCallback((level: number) => {
    return Math.max(150, 600 - level * 2)
  }, [])

  const generateSequence = useCallback(
    (length: number) => {
      const newSequence = []
      for (let i = 0; i < length; i++) {
        newSequence.push(Math.floor(Math.random() * (gridSize * gridSize)))
      }
      return newSequence
    },
    [gridSize],
  )

  const startLevel = useCallback(() => {
    const sequenceLength = getSequenceLength(currentLevel)
    const newSequence = generateSequence(sequenceLength)
    setSequence(newSequence)
    setUserInput([])
    setCurrentSequenceDisplayIndex(0)
    setHighlightedCell(null)
    setLevelStartTime(Date.now())
    setCurrentLevelTime(0)
    setGameState("showing_animation")
  }, [currentLevel, generateSequence, getSequenceLength])

  useEffect(() => {
    if (gameState === "showing_animation" && sequence.length > 0) {
      if (currentSequenceDisplayIndex < sequence.length) {
        const showTime = getShowTimePerSquare(currentLevel)
        setHighlightedCell(sequence[currentSequenceDisplayIndex])

        const timer = setTimeout(() => {
          setHighlightedCell(null)
          setCurrentSequenceDisplayIndex((prev) => prev + 1)
        }, showTime)
        return () => clearTimeout(timer)
      } else {
        setGameState("input")
        setStartTime(Date.now())
        setReactionTimes([])
      }
    }
  }, [gameState, sequence, currentSequenceDisplayIndex, currentLevel, getShowTimePerSquare])

  const handleCellClick = (index: number) => {
    if (gameState !== "input") return

    const currentAttemptPosition = userInput.length
    const isClickCorrect = sequence[currentAttemptPosition] === index

    if (startTime > 0) {
      const reactionTime = Date.now() - startTime
      setReactionTimes((prev) => [...prev, reactionTime])
    }

    if (!isClickCorrect) {
      setLives((prev) => prev - 1)
      const fullIncorrectInput = [...userInput, index]
      setMistakeDetails({ userInput: fullIncorrectInput, correctSequence: sequence })
      setGameState("mistake")
      return
    }

    const updatedUserInput = [...userInput, index]
    setUserInput(updatedUserInput)

    if (updatedUserInput.length === sequence.length) {
      // Level completed successfully - record the time
      const levelCompletionTime = Date.now() - levelStartTime
      const newLevelTime = {
        level: currentLevel,
        time: levelCompletionTime,
        date: new Date().toISOString(),
      }
      setLevelTimes((prev) => [...prev, newLevelTime])

      const newCurrentScore = score + currentLevel * 10
      setScore(newCurrentScore)

      if (currentLevel < maxLevel) {
        setGameState("level_complete_feedback")
      } else {
        setGameOverReason("completed")
        setGameState("result")
        setGameCompleted(true)
      }
    }
  }

  // Handle the mistake state
  useEffect(() => {
    if (gameState === "mistake") {
      const timer = setTimeout(() => {
        if (lives > 0) {
          // Record time even for failed attempts
          const levelCompletionTime = Date.now() - levelStartTime
          const newLevelTime = {
            level: currentLevel,
            time: levelCompletionTime,
            date: new Date().toISOString(),
          }
          setLevelTimes((prev) => [...prev, newLevelTime])

          setCurrentLevel((prev) => prev + 1)
          setGameState("advancing")
        } else {
          // Record final level time
          const levelCompletionTime = Date.now() - levelStartTime
          const newLevelTime = {
            level: currentLevel,
            time: levelCompletionTime,
            date: new Date().toISOString(),
          }
          setLevelTimes((prev) => [...prev, newLevelTime])

          setGameOverReason("lives")
          setGameState("result")
          setGameCompleted(true)
        }
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [gameState, lives, levelStartTime, currentLevel])

  // Handle the advancing state
  useEffect(() => {
    if (gameState === "advancing") {
      startLevel()
    }
  }, [gameState, startLevel])

  // Handle the level complete feedback state
  useEffect(() => {
    if (gameState === "level_complete_feedback") {
      const timer = setTimeout(() => {
        setCurrentLevel((prev) => prev + 1)
        setGameState("advancing")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [gameState])

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
                <strong>Goal:</strong> Remember and recreate the sequence of highlighted squares as quickly as possible.
              </p>
              <p className="text-sm">
                <strong>Instructions:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Watch the sequence of squares that light up one by one.</li>
                <li>• After the sequence ends, tap the squares in the same order.</li>
                <li>• You have 3 lives. Making a mistake costs one life but lets you advance to the next level.</li>
                <li>• Your completion time for each level will be tracked and recorded.</li>
                <li>• The game ends when you run out of lives or complete all levels.</li>
              </ul>
              <p className="text-sm">
                <strong>Scoring:</strong> 10 points × level number for each correct sequence.
              </p>
            </div>
            {gameData?.bestScore !== undefined && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium">Your Best Score: {gameData.bestScore}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Highest Level: {gameData.bestLevel || 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Times Played: {gameData.timesPlayed || 0}</p>
                {gameData.fastestLevel && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Fastest Level: {formatTime(gameData.fastestLevel.time)} (Level {gameData.fastestLevel.level})
                  </p>
                )}
              </div>
            )}
            <Button
              onClick={() => {
                setCurrentLevel(1)
                setScore(0)
                setLives(3)
                setLevelTimes([])
                setSessionStartTime(Date.now())
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

  if (gameState === "result") {
    const totalSessionTime = levelTimes.reduce((sum, lt) => sum + lt.time, 0)
    const averageTimePerLevel = levelTimes.length > 0 ? totalSessionTime / levelTimes.length : 0
    const fastestLevelInSession =
      levelTimes.length > 0
        ? levelTimes.reduce((fastest, current) => (current.time < fastest.time ? current : fastest))
        : null

    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onComplete(score, {
                level: currentLevel,
                accuracy: 100,
                levelTimes: levelTimes,
                totalSessionTime: totalSessionTime,
                averageTimePerLevel: averageTimePerLevel,
                fastestLevel: fastestLevelInSession,
              })
              onBack()
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Game Over</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {gameOverReason === "lives" ? "You ran out of lives!" : "All Levels Complete!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Summary */}
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Final Score</p>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xl font-bold">{currentLevel}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Level Reached</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xl font-bold">{gameOverReason === "lives" ? 0 : lives}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Lives Remaining</p>
              </div>
            </div>

            {/* Timing Stats */}
            {levelTimes.length > 0 && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xl font-bold">{formatTime(totalSessionTime)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Time</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xl font-bold">{formatTime(averageTimePerLevel)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg per Level</p>
                </div>
              </div>
            )}

            {/* Fastest Level */}
            {fastestLevelInSession && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-sm font-medium">Fastest Level: {fastestLevelInSession.level}</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatTime(fastestLevelInSession.time)}
                </p>
              </div>
            )}

            {/* Best Score Comparison */}
            {gameData && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-center">
                <p className="text-sm font-medium">Your Best Score: {gameData.bestScore || 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Best Level: {gameData.bestLevel || 0}</p>
                {score > (gameData.bestScore || 0) && (
                  <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">🎉 New High Score!</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => {
                  handlePlayAgain()
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Play Again
              </Button>
              <Button
                onClick={() => {
                  onComplete(score, {
                    level: currentLevel,
                    accuracy: 100,
                    levelTimes: levelTimes,
                    totalSessionTime: totalSessionTime,
                    averageTimePerLevel: averageTimePerLevel,
                    fastestLevel: fastestLevelInSession,
                  })
                  onBack()
                }}
                variant="outline"
                className="w-full"
              >
                Back to Game Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "level_complete_feedback") {
    const levelTime = currentLevelTime
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50 p-4">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <p className="text-2xl font-bold text-green-500">Level Complete!</p>
        <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mt-2">{formatTime(levelTime)}</p>
        <p className="text-sm text-muted-foreground mt-1">Get ready for Level {currentLevel + 1}...</p>
      </div>
    )
  }

  if (gameState === "mistake" && mistakeDetails) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Sequence Mismatch</h2>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-medium text-red-500">Oops! That's not right.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lives > 0
                ? `You have ${lives} ${lives === 1 ? "life" : "lives"} left. Advancing to next level...`
                : "No lives left. Game will end."}
            </p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
              Level Time: {formatTime(currentLevelTime)}
            </p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const isCorrectSq = mistakeDetails.correctSequence.includes(i)
            const userClickedIdx = mistakeDetails.userInput.indexOf(i)
            const isUserCorrectTap = userClickedIdx !== -1 && mistakeDetails.correctSequence[userClickedIdx] === i
            const isUserIncorrectTap = userClickedIdx !== -1 && !isUserCorrectTap

            let cellClass = "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
            if (isCorrectSq && !isUserCorrectTap && !isUserIncorrectTap)
              cellClass = "bg-blue-200 border-blue-400 dark:bg-blue-900 dark:border-blue-700 opacity-50"
            if (isUserCorrectTap) cellClass = "bg-green-300 border-green-500 dark:bg-green-800 dark:border-green-600"
            if (isUserIncorrectTap)
              cellClass = "bg-red-300 border-red-500 dark:bg-red-800 dark:border-red-600 animate-pulse"

            return (
              <div
                key={i}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center ${cellClass}`}
              >
                {isCorrectSq && (
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-200">
                    {mistakeDetails.correctSequence.indexOf(i) + 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-200 border-2 border-blue-400 opacity-50"></div> Correct
              Sequence Path
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-300 border-2 border-green-500"></div> Your Correct Taps
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-300 border-2 border-red-500"></div> Your Incorrect Tap
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={gameState === "showing_animation" || gameState === "level_complete_feedback"}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold">Memory Matrix</h2>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm flex items-center gap-4">
          <span className="font-medium">Level {currentLevel}</span>
          <span className="text-gray-500 dark:text-gray-400">Score: {score}</span>
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? "text-red-500 fill-red-500" : "text-gray-300 dark:text-gray-600"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{formatTime(currentLevelTime)}</span>
        </div>
      </div>
      <Progress value={(currentLevel / maxLevel) * 100} className="w-full h-2" />
      <Card>
        <CardContent className="p-4 text-center min-h-[60px] flex items-center justify-center">
          {gameState === "showing_animation" && <p className="text-lg font-medium">Watch carefully...</p>}
          {gameState === "input" && (
            <p className="text-lg font-medium">
              Your turn! ({userInput.length}/{sequence.length})
            </p>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const isCurrentlyHighlighted = gameState === "showing_animation" && highlightedCell === index
          const isUserSelected = userInput.includes(index)
          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`aspect-square rounded-lg border-2 transition-all duration-100 ${isCurrentlyHighlighted ? "bg-blue-500 border-blue-600 shadow-lg scale-105" : isUserSelected && gameState === "input" ? "bg-green-300 border-green-500 dark:bg-green-700 dark:border-green-500" : "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"} ${gameState === "input" ? "cursor-pointer" : "cursor-default"}`}
              disabled={gameState !== "input"}
            />
          )
        })}
      </div>
      {currentLevel % 5 === 0 && gameState === "input" && userInput.length === 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Brain Boost:</strong> This task enhances your visual-spatial working memory, engaging your
              prefrontal and parietal cortices. Consistent practice can improve focus and pattern recognition.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
