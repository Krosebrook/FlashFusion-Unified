import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: number;
          title: string;
          created_at: string;
          updated_at: string;
          created_by: string;
          summary: string | null;
        };
        Insert: {
          title: string;
          created_by: string;
          summary?: string;
        };
        Update: {
          title?: string;
          summary?: string;
        };
      };
      conversation_participants: {
        Row: {
          id: number;
          conversation_id: number;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
        };
        Insert: {
          conversation_id: number;
          user_id: string;
        };
        Update: {
          last_read_at?: string;
        };
      };
    };
  };
};