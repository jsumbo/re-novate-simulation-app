"use client"

interface OnboardingData {
  interestArea: string
  quizScore?: number
  skillLevel?: string
  goals?: Array<{ id: string; text: string; category: string }>
  motivation?: string
  aspirations?: string
  learningPreference?: string
}

interface AIFeedbackResponse {
  feedback: string
  success: boolean
  fallback?: boolean
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface PersonalizedQuizResponse {
  questions: QuizQuestion[]
  success: boolean
  fallback?: boolean
}

interface LearningPathResponse {
  learningPath: {
    title: string
    description: string
    modules: Array<{
      id: number
      title: string
      description: string
      skills: string[]
      scenarios: string[]
      duration: string
    }>
    nextSteps: string
  }
  success: boolean
  fallback?: boolean
}

export class AIOnboardingService {
  private static async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`AI Service Error (${endpoint}):`, error)
      throw error
    }
  }

  static async getFeedback(
    step: string, 
    onboardingData: OnboardingData
  ): Promise<AIFeedbackResponse> {
    return this.makeRequest<AIFeedbackResponse>('/api/ai/onboarding-feedback', {
      step,
      ...onboardingData
    })
  }

  static async generatePersonalizedQuiz(
    interestArea: string,
    difficulty: string = 'beginner'
  ): Promise<PersonalizedQuizResponse> {
    return this.makeRequest<PersonalizedQuizResponse>('/api/ai/personalized-quiz', {
      interestArea,
      difficulty
    })
  }

  static async generateLearningPath(
    onboardingData: OnboardingData
  ): Promise<LearningPathResponse> {
    return this.makeRequest<LearningPathResponse>('/api/ai/learning-path', {
      ...onboardingData
    })
  }

  static async saveProfile(
    userId: string,
    onboardingData: OnboardingData
  ): Promise<{ success: boolean; profile?: any; message?: string }> {
    return this.makeRequest('/api/onboarding/save-profile', {
      userId,
      ...onboardingData
    })
  }

  static async trackAIInteraction(
    userId: string,
    interactionType: string,
    context: any,
    aiResponse: string,
    rating?: number
  ): Promise<{ success: boolean }> {
    try {
      return this.makeRequest('/api/ai/track-interaction', {
        userId,
        interactionType,
        context,
        aiResponse,
        rating
      })
    } catch (error) {
      // Don't fail the main flow if tracking fails
      console.warn('Failed to track AI interaction:', error)
      return { success: false }
    }
  }

  // Utility methods for fallback responses
  static getFallbackFeedback(step: string, interestArea?: string): string {
    const fallbacks = {
      interest_selected: `Excellent choice! 🌟 ${interestArea} is an amazing field with lots of opportunities. We're excited to help you explore and grow!`,
      quiz_completed: "Great job completing the quiz! 🧠 Remember, every expert was once a beginner. You're on the right path!",
      goals_set: "Fantastic goals! 🎯 Setting clear objectives is the first step to success. We'll help you achieve them!",
      profile_complete: "Welcome to RE-Novate! 🚀 Your profile shows you're ready for an amazing learning adventure!",
      default: "You're doing great! 🌟 Keep up the excellent work on your learning journey!"
    }

    return fallbacks[step as keyof typeof fallbacks] || fallbacks.default
  }

  static validateOnboardingData(data: OnboardingData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.interestArea) {
      errors.push('Interest area is required')
    }

    if (data.goals && data.goals.length === 0) {
      errors.push('At least one learning goal is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}