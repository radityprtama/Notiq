export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          summary: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          summary?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          summary?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_metadata: {
        Row: {
          note_id: string;
          embedding: number[] | null;
          sentiment: string | null;
          keywords: string[] | null;
        };
        Insert: {
          note_id: string;
          embedding?: number[] | null;
          sentiment?: string | null;
          keywords?: string[] | null;
        };
        Update: {
          note_id?: string;
          embedding?: number[] | null;
          sentiment?: string | null;
          keywords?: string[] | null;
        };
      };
    };
  };
}

export type Note = Database['public']['Tables']['notes']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type AIMetadata = Database['public']['Tables']['ai_metadata']['Row'];
