-- Add missing columns to profiles table for onboarding data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS fitness_goal text;

-- Add check constraint for fitness_goal values
ALTER TABLE public.profiles
ADD CONSTRAINT fitness_goal_check 
CHECK (fitness_goal IN ('muscle_gain', 'weight_loss', 'maintenance') OR fitness_goal IS NULL);