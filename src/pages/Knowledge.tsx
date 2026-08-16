import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Tag, 
  CheckCircle,
  X 
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeKnowledge, 
  addKnowledgeEntry, 
  deleteKnowledgeEntry, 
  KnowledgeEntry 
} from '../lib/firestore';

export function Knowledge() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConfidence, setSelectedConfidence] = useState<'ALL' | 'High' | 'Medium' | 'Experimental'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeKnowledge(user.uid, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Delete this engineering rule?")) {
      await deleteKnowledgeEntry(user.uid, id);
    }
  };

  const handleSeedDefaults = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const defaults = [
        {
          subject: 'Aero Balance in High-Speed Sweep',
          carName: 'General Physics / GT3 / S2 Class',
          observation: 'Increasing rear wing angle by 10-15% stabilizes turn-in at >200 KM/H, but shifts mid-corner balance to understeer unless front ARB is softened proportionally.',
          evidence: 'Tested on Horizon Mexico Circuit high-speed sector 2.',
          confidence: 'High' as const,
          tags: ['Aero', 'ARBs', 'S2 Class']
        },
        {
          subject: 'Off-Throttle Turn-In Rotation (Decel Lock)',
          carName: 'RWD / AWD Platforms',
          observation: 'Setting rear differential deceleration below 15-20% causes snap oversteer during trail braking into hairpins. 30-38% decel maintains rear axle stability.',
          evidence: 'Empirical telemetry tests #002 and #004.',
          confidence: 'High' as const,
          tags: ['Differential', 'Braking', 'RWD']
        },
        {
          subject: 'Tire Pressure Sweet Spot for Thermal Grip',
          carName: 'Slick / Semi-Slick Compounds',
          observation: 'Starting cold tire pressure at 27.5-28.5 PSI stabilizes hot running pressure at 32.0-33.0 PSI after 2 warm-up laps, maximizing contact patch traction.',
          evidence: 'Telemetry thermal logbook.',
          confidence: 'High' as const,
          tags: ['Tires', 'Telemetry']
        }
      ];

      for (const item of defaults) {
        await addKnowledgeEntry(user.uid, item);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(e => {
    const q = search.toLowerCase();
    const matchesSearch = e.subject.toLowerCase().includes(q) ||
                          e.observation.toLowerCase().includes(q) ||
                          (e.carName || '').toLowerCase().includes(q) ||
                          (e.tags || []).some(t => t.toLowerCase().includes(q));
    const matchesConfidence = selectedConfidence === 'ALL' || e.confidence === selectedConfidence;
    return matchesSearch && matchesConfidence;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto font-mono">
      {/* Header */}
      <header className="border-b border-[#222] p-8 bg-gradient-to-b from-[#121212] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#eab308] font-bold mb-1">
              Engineering Discoveries & Principles
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Knowledge Base
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#eab308] text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Knowledge Entry
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
              placeholder="Search engineering rules, observations, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] pl-9 pr-4 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#555] uppercase mr-1">Confidence:</span>
            {(['ALL', 'High', 'Medium', 'Experimental'] as const).map(conf => (
              <button
                key={conf}
                onClick={() => setSelectedConfidence(conf)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors ${
                  selectedConfidence === conf
                    ? 'bg-[#eab308] text-black'
                    : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
                }`}
              >
                {conf}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-[#eab308] animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#222] bg-[#0c0c0c] p-8">
            <BookOpen className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Knowledge Base is Empty
            </h3>
            <p className="text-xs text-[#666] max-w-md mx-auto mb-6">
              Record verified tuning relationships, empirical rules, and track physics to continuously enhance your tuning system.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#eab308] text-black text-xs font-black uppercase tracking-wider hover:bg-white transition-colors"
              >
                + Add First Rule
              </button>
              <button
                onClick={handleSeedDefaults}
                className="px-5 py-2.5 bg-[#181818] border border-[#333] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#252525] transition-colors"
              >
                Import Baseline Rules
              </button>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 border border-[#222] bg-[#0c0c0c]">
            <p className="text-xs text-[#666] uppercase tracking-widest">
              No knowledge entries matching filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="p-6 bg-[#0e0e0e] border border-[#222] hover:border-[#444] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-white uppercase">
                      {entry.subject}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 uppercase font-bold border ${
                        entry.confidence === 'High' 
                          ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10' 
                          : entry.confidence === 'Medium'
                          ? 'text-[#eab308] border-[#eab308]/30 bg-[#eab308]/10'
                          : 'text-[#888] border-[#333] bg-[#141414]'
                      }`}>
                        {entry.confidence}
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id!)}
                        className="p-1 text-[#555] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {entry.carName && (
                    <div className="text-[10px] text-[#eab308] font-bold uppercase mb-3">
                      Applicability: {entry.carName}
                    </div>
                  )}

                  <p className="text-xs text-[#ccc] leading-relaxed mb-4">
                    {entry.observation}
                  </p>

                  {entry.evidence && (
                    <div className="p-3 bg-[#080808] border border-[#1a1a1a] text-[11px] text-[#888] mb-4">
                      <span className="text-[#aaa] font-bold block mb-0.5">Empirical Evidence:</span>
                      {entry.evidence}
                    </div>
                  )}
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#1c1c1c]">
                    {entry.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] text-[#666] bg-[#141414] border border-[#222] px-2 py-0.5 uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <CreateKnowledgeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            if (!user) return;
            await addKnowledgeEntry(user.uid, data);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateKnowledgeModal({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (data: Omit<KnowledgeEntry, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}) {
  const [subject, setSubject] = useState('');
  const [carName, setCarName] = useState('All AWD / RWD Cars');
  const [observation, setObservation] = useState('');
  const [evidence, setEvidence] = useState('');
  const [confidence, setConfidence] = useState<'High' | 'Medium' | 'Experimental'>('High');
  const [tagInput, setTagInput] = useState('ARBs, Differential');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      await onSubmit({
        subject,
        carName,
        observation,
        evidence,
        confidence,
        tags
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
          New Knowledge Base Discovery
        </h3>
        <p className="text-xs text-[#666] mb-6">
          Document an empirical tuning rule or vehicle setup insight.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-[#777] mb-1">Subject / Phenomenon</label>
            <input
              type="text"
              required
              placeholder="e.g. Front Roll Bar Stiffness vs Mid-Corner Push"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#eab308] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Applicability / Platform</label>
              <input
                type="text"
                placeholder="e.g. All S1 Road Grip Cars, RWD High Downforce"
                value={carName}
                onChange={e => setCarName(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#eab308] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[#777] mb-1">Confidence Rating</label>
              <select
                value={confidence}
                onChange={e => setConfidence(e.target.value as any)}
                className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#eab308] focus:outline-none"
              >
                <option value="High">High (Empirically Verified)</option>
                <option value="Medium">Medium (Consistent Trend)</option>
                <option value="Experimental">Experimental (Hypothesis)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#777] mb-1">Engineering Observation / Rule</label>
            <textarea
              required
              rows={3}
              placeholder="Describe the cause-and-effect relationship in clear mathematical/mechanical detail..."
              value={observation}
              onChange={e => setObservation(e.target.value)}
              className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#eab308] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#777] mb-1">Evidence / Supporting Telemetry</label>
            <input
              type="text"
              placeholder="e.g. Validated across 15 laps at Horizon Mexico Circuit with 60Hz UDP telemetry."
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#eab308] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[#777] mb-1">Tags (Comma-Separated)</label>
            <input
              type="text"
              placeholder="e.g. Aero, ARBs, Suspension, S1"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="w-full bg-[#161616] border border-[#262626] p-2 text-white focus:border-[#eab308] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[#777] hover:text-white uppercase">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#eab308] text-black font-bold uppercase hover:bg-white transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Knowledge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
