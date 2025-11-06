import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Food {
  name: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: string;
}

interface EditMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: any;
  onMealUpdated: () => void;
}

export function EditMealDialog({ open, onOpenChange, meal, onMealUpdated }: EditMealDialogProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (meal?.foods_details && Array.isArray(meal.foods_details)) {
      setFoods(meal.foods_details.map((food: any) => ({
        name: food.name,
        portionGrams: food.portionGrams || 100,
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        confidence: food.confidence
      })));
    }
  }, [meal]);

  const handleGramsChange = (index: number, newGrams: string) => {
    const grams = parseFloat(newGrams) || 0;
    const updatedFoods = [...foods];
    const food = updatedFoods[index];
    
    // Calcular proporção para ajustar nutrientes
    const originalGrams = meal.foods_details[index].portionGrams || 100;
    const ratio = grams / originalGrams;
    
    const originalFood = meal.foods_details[index];
    updatedFoods[index] = {
      ...food,
      portionGrams: grams,
      calories: Math.round((originalFood.calories || 0) * ratio),
      protein: Math.round((originalFood.protein || 0) * ratio * 10) / 10,
      carbs: Math.round((originalFood.carbs || 0) * ratio * 10) / 10,
      fat: Math.round((originalFood.fat || 0) * ratio * 10) / 10,
    };
    
    setFoods(updatedFoods);
  };

  const calculateTotals = () => {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const totals = calculateTotals();
      
      const { error } = await (supabase as any)
        .from('meals')
        .update({
          foods_details: foods,
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
        })
        .eq('id', meal.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Refeição atualizada com sucesso.",
      });

      onMealUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a refeição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Gramaturas dos Alimentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {foods.map((food, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{food.name}</h4>
                {food.confidence && (
                  <span className="text-xs text-muted-foreground">
                    Confiança: {food.confidence}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`grams-${index}`}>Gramatura (g)</Label>
                  <Input
                    id={`grams-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={food.portionGrams}
                    onChange={(e) => handleGramsChange(index, e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-muted-foreground">
                    <div>{food.calories} kcal</div>
                    <div className="flex gap-2">
                      <span>P: {food.protein}g</span>
                      <span>C: {food.carbs}g</span>
                      <span>G: {food.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <h4 className="font-semibold mb-2">Total da Refeição</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{Math.round(totals.calories)}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(totals.protein * 10) / 10}g</div>
                <div className="text-xs text-muted-foreground">Proteína</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(totals.carbs * 10) / 10}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Math.round(totals.fat * 10) / 10}g</div>
                <div className="text-xs text-muted-foreground">Gordura</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
