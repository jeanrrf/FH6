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
              Configuração do Cockpit e Conexão de Rede
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Configurações do Sistema
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
              <Shield className="w-4 h-4" /> Conta Cloud & Persistência
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#080808] border border-[#1a1a1a]">
                <span className="text-[10px] text-[#666] uppercase block">UID do Usuário Autenticado</span>
                <span className="text-white font-bold truncate block">{user?.uid || 'Anônimo'}</span>
              </div>
              <div className="p-3 bg-[#080808] border border-[#1a1a1a]">
                <span className="text-[10px] text-[#666] uppercase block">Protocolo de Armazenamento</span>
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
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Porta de Escuta UDP</label>
                  <input
                    type="text"
                    value={udpPort}
                    onChange={e => setUdpPort(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] p-2.5 text-white focus:border-[#10b981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#777] mb-1">Formato do Protocolo</label>
                  <input
                    type="text"
                    disabled
                    value="Forza Dash (324 Bytes)"
                    className="w-full bg-[#111] border border-[#222] p-2.5 text-[#888]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#080808] border border-[#1a1a1a] text-[11px] text-[#777] leading-relaxed">
                <span className="text-white font-bold block mb-1">Como conectar o Forza Horizon:</span>
                1. Abra o Forza Horizon &gt; Configurações &gt; HUD e Jogabilidade.<br />
                2. Defina <span className="text-white">Data Out</span> para <span className="text-[#10b981]">LIGADO</span>.<br />
                3. Defina o <span className="text-white">Endereço IP do Data Out</span> para <span className="text-white">127.0.0.1</span> (ou o IP da sua rede local).<br />
                4. Defina a <span className="text-white">Porta IP do Data Out</span> para <span className="text-white">{udpPort}</span>.
              </div>
            </div>
          </div>

          {/* Unit Preferences */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#eab308] pb-2 border-b border-[#1c1c1c] flex items-center gap-2">
              <Database className="w-4 h-4" /> Unidades & Medidas
            </h3>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Potência</label>
                <select
                  value={unitPower}
                  onChange={e => setUnitPower(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2 text-white"
                >
                  <option value="HP">HP (Cavalos-vapor)</option>
                  <option value="kW">kW (Quilowatts)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Peso</label>
                <select
                  value={unitWeight}
                  onChange={e => setUnitWeight(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2 text-white"
                >
                  <option value="KG">KG (Quilogramas)</option>
                  <option value="LBS">LBS (Libras)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#777] mb-1">Pressão dos Pneus</label>
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
              {saved ? 'Configurações Salvas' : 'Salvar Preferências'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
