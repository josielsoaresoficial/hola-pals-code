import { Layout } from "@/components/Layout";
import { GymCard } from "@/components/GymCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Utensils, Target, Zap, Plus, Clock, TrendingUp, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NutriAI from "@/components/NutriAI";
import { NutritionGoalsDialog } from "@/components/NutritionGoalsDialog";
import { FoodPhotoAnalyzer } from "@/components/FoodPhotoAnalyzer";
import { WeeklyReportDialog } from "@/components/WeeklyReportDialog";
import { EditMealDialog } from "@/components/EditMealDialog";

const Nutrition = () => {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savedMeals, setSavedMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2200,
    protein: 120,
    carbs: 220,
    fat: 60
  });
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Carregar metas nutricionais do perfil
  const loadNutritionGoals = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_calories_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
        .eq('user_id', session.session.user.id)
        .single();
      
      if (!error && data) {
        setNutritionGoals({
          calories: data.daily_calories_goal || 2200,
          protein: data.daily_protein_goal || 120,
          carbs: data.daily_carbs_goal || 220,
          fat: data.daily_fat_goal || 60
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao carregar metas:", error);
      }
    }
  };

  // Carregar refeições salvas
  const loadTodayMeals = async () => {
    setIsLoadingMeals(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        setSavedMeals([]);
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await (supabase as any)
        .from('meals')
        .select('*')
        .eq('user_id', session.session.user.id)
        .gte('meal_date', today.toISOString())
        .order('meal_date', { ascending: false });
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error("Erro ao carregar refeições:", error);
        }
      } else {
        setSavedMeals(data || []);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao buscar refeições:", error);
      }
    } finally {
      setIsLoadingMeals(false);
    }
  };
  
  useEffect(() => {
    loadNutritionGoals();
    loadTodayMeals();
  }, []);

  const startCamera = async () => {
    try {
      // Verificar se a API de mídia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Câmera não disponível",
          description: "Seu navegador não suporta acesso à câmera. Tente fazer upload de uma foto.",
          variant: "destructive",
        });
        return;
      }

      // Tentar acessar a câmera com configurações otimizadas
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usar câmera traseira em dispositivos móveis
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      setShowCamera(true);
      
      // Aguardar o videoRef estar disponível
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            toast({
              title: "Erro",
              description: "Não foi possível iniciar a visualização da câmera.",
              variant: "destructive",
            });
          });
        }
      }, 100);
      
    } catch (error) {
      let errorMessage = "Não foi possível acessar a câmera.";
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Permissão de câmera negada. Verifique as configurações do navegador.";
            break;
          case "NotFoundError":
            errorMessage = "Nenhuma câmera encontrada no dispositivo.";
            break;
          case "NotReadableError":
            errorMessage = "Câmera já está em uso por outro aplicativo.";
            break;
          case "OverconstrainedError":
            errorMessage = "Configurações de câmera não suportadas. Tente fazer upload de uma foto.";
            break;
          default:
            errorMessage = `Erro ao acessar câmera: ${error.message}`;
        }
      }
      
      toast({
        title: "Erro na Câmera",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      stopCamera();
      analyzeImage(imageDataUrl);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const selectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        analyzeImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive",
      });
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      // Chamar a edge function de análise de alimentos
      const { data: functionData, error: functionError } = await supabase.functions.invoke('analyze-food', {
        body: { imageData }
      });

      if (functionError) {
        throw new Error(functionError.message || "Erro ao analisar imagem");
      }

      // Normalizar resposta da função (suporte a dois formatos)
      let result: any;
      if (functionData?.success) {
        result = functionData;
      } else if (functionData?.status === 'sucesso' && functionData?.analise) {
        const foods = functionData.analise.alimentos.map((f: any) => {
          const gramsMatch = String(f.quantity || '').match(/(\d+)\s*g/i);
          const portionGrams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
          const confidenceStr = typeof f.confidence === 'string'
            ? f.confidence
            : f.confidence >= 0.85
              ? 'alta'
              : f.confidence >= 0.65
                ? 'média'
                : 'baixa';
          return {
            name: f.name,
            portion: f.quantity,
            portionGrams,
            confidence: confidenceStr,
            calories: f.nutrition?.calories ?? 0,
            protein: f.nutrition?.protein ?? 0,
            carbs: f.nutrition?.carbs ?? 0,
            fat: f.nutrition?.fat ?? 0,
            source: f.source || 'Estimativa',
          };
        });
        result = {
          success: true,
          foods,
          totals: {
            calories: functionData.analise.total_refeicao.calories,
            protein: functionData.analise.total_refeicao.protein,
            carbs: functionData.analise.total_refeicao.carbs,
            fat: functionData.analise.total_refeicao.fat,
          },
          isEstimated: functionData.isEstimated || false,
          notes: functionData.notes || '',
        };
      } else {
        throw new Error(functionData?.error || 'Resposta inválida da análise');
      }

      // Salvar resultado para exibição
      setAnalysisResult(result);

      // Formatar resultados para exibição completa com todos os detalhes
      const foodsList = result.foods
        .map((food: any) => {
          const confidence = food.confidence === 'alta' ? '✓' : 
                           food.confidence === 'média' ? '~' : '?';
          // Incluir nome + descrição detalhada se disponível + porção
          const description = food.portion && food.portion !== `${food.portionGrams}g` 
            ? food.portion 
            : '';
          return `${confidence} ${food.name}${description ? ` ${description}` : ''} (aproximadamente ${food.portionGrams}g)`;
        })
        .join(' ~ ');

      // Salvar refeição no banco de dados
      const mealName = `Refeição: ${result.foods.map((f: any) => f.name).slice(0, 3).join(', ')}${result.foods.length > 3 ? '...' : ''}`;
      
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const { error: saveError } = await (supabase as any)
          .from('meals')
          .insert({
            user_id: session.session.user.id,
            name: mealName,
            calories: Math.round(result.totals.calories),
            protein: result.totals.protein,
            carbs: result.totals.carbs,
            fat: result.totals.fat,
            meal_date: new Date().toISOString(),
            meal_time: new Date().toISOString(),
            foods_details: result.foods,
            is_estimated: result.isEstimated || false,
            notes: result.notes || ''
          });
        
        if (saveError) {
          console.error('Erro ao salvar refeição:', saveError);
          toast({
            title: 'Erro ao salvar',
            description: 'Não foi possível salvar a refeição no histórico.',
            variant: 'destructive',
          });
        } else {
          // Recarregar lista de refeições para atualizar o resumo
          await loadTodayMeals();
          
          // Toast com análise completa e detalhada
          toast({
            title: 'Refeição Salva! 🎉',
            description: `Alimentos identificados: ${foodsList} ✨ Total: ${Math.round(result.totals.calories)} kcal | Proteínas: ${Math.round(result.totals.protein * 10) / 10}g | Carbs: ${Math.round(result.totals.carbs * 10) / 10}g | Gorduras: ${Math.round(result.totals.fat * 10) / 10}g`,
            duration: 8000,
          });
          
          // Limpar a análise após salvar para mostrar que foi salvo com sucesso
          setTimeout(() => {
            resetAnalysis();
          }, 1000);
        }
      }

      // Toast removido daqui - será mostrado após salvar com sucesso
      
    } catch (error) {
      let errorMessage = "Não foi possível analisar a imagem. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes("Limite de requisições")) {
          errorMessage = "Muitas requisições. Aguarde alguns segundos e tente novamente.";
        } else if (error.message.includes("configuração")) {
          errorMessage = "Serviço de análise temporariamente indisponível.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro na Análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
  };

  // Calcular totais das refeições do dia
  const calculateDailyTotals = () => {
    return savedMeals.reduce((totals, meal) => ({
      calories: totals.calories + (Number(meal.calories) || 0),
      protein: totals.protein + (Number(meal.protein) || 0),
      carbs: totals.carbs + (Number(meal.carbs) || 0),
      fat: totals.fat + (Number(meal.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const dailyTotals = calculateDailyTotals();

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRemainingCalories = () => {
    return nutritionGoals.calories - dailyTotals.calories;
  };

  const handleGoalsUpdated = () => {
    loadNutritionGoals();
    setShowGoalsDialog(false);
  };

  const scrollToRecipes = () => {
    const recipesSection = document.getElementById('recipes-section');
    if (recipesSection) {
      recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout>
      <div className="w-full px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Nutrição Inteligente</h1>
            <p className="text-muted-foreground">Análise por IA com 90% de precisão</p>
          </div>
          <div className="flex gap-2">
            <Button variant="nutrition" onClick={startCamera}>
              <Camera className="w-4 h-4" />
              Foto da Refeição
            </Button>
            <Button variant="nutrition-outline" onClick={selectFile}>
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* AI Analysis Card */}
        <GymCard
          variant="nutrition"
          title="Análise por IA"
          description="Tire uma foto da sua refeição para análise instantânea"
          className="text-center"
        >
          <div className="space-y-6">
            <div className="border-2 border-dashed border-secondary/30 rounded-lg p-12 hover:border-secondary/50 transition-colors cursor-pointer">
              <Camera className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analisar Refeição</h3>
              <p className="text-muted-foreground mb-4">
                Nossa IA identifica alimentos, porções e calcula nutrientes automaticamente
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="nutrition" onClick={startCamera}>
                  <Camera className="w-4 h-4" />
                  Tirar Foto
                </Button>
                <Button variant="nutrition-outline" onClick={selectFile}>
                  <Upload className="w-4 h-4" />
                  Escolher Arquivo
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-secondary">90%+</div>
                <div className="text-sm text-muted-foreground">Precisão IA</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">2s</div>
                <div className="text-sm text-muted-foreground">Análise</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">15K+</div>
                <div className="text-sm text-muted-foreground">Alimentos</div>
              </div>
            </div>
          </div>
        </GymCard>

        {/* Daily Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Nutrition Summary */}
          <div className="lg:col-span-2">
            <GymCard
              variant="nutrition"
              title="Resumo Diário"
              description={`${getRemainingCalories()} kcal restantes`}
              className="relative"
            >
              <div className="absolute top-6 right-6">
                <NutritionGoalsDialog 
                  currentGoals={nutritionGoals}
                  onGoalsUpdated={handleGoalsUpdated}
                  open={showGoalsDialog}
                  onOpenChange={setShowGoalsDialog}
                />
              </div>
              <div className="space-y-6">
              {/* Calories Progress */}
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">
                  {Math.round(dailyTotals.calories)}
                </div>
                <div className="text-muted-foreground">
                  de {nutritionGoals.calories} kcal
                </div>
                <Progress 
                  value={getProgressPercentage(dailyTotals.calories, nutritionGoals.calories)} 
                  className="mt-4 h-3"
                />
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-nutrition-subtle">
                  <div className="text-xl font-bold text-secondary">
                    {Math.round(dailyTotals.protein)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Proteínas</div>
                  <Progress 
                    value={getProgressPercentage(dailyTotals.protein, nutritionGoals.protein)} 
                    className="h-1"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Meta: {nutritionGoals.protein}g
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-nutrition-subtle">
                  <div className="text-xl font-bold text-secondary">
                    {Math.round(dailyTotals.carbs)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Carboidratos</div>
                  <Progress 
                    value={getProgressPercentage(dailyTotals.carbs, nutritionGoals.carbs)} 
                    className="h-1"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Meta: {nutritionGoals.carbs}g
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-nutrition-subtle">
                  <div className="text-xl font-bold text-secondary">
                    {Math.round(dailyTotals.fat)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Gorduras</div>
                  <Progress 
                    value={getProgressPercentage(dailyTotals.fat, nutritionGoals.fat)} 
                    className="h-1"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Meta: {nutritionGoals.fat}g
                  </div>
                </div>
              </div>
            </div>
          </GymCard>
          </div>

          {/* Quick Actions */}
          <GymCard
            title="Ações Rápidas"
            description="Adicione refeições rapidamente"
          >
            <div className="space-y-3">
              <Button variant="nutrition" className="w-full" onClick={startCamera}>
                <Plus className="w-4 h-4" />
                Próxima Refeição
              </Button>
              <Button variant="outline" className="w-full" onClick={scrollToRecipes}>
                <Utensils className="w-4 h-4" />
                Receitas Sugeridas
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowGoalsDialog(true)}>
                <Target className="w-4 h-4" />
                Ajustar Metas
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowWeeklyReport(true)}>
                <TrendingUp className="w-4 h-4" />
                Relatório Semanal
              </Button>
            </div>
          </GymCard>
        </div>

        {/* Today's Meals */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Refeições de Hoje</h2>
            <p className="text-muted-foreground">Histórico das suas refeições analisadas</p>
          </div>

          {isLoadingMeals ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando refeições...
            </div>
          ) : savedMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-border/50 rounded-lg p-6">
              <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma refeição registrada hoje</p>
              <p className="text-sm mt-1">Tire uma foto para começar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedMeals.map((meal) => {
                const mealTime = new Date(meal.meal_time || meal.meal_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={meal.id}
                    className="p-6 rounded-lg glass-card border border-border/50 hover:border-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedMeal(selectedMeal === meal.id ? null : meal.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">🍽️</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1">Refeição: {meal.name.replace('Refeição: ', '')}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {mealTime}
                            {meal.is_estimated && (
                              <Badge className="text-xs bg-orange-500 hover:bg-orange-500 text-white border-0">
                                Estimado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">{Math.round(meal.calories || 0)} kcal</div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          P: {Math.round((meal.protein || 0) * 10) / 10}g • C: {Math.round((meal.carbs || 0) * 10) / 10}g • G: {Math.round((meal.fat || 0) * 10) / 10}g
                        </div>
                      </div>
                    </div>

                    {selectedMeal === meal.id && (
                      <div className="mt-6 pt-4 border-t border-border/50">
                        <h4 className="font-semibold mb-4">Alimentos identificados:</h4>
                        
                        {meal.foods_details && Array.isArray(meal.foods_details) ? (
                          <ul className="space-y-4 mb-6">
                            {meal.foods_details.map((food: any, index: number) => (
                              <li key={index}>
                                <div className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-1 text-base">•</span>
                                  <div className="flex-1">
                                    <div className="text-sm">
                                      <span className="font-normal">
                                        {food.name} ({food.portionGrams || food.portion}g)
                                      </span>
                                      <span className="ml-2">- {food.calories} kcal</span>
                                      {food.isEstimated && (
                                        <span className="ml-2 text-muted-foreground">(estimado)</span>
                                      )}
                                    </div>
                                    {food.description && (
                                      <p className="mt-2 text-sm text-muted-foreground italic leading-relaxed">
                                        {food.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="space-y-2 mb-6">
                            <li className="text-sm flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span>{meal.name.replace('Refeição: ', '')} - {Math.round(meal.calories || 0)} kcal</span>
                            </li>
                          </ul>
                        )}

                        {/* Descrição Detalhada */}
                        {meal.notes && (
                          <div className="mb-6 pb-4 border-b border-border/50">
                            <h4 className="font-semibold mb-2 text-base">Descrição Detalhada:</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed font-notes italic">
                              {meal.notes}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            className="bg-orange-500 hover:bg-orange-600 text-white border-0" 
                            size="sm"
                            onClick={() => {
                              setEditingMeal(meal);
                              setShowEditDialog(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            Duplicar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meal Suggestions */}
        <GymCard
          id="recipes-section"
          title="Sugestões Personalizadas"
          description="Baseado nos seus objetivos e preferências"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-nutrition-subtle">
              <div className="text-lg mb-2">🥗</div>
              <h3 className="font-semibold mb-1">Salada Proteica</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Perfeita para atingir sua meta de proteína
              </p>
              <div className="text-sm">
                <span className="font-medium">380 kcal</span> • 
                <span className="text-secondary"> 35g proteína</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-nutrition-subtle">
              <div className="text-lg mb-2">🍓</div>
              <h3 className="font-semibold mb-1">Smoothie Pós-Treino</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ideal para recuperação muscular
              </p>
              <div className="text-sm">
                <span className="font-medium">320 kcal</span> • 
                <span className="text-secondary"> 28g proteína</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-nutrition-subtle">
              <div className="text-lg mb-2">🐟</div>
              <h3 className="font-semibold mb-1">Salmão Grelhado</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Rico em ômega-3 e proteínas
              </p>
              <div className="text-sm">
                <span className="font-medium">420 kcal</span> • 
                <span className="text-secondary"> 38g proteína</span>
              </div>
            </div>
          </div>
        </GymCard>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative bg-background rounded-lg p-4 max-w-sm sm:max-w-md w-full mx-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={stopCamera}
                className="absolute top-2 right-2 z-10"
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">Capturar Refeição</h3>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg max-h-[50vh] sm:max-h-none object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="nutrition" onClick={capturePhoto}>
                    <Camera className="w-4 h-4" />
                    Capturar
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Analysis Modal */}
        {(capturedImage || isAnalyzing) && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative bg-background rounded-lg p-4 max-w-sm sm:max-w-md w-full mx-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAnalysis}
                className="absolute top-2 right-2 z-10"
                disabled={isAnalyzing}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  {isAnalyzing ? "Analisando..." : "Análise Concluída"}
                </h3>
                {capturedImage && (
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Refeição capturada"
                      className="w-full rounded-lg max-h-[50vh] sm:max-h-none object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-sm">Analisando nutrientes...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!isAnalyzing && analysisResult && (
                  <div className="space-y-4">
                    <div className="text-left">
                      <p className="text-sm font-medium mb-2">Análise Concluída! 🎉</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Alimentos identificados: {analysisResult.foods.map((food: any, index: number) => {
                          const confidence = food.confidence === 'alta' ? '✓' : 
                                           food.confidence === 'média' ? '~' : '?';
                          return `${index > 0 ? '~ ' : ''}${confidence} ${food.name} ~${food.portionGrams || 100}g (total na imagem) (aproximadamente ${food.portionGrams || 100}g)`;
                        }).join(' ')} ✨ Total: {Math.round(analysisResult.totals.calories)} kcal | Proteínas: {Math.round(analysisResult.totals.protein * 10) / 10}g | Carbs: {Math.round(analysisResult.totals.carbs * 10) / 10}g | Gorduras: {Math.round(analysisResult.totals.fat * 10) / 10}g
                      </p>
                    </div>

                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        Refeição analisada com sucesso! Os nutrientes foram calculados.
                      </p>
                    </div>

                    <Button variant="nutrition" onClick={resetAnalysis} className="w-full">
                      Analisar Nova Refeição
                    </Button>
                  </div>
                )}
                {!isAnalyzing && !analysisResult && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Refeição analisada com sucesso! Os nutrientes foram calculados.
                    </p>
                    <Button variant="nutrition" onClick={resetAnalysis}>
                      Analisar Nova Refeição
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Food Photo Analyzer Component */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <FoodPhotoAnalyzer />
      </div>
      
      <NutriAI />
      
      {/* Weekly Report Dialog */}
      <WeeklyReportDialog 
        open={showWeeklyReport}
        onOpenChange={setShowWeeklyReport}
      />

      <EditMealDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        meal={editingMeal}
        onMealUpdated={() => {
          loadTodayMeals();
          setShowEditDialog(false);
          setEditingMeal(null);
        }}
      />
    </Layout>
  );
};

export default Nutrition;