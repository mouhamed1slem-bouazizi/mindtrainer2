// Utility function to clean data for Firestore (removes undefined values)
export function cleanDataForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanDataForFirestore).filter((item) => item !== undefined)
  }

  if (typeof obj === "object") {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanDataForFirestore(value)
      }
    }
    return cleaned
  }

  return obj
}

// Utility function to ensure required fields have default values
export function ensureGameDataDefaults(gameData: any) {
  const defaults = {
    memory: {
      bestScore: 0,
      timesPlayed: 0,
      levelTimes: [],
      history: [],
      bestLevel: 0,
      averageTimePerLevel: 0,
      totalTimePlayed: 0,
    },
    reaction: {
      bestScore: 0,
      timesPlayed: 0,
      bestReactionTime: 999,
      history: [],
      avgReactionTime: 0,
      reactionTimes: [],
      fastestRounds: [],
      totalRoundsPlayed: 0,
      levelReached: 1,
      bestStreak: 0,
      levelHistory: [],
    },
    attention: {
      bestScore: 0,
      timesPlayed: 0,
      accuracy: 0,
      history: [],
      fastestRound: null,
      fastestRounds: [],
      averageTimePerTarget: 0,
      focusEfficiency: 0,
      consistencyScore: 0,
      totalTargetsFound: 0,
      totalDistractorsClicked: 0,
    },
    taskSwitcher: {
      bestScore: 0,
      timesPlayed: 0,
      bestLevel: 0,
      history: [],
      avgReactionTime: 0,
      bestStreak: 0,
      totalTaskSwitches: 0,
      avgSwitchCost: 0,
      cognitiveFlexibility: 0,
    },
  }

  const cleanedData: any = {}

  for (const [gameId, defaultValues] of Object.entries(defaults)) {
    cleanedData[gameId] = {
      ...defaultValues,
      ...(gameData[gameId] || {}),
    }
  }

  return cleanedData
}

export function ensureUserStatsDefaults(userStats: any) {
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
    ...userStats,
  }
}
