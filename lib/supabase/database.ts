"use client";

import { getSupabaseBrowserClient } from "./client";
import { SimulationSession, SimulationSummary, SimulationStatus } from "../types";

// Types for our database operations
export interface StudentProfile {
  id: string;
  user_id: string;
  interest_area: string;
  avatar_config: any;
  skill_level: string;
  motivation?: string;
  aspirations?: string;
  learning_preference?: string;
  onboarding_completed: boolean;
  total_points: number;
  current_level: number;
  achievements: any[];
  preferences: any;
}

export interface User {
  id: string;
  participant_id: string;
  username?: string;
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  email?: string;
  role: 'student' | 'teacher' | 'admin';
  school_id?: string;
  career_path?: string;
  is_active: boolean;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_type: string;
  interest_area?: string;
  score: number;
  total_questions: number;
  percentage: number;
  skill_level_determined?: string;
  answers: any[];
  time_taken: number;
  ai_summary?: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_type: string;
  status: 'in_progress' | 'completed' | 'paused' | 'abandoned';
  current_round: number;
  total_rounds: number;
  total_score: number;
  scenarios_completed: number;
  time_spent: number;
}

export interface Decision {
  id: string;
  user_id: string;
  session_id: string;
  scenario_id: string;
  selected_option_id: string;
  outcome_score: number;
  time_taken: number;
  ai_feedback?: string;
  skills_gained: any;
  reflection_notes?: string;
}

export interface Progress {
  id: string;
  user_id: string;
  skill_name: string;
  skill_level: number;
  total_scenarios_completed: number;
  average_score: number;
  last_practiced?: string;
  improvement_rate: number;
}

export class DatabaseService {
  private supabase = getSupabaseBrowserClient();

  // User operations
  async createUser(userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserById(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Student Profile operations
  async createStudentProfile(profileData: Partial<StudentProfile>): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error creating student profile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getStudentProfile(userId: string): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error updating student profile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Quiz Results operations
  async saveQuizResult(quizData: Partial<QuizResult>): Promise<{ success: boolean; result?: QuizResult; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('quiz_results')
        .insert([quizData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, result: data };
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Session operations
  async createSession(sessionData: Partial<Session>): Promise<{ success: boolean; session?: Session; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserSessions(userId: string): Promise<{ success: boolean; sessions?: Session[]; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, sessions: data };
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<{ success: boolean; progress?: Progress[]; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .order('skill_level', { ascending: false });

      if (error) throw error;
      return { success: true, progress: data };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProgress(userId: string, skillName: string, updates: Partial<Progress>): Promise<{ success: boolean; progress?: Progress; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('progress')
        .upsert([{
          user_id: userId,
          skill_name: skillName,
          ...updates
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, progress: data };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Decision operations
  async saveDecision(decisionData: Partial<Decision>): Promise<{ success: boolean; decision?: Decision; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('decisions')
        .insert([decisionData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, decision: data };
    } catch (error) {
      console.error('Error saving decision:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserDecisions(userId: string, limit: number = 10): Promise<{ success: boolean; decisions?: Decision[]; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, decisions: data };
    } catch (error) {
      console.error('Error fetching user decisions:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Schools operations
  async getSchools(): Promise<{ success: boolean; schools?: any[]; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('schools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, schools: data };
    } catch (error) {
      console.error('Error fetching schools:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSchoolByCode(code: string): Promise<{ success: boolean; school?: any; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('schools')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return { success: true, school: data };
    } catch (error) {
      console.error('Error fetching school by code:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Dashboard data aggregation
  async getStudentDashboardData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      // Get user and profile data
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select(`
          *,
          student_profiles (*)
        `)
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get progress data
      const { data: progressData, error: progressError } = await this.supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // Get sessions data
      const { data: sessionsData, error: sessionsError } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get recent decisions
      const { data: decisionsData, error: decisionsError } = await this.supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (decisionsError) throw decisionsError;

      // Calculate stats
      const totalSessions = sessionsData?.length || 0;
      const completedSessions = sessionsData?.filter(s => s.status === 'completed').length || 0;
      const averageScore = decisionsData?.length > 0 
        ? Math.round(decisionsData.reduce((sum, d) => sum + d.outcome_score, 0) / decisionsData.length)
        : 0;

      return {
        success: true,
        data: {
          user: userData,
          progress: progressData || [],
          sessions: sessionsData || [],
          recentDecisions: decisionsData || [],
          stats: {
            totalSessions,
            completedSessions,
            averageScore
          }
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Simulation Session operations
  async getUserSimulationsByStatus(userId: string, status?: SimulationStatus): Promise<{ success: boolean; simulations?: SimulationSession[]; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_user_simulations_by_status', {
          p_user_id: userId,
          p_status: status || null
        });

      if (error) throw error;
      return { success: true, simulations: data };
    } catch (error) {
      console.error('Error fetching user simulations:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserSimulationSummary(userId: string): Promise<{ success: boolean; summary?: SimulationSummary; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_user_simulation_summary', {
          p_user_id: userId
        });

      if (error) throw error;
      return { success: true, summary: data[0] };
    } catch (error) {
      console.error('Error fetching simulation summary:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createSimulationSession(sessionData: Omit<SimulationSession, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; session?: SimulationSession; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('simulation_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('Error creating simulation session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateSimulationSession(sessionId: string, updates: Partial<SimulationSession>): Promise<{ success: boolean; session?: SimulationSession; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .from('simulation_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('Error updating simulation session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateSimulationProgress(simulationId: string, progress: number, currentRound?: number): Promise<{ success: boolean; updated?: boolean; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: "Database not available" };
    }

    try {
      const { data, error } = await this.supabase
        .rpc('update_simulation_progress', {
          p_simulation_id: simulationId,
          p_progress: progress,
          p_current_round: currentRound || null
        });

      if (error) throw error;
      return { success: true, updated: data };
    } catch (error) {
      console.error('Error updating simulation progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();