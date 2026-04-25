'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, Loader2 } from 'lucide-react'

interface VoiceDispatchProps {
  onDispatchComplete: (need: any, match: any) => void;
}

export default function VoiceDispatch({ onDispatchComplete }: VoiceDispatchProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        await processDispatch(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
         setIsRecording(false);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const processDispatch = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      
      if (data.success) {
        onDispatchComplete(data.need, data.match);
        speak(`Dispatched ${data.match.bestMatchName} to ${data.need.location}.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  if (!recognitionRef.current && typeof window !== 'undefined' && !('webkitSpeechRecognition' in window)) {
     // Return a mock button for testing environments or unsupported browsers
     return (
       <div className="fixed bottom-8 right-8 z-50">
         <button className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-500 shadow-xl cursor-not-allowed" aria-label="Voice Dispatch Unsupported">
           <Mic className="w-8 h-8 text-white opacity-50" />
         </button>
       </div>
     );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      {isRecording && (
        <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping pointer-events-none" />
      )}
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          isProcessing ? 'bg-accent cursor-not-allowed scale-95' 
          : isRecording ? 'bg-destructive scale-110 hover:bg-destructive/90' 
          : 'bg-primary hover:bg-primary/90 hover:scale-105'
        }`}
        aria-label={isRecording ? "Stop Recording" : "Voice Dispatch"}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isRecording ? (
          <Mic className="w-8 h-8 text-white animate-pulse" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>
      
      <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-card border border-border px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-opacity pointer-events-none ${isRecording || isProcessing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {isProcessing ? "AI is processing..." : isRecording ? "Listening..." : "Voice Dispatch"}
      </div>
    </div>
  )
}
