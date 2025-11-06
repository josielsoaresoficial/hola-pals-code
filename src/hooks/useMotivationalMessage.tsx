import { useState, useEffect } from "react";

const motivationalMessages = [
  "Cada repetição te aproxima dos seus objetivos! 💪",
  "A consistência é o segredo do progresso! 🔥", 
  "Seu corpo reflete suas escolhas alimentares! 🥗",
  "Hoje é dia de ser melhor que ontem! 🚀",
  "Sabia que 1kg de músculo queima 3x mais calorias? 🔥",
  "Descanso é tão importante quanto o treino! 💤",
  "Proteína é essencial para reparo muscular! 🥚",
  "Beber água acelera o metabolismo em 30%! 💧",
  "Foco no processo, os resultados virão! 🎯",
  "Musculação fortalece os ossos! 🦴",
  "Treinar pela manhã aumenta sua energia o dia todo! ☀️",
  "Carboidratos complexos são seus aliados! 🍠",
  "A gordura saudável é essencial para hormônios! 🥑",
  "Alongamento previne lesões e melhora performance! 🧘",
  "Sono de qualidade potencializa seus ganhos! 😴",
  "Exercícios compostos queimam mais calorias! 🏋️",
  "Suplementos complementam, não substituem refeições! 💊",
  "A constância vence a intensidade! ⚡",
  "Hidratação começa antes do treino! 💦",
  "Seu maior competidor é você mesmo! 🥇",
  "Aquecer bem previne 80% das lesões! 🔥",
  "Comer devagar melhora a digestão em 40%! 🍽️",
  "HIIT economiza tempo e maximiza resultados! ⏱️",
  "Vegetais são vitaminas em forma de comida! 🥦",
  "Progressão gradual é a chave do sucesso! 📈",
  "Mente forte constrói corpo forte! 🧠",
  "Cada dia é uma nova oportunidade! 🌅",
  "Supere seus limites, não seus joelhos! 🦵",
  "Disciplina é fazer o que precisa ser feito! 💯",
  "Seu futuro eu agradecerá pelo treino de hoje! 🙏",
  "Transformação começa com uma decisão! 💥",
  "Músculos não crescem na academia, mas no descanso! 😴",
  "Exercício é celebração do que seu corpo pode fazer! 🎉",
  "Força não vem do físico, vem da vontade! 💪",
  "Você é mais forte do que pensa! 🦁",
  "Treinar é investir em você mesmo! 💰",
  "Pequenos passos, grandes conquistas! 👣",
  "Sua única limitação é você mesmo! 🚀",
  "Dor temporária, orgulho permanente! 🏆",
  "O sucesso é a soma de pequenos esforços! ✨",
  "Não desista, você está mais perto do que imagina! 🎯",
  "Coma comida de verdade, não produtos! 🍎",
  "Treino pesado constrói caráter forte! ⚡",
  "Compromisso é fazer o que prometeu, mesmo após o ânimo passar! 🔥",
  "Seu corpo aguenta quase tudo, é sua mente que precisa convencer! 🧠",
  "Resultados requerem repetição e persistência! 🔁",
  "O melhor treino é aquele que você faz! 💯",
  "Ganhos acontecem fora da zona de conforto! 🌟",
  "Acredite no processo, confie em si mesmo! 🙌",
  "Seja paciente, mudanças levam tempo! ⏰"
];

export const useMotivationalMessage = () => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(() => 
    Math.floor(Math.random() * motivationalMessages.length)
  );
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    const fullMessage = motivationalMessages[currentMessageIndex];
    let currentIndex = 0;
    setIsTyping(true);
    setDisplayedMessage("");
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setDisplayedMessage(fullMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // Velocidade de digitação (50ms por caractere)
    
    const changeMessageTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      setCurrentMessageIndex(randomIndex);
    }, 60000); // Muda a mensagem a cada 60 segundos
    
    return () => {
      clearInterval(typingInterval);
      clearTimeout(changeMessageTimeout);
    };
  }, [currentMessageIndex]);
  
  return displayedMessage;
};
