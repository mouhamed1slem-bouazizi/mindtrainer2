"use client"

import { useState, useEffect } from "react"

interface GameMetrics {
  bestScore: number
  timesPlayed: number
  avgReactionTime?: number
  bestReactionTime?: number
  accuracy?: number
  level?: number
}

interface UserStats {
  totalScore: number
  avgReactionTime: number
  gamesPlayed: number
  streakDays: number
  totalTime: number
}

export function useGameData() {
  const [gameData, setGameData] = useState<Record<string, GameMetrics>>({
    memory: { bestScore: 0, timesPlayed: 0 },
    reaction: { bestScore: 0, timesPlayed: 0, bestReactionTime: 999 },
    attention: { bestScore: 0, timesPlayed: 0, accuracy: 0 },
  })

  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 2450,
    avgReactionTime: 285,
    gamesPlayed: 42,
    streakDays: 7,
    totalTime: 192, // minutes
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGameData = localStorage.getItem("mindtrainer-game-data")
    const savedUserStats = localStorage.getItem("mindtrainer-user-stats")

    if (savedGameData) {
      setGameData(JSON.parse(savedGameData))
    }

    if (savedUserStats) {
      setUserStats(JSON.parse(savedUserStats))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mindtrainer-game-data", JSON.stringify(gameData))
  }, [gameData])

  useEffect(() => {
    localStorage.setItem("mindtrainer-user-stats", JSON.stringify(userStats))
  }, [userStats])

  const updateGameData = (gameId: string, score: number, metrics: any) => {
    setGameData((prev) => {
      const currentGame = prev[gameId] || { bestScore: 0, timesPlayed: 0 }

      return {
        ...prev,
        [gameId]: {
          ...currentGame,
          bestScore: Math.max(currentGame.bestScore, score),
          timesPlayed: currentGame.timesPlayed + 1,
          ...metrics,
        },
      }
    })

    // Update user stats
    setUserStats((prev) => ({
      ...prev,
      totalScore: prev.totalScore + score,
      gamesPlayed: prev.gamesPlayed + 1,
      avgReactionTime: metrics.avgReactionTime || prev.avgReactionTime,
    }))
  }

  return {
    gameData,
    userStats,
    updateGameData,
  }
}
