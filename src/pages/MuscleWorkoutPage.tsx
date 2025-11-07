import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

// Mapeamento de nomes de músculos para dados de treino
const muscleWorkoutData: Record<string, {
  title: string;
  description: string;
  tags: string[];
  days: {
    day: string;
    exercises: { name: string; sets?: string }[];
  }[];
}> = {
  ombros: {
    title: "Foco em Ombros",
    description: "Programa completo de 30 dias para desenvolvimento e fortalecimento dos deltoides. Inclui exercícios compostos e isolados para trabalhar todas as cabeças do deltoide: anterior, medial e posterior.",
    tags: ["Ombros", "Força", "Hipertrofia", "30 dias"],
    days: [
      { day: "Dia 1 - Ombros Anterior", exercises: [
        { name: "Desenvolvimento com Halteres", sets: "4x12" },
        { name: "Elevação Frontal", sets: "3x15" },
        { name: "Desenvolvimento Arnold", sets: "4x10" },
        { name: "Elevação Lateral", sets: "3x15" },
        { name: "Push Press", sets: "4x8" },
      ]},
      { day: "Dia 2 - Ombros Medial", exercises: [
        { name: "Elevação Lateral com Halteres", sets: "4x15" },
        { name: "Remada Alta", sets: "4x12" },
        { name: "Elevação Lateral no Cabo", sets: "3x20" },
        { name: "Face Pull", sets: "4x15" },
        { name: "Crucifixo Invertido", sets: "3x12" },
      ]},
      { day: "Dia 3 - Ombros Posterior", exercises: [
        { name: "Remada Alta Pegada Fechada", sets: "4x12" },
        { name: "Crucifixo Invertido", sets: "4x15" },
        { name: "Face Pull", sets: "4x15" },
        { name: "Elevação Posterior", sets: "3x20" },
        { name: "Remada em Pé com Barra", sets: "4x10" },
      ]},
      { day: "Dia 4 - Full Deltoides", exercises: [
        { name: "Desenvolvimento Militar", sets: "5x8" },
        { name: "Elevação Lateral + Frontal", sets: "3x12+12" },
        { name: "Remada Alta Ampla", sets: "4x12" },
        { name: "Arnold Press", sets: "4x10" },
        { name: "Finalizador: Elevações 21s", sets: "3x21" },
      ]},
      { day: "Dia 5 - Força e Potência", exercises: [
        { name: "Desenvolvimento com Barra", sets: "5x5" },
        { name: "Push Press Pesado", sets: "4x6" },
        { name: "Remada Alta Barra Pesada", sets: "4x8" },
        { name: "Encolhimento de Ombros", sets: "4x12" },
        { name: "Desenvolvimento Unilateral", sets: "3x10" },
      ]},
    ]
  },
  glúteos: {
    title: "Foco em Glúteos",
    description: "Programa especializado para desenvolvimento e tonificação dos glúteos. Combina exercícios de ativação, força e hipertrofia para resultados completos.",
    tags: ["Glúteos", "Pernas", "Hipertrofia", "Definição"],
    days: [
      { day: "Dia 1 - Ativação e Base", exercises: [
        { name: "Agachamento Livre", sets: "4x12" },
        { name: "Hip Thrust", sets: "4x15" },
        { name: "Afundo Búlgaro", sets: "3x12" },
        { name: "Abdução na Máquina", sets: "4x20" },
        { name: "Ponte de Glúteos", sets: "4x15" },
      ]},
      { day: "Dia 2 - Força e Potência", exercises: [
        { name: "Agachamento Sumô", sets: "4x10" },
        { name: "Levantamento Terra Romeno", sets: "4x12" },
        { name: "Hip Thrust com Barra", sets: "5x8" },
        { name: "Step Up com Halteres", sets: "3x12" },
        { name: "Coice na Polia", sets: "4x15" },
      ]},
      { day: "Dia 3 - Volume e Hipertrofia", exercises: [
        { name: "Agachamento Hack", sets: "4x15" },
        { name: "Stiff", sets: "4x12" },
        { name: "Hip Thrust Alto Volume", sets: "4x20" },
        { name: "Afundo Caminhando", sets: "4x20 passos" },
        { name: "Abdução com Caneleira", sets: "4x25" },
      ]},
      { day: "Dia 4 - Isolamento", exercises: [
        { name: "Cadeira Abdutora", sets: "5x20" },
        { name: "Coice na Polia Alternado", sets: "4x15" },
        { name: "Ponte Unilateral", sets: "4x12" },
        { name: "Elevação Pélvica", sets: "4x15" },
        { name: "Fire Hydrants", sets: "4x20" },
      ]},
      { day: "Dia 5 - Full Lower", exercises: [
        { name: "Agachamento Completo", sets: "5x10" },
        { name: "Terra Tradicional", sets: "4x8" },
        { name: "Hip Thrust Pesado", sets: "5x6" },
        { name: "Leg Press Pés Altos", sets: "4x15" },
        { name: "Abdução Superset Adução", sets: "4x15+15" },
      ]},
    ]
  },
  peitoral: {
    title: "Foco em Peitoral",
    description: "Programa completo para desenvolvimento do peitoral. Trabalha todas as porções: superior, medial e inferior, com exercícios variados para massa e definição muscular.",
    tags: ["Peitoral", "Força", "Hipertrofia", "Upper Body"],
    days: [
      { day: "Dia 1 - Peitoral Superior", exercises: [
        { name: "Supino Inclinado com Barra", sets: "4x10" },
        { name: "Crucifixo Inclinado", sets: "4x12" },
        { name: "Flexão Declinada", sets: "3x15" },
        { name: "Cross Over Superior", sets: "3x15" },
        { name: "Supino Inclinado com Halteres", sets: "4x12" },
      ]},
      { day: "Dia 2 - Peitoral Medial", exercises: [
        { name: "Supino Reto com Barra", sets: "5x8" },
        { name: "Supino com Halteres", sets: "4x10" },
        { name: "Crucifixo Reto", sets: "4x12" },
        { name: "Flexão de Braço", sets: "4x15" },
        { name: "Cross Over Médio", sets: "3x15" },
      ]},
      { day: "Dia 3 - Peitoral Inferior", exercises: [
        { name: "Supino Declinado", sets: "4x10" },
        { name: "Paralelas para Peito", sets: "4x12" },
        { name: "Cross Over Inferior", sets: "4x15" },
        { name: "Crucifixo Declinado", sets: "3x12" },
        { name: "Push Up Diamante", sets: "3x15" },
      ]},
      { day: "Dia 4 - Full Chest", exercises: [
        { name: "Supino Reto Pesado", sets: "5x5" },
        { name: "Supino Inclinado", sets: "4x10" },
        { name: "Paralelas", sets: "3x12" },
        { name: "Crucifixo na Máquina", sets: "4x15" },
        { name: "Pullover", sets: "3x12" },
      ]},
      { day: "Dia 5 - Volume Alto", exercises: [
        { name: "Supino Guillotina", sets: "4x12" },
        { name: "Supino com Pegada Fechada", sets: "4x10" },
        { name: "Crucifixo Drop Set", sets: "3x12-10-8" },
        { name: "Flexão Variada", sets: "4x15" },
        { name: "Cross Over 100 reps", sets: "1x100" },
      ]},
    ]
  },
  bíceps: {
    title: "Foco em Bíceps",
    description: "Programa intensivo para desenvolvimento dos bíceps. Trabalha cabeça curta, longa e braquial para braços volumosos e definidos.",
    tags: ["Bíceps", "Braços", "Hipertrofia", "Definição"],
    days: [
      { day: "Dia 1 - Bíceps Curto", exercises: [
        { name: "Rosca Direta com Barra", sets: "4x10" },
        { name: "Rosca Scott", sets: "4x12" },
        { name: "Rosca Concentrada", sets: "3x15" },
        { name: "Rosca 21", sets: "3x21" },
        { name: "Rosca com Cabo", sets: "4x15" },
      ]},
      { day: "Dia 2 - Bíceps Longo", exercises: [
        { name: "Rosca Martelo", sets: "4x12" },
        { name: "Rosca Alternada", sets: "4x10" },
        { name: "Rosca Inclinada", sets: "4x12" },
        { name: "Rosca Inversa", sets: "3x15" },
        { name: "Spider Curl", sets: "3x12" },
      ]},
      { day: "Dia 3 - Full Bíceps", exercises: [
        { name: "Rosca Direta Pesada", sets: "5x6" },
        { name: "Rosca Alternada", sets: "4x10" },
        { name: "Rosca Scott", sets: "4x12" },
        { name: "Rosca Martelo", sets: "4x12" },
        { name: "Finalizador 100 reps", sets: "1x100" },
      ]},
      { day: "Dia 4 - Braquial", exercises: [
        { name: "Rosca Martelo com Corda", sets: "4x12" },
        { name: "Rosca Inversa", sets: "4x15" },
        { name: "Rosca Scott Inversa", sets: "3x12" },
        { name: "Rosca Cross Body", sets: "4x10" },
        { name: "Zottman Curl", sets: "3x12" },
      ]},
      { day: "Dia 5 - Volume", exercises: [
        { name: "Rosca Direta Drop Set", sets: "4x12-10-8" },
        { name: "Rosca Alternada", sets: "4x15" },
        { name: "Rosca no Cabo", sets: "4x20" },
        { name: "Rosca Concentrada", sets: "4x15" },
        { name: "Rosca 21 Triple", sets: "3x21" },
      ]},
    ]
  },
  tríceps: {
    title: "Foco em Tríceps",
    description: "Programa completo para tríceps volumosos. Trabalha todas as três cabeças do tríceps com exercícios variados para força e definição.",
    tags: ["Tríceps", "Braços", "Força", "Hipertrofia"],
    days: [
      { day: "Dia 1 - Cabeça Longa", exercises: [
        { name: "Tríceps Francês", sets: "4x12" },
        { name: "Tríceps Overhead", sets: "4x10" },
        { name: "Pullover com Corda", sets: "3x15" },
        { name: "Extensão Unilateral", sets: "3x12" },
        { name: "Tríceps Kickback", sets: "4x15" },
      ]},
      { day: "Dia 2 - Cabeça Lateral", exercises: [
        { name: "Tríceps Pulley", sets: "4x15" },
        { name: "Tríceps Corda", sets: "4x12" },
        { name: "Mergulho na Paralela", sets: "4x10" },
        { name: "Tríceps Testa", sets: "4x12" },
        { name: "Tríceps Inverso", sets: "3x15" },
      ]},
      { day: "Dia 3 - Full Tríceps", exercises: [
        { name: "Supino Fechado", sets: "5x8" },
        { name: "Mergulho Pesado", sets: "4x8" },
        { name: "Tríceps Francês", sets: "4x10" },
        { name: "Tríceps Pulley", sets: "4x15" },
        { name: "Finalizador 100", sets: "1x100" },
      ]},
      { day: "Dia 4 - Força", exercises: [
        { name: "Supino Fechado Pesado", sets: "5x5" },
        { name: "Board Press", sets: "4x6" },
        { name: "JM Press", sets: "4x8" },
        { name: "Mergulho com Peso", sets: "4x10" },
        { name: "Tríceps Overhead", sets: "3x12" },
      ]},
      { day: "Dia 5 - Volume", exercises: [
        { name: "Tríceps Pulley Drop", sets: "4x15-12-10" },
        { name: "Tríceps Francês", sets: "4x12" },
        { name: "Mergulho Alto Volume", sets: "5x15" },
        { name: "Tríceps Corda", sets: "4x20" },
        { name: "Kickback 100", sets: "1x100" },
      ]},
    ]
  },
  abdômen: {
    title: "Foco em Abdômen",
    description: "Programa completo para core forte e definido. Trabalha reto abdominal, oblíquos e transverso para estabilidade e estética.",
    tags: ["Abdômen", "Core", "Definição", "Funcional"],
    days: [
      { day: "Dia 1 - Superior", exercises: [
        { name: "Crunch Tradicional", sets: "4x20" },
        { name: "Crunch na Polia", sets: "4x15" },
        { name: "Abdominal Canivete", sets: "3x15" },
        { name: "Crunch com Peso", sets: "4x12" },
        { name: "Mountain Climbers", sets: "3x30s" },
      ]},
      { day: "Dia 2 - Inferior", exercises: [
        { name: "Elevação de Pernas", sets: "4x15" },
        { name: "Reverse Crunch", sets: "4x20" },
        { name: "Tesoura", sets: "3x30s" },
        { name: "Bicicleta", sets: "4x20" },
        { name: "Prancha Dinâmica", sets: "3x30s" },
      ]},
      { day: "Dia 3 - Oblíquos", exercises: [
        { name: "Oblíquo Cruzado", sets: "4x20" },
        { name: "Prancha Lateral", sets: "4x30s" },
        { name: "Russian Twist", sets: "4x30" },
        { name: "Woodchop no Cabo", sets: "3x15" },
        { name: "Side Bends", sets: "3x20" },
      ]},
      { day: "Dia 4 - Full Core", exercises: [
        { name: "Prancha Completa", sets: "4x60s" },
        { name: "Dead Bug", sets: "4x20" },
        { name: "Bird Dog", sets: "4x15" },
        { name: "Hollow Hold", sets: "4x30s" },
        { name: "Ab Wheel", sets: "3x12" },
      ]},
      { day: "Dia 5 - Resistência", exercises: [
        { name: "Prancha com Variações", sets: "5x45s" },
        { name: "Crunch Alto Volume", sets: "5x25" },
        { name: "Elevação Pernas", sets: "5x20" },
        { name: "Mountain Climber", sets: "4x45s" },
        { name: "100 Abs Challenge", sets: "1x100" },
      ]},
    ]
  },
  quadríceps: {
    title: "Foco em Quadríceps",
    description: "Programa especializado para desenvolvimento dos quadríceps. Combina exercícios compostos e isolados para pernas fortes e volumosas.",
    tags: ["Quadríceps", "Pernas", "Força", "Hipertrofia"],
    days: [
      { day: "Dia 1 - Base", exercises: [
        { name: "Agachamento Livre", sets: "5x10" },
        { name: "Leg Press", sets: "4x15" },
        { name: "Cadeira Extensora", sets: "4x20" },
        { name: "Hack Squat", sets: "4x12" },
        { name: "Afundo", sets: "3x12" },
      ]},
      { day: "Dia 2 - Força", exercises: [
        { name: "Agachamento Pesado", sets: "5x5" },
        { name: "Front Squat", sets: "4x8" },
        { name: "Bulgarian Split", sets: "4x10" },
        { name: "Leg Press Pesado", sets: "5x10" },
        { name: "Step Up", sets: "3x12" },
      ]},
      { day: "Dia 3 - Volume", exercises: [
        { name: "Agachamento 20 reps", sets: "4x20" },
        { name: "Leg Press Drop", sets: "4x15-12-10" },
        { name: "Extensora Alto Volume", sets: "5x25" },
        { name: "Sissy Squat", sets: "4x15" },
        { name: "Afundo Caminhando", sets: "4x30 passos" },
      ]},
      { day: "Dia 4 - Isolamento", exercises: [
        { name: "Cadeira Extensora", sets: "5x20" },
        { name: "Sissy Squat", sets: "4x15" },
        { name: "Leg Extension Drop", sets: "4x20-15-12" },
        { name: "Agachamento Hack", sets: "4x15" },
        { name: "Extensora 100", sets: "1x100" },
      ]},
      { day: "Dia 5 - Full Legs", exercises: [
        { name: "Agachamento Completo", sets: "5x12" },
        { name: "Terra Tradicional", sets: "4x10" },
        { name: "Leg Press", sets: "4x15" },
        { name: "Cadeira Extensora", sets: "4x20" },
        { name: "Afundo Búlgaro", sets: "3x12" },
      ]},
    ]
  },
  dorsais: {
    title: "Foco em Dorsais",
    description: "Programa para costas largas e fortes. Desenvolve latíssimo do dorso com exercícios de puxada e remada para ganho de massa.",
    tags: ["Dorsais", "Costas", "Largura", "Hipertrofia"],
    days: [
      { day: "Dia 1 - Largura", exercises: [
        { name: "Barra Fixa", sets: "4x10" },
        { name: "Puxada Frontal", sets: "4x12" },
        { name: "Puxada Triângulo", sets: "4x12" },
        { name: "Pulldown", sets: "3x15" },
        { name: "Pullover", sets: "3x15" },
      ]},
      { day: "Dia 2 - Espessura", exercises: [
        { name: "Remada Curvada", sets: "5x8" },
        { name: "Remada Cavalinho", sets: "4x10" },
        { name: "Remada Unilateral", sets: "4x12" },
        { name: "Remada T-Bar", sets: "4x12" },
        { name: "Seal Row", sets: "3x15" },
      ]},
      { day: "Dia 3 - Full Back", exercises: [
        { name: "Levantamento Terra", sets: "5x5" },
        { name: "Barra Fixa Pesada", sets: "4x8" },
        { name: "Remada Curvada", sets: "4x10" },
        { name: "Puxada Frontal", sets: "4x12" },
        { name: "Face Pull", sets: "4x15" },
      ]},
      { day: "Dia 4 - Volume", exercises: [
        { name: "Puxada Drop Set", sets: "4x12-10-8" },
        { name: "Remada Cavalinho", sets: "5x12" },
        { name: "Barra Fixa Assistida", sets: "4x15" },
        { name: "Puxada Supinada", sets: "4x12" },
        { name: "Pullover 100", sets: "1x100" },
      ]},
      { day: "Dia 5 - Força", exercises: [
        { name: "Barra Fixa Com Peso", sets: "5x5" },
        { name: "Remada Pendlay", sets: "4x6" },
        { name: "Puxada Frontal Pesada", sets: "5x8" },
        { name: "Remada T-Bar", sets: "4x10" },
        { name: "Straight Arm Pushdown", sets: "3x15" },
      ]},
    ]
  },
  adutores: {
    title: "Foco em Adutores",
    description: "Programa completo para fortalecimento e tonificação dos adutores. Exercícios focados na parte interna das coxas para força e estabilidade.",
    tags: ["Adutores", "Força", "Hipertrofia"],
    days: [
      { day: "Dia 1 - Fundamentos", exercises: [
        { name: "Exercício Principal 1", sets: "4x12" },
        { name: "Exercício Principal 2", sets: "4x10" },
        { name: "Exercício Auxiliar 1", sets: "3x15" },
        { name: "Exercício Auxiliar 2", sets: "3x12" },
        { name: "Exercício de Finalização", sets: "4x20" },
      ]},
      { day: "Dia 2 - Força", exercises: [
        { name: "Exercício Composto 1", sets: "5x5" },
        { name: "Exercício Composto 2", sets: "4x8" },
        { name: "Exercício Isolado 1", sets: "4x12" },
      ]},
    ]
  }
};

// Dados padrão para músculos sem dados específicos
const defaultWorkoutData = {
  title: "Treino Focado",
  description: "Programa de treino especializado para desenvolvimento muscular progressivo. Exercícios selecionados para maximizar ganhos e performance.",
  tags: ["Força", "Hipertrofia", "Performance"],
  days: [
    { day: "Dia 1 - Fundamentos", exercises: [
      { name: "Exercício Principal 1", sets: "4x12" },
      { name: "Exercício Principal 2", sets: "4x10" },
      { name: "Exercício Auxiliar 1", sets: "3x15" },
      { name: "Exercício Auxiliar 2", sets: "3x12" },
      { name: "Exercício de Finalização", sets: "4x20" },
    ]},
    { day: "Dia 2 - Força", exercises: [
      { name: "Exercício Composto 1", sets: "5x5" },
      { name: "Exercício Composto 2", sets: "4x8" },
      { name: "Exercício Isolado 1", sets: "4x12" },
      { name: "Exercício Isolado 2", sets: "3x15" },
      { name: "Burnout Final", sets: "3x20" },
    ]},
    { day: "Dia 3 - Volume", exercises: [
      { name: "Alta Repetição 1", sets: "4x15" },
      { name: "Alta Repetição 2", sets: "4x15" },
      { name: "Superset A+B", sets: "3x12+12" },
      { name: "Drop Set", sets: "4x12-10-8" },
      { name: "Finalizador 100 reps", sets: "1x100" },
    ]},
    { day: "Dia 4 - Potência", exercises: [
      { name: "Exercício Explosivo 1", sets: "5x5" },
      { name: "Exercício Explosivo 2", sets: "4x6" },
      { name: "Exercício de Força 1", sets: "4x8" },
      { name: "Exercício de Força 2", sets: "4x10" },
      { name: "Exercício Auxiliar", sets: "3x12" },
    ]},
    { day: "Dia 5 - Hipertrofia", exercises: [
      { name: "Volume Médio 1", sets: "4x12" },
      { name: "Volume Médio 2", sets: "4x12" },
      { name: "Isolamento 1", sets: "4x15" },
      { name: "Isolamento 2", sets: "4x15" },
      { name: "Pump Final", sets: "5x20" },
    ]},
  ]
};

// Função para mapear nome do exercício para a animação correta
const getAnimationForExercise = (exerciseName: string, muscleGroup: string): string => {
  const name = exerciseName.toLowerCase();
  
  // Mapeamento por palavras-chave no nome do exercício
  if (name.includes('encolhimento') || name.includes('shrug')) return 'encolhimento';
  if (name.includes('supino')) return 'supino_reto';
  if (name.includes('desenvolvimento') || name.includes('press')) return 'desenvolvimento_halteres';
  if (name.includes('elevação lateral') || name.includes('elevacao lateral') || name.includes('lateral raise')) return 'elevacao_lateral';
  if (name.includes('elevação frontal') || name.includes('elevacao frontal')) return 'elevacao_lateral';
  if (name.includes('elevação posterior') || name.includes('elevacao posterior')) return 'elevacao_lateral';
  if (name.includes('ponte') || name.includes('hip thrust') || name.includes('elevação pélvica') || name.includes('elevacao pelvica')) return 'ponte_gluteo';
  if (name.includes('remada alta')) return 'remada_alta';
  if (name.includes('remada') && name.includes('barra')) return 'remada_barra';
  if (name.includes('remada')) return 'remada_halter';
  if (name.includes('crucifixo')) return 'crucifixo';
  if (name.includes('agachamento') || name.includes('squat')) return 'agachamento';
  if (name.includes('leg press')) return 'leg_press';
  if (name.includes('stiff') || name.includes('terra') || name.includes('deadlift')) return 'stiff';
  if (name.includes('rosca')) return 'rosca_direta';
  if (name.includes('tríceps') || name.includes('triceps')) return 'triceps_testa';
  if (name.includes('abdominal') || name.includes('crunch')) return 'abdominal';
  if (name.includes('prancha') || name.includes('plank')) return 'prancha';
  if (name.includes('barra fixa') || name.includes('pull') || name.includes('puxada')) return 'barra_fixa';
  if (name.includes('corrida') || name.includes('run')) return 'corrida';
  if (name.includes('afundo') || name.includes('lunge')) return 'agachamento';
  if (name.includes('extensora') || name.includes('extensão')) return 'leg_press';
  if (name.includes('abdução') || name.includes('abducao') || name.includes('adução') || name.includes('aducao')) return 'aducao';
  if (name.includes('coice')) return 'ponte_gluteo';
  if (name.includes('face pull')) return 'remada_alta';
  if (name.includes('arnold')) return 'desenvolvimento_halteres';
  if (name.includes('paralela') || name.includes('mergulho') || name.includes('dip')) return 'barra_fixa';
  if (name.includes('pullover')) return 'crucifixo';
  if (name.includes('flexão') || name.includes('push')) return 'supino_reto';
  if (name.includes('step')) return 'agachamento';
  if (name.includes('hack')) return 'agachamento';
  if (name.includes('sissy')) return 'agachamento';
  if (name.includes('front squat')) return 'agachamento';
  if (name.includes('bulgarian')) return 'agachamento';
  
  // Fallback por grupo muscular
  const muscleDefaults: Record<string, string> = {
    'trapézio': 'encolhimento',
    'trapezio': 'encolhimento',
    'glúteos': 'ponte_gluteo',
    'gluteos': 'ponte_gluteo',
    'ombros': 'desenvolvimento_halteres',
    'peitoral': 'supino_reto',
    'peito': 'supino_reto',
    'costas': 'remada_halter',
    'dorsais': 'barra_fixa',
    'bíceps': 'rosca_direta',
    'biceps': 'rosca_direta',
    'tríceps': 'triceps_testa',
    'triceps': 'triceps_testa',
    'abdômen': 'abdominal',
    'abdomen': 'abdominal',
    'quadríceps': 'agachamento',
    'quadriceps': 'agachamento',
    'pernas': 'agachamento',
    'adutores': 'aducao',
  };
  
  return muscleDefaults[muscleGroup.toLowerCase()] || 'supino_reto';
};

export default function MuscleWorkoutPage() {
  const { muscleName } = useParams<{ muscleName: string }>();
  const navigate = useNavigate();
  const [expandedDescription, setExpandedDescription] = useState(false);

  // Buscar dados do treino ou usar padrão
  const workoutData = muscleWorkoutData[muscleName?.toLowerCase() || ""] || {
    ...defaultWorkoutData,
    title: `Foco em ${muscleName?.charAt(0).toUpperCase()}${muscleName?.slice(1)}`,
    tags: [muscleName?.charAt(0).toUpperCase() + muscleName?.slice(1) || "Músculo", "Força", "Hipertrofia"]
  };

  const handleStartWorkout = () => {
    // Create a simple workout structure from the exercises
    const workout = {
      id: `workout_${muscleName}`,
      name: `Treino de ${muscleName}`,
      focus: `Foco em ${muscleName}`,
      duration: '60min',
      exercises: workoutData.days.flatMap(day => day.exercises).slice(0, 5).map((ex, idx) => ({
        id: idx + 1,
        name: ex.name,
        type: 'principal' as const,
        sets: 3,
        reps: '10-12',
        restTime: 60,
        animation: getAnimationForExercise(ex.name, muscleName || 'geral'),
        instructions: [
          'Execute o movimento com controle',
          'Mantenha a postura correta',
          'Respire adequadamente',
          'Foque na contração muscular'
        ],
        muscleGroup: muscleName || 'geral',
        equipment: ['halteres']
      }))
    };
    
    navigate('/workout-session', { state: { workout } });
  };

  return (
    <Layout>
      <div className="w-full mx-auto px-4 py-6 max-w-7xl pb-32">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/workouts")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {workoutData.title}
        </h1>

        {/* Description Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className={`text-muted-foreground leading-relaxed ${!expandedDescription && "line-clamp-2"}`}>
                {workoutData.description}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="p-0 h-auto font-semibold"
              >
                {expandedDescription ? (
                  <>
                    Ver menos <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Ver mais <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-8">
          {workoutData.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Exercise Days */}
        <div className="space-y-6">
          {workoutData.days.map((day, dayIndex) => (
            <Card key={dayIndex} className="overflow-hidden border border-border/50">
              <CardContent className="p-0">
                {/* Day Header */}
                <div className="bg-muted/30 px-4 py-3">
                  <h3 className="font-semibold text-base">{day.day}</h3>
                </div>

                {/* Exercise List */}
                <div className="divide-y divide-border/50">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <button
                      key={exerciseIndex}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => {/* Pode adicionar navegação para detalhes do exercício aqui */}}
                    >
                      {/* Play Button Icon */}
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 text-primary fill-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{exercise.name}</p>
                        {exercise.sets && (
                          <p className="text-xs text-orange-600 font-medium mt-0.5">
                            {exercise.sets}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating Start Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-10">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <Button
              size="lg"
              onClick={handleStartWorkout}
              className="w-full h-14 text-base font-semibold shadow-lg bg-primary hover:bg-primary/90"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Iniciar Treino
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
