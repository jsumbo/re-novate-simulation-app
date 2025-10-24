// Type definitions for RE-Novate application

export type UserRole = "student" | "teacher"

export type CareerPath =
  | "CEO"
  | "CTO"
  | "Marketing Lead"
  | "Operations Manager"
  | "Product Manager"
  | "HR Manager"
  | "Customer Service Manager"
  | "Supply Chain Manager"

export type SessionStatus = "in_progress" | "completed" | "abandoned"

export interface School {
  id: string
  name: string
  verification_code: string
  location: string
  created_at: string
}

export interface User {
  id: string
  participant_id: string
  school_id: string
  role: UserRole
  career_path?: CareerPath
  created_at: string
  last_active: string
}

export interface ScenarioOption {
  id: string
  text: string
  impact: string
}

export interface Scenario {
  id: string
  title: string
  description: string
  context: string
  difficulty_level: number
  career_relevance: CareerPath[]
  options: ScenarioOption[]
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  started_at: string
  completed_at?: string
  current_round: number
  total_rounds: number
  status: SessionStatus
}

export interface Decision {
  id: string
  session_id: string
  scenario_id: string
  user_id: string
  round_number: number
  selected_option: string
  ai_feedback?: string
  outcome_score: number
  skills_gained: Record<string, number>
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  skill_name: string
  skill_level: number
  total_scenarios_completed: number
  average_score: number
  last_updated: string
}

// Simulation Management Types
export type SimulationStatus = "ongoing" | "completed" | "paused"

export interface SimulationSession {
  id: string
  user_id: string
  title: string
  description: string
  status: SimulationStatus
  progress: number // 0-100
  current_round: number
  total_rounds: number
  scenario_id?: string
  session_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SimulationSummary {
  total_simulations: number
  completed_simulations: number
  ongoing_simulations: number
  average_progress: number
}
