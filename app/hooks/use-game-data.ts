"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface LevelTime {
  level: number
  time: number
  date: string
}

interface GameMetrics {
  bestScore: number
  timesPlayed: number
  bestLevel?: number
  history?: Array<{
    score: number
    level: number
    accuracy: number
    date: string
    levelTimes?: LevelTime[]
    totalSessionTime?: number
    averageTimePerLevel?: number
  }>
  avgReactionTime?: number
  bestReactionTime?: number
  accuracy?: number
  level?: number
  levelTimes?: LevelTime[]
  averageTimePerLevel?: number
  fastestLevel?: { level: number; time: number }
  totalTimePlayed?: number
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
    memory: { bestScore: 0, timesPlayed: 0, levelTimes: [] },
    reaction: { bestScore: 0, timesPlayed: 0, bestReactionTime: 999 },
    attention: { bestScore: 0, timesPlayed: 0, accuracy: 0 },
  })

  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 0,
    avgReactionTime: 285,
    gamesPlayed: 0,
    streakDays: 0,
    totalTime: 0, // minutes
  })

  const { user } = useAuth()

  // Load data from Firestore when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()

          if (userData.gameData) {
            setGameData(userData.gameData)
          }

          if (userData.userStats) {
            setUserStats(userData.userStats)
          }
        } else {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            createdAt: new Date().toISOString(),
            gameData,
            userStats,
          })
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    loadUserData()
  }, [user])

  // Save data to Firestore whenever it changes
  useEffect(() => {
    const saveUserData = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        await updateDoc(userDocRef, {
          gameData,
          userStats,
        })
      } catch (error) {
        console.error("Error saving user data:", error)
      }
    }

    // Only save if user is authenticated and data has been loaded
    if (user && (gameData.memory.timesPlayed > 0 || userStats.gamesPlayed > 0)) {
      saveUserData()
    }
  }, [gameData, userStats, user])

  const updateGameData = async (gameId: string, score: number, metrics: any) => {
    setGameData((prev) => {
      const currentGame = prev[gameId] || { bestScore: 0, timesPlayed: 0, history: [], levelTimes: [] }
      const newHistoryEntry = {
        score,
        level: metrics.level,
        accuracy: metrics.accuracy,
        date: new Date().toISOString(),
        levelTimes: metrics.levelTimes || [],
        totalSessionTime: metrics.totalSessionTime || 0,
        averageTimePerLevel: metrics.averageTimePerLevel || 0,
      }

      // Update level times for memory game
      let updatedLevelTimes = currentGame.levelTimes || []
      let updatedFastestLevel = currentGame.fastestLevel
      let updatedTotalTimePlayed = currentGame.totalTimePlayed || 0

      if (gameId === "memory" && metrics.levelTimes) {
        // Add new level times
        updatedLevelTimes = [...updatedLevelTimes, ...metrics.levelTimes]
        updatedTotalTimePlayed += metrics.totalSessionTime || 0

        // Update fastest level
        const sessionFastest = metrics.fastestLevel
        if (sessionFastest && (!updatedFastestLevel || sessionFastest.time < updatedFastestLevel.time)) {
          updatedFastestLevel = sessionFastest
        }

        // Calculate new average time per level
        const totalTime = updatedLevelTimes.reduce((sum, lt) => sum + lt.time, 0)
        const averageTimePerLevel = updatedLevelTimes.length > 0 ? totalTime / updatedLevelTimes.length : 0

        return {
          ...prev,
          [gameId]: {
            ...currentGame,
            bestScore: Math.max(currentGame.bestScore, score),
            bestLevel: Math.max(currentGame.bestLevel || 0, metrics.level),
            timesPlayed: currentGame.timesPlayed + 1,
            history: [...(currentGame.history || []), newHistoryEntry],
            levelTimes: updatedLevelTimes,
            averageTimePerLevel: averageTimePerLevel,
            fastestLevel: updatedFastestLevel,
            totalTimePlayed: updatedTotalTimePlayed,
            // Keep other specific metrics if they exist
            ...metrics,
          },
        }
      }

      return {
        ...prev,
        [gameId]: {
          ...currentGame,
          bestScore: Math.max(currentGame.bestScore, score),
          bestLevel: Math.max(currentGame.bestLevel || 0, metrics.level),
          timesPlayed: currentGame.timesPlayed + 1,
          history: [...(currentGame.history || []), newHistoryEntry],
          // Keep other specific metrics if they exist
          ...metrics,
        },
      }
    })

    // Update aggregate user stats
    setUserStats((prev) => ({
      ...prev,
      totalScore: prev.totalScore + score,
      gamesPlayed: prev.gamesPlayed + 1,
      // Add session time to total time if available
      totalTime: prev.totalTime + Math.round((metrics.totalSessionTime || 0) / 60000), // Convert ms to minutes
    }))
  }

  return {
    gameData,
    userStats,
    updateGameData,
  }
}
