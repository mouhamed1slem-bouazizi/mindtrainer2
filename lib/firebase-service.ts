import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface GameSession {
  id?: string
  userId: string
  gameId: string
  score: number
  duration: number
  timestamp: Date | Timestamp
  level?: number
  accuracy?: number
  reactionTime?: number
  metadata?: any
}

export interface UserGameData {
  memory: {
    bestScore: number
    timesPlayed: number
    bestLevel: number
    history: any[]
    accuracy?: number
    averageTime?: number
  }
  reaction: {
    bestScore: number
    timesPlayed: number
    bestReactionTime: number
    history: any[]
    avgReactionTime: number
    reactionTimes?: number[]
  }
  attention: {
    bestScore: number
    timesPlayed: number
    accuracy: number
    history: any[]
    averageTime?: number
  }
  taskSwitcher: {
    bestScore: number
    timesPlayed: number
    bestLevel: number
    history: any[]
    avgReactionTime?: number
  }
}

export interface UserStats {
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

export class FirebaseService {
  // Get user document (contains all user data including gameData, userStats, recentSessions)
  static async getUserData(userId: string) {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        return {
          gameData: userData.gameData || this.getDefaultGameData(),
          userStats: userData.userStats || this.getDefaultUserStats(),
          recentSessions: userData.recentSessions || [],
          profile: userData.profile || {},
          lastUpdated: userData.lastUpdated,
        }
      } else {
        // Create default user document
        const defaultData = {
          gameData: this.getDefaultGameData(),
          userStats: this.getDefaultUserStats(),
          recentSessions: [],
          profile: {},
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
        }

        await setDoc(userRef, defaultData)
        return defaultData
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      throw error
    }
  }

  // Listen to user data changes in real-time
  static subscribeToUserData(userId: string, callback: (data: any) => void) {
    const userRef = doc(db, "users", userId)

    return onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data()
          callback({
            gameData: userData.gameData || this.getDefaultGameData(),
            userStats: userData.userStats || this.getDefaultUserStats(),
            recentSessions: userData.recentSessions || [],
            profile: userData.profile || {},
            lastUpdated: userData.lastUpdated,
          })
        } else {
          callback({
            gameData: this.getDefaultGameData(),
            userStats: this.getDefaultUserStats(),
            recentSessions: [],
            profile: {},
            lastUpdated: null,
          })
        }
      },
      (error) => {
        console.error("Error listening to user data:", error)
        callback({
          gameData: this.getDefaultGameData(),
          userStats: this.getDefaultUserStats(),
          recentSessions: [],
          profile: {},
          lastUpdated: null,
        })
      },
    )
  }

  // Get game sessions (separate collection for detailed session history)
  static async getGameSessions(userId: string, limitCount = 50) {
    try {
      const sessionsRef = collection(db, "gameSessions")
      const q = query(sessionsRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(limitCount))

      const querySnapshot = await getDocs(q)
      const sessions: GameSession[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        sessions.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(data.timestamp),
        } as GameSession)
      })

      return sessions
    } catch (error) {
      console.error("Error fetching game sessions:", error)
      return []
    }
  }

  // Subscribe to game sessions
  static subscribeToGameSessions(userId: string, callback: (sessions: GameSession[]) => void) {
    const sessionsRef = collection(db, "gameSessions")
    const q = query(sessionsRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(50))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const sessions: GameSession[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          sessions.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(data.timestamp),
          } as GameSession)
        })
        callback(sessions)
      },
      (error) => {
        console.error("Error listening to game sessions:", error)
        callback([])
      },
    )
  }

  // Update user data
  static async updateUserData(userId: string, updates: Partial<any>) {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating user data:", error)
      throw error
    }
  }

  // Save game session
  static async saveGameSession(session: Omit<GameSession, "id">) {
    try {
      const sessionsRef = collection(db, "gameSessions")
      const sessionData = {
        ...session,
        timestamp: serverTimestamp(),
      }

      await setDoc(doc(sessionsRef), sessionData)
    } catch (error) {
      console.error("Error saving game session:", error)
      throw error
    }
  }

  // Default data structures
  static getDefaultGameData(): UserGameData {
    return {
      memory: {
        bestScore: 0,
        timesPlayed: 0,
        bestLevel: 0,
        history: [],
        accuracy: 0,
        averageTime: 0,
      },
      reaction: {
        bestScore: 0,
        timesPlayed: 0,
        bestReactionTime: 999,
        history: [],
        avgReactionTime: 0,
        reactionTimes: [],
      },
      attention: {
        bestScore: 0,
        timesPlayed: 0,
        accuracy: 0,
        history: [],
        averageTime: 0,
      },
      taskSwitcher: {
        bestScore: 0,
        timesPlayed: 0,
        bestLevel: 0,
        history: [],
        avgReactionTime: 0,
      },
    }
  }

  static getDefaultUserStats(): UserStats {
    return {
      totalScore: 0,
      avgReactionTime: 0,
      gamesPlayed: 0,
      streakDays: 0,
      totalTime: 0,
      lastActive: new Date().toISOString(),
      sessionsCompleted: 0,
      gamesPlayedByType: {},
      achievements: [],
    }
  }
}
