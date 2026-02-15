export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          region: string | null
          certifications: string | null
          approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          region?: string | null
          certifications?: string | null
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          region?: string | null
          certifications?: string | null
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'farmer' | 'customer' | 'admin'
        }
        Insert: {
          id?: string
          user_id: string
          role: 'farmer' | 'customer' | 'admin'
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'farmer' | 'customer' | 'admin'
        }
      }
      herb_batches: {
        Row: {
          id: string
          batch_code: string
          farmer_id: string
          farmer_name: string | null
          herb_name: string
          scientific_name: string
          description: string | null
          harvest_region: string
          harvest_date: string
          processing_steps: Json
          image_url: string | null
          price: number
          unit: string
          hash: string | null
          category: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_code: string
          farmer_id: string
          farmer_name?: string | null
          herb_name: string
          scientific_name: string
          description?: string | null
          harvest_region: string
          harvest_date: string
          processing_steps?: Json
          image_url?: string | null
          price: number
          unit?: string
          hash?: string | null
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_code?: string
          farmer_id?: string
          farmer_name?: string | null
          herb_name?: string
          scientific_name?: string
          description?: string | null
          harvest_region?: string
          harvest_date?: string
          processing_steps?: Json
          image_url?: string | null
          price?: number
          unit?: string
          hash?: string | null
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          batch_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_herbs: {
        Row: {
          id: string
          user_id: string
          herb_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          herb_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          herb_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: 'farmer' | 'customer' | 'admin'
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'farmer' | 'customer' | 'admin'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
