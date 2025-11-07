import { useState, useRef, useCallback } from 'react';
import { useVoice, VoiceProvider } from './useVoice';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  hasIntroduced: boolean;
  lastObjective: string;
  userPreferences: string[];
  mood: string;
}

interface Intent {
  type: string;
  data?: string;
}

export const useChat = (initialVoiceProvider: VoiceProvider = 'elevenlabs-male') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState('');
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>(initialVoiceProvider);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    hasIntroduced: false,
    lastObjective: '',
    userPreferences: [],
    mood: 'neutral'
  });
  
  const { speak, isLoading: isVoiceLoading } = useVoice();
  const chatHistoryRef = useRef<Message[]>([]);

  // Analisar intenção do usuário de forma mais inteligente
  const analyzeIntent = useCallback((message: string): Intent => {
    const lowerMsg = message.toLowerCase().trim();
    
    // Padrões para captura de nome
    const namePatterns = [
      /(meu nome é|me chamo|sou o|sou a|pode me chamar de)\s+([a-záàâãéèêíïóôõöúçñ]{2,20})/i,
      /(nome é)\s+([a-záàâãéèêíïóôõöúçñ]{2,20})/i,
      /^([a-záàâãéèêíïóôõöúçñ]{2,20})$/i // Apenas um nome sem contexto
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[2]) {
        const name = match[2].split(' ')[0].trim();
        if (name.length >= 2 && name.length <= 20) {
          return { type: 'set_name', data: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() };
        }
      } else if (pattern.test(lowerMsg) && lowerMsg.split(' ').length === 1) {
        // Caso o usuário digite apenas o nome
        const name = lowerMsg;
        if (name.length >= 2 && name.length <= 20 && !/[0-9]/.test(name)) {
          return { type: 'set_name', data: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() };
        }
      }
    }

    // Outras intenções
    if (/(oi|olá|ola|e aí|eai|hello|hi|opa)/.test(lowerMsg)) {
      return { type: 'greeting' };
    }
    
    if (/(dia|data|hoje|que dia)/.test(lowerMsg)) {
      return { type: 'date_info' };
    }
    
    if (/(emagrecer|perder peso|secar|dieta|emagrecimento)/.test(lowerMsg)) {
      return { type: 'weight_loss' };
    }
    
    if (/(massa|muscular|ganhar|forte|hipertrofia)/.test(lowerMsg)) {
      return { type: 'muscle_gain' };
    }
    
    if (/(energia|força|cansado|fadiga|disposição)/.test(lowerMsg)) {
      return { type: 'energy' };
    }
    
    if (/(receita|comer|refeição|fome|almoço|janta|jantar|lanche|ceia)/.test(lowerMsg)) {
      return { type: 'meal_suggestion' };
    }
    
    if (/(obrigado|obrigada|valeu|agradeço)/.test(lowerMsg)) {
      return { type: 'thanks' };
    }
    
    return { type: 'general' };
  }, []);

  // Gerar resposta usando ChatGPT via edge function
  const generateResponse = useCallback(async (intent: Intent): Promise<string> => {
    try {
      // Preparar histórico de mensagens para o ChatGPT
      const chatMessages = chatHistoryRef.current.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('nutri-ai-chat', {
        body: {
          messages: chatMessages,
          userName,
          intent
        }
      });

      if (error) {
        console.error('Erro ao chamar nutri-ai-chat:', error);
        throw error;
      }

      if (data?.fallback) {
        return data.fallback;
      }

      return data?.response || 'Desculpe, não consegui processar sua mensagem. Pode tentar novamente?';
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Ops, tive um problema aqui. Vamos tentar de novo?';
    }
  }, [userName]);

  // Processar mensagem do usuário
  const sendMessage = useCallback(async (content: string, useVoice: boolean = true) => {
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Adicionar mensagem do usuário
    const userMessage: Message = { role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    chatHistoryRef.current = [...chatHistoryRef.current, userMessage];

    try {
      // Analisar intenção
      const intent = analyzeIntent(content);
      
      // Processar intenção de nome localmente
      if (intent.type === 'set_name' && intent.data) {
        setUserName(intent.data);
        setConversationContext(prev => ({ ...prev, hasIntroduced: true }));
      }
      
      // Gerar resposta usando ChatGPT
      const aiResponse = await generateResponse(intent);
      
      // Adicionar resposta do AI
      const aiMessage: Message = { role: 'assistant', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      chatHistoryRef.current = [...chatHistoryRef.current, aiMessage];

      // Falar a resposta se solicitado
      if (useVoice && !isVoiceLoading) {
        await speak(aiResponse, voiceProvider);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Desculpe, tive um problema. Pode repetir?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeIntent, generateResponse, speak, isProcessing, isVoiceLoading, voiceProvider]);

  // Inicializar conversa
  const startConversation = useCallback(async () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Olá! Eu sou seu NutriAI. Qual é o seu nome?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    chatHistoryRef.current = [welcomeMessage];
    
    // Falar a mensagem de boas-vindas
    setTimeout(() => speak('Olá! Eu sou seu NutriAI. Qual é o seu nome?', voiceProvider), 1000);
  }, [speak, voiceProvider]);

  return {
    messages,
    sendMessage,
    startConversation,
    isProcessing,
    userName,
    conversationContext,
    voiceProvider,
    setVoiceProvider
  };
};
