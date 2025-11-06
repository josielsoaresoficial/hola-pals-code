-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT,
  height NUMERIC,
  daily_calories_goal NUMERIC DEFAULT 2000,
  daily_protein_goal NUMERIC DEFAULT 150,
  daily_carbs_goal NUMERIC DEFAULT 250,
  daily_fat_goal NUMERIC DEFAULT 65,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create body_metrics table
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  weight NUMERIC NOT NULL,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  bmi NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_history table
CREATE TABLE IF NOT EXISTS public.workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  calories_burned NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_strength table
CREATE TABLE IF NOT EXISTS public.progress_strength (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  initial_weight NUMERIC NOT NULL,
  current_weight NUMERIC NOT NULL,
  target_weight NUMERIC NOT NULL,
  unit TEXT DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_strength ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for body_metrics
CREATE POLICY "Users can view their own body metrics"
  ON public.body_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body metrics"
  ON public.body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body metrics"
  ON public.body_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body metrics"
  ON public.body_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for workout_history
CREATE POLICY "Users can view their own workout history"
  ON public.workout_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout history"
  ON public.workout_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history"
  ON public.workout_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout history"
  ON public.workout_history FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for progress_strength
CREATE POLICY "Users can view their own strength progress"
  ON public.progress_strength FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strength progress"
  ON public.progress_strength FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strength progress"
  ON public.progress_strength FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strength progress"
  ON public.progress_strength FOR DELETE
  USING (auth.uid() = user_id);