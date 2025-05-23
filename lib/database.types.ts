export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type GroupRole = "owner" | "admin" | "member"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          group_code: string
          avatar_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          group_code?: string
          avatar_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          group_code?: string
          avatar_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          user_id: string
          group_id: string
          role: GroupRole
          nickname: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          role?: GroupRole
          nickname?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          role?: GroupRole
          nickname?: string | null
          joined_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          group_id: string
          date: string
          food_item: string
          quantity: number
          unit_price: number
          total_price: number
          notes: string | null
          receipt_image_url: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          participants: string[] | null
          approved_by: string | null
          status: string
        }
        Insert: {
          id?: string
          group_id: string
          date: string
          food_item: string
          quantity: number
          unit_price: number
          total_price: number
          notes?: string | null
          receipt_image_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          participants?: string[] | null
          approved_by?: string | null
          status?: string
        }
        Update: {
          id?: string
          group_id?: string
          date?: string
          food_item?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          notes?: string | null
          receipt_image_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          participants?: string[] | null
          approved_by?: string | null
          status?: string
        }
      }
      payments: {
        Row: {
          id: string
          group_id: string
          user_id: string
          amount: number
          payment_date: string
          payment_method: string | null
          payment_proof_url: string | null
          notes: string | null
          created_at: string
          approved_by: string | null
          status: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          amount: number
          payment_date?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          notes?: string | null
          created_at?: string
          approved_by?: string | null
          status?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          notes?: string | null
          created_at?: string
          approved_by?: string | null
          status?: string
        }
      }
      food_items: {
        Row: {
          id: string
          group_id: string | null
          name: string
          default_price: number
          description: string | null
          image_url: string | null
          category: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          group_id?: string | null
          name: string
          default_price: number
          description?: string | null
          image_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          group_id?: string | null
          name?: string
          default_price?: number
          description?: string | null
          image_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
    }
  }
}
