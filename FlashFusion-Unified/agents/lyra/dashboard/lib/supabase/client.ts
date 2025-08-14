import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Mock client for development
export const createClient = () => {
  return {
    auth: {
      getUser: () => Promise.resolve({ 
        data: { 
          user: { 
            id: 'mock-user-id',
            email: 'user@example.com' 
          } 
        } 
      })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ 
            data: null,
            error: null
          }),
          order: (column: string, options?: any) => Promise.resolve({
            data: [],
            error: null
          })
        })
      }),
      insert: (data: any) => Promise.resolve({
        data: null,
        error: null
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({
          data: null,
          error: null
        })
      }),
      upsert: (data: any) => Promise.resolve({
        data: null,
        error: null
      })
    })
  }
}