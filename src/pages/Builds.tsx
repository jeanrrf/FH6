import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Plus, Search, Filter, ArrowRight, Loader2, Sliders, CarFront } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { subscribeCars, getBuildsCollection, Car, Build } from '../lib/firestore';
import { getDocs, query, orderBy } from 'firebase/firestore';

interface EnrichedBuild extends Build {
  car?: Car;
}

export function Builds() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [builds, setBuilds] = useState<EnrichedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCars(user.uid, async (carsData) => {
      setCars(carsData);
      
      // Fetch builds across all cars
      const allBuilds: EnrichedBuild[] = [];
      for (const car of carsData) {
        if (!car.id) continue;
        try {
          const buildsCol = getBuildsCollection(user.uid, car.id);
          const q = query(buildsCol, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            allBuilds.push({
              id: doc.id,
              ...doc.data(),
              car
            } as EnrichedBuild);
          });
        } catch (e) {
          console.error(e);
        }
      }
      setBuilds(allBuilds);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const filteredBuilds = builds.filter(b => {
    const q = search.toLowerCase();
    const carName = b.car ? `${b.car.brand} ${b.car.model}`.toLowerCase() : '';
    const desc = (b.description || '').toLowerCase();
    const matchesSearch = carName.includes(q) || desc.includes(q) || (b.version || '').toLowerCase().includes(q);
    const matchesClass = selectedClass === 'ALL' || (b.targetClass || b.car?.carClass || '').toUpperCase() === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto">
      {/* Header */}
      <header className="border-b border-[#222] p-8 bg-gradient-to-b from-[#121212] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-mono font-bold mb-1">
              Vehicle Builds & Upgrade Packages
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Build Directory
            </h1>
          </div>
          <div className="text-xs font-mono text-[#888]">
            Total Logged Configurations: <span className="text-white font-bold">{builds.length}</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Filter / Search Bar */}
        <div className="bg-[#0e0e0e] border border-[#222] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by car, version, upgrades..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] pl-9 pr-4 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#ef4444] font-mono"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#555] font-mono uppercase mr-1">Class:</span>
            {['ALL', 'X', 'S2', 'S1', 'A', 'B', 'C', 'D'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition-colors ${
                  selectedClass === cls
                    ? 'bg-[#ef4444] text-black'
                    : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-[#ef4444] animate-spin" />
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#222] bg-[#0c0c0c] p-8">
            <Wrench className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-2">
              No Build Versions Logged Yet
            </h3>
            <p className="text-xs text-[#666] max-w-md mx-auto mb-6">
              Go to any car in your Garage and use the "Builds" tab to log your component setups and PI targets.
            </p>
            <Link
              to="/garage"
              className="px-5 py-2.5 bg-[#ef4444] text-black text-xs font-black uppercase tracking-wider font-mono hover:bg-white transition-colors inline-block"
            >
              Open Garage
            </Link>
          </div>
        ) : filteredBuilds.length === 0 ? (
          <div className="text-center py-16 border border-[#222] bg-[#0c0c0c]">
            <p className="text-xs text-[#666] font-mono uppercase tracking-widest">
              No builds matching search filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuilds.map(build => (
              <div key={build.id} className="p-5 bg-[#0e0e0e] border border-[#222] hover:border-[#444] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#ef4444] text-black font-black text-xs italic font-mono">
                        {build.version}
                      </span>
                      <span className="text-xs font-bold text-white font-mono uppercase">
                        {build.targetClass || build.car?.carClass} {build.targetPI || build.car?.pi} Target
                      </span>
                    </div>
                    {build.car && (
                      <span className="text-[10px] font-mono text-[#888] border border-[#262626] px-2 py-0.5">
                        {build.car.drivetrain}
                      </span>
                    )}
                  </div>

                  {build.car && (
                    <div className="text-sm font-bold text-white font-mono uppercase mb-2">
                      {build.car.brand} {build.car.model}
                    </div>
                  )}

                  <p className="text-xs text-[#bbb] font-mono leading-relaxed mb-3">
                    {build.description}
                  </p>

                  {build.result && (
                    <div className="p-2.5 bg-[#080808] border border-[#1a1a1a] text-[11px] font-mono text-[#10b981] mb-4">
                      Observation: <span className="text-[#ccc]">{build.result}</span>
                    </div>
                  )}
                </div>

                {build.car && (
                  <div className="pt-3 border-t border-[#1c1c1c] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#666]">
                      {build.car.power} HP • {build.car.weight} KG
                    </span>
                    <Link
                      to={`/garage/car/${build.car.id}`}
                      className="text-xs font-mono font-bold text-[#ef4444] hover:text-white uppercase flex items-center gap-1 transition-colors"
                    >
                      Open Car Studio <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
