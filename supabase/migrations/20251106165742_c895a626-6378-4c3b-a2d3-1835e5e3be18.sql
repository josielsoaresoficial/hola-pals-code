-- Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_name text NOT NULL,
  goal_type text NOT NULL,
  current_value numeric DEFAULT 0,
  target_value numeric NOT NULL,
  unit text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_goals
CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.user_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  duration_minutes integer,
  estimated_calories integer,
  difficulty text,
  exercises_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workouts
CREATE POLICY "Users can view their own workouts"
ON public.workouts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
ON public.workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
ON public.workouts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
ON public.workouts
FOR DELETE
USING (auth.uid() = user_id);