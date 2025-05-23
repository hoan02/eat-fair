export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
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
        }
        Insert: {
          id?: string
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
        }
        Update: {
          id?: string
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
        }
      }
      members: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          created_at: string
          is_group_leader: boolean
          phone: string | null
          address: string | null
          email: string | null
        }
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          created_at?: string
          is_group_leader?: boolean
          phone?: string | null
          address?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          is_group_leader?: boolean
          phone?: string | null
          address?: string | null
          email?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          member_id: string
          amount: number
          payment_date: string
          payment_method: string | null
          payment_proof_url: string | null
          notes: string | null
          created_at: string
          approved_by: string | null
        }
        Insert: {
          id?: string
          member_id: string
          amount: number
          payment_date?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          notes?: string | null
          created_at?: string
          approved_by?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          notes?: string | null
          created_at?: string
          approved_by?: string | null
        }
      }
      food_items: {
        Row: {
          id: string
          name: string
          default_price: number
          description: string | null
          image_url: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          default_price: number
          description?: string | null
          image_url?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          default_price?: number
          description?: string | null
          image_url?: string | null
          category?: string | null
          created_at?: string
        }
      }
    }
  }
}
