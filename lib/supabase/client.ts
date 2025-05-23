import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

let supabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
