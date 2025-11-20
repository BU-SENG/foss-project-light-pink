-- Create docgen_history table
CREATE TABLE IF NOT EXISTS public.docgen_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('python', 'javascript', 'typescript')),
    content_before TEXT NOT NULL,
    content_after TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_docgen_history_user_id ON public.docgen_history(user_id);
CREATE INDEX IF NOT EXISTS idx_docgen_history_created_at ON public.docgen_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.docgen_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own history" ON public.docgen_history;
DROP POLICY IF EXISTS "Users can insert their own history" ON public.docgen_history;
DROP POLICY IF EXISTS "Users can delete their own history" ON public.docgen_history;

-- Create RLS policies
CREATE POLICY "Users can view their own history"
    ON public.docgen_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
    ON public.docgen_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
    ON public.docgen_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.docgen_history TO postgres, service_role;
GRANT SELECT, INSERT, DELETE ON public.docgen_history TO authenticated;
