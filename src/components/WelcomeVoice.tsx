import { useEffect, useState } from "react";
import { useVoice, VoiceProvider } from "@/hooks/useVoice";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeVoice = () => {
  const { user } = useAuth();
  const { speak } = useVoice();
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    const fetchProfileAndSpeak = async () => {
      if (!user || hasSpoken) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .maybeSingle();

        // Buscar preferência de voz do localStorage (migrar formato antigo)
        let voiceProvider: VoiceProvider = localStorage.getItem('voiceProvider') as VoiceProvider || 'elevenlabs-male';
        
        // Migrar formato antigo (male/female) para novo formato
        const oldGender = localStorage.getItem("userGender");
        if (oldGender && !localStorage.getItem('voiceProvider')) {
          voiceProvider = oldGender === 'female' ? 'elevenlabs-female' : 'elevenlabs-male';
          localStorage.setItem('voiceProvider', voiceProvider);
        }

        let userName = profile?.name || 'Amigo';
        
        // Se for email, pegar parte antes do @ e remover caracteres especiais
        if (userName.includes('@')) {
          userName = userName.split('@')[0].replace(/[.+]/g, ' ');
        }
        
        // Pegar apenas primeiro nome
        let firstName = userName.split(' ')[0];
        
        // Capitalizar primeira letra
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

        const welcomeMessage = `Oi! ${firstName}, que ótimo que está de volta no nPnG JM, vamos nos seus objetivos agora!`;

        console.log('Speaking welcome message:', welcomeMessage);
        
        await speak(welcomeMessage, voiceProvider);
        setHasSpoken(true);
      } catch (error) {
        console.error('Error in WelcomeVoice:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchProfileAndSpeak();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, hasSpoken, speak]);

  return null;
};

/*
export const WelcomeVoice = () => {
  const { user } = useAuth();
  const { speak } = useVoice();
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    const fetchGenderAndSpeak = async () => {
      if (!user || hasSpoken) return;

      try {
        // Buscar gênero do localStorage
        const gender = (localStorage.getItem("userGender") as 'male' | 'female') || 'male';
        const name = localStorage.getItem("userName") || 'Amigo';
        let firstName = name.split(' ')[0];

        // Mensagem de boas-vindas personalizada
        const welcomeMessage = gender === 'female' 
          ? `Bem-vinda de volta ao nPnG JM, ${firstName}! Pronta para arrasar no treino hoje?`
          : `Bem-vindo de volta ao nPnG JM, ${firstName}! Pronto para dar tudo no treino hoje?`;

        console.log('Speaking welcome message:', welcomeMessage);
        
        await speak(welcomeMessage, gender);
        setHasSpoken(true);
      } catch (error) {
        console.error('Error in WelcomeVoice:', error);
      }
    };

    // Delay de 1 segundo para melhor UX
    const timer = setTimeout(() => {
      fetchGenderAndSpeak();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, hasSpoken, speak]);

  return null;
};
*/
