import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache simples para evitar chamadas duplicadas
const requestCache = new Map();
const CACHE_TTL = 30000; // 30 segundos

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voiceProvider = 'elevenlabs-male' } = await req.json();

    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Texto é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Se for Google TTS, usar a API gratuita do Google
    if (voiceProvider === 'google') {
      try {
        console.log('Usando Google TTS gratuito');
        
        // Usar a API gratuita do Google Translate TTS
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=pt-BR&q=${encodeURIComponent(text.substring(0, 200))}`;
        
        const googleResponse = await fetch(googleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!googleResponse.ok) {
          console.error('Google TTS retornou erro:', googleResponse.status);
          throw new Error(`Google TTS falhou com status ${googleResponse.status}`);
        }

        const audioBuffer = await googleResponse.arrayBuffer();
        
        if (audioBuffer.byteLength === 0) {
          throw new Error('Google TTS retornou áudio vazio');
        }

        console.log('Google TTS: Áudio gerado com sucesso, tamanho:', audioBuffer.byteLength);

        const uint8Array = new Uint8Array(audioBuffer);
        let binaryString = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode(...chunk);
        }
        
        const base64Audio = btoa(binaryString);

        return new Response(
          JSON.stringify({ audioContent: base64Audio }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (googleError) {
        console.error('Erro ao usar Google TTS:', googleError);
        
        // Retornar erro específico do Google ao invés de tentar ElevenLabs
        return new Response(
          JSON.stringify({ 
            error: 'Falha ao gerar voz com Google TTS. Tente novamente ou selecione outra voz.',
            details: googleError instanceof Error ? googleError.message : 'Erro desconhecido'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Criar chave de cache
    const cacheKey = `${voiceProvider}:${text.substring(0, 100)}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Retornando resposta do cache');
      return new Response(
        JSON.stringify({ audioContent: cached.audioContent }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Gerando voz para:', { 
      textLength: text.length,
      voiceProvider,
      preview: text.substring(0, 50) + '...'
    });

    // Obter voice ID baseado no provider
    let voiceId: string;
    if (voiceProvider === 'elevenlabs-female') {
      voiceId = Deno.env.get('ELEVENLABS_VOICE_FEMALE') || 'EXAVITQu4vr4xnSDxMaL'; // Sarah
    } else {
      voiceId = Deno.env.get('ELEVENLABS_VOICE_MALE') || 'TX3LPaxmHKxFdv7VOQHJ'; // Liam
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY não configurada');
    }

    console.log('Usando voice ID:', voiceId);

    // Chamar API ElevenLabs com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limite de caracteres
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API ElevenLabs:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Detectar erros específicos
        if (response.status === 401) {
          if (errorText.includes('detected_unusual_activity')) {
            throw new Error('API_KEY_BLOCKED: Atividade incomum detectada');
          }
          throw new Error('API_KEY_INVALID: Chave de API inválida');
        }
        
        if (response.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED: Limite de requisições excedido');
        }
        
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Obter dados de áudio
      const audioData = await response.arrayBuffer();
      
      if (audioData.byteLength === 0) {
        throw new Error('Áudio vazio recebido da API');
      }

      console.log('Áudio gerado com sucesso, tamanho:', audioData.byteLength);

      // Converter para base64 de forma eficiente
      const uint8Array = new Uint8Array(audioData);
      let binaryString = '';
      const chunkSize = 8192;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      const base64Audio = btoa(binaryString);

      // Armazenar em cache
      requestCache.set(cacheKey, {
        audioContent: base64Audio,
        timestamp: Date.now()
      });

      // Limpar cache antigo
      for (const [key, value] of requestCache.entries()) {
        if (Date.now() - value.timestamp > CACHE_TTL) {
          requestCache.delete(key);
        }
      }

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('Erro na função text-to-speech:', error);
    
    let statusCode = 500;
    let errorMessage = 'Erro desconhecido';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout na requisição para ElevenLabs';
        statusCode = 408;
      } else if (error.message.includes('API_KEY_BLOCKED')) {
        errorMessage = 'Serviço de voz temporariamente indisponível';
        statusCode = 423;
      } else if (error.message.includes('RATE_LIMIT')) {
        errorMessage = 'Limite de requisições excedido';
        statusCode = 429;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
