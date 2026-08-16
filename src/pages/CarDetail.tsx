import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CarFront, 
  Wrench, 
  FileCog, 
  FlaskConical, 
  Activity, 
  Cpu, 
  Plus, 
  Save, 
  Copy, 
  Check, 
  Trash2, 
  Edit2, 
  Loader2,
  Sliders,
  Sparkles,
  Info,
  Radio,
  Send,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeCar, 
  subscribeBuilds, 
  subscribeTunes, 
  subscribeTests,
  addBuild, 
  deleteBuild, 
  saveTune, 
  updateTune, 
  deleteTune,
  addTestExperiment,
  defaultTuneData,
  Car, 
  Build, 
  Tune, 
  TuneData, 
  TestExperiment,
  updateCar
} from '../lib/firestore';

export function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [tunes, setTunes] = useState<Tune[]>([]);
  const [tests, setTests] = useState<TestExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'upgrades' | 'builds' | 'tuning' | 'tests' | 'telemetry' | 'engineer'>('overview');

  useEffect(() => {
    if (!user || !id) return;
    
    let unsubCar = subscribeCar(user.uid, id, (data) => {
      setCar(data);
      setLoading(false);
    });

    let unsubBuilds = subscribeBuilds(user.uid, id, (data) => {
      setBuilds(data);
    });

    let unsubTunes = subscribeTunes(user.uid, id, (data) => {
      setTunes(data);
    });

    let unsubTests = subscribeTests(user.uid, (data) => {
      setTests(data.filter(t => t.carId === id));
    });

    return () => {
      if (unsubCar) unsubCar();
      if (unsubBuilds) unsubBuilds();
      if (unsubTunes) unsubTunes();
      if (unsubTests) unsubTests();
    };
  }, [user, id]);

  if (loading) {
    return (
      <div className="flex h-full bg-[#0a0a0a] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ef4444] animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] items-center justify-center p-8 text-center font-mono">
        <p className="text-white text-base mb-4 uppercase">Vehicle not found in garage.</p>
        <Link to="/garage" className="px-4 py-2 bg-[#ef4444] text-black font-bold uppercase text-xs">
          Return to Garage
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto">
      {/* Top Banner */}
      <header className="border-b border-[#222] p-6 bg-gradient-to-b from-[#141414] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/garage"
              className="text-[#777] hover:text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Garage
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-[#666]">Status:</span>
              <span className="text-[10px] font-mono uppercase text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 border border-[#10b981]/20 font-bold">
                {car.status || 'Active Setup'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-mono font-bold mb-1">
                {car.brand} • {car.year}
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
                  {car.model}
                </h1>
                <span className="px-2.5 py-0.5 bg-[#ef4444] text-black font-black text-lg italic font-mono">
                  {car.carClass} {car.pi}
                </span>
                <span className="text-xs font-mono text-[#888] border border-[#333] px-2.5 py-0.5">
                  {car.drivetrain}
                </span>
              </div>
            </div>

            {/* Quick spec strip */}
            <div className="flex items-center gap-4 bg-[#0e0e0e] border border-[#222] px-4 py-2 text-xs font-mono">
              <div>
                <span className="text-[#555] block text-[9px] uppercase">Power</span>
                <span className="font-bold text-white">{car.power} HP</span>
              </div>
              <div className="w-px h-6 bg-[#222]"></div>
              <div>
                <span className="text-[#555] block text-[9px] uppercase">Weight</span>
                <span className="font-bold text-white">{car.weight} KG</span>
              </div>
              <div className="w-px h-6 bg-[#222]"></div>
              <div>
                <span className="text-[#555] block text-[9px] uppercase">Ratio</span>
                <span className="font-bold text-[#10b981]">{(car.power / (car.weight / 1000)).toFixed(1)} HP/T</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Studio Navigation Tabs */}
      <div className="border-b border-[#222] bg-[#0c0c0c] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex space-x-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'upgrades', label: 'Upgrades', icon: Wrench },
            { id: 'builds', label: 'Builds', icon: Sliders },
            { id: 'tuning', label: 'Tuning Setup', icon: FileCog },
            { id: 'tests', label: `Test Lab (${tests.length})`, icon: FlaskConical },
            { id: 'telemetry', label: 'Telemetry', icon: Activity },
            { id: 'engineer', label: 'AI Engineer', icon: Cpu },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#ef4444] text-white bg-[#141414]'
                  : 'border-transparent text-[#666] hover:text-[#bbb]'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#ef4444]' : 'text-[#555]'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full flex-1">
        {activeTab === 'overview' && (
          <OverviewTab 
            car={car} 
            builds={builds} 
            tunes={tunes} 
            tests={tests}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'upgrades' && (
          <UpgradesTab car={car} user={user!} />
        )}

        {activeTab === 'builds' && (
          <BuildsTab car={car} builds={builds} user={user!} />
        )}

        {activeTab === 'tuning' && (
          <TuningTab car={car} tunes={tunes} user={user!} />
        )}

        {activeTab === 'tests' && (
          <TestsTab car={car} tests={tests} user={user!} builds={builds} />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryTab car={car} />
        )}

        {activeTab === 'engineer' && (
          <CarAIEngineerTab car={car} builds={builds} tunes={tunes} tests={tests} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. OVERVIEW TAB
// ----------------------------------------------------
function OverviewTab({ 
  car, 
  builds, 
  tunes, 
  tests,
  onSelectTab
}: { 
  car: Car; 
  builds: Build[]; 
  tunes: Tune[]; 
  tests: TestExperiment[];
  onSelectTab: (t: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specs Blueprint */}
        <div className="md:col-span-2 bg-[#0e0e0e] border border-[#222] p-6">
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#ef4444] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#ef4444]"></span> Vehicle Mechanical Profile
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#080808] border border-[#1a1a1a] mb-6">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#555] block">Performance Index</span>
              <span className="text-xl font-black text-white font-mono">{car.carClass} {car.pi}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono text-[#555] block">Drivetrain</span>
              <span className="text-xl font-black text-white font-mono">{car.drivetrain}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono text-[#555] block">Engine Power</span>
              <span className="text-xl font-black text-white font-mono">{car.power} HP</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono text-[#555] block">Curb Weight</span>
              <span className="text-xl font-black text-white font-mono">{car.weight} KG</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#181818] text-xs font-mono">
              <span className="text-[#666]">Target Category</span>
              <span className="text-white font-bold">{car.carClass} Circuit & Road Master</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#181818] text-xs font-mono">
              <span className="text-[#666]">Calculated Power-to-Weight</span>
              <span className="text-[#10b981] font-bold">{(car.power / (car.weight / 1000)).toFixed(2)} HP/Ton</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#181818] text-xs font-mono">
              <span className="text-[#666]">Engineering Notes</span>
              <span className="text-[#aaa] italic">{car.notes || 'No specific setup notes logged yet.'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="bg-[#0e0e0e] border border-[#222] p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-white mb-4">
              Setup Shortcuts
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onSelectTab('tuning')}
                className="w-full p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-[#252525] text-left text-xs font-mono text-white flex items-center justify-between transition-colors"
              >
                <span>Operational Tuning Setup</span>
                <span className="text-[10px] text-[#ef4444] font-bold">{tunes.length} Presets →</span>
              </button>
              <button
                onClick={() => onSelectTab('builds')}
                className="w-full p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-[#252525] text-left text-xs font-mono text-white flex items-center justify-between transition-colors"
              >
                <span>Build Configurations</span>
                <span className="text-[10px] text-[#ef4444] font-bold">{builds.length} Builds →</span>
              </button>
              <button
                onClick={() => onSelectTab('tests')}
                className="w-full p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-[#252525] text-left text-xs font-mono text-white flex items-center justify-between transition-colors"
              >
                <span>Test Lab Experiments</span>
                <span className="text-[10px] text-[#3b82f6] font-bold">{tests.length} Logged →</span>
              </button>
              <button
                onClick={() => onSelectTab('engineer')}
                className="w-full p-3 bg-[#141414] hover:bg-[#1a1a1a] border border-[#252525] text-left text-xs font-mono text-white flex items-center justify-between transition-colors"
              >
                <span>Ask AI Engineer</span>
                <span className="text-[10px] text-[#10b981] font-bold">Live AI →</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#080808] border border-[#1a1a1a] text-[10px] font-mono text-[#666]">
            All configuration changes and tests are automatically synchronized to your private cloud storage.
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. UPGRADES TAB
// ----------------------------------------------------
function UpgradesTab({ car, user }: { car: Car; user: any }) {
  const UPGRADE_GROUPS = [
    {
      category: 'Engine & Power Conversions',
      items: ['Race Intake', 'Race Fuel System', 'Race Ignition', 'Race Exhaust', 'Race Camshaft & Valves', 'Race Valves', 'Displacement Increase', 'Race Pistons & Compression', 'Single / Twin Turbo', 'Race Intercooler', 'Race Oil & Cooling', 'Race Flywheel']
    },
    {
      category: 'Platform & Handling',
      items: ['Race Brakes', 'Race Springs & Dampers', 'Race Anti-Roll Bars (Front)', 'Race Anti-Roll Bars (Rear)', 'Race Chassis Reinforcement & Roll Cage', 'Race Weight Reduction']
    },
    {
      category: 'Drivetrain Conversions',
      items: ['Race Clutch', 'Race Transmission (6-Speed / 7-Speed)', 'Race Driveline', 'Race Differential (1.5-Way / 2-Way)']
    },
    {
      category: 'Tires & Rims',
      items: ['Slick / Semi-Slick Tire Compound', 'Maximum Front Tire Width', 'Maximum Rear Tire Width', 'Lightweight Forged Rims', 'Max Front Track Width', 'Max Rear Track Width']
    },
    {
      category: 'Aero & Appearance',
      items: ['Forza Adjustable Front Splitter', 'Forza Adjustable Rear Wing', 'Rear Diffuser']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0e0e0e] border border-[#222] p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#ef4444]">
              Installed Component Upgrades
            </h3>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              Review parts affecting PI {car.pi} and handling dynamics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UPGRADE_GROUPS.map((group, idx) => (
            <div key={idx} className="bg-[#080808] border border-[#1a1a1a] p-4">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-3 pb-2 border-b border-[#161616]">
                {group.category}
              </h4>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono py-1 px-2 hover:bg-[#121212] rounded">
                    <span className="text-[#aaa]">{item}</span>
                    <span className="text-[10px] text-[#10b981] font-bold uppercase">Installed</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. BUILDS TAB
// ----------------------------------------------------
function BuildsTab({ car, builds, user }: { car: Car; builds: Build[]; user: any }) {
  const [showModal, setShowModal] = useState(false);
  const [version, setVersion] = useState('v1.0');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState(car.carClass);
  const [targetPI, setTargetPI] = useState(car.pi);
  const [result, setResult] = useState('');

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !car.id) return;
    await addBuild(user.uid, car.id, {
      version,
      description,
      targetClass,
      targetPI,
      result: result || 'Baseline configuration logged.'
    });
    setVersion(`v${(builds.length + 1).toFixed(1)}`);
    setDescription('');
    setResult('');
    setShowModal(false);
  };

  const handleDelete = async (buildId: string) => {
    if (!user || !car.id) return;
    if (window.confirm("Delete this build version?")) {
      await deleteBuild(user.uid, car.id, buildId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0e0e0e] border border-[#222] p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#ef4444]">
              Build Configuration History
            </h3>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              Record iterative modifications, parts swaps, and PI milestones for {car.brand} {car.model}.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#ef4444] text-black hover:bg-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Log New Build
          </button>
        </div>

        {builds.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#222] bg-[#080808]">
            <p className="text-xs text-[#555] font-mono uppercase tracking-widest mb-3">NO BUILDS LOGGED FOR THIS CAR</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-[#ef4444] font-mono uppercase font-bold hover:underline"
            >
              + Create Baseline Build (v1.0)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {builds.map(build => (
              <div key={build.id} className="p-5 bg-[#080808] border border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ef4444] text-black font-black text-xs font-mono italic">
                      {build.version}
                    </span>
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      {build.targetClass || car.carClass} {build.targetPI || car.pi} Target
                    </span>
                  </div>
                  <p className="text-xs text-[#ccc] font-mono">{build.description}</p>
                  {build.result && (
                    <div className="text-[11px] text-[#10b981] font-mono">
                      Result: <span className="text-[#e5e5e5]">{build.result}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleDelete(build.id!)}
                    className="p-2 text-[#555] hover:text-[#ef4444] transition-colors"
                    title="Delete Build"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e0e0e] border border-[#333] w-full max-w-lg p-6 font-mono">
            <h3 className="text-lg font-black text-white uppercase italic mb-4">Log New Build Version</h3>
            <form onSubmit={handleCreateBuild} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Version</label>
                  <input 
                    type="text" 
                    required 
                    value={version} 
                    onChange={e => setVersion(e.target.value)} 
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Class</label>
                  <input 
                    type="text" 
                    required 
                    value={targetClass} 
                    onChange={e => setTargetClass(e.target.value)} 
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Target PI</label>
                  <input 
                    type="number" 
                    required 
                    value={targetPI} 
                    onChange={e => setTargetPI(Number(e.target.value))} 
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Upgrade Package & Parts Description</label>
                <textarea 
                  required 
                  rows={3} 
                  placeholder="e.g. Race tire compound + Race ARBs + Turbo upgrade..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full bg-[#161616] border border-[#333] p-2 text-white" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Validation Result / Observation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lap time improved by 0.450s at Horizon Mexico" 
                  value={result} 
                  onChange={e => setResult(e.target.value)} 
                  className="w-full bg-[#161616] border border-[#333] p-2 text-white" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[#777] hover:text-white uppercase">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#ef4444] text-black font-bold uppercase hover:bg-white">Save Build</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 4. TUNING TAB (The Core Operational Center)
// ----------------------------------------------------
function TuningTab({ car, tunes, user }: { car: Car; tunes: Tune[]; user: any }) {
  const [tuneName, setTuneName] = useState('Standard Circuit Setup');
  const [tuneData, setTuneData] = useState<TuneData>(() => defaultTuneData(car.drivetrain));
  const [selectedTuneId, setSelectedTuneId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tunes.length > 0) {
      setTuneName(tunes[0].name);
      setTuneData(tunes[0].values);
      setSelectedTuneId(tunes[0].id || null);
    }
  }, [tunes]);

  const handleSelectPreset = (tune: Tune) => {
    setSelectedTuneId(tune.id || null);
    setTuneName(tune.name);
    setTuneData(tune.values);
  };

  const handleSaveTune = async () => {
    if (!user || !car.id) return;
    try {
      setSaving(true);
      if (selectedTuneId) {
        await updateTune(user.uid, car.id, selectedTuneId, {
          name: tuneName,
          values: tuneData
        });
      } else {
        const newId = await saveTune(user.uid, car.id, {
          name: tuneName,
          values: tuneData
        });
        if (newId) setSelectedTuneId(newId);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving tune');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToBaseline = () => {
    setTuneData(defaultTuneData(car.drivetrain));
  };

  const handleCopyToClipboard = () => {
    const text = `
=== ${car.brand.toUpperCase()} ${car.model.toUpperCase()} (${car.carClass} ${car.pi}) ===
TUNE: ${tuneName}

[TIRES]
Front: ${tuneData.tires.frontPSI} PSI | Rear: ${tuneData.tires.rearPSI} PSI

[GEARING]
Final Drive: ${tuneData.gearing.finalDrive}
1st: ${tuneData.gearing.gear1} | 2nd: ${tuneData.gearing.gear2} | 3rd: ${tuneData.gearing.gear3}
4th: ${tuneData.gearing.gear4} | 5th: ${tuneData.gearing.gear5} | 6th: ${tuneData.gearing.gear6}

[ALIGNMENT]
Camber: Front ${tuneData.alignment.camberFront}° / Rear ${tuneData.alignment.camberRear}°
Toe: Front ${tuneData.alignment.toeFront}° / Rear ${tuneData.alignment.toeRear}°
Front Caster: ${tuneData.alignment.caster}°

[ANTI-ROLL BARS]
Front: ${tuneData.antiRollBars.front} | Rear: ${tuneData.antiRollBars.rear}

[SPRINGS]
Springs: Front ${tuneData.springs.frontSprings} kgf/mm | Rear ${tuneData.springs.rearSprings} kgf/mm
Ride Height: Front ${tuneData.springs.rideHeightFront} cm | Rear ${tuneData.springs.rideHeightRear} cm

[DAMPING]
Rebound: Front ${tuneData.damping.reboundFront} | Rear ${tuneData.damping.reboundRear}
Bump: Front ${tuneData.damping.bumpFront} | Rear ${tuneData.damping.bumpRear}

[AERO]
Downforce: Front ${tuneData.aero.frontDownforce} kg | Rear ${tuneData.aero.rearDownforce} kg

[BRAKES]
Balance: ${tuneData.brake.balanceFront}% Front | Pressure: ${tuneData.brake.pressure}%

[DIFFERENTIAL]
${tuneData.differential.frontAccel !== undefined ? `Front Accel: ${tuneData.differential.frontAccel}% | Front Decel: ${tuneData.differential.frontDecel}%\n` : ''}Rear Accel: ${tuneData.differential.rearAccel}% | Rear Decel: ${tuneData.differential.rearDecel}%
${tuneData.differential.centerBalance !== undefined ? `Center Balance: ${tuneData.differential.centerBalance}% Rear` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAWD = car.drivetrain.toUpperCase() === 'AWD';
  const isFWD = car.drivetrain.toUpperCase() === 'FWD';

  return (
    <div className="space-y-6">
      {/* Top Tuning Toolbar */}
      <div className="bg-[#0e0e0e] border border-[#222] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Sliders className="w-4 h-4 text-[#ef4444]" />
          <input
            type="text"
            value={tuneName}
            onChange={e => setTuneName(e.target.value)}
            className="bg-[#141414] border border-[#262626] px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#ef4444] w-full max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {tunes.length > 0 && (
            <select
              value={selectedTuneId || ''}
              onChange={e => {
                const found = tunes.find(t => t.id === e.target.value);
                if (found) handleSelectPreset(found);
              }}
              className="bg-[#141414] border border-[#262626] text-xs text-[#aaa] font-mono px-3 py-1.5 focus:outline-none"
            >
              {tunes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleResetToBaseline}
            className="px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-xs font-mono text-[#888] hover:text-white uppercase inline-flex items-center gap-1.5 transition-colors"
            title="Reset to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-xs font-mono text-white uppercase inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy to Game'}
          </button>

          <button
            onClick={handleSaveTune}
            disabled={saving}
            className="px-4 py-1.5 bg-[#ef4444] text-black hover:bg-white text-xs font-mono font-black uppercase inline-flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Setup'}
          </button>
        </div>
      </div>

      {/* Forza Horizon Precision Tuning Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        {/* 1. TIRES */}
        <TuneSection title="1. Tires (PSI)">
          <TuneSlider
            label="Front Tire Pressure"
            value={tuneData.tires.frontPSI}
            min={15.0}
            max={45.0}
            step={0.5}
            unit="PSI"
            onChange={v => setTuneData({ ...tuneData, tires: { ...tuneData.tires, frontPSI: v } })}
          />
          <TuneSlider
            label="Rear Tire Pressure"
            value={tuneData.tires.rearPSI}
            min={15.0}
            max={45.0}
            step={0.5}
            unit="PSI"
            onChange={v => setTuneData({ ...tuneData, tires: { ...tuneData.tires, rearPSI: v } })}
          />
        </TuneSection>

        {/* 2. GEARING */}
        <TuneSection title="2. Gearing Ratios">
          <TuneSlider
            label="Final Drive"
            value={tuneData.gearing.finalDrive}
            min={2.20}
            max={5.50}
            step={0.01}
            onChange={v => setTuneData({ ...tuneData, gearing: { ...tuneData.gearing, finalDrive: v } })}
          />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(gearNum => {
              const key = `gear${gearNum}` as keyof typeof tuneData.gearing;
              return (
                <div key={gearNum} className="p-2 bg-[#0a0a0a] border border-[#1f1f1f]">
                  <span className="text-[9px] uppercase text-[#666] block">Gear {gearNum}</span>
                  <input
                    type="number"
                    step={0.01}
                    value={tuneData.gearing[key]}
                    onChange={e => setTuneData({
                      ...tuneData,
                      gearing: { ...tuneData.gearing, [key]: Number(e.target.value) }
                    })}
                    className="w-full bg-transparent text-xs text-white font-bold font-mono focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </TuneSection>

        {/* 3. ALIGNMENT */}
        <TuneSection title="3. Alignment">
          <TuneSlider
            label="Front Camber"
            value={tuneData.alignment.camberFront}
            min={-5.0}
            max={0.0}
            step={0.1}
            unit="°"
            onChange={v => setTuneData({ ...tuneData, alignment: { ...tuneData.alignment, camberFront: v } })}
          />
          <TuneSlider
            label="Rear Camber"
            value={tuneData.alignment.camberRear}
            min={-5.0}
            max={0.0}
            step={0.1}
            unit="°"
            onChange={v => setTuneData({ ...tuneData, alignment: { ...tuneData.alignment, camberRear: v } })}
          />
          <TuneSlider
            label="Front Toe"
            value={tuneData.alignment.toeFront}
            min={-1.0}
            max={1.0}
            step={0.1}
            unit="°"
            onChange={v => setTuneData({ ...tuneData, alignment: { ...tuneData.alignment, toeFront: v } })}
          />
          <TuneSlider
            label="Rear Toe"
            value={tuneData.alignment.toeRear}
            min={-1.0}
            max={1.0}
            step={0.1}
            unit="°"
            onChange={v => setTuneData({ ...tuneData, alignment: { ...tuneData.alignment, toeRear: v } })}
          />
          <TuneSlider
            label="Front Caster Angle"
            value={tuneData.alignment.caster}
            min={1.0}
            max={7.0}
            step={0.1}
            unit="°"
            onChange={v => setTuneData({ ...tuneData, alignment: { ...tuneData.alignment, caster: v } })}
          />
        </TuneSection>

        {/* 4. ANTI-ROLL BARS */}
        <TuneSection title="4. Anti-Roll Bars (ARBs)">
          <TuneSlider
            label="Front Anti-Roll Bar"
            value={tuneData.antiRollBars.front}
            min={1.0}
            max={65.0}
            step={0.5}
            onChange={v => setTuneData({ ...tuneData, antiRollBars: { ...tuneData.antiRollBars, front: v } })}
          />
          <TuneSlider
            label="Rear Anti-Roll Bar"
            value={tuneData.antiRollBars.rear}
            min={1.0}
            max={65.0}
            step={0.5}
            onChange={v => setTuneData({ ...tuneData, antiRollBars: { ...tuneData.antiRollBars, rear: v } })}
          />
        </TuneSection>

        {/* 5. SPRINGS & RIDE HEIGHT */}
        <TuneSection title="5. Springs & Ride Height">
          <TuneSlider
            label="Front Springs"
            value={tuneData.springs.frontSprings}
            min={50.0}
            max={350.0}
            step={1.0}
            unit="kgf/mm"
            onChange={v => setTuneData({ ...tuneData, springs: { ...tuneData.springs, frontSprings: v } })}
          />
          <TuneSlider
            label="Rear Springs"
            value={tuneData.springs.rearSprings}
            min={50.0}
            max={350.0}
            step={1.0}
            unit="kgf/mm"
            onChange={v => setTuneData({ ...tuneData, springs: { ...tuneData.springs, rearSprings: v } })}
          />
          <TuneSlider
            label="Front Ride Height"
            value={tuneData.springs.rideHeightFront}
            min={5.0}
            max={25.0}
            step={0.5}
            unit="cm"
            onChange={v => setTuneData({ ...tuneData, springs: { ...tuneData.springs, rideHeightFront: v } })}
          />
          <TuneSlider
            label="Rear Ride Height"
            value={tuneData.springs.rideHeightRear}
            min={5.0}
            max={25.0}
            step={0.5}
            unit="cm"
            onChange={v => setTuneData({ ...tuneData, springs: { ...tuneData.springs, rideHeightRear: v } })}
          />
        </TuneSection>

        {/* 6. DAMPING */}
        <TuneSection title="6. Damping (Rebound & Bump)">
          <TuneSlider
            label="Front Rebound Stiffness"
            value={tuneData.damping.reboundFront}
            min={1.0}
            max={20.0}
            step={0.1}
            onChange={v => setTuneData({ ...tuneData, damping: { ...tuneData.damping, reboundFront: v } })}
          />
          <TuneSlider
            label="Rear Rebound Stiffness"
            value={tuneData.damping.reboundRear}
            min={1.0}
            max={20.0}
            step={0.1}
            onChange={v => setTuneData({ ...tuneData, damping: { ...tuneData.damping, reboundRear: v } })}
          />
          <TuneSlider
            label="Front Bump Stiffness"
            value={tuneData.damping.bumpFront}
            min={1.0}
            max={20.0}
            step={0.1}
            onChange={v => setTuneData({ ...tuneData, damping: { ...tuneData.damping, bumpFront: v } })}
          />
          <TuneSlider
            label="Rear Bump Stiffness"
            value={tuneData.damping.bumpRear}
            min={1.0}
            max={20.0}
            step={0.1}
            onChange={v => setTuneData({ ...tuneData, damping: { ...tuneData.damping, bumpRear: v } })}
          />
        </TuneSection>

        {/* 7. AERO & BRAKE */}
        <TuneSection title="7. Aero Downforce & Brakes">
          <TuneSlider
            label="Front Downforce"
            value={tuneData.aero.frontDownforce}
            min={20}
            max={350}
            step={1}
            unit="KG"
            onChange={v => setTuneData({ ...tuneData, aero: { ...tuneData.aero, frontDownforce: v } })}
          />
          <TuneSlider
            label="Rear Downforce"
            value={tuneData.aero.rearDownforce}
            min={20}
            max={450}
            step={1}
            unit="KG"
            onChange={v => setTuneData({ ...tuneData, aero: { ...tuneData.aero, rearDownforce: v } })}
          />
          <TuneSlider
            label="Brake Balance (% Front)"
            value={tuneData.brake.balanceFront}
            min={30}
            max={70}
            step={1}
            unit="%"
            onChange={v => setTuneData({ ...tuneData, brake: { ...tuneData.brake, balanceFront: v } })}
          />
          <TuneSlider
            label="Brake Pressure"
            value={tuneData.brake.pressure}
            min={50}
            max={150}
            step={1}
            unit="%"
            onChange={v => setTuneData({ ...tuneData, brake: { ...tuneData.brake, pressure: v } })}
          />
        </TuneSection>

        {/* 8. DIFFERENTIAL */}
        <TuneSection title="8. Differential">
          {isAWD && (
            <>
              <TuneSlider
                label="Front Acceleration"
                value={tuneData.differential.frontAccel ?? 25}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={v => setTuneData({ ...tuneData, differential: { ...tuneData.differential, frontAccel: v } })}
              />
              <TuneSlider
                label="Front Deceleration"
                value={tuneData.differential.frontDecel ?? 0}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={v => setTuneData({ ...tuneData, differential: { ...tuneData.differential, frontDecel: v } })}
              />
            </>
          )}

          <TuneSlider
            label="Rear Acceleration"
            value={tuneData.differential.rearAccel}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={v => setTuneData({ ...tuneData, differential: { ...tuneData.differential, rearAccel: v } })}
          />
          <TuneSlider
            label="Rear Deceleration"
            value={tuneData.differential.rearDecel}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={v => setTuneData({ ...tuneData, differential: { ...tuneData.differential, rearDecel: v } })}
          />

          {isAWD && (
            <TuneSlider
              label="Center Balance (% Rear Power)"
              value={tuneData.differential.centerBalance ?? 65}
              min={10}
              max={90}
              step={1}
              unit="%"
              onChange={v => setTuneData({ ...tuneData, differential: { ...tuneData.differential, centerBalance: v } })}
            />
          )}
        </TuneSection>
      </div>
    </div>
  );
}

function TuneSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0e0e0e] border border-[#222] p-5 space-y-4">
      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#ef4444] pb-2 border-b border-[#1c1c1c]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TuneSlider({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-[#888]">{label}</span>
        <span className="text-white font-bold">
          {value} {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-[#ef4444] bg-[#222] h-1.5 rounded cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-16 bg-[#161616] border border-[#262626] px-1.5 py-0.5 text-[11px] text-white font-mono text-right focus:outline-none focus:border-[#ef4444]"
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. TESTS TAB
// ----------------------------------------------------
function TestsTab({ car, tests, user, builds }: { car: Car; tests: TestExperiment[]; user: any; builds: Build[] }) {
  const [showModal, setShowModal] = useState(false);
  const [objective, setObjective] = useState('');
  const [variable, setVariable] = useState('Rear Differential Acceleration');
  const [beforeValue, setBeforeValue] = useState('65%');
  const [afterValue, setAfterValue] = useState('55%');
  const [track, setTrack] = useState('Horizon Mexico Circuit');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Completed' | 'Discarded'>('Completed');

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !car.id) return;
    const code = `#${String(tests.length + 1).padStart(3, '0')}`;
    await addTestExperiment(user.uid, {
      code,
      carId: car.id,
      carName: `${car.brand} ${car.model}`,
      track,
      objective,
      variable,
      beforeValue,
      afterValue,
      result,
      status
    });
    setObjective('');
    setResult('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0e0e0e] border border-[#222] p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#ef4444]">
              Empirical Track Experiments
            </h3>
            <p className="text-xs text-[#666] font-mono mt-0.5">
              Targeted A/B test iterations specifically logged for {car.brand} {car.model}.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#ef4444] text-black hover:bg-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Log Experiment
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#222] bg-[#080808]">
            <p className="text-xs text-[#555] font-mono uppercase tracking-widest mb-3">NO EXPERIMENTS LOGGED FOR THIS CAR</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-[#ef4444] font-mono uppercase font-bold hover:underline"
            >
              + Create Experiment #001
            </button>
          </div>
        ) : (
          <div className="space-y-4 font-mono">
            {tests.map(test => (
              <div key={test.id} className="p-4 bg-[#080808] border border-[#1a1a1a]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] text-xs font-bold">
                      {test.code}
                    </span>
                    <span className="text-xs font-bold text-white uppercase">{test.objective}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 uppercase font-bold border ${
                    test.status === 'Completed' ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10' : 'text-[#eab308] border-[#eab308]/30 bg-[#eab308]/10'
                  }`}>
                    {test.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#121212] border border-[#1f1f1f] text-xs my-3">
                  <div>
                    <span className="text-[9px] text-[#666] uppercase block">Test Track</span>
                    <span className="text-white font-bold">{test.track || 'Free Roam'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#666] uppercase block">Variable Tested</span>
                    <span className="text-white font-bold">{test.variable}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#666] uppercase block">Delta</span>
                    <span className="text-[#888]">{test.beforeValue}</span> → <span className="text-[#10b981] font-bold">{test.afterValue}</span>
                  </div>
                </div>

                {test.result && (
                  <p className="text-xs text-[#ccc] leading-relaxed">
                    <span className="text-[#ef4444] font-bold">Observation:</span> {test.result}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e0e0e] border border-[#333] w-full max-w-lg p-6 font-mono text-xs">
            <h3 className="text-lg font-black text-white uppercase italic mb-4">Log Test Lab Experiment</h3>
            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Improve corner exit traction out of hairpin"
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full bg-[#161616] border border-[#333] p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Track Context</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suzuka, Horizon Mexico Circuit"
                    value={track}
                    onChange={e => setTrack(e.target.value)}
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Variable Modified</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rear Diff Accel"
                    value={variable}
                    onChange={e => setVariable(e.target.value)}
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Before Value</label>
                  <input
                    type="text"
                    required
                    value={beforeValue}
                    onChange={e => setBeforeValue(e.target.value)}
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">After Value</label>
                  <input
                    type="text"
                    required
                    value={afterValue}
                    onChange={e => setAfterValue(e.target.value)}
                    className="w-full bg-[#161616] border border-[#333] p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Empirical Result</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lap time dropped by 0.350s, snap oversteer eliminated."
                  value={result}
                  onChange={e => setResult(e.target.value)}
                  className="w-full bg-[#161616] border border-[#333] p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[#777] hover:text-white uppercase">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#ef4444] text-black font-bold uppercase hover:bg-white">Save Experiment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 6. TELEMETRY TAB
// ----------------------------------------------------
function TelemetryTab({ car }: { car: Car }) {
  const [simulatedLive, setSimulatedLive] = useState(false);
  const [telemetryState, setTelemetryState] = useState({
    speedKmh: 0,
    rpm: 800,
    gear: 'N',
    throttlePct: 0,
    brakePct: 0,
    latG: 0.0,
    longG: 0.0,
    tireSlipFL: 0.02,
    tireSlipFR: 0.02,
    tireSlipRL: 0.01,
    tireSlipRR: 0.01,
  });

  useEffect(() => {
    if (!simulatedLive) {
      setTelemetryState({
        speedKmh: 0,
        rpm: 800,
        gear: 'N',
        throttlePct: 0,
        brakePct: 0,
        latG: 0.0,
        longG: 0.0,
        tireSlipFL: 0.02,
        tireSlipFR: 0.02,
        tireSlipRL: 0.01,
        tireSlipRR: 0.01,
      });
      return;
    }

    const interval = setInterval(() => {
      setTelemetryState({
        speedKmh: Math.floor(180 + Math.sin(Date.now() / 800) * 45),
        rpm: Math.floor(6200 + Math.sin(Date.now() / 600) * 1200),
        gear: '4',
        throttlePct: Math.floor(85 + Math.sin(Date.now() / 1000) * 15),
        brakePct: Math.max(0, Math.floor(Math.sin(Date.now() / 1500) * 40)),
        latG: Number((Math.sin(Date.now() / 1200) * 1.35).toFixed(2)),
        longG: Number((Math.cos(Date.now() / 1200) * 0.85).toFixed(2)),
        tireSlipFL: Number((0.05 + Math.abs(Math.sin(Date.now() / 1000)) * 0.12).toFixed(2)),
        tireSlipFR: Number((0.05 + Math.abs(Math.cos(Date.now() / 1000)) * 0.12).toFixed(2)),
        tireSlipRL: Number((0.04 + Math.abs(Math.sin(Date.now() / 1100)) * 0.08).toFixed(2)),
        tireSlipRR: Number((0.04 + Math.abs(Math.cos(Date.now() / 1100)) * 0.08).toFixed(2)),
      });
    }, 100);

    return () => clearInterval(interval);
  }, [simulatedLive]);

  return (
    <div className="space-y-6 font-mono">
      {/* Live Stream / Setup Guide */}
      <div className="bg-[#0e0e0e] border border-[#222] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1c1c1c]">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${simulatedLive ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'}`}></span>
              <h3 className="text-xs uppercase font-bold tracking-widest text-white">
                {simulatedLive ? 'LIVE TELEMETRY STREAMING' : 'TELEMETRY NOT CONNECTED'}
              </h3>
            </div>
            <p className="text-xs text-[#666] mt-0.5">
              Protocol: Forza Horizon Data Out UDP Packet (v2/Dash Format).
            </p>
          </div>

          <button
            onClick={() => setSimulatedLive(!simulatedLive)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
              simulatedLive 
                ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' 
                : 'bg-[#181818] border-[#333] text-white hover:bg-[#222]'
            }`}
          >
            {simulatedLive ? 'Disconnect Stream' : 'Test Loopback / Stream Simulator'}
          </button>
        </div>

        {/* UDP Connection Setup Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[#080808] border border-[#1a1a1a] text-xs">
          <div>
            <span className="text-[10px] text-[#666] uppercase block">In-Game Data Out IP</span>
            <span className="text-white font-bold">127.0.0.1 (or Local Host IP)</span>
          </div>
          <div>
            <span className="text-[10px] text-[#666] uppercase block">UDP Port</span>
            <span className="text-white font-bold">5300</span>
          </div>
          <div>
            <span className="text-[10px] text-[#666] uppercase block">Packet Rate</span>
            <span className="text-[#10b981] font-bold">60 Hz Synchronous</span>
          </div>
        </div>

        {/* Telemetry Gauge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#121212] border border-[#1f1f1f]">
            <span className="text-[9px] text-[#666] uppercase block">Speed</span>
            <div className="text-2xl font-black text-white">{telemetryState.speedKmh} <span className="text-xs text-[#666] font-normal">KM/H</span></div>
          </div>
          <div className="p-4 bg-[#121212] border border-[#1f1f1f]">
            <span className="text-[9px] text-[#666] uppercase block">Engine RPM</span>
            <div className="text-2xl font-black text-[#ef4444]">{telemetryState.rpm}</div>
          </div>
          <div className="p-4 bg-[#121212] border border-[#1f1f1f]">
            <span className="text-[9px] text-[#666] uppercase block">Active Gear</span>
            <div className="text-2xl font-black text-white">{telemetryState.gear}</div>
          </div>
          <div className="p-4 bg-[#121212] border border-[#1f1f1f]">
            <span className="text-[9px] text-[#666] uppercase block">Lateral G-Force</span>
            <div className="text-2xl font-black text-[#10b981]">{telemetryState.latG}G</div>
          </div>
        </div>

        {/* Tire Slip Angles Matrix */}
        <div className="mt-6 p-4 bg-[#080808] border border-[#1a1a1a]">
          <h4 className="text-[10px] text-[#777] uppercase font-bold tracking-wider mb-3">Tire Slip Ratio Vector</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#121212] border border-[#1f1f1f] flex justify-between">
              <span className="text-[#888]">Front Left (FL)</span>
              <span className="font-bold text-white">{telemetryState.tireSlipFL}</span>
            </div>
            <div className="p-3 bg-[#121212] border border-[#1f1f1f] flex justify-between">
              <span className="text-[#888]">Front Right (FR)</span>
              <span className="font-bold text-white">{telemetryState.tireSlipFR}</span>
            </div>
            <div className="p-3 bg-[#121212] border border-[#1f1f1f] flex justify-between">
              <span className="text-[#888]">Rear Left (RL)</span>
              <span className="font-bold text-white">{telemetryState.tireSlipRL}</span>
            </div>
            <div className="p-3 bg-[#121212] border border-[#1f1f1f] flex justify-between">
              <span className="text-[#888]">Rear Right (RR)</span>
              <span className="font-bold text-white">{telemetryState.tireSlipRR}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 7. CAR AI ENGINEER TAB (Contextual Assistant)
// ----------------------------------------------------
function CarAIEngineerTab({ 
  car, 
  builds, 
  tunes, 
  tests 
}: { 
  car: Car; 
  builds: Build[]; 
  tunes: Tune[]; 
  tests: TestExperiment[];
}) {
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    {
      role: 'ai',
      text: `Context locked on ${car.brand} ${car.model} (${car.carClass} ${car.pi} ${car.drivetrain}). I have reviewed ${builds.length} builds, ${tunes.length} tune profiles, and ${tests.length} track test results. How would you like to optimize this machine?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const activeTune = tunes.length > 0 ? tunes[0].values : defaultTuneData(car.drivetrain);

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          context: {
            car: {
              brand: car.brand,
              model: car.model,
              year: car.year,
              carClass: car.carClass,
              pi: car.pi,
              power: car.power,
              weight: car.weight,
              drivetrain: car.drivetrain
            },
            activeTune,
            recentTests: tests.slice(0, 3),
            buildHistory: builds.slice(0, 3)
          }
        })
      });

      if (!response.ok) throw new Error('AI Engine communication error');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: '[ENGINEERING CORE ERROR] Failed to compute response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0e0e] border border-[#222] flex flex-col h-[650px] font-mono">
      {/* Context Bar */}
      <div className="p-4 bg-[#080808] border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#ef4444]" />
          <span className="text-xs text-white font-bold uppercase">
            Context: {car.brand} {car.model} ({car.carClass} {car.pi})
          </span>
        </div>
        <span className="text-[10px] text-[#10b981] font-bold uppercase">Telemetry & Setup Injected</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 text-xs whitespace-pre-wrap leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#ef4444] text-black font-bold'
                : 'bg-[#151515] border-l-2 border-[#ef4444] text-[#e5e5e5]'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#777] p-4 bg-[#151515] border-l-2 border-[#ef4444] w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-[#ef4444]" />
            <span>Calculating vehicle physics and telemetry delta...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-[#0c0c0c] border-t border-[#1a1a1a] flex gap-2 overflow-x-auto scrollbar-none">
        {[
          'Analyze differential for corner exit',
          'Calculate ideal spring rates for this weight',
          'Suggest gearing final drive for high top speed',
          'Diagnose low-speed understeer'
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendMessage(prompt)}
            className="px-3 py-1.5 bg-[#161616] hover:bg-[#222] border border-[#2a2a2a] text-[10px] text-[#aaa] hover:text-white uppercase whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form 
        onSubmit={e => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-4 border-t border-[#222] bg-[#080808] flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask AI Engineer about ${car.model}...`}
          className="flex-1 bg-[#141414] border border-[#262626] p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#ef4444]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 bg-[#ef4444] text-black hover:bg-white text-xs font-bold uppercase transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
