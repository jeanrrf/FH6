import React, { useState } from 'react';
import { 
  Sliders, 
  Check, 
  Copy, 
  Save, 
  Gauge, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TuneData, saveTune } from '../lib/firestore';
import { useAuth } from '../lib/AuthContext';

interface TuneCardProps {
  tune: TuneData;
  carId?: string;
  carName?: string;
  title?: string;
  onSaved?: () => void;
}

export function TuneCard({ tune, carId, carName, title = 'Planilha de Setup Calculada por IA', onSaved }: TuneCardProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const copyToClipboard = () => {
    const text = `
=== ${title.toUpperCase()} ===
${carName ? `Veículo: ${carName}` : ''}
TIRES (PNEUS):
  Front (Diant): ${tune.tires.frontPSI} PSI | Rear (Traseiro): ${tune.tires.rearPSI} PSI
ALIGNMENT (ALINHAMENTO):
  Camber: Front ${tune.alignment.camberFront}° / Rear ${tune.alignment.camberRear}°
  Toe: Front ${tune.alignment.toeFront}° / Rear ${tune.alignment.toeRear}°
  Caster: ${tune.alignment.caster}°
ANTI-ROLL BARS (BARRAS ESTABILIZADORAS):
  Front (Diant): ${tune.antiRollBars.front} / Rear (Tras): ${tune.antiRollBars.rear}
SPRINGS (MOLAS):
  Front (Diant): ${tune.springs.frontSprings} kgf/mm | Rear (Tras): ${tune.springs.rearSprings} kgf/mm
  Ride Height (Altura): Front ${tune.springs.rideHeightFront} cm | Rear ${tune.springs.rideHeightRear} cm
DAMPING (AMORTECEDORES):
  Rebound: Front ${tune.damping.reboundFront} / Rear ${tune.damping.reboundRear}
  Bump: Front ${tune.damping.bumpFront} / Rear ${tune.damping.bumpRear}
AERO (DOWNFORCE):
  Front (Diant): ${tune.aero.frontDownforce} kg | Rear (Tras): ${tune.aero.rearDownforce} kg
BRAKES (FREIOS):
  Balance: ${tune.brake.balanceFront}% | Pressure: ${tune.brake.pressure}%
DIFFERENTIAL (DIFERENCIAL):
  Rear Accel: ${tune.differential.rearAccel}% | Rear Decel: ${tune.differential.rearDecel}%
  ${tune.differential.frontAccel !== undefined ? `Front Accel: ${tune.differential.frontAccel}% | Front Decel: ${tune.differential.frontDecel}%` : ''}
  ${tune.differential.centerBalance !== undefined ? `Center Bias: ${tune.differential.centerBalance}% Rear` : ''}
GEARING (MARCHAS):
  Final Drive: ${tune.gearing.finalDrive}
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToCar = async () => {
    if (!user || !carId) return;
    setSaving(true);
    try {
      await saveTune(user.uid, carId, {
        name: `Setup IA (${new Date().toLocaleDateString('pt-BR')})`,
        track: 'Circuito Misto Geral',
        values: tune,
        notes: 'Gerado pelo FH6 AI Engineer Core',
      });
      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="my-4 bg-[#0a0a0a] border border-[#2a2a2a] p-4 text-xs font-mono">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#ef4444]" />
          <span className="font-bold text-white uppercase tracking-wider">{title}</span>
          {carName && (
            <span className="text-[10px] px-2 py-0.5 bg-[#181818] border border-[#333] text-[#aaa]">
              {carName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#181818] hover:bg-[#252525] border border-[#333] text-[10px] text-[#ccc] hover:text-white uppercase transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar Setup'}
          </button>

          {carId && (
            <button
              onClick={handleSaveToCar}
              disabled={saving || savedSuccess}
              className="flex items-center gap-1 px-3 py-1 bg-[#ef4444] text-black hover:bg-white text-[10px] font-bold uppercase transition-colors disabled:opacity-50"
            >
              {savedSuccess ? <ShieldCheck className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {savedSuccess ? 'Salvo no Carro' : saving ? 'Salvando...' : 'Salvar no Carro'}
            </button>
          )}
        </div>
      </div>

      {/* Grid of mechanical parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {/* Tires */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Tire Pressures (Pneus)</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Diant / Tras:</span>
            <span className="font-bold">{tune.tires.frontPSI} / {tune.tires.rearPSI} <span className="text-[9px] font-normal text-[#888]">PSI</span></span>
          </div>
        </div>

        {/* Alignment */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Camber & Caster</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Camber:</span>
            <span className="font-bold">{tune.alignment.camberFront}° / {tune.alignment.camberRear}°</span>
          </div>
          <div className="text-[10px] text-white flex justify-between mt-0.5">
            <span className="text-[#666]">Caster:</span>
            <span className="font-bold">{tune.alignment.caster}°</span>
          </div>
        </div>

        {/* Anti-Roll Bars */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Anti-Roll Bars (ARB)</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Dianteira:</span>
            <span className="font-bold text-[#ef4444]">{tune.antiRollBars.front.toFixed(1)}</span>
          </div>
          <div className="text-[11px] text-white flex justify-between mt-0.5">
            <span className="text-[#666]">Traseira:</span>
            <span className="font-bold text-[#3b82f6]">{tune.antiRollBars.rear.toFixed(1)}</span>
          </div>
        </div>

        {/* Springs */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Springs & Ride Height</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Molas (D/T):</span>
            <span className="font-bold">{tune.springs.frontSprings} / {tune.springs.rearSprings}</span>
          </div>
          <div className="text-[10px] text-white flex justify-between mt-0.5">
            <span className="text-[#666]">Altura:</span>
            <span className="font-bold">{tune.springs.rideHeightFront} / {tune.springs.rideHeightRear} cm</span>
          </div>
        </div>

        {/* Damping */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Damping (Amortecedor)</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Rebound:</span>
            <span className="font-bold">{tune.damping.reboundFront} / {tune.damping.reboundRear}</span>
          </div>
          <div className="text-[10px] text-white flex justify-between mt-0.5">
            <span className="text-[#666]">Bump:</span>
            <span className="font-bold">{tune.damping.bumpFront} / {tune.damping.bumpRear}</span>
          </div>
        </div>

        {/* Aero */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Aero Downforce</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Diant / Tras:</span>
            <span className="font-bold">{tune.aero.frontDownforce} / {tune.aero.rearDownforce} <span className="text-[9px] font-normal text-[#888]">kg</span></span>
          </div>
        </div>

        {/* Differential */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Differential</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Rear Acc/Dec:</span>
            <span className="font-bold">{tune.differential.rearAccel}% / {tune.differential.rearDecel}%</span>
          </div>
          {tune.differential.centerBalance !== undefined && (
            <div className="text-[10px] text-white flex justify-between mt-0.5">
              <span className="text-[#666]">Center Bias:</span>
              <span className="font-bold text-[#10b981]">{tune.differential.centerBalance}% Tras</span>
            </div>
          )}
        </div>

        {/* Gearing */}
        <div className="bg-[#121212] p-2.5 border border-[#1e1e1e]">
          <div className="text-[9px] uppercase tracking-wider text-[#ef4444] font-bold mb-1">Gearing (Câmbio)</div>
          <div className="text-[11px] text-white flex justify-between">
            <span className="text-[#666]">Final Drive:</span>
            <span className="font-bold text-[#f59e0b]">{tune.gearing.finalDrive.toFixed(2)}</span>
          </div>
          <div className="text-[10px] text-white flex justify-between mt-0.5">
            <span className="text-[#666]">1ª / 6ª:</span>
            <span className="font-bold">{tune.gearing.gear1.toFixed(2)} / {tune.gearing.gear6.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
