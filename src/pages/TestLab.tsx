import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Loader2, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeTests, 
  subscribeCars, 
  addTestExperiment, 
  updateTestExperiment, 
  deleteTestExperiment, 
  addKnowledgeEntry,
  TestExperiment, 
  Car 
} from '../lib/firestore';

export function TestLab() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedCarId = searchParams.get('carId');

  const [tests, setTests] = useState<TestExperiment[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Completed' | 'Discarded'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubTests = subscribeTests(user.uid, (data) => {
      setTests(data);
      setLoading(false);
    });

    const unsubCars = subscribeCars(user.uid, (data) => {
      setCars(data);
    });

    return () => {
      unsubTests();
      unsubCars();
    };
  }, [user]);

  const handleDelete = async (testId: string) => {
    if (!user) return;
    if (window.confirm("Remove this experiment record?")) {
      await deleteTestExperiment(user.uid, testId);
    }
  };

  const handlePromoteToKnowledge = async (test: TestExperiment) => {
    if (!user) return;
    try {
      await addKnowledgeEntry(user.uid, {
        subject: `${test.variable} Tuning Delta`,
        carName: test.carName,
        observation: `${test.objective}. Changed ${test.variable} from ${test.beforeValue} to ${test.afterValue}. Result: ${test.result || 'Confirmed performance improvement.'}`,
        evidence: `Experiment ${test.code || '#EXP'} tested on ${test.track || 'Track'}`,
        confidence: 'High',
        tags: [test.variable, test.carName]
      });
      alert('Promoted experiment finding to Knowledge Base!');
    } catch (e) {
      console.error(e);
      alert('Error promoting to knowledge');
    }
  };

  const filteredTests = tests.filter(test => {
    const q = search.toLowerCase();
    const matchesSearch = test.carName.toLowerCase().includes(q) ||
                          test.objective.toLowerCase().includes(q) ||
                          test.variable.toLowerCase().includes(q) ||
                          (test.track || '').toLowerCase().includes(q) ||
                          (test.code || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto font-mono">
      {/* Header */}
      <header className="border-b border-[#222] p-8 bg-gradient-to-b from-[#121212] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#3b82f6] font-bold mb-1">
              Empirical A/B Testing & Dynamic Experiments
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Test Lab
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#3b82f6] text-white hover:bg-white hover:text-black text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Experiment
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Filter Bar */}
        <div className="bg-[#0e0e0e] border border-[#222] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search experiments by car, variable, track, code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] pl-9 pr-4 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555] uppercase mr-1">Status:</span>
            {(['ALL', 'Pending', 'Completed', 'Discarded'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors ${
                  statusFilter === st
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Experiment Cards */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#222] bg-[#0c0c0c] p-8">
            <FlaskConical className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              No Experiments Logged in Test Lab
            </h3>
            <p className="text-xs text-[#666] max-w-md mx-auto mb-6">
              Track single-variable setup alterations (e.g. differential deceleration, tire pressure, ARB balance) and capture empirical lap delta results.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#3b82f6] text-white text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              + Create Experiment #001
            </button>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-16 border border-[#222] bg-[#0c0c0c]">
            <p className="text-xs text-[#666] uppercase tracking-widest">
              No experiments match search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map(test => (
              <div key={test.id} className="p-5 bg-[#0e0e0e] border border-[#222] hover:border-[#444] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-[#3b82f6] text-xs font-bold">
                      {test.code || '#EXP'}
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase italic">
                      {test.carName}
                    </h3>
                    {test.track && (
                      <span className="text-xs text-[#777] font-normal">• Track: <span className="text-[#aaa]">{test.track}</span></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 uppercase font-bold border ${
                      test.status === 'Completed' 
                        ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10' 
                        : test.status === 'Discarded'
                        ? 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10'
                        : 'text-[#eab308] border-[#eab308]/30 bg-[#eab308]/10'
                    }`}>
                      {test.status}
                    </span>

                    <button
                      onClick={() => handlePromoteToKnowledge(test)}
                      title="Promote finding to Knowledge Base"
                      className="px-2 py-1 bg-[#141414] hover:bg-[#202020] border border-[#262626] text-[10px] text-[#10b981] uppercase font-bold inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Log Knowledge
                    </button>

                    <button
                      onClick={() => handleDelete(test.id!)}
                      className="p-1.5 text-[#555] hover:text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#ddd] mb-3">
                  <span className="text-[#777] uppercase text-[10px] block">Objective</span>
                  {test.objective}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#080808] border border-[#1a1a1a] text-xs mb-3">
                  <div>
                    <span className="text-[9px] text-[#555] uppercase block">Test Variable</span>
                    <span className="text-white font-bold">{test.variable}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555] uppercase block">Before Value</span>
                    <span className="text-[#888]">{test.beforeValue}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#555] uppercase block">After Value</span>
                    <span className="text-[#10b981] font-bold">{test.afterValue}</span>
                  </div>
                </div>

                {test.result && (
                  <div className="text-xs text-[#ccc] leading-relaxed pt-2 border-t border-[#1a1a1a]">
                    <span className="text-[#3b82f6] font-bold uppercase text-[10px]">Empirical Result: </span>
                    {test.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <CreateExperimentModal
          cars={cars}
          preselectedCarId={preselectedCarId}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            if (!user) return;
            const code = `#${String(tests.length + 1).padStart(3, '0')}`;
            await addTestExperiment(user.uid, {
              ...data,
              code
            });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateExperimentModal({
  cars,
  preselectedCarId,
  onClose,
  onSubmit
}: {
  cars: Car[];
  preselectedCarId: string | null;
  onClose: () => void;
  onSubmit: (data: Omit<TestExperiment, 'id' | 'ownerId' | 'code' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [selectedCarId, setSelectedCarId] = useState(preselectedCarId || (cars[0]?.id || ''));
  const [track, setTrack] = useState('Horizon Mexico Circuit');
  const [objective, setObjective] = useState('');
  const [variable, setVariable] = useState('Rear Differential Acceleration');
  const [beforeValue, setBeforeValue] = useState('65%');
  const [afterValue, setAfterValue] = useState('55%');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Completed' | 'Discarded'>('Pending');
  const [submitting, setSubmitting] = useState(false);

  const selectedCar = cars.find(c => c.id === selectedCarId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) {
      alert("Please select or add a car first.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        carId: selectedCar.id!,
        carName: `${selectedCar.brand} ${selectedCar.model}`,
        track,
        objective,
        variable,
        beforeValue,
        afterValue,
        result,
        status
      });
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-[#333] w-full max-w-xl p-6 sm:p-8 font-mono text-xs relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#666] hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black italic text-white uppercase mb-2">
          New Test Lab Experiment
        </h3>
        <p className="text-xs text-[#666] mb-6">
          Isolate and test a single variable on a track to record telemetry and handling difference.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Target Car</label>
              <select
                value={selectedCarId}
                onChange={e => setSelectedCarId(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
              >
                {cars.map(c => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.carClass} {c.pi})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Track Context</label>
              <input
                type="text"
                required
                placeholder="e.g. Suzuka Circuit, Horizon Oval"
                value={track}
                onChange={e => setTrack(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#777] mb-1">Objective</label>
            <input
              type="text"
              required
              placeholder="e.g. Reduce understeer on medium-speed corner entry"
              value={objective}
              onChange={e => setObjective(e.target.value)}
              className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Variable Modified</label>
              <input
                type="text"
                required
                placeholder="e.g. Front ARB"
                value={variable}
                onChange={e => setVariable(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Before Value</label>
              <input
                type="text"
                required
                placeholder="e.g. 28.5"
                value={beforeValue}
                onChange={e => setBeforeValue(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">After Value</label>
              <input
                type="text"
                required
                placeholder="e.g. 24.0"
                value={afterValue}
                onChange={e => setAfterValue(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Experiment Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#3b82f6] focus:outline-none"
              >
                <option value="Pending">Pending Validation</option>
                <option value="Completed">Completed</option>
                <option value="Discarded">Discarded</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Empirical Result / Observation</label>
              <input
                type="text"
                placeholder="e.g. Turn-in sharper, lap time -0.220s"
                value={result}
                onChange={e => setResult(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[#777] hover:text-white uppercase">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#3b82f6] text-white font-bold uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Experiment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
