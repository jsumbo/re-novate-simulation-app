"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SimulationGrid } from "@/components/simulation/simulation-grid"
import { SimulationSession } from "@/lib/types"
import { toast } from "sonner"

interface SimulationsPageClientProps {
  simulations: SimulationSession[]
}

export function SimulationsPageClient({ simulations }: SimulationsPageClientProps) {
  const router = useRouter()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  // Memoize simulations to prevent unnecessary re-renders
  const memoizedSimulations = useMemo(() => simulations, [simulations])

  // Determine if we should enable performance optimizations based on simulation count
  const shouldOptimize = simulations.length > 20
  const enablePagination = shouldOptimize
  const enableLazyLoading = simulations.length > 50

  // Handle simulation card clicks with visual feedback
  const handleSimulationClick = useCallback(async (simulation: SimulationSession) => {
    try {
      // Prevent double clicks
      if (navigatingTo) return

      setNavigatingTo(simulation.id)

      // Provide user feedback about the action
      if (simulation.status === 'completed') {
        toast.success("Opening simulation results...")
        // Navigate to review/results page - for now go to dashboard
        router.push("/student/dashboard")
      } else {
        toast.success("Continuing simulation...")
        // Navigate to continue simulation using session ID
        router.push(`/student/scenario?session=${simulation.id}`)
      }
    } catch (error) {
      console.error("Error navigating to simulation:", error)
      toast.error("Failed to open simulation. Please try again.")
      setNavigatingTo(null)
    }
  }, [navigatingTo, router])

  // Handle new simulation button click with feedback
  const handleNewSimulation = useCallback(async () => {
    try {
      // Prevent double clicks
      if (navigatingTo) return

      setNavigatingTo("new")
      toast.success("Starting new simulation...")
      router.push("/student/scenario")
    } catch (error) {
      console.error("Error starting new simulation:", error)
      toast.error("Failed to start new simulation. Please try again.")
      setNavigatingTo(null)
    }
  }, [navigatingTo, router])

  return (
    <SimulationGrid
      simulations={memoizedSimulations}
      onSimulationClick={handleSimulationClick}
      onNewSimulation={handleNewSimulation}
      enablePagination={enablePagination}
      enableLazyLoading={enableLazyLoading}
      itemsPerPage={enablePagination ? 12 : undefined}
    />
  )
}