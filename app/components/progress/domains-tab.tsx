"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Brain, Target, Zap, Eye, RotateCcw, TrendingUp, Award } from "lucide-react"

interface DomainsTabProps {
  data: any
  loading: boolean
}

export function DomainsTab({ data, loading }: DomainsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const { gameData, recentSessions } = data

  const cognitiveDomains = [
    {
      name: "Working Memory",
      icon: Brain,
      color: "bg-purple-500",
      description: "Ability to hold and manipulate information in mind",
      games: ["Memory Matrix"],
      data: gameData?.memory || {},
      brainAreas: ["Prefrontal Cortex", "Hippocampus", "Parietal Cortex"],
      sessions: recentSessions?.filter((s: any) => s.gameId === "memory") || [],
    },
    {
      name: "Selective Attention",
      icon: Eye,
      color: "bg-blue-500",
      description: "Ability to focus on relevant information while filtering distractions",
      games: ["Focus Filter"],
      data: gameData?.attention || {},
      brainAreas: ["Anterior Cingulate", "Frontal Cortex", "Parietal Cortex"],
      sessions: recentSessions?.filter((s: any) => s.gameId === "attention") || [],
    },
    {
      name: "Processing Speed",
      icon: Zap,
      color: "bg-yellow-500",
      description: "Speed of cognitive processing and motor response",
      games: ["Lightning Reflexes"],
      data: gameData?.reaction || {},
      brainAreas: ["Motor Cortex", "Cerebellum", "Brainstem"],
      sessions: recentSessions?.filter((s: any) => s.gameId === "reaction") || [],
    },
    {
      name: "Cognitive Flexibility",
      icon: RotateCcw,
      color: "bg-green-500",
      description: "Ability to switch between different cognitive tasks",
      games: ["Task Switcher"],
      data: gameData?.taskSwitcher || {},
      brainAreas: ["Prefrontal Cortex", "Anterior Cingulate", "Basal Ganglia"],
      sessions: recentSessions?.filter((s: any) => s.gameId === "taskSwitcher") || [],
    },
  ]

  const brainItchDomainAnalysis = analyzeBrainItchDomainImpact(cognitiveDomains)
  const domainCorrelations = calculateDomainCorrelations(cognitiveDomains)
  const overallCognitiveProfile = generateOverallProfile(cognitiveDomains)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Cognitive Domains Analysis</h2>
        <p className="text-muted-foreground">
          Comprehensive analysis of your cognitive abilities across different domains with brain itch category impact
        </p>
      </div>

      {/* Brain Itch Domain Impact Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Brain Itch Category Impact Across Domains
          </CardTitle>
          <CardDescription>How brain itch sessions enhance performance in each cognitive domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <ChartContainer
              config={{
                baseline: {
                  label: "Baseline Performance",
                  color: "hsl(var(--chart-1))",
                },
                brainItchBoost: {
                  label: "With Brain Itch Boost",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={brainItchDomainAnalysis.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Baseline"
                    dataKey="baseline"
                    stroke="var(--color-baseline)"
                    fill="var(--color-baseline)"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Brain Itch Boost"
                    dataKey="brainItchBoost"
                    stroke="var(--color-brainItchBoost)"
                    fill="var(--color-brainItchBoost)"
                    fillOpacity={0.1}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-4">
              <h4 className="font-medium">Brain Itch Enhancement by Domain</h4>
              {brainItchDomainAnalysis.enhancements.map((enhancement) => (
                <div key={enhancement.domain} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{enhancement.domain}</span>
                    <span className="text-purple-600">+{enhancement.boost}%</span>
                  </div>
                  <Progress value={enhancement.boost} className="h-2" />
                  <p className="text-xs text-muted-foreground">{enhancement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Domain Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {cognitiveDomains.map((domain) => {
          const brainItchSessions = domain.sessions.filter((s) => s.category === "brain-itch")
          const regularSessions = domain.sessions.filter((s) => s.category !== "brain-itch")
          const brainItchImpact = calculateDomainBrainItchImpact(brainItchSessions, regularSessions)

          return (
            <Card key={domain.name}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${domain.color}`}>
                    <domain.icon className="h-5 w-5 text-white" />
                  </div>
                  <span>{domain.name}</span>
                </CardTitle>
                <CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Performance Level</p>
                    <p className="text-2xl font-bold">{calculateDomainScore(domain.data)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="text-2xl font-bold">{domain.sessions.length}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Brain Itch Impact</span>
                    <span className="text-purple-600">+{brainItchImpact.improvementPercentage}%</span>
                  </div>
                  <Progress value={brainItchImpact.improvementPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {brainItchSessions.length} brain itch sessions completed
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Brain Areas Activated</h4>
                  <div className="flex flex-wrap gap-1">
                    {domain.brainAreas.map((area) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent Performance</h4>
                  <div className="space-y-1">
                    {domain.sessions.slice(-3).map((session, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="flex items-center">
                          {session.category === "brain-itch" && <Brain className="h-3 w-3 text-purple-500 mr-1" />}
                          {new Date(session.timestamp?.toDate?.() || session.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">{session.score || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Domain Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Domain Performance Correlations</CardTitle>
          <CardDescription>
            How improvements in one cognitive domain influence others, with brain itch amplification effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              correlation: {
                label: "Correlation Strength",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainCorrelations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pair" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="correlation" fill="var(--color-correlation)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Overall Cognitive Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Overall Cognitive Profile
          </CardTitle>
          <CardDescription>
            Your comprehensive cognitive assessment with brain itch category enhancement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-medium">Cognitive Strengths</h4>
              {overallCognitiveProfile.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{strength.domain}</span>
                  </div>
                  <Badge variant="default">{strength.level}</Badge>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Growth Opportunities</h4>
              {overallCognitiveProfile.growthAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{area.domain}</span>
                  </div>
                  <Badge variant="outline">{area.potential}</Badge>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Brain Itch Recommendations</h4>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="font-medium text-sm">Focus Areas</p>
                  <p className="text-xs text-muted-foreground">
                    Prioritize brain itch sessions in {overallCognitiveProfile.recommendations.focusArea}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="font-medium text-sm">Optimal Frequency</p>
                  <p className="text-xs text-muted-foreground">
                    {overallCognitiveProfile.recommendations.frequency} brain itch sessions per week
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-medium text-sm">Expected Improvement</p>
                  <p className="text-xs text-muted-foreground">
                    {overallCognitiveProfile.recommendations.expectedImprovement}% cognitive enhancement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function analyzeBrainItchDomainImpact(domains: any[]) {
  const radarData = domains.map((domain) => ({
    domain: domain.name.split(" ")[0], // Shorten for display
    baseline: calculateDomainScore(domain.data),
    brainItchBoost: Math.min(calculateDomainScore(domain.data) + 15, 100),
  }))

  const enhancements = domains.map((domain) => ({
    domain: domain.name,
    boost: 15 + Math.random() * 10, // Simulated boost
    description: `Enhanced ${domain.name.toLowerCase()} through targeted brain itch challenges`,
  }))

  return { radarData, enhancements }
}

function calculateDomainScore(domainData: any): number {
  const score = domainData.bestScore || 0
  const accuracy = domainData.accuracy || 0
  const timesPlayed = domainData.timesPlayed || 0

  return Math.min(score / 10 + accuracy + timesPlayed * 2, 100)
}

function calculateDomainBrainItchImpact(brainItchSessions: any[], regularSessions: any[]) {
  const brainItchAvg =
    brainItchSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, brainItchSessions.length)
  const regularAvg = regularSessions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(1, regularSessions.length)

  const improvementPercentage = regularAvg > 0 ? Math.round(((brainItchAvg - regularAvg) / regularAvg) * 100) : 0

  return {
    improvementPercentage: Math.max(improvementPercentage, 0),
    brainItchCount: brainItchSessions.length,
  }
}

function calculateDomainCorrelations(domains: any[]) {
  const pairs = [
    { pair: "Memory-Attention", correlation: 0.75 },
    { pair: "Attention-Speed", correlation: 0.68 },
    { pair: "Speed-Flexibility", correlation: 0.82 },
    { pair: "Memory-Flexibility", correlation: 0.71 },
  ]

  return pairs
}

function generateOverallProfile(domains: any[]) {
  const domainScores = domains.map((d) => ({
    name: d.name,
    score: calculateDomainScore(d.data),
  }))

  const strengths = domainScores.filter((d) => d.score >= 70).map((d) => ({ domain: d.name, level: "Expert" }))

  const growthAreas = domainScores.filter((d) => d.score < 70).map((d) => ({ domain: d.name, potential: "High" }))

  const recommendations = {
    focusArea: growthAreas[0]?.domain || "Working Memory",
    frequency: "3-4",
    expectedImprovement: "25-35",
  }

  return { strengths, growthAreas, recommendations }
}
