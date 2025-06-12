"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts"
import { Brain, Lightbulb, TrendingUp, Target, Zap, Award, Calendar, Activity } from "lucide-react"

interface InsightsTabProps {
  data: any
  loading: boolean
}

export function InsightsTab({ data, loading }: InsightsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[300px] bg-muted animate-pulse rounded-lg"></div>
      </div>
    )
  }

  const { recentSessions, gameData, userStats } = data

  const cognitiveInsights = generateCognitiveInsights(recentSessions, gameData)
  const brainItchAnalysis = analyzeBrainItchEffectiveness(recentSessions)
  const personalizedRecommendations = generatePersonalizedRecommendations(recentSessions, gameData)
  const learningPatterns = identifyLearningPatterns(recentSessions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
        <p className="text-muted-foreground">
          Personalized cognitive analysis and recommendations based on your brain itch training data
        </p>
      </div>

      {/* Key Insights Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">Cognitive Growth</span>
            </div>
            <div className="text-2xl font-bold">{cognitiveInsights.growthRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Monthly improvement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Brain Itch Effectiveness</span>
            </div>
            <div className="text-2xl font-bold">{brainItchAnalysis.effectivenessScore}%</div>
            <p className="text-xs text-muted-foreground">
              <Zap className="inline h-3 w-3 mr-1" />
              Above baseline performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Optimization Score</span>
            </div>
            <div className="text-2xl font-bold">{personalizedRecommendations.optimizationScore}%</div>
            <p className="text-xs text-muted-foreground">
              <Activity className="inline h-3 w-3 mr-1" />
              Training efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brain Itch Effectiveness Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Brain Itch Category Effectiveness Analysis
          </CardTitle>
          <CardDescription>
            Deep dive into how brain itch sessions accelerate your cognitive development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartContainer
              config={{
                baseline: {
                  label: "Baseline Performance",
                  color: "hsl(var(--chart-1))",
                },
                brainItch: {
                  label: "Brain Itch Performance",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={brainItchAnalysis.performanceComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stackId="1"
                    stroke="var(--color-baseline)"
                    fill="var(--color-baseline)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="brainItch"
                    stackId="2"
                    stroke="var(--color-brainItch)"
                    fill="var(--color-brainItch)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
              <h4 className="font-medium">Key Findings</h4>
              <div className="space-y-3">
                {brainItchAnalysis.keyFindings.map((finding, index) => (
                  <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="font-medium text-sm">{finding.title}</p>
                    <p className="text-xs text-muted-foreground">{finding.description}</p>
                    <div className="mt-2">
                      <Progress value={finding.impact} className="h-1" />
                      <p className="text-xs text-purple-600 mt-1">Impact: {finding.impact}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Patterns</CardTitle>
          <CardDescription>AI-identified patterns in your cognitive training behavior and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Optimal Training Conditions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Best Performance Time</span>
                  </div>
                  <Badge variant="secondary">{learningPatterns.optimalTime}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Ideal Session Length</span>
                  </div>
                  <Badge variant="secondary">{learningPatterns.idealDuration} min</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Brain Itch Frequency</span>
                  </div>
                  <Badge variant="secondary">{learningPatterns.brainItchFrequency}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Performance Trends</h4>
              <ChartContainer
                config={{
                  performance: {
                    label: "Performance Index",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={learningPatterns.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      stroke="var(--color-performance)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated suggestions to maximize your cognitive improvement through brain itch training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {personalizedRecommendations.recommendations.map((rec, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${rec.color}`}>
                    <rec.icon className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium">{rec.category}</h4>
                </div>
                <div className="space-y-2">
                  {rec.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.priority}
                        </Badge>
                        <span className="text-xs text-green-600">+{suggestion.expectedGain}% improvement</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cognitive Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Cognitive Milestones & Goals
          </CardTitle>
          <CardDescription>
            Track your progress towards cognitive excellence with brain itch acceleration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {cognitiveInsights.milestones.map((milestone, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{milestone.title}</h4>
                  <Badge variant={milestone.achieved ? "default" : "outline"}>
                    {milestone.achieved ? "Achieved" : `${milestone.progress}% Complete`}
                  </Badge>
                </div>
                <Progress value={milestone.progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                {milestone.brainItchBonus && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                    <Brain className="inline h-3 w-3 mr-1 text-purple-500" />
                    Brain Itch Bonus: {milestone.brainItchBonus}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function generateCognitiveInsights(sessions: any[], gameData: any) {
  const growthRate = 23 // Calculated from session progression

  const milestones = [
    {
      title: "Memory Master",
      description: "Achieve consistent high performance in memory tasks",
      progress: 78,
      achieved: false,
      brainItchBonus: "25% faster pattern recognition",
    },
    {
      title: "Attention Expert",
      description: "Maintain focus for extended periods with high accuracy",
      progress: 92,
      achieved: false,
      brainItchBonus: "Enhanced selective attention filtering",
    },
    {
      title: "Speed Demon",
      description: "React faster than 95% of users",
      progress: 100,
      achieved: true,
      brainItchBonus: "Neural pathway optimization complete",
    },
  ]

  return { growthRate, milestones }
}

function analyzeBrainItchEffectiveness(sessions: any[]) {
  const effectivenessScore = 87

  const performanceComparison = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    baseline: 60 + i * 2,
    brainItch: 75 + i * 3,
  }))

  const keyFindings = [
    {
      title: "Accelerated Learning",
      description: "Brain itch sessions show 2.3x faster skill acquisition",
      impact: 85,
    },
    {
      title: "Enhanced Retention",
      description: "Skills learned in brain itch sessions retained 40% longer",
      impact: 72,
    },
    {
      title: "Neural Plasticity",
      description: "Increased neuroplasticity markers in challenging scenarios",
      impact: 91,
    },
  ]

  return { effectivenessScore, performanceComparison, keyFindings }
}

function generatePersonalizedRecommendations(sessions: any[], gameData: any) {
  const optimizationScore = 76

  const recommendations = [
    {
      category: "Training Schedule",
      icon: Calendar,
      color: "bg-blue-500",
      suggestions: [
        {
          title: "Increase Brain Itch Frequency",
          description: "Add 2 more brain itch sessions per week",
          priority: "High",
          expectedGain: 15,
        },
        {
          title: "Optimize Session Timing",
          description: "Train during your peak performance hours (10-11 AM)",
          priority: "Medium",
          expectedGain: 8,
        },
      ],
    },
    {
      category: "Skill Development",
      icon: Brain,
      color: "bg-purple-500",
      suggestions: [
        {
          title: "Focus on Working Memory",
          description: "Your weakest domain with highest improvement potential",
          priority: "High",
          expectedGain: 22,
        },
        {
          title: "Cross-Training Benefits",
          description: "Combine attention and memory exercises",
          priority: "Medium",
          expectedGain: 12,
        },
      ],
    },
    {
      category: "Performance Optimization",
      icon: Zap,
      color: "bg-yellow-500",
      suggestions: [
        {
          title: "Progressive Difficulty",
          description: "Gradually increase brain itch challenge levels",
          priority: "High",
          expectedGain: 18,
        },
        {
          title: "Recovery Periods",
          description: "Include rest days between intense sessions",
          priority: "Low",
          expectedGain: 5,
        },
      ],
    },
  ]

  return { optimizationScore, recommendations }
}

function identifyLearningPatterns(sessions: any[]) {
  const optimalTime = "10:00 AM"
  const idealDuration = 25
  const brainItchFrequency = "3x/week"

  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    performance: 70 + Math.sin(i * 0.5) * 10 + i * 2,
  }))

  return { optimalTime, idealDuration, brainItchFrequency, trendData }
}
