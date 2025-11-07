import { useState } from 'react';
import { Settings } from 'lucide-react';
import { VoiceProvider } from '@/hooks/useVoice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VoiceSettingsProps {
  currentVoice: VoiceProvider;
  onVoiceChange: (voice: VoiceProvider) => void;
}

const voiceOptions: { value: VoiceProvider; label: string; emoji: string }[] = [
  { value: 'elevenlabs-male', label: 'Voz Masculina (ElevenLabs)', emoji: '👨' },
  { value: 'elevenlabs-female', label: 'Voz Feminina (ElevenLabs)', emoji: '👩' },
  { value: 'google', label: 'Voz Google (Gratuita)', emoji: '🔊' },
];

const VoiceSettings = ({ currentVoice, onVoiceChange }: VoiceSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleVoiceSelect = (voice: VoiceProvider) => {
    onVoiceChange(voice);
    setIsOpen(false);
  };

  const currentOption = voiceOptions.find(opt => opt.value === currentVoice);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className="text-white hover:text-green-200 transition-colors"
          aria-label="Configurações de voz"
        >
          <Settings className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          Selecionar Voz
        </div>
        {voiceOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleVoiceSelect(option.value)}
            className={`cursor-pointer ${
              currentVoice === option.value 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                : ''
            }`}
          >
            <span className="mr-2 text-lg">{option.emoji}</span>
            <span className="flex-1">{option.label}</span>
            {currentVoice === option.value && (
              <span className="text-green-600 dark:text-green-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VoiceSettings;
