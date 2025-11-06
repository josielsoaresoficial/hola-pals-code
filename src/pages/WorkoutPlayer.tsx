import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { translateExercise } from "@/lib/exerciseTranslations";

interface Exercise {
  name: string;
  duration: number;
  rest: number;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  estimated_calories: number;
  difficulty: string;
  exercises_data: Exercise[];
}

export default function WorkoutPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  useEffect(() => {
    if (!workout || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isResting) {
            // Acabou o descanso, próximo exercício
            nextExercise();
            return 0;
          } else {
            // Acabou o exercício, iniciar descanso
            const currentExercise = workout.exercises_data[currentExerciseIndex];
            if (currentExercise.rest > 0) {
              setIsResting(true);
              playSound();
              return currentExercise.rest;
            } else {
              // Sem descanso, próximo exercício
              nextExercise();
              return 0;
            }
          }
        }
        return prev - 1;
      });
      setTotalElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [workout, isPaused, isResting, currentExerciseIndex]);

  const loadWorkout = async () => {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao carregar treino");
      navigate("/workouts");
      return;
    }

    const workoutData = {
      ...data,
      exercises_data: data.exercises_data as unknown as Exercise[]
    };
    setWorkout(workoutData as Workout);
    setTimeLeft((data.exercises_data as unknown as Exercise[])[0].duration);
  };

  const nextExercise = () => {
    if (!workout) return;

    if (currentExerciseIndex >= workout.exercises_data.length - 1) {
      finishWorkout();
      return;
    }

    setIsResting(false);
    setCurrentExerciseIndex((prev) => prev + 1);
    setTimeLeft(workout.exercises_data[currentExerciseIndex + 1].duration);
    playSound();
  };

  const finishWorkout = async () => {
    if (!workout) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from("workout_history").insert({
        user_id: user.id,
        workout_name: workout.name,
        duration_seconds: totalElapsedSeconds,
        calories_burned: workout.estimated_calories
      });

      // Adicionar às calorias queimadas
      await supabase.from("calories_burned").insert({
        user_id: user.id,
        calories: workout.estimated_calories,
        activity_type: workout.name,
        duration_minutes: Math.floor(totalElapsedSeconds / 60),
      });
    }

    toast.success(`Treino concluído! ${workout.estimated_calories} kcal queimadas 🔥`);
    navigate("/workouts");
  };

  const playSound = () => {
    if (!isSoundOn) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Fzva8biMHImS564tqNAwZUKnr6bJjHA");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const togglePause = () => {
    if (isPaused && timeLeft === 0 && workout) {
      setTimeLeft(workout.exercises_data[currentExerciseIndex].duration);
    }
    setIsPaused(!isPaused);
  };

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Carregando treino...</div>
      </div>
    );
  }

  const currentExercise = workout.exercises_data[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workout.exercises_data.length) * 100;
  const totalDuration = isResting ? currentExercise.rest : currentExercise.duration;
  const timeProgress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/workouts")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sair
            </Button>
            <div className="text-center flex-1">
              <h2 className="font-semibold text-sm">{workout.name}</h2>
              <p className="text-xs text-muted-foreground">
                Exercício {currentExerciseIndex + 1} de {workout.exercises_data.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSoundOn(!isSoundOn)}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2">
          {/* Status Badge */}
          <div className="mb-6">
            {isResting ? (
              <span className="inline-block px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium animate-pulse">
                ⏸️ Descanso
              </span>
            ) : (
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                💪 Exercício
              </span>
            )}
          </div>

          {/* Exercise Name */}
          <h1 className="text-4xl font-bold mb-8 animate-fade-in">
            {isResting ? "Descanse" : translateExercise(currentExercise.name)}
          </h1>

          {/* Timer */}
          <div className="relative mb-8">
            <div className="text-8xl font-bold text-primary mb-4 animate-scale-in">
              {timeLeft}
            </div>
            <Progress value={timeProgress} className="h-3" />
          </div>

          {/* Next Exercise Preview */}
          {!isResting && currentExerciseIndex < workout.exercises_data.length - 1 && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Próximo:</p>
              <p className="font-medium">{translateExercise(workout.exercises_data[currentExerciseIndex + 1].name)}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={nextExercise}
              disabled={currentExerciseIndex >= workout.exercises_data.length - 1}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={togglePause}
              className="px-12"
            >
              {isPaused ? (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  {timeLeft === 0 ? "Iniciar" : "Continuar"}
                </>
              ) : (
                <>
                  <Pause className="w-6 h-6 mr-2" />
                  Pausar
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-primary">{Math.floor(totalElapsedSeconds / 60)}</div>
            <div className="text-xs text-muted-foreground">Minutos</div>
          </Card>
          <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-primary">{currentExerciseIndex + 1}</div>
            <div className="text-xs text-muted-foreground">Exercícios</div>
          </Card>
          <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-primary">~{workout.estimated_calories}</div>
            <div className="text-xs text-muted-foreground">Calorias</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
