import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Save, Edit2, ArrowLeftRight, Plus, Minus, X, PlusCircle, GitBranch, Type, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import bodyFrontWorkout from "@/assets/body-front-workout-transparent.png";
import bodyBackWorkout from "@/assets/body-back-workout-transparent.png";
import { ExerciseList } from "@/components/ExerciseList";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutMuscleMapProps {
  view: "front" | "back";
  selectedMuscle: string | null;
  onMuscleSelect: (muscle: string) => void;
}

interface MuscleLabel {
  name: string;
  muscle: string;
  side: "left" | "right";
  top: string;
  left?: string;
  right?: string;
  fontSize?: number;
  lineWidth?: number;
  pointSide?: "left" | "right";
  lineType?: "straight" | "angled";
  hideLabel?: boolean;
  hideLine?: boolean;
}

const frontLabels: MuscleLabel[] = [
  { name: "Peitoral", muscle: "chest", side: "right", top: "20%" },
  { name: "Ombros", muscle: "shoulders", side: "left", top: "16%" },
  { name: "Bíceps", muscle: "biceps", side: "left", top: "30%" },
  { name: "Abdômen", muscle: "abs", side: "right", top: "36%" },
  { name: "Antebraços", muscle: "forearms", side: "right", top: "48%" },
  { name: "Oblíquos", muscle: "obliques", side: "left", top: "44%" },
  { name: "Quadríceps", muscle: "legs", side: "left", top: "62%" },
  { name: "Adutores", muscle: "adductors", side: "right", top: "62%" },
  { name: "Panturrilhas", muscle: "calves", side: "right", top: "78%" },
];

const backLabels: MuscleLabel[] = [
  { name: "Trapézio", muscle: "traps", side: "right", top: "14%" },
  { name: "Dorsais", muscle: "back", side: "right", top: "28%" },
  { name: "Tríceps", muscle: "triceps", side: "left", top: "28%" },
  { name: "Lombares", muscle: "lower_back", side: "left", top: "42%" },
  { name: "Glúteos", muscle: "glutes", side: "right", top: "48%" },
  { name: "Isquiotibiais", muscle: "hamstrings", side: "left", top: "62%" },
  { name: "Panturrilhas", muscle: "calves", side: "right", top: "76%" },
];

export function WorkoutMuscleMap({ view, selectedMuscle, onMuscleSelect }: WorkoutMuscleMapProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Chaves separadas para mobile e desktop
  const storageKey = `muscle-labels-${view}-${isMobile ? 'mobile' : 'desktop'}`;
  const [labels, setLabels] = useState<MuscleLabel[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : (view === "front" ? frontLabels : backLabels);
  });
  const [isEditing, setIsEditing] = useState(() => {
    const savedEditMode = localStorage.getItem('muscle-map-edit-mode');
    return savedEditMode === 'true';
  });
  const [labelSize, setLabelSize] = useState(14);
  const [lineWidth, setLineWidth] = useState(40);
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showExercises, setShowExercises] = useState(false);
  const [selectedMuscleForExercises, setSelectedMuscleForExercises] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabelData, setNewLabelData] = useState({ name: "", muscle: "", side: "left" as "left" | "right" });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setLabels(saved ? JSON.parse(saved) : (view === "front" ? frontLabels : backLabels));
  }, [view, storageKey]);

  const toggleEditMode = () => {
    const newEditMode = !isEditing;
    setIsEditing(newEditMode);
    localStorage.setItem('muscle-map-edit-mode', String(newEditMode));
    if (newEditMode) {
      toast.success("Modo Editor ativado!");
    } else {
      toast.info("Modo Editor desativado");
    }
  };

  const handleSavePositions = () => {
    localStorage.setItem(storageKey, JSON.stringify(labels));
    toast.success("Posições salvas com sucesso!");
  };

  const handleResetPositions = () => {
    const defaultLabels = view === "front" ? frontLabels : backLabels;
    setLabels(defaultLabels);
    localStorage.removeItem(storageKey);
    toast.success("Posições resetadas!");
  };

  const handleFlipSide = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, side: label.side === "left" ? "right" : "left" }
        : label
    ));
  };

  const handleFlipPointSide = (muscle: string) => {
    setLabels(prev => prev.map(label => {
      if (label.muscle === muscle) {
        const currentPointSide = label.pointSide || label.side;
        return { ...label, pointSide: currentPointSide === "left" ? "right" : "left" };
      }
      return label;
    }));
  };

  const handleToggleLineType = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, lineType: label.lineType === "angled" ? "straight" : "angled" }
        : label
    ));
  };

  const handleToggleLabel = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, hideLabel: !label.hideLabel }
        : label
    ));
  };

  const handleToggleLine = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, hideLine: !label.hideLine }
        : label
    ));
  };

  const handleDragStart = (e: React.MouseEvent, muscle: string) => {
    if (!isEditing) return;
    e.preventDefault();
    setDraggedLabel(muscle);
    
    const label = labels.find(l => l.muscle === muscle);
    if (!label) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isEditing || !draggedLabel) return;
    
    const container = document.getElementById('muscle-map-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const topPercent = ((e.clientY - containerRect.top - dragOffset.y) / containerRect.height) * 100;
    const leftPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    setLabels(prev => prev.map(label => 
      label.muscle === draggedLabel
        ? { 
            ...label, 
            top: `${Math.max(0, Math.min(100, topPercent))}%`,
            ...(label.side === "left" 
              ? { left: `${Math.max(0, Math.min(50, leftPercent))}%` }
              : { right: `${Math.max(0, Math.min(50, 100 - leftPercent))}%` }
            )
          }
        : label
    ));
  };

  const handleDragEnd = () => {
    setDraggedLabel(null);
  };

  const handleLabelClick = (muscle: string) => {
    if (isEditing) return;
    
    // Encontrar o label correspondente
    const label = labels.find(l => l.muscle === muscle);
    const muscleName = label ? label.name.toLowerCase() : muscle;
    
    // Navegar para a página de treino do músculo
    navigate(`/workouts/muscle/${muscleName}`);
  };

  const getMuscleName = (muscle: string) => {
    const label = labels.find(l => l.muscle === muscle);
    return label ? label.name : muscle;
  };

  const handleIncreaseFontSize = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, fontSize: (label.fontSize || labelSize) + 1 }
        : label
    ));
  };

  const handleDecreaseFontSize = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, fontSize: Math.max(10, (label.fontSize || labelSize) - 1) }
        : label
    ));
  };

  const handleIncreaseLineWidth = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, lineWidth: (label.lineWidth || lineWidth) + 5 }
        : label
    ));
  };

  const handleDecreaseLineWidth = (muscle: string) => {
    setLabels(prev => prev.map(label => 
      label.muscle === muscle 
        ? { ...label, lineWidth: Math.max(20, (label.lineWidth || lineWidth) - 5) }
        : label
    ));
  };

  const handleToggleLabelEdit = (muscle: string, e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    setEditingLabel(editingLabel === muscle ? null : muscle);
  };

  const handleAddLabel = () => {
    if (!newLabelData.name.trim() || !newLabelData.muscle.trim()) {
      toast.error("Preencha nome e identificador do músculo");
      return;
    }

    const newLabel: MuscleLabel = {
      name: newLabelData.name,
      muscle: newLabelData.muscle.toLowerCase().replace(/\s+/g, '_'),
      side: newLabelData.side,
      top: "50%",
      fontSize: labelSize,
      lineWidth: lineWidth
    };

    setLabels(prev => [...prev, newLabel]);
    setNewLabelData({ name: "", muscle: "", side: "left" });
    setShowAddDialog(false);
    toast.success("Label adicionado! Não esqueça de salvar as posições.");
  };

  const handleRemoveLabel = (muscle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLabels(prev => prev.filter(label => label.muscle !== muscle));
    setEditingLabel(null);
    toast.success("Label removido! Não esqueça de salvar as posições.");
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-0 gap-2">
      {/* Edit Controls - Mobile e Desktop */}
      <>
        <div className="flex gap-2 flex-wrap justify-center">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="default"
                className={`gap-2 ${isEditing ? 'animate-pulse' : ''}`}
                onClick={toggleEditMode}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? "Modo Editor Ativo" : "🎨 Ativar Modo Editor"}
              </Button>

              {isEditing && (
                <>
                  <Button variant="outline" size="default" className="gap-2" onClick={handleSavePositions}>
                    <Save className="w-4 h-4" />
                    Salvar Posições
                  </Button>
                  <Button variant="outline" size="default" onClick={handleResetPositions}>
                    Resetar
                  </Button>
                  <Button variant="outline" size="default" className="gap-2" onClick={() => setShowAddDialog(true)}>
                    <PlusCircle className="w-4 h-4" />
                    Adicionar Label
                  </Button>
                </>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="default" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Ajustes Globais
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="label-size">Tamanho do Texto Padrão: {labelSize}px</Label>
                      <Slider
                        id="label-size"
                        min={10}
                        max={24}
                        step={1}
                        value={[labelSize]}
                        onValueChange={(value) => setLabelSize(value[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line-width">Largura da Linha Padrão: {lineWidth}px</Label>
                      <Slider
                        id="line-width"
                        min={20}
                        max={100}
                        step={5}
                        value={[lineWidth]}
                        onValueChange={(value) => setLineWidth(value[0])}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {isEditing && (
              <Card className="bg-primary/5 border-primary/20 p-4 max-w-2xl">
                <div className="text-sm space-y-2">
                  <p className="font-semibold text-primary flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Como usar o Modo Editor:
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• <strong>Arrastar:</strong> Clique e segure em qualquer label para mover livremente em todas as direções</li>
                    <li>• <strong>Editar Texto:</strong> Clique no label para abrir controles e ajustar tamanho do texto (+ / -)</li>
                    <li>• <strong>Editar Linha:</strong> Use os controles do label para ajustar tamanho da linha conectora (+ / -)</li>
                    <li>• <strong>Salvar:</strong> Não esqueça de clicar em "Salvar Posições" quando terminar</li>
                  </ul>
                </div>
              </Card>
            )}
      </>

      <div
        id="muscle-map-container"
        className="relative w-full max-w-[600px] flex items-center justify-center"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Body Image - transparent background adapts to theme */}
        <div className="relative flex items-center justify-center transition-all duration-300 ease-in-out">
          <img
            src={view === "front" ? bodyFrontWorkout : bodyBackWorkout}
            alt={view === "front" ? "Vista frontal do corpo" : "Vista traseira do corpo"}
            className="w-[280px] h-auto object-contain transition-opacity duration-300"
            style={{ maxHeight: "600px" }}
          />
        </div>

        {/* Muscle Labels */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {labels.map((label) => (
            <div
              key={label.muscle}
              className={`absolute pointer-events-auto ${
                !label.left && !label.right ? (label.side === "left" ? "left-0" : "right-0") : ""
              } ${isEditing ? "cursor-move hover:scale-105" : "cursor-pointer"} group ${
                draggedLabel === label.muscle ? "z-50 opacity-80 scale-110" : ""
              } ${editingLabel === label.muscle ? "z-50" : ""} transition-all duration-200`}
              style={{ 
                top: label.top,
                left: label.side === "left" && label.left ? label.left : undefined,
                right: label.side === "right" && label.right ? label.right : undefined
              }}
              onClick={(e) => isEditing ? handleToggleLabelEdit(label.muscle, e) : handleLabelClick(label.muscle)}
              onMouseDown={(e) => isEditing && handleDragStart(e, label.muscle)}
            >
              <div className="space-y-1">
                <div className={`flex items-center ${label.side === "left" ? "flex-row" : "flex-row-reverse"} gap-1`}>
                  <div
                    className={`font-medium px-2 py-1 whitespace-nowrap ${
                      label.side === "left" ? "text-left" : "text-right"
                    } ${
                      selectedMuscle === label.muscle
                        ? "font-bold text-primary"
                        : "text-foreground group-hover:font-semibold group-hover:text-primary"
                    } ${isEditing && !label.hideLabel ? "bg-accent/20 rounded" : ""} ${
                      editingLabel === label.muscle ? "ring-2 ring-primary animate-pulse bg-primary/10" : ""
                    } transition-all duration-200`}
                    style={{ fontSize: `${label.fontSize || labelSize}px` }}
                  >
                    {label.name}
                  </div>

                  {!label.hideLine && (
                    <div className={`relative flex items-center ${
                      (label.pointSide || label.side) !== label.side ? "flex-row-reverse" : ""
                    }`}>
                      {label.lineType === "angled" ? (
                        // Linha em ângulo (formato L)
                        <svg 
                          width={label.lineWidth || lineWidth} 
                          height="20" 
                          className="overflow-visible"
                          style={{ 
                            transform: (label.pointSide || label.side) === "left" ? "scaleX(-1)" : "none"
                          }}
                        >
                          <path
                            d={`M 0,10 L ${((label.lineWidth || lineWidth) * 0.6)},10 L ${(label.lineWidth || lineWidth)},0`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className={`${
                              selectedMuscle === label.muscle ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                            } transition-colors duration-200`}
                          />
                          <circle
                            cx={(label.lineWidth || lineWidth)}
                            cy="0"
                            r="2"
                            className={`${
                              selectedMuscle === label.muscle ? "fill-primary" : "fill-muted-foreground group-hover:fill-primary"
                            } transition-colors duration-200`}
                          />
                        </svg>
                      ) : (
                        // Linha reta (padrão)
                        <>
                          <div
                            className={`h-[1px] ${
                              selectedMuscle === label.muscle ? "bg-primary" : "bg-muted-foreground group-hover:bg-primary"
                            } transition-colors duration-200`}
                            style={{ width: `${label.lineWidth || lineWidth}px` }}
                          />
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedMuscle === label.muscle ? "bg-primary" : "bg-muted-foreground group-hover:bg-primary"
                            } transition-colors duration-200`}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Controls */}
                {isEditing && editingLabel === label.muscle && (
                  <Card className="p-3 mt-2 shadow-xl z-50 bg-primary/5 backdrop-blur border-2 border-primary/30">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-primary mb-2">Controles de Edição</div>
                      <div className="flex gap-1 items-center flex-wrap">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-3"
                          onClick={(e) => handleRemoveLabel(label.muscle, e)}
                          title="Remover label"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlipSide(label.muscle);
                        }}
                        title="Inverter lado do label"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlipPointSide(label.muscle);
                        }}
                        title="Inverter lado do ponto"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span className="text-[10px]">P</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLineType(label.muscle);
                        }}
                        title={`Tipo de linha: ${label.lineType === "angled" ? "Ângulo" : "Reta"}`}
                      >
                        <GitBranch className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={label.hideLine ? "default" : "ghost"}
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLine(label.muscle);
                        }}
                        title={label.hideLine ? "Mostrar linha" : "Ocultar linha"}
                      >
                        <Slash className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={label.hideLabel ? "default" : "ghost"}
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLabel(label.muscle);
                        }}
                        title={label.hideLabel ? "Mostrar label" : "Ocultar label"}
                      >
                        <Type className="w-3 h-3" />
                      </Button>
                      </div>
                      
                      {/* Tamanho do Texto */}
                      <div className="flex gap-2 items-center justify-between bg-background/50 p-2 rounded border border-primary/20">
                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                          <Type className="w-3 h-3" />
                          Tamanho do Texto
                        </span>
                        <div className="flex gap-1 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecreaseFontSize(label.muscle);
                            }}
                            title="Diminuir texto"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold px-2 min-w-[30px] text-center bg-background rounded">
                            {label.fontSize || labelSize}px
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncreaseFontSize(label.muscle);
                            }}
                            title="Aumentar texto"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Tamanho da Linha */}
                      <div className="flex gap-2 items-center justify-between bg-background/50 p-2 rounded border border-primary/20">
                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          Tamanho da Linha
                        </span>
                        <div className="flex gap-1 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecreaseLineWidth(label.muscle);
                            }}
                            title="Diminuir linha"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold px-2 min-w-[30px] text-center bg-background rounded">
                            {label.lineWidth || lineWidth}px
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncreaseLineWidth(label.muscle);
                            }}
                            title="Aumentar linha"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Modal */}
      <Dialog open={showExercises} onOpenChange={setShowExercises}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Exercícios para {selectedMuscleForExercises && getMuscleName(selectedMuscleForExercises)}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            {selectedMuscleForExercises && (
              <ExerciseList muscle={selectedMuscleForExercises as any} searchQuery="" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Label Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label-name">Nome do Músculo</Label>
              <Input
                id="label-name"
                placeholder="Ex: Deltoides"
                value={newLabelData.name}
                onChange={(e) => setNewLabelData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label-muscle">Identificador (usado para exercícios)</Label>
              <Input
                id="label-muscle"
                placeholder="Ex: deltoids"
                value={newLabelData.muscle}
                onChange={(e) => setNewLabelData(prev => ({ ...prev, muscle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Lado Inicial</Label>
              <div className="flex gap-2">
                <Button
                  variant={newLabelData.side === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewLabelData(prev => ({ ...prev, side: "left" }))}
                >
                  Esquerda
                </Button>
                <Button
                  variant={newLabelData.side === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewLabelData(prev => ({ ...prev, side: "right" }))}
                >
                  Direita
                </Button>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddLabel}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
