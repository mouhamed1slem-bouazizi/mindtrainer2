"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export function useFirestoreRealtime<T>(collection: string, documentId: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    console.log("useFirestoreRealtime: Starting effect", { user: !!user, documentId, collection })

    // If no user, return default data immediately
    if (!user || !documentId) {
      console.log("useFirestoreRealtime: No user or documentId, using defaults")
      setData(defaultValue)
      setLoading(false)
      setError(null)
      return
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("useFirestoreRealtime: Timeout reached, using default data")
      setData(defaultValue)
      setLoading(false)
      setError("Loading timeout - using default data")
    }, 5000) // 5 second timeout

    setLoading(true)
    setError(null)

    try {
      // Create a reference to the document
      const docRef = doc(db, collection, documentId)
      console.log("useFirestoreRealtime: Created doc ref", docRef.path)

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          clearTimeout(timeoutId)
          console.log("useFirestoreRealtime: Snapshot received", { exists: doc.exists(), id: doc.id })

          if (doc.exists()) {
            const docData = doc.data() as T
            console.log("useFirestoreRealtime: Document data", docData)
            setData(docData)
          } else {
            console.log("useFirestoreRealtime: Document doesn't exist, using defaults")
            setData(defaultValue)
          }
          setLoading(false)
          setError(null)
        },
        (err) => {
          clearTimeout(timeoutId)
          console.error("useFirestoreRealtime: Snapshot error", err)
          setError(`Firestore error: ${err.message}`)
          setData(defaultValue) // Use default data on error
          setLoading(false)
        },
      )

      // Clean up listener and timeout on unmount
      return () => {
        clearTimeout(timeoutId)
        unsubscribe()
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error("useFirestoreRealtime: Setup error", err)
      setError(`Setup error: ${err instanceof Error ? err.message : "Unknown error"}`)
      setData(defaultValue)
      setLoading(false)
    }
  }, [user, collection, documentId])

  return { data, loading, error }
}
