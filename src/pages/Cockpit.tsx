import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CarFront, 
  Wrench, 
  FlaskConical, 
  Activity, 
  Cpu, 
  Plus, 
  ArrowRight, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeCars, 
  subscribeTests, 
  subscribeKnowledge, 
  Car, 
  TestExperiment, 
  KnowledgeEntry 
} from '../lib/firestore';

export function Cockpit() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [tests, setTests] = useState<TestExperiment[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let unsubCars: () => void;
    let unsubTests: () => void;
    let unsubKnowledge: () => void;

    unsubCars = subscribeCars(user.uid, (data) => {
      setCars(data);
      setLoading(false);
    });

    unsubTests = subscribeTests(user.uid, (data) => {
      setTests(data);
    });

    unsubKnowledge = subscribeKnowledge(user.uid, (data) => {
      setKnowledge(data);
    });

    return () => {
      if (unsubCars) unsubCars();
      if (unsubTests) unsubTests();
      if (unsubKnowledge) unsubKnowledge();
    };
  }, [user]);

  const activeCar = cars.length > 0 ? cars[0] : null;
  const pendingTests = tests.filter(t => t.status === 'Pending');
  const completedTests = tests.filter(t => t.status === 'Completed');

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto">
      {/* Header */}
      <header className="border-b border-[#222] p-8 bg-gradient-to-b from-[#121212] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-mono font-bold mb-1">
              Forza Horizon 6 • Central de Comando de Engenharia
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Cockpit Operacional
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/garage" 
              className="px-4 py-2.5 bg-[#181818] hover:bg-[#252525] border border-[#333] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <CarFront className="w-3.5 h-3.5 text-[#ef4444]" />
              Gerenciar Garagem ({cars.length})
            </Link>
            <Link 
              to="/engineer" 
              className="px-4 py-2.5 bg-[#ef4444] hover:bg-white hover:text-black text-black text-xs font-mono font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5" />
              Engenheiro IA
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* Core KPI strip - Strictly Real Data, NO Fake scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <div className="flex items-center justify-between text-[#666] mb-3">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold">Frota na Garagem</span>
              <CarFront className="w-4 h-4 text-[#ef4444]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{cars.length}</div>
            <div className="text-[10px] text-[#666] uppercase tracking-widest mt-1 font-mono">
              {cars.filter(c => c.isFavorite).length} Favoritos • {cars.length > 0 ? `${cars[0].carClass} Top Class` : 'Sem carros ativos'}
            </div>
          </div>

          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <div className="flex items-center justify-between text-[#666] mb-3">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold">Testes Ativos</span>
              <FlaskConical className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{pendingTests.length}</div>
            <div className="text-[10px] text-[#666] uppercase tracking-widest mt-1 font-mono">
              {completedTests.length} Validados / Concluídos
            </div>
          </div>

          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <div className="flex items-center justify-between text-[#666] mb-3">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold">Base de Conhecimento</span>
              <Sparkles className="w-4 h-4 text-[#10b981]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{knowledge.length}</div>
            <div className="text-[10px] text-[#666] uppercase tracking-widest mt-1 font-mono">
              {knowledge.filter(k => k.confidence === 'High').length} Regras de Alta Confiança
            </div>
          </div>

          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <div className="flex items-center justify-between text-[#666] mb-3">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold">Link de Telemetria</span>
              <Radio className="w-4 h-4 text-[#eab308]" />
            </div>
            <div className="text-sm font-black text-[#eab308] font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#eab308] animate-pulse"></span>
              Pronto (UDP :5300)
            </div>
            <div className="text-[10px] text-[#666] uppercase tracking-widest mt-2 font-mono">
              Data Out / Loopback
            </div>
          </div>
        </div>

        {/* Active Car & Quick Development Track */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Car Focal Card */}
          <div className="lg:col-span-2 bg-[#0e0e0e] border border-[#222] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#1c1c1c] pb-3">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#ef4444] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#ef4444]"></span> Veículo em Desenvolvimento Ativo
                </span>
                {activeCar && (
                  <span className="text-[10px] font-mono text-[#888] uppercase">
                    Atualizado recentemente
                  </span>
                )}
              </div>

              {activeCar ? (
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">
                      {activeCar.brand} {activeCar.model}
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#ef4444] text-black italic">
                      {activeCar.carClass} {activeCar.pi}
                    </span>
                    <span className="text-xs font-mono text-[#888] border border-[#333] px-2 py-0.5">
                      {activeCar.drivetrain}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 my-6 p-4 bg-[#080808] border border-[#1a1a1a]">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-[#555] font-mono">Potência</div>
                      <div className="text-lg font-black text-white font-mono">{activeCar.power} <span className="text-xs text-[#666] font-normal">HP</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-[#555] font-mono">Peso</div>
                      <div className="text-lg font-black text-white font-mono">{activeCar.weight} <span className="text-xs text-[#666] font-normal">KG</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-[#555] font-mono">Relação Peso/Potência</div>
                      <div className="text-lg font-black text-[#10b981] font-mono">
                        {(activeCar.power / (activeCar.weight / 1000)).toFixed(1)} <span className="text-xs text-[#666] font-normal">HP/T</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/garage/car/${activeCar.id}`}
                      className="px-4 py-2 bg-[#ef4444] text-black hover:bg-white text-xs font-bold uppercase tracking-wider font-mono transition-colors inline-flex items-center gap-2"
                    >
                      Abrir Estúdio do Carro <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/tests?carId=${activeCar.id}`}
                      className="px-4 py-2 bg-[#181818] hover:bg-[#252525] border border-[#333] text-white text-xs font-bold uppercase tracking-wider font-mono transition-colors inline-flex items-center gap-2"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-[#3b82f6]" /> Registrar Experimento
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-xs text-[#555] font-mono uppercase tracking-widest mb-4">
                    NENHUM CARRO NA GARAGEM
                  </div>
                  <Link 
                    to="/garage"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ef4444] text-black text-xs font-black uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Primeiro Carro
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick AI Engineer Assistant Box */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#1c1c1c] pb-3">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-white flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#ef4444]" /> Engenheiro de Pista IA
                </span>
                <span className="text-[9px] font-mono text-[#10b981] uppercase font-bold">Online</span>
              </div>
              <p className="text-xs text-[#999] leading-relaxed mb-4">
                Consulte dúvidas de engenharia, diagnóstico de subesterço/sobresterço e cálculo das porcentagens ideais de diferencial.
              </p>
              <div className="space-y-2">
                <Link 
                  to="/engineer" 
                  className="block p-2.5 bg-[#141414] hover:bg-[#1c1c1c] border border-[#252525] text-[11px] text-[#ccc] hover:text-white transition-colors font-mono"
                >
                  → "Analisar diferencial AWD para estabilidade em alta velocidade"
                </Link>
                <Link 
                  to="/engineer" 
                  className="block p-2.5 bg-[#141414] hover:bg-[#1c1c1c] border border-[#252525] text-[11px] text-[#ccc] hover:text-white transition-colors font-mono"
                >
                  → "Calcular pressão ideal de pneus para pista técnica RWD"
                </Link>
              </div>
            </div>
            <Link
              to="/engineer"
              className="mt-6 w-full py-2.5 border border-[#333] hover:border-[#ef4444] text-[#aaa] hover:text-white text-xs font-mono font-bold uppercase tracking-wider text-center transition-colors block"
            >
              Abrir Console do Engenheiro IA →
            </Link>
          </div>
        </div>

        {/* Recent Real Experiments & Discoveries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c1c1c]">
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-[#3b82f6]" /> Experimentos Recentes do Laboratório
              </h3>
              <Link to="/tests" className="text-[10px] text-[#ef4444] hover:underline font-mono uppercase font-bold">
                Ver Todos ({tests.length})
              </Link>
            </div>

            {tests.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#222] bg-[#080808]">
                <p className="text-xs text-[#555] font-mono uppercase tracking-widest mb-3">NENHUM EXPERIMENTO REGISTRADO</p>
                <Link to="/tests" className="text-xs text-[#ef4444] font-mono uppercase font-bold hover:underline">
                  + Criar Experimento #001
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tests.slice(0, 3).map((test) => (
                  <div key={test.id} className="p-3.5 bg-[#121212] border border-[#222] flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.5 border border-[#ef4444]/20">
                          {test.code || '#EXP'}
                        </span>
                        <span className="text-xs font-bold text-white uppercase italic">{test.carName}</span>
                        {test.track && (
                          <span className="text-[10px] font-mono text-[#666]">• {test.track}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#aaa] font-mono mb-1">{test.objective}</p>
                      <div className="text-[10px] text-[#777] font-mono">
                        <span className="text-[#999]">{test.variable}:</span> {test.beforeValue} → <span className="text-white font-bold">{test.afterValue}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase font-bold ${
                      test.status === 'Completed' 
                        ? 'border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10' 
                        : 'border-[#eab308]/40 text-[#eab308] bg-[#eab308]/10'
                    }`}>
                      {test.status === 'Completed' ? 'Concluído' : test.status === 'Pending' ? 'Pendente' : 'Descartado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Knowledge Entries */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c1c1c]">
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#10b981]" /> Base de Conhecimento de Engenharia
              </h3>
              <Link to="/knowledge" className="text-[10px] text-[#ef4444] hover:underline font-mono uppercase font-bold">
                Ver Todas ({knowledge.length})
              </Link>
            </div>

            {knowledge.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#222] bg-[#080808]">
                <p className="text-xs text-[#555] font-mono uppercase tracking-widest mb-3">NENHUMA REGRA SALVA</p>
                <Link to="/knowledge" className="text-xs text-[#10b981] font-mono uppercase font-bold hover:underline">
                  + Adicionar Descoberta Confirmada
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {knowledge.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3.5 bg-[#121212] border border-[#222]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white uppercase">{item.subject}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 border border-[#10b981]/30 text-[#10b981] bg-[#10b981]/10 uppercase font-bold">
                        {item.confidence === 'High' ? 'Alta Confiança' : item.confidence === 'Medium' ? 'Média' : 'Experimental'}
                      </span>
                    </div>
                    <p className="text-xs text-[#aaa] font-mono leading-relaxed">{item.observation}</p>
                    {item.evidence && (
                      <div className="text-[10px] text-[#666] font-mono mt-2">
                        Evidência: <span className="text-[#888]">{item.evidence}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
