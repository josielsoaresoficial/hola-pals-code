import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VoiceProvider = 'elevenlabs-male' | 'elevenlabs-female' | 'google';

export const useVoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = async (text: string, voiceProvider: VoiceProvider = 'elevenlabs-male') => {
    if (!text || isPlaying) return;

    // Verificar se outra voz já está tocando (previne duplicação)
    const globalPlaying = sessionStorage.getItem('voice_playing') === 'true';
    if (globalPlaying) {
      console.log('Outra voz já está tocando, aguardando...');
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem('voice_playing', 'true');
    
    try {
      console.log('Requesting speech for:', { text, voiceProvider });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceProvider },
      });

      if (error) {
        console.error('Error generating speech:', error);
        
        // Edge function retornou erro - não mostrar toast, será tratado no catch
        sessionStorage.removeItem('voice_playing');
        setIsLoading(false);
        return;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Play audio
      const audio = new Audio(url);
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        sessionStorage.removeItem('voice_playing');
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        sessionStorage.removeItem('voice_playing');
        URL.revokeObjectURL(url);
        toast.error('Erro ao reproduzir áudio');
      };

      await audio.play();
      console.log('Audio playing successfully');
    } catch (error) {
      console.error('Error in speak function:', error);
      sessionStorage.removeItem('voice_playing');
      setIsLoading(false);
      
      // Não mostrar toast para erros de voz - API pode estar temporariamente indisponível
      // O erro já foi logado no console para debug
    }
  };

  return { speak, isLoading, isPlaying };
};
