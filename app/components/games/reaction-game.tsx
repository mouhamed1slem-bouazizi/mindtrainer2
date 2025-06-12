"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Zap, Target, Clock, Star, Volume2, VolumeX } from "lucide-react"

interface ReactionGameProps {
  onComplete: (score: number, metrics: any) => void
  onBack: () => void
  gameData?: any
}

interface GameTarget {
  id: string
  x: number
  y: number
  color: string
  size: number
  isTarget: boolean
  pattern?: string
  sequence?: number
}

interface LevelConfig {
  level: number
  targetCount: number
  distractorCount: number
  timeLimit: number
  minReactionTime: number
  maxReactionTime: number
  patterns: string[]
  gameMode: "simple" | "multi" | "sequence" | "pattern" | "memory"
  speedMultiplier: number
}

export function ReactionGame({ onComplete, onBack, gameData }: ReactionGameProps) {
  const [gameState, setGameState] = useState<
    "instructions" | "playing" | "waiting" | "ready" | "levelComplete" | "gameComplete"
  >("instructions")
  const [currentLevel, setCurrentLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [levelScore, setLevelScore] = useState(0)
  const [targets, setTargets] = useState<GameTarget[]>([])
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [startTime, setStartTime] = useState(0)
  const [levelStartTime, setLevelStartTime] = useState(0)
  const [correctClicks, setCorrectClicks] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [showSequence, setShowSequence] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [levelHistory, setLevelHistory] = useState<
    Array<{ level: number; score: number; time: number; accuracy: number }>
  >([])

  const timeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const audioContextRef = useRef<AudioContext>()

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Play sound effect
  const playSound = useCallback(
    (frequency: number, duration = 100, type: "success" | "error" | "start" | "complete" = "success") => {
      if (!soundEnabled || !audioContextRef.current) return

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = type === "error" ? "sawtooth" : "sine"

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000)
    },
    [soundEnabled],
  )

  // Generate level configuration
  const getLevelConfig = useCallback((level: number): LevelConfig => {
    const baseConfig = {
      level,
      targetCount: Math.min(1 + Math.floor(level / 10), 8),
      distractorCount: Math.min(Math.floor(level / 5), 12),
      timeLimit: Math.max(5000 - level * 30, 1000),
      minReactionTime: Math.max(2000 - level * 15, 200),
      maxReactionTime: Math.max(4000 - level * 25, 800),
      speedMultiplier: 1 + level * 0.02,
      patterns: ["circle", "square", "triangle", "diamond", "star"],
    }

    // Determine game mode based on level
    let gameMode: LevelConfig["gameMode"] = "simple"
    if (level >= 80) gameMode = "memory"
    else if (level >= 60) gameMode = "sequence"
    else if (level >= 40) gameMode = "pattern"
    else if (level >= 20) gameMode = "multi"

    return { ...baseConfig, gameMode }
  }, [])

  // Generate targets for current level
  const generateTargets = useCallback((config: LevelConfig): GameTarget[] => {
    const newTargets: GameTarget[] = []
    const colors = ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"]
    const patterns = config.patterns

    // Generate target elements
    for (let i = 0; i < config.targetCount; i++) {
      newTargets.push({
        id: `target-${i}`,
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 70 + 15, // 15-85% of container height
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.max(60 - Math.floor(config.level / 5), 30),
        isTarget: true,
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
        sequence: i + 1,
      })
    }

    // Generate distractor elements
    for (let i = 0; i < config.distractorCount; i++) {
      newTargets.push({
        id: `distractor-${i}`,
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.max(50 - Math.floor(config.level / 8), 25),
        isTarget: false,
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
      })
    }

    return newTargets.sort(() => Math.random() - 0.5) // Shuffle
  }, [])

  // Start a new level
  const startLevel = useCallback(() => {
    const config = getLevelConfig(currentLevel)
    const newTargets = generateTargets(config)

    setTargets(newTargets)
    setLevelScore(0)
    setCorrectClicks(0)
    setTotalClicks(0)
    setTimeLeft(config.timeLimit)
    setLevelStartTime(Date.now())
    setPlayerSequence([])

    if (config.gameMode === "sequence" || config.gameMode === "memory") {
      // Generate sequence for sequence/memory modes
      const sequenceLength = Math.min(3 + Math.floor(currentLevel / 15), 8)
      const newSequence = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * config.targetCount))
      setSequence(newSequence)
      setShowSequence(true)

      // Show sequence for a brief period
      setTimeout(
        () => {
          setShowSequence(false)
          setGameState("playing")
          startTimer(config.timeLimit)
        },
        2000 + sequenceLength * 500,
      )
    } else {
      setGameState("playing")
      startTimer(config.timeLimit)
    }

    playSound(440, 200, "start")
  }, [currentLevel, getLevelConfig, generateTargets, playSound])

  // Start countdown timer
  const startTimer = useCallback((duration: number) => {
    setTimeLeft(duration)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(intervalRef.current!)
          completeLevel()
          return 0
        }
        return prev - 100
      })
    }, 100)
  }, [])

  // Handle target click
  const handleTargetClick = useCallback(
    (target: GameTarget) => {
      if (gameState !== "playing") return

      const reactionTime = Date.now() - startTime
      const config = getLevelConfig(currentLevel)

      setTotalClicks((prev) => prev + 1)

      if (config.gameMode === "sequence" || config.gameMode === "memory") {
        // Handle sequence-based gameplay
        const expectedIndex = playerSequence.length
        const expectedTargetIndex = sequence[expectedIndex]
        const clickedTargetIndex = targets.findIndex((t) => t.id === target.id && t.isTarget)

        if (clickedTargetIndex === expectedTargetIndex) {
          setPlayerSequence((prev) => [...prev, clickedTargetIndex])
          setCorrectClicks((prev) => prev + 1)

          const points = Math.max(1000 - reactionTime, 100) * config.speedMultiplier
          setLevelScore((prev) => prev + points)
          setScore((prev) => prev + points)

          playSound(523, 100, "success")

          if (playerSequence.length + 1 >= sequence.length) {
            completeLevel()
          }
        } else {
          playSound(220, 200, "error")
          setStreak(0)
        }
      } else {
        // Handle other game modes
        if (target.isTarget) {
          setCorrectClicks((prev) => prev + 1)
          setReactionTimes((prev) => [...prev, reactionTime])

          const points = Math.max(1000 - reactionTime, 100) * config.speedMultiplier
          setLevelScore((prev) => prev + points)
          setScore((prev) => prev + points)
          setStreak((prev) => prev + 1)
          setBestStreak((prev) => Math.max(prev, streak + 1))

          playSound(523, 100, "success")

          // Remove clicked target
          setTargets((prev) => prev.filter((t) => t.id !== target.id))

          // Check if all targets are clicked
          if (targets.filter((t) => t.isTarget).length <= 1) {
            completeLevel()
          }
        } else {
          playSound(220, 200, "error")
          setStreak(0)
          // Penalty for clicking distractors
          setScore((prev) => Math.max(0, prev - 50))
        }
      }
    },
    [gameState, currentLevel, startTime, targets, sequence, playerSequence, streak, getLevelConfig, playSound],
  )

  // Complete current level
  const completeLevel = useCallback(() => {
    clearInterval(intervalRef.current!)

    const levelTime = Date.now() - levelStartTime
    const accuracy = totalClicks > 0 ? (correctClicks / totalClicks) * 100 : 0
    const config = getLevelConfig(currentLevel)

    // Bonus points for accuracy and speed
    const accuracyBonus = accuracy * 10
    const speedBonus = Math.max(0, (config.timeLimit - levelTime) / 10)
    const totalLevelScore = levelScore + accuracyBonus + speedBonus

    setScore((prev) => prev + accuracyBonus + speedBonus)

    // Record level history
    setLevelHistory((prev) => [
      ...prev,
      {
        level: currentLevel,
        score: totalLevelScore,
        time: levelTime,
        accuracy: accuracy,
      },
    ])

    playSound(659, 300, "complete")

    if (currentLevel >= 100) {
      setGameState("gameComplete")
    } else {
      setGameState("levelComplete")
    }
  }, [currentLevel, levelStartTime, levelScore, correctClicks, totalClicks, getLevelConfig, playSound])

  // Proceed to next level
  const nextLevel = useCallback(() => {
    setCurrentLevel((prev) => prev + 1)
    setGameState("waiting")

    // Brief pause before starting next level
    setTimeout(() => {
      startLevel()
    }, 1000)
  }, [startLevel])

  // Complete game and save data
  const completeGame = useCallback(() => {
    const totalTime = levelHistory.reduce((sum, level) => sum + level.time, 0)
    const avgAccuracy = levelHistory.reduce((sum, level) => sum + level.accuracy, 0) / levelHistory.length
    const avgReactionTime =
      reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0

    const metrics = {
      levelsCompleted: currentLevel,
      totalScore: score,
      totalTime: totalTime,
      avgAccuracy: avgAccuracy,
      avgReactionTime: avgReactionTime,
      bestReactionTime: Math.min(...reactionTimes),
      bestStreak: bestStreak,
      levelHistory: levelHistory,
      reactionTimes: reactionTimes,
      date: new Date().toISOString(),
      gameCompletionTime: totalTime,
      accuracyRate: avgAccuracy,
      levelReached: currentLevel,
    }

    onComplete(score, metrics)
  }, [currentLevel, score, levelHistory, reactionTimes, bestStreak, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
      clearInterval(intervalRef.current)
    }
  }, [])

  if (gameState === "instructions") {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Lightning Reflexes - 100 Levels</h2>
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
                <strong>Goal:</strong> Complete 100 progressively challenging levels testing your reflexes and
                attention.
              </p>
              <p className="text-sm">
                <strong>Game Modes:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>
                  • <strong>Levels 1-19:</strong> Simple reaction - Click targets quickly
                </li>
                <li>
                  • <strong>Levels 20-39:</strong> Multi-target - Click multiple targets
                </li>
                <li>
                  • <strong>Levels 40-59:</strong> Pattern matching - Click specific patterns
                </li>
                <li>
                  • <strong>Levels 60-79:</strong> Sequence - Follow the correct order
                </li>
                <li>
                  • <strong>Levels 80-100:</strong> Memory - Remember and repeat sequences
                </li>
              </ul>
              <p className="text-sm">
                <strong>Scoring:</strong> Speed + Accuracy + Streak bonuses
              </p>
            </div>

            {gameData?.bestScore && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium">Your Best Score: {gameData.bestScore}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Best Streak: {gameData.bestStreak || 0} | Times Played: {gameData.timesPlayed || 0}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {soundEnabled ? "Sound On" : "Sound Off"}
              </Button>
            </div>

            <Button
              onClick={() => {
                setCurrentLevel(1)
                startLevel()
              }}
              className="w-full"
            >
              Start Game (Level 1)
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "levelComplete") {
    const levelData = levelHistory[levelHistory.length - 1]
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">Level {currentLevel} Complete!</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Level Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.round(levelData?.score || 0)}</p>
                <p className="text-sm text-gray-500">Level Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{Math.round(levelData?.accuracy || 0)}%</p>
                <p className="text-sm text-gray-500">Accuracy</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-medium">{Math.round((levelData?.time || 0) / 1000)}s</p>
                <p className="text-sm text-gray-500">Completion Time</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">{streak}</p>
                <p className="text-sm text-gray-500">Current Streak</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{score}</p>
              <p className="text-sm text-gray-500">Total Score</p>
            </div>

            <Button onClick={nextLevel} className="w-full">
              Continue to Level {currentLevel + 1}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "gameComplete") {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">🎉 Game Complete!</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Final Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-purple-600">{score}</p>
              <p className="text-lg text-gray-600">Final Score</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{currentLevel}</p>
                <p className="text-sm text-gray-500">Levels Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{bestStreak}</p>
                <p className="text-sm text-gray-500">Best Streak</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-medium">
                  {reactionTimes.length > 0
                    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
                    : 0}
                  ms
                </p>
                <p className="text-sm text-gray-500">Avg Reaction Time</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">
                  {levelHistory.length > 0
                    ? Math.round(levelHistory.reduce((sum, level) => sum + level.accuracy, 0) / levelHistory.length)
                    : 0}
                  %
                </p>
                <p className="text-sm text-gray-500">Avg Accuracy</p>
              </div>
            </div>

            <Button onClick={completeGame} className="w-full">
              Save Results & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const config = getLevelConfig(currentLevel)
  const progressPercent = (currentLevel / 100) * 100

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold">Lightning Reflexes</h2>
      </div>

      {/* Level Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Level {currentLevel}</Badge>
              <Badge variant="secondary">{config.gameMode.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{Math.round(timeLeft / 1000)}s</span>
            </div>
          </div>
          <Progress value={progressPercent} className="mb-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Score: {score}</span>
            <span>Streak: {streak}</span>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <div className="relative">
        <div
          className={`
            min-h-96 rounded-lg border-2 relative overflow-hidden transition-all duration-200
            ${gameState === "waiting" ? "bg-yellow-100 border-yellow-300" : "bg-gray-50 border-gray-200"}
          `}
        >
          {gameState === "waiting" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">Get Ready!</p>
                <p className="text-lg">Level {currentLevel} starting...</p>
              </div>
            </div>
          )}

          {showSequence && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100">
              <div className="text-center">
                <p className="text-xl font-bold mb-4">Remember the sequence:</p>
                <div className="flex gap-2 justify-center">
                  {sequence.map((targetIndex, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold"
                    >
                      {targetIndex + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState === "playing" &&
            targets.map((target) => (
              <div
                key={target.id}
                className={`
                absolute cursor-pointer transition-all duration-200 hover:scale-110
                ${target.isTarget ? "animate-pulse" : "opacity-70"}
                ${target.pattern === "circle" ? "rounded-full" : ""}
                ${target.pattern === "square" ? "rounded-none" : ""}
                ${target.pattern === "triangle" ? "rounded-t-full" : ""}
                ${target.pattern === "diamond" ? "rotate-45 rounded-lg" : ""}
                ${target.pattern === "star" ? "rounded-full" : ""}
              `}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  backgroundColor: target.color,
                  transform: target.pattern === "diamond" ? "rotate(45deg)" : undefined,
                }}
                onClick={() => {
                  setStartTime(Date.now())
                  handleTargetClick(target)
                }}
              >
                {config.gameMode === "sequence" && target.isTarget && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {target.sequence}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Instructions for current mode */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Instructions</span>
          </div>
          <p className="text-sm text-gray-600">
            {config.gameMode === "simple" && "Click the glowing targets as quickly as possible!"}
            {config.gameMode === "multi" && "Click all the glowing targets before time runs out!"}
            {config.gameMode === "pattern" && "Click targets with specific patterns only!"}
            {config.gameMode === "sequence" && "Click the numbered targets in the correct order!"}
            {config.gameMode === "memory" && "Remember the sequence shown, then click targets in that order!"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
