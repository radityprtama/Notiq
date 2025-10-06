-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_metadata table for embeddings and AI-generated data
CREATE TABLE IF NOT EXISTS public.ai_metadata (
  note_id UUID PRIMARY KEY REFERENCES public.notes(id) ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  sentiment TEXT,
  keywords TEXT[]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_notes_search ON public.notes 
  USING GIN(to_tsvector('english', title || ' ' || content));

-- Vector similarity search index (for semantic search)
CREATE INDEX IF NOT EXISTS idx_ai_metadata_embedding ON public.ai_metadata 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for notes table
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_metadata table
CREATE POLICY "Users can view own ai_metadata"
  ON public.ai_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = ai_metadata.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ai_metadata"
  ON public.ai_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = ai_metadata.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own ai_metadata"
  ON public.ai_metadata FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = ai_metadata.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on notes
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function for semantic search (example)
CREATE OR REPLACE FUNCTION search_notes_semantic(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id_param UUID
)
RETURNS TABLE (
  note_id UUID,
  title TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    n.content,
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM public.notes n
  JOIN public.ai_metadata am ON n.id = am.note_id
  WHERE n.user_id = user_id_param
    AND 1 - (am.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DEVELOPER-FOCUSED TABLES
-- ============================================

-- Code Snippets Table
CREATE TABLE IF NOT EXISTS public.snippets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON public.snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_language ON public.snippets(language);
CREATE INDEX IF NOT EXISTS idx_snippets_tags ON public.snippets USING GIN(tags);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  error_text TEXT NOT NULL,
  language TEXT,
  framework TEXT,
  ai_explanation TEXT,
  ai_solution JSONB, -- Array of solutions with steps
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(is_resolved);

-- Developer Journal Table
CREATE TABLE IF NOT EXISTS public.dev_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT,
  mood TEXT,
  tech_used TEXT[],
  achievements TEXT[],
  blockers TEXT[],
  weekly_digest TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_dev_journal_user_date ON public.dev_journal(user_id, date DESC);

-- CLI Sessions Table (for terminal integration)
CREATE TABLE IF NOT EXISTS public.cli_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_key TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'Terminal Session',
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cli_sessions_user_id ON public.cli_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cli_sessions_api_key ON public.cli_sessions(api_key);

-- Update notes table to support developer features
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS note_type TEXT DEFAULT 'markdown',
ADD COLUMN IF NOT EXISTS tech_stack TEXT[],
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notes_tech_stack ON public.notes USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.notes(note_type);

-- Update ai_metadata to include more fields
ALTER TABLE public.ai_metadata
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS related_tech TEXT[],
ADD COLUMN IF NOT EXISTS last_analyzed TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Snippets RLS
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snippets"
  ON public.snippets FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own snippets"
  ON public.snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets"
  ON public.snippets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets"
  ON public.snippets FOR DELETE
  USING (auth.uid() = user_id);

-- Error Logs RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error_logs"
  ON public.error_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own error_logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own error_logs"
  ON public.error_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own error_logs"
  ON public.error_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Dev Journal RLS
ALTER TABLE public.dev_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal"
  ON public.dev_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal"
  ON public.dev_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal"
  ON public.dev_journal FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal"
  ON public.dev_journal FOR DELETE
  USING (auth.uid() = user_id);

-- CLI Sessions RLS
ALTER TABLE public.cli_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cli_sessions"
  ON public.cli_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cli_sessions"
  ON public.cli_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cli_sessions"
  ON public.cli_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cli_sessions"
  ON public.cli_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON public.snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search snippets by language and tags
CREATE OR REPLACE FUNCTION search_snippets(
  user_id_param UUID,
  language_filter TEXT DEFAULT NULL,
  tag_filter TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL
)
RETURNS SETOF public.snippets AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.snippets s
  WHERE s.user_id = user_id_param
    AND (language_filter IS NULL OR s.language = language_filter)
    AND (tag_filter IS NULL OR tag_filter = ANY(s.tags))
    AND (
      search_query IS NULL OR
      s.title ILIKE '%' || search_query || '%' OR
      s.description ILIKE '%' || search_query || '%' OR
      s.code ILIKE '%' || search_query || '%'
    )
  ORDER BY s.usage_count DESC, s.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get tech stack relationships
CREATE OR REPLACE FUNCTION get_related_notes_by_tech(
  note_id_param UUID,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  related_note_id UUID,
  title TEXT,
  tech_stack TEXT[],
  match_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n2.id,
    n2.title,
    n2.tech_stack,
    (
      SELECT COUNT(*)
      FROM unnest(n1.tech_stack) AS tech1
      WHERE tech1 = ANY(n2.tech_stack)
    )::INT AS match_count
  FROM public.notes n1
  CROSS JOIN public.notes n2
  WHERE n1.id = note_id_param
    AND n2.id != note_id_param
    AND n1.user_id = n2.user_id
    AND n1.tech_stack && n2.tech_stack -- Has overlapping tech
  ORDER BY match_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.notes TO authenticated;
GRANT ALL ON public.ai_metadata TO authenticated;
GRANT ALL ON public.snippets TO authenticated;
GRANT ALL ON public.error_logs TO authenticated;
GRANT ALL ON public.dev_journal TO authenticated;
GRANT ALL ON public.cli_sessions TO authenticated;
