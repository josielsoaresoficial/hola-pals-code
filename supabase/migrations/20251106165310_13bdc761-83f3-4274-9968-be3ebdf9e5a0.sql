-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS daily_calories_burn_goal numeric DEFAULT 500;

-- Add missing column to workout_history table
ALTER TABLE public.workout_history
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone DEFAULT now();

-- Create calories_burned table
CREATE TABLE IF NOT EXISTS public.calories_burned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date timestamp with time zone NOT NULL DEFAULT now(),
  calories numeric NOT NULL DEFAULT 0,
  activity_type text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on calories_burned
ALTER TABLE public.calories_burned ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calories_burned
CREATE POLICY "Users can view their own calories burned"
ON public.calories_burned
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calories burned"
ON public.calories_burned
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calories burned"
ON public.calories_burned
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calories burned"
ON public.calories_burned
FOR DELETE
USING (auth.uid() = user_id);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  completed boolean DEFAULT false,
  points integer DEFAULT 0,
  progress_current integer DEFAULT 0,
  progress_target integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
ON public.user_achievements
FOR DELETE
USING (auth.uid() = user_id);