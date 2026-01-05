import { useState, useCallback, useRef, useEffect } from 'react';
import { NavigationInstruction } from '@/types/campus';

export function useVoiceNavigation() {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenIndex = useRef(-1);
  const speechQueue = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (isMuted) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to get a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Google') ||
      v.name.includes('Microsoft Zira') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      processQueue();
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const processQueue = useCallback(() => {
    if (speechQueue.current.length > 0 && !isSpeakingRef.current) {
      const nextText = speechQueue.current.shift();
      if (nextText) speak(nextText);
    }
  }, [speak]);

  const queueSpeak = useCallback((text: string) => {
    if (isMuted) return;
    
    if (isSpeakingRef.current) {
      speechQueue.current.push(text);
    } else {
      speak(text);
    }
  }, [isMuted, speak]);

  const speakInstruction = useCallback((instruction: NavigationInstruction, nodeIndex: number) => {
    if (nodeIndex <= lastSpokenIndex.current) return;
    
    lastSpokenIndex.current = nodeIndex;
    queueSpeak(instruction.text);
  }, [queueSpeak]);

  const resetSpeech = useCallback(() => {
    lastSpokenIndex.current = -1;
    speechQueue.current = [];
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
      return !prev;
    });
  }, []);

  // Load voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isMuted,
    isSpeaking,
    speak: queueSpeak,
    speakInstruction,
    toggleMute,
    resetSpeech,
  };
}
