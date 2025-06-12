"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot, collection, query, orderBy, limit, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export function useFirestoreRealtime(userId: string | null) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const defaultData = {
    gameData: {
      memory: { bestScore: 0, timesPlayed: 0, bestLevel: 0, history: [] },
      reaction: { bestScore: 0, timesPlayed: 0, bestReactionTime: 999, history: [] },
      attention: { bestScore: 0, timesPlayed: 0, accuracy: 0, history: [] },
      taskSwitcher: { bestScore: 0, timesPlayed: 0, bestLevel: 0, history: [] },
    },
    userStats: {
      totalScore: 0,
      avgReactionTime: 0,
      gamesPlayed: 0,
      streakDays: 0,
      totalTime: 0,
      lastActive: new Date().toISOString(),
      sessionsCompleted: 0,
      gamesPlayedByType: {},
      achievements: [],
    },
    recentSessions: [],
    sessionHistory: [],
    processedData: {
      dailyScores: generateEmptyDailyScores(),
      gamePerformance: generateEmptyGamePerformance(),
      trainingFrequency: generateEmptyTrainingFrequency(),
      weeklyStats: { totalSessions: 0, totalScore: 0, avgScore: 0, gameStats: {}, period: "7 days" },
      monthlyStats: { totalSessions: 0, totalScore: 0, avgScore: 0, gameStats: {}, period: "30 days" },
    },
  }

  const retry = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    console.log("useFirestoreRealtime: Starting effect", { user: !!user, userId })

    // If no user, return default data immediately
    if (!user || !userId) {
      console.log("useFirestoreRealtime: No user or userId, using defaults")
      setData(defaultData)
      setLoading(false)
      setError(null)
      return
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("useFirestoreRealtime: Timeout reached, using default data")
      setData(defaultData)
      setLoading(false)
      setError("Loading timeout - using default data")
    }, 8000) // 8 second timeout

    setLoading(true)
    setError(null)

    const unsubscribers: (() => void)[] = []

    // Initialize with default data
    setData(defaultData)

    try {
      // Try to listen to game data with error handling
      const gameDataRef = doc(db, "gameData", userId)

      const gameDataUnsubscribe = onSnapshot(
        gameDataRef,
        (doc) => {
          console.log("Game data snapshot received", { exists: doc.exists(), id: doc.id })

          let gameData = {}
          if (doc.exists()) {
            gameData = doc.data() || {}
          }

          // Update data with game data
          setData((prevData: any) => ({
            ...prevData,
            gameData: {
              memory: gameData.memory || defaultData.gameData.memory,
              reaction: gameData.reaction || defaultData.gameData.reaction,
              attention: gameData.attention || defaultData.gameData.attention,
              taskSwitcher: gameData.taskSwitcher || defaultData.gameData.taskSwitcher,
            },
          }))
        },
        (err) => {
          console.warn("Game data snapshot error (using defaults):", err.message)
          // Don't set this as a critical error, just use defaults
          setData((prevData: any) => ({
            ...prevData,
            gameData: defaultData.gameData,
          }))
        },
      )
      unsubscribers.push(gameDataUnsubscribe)

      // Try to listen to user stats with error handling
      const userStatsRef = doc(db, "userStats", userId)

      const userStatsUnsubscribe = onSnapshot(
        userStatsRef,
        (doc) => {
          console.log("User stats snapshot received", { exists: doc.exists(), id: doc.id })

          let userStats = {}
          if (doc.exists()) {
            userStats = doc.data() || {}
          }

          setData((prevData: any) => ({
            ...prevData,
            userStats: {
              totalScore: userStats.totalScore || 0,
              avgReactionTime: userStats.avgReactionTime || 0,
              gamesPlayed: userStats.gamesPlayed || 0,
              streakDays: userStats.streakDays || 0,
              totalTime: userStats.totalTime || 0,
              lastActive: userStats.lastActive || new Date().toISOString(),
              sessionsCompleted: userStats.sessionsCompleted || 0,
              gamesPlayedByType: userStats.gamesPlayedByType || {},
              achievements: userStats.achievements || [],
            },
          }))
        },
        (err) => {
          console.warn("User stats snapshot error (using defaults):", err.message)
          // Don't set this as a critical error, just use defaults
          setData((prevData: any) => ({
            ...prevData,
            userStats: defaultData.userStats,
          }))
        },
      )
      unsubscribers.push(userStatsUnsubscribe)

      // Try to listen to sessions with error handling
      try {
        const sessionsRef = collection(db, "gameSessions")
        const sessionsQuery = query(sessionsRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(50))

        const sessionsUnsubscribe = onSnapshot(
          sessionsQuery,
          (querySnapshot) => {
            console.log("Sessions snapshot received", { size: querySnapshot.size })

            const sessions = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp || Date.now()),
            }))

            // Process sessions for trends and analytics
            const processedSessions = processSessions(sessions)

            setData((prevData: any) => ({
              ...prevData,
              recentSessions: sessions.slice(0, 10),
              sessionHistory: sessions,
              processedData: processedSessions,
            }))

            clearTimeout(timeoutId)
            setLoading(false)
            setError(null)
          },
          (err) => {
            console.warn("Sessions snapshot error (using defaults):", err.message)
            // Use default processed data
            setData((prevData: any) => ({
              ...prevData,
              recentSessions: [],
              sessionHistory: [],
              processedData: defaultData.processedData,
            }))

            clearTimeout(timeoutId)
            setLoading(false)
            setError(null) // Don't show error for missing sessions
          },
        )
        unsubscribers.push(sessionsUnsubscribe)
      } catch (sessionsError) {
        console.warn("Sessions setup error:", sessionsError)
        // Continue without sessions data
        setData((prevData: any) => ({
          ...prevData,
          recentSessions: [],
          sessionHistory: [],
          processedData: defaultData.processedData,
        }))

        clearTimeout(timeoutId)
        setLoading(false)
        setError(null)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error("useFirestoreRealtime: Setup error", err)
      setData(defaultData)
      setLoading(false)
      setError(null) // Don't show setup errors to user
    }

    // Clean up listeners and timeout on unmount
    return () => {
      clearTimeout(timeoutId)
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [user, userId])

  return { data, loading, error, retry }
}

// Helper functions for generating empty data structures
function generateEmptyDailyScores() {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      totalScore: 0,
      sessionCount: 0,
    }
  })
}

function generateEmptyGamePerformance() {
  const gameTypes = ["memory", "reaction", "attention", "taskSwitcher"]
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const result: any = {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    }
    gameTypes.forEach((game) => {
      result[game] = 0
    })
    return result
  })
}

function generateEmptyTrainingFrequency() {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      sessions: 0,
    }
  })
}

// Helper function to process sessions for analytics
function processSessions(sessions: any[]) {
  if (!sessions || sessions.length === 0) {
    return {
      dailyScores: generateEmptyDailyScores(),
      gamePerformance: generateEmptyGamePerformance(),
      trainingFrequency: generateEmptyTrainingFrequency(),
      weeklyStats: { totalSessions: 0, totalScore: 0, avgScore: 0, gameStats: {}, period: "7 days" },
      monthlyStats: { totalSessions: 0, totalScore: 0, avgScore: 0, gameStats: {}, period: "30 days" },
    }
  }

  // Sort sessions by date
  const sortedSessions = sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Generate daily scores for the last 30 days
  const dailyScores = generateDailyScores(sortedSessions)

  // Generate game performance data
  const gamePerformance = generateGamePerformance(sortedSessions)

  // Generate training frequency data
  const trainingFrequency = generateTrainingFrequency(sortedSessions)

  // Calculate weekly and monthly stats
  const weeklyStats = calculatePeriodStats(sortedSessions, 7)
  const monthlyStats = calculatePeriodStats(sortedSessions, 30)

  return {
    dailyScores,
    gamePerformance,
    trainingFrequency,
    weeklyStats,
    monthlyStats,
  }
}

function generateDailyScores(sessions: any[]) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      fullDate: date.toDateString(),
      totalScore: 0,
      sessionCount: 0,
    }
  })

  sessions.forEach((session) => {
    const sessionDate = new Date(session.date).toDateString()
    const dayData = last30Days.find((day) => day.fullDate === sessionDate)
    if (dayData) {
      dayData.totalScore += session.score || 0
      dayData.sessionCount += 1
    }
  })

  return last30Days.map((day) => ({
    date: day.date,
    totalScore: day.totalScore,
    sessionCount: day.sessionCount,
  }))
}

function generateGamePerformance(sessions: any[]) {
  const gameTypes = ["memory", "reaction", "attention", "taskSwitcher"]
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const result: any = {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      fullDate: date.toDateString(),
    }
    gameTypes.forEach((game) => {
      result[game] = 0
    })
    return result
  })

  sessions.forEach((session) => {
    const sessionDate = new Date(session.date).toDateString()
    const dayData = last30Days.find((day) => day.fullDate === sessionDate)
    if (dayData && session.gameId) {
      dayData[session.gameId] += session.score || 0
    }
  })

  return last30Days.map((day) => {
    const result: any = { date: day.date }
    gameTypes.forEach((game) => {
      result[game] = day[game]
    })
    return result
  })
}

function generateTrainingFrequency(sessions: any[]) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      fullDate: date.toDateString(),
      sessions: 0,
    }
  })

  sessions.forEach((session) => {
    const sessionDate = new Date(session.date).toDateString()
    const dayData = last30Days.find((day) => day.fullDate === sessionDate)
    if (dayData) {
      dayData.sessions += 1
    }
  })

  return last30Days.map((day) => ({
    date: day.date,
    sessions: day.sessions,
  }))
}

function calculatePeriodStats(sessions: any[], days: number) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const periodSessions = sessions.filter((session) => new Date(session.date) >= cutoffDate)

  const totalSessions = periodSessions.length
  const totalScore = periodSessions.reduce((sum, session) => sum + (session.score || 0), 0)
  const avgScore = totalSessions > 0 ? totalScore / totalSessions : 0

  const gameStats = periodSessions.reduce((acc, session) => {
    if (session.gameId) {
      if (!acc[session.gameId]) {
        acc[session.gameId] = { sessions: 0, totalScore: 0, bestScore: 0 }
      }
      acc[session.gameId].sessions += 1
      acc[session.gameId].totalScore += session.score || 0
      acc[session.gameId].bestScore = Math.max(acc[session.gameId].bestScore, session.score || 0)
    }
    return acc
  }, {} as any)

  return {
    totalSessions,
    totalScore,
    avgScore,
    gameStats,
    period: `${days} days`,
  }
}
