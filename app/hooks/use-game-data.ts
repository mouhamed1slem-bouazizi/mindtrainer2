"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cleanDataForFirestore, ensureGameDataDefaults, ensureUserStatsDefaults } from "@/lib/firestore-utils"

interface LevelTime {
  level: number
  time: number
  date: string
}

interface GameSession {
  id: string
  gameId: string
  score: number
  date: string
  metrics: Record<string, any>
}

interface GameMetrics {
  bestScore: number
  timesPlayed: number
  bestLevel?: number
  history?: Array<{
    id: string
    score: number
    level: number
    accuracy: number
    date: string
    levelTimes?: LevelTime[]
    totalSessionTime?: number
    averageTimePerLevel?: number
    metrics?: Record<string, any>
  }>
  avgReactionTime?: number
  bestReactionTime?: number
  accuracy?: number
  level?: number
  levelTimes?: LevelTime[]
  averageTimePerLevel?: number
  fastestLevel?: { level: number; time: number }
  totalTimePlayed?: number
  lastPlayed?: string
  reactionTimes?: number[]
  fastestRounds?: Array<{ round: number; time: number; date: string }>
  totalRoundsPlayed?: number
  improvement?: string
}

interface UserStats {
  totalScore: number
  avgReactionTime: number
  gamesPlayed: number
  streakDays: number
  totalTime: number
  lastActive: string
  sessionsCompleted: number
  gamesPlayedByType: Record<string, number>
  achievements: string[]
}

export function useGameData() {
  const [gameData, setGameData] = useState<Record<string, GameMetrics>>({
    memory: { bestScore: 0, timesPlayed: 0, levelTimes: [], history: [] },
    reaction: {
      bestScore: 0,
      timesPlayed: 0,
      bestReactionTime: 999,
      history: [],
      reactionTimes: [],
      fastestRounds: [],
    },
    attention: { bestScore: 0, timesPlayed: 0, accuracy: 0, history: [] },
  })

  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 0,
    avgReactionTime: 0,
    gamesPlayed: 0,
    streakDays: 0,
    totalTime: 0,
    lastActive: new Date().toISOString(),
    sessionsCompleted: 0,
    gamesPlayedByType: {},
    achievements: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([])

  const { user } = useAuth()

  // Load data from Firestore when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()

          if (userData.gameData) {
            setGameData(ensureGameDataDefaults(userData.gameData))
          }

          if (userData.userStats) {
            setUserStats(ensureUserStatsDefaults(userData.userStats))
          }

          if (userData.recentSessions && Array.isArray(userData.recentSessions)) {
            setRecentSessions(userData.recentSessions)
          }
        } else {
          // Create user document if it doesn't exist
          const initialGameData = ensureGameDataDefaults({})
          const initialUserStats = ensureUserStatsDefaults({})

          const cleanInitialData = cleanDataForFirestore({
            email: user.email,
            displayName: user.displayName,
            createdAt: new Date().toISOString(),
            gameData: initialGameData,
            userStats: initialUserStats,
            recentSessions: [],
          })

          await setDoc(userDocRef, cleanInitialData)

          setGameData(initialGameData)
          setUserStats(initialUserStats)
          setRecentSessions([])
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        setError("Failed to load game data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user])

  // Save data to Firestore whenever it changes
  useEffect(() => {
    const saveUserData = async () => {
      if (!user || isLoading) return

      try {
        const userDocRef = doc(db, "users", user.uid)

        // Clean and prepare data for Firestore
        const cleanedGameData = cleanDataForFirestore(ensureGameDataDefaults(gameData))
        const cleanedUserStats = cleanDataForFirestore(
          ensureUserStatsDefaults({
            ...userStats,
            lastActive: new Date().toISOString(),
          }),
        )
        const cleanedRecentSessions = cleanDataForFirestore(recentSessions || [])

        const updateData = cleanDataForFirestore({
          gameData: cleanedGameData,
          userStats: cleanedUserStats,
          recentSessions: cleanedRecentSessions,
          lastUpdated: serverTimestamp(),
        })

        await updateDoc(userDocRef, updateData)
      } catch (error) {
        console.error("Error saving user data:", error)
        setError("Failed to save game data. Please try again.")
      }
    }

    // Only save if user is authenticated and we have some game data
    if (user && !isLoading && userStats.gamesPlayed > 0) {
      const timeoutId = setTimeout(saveUserData, 1000) // Debounce saves
      return () => clearTimeout(timeoutId)
    }
  }, [gameData, userStats, recentSessions, user, isLoading])

  const updateGameData = async (gameId: string, score: number, metrics: any) => {
    const sessionId = `${gameId}_${Date.now()}`
    const sessionDate = new Date().toISOString()

    // Clean metrics to ensure no undefined values
    const cleanedMetrics = cleanDataForFirestore(metrics || {})

    // Create a new session record
    const newSession: GameSession = {
      id: sessionId,
      gameId,
      score,
      date: sessionDate,
      metrics: cleanedMetrics,
    }

    // Update recent sessions (keep last 20)
    setRecentSessions((prev) => {
      const updated = [newSession, ...prev].slice(0, 20)
      return updated
    })

    setGameData((prev) => {
      const currentGame = prev[gameId] || { bestScore: 0, timesPlayed: 0, history: [] }
      const newHistoryEntry = {
        id: sessionId,
        score,
        level: cleanedMetrics.level || 0,
        accuracy: cleanedMetrics.accuracy || 0,
        date: sessionDate,
        levelTimes: cleanedMetrics.levelTimes || [],
        totalSessionTime: cleanedMetrics.totalSessionTime || 0,
        averageTimePerLevel: cleanedMetrics.averageTimePerLevel || 0,
        metrics: cleanedMetrics,
      }

      if (gameId === "memory" && cleanedMetrics.levelTimes) {
        // Memory game specific updates
        const updatedLevelTimes = [...(currentGame.levelTimes || []), ...cleanedMetrics.levelTimes]
        const updatedTotalTimePlayed = (currentGame.totalTimePlayed || 0) + (cleanedMetrics.totalSessionTime || 0)

        let updatedFastestLevel = currentGame.fastestLevel
        const sessionFastest = cleanedMetrics.fastestLevel
        if (sessionFastest && (!updatedFastestLevel || sessionFastest.time < updatedFastestLevel.time)) {
          updatedFastestLevel = sessionFastest
        }

        const totalTime = updatedLevelTimes.reduce((sum, lt) => sum + (lt.time || 0), 0)
        const averageTimePerLevel = updatedLevelTimes.length > 0 ? totalTime / updatedLevelTimes.length : 0

        return {
          ...prev,
          [gameId]: {
            ...currentGame,
            bestScore: Math.max(currentGame.bestScore || 0, score),
            bestLevel: Math.max(currentGame.bestLevel || 0, cleanedMetrics.level || 0),
            timesPlayed: (currentGame.timesPlayed || 0) + 1,
            history: [...(currentGame.history || []), newHistoryEntry],
            levelTimes: updatedLevelTimes,
            averageTimePerLevel: averageTimePerLevel,
            fastestLevel: updatedFastestLevel,
            totalTimePlayed: updatedTotalTimePlayed,
            lastPlayed: sessionDate,
          },
        }
      }

      if (gameId === "reaction" && cleanedMetrics.bestReactionTime) {
        // Reaction game specific updates
        const reactionTimes = [...(currentGame.reactionTimes || []), ...(cleanedMetrics.reactionTimes || [])]
        const fastestRounds = [...(currentGame.fastestRounds || [])]

        if (cleanedMetrics.reactionTimes && Array.isArray(cleanedMetrics.reactionTimes)) {
          cleanedMetrics.reactionTimes.forEach((time: number, index: number) => {
            const roundNumber = index + 1
            const existingFastestRound = fastestRounds.find((r) => r.round === roundNumber)

            if (!existingFastestRound || time < existingFastestRound.time) {
              const filteredRounds = fastestRounds.filter((r) => r.round !== roundNumber)
              filteredRounds.push({
                round: roundNumber,
                time: time,
                date: sessionDate,
              })
              fastestRounds.splice(0, fastestRounds.length, ...filteredRounds.sort((a, b) => a.round - b.round))
            }
          })
        }

        const previousAvg = currentGame.avgReactionTime || 999
        const newAvg = cleanedMetrics.avgReactionTime || previousAvg
        const improvement = previousAvg > newAvg ? ((previousAvg - newAvg) / previousAvg) * 100 : 0

        return {
          ...prev,
          [gameId]: {
            ...currentGame,
            bestScore: Math.max(currentGame.bestScore || 0, score),
            timesPlayed: (currentGame.timesPlayed || 0) + 1,
            bestReactionTime: Math.min(currentGame.bestReactionTime || 999, cleanedMetrics.bestReactionTime),
            avgReactionTime: newAvg,
            history: [...(currentGame.history || []), newHistoryEntry],
            lastPlayed: sessionDate,
            reactionTimes: reactionTimes,
            fastestRounds: fastestRounds,
            totalRoundsPlayed: (currentGame.totalRoundsPlayed || 0) + (cleanedMetrics.roundsCompleted || 0),
            improvement: improvement.toFixed(1),
          },
        }
      }

      if (gameId === "attention" && cleanedMetrics.accuracy) {
        // Attention game specific updates
        return {
          ...prev,
          [gameId]: {
            ...currentGame,
            bestScore: Math.max(currentGame.bestScore || 0, score),
            timesPlayed: (currentGame.timesPlayed || 0) + 1,
            accuracy: Math.max(currentGame.accuracy || 0, cleanedMetrics.accuracy),
            history: [...(currentGame.history || []), newHistoryEntry],
            lastPlayed: sessionDate,
          },
        }
      }

      // Generic game update
      return {
        ...prev,
        [gameId]: {
          ...currentGame,
          bestScore: Math.max(currentGame.bestScore || 0, score),
          bestLevel: Math.max(currentGame.bestLevel || 0, cleanedMetrics.level || 0),
          timesPlayed: (currentGame.timesPlayed || 0) + 1,
          history: [...(currentGame.history || []), newHistoryEntry],
          lastPlayed: sessionDate,
        },
      }
    })

    // Update aggregate user stats
    setUserStats((prev) => {
      const gamesPlayedByType = { ...prev.gamesPlayedByType }
      gamesPlayedByType[gameId] = (gamesPlayedByType[gameId] || 0) + 1

      return {
        ...prev,
        totalScore: (prev.totalScore || 0) + score,
        gamesPlayed: (prev.gamesPlayed || 0) + 1,
        sessionsCompleted: (prev.sessionsCompleted || 0) + 1,
        gamesPlayedByType,
        totalTime: (prev.totalTime || 0) + Math.round((cleanedMetrics.totalSessionTime || 0) / 60000),
        avgReactionTime:
          gameId === "reaction" && cleanedMetrics.avgReactionTime
            ? Math.round(
                ((prev.avgReactionTime || 0) * (prev.gamesPlayed || 0) + cleanedMetrics.avgReactionTime) /
                  ((prev.gamesPlayed || 0) + 1),
              )
            : prev.avgReactionTime || 0,
        lastActive: sessionDate,
      }
    })
  }

  return {
    gameData,
    userStats,
    updateGameData,
    recentSessions,
    isLoading,
    error,
  }
}
