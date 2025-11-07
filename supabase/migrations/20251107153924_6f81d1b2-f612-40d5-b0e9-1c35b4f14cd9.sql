-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create conversations table
CREATE TABLE public.nutri_ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.nutri_ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.nutri_ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.nutri_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutri_ai_messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.nutri_ai_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.nutri_ai_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.nutri_ai_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.nutri_ai_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.nutri_ai_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.nutri_ai_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.nutri_ai_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nutri_ai_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_nutri_ai_conversations_updated_at
BEFORE UPDATE ON public.nutri_ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_nutri_ai_conversations_user_id ON public.nutri_ai_conversations(user_id);
CREATE INDEX idx_nutri_ai_messages_conversation_id ON public.nutri_ai_messages(conversation_id);