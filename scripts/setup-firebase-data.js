// Script to set up initial Firebase data structure
// Run this in your browser console while logged in to create test data

async function setupFirebaseData() {
  const userId = "pWxf0nfiM5ccL2F3pIwWK7HzlI52" // Replace with your user ID

  // Sample user data structure matching your Firebase
  const userData = {
    createdAt: new Date().toISOString(),
    displayName: "Mohamed islem Bouazizi",
    email: "mibaitrainer@gmail.com",
    gameData: {
      attention: {
        accuracy: 100,
        averageTime: 2500,
        bestScore: 85,
        timesPlayed: 12,
        history: [],
      },
      memory: {
        accuracy: 100,
        averageTime: 3200,
        bestScore: 92,
        timesPlayed: 15,
        bestLevel: 8,
        history: [],
      },
      reaction: {
        avgReactionTime: 342.8,
        bestReactionTime: 298,
        bestScore: 78,
        timesPlayed: 20,
        history: [],
      },
      taskSwitcher: {
        avgReactionTime: 0,
        avgSwitchCost: 150,
        bestScore: 65,
        timesPlayed: 8,
        bestLevel: 5,
        history: [],
      },
    },
    lastUpdated: {
      methodName: "serverTimestamp",
    },
    profile: {
      bio: "Cognitive fitness enthusiast",
      dateOfBirth: "1990-01-01",
    },
    recentSessions: [
      {
        score: 5128,
        gameId: "memory",
        timestamp: new Date().toISOString(),
        duration: 180000,
      },
      {
        score: 4892,
        gameId: "reaction",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        duration: 120000,
      },
    ],
    userStats: {
      achievements: [],
      avgReactionTime: 342.8,
      totalScore: 15420,
      gamesPlayed: 55,
      streakDays: 7,
      totalTime: 12600000,
      sessionsCompleted: 55,
    },
  }

  console.log("Sample Firebase data structure:", userData)
  console.log("Copy this structure to your Firebase Console > Firestore Database > users collection")
}

setupFirebaseData()
