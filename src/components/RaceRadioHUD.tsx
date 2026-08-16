import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  X, 
  Send, 
  Loader2, 
  Maximize2, 
  Sliders, 
  Volume2, 
  VolumeX,
  CarFront,
  Zap,
  ChevronUp,
  Bot
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { subscribeCars, Car, defaultTuneData } from '../lib/firestore';
import { Link } from 'react-router-dom';

export function RaceRadioHUD() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('GLOBAL');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: '📻 Pit Wall Race Radio online. Standing by for telemetry queries, setup adjustments, and live mechanical advice.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubCars = subscribeCars(user.uid, (data) => setCars(data));
    return () => unsubCars();
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const activeCar = cars.find(c => c.id === selectedCarId);

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Filter out markdown/codeblocks for cleaner audio
      const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!overrideText) setInput('');
    setLoading(true);

    try {
      // Fetch latest telemetry packet if available
      let liveTelemetry = null;
      try {
        const telRes = await fetch('/api/telemetry/latest');
        if (telRes.ok) {
          const telData = await telRes.json();
          if (telData.connected) {
            liveTelemetry = telData.data;
          }
        }
      } catch (err) {
        // ignore telemetry probe error
      }

      const filteredTurns = [...messages, userMessage].filter(m => m.text && m.text.trim());

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: filteredTurns.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          context: {
            car: activeCar ? {
              brand: activeCar.brand,
              model: activeCar.model,
              year: activeCar.year,
              carClass: activeCar.carClass,
              pi: activeCar.pi,
              power: activeCar.power,
              weight: activeCar.weight,
              drivetrain: activeCar.drivetrain
            } : null,
            liveTelemetry,
            quickHudMode: true
          }
        })
      });

      const data = await response.json().catch(() => ({ text: '' }));
      const modelText = data.text || 'Engineer copy. Telemetry received.';
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      speakText(modelText);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: '📻 Pit Wall: Radio static / signal lost. Check telemetry connection.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#0a0a0a] hover:bg-[#141414] border-2 border-[#ef4444] text-white shadow-2xl transition-all group"
        >
          <div className="relative">
            <Radio className="w-4 h-4 text-[#ef4444] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444] rounded-full animate-ping"></span>
          </div>
          <span className="text-xs font-black italic tracking-wider uppercase">Race Radio</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#ef4444] text-black font-bold uppercase">AI</span>
        </button>
      )}

      {/* Expanded HUD Modal / Drawer */}
      {isOpen && (
        <div className="w-[380px] sm:w-[440px] h-[520px] bg-[#0c0c0c] border-2 border-[#ef4444] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* HUD Top Bar */}
          <div className="p-3 bg-[#111] border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ef4444] animate-pulse" />
              <div>
                <div className="text-[9px] uppercase tracking-widest text-[#ef4444] font-bold">Pit Wall Radio</div>
                <div className="text-xs font-black italic text-white leading-none uppercase">Race Engineer Core</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 border text-xs ${voiceEnabled ? 'bg-[#ef4444] text-black border-[#ef4444]' : 'bg-[#181818] text-[#888] border-[#333] hover:text-white'}`}
                title={voiceEnabled ? 'Voice Readout Active' : 'Enable Voice Readout'}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <Link
                to="/engineer"
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-[#181818] hover:bg-[#252525] border border-[#333] text-[#888] hover:text-white"
                title="Open Full AI Engineer Console"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-[#181818] hover:bg-[#ef4444] hover:text-black border border-[#333] text-[#888]"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Vehicle Context Selector */}
          <div className="px-3 py-1.5 bg-[#080808] border-b border-[#1f1f1f] flex items-center justify-between text-[10px]">
            <span className="text-[#666] uppercase">Channel:</span>
            <select
              value={selectedCarId}
              onChange={e => setSelectedCarId(e.target.value)}
              className="bg-[#141414] border border-[#2a2a2a] text-white px-2 py-0.5 uppercase text-[10px] focus:outline-none"
            >
              <option value="GLOBAL">All Cars / Global</option>
              {cars.map(c => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} ({c.carClass}{c.pi})
                </option>
              ))}
            </select>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs bg-[#090909]">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] p-2.5 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#ef4444] text-black font-bold text-[11px]'
                    : 'bg-[#151515] border-l-2 border-[#ef4444] text-[#ddd] text-[11px]'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-2.5 bg-[#151515] border-l-2 border-[#ef4444] text-[10px] text-[#888]">
                <Loader2 className="w-3 h-3 animate-spin text-[#ef4444]" />
                <span>Computing telemetry delta & differential lock...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Radio Preset Buttons */}
          <div className="p-1.5 bg-[#0e0e0e] border-t border-[#1a1a1a] flex gap-1.5 overflow-x-auto scrollbar-none">
            {[
              'Understeer fix',
              'Diff lock setting',
              'Tire cold PSI',
              'A800 upgrade tips'
            ].map((preset, i) => (
              <button
                key={i}
                onClick={() => handleSend(preset)}
                className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-[9px] text-[#aaa] hover:text-white uppercase whitespace-nowrap"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-[#111] border-t border-[#222] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Race Engineer..."
              className="flex-1 bg-[#181818] border border-[#2e2e2e] px-2.5 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#ef4444]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 bg-[#ef4444] text-black hover:bg-white text-[11px] font-black uppercase transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
