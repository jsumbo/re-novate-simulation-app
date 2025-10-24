"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SimulationProgressBar } from "./simulation-progress-bar"
import { cn } from "@/lib/utils"

// Lazy loading hook for performance optimization
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, options])

  return isIntersecting
}

export interface SimulationSession {
  id: string
  user_id: string
  title: string
  description: string
  status: 'ongoing' | 'completed' | 'paused'
  progress: number // 0-100
  current_round: number
  total_rounds: number
  created_at: string
  updated_at: string
}

interface SimulationCardProps {
  simulation: SimulationSession
  onClick: (simulation: SimulationSession) => void
  className?: string
  enableLazyLoading?: boolean
}

export function SimulationCard({ simulation, onClick, className, enableLazyLoading = false }: SimulationCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(cardRef, {
    threshold: 0.1,
    rootMargin: '50px'
  })
  
  // Only render full content when visible (for lazy loading)
  const shouldRenderContent = !enableLazyLoading || isVisible
  const isCompleted = simulation.status === 'completed'
  const progressPercentage = Math.min(Math.max(simulation.progress, 0), 100)
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Skeleton loader for lazy loading
  if (enableLazyLoading && !shouldRenderContent) {
    return (
      <Card 
        ref={cardRef}
        className={cn(
          "simulation-bg-primary border-2 simulation-border-primary",
          "min-h-[280px] sm:min-h-[300px] md:min-h-[320px]",
          "flex flex-col animate-pulse",
          className
        )}
      >
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-5 lg:px-6 flex-shrink-0">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 sm:px-4 md:px-5 lg:px-6 flex-1 flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4 flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      ref={cardRef}
      className={cn(
        // Base styling with consistent theme utilities
        "cursor-pointer simulation-card-hover group",
        "simulation-bg-primary border-2 simulation-border-primary",
        "hover:simulation-border-accent hover:shadow-lg",
        "focus-ring-primary",
        // Completed state styling
        isCompleted && [
          "simulation-border-accent",
          "simulation-bg-secondary"
        ],
        // Responsive padding - more consistent across breakpoints
        "p-3 sm:p-4 md:p-5 lg:p-6",
        // Improved responsive height and layout
        "min-h-[280px] sm:min-h-[300px] md:min-h-[320px]",
        "flex flex-col",
        className
      )}
      onClick={() => onClick(simulation)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(simulation)
        }
      }}
    >
      <CardHeader className="pb-3 sm:pb-4 px-0 flex-shrink-0">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold simulation-text-primary leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                {simulation.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn(
                "px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide",
                "border-2 transition-all duration-200",
                "group-hover:scale-105",
                isCompleted 
                  ? "bg-black text-white dark:bg-white dark:text-black simulation-border-accent"
                  : "simulation-bg-primary simulation-text-primary simulation-border-accent"
              )}>
                {isCompleted ? 'Completed' : 'Ongoing'}
              </div>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm md:text-base simulation-text-secondary line-clamp-2 leading-relaxed">
            {simulation.description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-0 flex-1 flex flex-col justify-between">
        <div className="space-y-3 sm:space-y-4 flex-1">
          {/* Progress Section */}
          <SimulationProgressBar 
            progress={progressPercentage}
            status={simulation.status}
            size="md"
            showPercentage={true}
          />
          
          {/* Round Information */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2 text-xs sm:text-sm simulation-text-secondary">
            <span className="font-medium">
              Round {simulation.current_round} of {simulation.total_rounds}
            </span>
            <span className="text-xs opacity-75">
              Created {formatDate(simulation.created_at)}
            </span>
          </div>
        </div>
        
        {/* Action Hint - Always at bottom */}
        <div className="pt-3 mt-auto border-t simulation-border-primary">
          <p className="text-xs sm:text-sm simulation-text-muted font-medium group-hover:simulation-text-secondary transition-colors">
            {isCompleted 
              ? '→ Click to review results and feedback'
              : '→ Click to continue simulation'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}