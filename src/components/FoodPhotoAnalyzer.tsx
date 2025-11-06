import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FoodAnalysisResult {
  status: string;
  analise: {
    alimentos: Array<{
      name: string;
      quantity: string;
      confidence: number;
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
      };
      source: string;
    }>;
    total_refeicao: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
    };
    metadados: {
      timestamp: string;
      fontes_utilizadas: string[];
      confianca_media: number;
    };
  };
}

export const FoodPhotoAnalyzer = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      analyzeImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log("Enviando imagem para análise...");
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64 }
      });

      if (error) throw error;

      console.log("Resultado da análise:", data);
      
      if (data.status === 'sucesso') {
        setAnalysisResult(data);
        toast.success("Alimento identificado com sucesso!");
      } else {
        throw new Error(data.error || 'Erro na análise');
      }

    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      toast.error("Erro ao analisar imagem. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToDatabase = async () => {
    if (!analysisResult || !user) return;

    try {
      const { total_refeicao, alimentos } = analysisResult.analise;

      // Preparar detalhes dos alimentos
      const foodsDetails = alimentos.map(food => ({
        name: food.name,
        quantity: food.quantity,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
        confidence: food.confidence,
        source: food.source
      }));

      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        meal_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        meal_date: new Date().toISOString(),
        calories: Math.round(total_refeicao.calories),
        protein: Math.round(total_refeicao.protein),
        carbs: Math.round(total_refeicao.carbs),
        fat: Math.round(total_refeicao.fat),
        foods_details: foodsDetails
      });

      if (error) throw error;

      toast.success("Refeição registrada com sucesso!");
      setSelectedImage(null);
      setAnalysisResult(null);
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast.error("Erro ao salvar refeição");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Análise por Foto</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tire ou envie uma foto do seu prato e deixe a IA identificar os alimentos e calcular os nutrientes automaticamente.
        </p>

        <div className="flex flex-col gap-4">
          <label htmlFor="food-photo" className="cursor-pointer">
            <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 hover:border-primary transition-colors text-center">
              <Camera className="w-12 h-12 mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium">Clique para enviar uma foto</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG (máx 5MB)</p>
            </div>
            <input
              id="food-photo"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
            />
          </label>

          {selectedImage && (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Alimento para análise" 
                className="w-full rounded-lg max-h-64 object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analisando alimento...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Alimentos Identificados
                </h4>
                <div className="space-y-2">
                  {analysisResult.analise.alimentos.map((food, index) => (
                    <div key={index} className="bg-background rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground">{food.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {Math.round(food.nutrition.calories)} kcal
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confiança: {Math.round(food.confidence * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-muted-foreground">Proteína:</span>
                          <span className="ml-1 font-medium">{Math.round(food.nutrition.protein)}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbo:</span>
                          <span className="ml-1 font-medium">{Math.round(food.nutrition.carbs)}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gordura:</span>
                          <span className="ml-1 font-medium">{Math.round(food.nutrition.fat)}g</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Fonte: {food.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Total da Refeição</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(analysisResult.analise.total_refeicao.calories)}
                    </p>
                    <p className="text-xs text-muted-foreground">Calorias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {Math.round(analysisResult.analise.total_refeicao.protein)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">
                      {Math.round(analysisResult.analise.total_refeicao.carbs)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Carboidratos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(analysisResult.analise.total_refeicao.fat)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Gorduras</p>
                  </div>
                </div>
              </div>

              <Button onClick={saveToDatabase} className="w-full" size="lg">
                Salvar Refeição
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
