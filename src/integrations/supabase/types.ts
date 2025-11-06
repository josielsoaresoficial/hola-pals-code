export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          created_at: string | null
          id: string
          muscle_mass: number | null
          user_id: string
          weight: number
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          muscle_mass?: number | null
          user_id: string
          weight: number
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          muscle_mass?: number | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      calories_burned: {
        Row: {
          activity_type: string | null
          calories: number
          created_at: string | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          calories?: number
          created_at?: string | null
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          calories?: number
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          foods_details: Json
          id: string
          image_data: string | null
          meal_date: string
          meal_time: string
          protein: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          foods_details: Json
          id?: string
          image_data?: string | null
          meal_date?: string
          meal_time: string
          protein?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          foods_details?: Json
          id?: string
          image_data?: string | null
          meal_date?: string
          meal_time?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          daily_calories_burn_goal: number | null
          daily_calories_goal: number | null
          daily_carbs_goal: number | null
          daily_fat_goal: number | null
          daily_protein_goal: number | null
          fitness_goal: string | null
          height: number | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          daily_calories_burn_goal?: number | null
          daily_calories_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          fitness_goal?: string | null
          height?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          daily_calories_burn_goal?: number | null
          daily_calories_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          fitness_goal?: string | null
          height?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      progress_strength: {
        Row: {
          created_at: string | null
          current_weight: number
          exercise_name: string
          id: string
          initial_weight: number
          target_weight: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_weight: number
          exercise_name: string
          id?: string
          initial_weight: number
          target_weight: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_weight?: number
          exercise_name?: string
          id?: string
          initial_weight?: number
          target_weight?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          points: number | null
          progress_current: number | null
          progress_target: number | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          progress_current?: number | null
          progress_target?: number | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          progress_current?: number | null
          progress_target?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          goal_name: string
          goal_type: string
          id: string
          target_value: number
          unit: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_name: string
          goal_type: string
          id?: string
          target_value: number
          unit?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_name?: string
          goal_type?: string
          id?: string
          target_value?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_history: {
        Row: {
          calories_burned: number
          completed_at: string | null
          created_at: string | null
          duration_seconds: number
          id: string
          user_id: string
          workout_name: string
        }
        Insert: {
          calories_burned?: number
          completed_at?: string | null
          created_at?: string | null
          duration_seconds: number
          id?: string
          user_id: string
          workout_name: string
        }
        Update: {
          calories_burned?: number
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number
          id?: string
          user_id?: string
          workout_name?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          estimated_calories: number | null
          exercises_data: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          estimated_calories?: number | null
          exercises_data?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          estimated_calories?: number | null
          exercises_data?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
