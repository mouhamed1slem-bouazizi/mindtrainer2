"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Brain } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Simple timeout to show loading, then redirect to signin
      const timer = setTimeout(() => {
        router.push("/signin")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [mounted, router])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">MindTrainer</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">Cognitive Fitness Coach</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    </div>
  )
}
