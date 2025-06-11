"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import MindTrainer from "../page"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    // This is just a wrapper to ensure we're using the protected route
    // The actual content is in the MindTrainer component
  }, [router])

  return <MindTrainer />
}
