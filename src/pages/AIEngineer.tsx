import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Send, 
  Loader2, 
  Sparkles, 
  CarFront, 
  Sliders, 
  FlaskConical, 
  RefreshCw,
  Terminal,
  Bot,
  Activity,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Save,
  BookOpen,
  ArrowRight,
  Wifi,
  WifiOff,
  Radio,
  Gauge
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeCars, 
  subscribeKnowledge,
  subscribeTests,
  addKnowledgeEntry,
  Car, 
  KnowledgeEntry,
  TestExperiment,
  defaultTuneData,
  TuneData
} from '../lib/firestore';
import { TuneCard } from '../components/TuneCard';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
  extractedTune?: TuneData | null;
}

export function AIEngineer() {
  const { user } = useAuth();
  const location = useLocation();
  const [cars, setCars] = useState<Car[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [tests, setTests] = useState<TestExperiment[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('GLOBAL');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `### 🏎️ ENGENHEIRO DE PISTA FH6 ATIVO\n**Núcleo de Dinâmica de Chassi e Telemetria Inicializado.**\n\nConectado à matriz física do Forza Horizon 6. Solicite cálculos de setup mecânico, otimização de diferencial (AWD/RWD), calibração de Anti-Roll Bars (ARB), equilíbrio térmico dos pneus ou roteiros de upgrades por classe de PI.\n\n*Selecione um carro da sua Garagem acima ou consulte a telemetria em tempo real.*`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [telemetryConnected, setTelemetryConnected] = useState(false);
  const [saveKnowledgeSuccess, setSaveKnowledgeSuccess] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to user Firestore data
  useEffect(() => {
    if (!user) return;
    const unsubCars = subscribeCars(user.uid, (data) => setCars(data));
    const unsubKnowledge = subscribeKnowledge(user.uid, (data) => setKnowledge(data));
    const unsubTests = subscribeTests(user.uid, (data) => setTests(data));

    return () => {
      unsubCars();
      unsubKnowledge();
      unsubTests();
    };
  }, [user]);

  // Poll live telemetry status every 1.5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry/latest');
        if (res.ok) {
          const data = await res.json();
          setTelemetryConnected(data.connected);
          setLiveTelemetry(data.data);
          if (data.stats) setSessionStats(data.stats);
        }
      } catch (e) {
        // ignore polling error
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Handle telemetry passed from Telemetry page via navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.telemetryContext) {
      if (state.telemetryContext.latestFrame) {
        setLiveTelemetry(state.telemetryContext.latestFrame);
      }
      if (state.telemetryContext.sessionStats) {
        setSessionStats(state.telemetryContext.sessionStats);
      }
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const activeCar = cars.find(c => c.id === selectedCarId);

  // Helper to extract JSON tune block from model responses
  const parseTuneFromText = (text: string): TuneData | null => {
    try {
      const match = text.match(/```json:tune\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.tires && parsed.antiRollBars && parsed.springs && parsed.differential) {
          return parsed as TuneData;
        }
      }
    } catch (e) {
      console.warn("Could not parse tune block", e);
    }
    return null;
  };

  const speakResponse = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn(e);
    }
  };

  const sendMessage = async (overrideText?: string, includeLiveTelemetry: boolean = false) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideText) setInput('');
    setLoading(true);

    try {
      const payloadContext = {
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
        activeTune: activeCar ? defaultTuneData(activeCar.drivetrain) : null,
        knowledgeEntries: knowledge.slice(0, 5),
        recentTests: tests.slice(0, 5),
        liveTelemetry: (includeLiveTelemetry || telemetryConnected) ? liveTelemetry : null,
        sessionStats: sessionStats
      };

      const filteredTurns = [...messages, userMessage].filter(m => m.text && m.text.trim());

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: filteredTurns.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          context: payloadContext
        })
      });

      const data = await response.json().catch(() => ({ text: '' }));
      if (!response.ok && !data.text) {
        throw new Error(data.error || `HTTP ${response.status}: Falha de comunicação com o Engenheiro IA.`);
      }

      const replyText = data.text || 'Telemetria analisada. Dinâmica de chassi calculada.';
      const extractedTune = parseTuneFromText(replyText);

      const newModelMessage: Message = {
        role: 'model',
        text: replyText,
        timestamp: Date.now(),
        extractedTune
      };

      setMessages(prev => [...prev, newModelMessage]);
      speakResponse(replyText);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `⚠️ **[AVISO DE ENGENHARIA]** ${e?.message || 'Falha ao processar solicitação. Verifique os dados do veículo e tente novamente.'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToKnowledge = async (msgText: string, idx: number) => {
    if (!user) return;
    try {
      await addKnowledgeEntry(user.uid, {
        subject: activeCar ? `${activeCar.brand} ${activeCar.model} - Regra de Setup IA` : 'Fórmula de Dinâmica de Chassi',
        carName: activeCar ? `${activeCar.brand} ${activeCar.model}` : 'Veículo Geral',
        observation: msgText.slice(0, 300) + '...',
        evidence: `Calculado pelo FH6 AI Engineer Core.`,
        confidence: 'High',
        tags: ['AI-Engineer', activeCar ? activeCar.drivetrain : 'Universal', 'Setup-Guideline']
      });
      setSaveKnowledgeSuccess(`Análise #${idx + 1} salva na Base de Conhecimento com sucesso!`);
      setTimeout(() => setSaveKnowledgeSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'model',
        text: 'Sessão reiniciada. Buffer de telemetria limpo. Pronto para novos cálculos de calibração.',
        timestamp: Date.now()
      }
    ]);
  };

  const promptCategories = [
    {
      title: 'Equilíbrio de Chassi & ARBs',
      prompts: [
        'Calcular rigidez de Anti-Roll Bars (ARB) para equilíbrio neutro na entrada e saída de curva',
        'Diagnosticar e eliminar o subesterço (understeer) na entrada de curvas rápidas',
        'Calcular rigidez de molas (Springs) a partir da distribuição de peso e massa'
      ]
    },
    {
      title: 'Diferencial & Transmissão',
      prompts: [
        'Calibrar diferencial RWD de alta potência para evitar snap oversteer na reaceleração',
        'Otimizar divisão central de torque do diferencial AWD para aderência em asfalto',
        'Ajustar bloqueio de Decel no diferencial traseiro para estabilizar a frenagem'
      ]
    },
    {
      title: 'Térmica & Pressão de Pneus',
      prompts: [
        'Calcular pressão a frio dos pneus para atingir 33.0 PSI a quente em pista',
        'Analisar camber dianteiro/traseiro para gradiente térmico ideal',
        'Proporção entre Rebound e Bump Damping para zebras e variações de relevo'
      ]
    },
    {
      title: 'Builds & Roteiros de PI',
      prompts: [
        'Indicar upgrades prioritários para atingir PI 800 (Classe A) com máxima aderência',
        'Otimizar build de circuito fechado para PI 900 (Classe S1)',
        'Calcular escalonamento de marchas e Final Drive para atingir potência máxima na reta'
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden font-mono select-none">
      {/* Top Header */}
      <header className="border-b border-[#222] p-5 bg-gradient-to-b from-[#121212] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-bold mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ef4444] rounded-full animate-pulse"></span>
              Núcleo Neural de Dinâmica Veicular & Engenharia de Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
              Engenheiro IA (FH6)
              <span className="text-xs font-mono font-normal not-italic px-2 py-0.5 bg-[#181818] border border-[#333] text-[#10b981]">
                Gemini 3.7 Flash
              </span>
            </h1>
          </div>

          {/* Controls / Context Selector Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Telemetry Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#222] text-xs">
              {telemetryConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
                  <span className="text-[#10b981] font-bold uppercase text-[10px]">Telemetria UDP Ao Vivo</span>
                  {liveTelemetry && (
                    <span className="text-[10px] text-[#888]">
                      ({Math.round(liveTelemetry.speedKmh || 0)} km/h • {Math.round(liveTelemetry.rpm || 0)} RPM)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#666]" />
                  <span className="text-[#666] font-bold uppercase text-[10px]">Telemetria Offline</span>
                </>
              )}
            </div>

            {/* Vehicle Context Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#666] uppercase">Veículo Ativo:</span>
              <select
                value={selectedCarId}
                onChange={e => setSelectedCarId(e.target.value)}
                className="bg-[#141414] border border-[#333] text-xs text-white px-3 py-1.5 uppercase font-bold focus:border-[#ef4444] focus:outline-none"
              >
                <option value="GLOBAL">Geral / Sem Veículo Específico</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.model} ({c.carClass}{c.pi} • {c.drivetrain})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Audio Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 border text-xs transition-colors flex items-center gap-1.5 ${
                voiceEnabled 
                  ? 'bg-[#ef4444] text-black border-[#ef4444] font-bold' 
                  : 'bg-[#141414] hover:bg-[#222] border-[#333] text-[#777] hover:text-white'
              }`}
              title={voiceEnabled ? 'Áudio de Rádio dos Boxes Ativo' : 'Ativar Leitura por Voz dos Boxes'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] uppercase">{voiceEnabled ? 'Voz LIGADA' : 'Voz'}</span>
            </button>

            {/* Reset Chat */}
            <button
              onClick={handleClearHistory}
              className="p-2 bg-[#141414] hover:bg-[#222] border border-[#333] text-[#777] hover:text-white"
              title="Reiniciar Sessão de Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Success Notification */}
      {saveKnowledgeSuccess && (
        <div className="bg-[#10b981] text-black text-xs font-bold px-6 py-2 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveKnowledgeSuccess}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 p-4 sm:p-6 overflow-hidden">
        
        {/* Left Side: Main Chat Terminal */}
        <div className="flex-1 bg-[#0e0e0e] border border-[#222] flex flex-col overflow-hidden">
          
          {/* Active Context Banner */}
          <div className="p-3 bg-[#080808] border-b border-[#1f1f1f] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#ef4444]" />
              <span className="text-[#888]">Alvo de Engenharia:</span>
              <span className="font-bold text-white uppercase">
                {activeCar 
                  ? `${activeCar.brand} ${activeCar.model} (${activeCar.carClass}${activeCar.pi} • ${activeCar.power} HP • ${activeCar.weight} kg • ${activeCar.drivetrain})` 
                  : 'Física Universal do Forza Horizon 6'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-[#10b981] font-bold uppercase">
                {knowledge.length} Regras Salvas
              </span>
              <span className="text-[#3b82f6] font-bold uppercase">
                {tests.length} Experimentos
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[92%] p-4 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#ef4444] text-black font-bold'
                    : 'bg-[#131313] border-l-2 border-[#ef4444] text-[#e0e0e0]'
                }`}>
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  ) : (
                    <div className="markdown-body space-y-2">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold text-white uppercase tracking-wider mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-[#ef4444] uppercase tracking-wider mt-3 mb-1.5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold text-white uppercase mt-2 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 text-[#ccc] leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-[#ddd]">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-[#ddd]">{children}</ol>,
                          li: ({ children }) => <li className="text-[#ccc]">{children}</li>,
                          code: ({ inline, className, children, ...props }: any) => {
                            if (String(children).includes('json:tune')) return null;
                            return !inline ? (
                              <pre className="p-3 bg-[#0a0a0a] border border-[#222] text-[#f59e0b] overflow-x-auto my-2 text-[11px]">
                                <code>{children}</code>
                              </pre>
                            ) : (
                              <code className="px-1.5 py-0.5 bg-[#202020] text-[#ef4444] font-bold text-[11px]" {...props}>
                                {children}
                              </code>
                            );
                          },
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3 border border-[#222]">
                              <table className="w-full text-left text-[11px] border-collapse">{children}</table>
                            </div>
                          ),
                          th: ({ children }) => <th className="p-2 bg-[#181818] text-[#ef4444] border-b border-[#2a2a2a] uppercase font-bold">{children}</th>,
                          td: ({ children }) => <td className="p-2 border-b border-[#1f1f1f] text-[#ddd]">{children}</td>,
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>

                      {/* Interactive Tune Card if response contained tune data */}
                      {m.extractedTune && (
                        <TuneCard
                          tune={m.extractedTune}
                          carId={activeCar?.id}
                          carName={activeCar ? `${activeCar.brand} ${activeCar.model}` : undefined}
                          title="Setup Calculado pelo Engenheiro IA"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Model Message Actions Bar */}
                {m.role === 'model' && (
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#666]">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.text);
                      }}
                      className="hover:text-white flex items-center gap-1"
                      title="Copiar texto da resposta"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>

                    <span>•</span>

                    <button
                      onClick={() => handleSaveToKnowledge(m.text, idx)}
                      className="hover:text-[#10b981] flex items-center gap-1"
                      title="Salvar esta análise como regra na Base de Conhecimento"
                    >
                      <BookOpen className="w-3 h-3" /> Salvar no Conhecimento
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-[#aaa] p-4 bg-[#141414] border-l-2 border-[#ef4444] w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#ef4444]" />
                <span className="uppercase tracking-wider">
                  Processando vetores de transferência de carga e resolvendo dinâmica de suspensão...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Strip */}
          <div className="p-2.5 bg-[#0a0a0a] border-t border-[#1a1a1a] flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { label: 'Corrigir Understeer', prompt: 'Diagnosticar e corrigir subesterço (understeer) na entrada de curva via ARB e amortecedores' },
              { label: 'Diferencial AWD Ideal', prompt: 'Calcular distribuição de torque e aceleração/desaceleração ideal do diferencial AWD' },
              { label: 'Pressão a Frio', prompt: 'Calcular pressões a frio dos pneus para atingir 33.0 PSI a quente em pista' },
              { label: 'Blueprint Classe A800', prompt: 'Fornecer roteiro passo a passo de peças de upgrade para atingir o topo da classe A800 com máxima aderência' },
              { label: 'Rigidez de ARBs', prompt: 'Calcular valores exatos de Anti-Roll Bars dianteira e traseira a partir da distribuição de peso' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => sendMessage(item.prompt)}
                className="px-3 py-1 bg-[#161616] hover:bg-[#252525] border border-[#2a2a2a] text-[10px] text-[#aaa] hover:text-white uppercase whitespace-nowrap transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 sm:p-4 border-t border-[#222] bg-[#080808] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Peça números de tuning, peças de upgrade, ARBs, molas, amortecedores ou porcentagens de diferencial..."
              className="flex-1 bg-[#141414] border border-[#262626] p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#ef4444]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 bg-[#ef4444] text-black hover:bg-white text-xs font-black uppercase transition-colors disabled:opacity-50 inline-flex items-center gap-2 shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Analisar
            </button>
          </form>
        </div>

        {/* Right Side: Engineering Diagnostics & Live Telemetry Inspector */}
        <div className="w-full lg:w-80 bg-[#0e0e0e] border border-[#222] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-[#222] bg-[#121212]">
            <div className="text-[10px] uppercase tracking-widest text-[#ef4444] font-bold">Diagnóstico de Chassi</div>
            <div className="text-sm font-black italic text-white uppercase">Feed de Telemetria Real</div>
          </div>

          {/* Telemetry Snapshot Card */}
          <div className="p-4 border-b border-[#1c1c1c] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#666] uppercase text-[10px]">Fluxo UDP:</span>
              <span className={`text-[10px] font-bold uppercase ${telemetryConnected ? 'text-[#10b981]' : 'text-[#777]'}`}>
                {telemetryConnected ? 'Online (Ativo)' : 'Aguardando Jogo'}
              </span>
            </div>

            {liveTelemetry ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-[#141414] border border-[#222]">
                  <span className="text-[#888]">Velocidade:</span>
                  <span className="text-white font-bold">{Math.round(liveTelemetry.speedKmh || 0)} km/h</span>
                </div>
                <div className="flex justify-between p-2 bg-[#141414] border border-[#222]">
                  <span className="text-[#888]">Aceleração Lat:</span>
                  <span className="text-[#ef4444] font-bold">{Number(liveTelemetry.accelX || 0).toFixed(2)} G</span>
                </div>
                <div className="flex justify-between p-2 bg-[#141414] border border-[#222]">
                  <span className="text-[#888]">Aceleração Long:</span>
                  <span className="text-[#3b82f6] font-bold">{Number(liveTelemetry.accelZ || 0).toFixed(2)} G</span>
                </div>
                <div className="flex justify-between p-2 bg-[#141414] border border-[#222]">
                  <span className="text-[#888]">Slip Dianteiro (FL/FR):</span>
                  <span className="text-white font-bold">
                    {Number(liveTelemetry.tireSlipFL || 0).toFixed(2)} / {Number(liveTelemetry.tireSlipFR || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#141414] border border-[#222] text-center text-[#666] text-xs">
                <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                Nenhum fluxo UDP detectado no momento. Abra o Forza Horizon 6 com Data Out ligado na porta 5300.
              </div>
            )}

            {/* Quick Button to inject live telemetry */}
            <button
              onClick={() => sendMessage('Analise o pacote de telemetria real atual, círculo de aderência G-G e taxas de slip dos pneus para diagnosticar limites dinâmicos.', true)}
              disabled={loading}
              className="w-full py-2 bg-[#181818] hover:bg-[#252525] border border-[#333] text-[10px] text-white uppercase font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#ef4444]" />
              Auditar Telemetria Atual
            </button>
          </div>

          {/* Quick Engineering Question Library */}
          <div className="p-4 flex-1 space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-[#888] font-bold">
              Biblioteca de Questões Rápidas
            </div>

            {promptCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-1.5">
                <div className="text-[10px] text-[#ef4444] uppercase font-bold">{cat.title}</div>
                <div className="space-y-1">
                  {cat.prompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => sendMessage(p)}
                      className="w-full text-left p-2 bg-[#121212] hover:bg-[#1c1c1c] border border-[#1f1f1f] text-[10px] text-[#aaa] hover:text-white leading-tight transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
