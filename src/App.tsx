import React, { useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Exercises from "./pages/Exercises";
import NotFound from "./pages/NotFound";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import ResetPassword from "./pages/ResetPassword";
import CaloriesBurnedPage from "./pages/CaloriesBurnedPage";
import HydrationPage from "./pages/HydrationPage";
import ProteinGoalPage from "./pages/ProteinGoalPage";
import WorkoutTimePage from "./pages/WorkoutTimePage";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import MuscleWorkoutPage from "./pages/MuscleWorkoutPage";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ExerciseDetail from "./pages/ExerciseDetail";
import WorkoutSession from "./pages/WorkoutSession";

const App = () => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/stats/calories-burned" element={<CaloriesBurnedPage />} />
            <Route path="/stats/hydration" element={<HydrationPage />} />
            <Route path="/stats/protein-goal" element={<ProteinGoalPage />} />
            <Route path="/stats/workout-time" element={<WorkoutTimePage />} />
            <Route path="/workout-player/:id" element={<WorkoutPlayer />} />
          <Route path="/workouts/muscle/:muscleName" element={<MuscleWorkoutPage />} />
          <Route path="/exercise-library" element={<ExerciseLibrary />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/workout-session/:programId/:dayId" element={<WorkoutSession />} />
          <Route path="/workout-session" element={<WorkoutSession />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
