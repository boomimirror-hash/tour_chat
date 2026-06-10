// Supabase CLI로 자동 생성: npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// 스키마 확정 후 교체 예정

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
        }
      }
      preference_profiles: {
        Row: {
          id: string
          user_id: string
          companion_type: string
          nature_preference: string[]
          activity_level: string
          avoid_crowd: boolean
          has_pet: boolean
          prefer_wellness: boolean
          prefer_camping: boolean
          raw_chat: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          companion_type: string
          nature_preference: string[]
          activity_level: string
          avoid_crowd: boolean
          has_pet: boolean
          prefer_wellness: boolean
          prefer_camping: boolean
          raw_chat?: Json | null
          created_at?: string
        }
        Update: {
          companion_type?: string
          nature_preference?: string[]
          activity_level?: string
          avoid_crowd?: boolean
          has_pet?: boolean
          prefer_wellness?: boolean
          prefer_camping?: boolean
          raw_chat?: Json | null
        }
      }
      trending_spots: {
        Row: {
          id: string
          area_code: string
          area_name: string
          rank: number
          fetched_at: string
        }
        Insert: {
          id?: string
          area_code: string
          area_name: string
          rank: number
          fetched_at?: string
        }
        Update: {
          area_code?: string
          area_name?: string
          rank?: number
          fetched_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          user_id: string
          preference_id: string
          spots: Json
          accommodations: Json
          recommended_dates: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preference_id: string
          spots: Json
          accommodations: Json
          recommended_dates: Json
          created_at?: string
        }
        Update: {
          spots?: Json
          accommodations?: Json
          recommended_dates?: Json
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          package_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          package_id: string
          created_at?: string
        }
        Update: {
          package_id?: string
        }
      }
    }
  }
}
