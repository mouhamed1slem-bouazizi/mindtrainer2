"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useFirebaseData } from "@/app/hooks/use-firebase-data"
import { OverviewTab } from "./progress/overview-tab"
import { TrendsTab } from "./progress/trends-tab"
import { GameStatsTab } from "./progress/game-stats-tab"
import { GameDetailsTab } from "./progress/game-details-tab"
import { DomainsTab } from "./progress/domains-tab"
import { InsightsTab } from "./progress/insights-tab"

export function ProgressDashboard() {
  const { user } = useAuth()
  const { data, processedData, loading, error, retry } = useFirebaseData()
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1)
    await retry()
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <div className="text-lg font-medium">Loading your progress...</div>
            <div className="text-sm text-muted-foreground">Fetching session data from Firebase</div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="flex items-center justify-between">
              <div>
                <strong>Failed to load progress data</strong>
                <p className="text-sm mt-1">
                  {error || "There was an error connecting to Firebase. Please try again."}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({retryCount})
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // No user state
  if (!user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to view your progress data.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your cognitive training with brain itch category insights
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live data from Firebase</span>
        </div>
      </div>

      {/* Progress Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="game-stats">Game Stats</TabsTrigger>
          <TabsTrigger value="game-details">Game Details</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab data={data} loading={loading} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendsTab data={data} loading={loading} />
        </TabsContent>

        <TabsContent value="game-stats" className="mt-6">
          <GameStatsTab data={data} loading={loading} />
        </TabsContent>

        <TabsContent value="game-details" className="mt-6">
          <GameDetailsTab data={data} loading={loading} />
        </TabsContent>

        <TabsContent value="domains" className="mt-6">
          <DomainsTab data={data} loading={loading} />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <InsightsTab data={data} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
