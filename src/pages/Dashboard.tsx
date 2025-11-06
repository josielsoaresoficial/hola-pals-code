import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { GymCard } from "@/components/GymCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock as ClockIcon, Target, Flame, Droplets, Zap, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMotivationalMessage } from "@/hooks/useMotivationalMessage";
import { WelcomeVoice } from "@/components/WelcomeVoice";

const Dashboard = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [proteinGoal, setProteinGoal] = useState(120);
  const motivationalMessage = useMotivationalMessage();
  const [nutritionData, setNutritionData] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState({
    workoutsCompleted: 0,
    calorieGoalPercentage: 0,
    consecutiveDays: 0
  });
  
  useEffect(() => {
    const loadUserName = async () => {
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, daily_protein_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile data:', profile, 'Error:', error);

      if (profile?.daily_protein_goal) {
        setProteinGoal(profile.daily_protein_goal);
      }

      if (profile?.name) {
        let firstName = profile.name.trim();
        
        // Se for email, pegar parte antes do @ e remover caracteres especiais
        if (firstName.includes('@')) {
          firstName = firstName.split('@')[0].replace(/[.+]/g, ' ');
        }
        
        // Pegar apenas primeiro nome se houver espaços
        firstName = firstName.split(' ')[0];
        
        // Capitalizar primeira letra de cada palavra
        firstName = firstName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        setUserName(firstName);
      } else {
        setUserName('Amigo');
      }
    };

    loadUserName();
  }, [user]);

  useEffect(() => {
    const loadTodayNutrition = async () => {
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: meals } = await supabase
        .from('meals')
        .select('total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', user.id)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString());

      if (Array.isArray(meals) && meals.length > 0) {
        const totals = (meals as any[]).reduce((acc, meal: any) => ({
          calories: acc.calories + (Number(meal.total_calories) || 0),
          protein: acc.protein + (Number(meal.total_protein) || 0),
          carbs: acc.carbs + (Number(meal.total_carbs) || 0),
          fat: acc.fat + (Number(meal.total_fat) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        setNutritionData(totals);
      } else {
        setNutritionData({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    };

    loadTodayNutrition();
  }, [user]);

  useEffect(() => {
    const loadTodayCaloriesBurned = async () => {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: caloriesData } = await supabase
        .from('calories_burned')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', today);

      const total = caloriesData?.reduce((sum, record) => sum + record.calories, 0) || 0;
      setCaloriesBurned(total);
    };

    loadTodayCaloriesBurned();
  }, [user]);

  useEffect(() => {
    const loadWeeklyProgress = async () => {
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Carregar treinos completos nos últimos 7 dias
      const { data: workouts } = await supabase
        .from('workout_history')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgo.toISOString());

      const workoutsCompleted = workouts?.length || 0;

      // Carregar dados de nutrição dos últimos 7 dias
      const { data: weeklyMeals } = await supabase
        .from('meals')
        .select('total_calories, timestamp')
        .eq('user_id', user.id)
        .gte('timestamp', sevenDaysAgo.toISOString());

      // Calcular meta calórica média
      let calorieGoalPercentage = 0;
      if (Array.isArray(weeklyMeals) && weeklyMeals.length > 0) {
        const dailyCalories: { [key: string]: number } = {};
        
        weeklyMeals.forEach((meal: any) => {
          const date = new Date(meal.timestamp).toISOString().split('T')[0];
          dailyCalories[date] = (dailyCalories[date] || 0) + (Number(meal.total_calories) || 0);
        });

        const days = Object.keys(dailyCalories);
        if (days.length > 0) {
          const totalPercentage = days.reduce((acc, date) => {
            return acc + Math.min((dailyCalories[date] / 2200) * 100, 100);
          }, 0);
          calorieGoalPercentage = Math.round(totalPercentage / days.length);
        }
      }

      // Calcular dias consecutivos (com treinos ou refeições)
      let consecutiveDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasWorkout = workouts?.some((w: any) => 
          new Date(w.completed_at).toISOString().split('T')[0] === dateStr
        );
        
        const hasMeal = weeklyMeals?.some((m: any) => 
          new Date(m.timestamp).toISOString().split('T')[0] === dateStr
        );
        
        if (hasWorkout || hasMeal) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      setWeeklyProgress({
        workoutsCompleted,
        calorieGoalPercentage,
        consecutiveDays
      });
    };

    loadWeeklyProgress();
  }, [user]);

  const proteinPercentage = proteinGoal > 0 ? Math.round((nutritionData.protein / proteinGoal) * 100) : 0;
  
  const todayStats = [
    { icon: <Flame className="w-6 h-6" />, title: "Calorias Queimadas", value: `${caloriesBurned}`, change: caloriesBurned > 0 ? `${caloriesBurned} kcal` : "0 kcal", variant: "fitness" as const, link: "/stats/calories-burned" },
    { icon: <Droplets className="w-6 h-6" />, title: "Água Consumida", value: "1.8L", change: "+5%", variant: "default" as const, link: "/stats/hydration" },
    { icon: <Target className="w-6 h-6" />, title: "Meta de Proteína", value: `${Math.round(nutritionData.protein)}g`, change: `${proteinPercentage}% da meta`, variant: "nutrition" as const, link: "/stats/protein-goal" },
    { icon: <ClockIcon className="w-6 h-6" />, title: "Tempo de Treino", value: "45min", variant: "fitness" as const, link: "/stats/workout-time" },
  ];

  return (
    <Layout>
      <WelcomeVoice />
      <div className="w-full px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-3xl font-bold">Olá, {userName}! 👋</h1>
              <div className="md:hidden">
                <ThemeSelector />
              </div>
            </div>
            <p className="motivational-text text-primary font-bold break-words whitespace-normal max-w-full">{motivationalMessage}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/workouts">
              <Button variant="fitness" size="sm">
                <Plus className="w-4 h-4" />
                Novo Treino
              </Button>
            </Link>
            <Link to="/nutrition">
              <Button variant="nutrition" size="sm">
                <Plus className="w-4 h-4" />
                Analisar Refeição
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {todayStats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <StatCard {...stat} />
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Today's Workout */}
          <GymCard 
            variant="fitness"
            title="Treino de Hoje"
            description="Peito e Tríceps - Hipertrofia"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-medium">3/5 exercícios</span>
              </div>
              <Progress value={60} className="h-2" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-fitness-subtle">
                  <div>
                    <p className="font-medium">Supino reto com barra</p>
                    <p className="text-sm text-muted-foreground">3x12 - 70kg</p>
                  </div>
                  <div className="text-green-500 text-xl">✓</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-fitness-subtle">
                  <div>
                    <p className="font-medium">Supino inclinado</p>
                    <p className="text-sm text-muted-foreground">3x10 - 60kg</p>
                  </div>
                  <div className="text-green-500 text-xl">✓</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-medium text-primary">Crucifixo com halteres</p>
                    <p className="text-sm text-muted-foreground">3x12 - 20kg</p>
                  </div>
                  <div className="text-primary">⏳</div>
                </div>
              </div>
              
              <Link to="/workouts">
                <Button variant="fitness" className="w-full">
                  <Zap className="w-4 h-4" />
                  Continuar Treino
                </Button>
              </Link>
            </div>
          </GymCard>

          {/* Nutrition Summary */}
          <GymCard 
            variant="nutrition"
            title="Resumo Nutricional"
            description="Objetivo: 2.200 kcal"
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{Math.round(nutritionData.calories)}</div>
                <div className="text-sm text-muted-foreground">kcal consumidas</div>
                <div className={`text-xs mt-1 ${2200 - nutritionData.calories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(Math.round(2200 - nutritionData.calories))} kcal {2200 - nutritionData.calories >= 0 ? 'restantes' : 'acima'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carboidratos</span>
                    <span>{Math.round(nutritionData.carbs)}g / 220g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.carbs / 220) * 100, 100)} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Proteínas</span>
                    <span>{Math.round(nutritionData.protein)}g / 120g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.protein / 120) * 100, 100)} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gorduras</span>
                    <span>{Math.round(nutritionData.fat)}g / 60g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.fat / 60) * 100, 100)} className="h-1" />
                </div>
              </div>
              
              <Link to="/nutrition">
                <Button variant="nutrition" className="w-full">
                  <Plus className="w-4 h-4" />
                  Adicionar Refeição
                </Button>
              </Link>
            </div>
          </GymCard>
        </div>

        {/* Weekly Progress */}
        <GymCard 
          title="Progresso Semanal"
          description="Sua evolução nos últimos 7 dias"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-fitness-subtle">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{weeklyProgress.workoutsCompleted}</div>
              <div className="text-sm text-muted-foreground">Treinos Completos</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gradient-nutrition-subtle">
              <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary">{weeklyProgress.calorieGoalPercentage}%</div>
              <div className="text-sm text-muted-foreground">Meta Calórica</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold">{weeklyProgress.consecutiveDays}</div>
              <div className="text-sm text-muted-foreground">Dias Consecutivos</div>
            </div>
          </div>
        </GymCard>
      </div>
    </Layout>
  );
};

export default Dashboard;