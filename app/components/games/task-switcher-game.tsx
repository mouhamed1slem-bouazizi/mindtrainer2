"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Clock, Target, Zap, Brain, CheckCircle, Star } from "lucide-react"
import { useGameData } from "../../hooks/use-game-data"

interface TaskRule {
  id: string
  name: string
  description: string
  color: string
  icon: string
  check: (stimulus: Stimulus, response: string) => boolean
}

interface Stimulus {
  shape: "circle" | "square" | "triangle" | "diamond"
  color: "red" | "blue" | "green" | "yellow" | "purple" | "orange"
  size: "small" | "medium" | "large"
  number: number
  position: "left" | "right" | "center"
}

interface GameState {
  level: number
  score: number
  streak: number
  bestStreak: number
  totalCorrect: number
  totalAttempts: number
  reactionTimes: number[]
  levelStartTime: number
  gameStartTime: number
  isPlaying: boolean
  isPaused: boolean
  showInstructions: boolean
  currentTask: TaskRule
  nextTask: TaskRule | null
  stimulus: Stimulus | null
  timeRemaining: number
  switchCost: number[]
  taskSwitches: number
  errors: Array<{ level: number; task: string; time: number }>
}

const SHAPES = ["circle", "square", "triangle", "diamond"] as const
const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"] as const
const SIZES = ["small", "medium", "large"] as const
const POSITIONS = ["left", "right", "center"] as const

const TASK_RULES: TaskRule[] = [
  {
    id: "color",
    name: "Color Task",
    description: "Click if the shape is RED or BLUE",
    color: "bg-red-500",
    icon: "🎨",
    check: (stimulus, response) => {
      const shouldClick = stimulus.color === "red" || stimulus.color === "blue"
      return (response === "click") === shouldClick
    },
  },
  {
    id: "shape",
    name: "Shape Task",
    description: "Click if the shape is CIRCLE or SQUARE",
    color: "bg-blue-500",
    icon: "🔷",
    check: (stimulus, response) => {
      const shouldClick = stimulus.shape === "circle" || stimulus.shape === "square"
      return (response === "click") === shouldClick
    },
  },
  {
    id: "size",
    name: "Size Task",
    description: "Click if the shape is LARGE",
    color: "bg-green-500",
    icon: "📏",
    check: (stimulus, response) => {
      const shouldClick = stimulus.size === "large"
      return (response === "click") === shouldClick
    },
  },
  {
    id: "number",
    name: "Number Task",
    description: "Click if the number is EVEN",
    color: "bg-purple-500",
    icon: "🔢",
    check: (stimulus, response) => {
      const shouldClick = stimulus.number % 2 === 0
      return (response === "click") === shouldClick
    },
  },
  {
    id: "position",
    name: "Position Task",
    description: "Click if the shape is on the LEFT or RIGHT",
    color: "bg-orange-500",
    icon: "📍",
    check: (stimulus, response) => {
      const shouldClick = stimulus.position === "left" || stimulus.position === "right"
      return (response === "click") === shouldClick
    },
  },
]

export function TaskSwitcherGame() {
  const { updateGameData } = useGameData()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    reactionTimes: [],
    levelStartTime: 0,
    gameStartTime: 0,
    isPlaying: false,
    isPaused: false,
    showInstructions: true,
    currentTask: TASK_RULES[0],
    nextTask: null,
    stimulus: null,
    timeRemaining: 0,
    switchCost: [],
    taskSwitches: 0,
    errors: [],
  })

  const stimulusStartTime = useRef<number>(0)
  const gameTimer = useRef<NodeJS.Timeout>()
  const stimulusTimer = useRef<NodeJS.Timeout>()

  // Calculate level parameters
  const getLevelConfig = (level: number) => {
    const baseTime = Math.max(3000 - level * 20, 800) // 3s to 0.8s
    const switchProbability = Math.min(0.1 + level * 0.008, 0.9) // 10% to 90%
    const tasksAvailable = Math.min(Math.floor((level - 1) / 20) + 2, TASK_RULES.length) // 2-5 tasks
    const trialsPerLevel = Math.min(10 + Math.floor(level / 10), 25) // 10-25 trials
    const switchDelay = Math.max(1500 - level * 10, 200) // 1.5s to 0.2s

    return {
      stimulusTime: baseTime,
      switchProbability,
      tasksAvailable,
      trialsPerLevel,
      switchDelay,
    }
  }

  // Generate random stimulus
  const generateStimulus = useCallback((): Stimulus => {
    return {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: SIZES[Math.floor(Math.random() * SIZES.length)],
      number: Math.floor(Math.random() * 9) + 1,
      position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
    }
  }, [])

  // Select next task
  const selectNextTask = useCallback((currentTask: TaskRule, level: number) => {
    const config = getLevelConfig(level)
    const availableTasks = TASK_RULES.slice(0, config.tasksAvailable)

    if (Math.random() < config.switchProbability) {
      // Task switch
      const otherTasks = availableTasks.filter((task) => task.id !== currentTask.id)
      return otherTasks[Math.floor(Math.random() * otherTasks.length)]
    } else {
      // Task repeat
      return currentTask
    }
  }, [])

  // Play sound effect
  const playSound = useCallback(
    (type: "correct" | "incorrect" | "switch" | "complete") => {
      if (!soundEnabled) return

      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      switch (type) {
        case "correct":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
          break
        case "incorrect":
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2)
          break
        case "switch":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          break
        case "complete":
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2)
          break
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    },
    [soundEnabled],
  )

  // Handle response
  const handleResponse = useCallback(
    (response: "click" | "no-click") => {
      if (!gameState.isPlaying || !gameState.stimulus) return

      const reactionTime = Date.now() - stimulusStartTime.current
      const isCorrect = gameState.currentTask.check(gameState.stimulus, response)

      setGameState((prev) => {
        const newReactionTimes = [...prev.reactionTimes, reactionTime]
        const newStreak = isCorrect ? prev.streak + 1 : 0
        const scoreGain = isCorrect ? Math.max(1000 - reactionTime, 100) + prev.streak * 10 : 0

        const newErrors = isCorrect
          ? prev.errors
          : [...prev.errors, { level: prev.level, task: prev.currentTask.name, time: reactionTime }]

        return {
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
          score: prev.score + scoreGain,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          reactionTimes: newReactionTimes,
          errors: newErrors,
          stimulus: null,
        }
      })

      playSound(isCorrect ? "correct" : "incorrect")

      // Clear timers
      if (stimulusTimer.current) {
        clearTimeout(stimulusTimer.current)
      }

      // Continue to next trial after delay
      setTimeout(() => {
        nextTrial()
      }, 500)
    },
    [gameState.isPlaying, gameState.stimulus, gameState.currentTask, playSound],
  )

  // Next trial
  const nextTrial = useCallback(() => {
    setGameState((prev) => {
      const config = getLevelConfig(prev.level)
      const nextTask = selectNextTask(prev.currentTask, prev.level)
      const isSwitch = nextTask.id !== prev.currentTask.id

      if (isSwitch) {
        playSound("switch")
      }

      const newStimulus = generateStimulus()
      stimulusStartTime.current = Date.now()

      // Set stimulus timeout
      stimulusTimer.current = setTimeout(() => {
        handleResponse("no-click")
      }, config.stimulusTime)

      return {
        ...prev,
        currentTask: nextTask,
        stimulus: newStimulus,
        taskSwitches: prev.taskSwitches + (isSwitch ? 1 : 0),
        timeRemaining: config.stimulusTime,
      }
    })
  }, [selectNextTask, generateStimulus, playSound, handleResponse])

  // Start level
  const startLevel = useCallback(() => {
    const config = getLevelConfig(gameState.level)

    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      showInstructions: false,
      levelStartTime: Date.now(),
      gameStartTime: prev.gameStartTime || Date.now(),
      totalAttempts: 0,
      totalCorrect: 0,
      reactionTimes: [],
      errors: [],
      taskSwitches: 0,
      switchCost: [],
    }))

    // Start first trial after brief delay
    setTimeout(() => {
      nextTrial()
    }, 1000)
  }, [gameState.level, nextTrial])

  // Complete level
  const completeLevel = useCallback(() => {
    const levelTime = Date.now() - gameState.levelStartTime
    const accuracy = gameState.totalAttempts > 0 ? (gameState.totalCorrect / gameState.totalAttempts) * 100 : 0
    const avgReactionTime =
      gameState.reactionTimes.length > 0
        ? gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length
        : 0

    playSound("complete")

    // Calculate switch cost
    const switchCost =
      gameState.reactionTimes.length > 1
        ? gameState.reactionTimes.slice(1).reduce((acc, time, i) => {
            if (i > 0) {
              acc.push(time - gameState.reactionTimes[i])
            }
            return acc
          }, [] as number[])
        : []

    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      showInstructions: true,
      level: Math.min(prev.level + 1, 100),
      switchCost,
    }))

    // Save game data
    const gameMetrics = {
      level: gameState.level,
      accuracy,
      avgReactionTime,
      bestReactionTime: Math.min(...gameState.reactionTimes),
      totalSessionTime: levelTime,
      streak: gameState.bestStreak,
      taskSwitches: gameState.taskSwitches,
      switchCost: switchCost.length > 0 ? switchCost.reduce((a, b) => a + b, 0) / switchCost.length : 0,
      errors: gameState.errors.length,
      cognitiveFlexibility: Math.max(0, 100 - gameState.errors.length * 10 - avgReactionTime / 50),
    }

    updateGameData("taskSwitcher", gameState.score, gameMetrics)
  }, [gameState, playSound, updateGameData])

  // Check if level is complete
  useEffect(() => {
    if (gameState.isPlaying && gameState.totalAttempts >= getLevelConfig(gameState.level).trialsPerLevel) {
      completeLevel()
    }
  }, [gameState.totalAttempts, gameState.level, gameState.isPlaying, completeLevel])

  // Countdown timer
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && gameState.timeRemaining > 0) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 100),
        }))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeRemaining])

  // Reset game
  const resetGame = () => {
    if (gameTimer.current) clearTimeout(gameTimer.current)
    if (stimulusTimer.current) clearTimeout(stimulusTimer.current)

    setGameState({
      level: 1,
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      reactionTimes: [],
      levelStartTime: 0,
      gameStartTime: 0,
      isPlaying: false,
      isPaused: false,
      showInstructions: true,
      currentTask: TASK_RULES[0],
      nextTask: null,
      stimulus: null,
      timeRemaining: 0,
      switchCost: [],
      taskSwitches: 0,
      errors: [],
    })
  }

  // Get shape component
  const getShapeComponent = (stimulus: Stimulus) => {
    const sizeClass = {
      small: "w-12 h-12",
      medium: "w-16 h-16",
      large: "w-20 h-20",
    }[stimulus.size]

    const colorClass = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
    }[stimulus.color]

    const positionClass = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    }[stimulus.position]

    const shapeClass = {
      circle: "rounded-full",
      square: "rounded-none",
      triangle: "clip-triangle",
      diamond: "rotate-45 rounded-sm",
    }[stimulus.shape]

    return (
      <div className={`flex ${positionClass} items-center h-32 mb-4`}>
        <div
          className={`${sizeClass} ${colorClass} ${shapeClass} cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white font-bold text-xl`}
          onClick={() => handleResponse("click")}
        >
          {stimulus.number}
        </div>
      </div>
    )
  }

  const config = getLevelConfig(gameState.level)
  const accuracy = gameState.totalAttempts > 0 ? (gameState.totalCorrect / gameState.totalAttempts) * 100 : 0
  const progress = (gameState.totalAttempts / config.trialsPerLevel) * 100

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              Task Switcher
              <Badge variant="outline">Level {gameState.level}/100</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={resetGame}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{gameState.score.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{gameState.streak}</div>
            <div className="text-sm text-gray-500">Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{gameState.taskSwitches}</div>
            <div className="text-sm text-gray-500">Switches</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Task Display */}
      {gameState.isPlaying && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${gameState.currentTask.color}`}
              >
                <span className="text-lg">{gameState.currentTask.icon}</span>
                <span className="font-semibold">{gameState.currentTask.name}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{gameState.currentTask.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>
                  Trial {gameState.totalAttempts}/{config.trialsPerLevel}
                </span>
                <span>{(gameState.timeRemaining / 1000).toFixed(1)}s</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Stimulus */}
            {gameState.stimulus && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                {getShapeComponent(gameState.stimulus)}
                <div className="text-center">
                  <Button variant="outline" onClick={() => handleResponse("no-click")} className="ml-4">
                    Don't Click
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions/Results */}
      {gameState.showInstructions && (
        <Card>
          <CardContent className="p-6">
            {gameState.level === 1 && gameState.totalAttempts === 0 ? (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Welcome to Task Switcher!</h3>
                <p className="text-gray-600">
                  Test your cognitive flexibility by switching between different tasks. Follow the current task rule and
                  respond quickly and accurately.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {TASK_RULES.slice(0, config.tasksAvailable).map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${task.color}`}
                      >
                        <span>{task.icon}</span>
                        <span>{task.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={startLevel} size="lg" className="mt-6">
                  <Play className="w-4 h-4 mr-2" />
                  Start Level {gameState.level}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <h3 className="text-xl font-bold">Level {gameState.level - 1} Complete!</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Accuracy</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{gameState.bestStreak}</div>
                    <div className="text-sm text-gray-500">Best Streak</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{gameState.taskSwitches}</div>
                    <div className="text-sm text-gray-500">Task Switches</div>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {gameState.reactionTimes.length > 0
                        ? Math.round(
                            gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length,
                          )
                        : 0}
                      ms
                    </div>
                    <div className="text-sm text-gray-500">Avg Time</div>
                  </div>
                </div>

                {gameState.level <= 100 ? (
                  <Button onClick={startLevel} size="lg" className="mt-6">
                    <Play className="w-4 h-4 mr-2" />
                    Continue to Level {gameState.level}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-8 h-8 text-yellow-500" />
                      <h3 className="text-2xl font-bold">Congratulations!</h3>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-lg">You've completed all 100 levels of Task Switcher!</p>
                    <Button onClick={resetGame} size="lg">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
