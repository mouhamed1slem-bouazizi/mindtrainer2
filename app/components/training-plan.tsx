"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, CheckCircle, Circle, Brain, Zap, Eye } from "lucide-react"

interface TrainingPlanProps {
  userStats: any
}

export function TrainingPlan({ userStats }: TrainingPlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<"7day" | "30day">("7day")

  const sevenDayPlan = [
    {
      day: 1,
      title: "Foundation Day",
      completed: true,
      games: [
        { name: "Memory Matrix", duration: "3 min", icon: Brain, completed: true },
        { name: "Lightning Reflexes", duration: "2 min", icon: Zap, completed: true },
      ],
      focus: "Establish baseline performance",
    },
    {
      day: 2,
      title: "Speed Focus",
      completed: true,
      games: [
        { name: "Lightning Reflexes", duration: "3 min", icon: Zap, completed: true },
        { name: "Focus Filter", duration: "4 min", icon: Eye, completed: true },
      ],
      focus: "Improve reaction time and processing speed",
    },
    {
      day: 3,
      title: "Memory Challenge",
      completed: false,
      games: [
        { name: "Memory Matrix", duration: "4 min", icon: Brain, completed: false },
        { name: "Task Switcher", duration: "3 min", icon: Target, completed: false },
      ],
      focus: "Strengthen working memory capacity",
    },
    {
      day: 4,
      title: "Attention Training",
      completed: false,
      games: [
        { name: "Focus Filter", duration: "5 min", icon: Eye, completed: false },
        { name: "Lightning Reflexes", duration: "2 min", icon: Zap, completed: false },
      ],
      focus: "Enhance selective attention skills",
    },
    {
      day: 5,
      title: "Mixed Practice",
      completed: false,
      games: [
        { name: "Memory Matrix", duration: "3 min", icon: Brain, completed: false },
        { name: "Focus Filter", duration: "3 min", icon: Eye, completed: false },
        { name: "Lightning Reflexes", duration: "2 min", icon: Zap, completed: false },
      ],
      focus: "Integrate multiple cognitive skills",
    },
    {
      day: 6,
      title: "Endurance Test",
      completed: false,
      games: [
        { name: "Task Switcher", duration: "5 min", icon: Target, completed: false },
        { name: "Memory Matrix", duration: "4 min", icon: Brain, completed: false },
      ],
      focus: "Build cognitive stamina",
    },
    {
      day: 7,
      title: "Assessment Day",
      completed: false,
      games: [
        { name: "Lightning Reflexes", duration: "3 min", icon: Zap, completed: false },
        { name: "Memory Matrix", duration: "4 min", icon: Brain, completed: false },
        { name: "Focus Filter", duration: "4 min", icon: Eye, completed: false },
      ],
      focus: "Measure weekly progress",
    },
  ]

  const currentDay = sevenDayPlan.find((day) => !day.completed) || sevenDayPlan[0]

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Training Plan</h2>
        <div className="flex gap-2">
          <Button
            variant={selectedPlan === "7day" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPlan("7day")}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPlan === "30day" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPlan("30day")}
          >
            30 Days
          </Button>
        </div>
      </div>

      {/* Current Day Highlight */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Today's Training</CardTitle>
            <Badge variant="secondary">Day {currentDay.day}</Badge>
          </div>
          <CardDescription>{currentDay.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{currentDay.focus}</p>

            <div className="space-y-2">
              {currentDay.games.map((game, index) => {
                const Icon = game.icon
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{game.name}</p>
                        <p className="text-sm text-gray-500">{game.duration}</p>
                      </div>
                    </div>
                    {game.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )
              })}
            </div>

            <Button className="w-full mt-4">
              {currentDay.completed ? "Review Today's Session" : "Start Today's Training"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">7-Day Plan Overview</CardTitle>
          <CardDescription>Your personalized cognitive training schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sevenDayPlan.map((day) => (
              <div
                key={day.day}
                className={`p-3 rounded-lg border transition-all ${
                  day.day === currentDay.day
                    ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        day.completed
                          ? "bg-green-500 text-white"
                          : day.day === currentDay.day
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {day.completed ? <CheckCircle className="w-4 h-4" /> : day.day}
                    </div>
                    <div>
                      <h3 className="font-medium">{day.title}</h3>
                      <p className="text-sm text-gray-500">{day.focus}</p>
                    </div>
                  </div>
                  <Badge variant={day.completed ? "default" : "secondary"}>{day.games.length} games</Badge>
                </div>

                <div className="flex gap-2 ml-11">
                  {day.games.map((game, index) => {
                    const Icon = game.icon
                    return (
                      <div key={index} className="flex items-center gap-1 text-xs text-gray-500">
                        <Icon className="w-3 h-3" />
                        <span>{game.duration}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customize Your Plan</CardTitle>
          <CardDescription>Adjust training based on your goals and schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="font-medium">Daily Time</p>
                <p className="text-sm text-gray-500">5-10 minutes</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="font-medium">Focus Area</p>
                <p className="text-sm text-gray-500">Memory & Speed</p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Customize Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
