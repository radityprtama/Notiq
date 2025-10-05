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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.notes TO authenticated;
GRANT ALL ON public.ai_metadata TO authenticated;
