import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Radio, Database, UserCheck, Save, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [udpPort, setUdpPort] = useState('5300');
  const [unitPower, setUnitPower] = useState<'HP' | 'kW'>('HP');
  const [unitWeight, setUnitWeight] = useState<'KG' | 'LBS'>('KG');
  const [unitPressure, setUnitPressure] = useState<'PSI' | 'BAR'>('PSI');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto font-mono">
      {/* Header */}
      <header className="border-b border-[#222] p-8 bg-gradient-to-b from-[#121212] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#888] font-bold mb-1">
              Cockpit Configuration & Network Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              System Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-4xl mx-auto w-full space-y-6 flex-1">
        <form onSubmit={handleSave} className="space-y-6">
          {/* User Account / Cloud Firestore Status */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#ef4444] pb-2 border-b border-[#1c1c1c] flex items-center gap-2">
              <Shield className="w-4 h-4" /> Cloud Account & Persistence
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#080808] border border-[#1a1a1a]">
                <span className="text-[10px] text-[#666] uppercase block">Authenticated User UID</span>
                <span className="text-white font-bold truncate block">{user?.uid || 'Anonymous'}</span>
              </div>
              <div className="p-3 bg-[#080808] border border-[#1a1a1a]">
                <span className="text-[10px] text-[#666] uppercase block">Storage Protocol</span>
                <span className="text-[#10b981] font-bold">Cloud Firestore Live Sync</span>
              </div>
            </div>
          </div>

          {/* UDP Telemetry Configuration */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#10b981] pb-2 border-b border-[#1c1c1c] flex items-center gap-2">
              <Radio className="w-4 h-4" /> Forza Horizon UDP Data Out
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">UDP Listening Port</label>
                  <input
                    type="text"
                    value={udpPort}
                    onChange={e => setUdpPort(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#10b981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Protocol Format</label>
                  <input
                    type="text"
                    disabled
                    value="Forza Dash (324 Bytes)"
                    className="w-full bg-[#111] border border-[#222] p-2.5 text-[#888]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#080808] border border-[#1a1a1a] text-[11px] text-[#777] leading-relaxed">
                <span className="text-white font-bold block mb-1">How to connect Forza Horizon:</span>
                1. Open Forza Horizon &gt; Settings &gt; HUD and Gameplay.<br />
                2. Set <span className="text-white">Data Out</span> to <span className="text-[#10b981]">ON</span>.<br />
                3. Set <span className="text-white">Data Out IP Address</span> to <span className="text-white">127.0.0.1</span> (or your local network IP).<br />
                4. Set <span className="text-white">Data Out IP Port</span> to <span className="text-white">{udpPort}</span>.
              </div>
            </div>
          </div>

          {/* Unit Preferences */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#eab308] pb-2 border-b border-[#1c1c1c] flex items-center gap-2">
              <Database className="w-4 h-4" /> Units & Measurements
            </h3>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Power</label>
                <select
                  value={unitPower}
                  onChange={e => setUnitPower(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2 text-white"
                >
                  <option value="HP">HP (Horsepower)</option>
                  <option value="kW">kW (Kilowatts)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Weight</label>
                <select
                  value={unitWeight}
                  onChange={e => setUnitWeight(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2 text-white"
                >
                  <option value="KG">KG (Kilograms)</option>
                  <option value="LBS">LBS (Pounds)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Tire Pressure</label>
                <select
                  value={unitPressure}
                  onChange={e => setUnitPressure(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2 text-white"
                >
                  <option value="PSI">PSI</option>
                  <option value="BAR">BAR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#ef4444] hover:bg-white text-black text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Settings Saved' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
