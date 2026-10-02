"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  isSpeechSupported,
  getAvailableVoices,
  speakText,
  stopSpeaking,
} from "./speech";

export interface UseSpeechReturn {
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  speakingId: string | null;
  isPlaying: boolean;
  rate: number;
  setRate: (rate: number) => void;
  voiceName: string;
  setVoiceName: (voiceName: string) => void;
  speak: (id: string, text: string, langCode?: string, customRate?: number, customVoice?: string) => void;
  stop: () => void;
}

export function useSpeech(defaultRate = 1.0): UseSpeechReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(defaultRate);
  const [voiceName, setVoiceName] = useState<string>("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const supported = isSpeechSupported();
    setIsSupported(supported);

    if (supported) {
      const updateVoices = () => {
        if (!mountedRef.current) return;
        const loadedVoices = getAvailableVoices();
        setVoices(loadedVoices);
      };

      updateVoices();

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      }

      return () => {
        mountedRef.current = false;
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
        }
      };
    }
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    if (mountedRef.current) {
      setSpeakingId(null);
    }
  }, []);

  const speak = useCallback(
    (id: string, text: string, langCode?: string, customRate?: number, customVoice?: string) => {
      if (!text || text.trim() === "") return;

      if (speakingId === id) {
        stop();
        return;
      }

      setSpeakingId(id);

      speakText({
        text,
        langCode,
        voiceName: customVoice || voiceName || undefined,
        rate: customRate ?? rate,
        onStart: () => {
          if (mountedRef.current) {
            setSpeakingId(id);
          }
        },
        onEnd: () => {
          if (mountedRef.current) {
            setSpeakingId((current) => (current === id ? null : current));
          }
        },
        onError: () => {
          if (mountedRef.current) {
            setSpeakingId((current) => (current === id ? null : current));
          }
        },
      });
    },
    [rate, voiceName, speakingId, stop]
  );

  return {
    isSupported,
    voices,
    speakingId,
    isPlaying: speakingId !== null,
    rate,
    setRate,
    voiceName,
    setVoiceName,
    speak,
    stop,
  };
}
