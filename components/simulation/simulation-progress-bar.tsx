"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SimulationProgressBarProps {
  progress: number // 0-100
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  status?: 'ongoing' | 'completed' | 'paused'
}

export function SimulationProgressBar({ 
  progress, 
  showPercentage = true, 
  size = 'md',
  className,
  status = 'ongoing'
}: SimulationProgressBarProps) {
  // Ensure progress is within valid range
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)
  const isCompleted = status === 'completed' || normalizedProgress === 100
  
  // Size variants with black/white theme consistency
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showPercentage && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
            Progress
          </span>
          <span className={cn(
            "text-sm font-bold tabular-nums",
            isCompleted 
              ? "text-black dark:text-white" 
              : "text-gray-600 dark:text-gray-400"
          )}>
            {normalizedProgress}%
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* Background track */}
        <div className={cn(
          "w-full rounded-full overflow-hidden",
          "bg-gray-200 dark:bg-gray-800",
          "border border-gray-300 dark:border-gray-700",
          sizeClasses[size]
        )}>
          {/* Progress fill */}
          <div 
            className={cn(
              "h-full transition-all duration-500 ease-out",
              isCompleted 
                ? "bg-black dark:bg-white" 
                : "bg-gray-600 dark:bg-gray-400"
            )}
            style={{ 
              width: `${normalizedProgress}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
        
        {/* Completion indicator */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              "bg-white dark:bg-black border-2 border-black dark:border-white",
              "shadow-sm"
            )}>
              <svg 
                className="w-3 h-3 text-black dark:text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Status text for screen readers */}
      <span className="sr-only">
        Simulation progress: {normalizedProgress}% complete
        {isCompleted && ', completed'}
      </span>
    </div>
  )
}