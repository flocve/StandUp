import { createClient } from '@supabase/supabase-js'

// Configuration Supabase depuis les variables d'environnement (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface WeeklyParticipant {
  id: string
  name: string
  chance_percentage: number
  passage_count: number
  created_at?: string
  updated_at?: string
}

export interface DailyParticipant {
  id: string
  name: string
  last_participation?: string
  has_spoken: boolean
  speaking_order?: number
  created_at?: string
  updated_at?: string
}

export interface AnimatorHistory {
  id: number
  participant_id: string
  date: string
  created_at?: string
}