import React from 'react';
import benchPress from '@/assets/exercises/bench-press.png';
import squat from '@/assets/exercises/squat.png';
import dumbbellFly from '@/assets/exercises/dumbbell-fly.png';
import dumbbellRow from '@/assets/exercises/dumbbell-row.png';
import running from '@/assets/exercises/running.png';
import shoulderPress from '@/assets/exercises/shoulder-press.png';
import bicepCurl from '@/assets/exercises/bicep-curl.png';
import crunch from '@/assets/exercises/crunch.png';
import gluteBridge from '@/assets/exercises/glute-bridge.png';
import pullUp from '@/assets/exercises/pull-up.png';
import legPress from '@/assets/exercises/leg-press.png';
import lateralRaise from '@/assets/exercises/lateral-raise.png';
import deadlift from '@/assets/exercises/deadlift.png';
import legAdduction from '@/assets/exercises/leg-adduction.png';
import tricepSkullcrusher from '@/assets/exercises/tricep-skullcrusher.png';

interface AnimatedExerciseProps {
  animation: string;
  size?: 'small' | 'medium' | 'large';
}

const AnimatedExercise: React.FC<AnimatedExerciseProps> = ({ animation, size = 'medium' }) => {
  const sizeClass = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  const exerciseImages: Record<string, string> = {
    'supino_reto': benchPress,
    'supino_inclinado': benchPress,
    'agachamento_livre': squat,
    'agachamento': squat,
    'crucifixo': dumbbellFly,
    'crucifixo_inclinado': dumbbellFly,
    'remada_halter': dumbbellRow,
    'remada_barra': dumbbellRow,
    'remada_curvada': dumbbellRow,
    'corrida': running,
    'desenvolvimento': shoulderPress,
    'desenvolvimento_halteres': shoulderPress,
    'desenvolvimento_militar': shoulderPress,
    'rosca_direta': bicepCurl,
    'rosca_alternada': bicepCurl,
    'rosca_martelo': bicepCurl,
    'triceps_testa': tricepSkullcrusher,
    'triceps_corda': tricepSkullcrusher,
    'triceps_barra': tricepSkullcrusher,
    'barra_fixa': pullUp,
    'pulldown': pullUp,
    'leg_press': legPress,
    'elevacao_pelvica': gluteBridge,
    'ponte_gluteo': gluteBridge,
    'elevacao_lateral': lateralRaise,
    'levantamento_terra': deadlift,
    'stiff': deadlift,
    'abdominal_supra': crunch,
    'abdominal': crunch,
    'prancha': crunch,
    'aducao': legAdduction,
    'abducao': legAdduction
  };

  const exerciseImage = exerciseImages[animation] || benchPress;

  return (
    <div className="flex items-center justify-center">
      <img 
        src={exerciseImage} 
        alt={animation}
        className={`${sizeClass[size]} object-cover rounded-lg shadow-lg`}
      />
    </div>
  );
};

export default AnimatedExercise;
