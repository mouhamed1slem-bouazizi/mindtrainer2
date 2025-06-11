"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Lightbulb, Target, Sparkles } from "lucide-react"

interface AICoachProps {
  userStats: any
  gameData: any
}

export function AICoach({ userStats, gameData }: AICoachProps) {
  const [coachMessage, setCoachMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [messageType, setMessageType] = useState<"motivation" | "analysis" | "recommendation">("motivation")

  const fetchCoachMessage = async (type: "motivation" | "analysis" | "recommendation") => {
    setIsLoading(true)
    setMessageType(type)

    try {
      let prompt = ""

      switch (type) {
        case "motivation":
          prompt = `Give a friendly, 2-sentence pep-talk for a user who improved reaction time by 15% and completed 5 training sessions this week. Be encouraging and mention their progress.`
          break
        case "analysis":
          prompt = `Analyze a cognitive training user's performance: reaction time 285ms (improved 15%), memory score 85/100, attention score 72/100. Give 2 sentences explaining their cognitive strengths and areas for improvement.`
          break
        case "recommendation":
          prompt = `Recommend the best cognitive training games for a user with strong memory (85/100) but weaker attention (72/100). Suggest 2 specific game types in 2 sentences.`
          break
      }

      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`)
      const text = await response.text()
      setCoachMessage(text)
    } catch (error) {
      setCoachMessage(
        "I'm here to help you improve your cognitive fitness! Keep up the great work with your training sessions.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCoachMessage("motivation")
  }, [])

  const insights = [
    {
      icon: TrendingUp,
      title: "Performance Trend",
      description: "Your reaction time has improved by 15% this week",
      color: "text-green-500",
    },
    {
      icon: Target,
      title: "Focus Area",
      description: "Attention training could boost your overall score",
      color: "text-blue-500",
    },
    {
      icon: Lightbulb,
      title: "Training Tip",
      description: "Morning sessions show 20% better performance",
      color: "text-yellow-500",
    },
  ]

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold">AI Coach</h2>

      {/* AI Coach Message */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Your AI Coach</CardTitle>
              <CardDescription>Personalized insights and motivation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                <span>Analyzing your progress...</span>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{coachMessage}</p>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={messageType === "motivation" ? "default" : "outline"}
                onClick={() => fetchCoachMessage("motivation")}
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Motivate Me
              </Button>
              <Button
                size="sm"
                variant={messageType === "analysis" ? "default" : "outline"}
                onClick={() => fetchCoachMessage("analysis")}
                disabled={isLoading}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Analyze
              </Button>
              <Button
                size="sm"
                variant={messageType === "recommendation" ? "default" : "outline"}
                onClick={() => fetchCoachMessage("recommendation")}
                disabled={isLoading}
              >
                <Target className="w-4 h-4 mr-1" />
                Recommend
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smart Insights</CardTitle>
          <CardDescription>AI-powered analysis of your training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                  <div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Recommendations</CardTitle>
          <CardDescription>Optimized for your cognitive profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Focus Filter Challenge</h3>
                <Badge>High Priority</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Your attention scores suggest this game will provide the most benefit today.
              </p>
              <Button size="sm" className="w-full">
                Start Game
              </Button>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Memory Matrix (Hard)</h3>
                <Badge variant="secondary">Skill Building</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ready to challenge your memory with increased difficulty.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Start Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Neuroscience Corner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Neuroscience Corner</CardTitle>
          <CardDescription>Learn about your brain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Working Memory</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your prefrontal cortex acts like a mental workspace, holding and manipulating information. Memory games
                strengthen these neural networks.
              </p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Reaction Time</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Faster reactions indicate efficient communication between your visual cortex and motor cortex. Regular
                training can improve this by up to 20%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
