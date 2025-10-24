"use client"

import * as React from "react"
import { SimulationCard, SimulationSession } from "./simulation-card"
import { Button } from "@/components/ui/button"
import { Plus, Target, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationGridProps {
  simulations: SimulationSession[]
  onSimulationClick: (simulation: SimulationSession) => void
  onNewSimulation: () => void
  className?: string
  // Performance optimization props
  itemsPerPage?: number
  enablePagination?: boolean
  enableLazyLoading?: boolean
}

export function SimulationGrid({ 
  simulations, 
  onSimulationClick, 
  onNewSimulation,
  className,
  itemsPerPage = 12,
  enablePagination = true,
  enableLazyLoading = false
}: SimulationGridProps) {
  // Pagination state
  const [ongoingPage, setOngoingPage] = React.useState(1)
  const [completedPage, setCompletedPage] = React.useState(1)
  
  // Separate simulations by status
  const completedSimulations = React.useMemo(() => 
    simulations.filter(sim => sim.status === 'completed'), [simulations]
  )
  const ongoingSimulations = React.useMemo(() => 
    simulations.filter(sim => sim.status === 'ongoing' || sim.status === 'paused'), [simulations]
  )

  // Pagination logic
  const paginateItems = (items: SimulationSession[], page: number) => {
    if (!enablePagination) return items
    const startIndex = (page - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)
  }

  const paginatedOngoing = paginateItems(ongoingSimulations, ongoingPage)
  const paginatedCompleted = paginateItems(completedSimulations, completedPage)

  const ongoingTotalPages = Math.ceil(ongoingSimulations.length / itemsPerPage)
  const completedTotalPages = Math.ceil(completedSimulations.length / itemsPerPage)

  // Pagination component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    label 
  }: { 
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    label: string
  }) => {
    if (!enablePagination || totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t simulation-border-primary">
        <p className="text-sm simulation-text-secondary">
          Page {currentPage} of {totalPages} • {label}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full simulation-bg-secondary border-2 simulation-border-primary flex items-center justify-center mb-4 sm:mb-6">
        <Target className="h-6 w-6 sm:h-8 sm:w-8 simulation-text-secondary" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold simulation-text-primary mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base simulation-text-secondary max-w-sm sm:max-w-md leading-relaxed">{description}</p>
    </div>
  )

  return (
    <div className={cn("spacing-section", className)}>
      {/* Start New Simulation Button - Prominent placement */}
      <div className="flex justify-center">
        <Button
          onClick={onNewSimulation}
          size="lg"
          className={cn(
            "h-12 sm:h-14 px-6 sm:px-8 md:px-12 text-sm sm:text-base md:text-lg font-bold",
            "bg-black text-white dark:bg-white dark:text-black",
            "border-2 border-black dark:border-white",
            "hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95",
            "shadow-lg hover:shadow-xl",
            "focus-ring-primary",
            "rounded-lg"
          )}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3" />
          <span className="hidden xs:inline">Start New Simulation</span>
          <span className="xs:hidden">New Simulation</span>
        </Button>
      </div>

      {/* Ongoing Simulations Section */}
      <section className="spacing-content">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold simulation-text-primary">
              Ongoing Simulations
            </h2>
            {ongoingSimulations.length > 0 && (
              <span className={cn(
                "px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
                "bg-black text-white dark:bg-white dark:text-black",
                "border-2 border-black dark:border-white",
                "flex-shrink-0"
              )}>
                {ongoingSimulations.length}
              </span>
            )}
          </div>
        </div>
        
        {ongoingSimulations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {paginatedOngoing.map((simulation) => (
                <SimulationCard
                  key={simulation.id}
                  simulation={simulation}
                  onClick={onSimulationClick}
                  enableLazyLoading={enableLazyLoading}
                />
              ))}
            </div>
            <PaginationControls
              currentPage={ongoingPage}
              totalPages={ongoingTotalPages}
              onPageChange={setOngoingPage}
              label={`${ongoingSimulations.length} ongoing simulation${ongoingSimulations.length !== 1 ? 's' : ''}`}
            />
          </>
        ) : (
          <EmptyState
            title="No ongoing simulations"
            description="Start a new simulation to begin practicing your skills and tracking your progress."
          />
        )}
      </section>

      {/* Completed Simulations Section */}
      <section className="spacing-content">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold simulation-text-primary">
              Completed Simulations
            </h2>
            {completedSimulations.length > 0 && (
              <span className={cn(
                "px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
                "bg-black text-white dark:bg-white dark:text-black",
                "border-2 border-black dark:border-white",
                "flex-shrink-0"
              )}>
                {completedSimulations.length}
              </span>
            )}
          </div>
        </div>
        
        {completedSimulations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {paginatedCompleted.map((simulation) => (
                <SimulationCard
                  key={simulation.id}
                  simulation={simulation}
                  onClick={onSimulationClick}
                  enableLazyLoading={enableLazyLoading}
                />
              ))}
            </div>
            <PaginationControls
              currentPage={completedPage}
              totalPages={completedTotalPages}
              onPageChange={setCompletedPage}
              label={`${completedSimulations.length} completed simulation${completedSimulations.length !== 1 ? 's' : ''}`}
            />
          </>
        ) : (
          <EmptyState
            title="No completed simulations"
            description="Complete your ongoing simulations to see them here and review your results."
          />
        )}
      </section>
    </div>
  )
}