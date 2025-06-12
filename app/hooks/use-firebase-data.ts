"use client"

import { useState, useEffect } from "react"
import { FirebaseService } from "@/lib/firebase-service"
import { useAuth } from "@/contexts/auth-context"
import { processSessionsData } from "@/lib/process-sessions-data" // Import the helper function

export function useFirebaseData() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      setData(null)
      setSessions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    let userDataUnsubscribe: (() => void) | null = null
    let sessionsUnsubscribe: (() => void) | null = null

    // Subscribe to user data
    try {
      userDataUnsubscribe = FirebaseService.subscribeToUserData(user.uid, (userData) => {
        console.log("User data received:", userData)
        setData(userData)
        setLoading(false)
      })

      // Subscribe to game sessions
      sessionsUnsubscribe = FirebaseService.subscribeToGameSessions(user.uid, (gameSessions) => {
        console.log("Game sessions received:", gameSessions.length)
        setSessions(gameSessions)
      })
    } catch (err) {
      console.error("Error setting up Firebase subscriptions:", err)
      setError(err instanceof Error ? err.message : "Failed to connect to Firebase")
      setLoading(false)
    }

    // Cleanup subscriptions
    return () => {
      if (userDataUnsubscribe) userDataUnsubscribe()
      if (sessionsUnsubscribe) sessionsUnsubscribe()
    }
  }, [user?.uid])

  const retry = async () => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const userData = await FirebaseService.getUserData(user.uid)
      const gameSessions = await FirebaseService.getGameSessions(user.uid)

      setData(userData)
      setSessions(gameSessions)
      setLoading(false)
    } catch (err) {
      console.error("Error retrying Firebase data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      setLoading(false)
    }
  }

  // Process data for charts and analytics
  const processedData = data && sessions ? processSessionsData(sessions, data) : null

  return {
    data: data ? { ...data, recentSessions: sessions.slice(0, 10), sessionHistory: sessions } : null,
    processedData,
    loading,
    error,
    retry,
  }
}
