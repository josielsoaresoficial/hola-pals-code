import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/hooks/useChat';
import { VoiceProvider } from '@/hooks/useVoice';
import VoiceSettings from './VoiceSettings';

const NutriAI = () => {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    startConversation, 
    isProcessing,
    voiceProvider,
    setVoiceProvider 
  } = useChat('google'); // ✅ Iniciar com Google como padrão
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [profileName, setProfileName] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isRecognitionActive = useRef(false);

  // ✅ BUSCAR NOME DO PERFIL E PREFERÊNCIA DE VOZ
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const profile = data as any;
      if (profile && profile.name) {
        setProfileName(profile.name);
      }
      
      // Buscar preferência de voz do localStorage
      const storedVoice = localStorage.getItem('voiceProvider') as VoiceProvider;
      if (storedVoice) {
        setVoiceProvider(storedVoice);
      }
    };
    
    fetchProfileData();
  }, [user, setVoiceProvider]);

  // Salvar preferência de voz quando mudar
  const handleVoiceChange = (newVoice: VoiceProvider) => {
    setVoiceProvider(newVoice);
    localStorage.setItem('voiceProvider', newVoice);
  };

  // ✅ EXTRAIR PRIMEIRO NOME DO PERFIL
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'Amigo';
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(profileName);


  // ✅ CONFIGURAÇÃO AVANÇADA DE VOZ
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('🎤 Reconhecimento iniciado');
        isRecognitionActive.current = true;
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log('🔇 Reconhecimento parou');
        isRecognitionActive.current = false;
        setIsListening(false);
        
        // ✅ RECONECTAR AUTOMATICAMENTE se ainda estiver ativo E NÃO PAUSADO
        if (isActive && !isPaused) {
          setTimeout(() => {
            if (recognitionRef.current && isActive && !isPaused && !isRecognitionActive.current) {
              try {
                console.log('🔄 Reiniciando reconhecimento...');
                recognitionRef.current.start();
              } catch (e) {
                console.log('⚠️ Reconhecimento já ativo');
              }
            }
          }, 800);
        }
      };

      recognition.onresult = (event: any) => {
        // ✅ NÃO PROCESSAR SE ESTIVER PAUSADO
        if (isPaused) return;
        
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          console.log('📝 Texto capturado:', finalTranscript);
          sendMessage(finalTranscript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Erro no reconhecimento:', event.error);
        isRecognitionActive.current = false;
        if (event.error === 'not-allowed') {
          alert('Permissão de microfone negada. Ative o microfone para conversar com o NutriAI.');
        }
      };

      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current && isRecognitionActive.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, isPaused, sendMessage]);



  // ✅ ATIVAÇÃO DO NUTRIAI
  const activateNutriAI = async () => {
    setIsActive(true);
    
    // Inicia a conversa
    await startConversation();
    
    // Inicia o reconhecimento de voz
    if (recognitionRef.current) {
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('⚠️ Reconhecimento já ativo');
        }
      }, 1500);
    }
  };

  // ✅ PAUSAR/RETOMAR CONVERSA
  const togglePause = () => {
    if (isPaused) {
      // RETOMAR
      setIsPaused(false);
      if (recognitionRef.current && !isRecognitionActive.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('⚠️ Reconhecimento já ativo');
        }
      }
    } else {
      // PAUSAR
      setIsPaused(true);
      if (recognitionRef.current && isRecognitionActive.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('⚠️ Erro ao parar reconhecimento');
        }
      }
    }
  };

  // ✅ DESATIVAR CORRETAMENTE
  const deactivateNutriAI = () => {
    console.log('❌ Desativando NutriAI');
    if (recognitionRef.current && isRecognitionActive.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('⚠️ Erro ao parar reconhecimento');
      }
    }
    isRecognitionActive.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsPaused(false);
  };


  return (
    <div className="nutri-ai-container">
      {!isActive && (
        <button 
          onClick={activateNutriAI}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform z-50"
        >
          <span className="flex items-center gap-1.5 text-sm md:text-base font-semibold">
            🧠 NutriAI
          </span>
        </button>
      )}

      {isActive && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[90vw] max-w-sm md:w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 z-50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">NutriAI - {firstName}</h3>
                <p className="text-xs opacity-90">
                  {voiceProvider === 'elevenlabs-male' && '👨 Voz Masculina'}
                  {voiceProvider === 'elevenlabs-female' && '👩 Voz Feminina'}
                  {voiceProvider === 'google' && '🔊 Voz Google'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <VoiceSettings 
                  currentVoice={voiceProvider}
                  onVoiceChange={handleVoiceChange}
                />
                <button 
                  onClick={togglePause}
                  className="text-white hover:text-green-200 text-base bg-green-600 hover:bg-green-700 w-7 h-7 rounded-full flex items-center justify-center"
                  title={isPaused ? 'Retomar conversa' : 'Pausar conversa'}
                >
                  {isPaused ? '▶️' : '⏸️'}
                </button>
                <button 
                  onClick={deactivateNutriAI}
                  className="text-white hover:text-green-200 text-base bg-green-600 hover:bg-green-700 w-7 h-7 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-60 md:h-72 p-3 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[85%] p-2 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-green-200 dark:border-green-700'
                }`}>
                  {msg.content}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {/* ✅ INDICADOR DE STATUS */}
            {(isListening || isProcessing || isPaused) && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {isPaused && '⏸️ Conversa pausada'}
                {!isPaused && isListening && '🎤 Ouvindo... Fale agora!'}
                {!isPaused && isProcessing && '🔊 NutriAI processando...'}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {isPaused ? '⏸️ Use o botão ▶️ para retomar' : '💡 Conversa fluida ativa - Fale naturalmente'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutriAI;
