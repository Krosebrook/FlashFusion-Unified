-- Conversations Table
-- Stores message threads/conversations for the FlashFusion messaging system

CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary TEXT
);

COMMENT ON TABLE public.conversations IS 'Stores message threads/conversations';

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation Participants Table
-- Tracks users participating in conversations

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

COMMENT ON TABLE public.conversation_participants IS 'Tracks users participating in conversations';

-- Enable Row Level Security
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_joined_at ON public.conversation_participants(joined_at DESC);

-- RLS Policies for conversations table
-- Users can only see conversations they participate in
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert conversations (they become the creator)
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update conversations they created
CREATE POLICY "Users can update conversations they created" ON public.conversations
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete conversations they created
CREATE POLICY "Users can delete conversations they created" ON public.conversations
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for conversation_participants table
-- Users can view participants in conversations they're part of
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Users can join conversations (insert themselves)
CREATE POLICY "Users can join conversations" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation records
CREATE POLICY "Users can update their own participation" ON public.conversation_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can leave conversations (delete their own participation)
CREATE POLICY "Users can leave conversations" ON public.conversation_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at when conversation is modified
CREATE TRIGGER conversations_updated_at_trigger
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversations_updated_at();

-- Function to automatically add conversation creator as participant
CREATE OR REPLACE FUNCTION add_conversation_creator_as_participant()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (NEW.id, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically add creator as participant when conversation is created
CREATE TRIGGER add_creator_as_participant_trigger
    AFTER INSERT ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION add_conversation_creator_as_participant();