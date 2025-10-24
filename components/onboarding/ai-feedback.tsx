"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AIOnboardingService } from "@/lib/services/ai-onboarding"
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"

interface AIFeedbackProps {
  step: string
  onboardingData: any
  userId?: string
  onFeedbackReceived?: (feedback: string) => void
}

export function AIFeedback({ 
  step, 
  onboardingData, 
  userId,
  onFeedbackReceived 
}: AIFeedbackProps) {
  const [feedback, setFeedback] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isFallback, setIsFallback] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  const generateFeedback = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await AIOnboardingService.getFeedback(step, onboardingData)
      
      if (response.success) {
        setFeedback(response.feedback)
        setIsFallback(response.fallback || false)
        onFeedbackReceived?.(response.feedback)
        
        // Track the AI interaction
        if (userId) {
          AIOnboardingService.trackAIInteraction(
            userId,
            `onboarding_${step}`,
            { step, ...onboardingData },
            response.feedback
          )
        }
      } else {
        throw new Error('Failed to generate feedback')
      }
    } catch (err) {
      console.error('AI Feedback Error:', err)
      const fallbackFeedback = AIOnboardingService.getFallbackFeedback(step, onboardingData.interestArea)
      setFeedback(fallbackFeedback)
      setIsFallback(true)
      setError("Using offline response")
      onFeedbackReceived?.(fallbackFeedback)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRating = async (rating: number) => {
    if (!userId || hasRated) return
    
    try {
      await AIOnboardingService.trackAIInteraction(
        userId,
        `onboarding_${step}_rating`,
        { step, rating, ...onboardingData },
        feedback,
        rating
      )
      setHasRated(true)
    } catch (err) {
      console.error('Failed to save rating:', err)
    }
  }

  useEffect(() => {
    generateFeedback()
  }, [step, onboardingData])

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-blue-800">Getting personalized feedback...</p>
        </CardContent>
      </Card>
    )
  }

  if (!feedback) {
    return null
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-purple-900">AI Mentor</h3>
              {isFallback && (
                <Badge variant="outline" className="text-xs">
                  Offline
                </Badge>
              )}
              {error && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={generateFeedback}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <p className="text-sm text-gray-800 leading-relaxed mb-3">
              {feedback}
            </p>
            
            {/* Rating buttons */}
            {userId && !hasRated && !isFallback && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Was this helpful?</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRating(5)}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRating(2)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {hasRated && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                <span>Thanks for your feedback!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}