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
          note_type: string;
          tech_stack: string[] | null;
          is_favorite: boolean;
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
          note_type?: string;
          tech_stack?: string[] | null;
          is_favorite?: boolean;
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
          note_type?: string;
          tech_stack?: string[] | null;
          is_favorite?: boolean;
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
          summary: string | null;
          related_tech: string[] | null;
          last_analyzed: string;
        };
        Insert: {
          note_id: string;
          embedding?: number[] | null;
          sentiment?: string | null;
          keywords?: string[] | null;
          summary?: string | null;
          related_tech?: string[] | null;
          last_analyzed?: string;
        };
        Update: {
          note_id?: string;
          embedding?: number[] | null;
          sentiment?: string | null;
          keywords?: string[] | null;
          summary?: string | null;
          related_tech?: string[] | null;
          last_analyzed?: string;
        };
      };
      snippets: {
        Row: {
          id: string;
          user_id: string;
          note_id: string | null;
          title: string;
          code: string;
          language: string;
          description: string | null;
          tags: string[] | null;
          is_public: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_id?: string | null;
          title: string;
          code: string;
          language: string;
          description?: string | null;
          tags?: string[] | null;
          is_public?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_id?: string | null;
          title?: string;
          code?: string;
          language?: string;
          description?: string | null;
          tags?: string[] | null;
          is_public?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      error_logs: {
        Row: {
          id: string;
          user_id: string;
          note_id: string | null;
          error_text: string;
          language: string | null;
          framework: string | null;
          ai_explanation: string | null;
          ai_solution: any | null;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_id?: string | null;
          error_text: string;
          language?: string | null;
          framework?: string | null;
          ai_explanation?: string | null;
          ai_solution?: any | null;
          is_resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_id?: string | null;
          error_text?: string;
          language?: string | null;
          framework?: string | null;
          ai_explanation?: string | null;
          ai_solution?: any | null;
          is_resolved?: boolean;
          created_at?: string;
        };
      };
      dev_journal: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string | null;
          mood: string | null;
          tech_used: string[] | null;
          achievements: string[] | null;
          blockers: string[] | null;
          weekly_digest: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          content?: string | null;
          mood?: string | null;
          tech_used?: string[] | null;
          achievements?: string[] | null;
          blockers?: string[] | null;
          weekly_digest?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          content?: string | null;
          mood?: string | null;
          tech_used?: string[] | null;
          achievements?: string[] | null;
          blockers?: string[] | null;
          weekly_digest?: string | null;
          created_at?: string;
        };
      };
      cli_sessions: {
        Row: {
          id: string;
          user_id: string;
          api_key: string;
          name: string;
          last_used: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          api_key: string;
          name?: string;
          last_used?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          api_key?: string;
          name?: string;
          last_used?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Note = Database['public']['Tables']['notes']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type AIMetadata = Database['public']['Tables']['ai_metadata']['Row'];
export type Snippet = Database['public']['Tables']['snippets']['Row'];
export type ErrorLog = Database['public']['Tables']['error_logs']['Row'];
export type DevJournal = Database['public']['Tables']['dev_journal']['Row'];
export type CLISession = Database['public']['Tables']['cli_sessions']['Row'];

// AI Tool Types
export interface AIExplainResult {
  explanation: string;
  complexity: 'simple' | 'moderate' | 'complex';
  concepts: string[];
  suggestions?: string[];
}

export interface AIRefactorResult {
  refactored: string;
  improvements: string[];
  reasoning: string;
}

export interface AIConvertResult {
  converted: string;
  notes: string;
  warnings?: string[];
}

export interface AICommitResult {
  message: string;
  type: string;
  scope?: string;
  breaking?: boolean;
}

export interface ErrorSolution {
  title: string;
  steps: string[];
  code?: string;
  reference?: string;
}

export interface AIErrorInsightResult {
  explanation: string;
  detectedLanguage: string;
  detectedFramework?: string;
  possibleCauses: string[];
  solutions: ErrorSolution[];
  relatedDocs: string[];
}
