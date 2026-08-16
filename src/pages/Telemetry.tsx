import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Download, 
  Flame, 
  Zap, 
  ArrowRight, 
  Copy, 
  Check, 
  RotateCcw,
  Sliders, 
  Terminal, 
  Cpu,
  Compass,
  Gauge,
  Layers,
  HelpCircle,
  Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export interface TelemetryFrame {
  timestamp: number;
  isRaceOn: boolean;
  speedKmh: number;
  speedMph: number;
  rpm: number;
  maxRpm: number;
  idleRpm: number;
  gear: number | string;
  throttle: number; // 0-100%
  brake: number;    // 0-100%
  clutch: number;   // 0-100%
  handbrake: number; // 0 or 1
  steer: number;    // -1.0 to 1.0
  boostPsi: number;
  fuel: number;
  torqueNm: number;
  powerHp: number;
  accelX: number; // Lateral G
  accelY: number; // Vertical G
  accelZ: number; // Longitudinal G
  yaw: number;
  pitch: number;
  roll: number;
  tireTempFL: { inner: number; center: number; outer: number };
  tireTempFR: { inner: number; center: number; outer: number };
  tireTempRL: { inner: number; center: number; outer: number };
  tireTempRR: { inner: number; center: number; outer: number };
  tirePressureFL: number;
  tirePressureFR: number;
  tirePressureRL: number;
  tirePressureRR: number;
  tireSlipFL: number;
  tireSlipFR: number;
  tireSlipRL: number;
  tireSlipRR: number;
  suspensionTravelFL: number; // mm
  suspensionTravelFR: number; // mm
  suspensionTravelRL: number; // mm
  suspensionTravelRR: number; // mm
  carOrdinal?: number;
  carClass?: number;
  carPI?: number;
  drivetrainType?: string;
  lapNumber?: number;
  currentLapTime?: number;
  bestLapTime?: number;
  lastLapTime?: number;
}

export function Telemetry() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [frequencyHz, setFrequencyHz] = useState(0);
  const [packetCount, setPacketCount] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryFrame | null>(null);
  const [sessionStats, setSessionStats] = useState({
    topSpeedKmh: 0,
    maxLateralG: 0,
    maxBrakingG: 0,
    maxRpm: 0,
    activeLaps: 0,
    bestLapTime: 0,
    totalPackets: 0
  });
  const [historyBuffer, setHistoryBuffer] = useState<TelemetryFrame[]>([]);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const ggCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Poll server for live real telemetry data at high frequency (60ms)
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/telemetry/latest');
        if (res.ok && mounted) {
          const json = await res.json();
          setIsConnected(json.connected);
          setFrequencyHz(json.frequencyHz || 0);
          setPacketCount(json.packetCount || 0);
          if (json.stats) setSessionStats(json.stats);
          if (json.buffer) setHistoryBuffer(json.buffer);

          if (json.connected && json.data) {
            setTelemetry(json.data);
          } else {
            setTelemetry(null);
          }
        }
      } catch (err) {
        if (mounted) {
          setIsConnected(false);
          setFrequencyHz(0);
          setTelemetry(null);
        }
      }
    };

    const interval = setInterval(poll, 80);
    poll();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Draw Dynamic G-G Diagram on Canvas
  useEffect(() => {
    const canvas = ggCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42;

    ctx.clearRect(0, 0, width, height);

    // Background circle & grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX, height - 10);
    ctx.moveTo(10, centerY);
    ctx.lineTo(width - 10, centerY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+1.0G (Frenagem)', centerX, 20);
    ctx.fillText('-1.0G (Aceleração)', centerX, height - 10);
    ctx.fillText('1.5G Esq', 35, centerY - 4);
    ctx.fillText('1.5G Dir', width - 35, centerY - 4);

    if (!telemetry) return;

    // Plot G-G trails
    if (historyBuffer.length > 1) {
      const trail = historyBuffer.slice(-30);
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const px = centerX + (p.accelX / 1.8) * radius;
        const py = centerY - (p.accelZ / 1.8) * radius;
        const alpha = (i / trail.length) * 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Current G dot
    const currentX = centerX + (telemetry.accelX / 1.8) * radius;
    const currentY = centerY - (telemetry.accelZ / 1.8) * radius;

    // Outer glow
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 9, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }, [telemetry, historyBuffer]);

  const handleResetSession = async () => {
    try {
      await fetch('/api/telemetry/reset-session', { method: 'POST' });
      setHistoryBuffer([]);
      setSessionStats({
        topSpeedKmh: 0,
        maxLateralG: 0,
        maxBrakingG: 0,
        maxRpm: 0,
        activeLaps: 0,
        bestLapTime: 0,
        totalPackets: 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCsv = () => {
    if (historyBuffer.length === 0) {
      alert("Nenhum dado real de telemetria gravado nesta sessão.");
      return;
    }
    const headers = "Timestamp,SpeedKmh,SpeedMph,RPM,Gear,Throttle,Brake,Clutch,Handbrake,Steer,BoostPsi,AccelX_LatG,AccelZ_LongG,FL_Temp,FR_Temp,RL_Temp,RR_Temp,FL_Slip,FR_Slip,RL_Slip,RR_Slip\n";
    const rows = historyBuffer.map(p => 
      `${p.timestamp},${p.speedKmh},${p.speedMph},${p.rpm},${p.gear},${p.throttle},${p.brake},${p.clutch},${p.handbrake},${p.steer},${p.boostPsi},${p.accelX},${p.accelZ},${p.tireTempFL.center},${p.tireTempFR.center},${p.tireTempRL.center},${p.tireTempRR.center},${p.tireSlipFL},${p.tireSlipFR},${p.tireSlipRL},${p.tireSlipRR}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FH6_Real_Telemetry_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    a.click();
  };

  const handleSendToAi = () => {
    navigate('/engineer', {
      state: {
        telemetryContext: {
          sessionStats,
          latestFrame: telemetry,
          online: isConnected
        }
      }
    });
  };

  const pythonBridgeCode = `# ============================================================
# FORZA HORIZON 6 UDP DATA-OUT BRIDGE (DASH PROTOCOL)
# ============================================================
# Escuta na porta UDP 5300 (padrão Forza) e encaminha
# pacotes brutos descompactados para o servidor do Cockpit.

import socket
import struct
import requests

UDP_IP = "0.0.0.0"
UDP_PORT = 5300
COCKPIT_ENDPOINT = "http://localhost:3000/api/telemetry/packet"

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"[+] Receptor UDP Forza iniciado em 0.0.0.0:{UDP_PORT}")
print(f"[+] Encaminhando fluxo de dados para -> {COCKPIT_ENDPOINT}")

while True:
    data, addr = sock.recvfrom(1024)
    if len(data) >= 311:
        unpacked = struct.unpack('<iIfffffffffffffffffffffffffffffffff', data[:148])
        rpm = unpacked[4]
        max_rpm = unpacked[2]
        vel_x, vel_y, vel_z = unpacked[8], unpacked[9], unpacked[10]
        speed_ms = (vel_x**2 + vel_y**2 + vel_z**2)**0.5
        speed_kmh = speed_ms * 3.6

        # Dash specific bytes
        dash_tail = struct.unpack('<fffffffHB4Bsb', data[260:300])
        boost = dash_tail[0]
        fuel = dash_tail[1]
        lap_num = dash_tail[7]
        throttle = int((dash_tail[9] / 255) * 100)
        brake = int((dash_tail[10] / 255) * 100)
        clutch = int((dash_tail[11] / 255) * 100)
        handbrake = 1 if dash_tail[12] > 0 else 0
        steer = round(dash_tail[13] / 127.0, 2)

        packet = {
            "speedKmh": round(speed_kmh, 1),
            "rpm": int(rpm),
            "maxRpm": int(max_rpm),
            "throttle": throttle,
            "brake": brake,
            "clutch": clutch,
            "handbrake": handbrake,
            "steer": steer,
            "boostPsi": round(boost, 1),
            "fuel": round(fuel * 100, 1),
            "accelX": round(unpacked[5] / 9.80665, 2),
            "accelZ": round(unpacked[7] / 9.80665, 2),
            "lapNumber": lap_num
        }

        try:
            requests.post(COCKPIT_ENDPOINT, json=packet, timeout=0.05)
        except Exception:
            pass
`;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto font-mono">
      {/* Telemetry Header */}
      <header className="border-b border-[#222] p-6 sm:p-8 bg-gradient-to-b from-[#141414] to-[#0a0a0a] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444] font-bold mb-1 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>Forza Horizon 6 Data-Out • Pipeline de Telemetria Real</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Telemetria ao Vivo
            </h1>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Indicator */}
            <div className={`px-3 py-1.5 border text-xs font-bold uppercase flex items-center gap-2 ${
              isConnected 
                ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]' 
                : 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#10b981] animate-ping' : 'bg-[#ef4444]'}`}></span>
              <span>{isConnected ? `ONLINE (${frequencyHz} HZ)` : 'OFFLINE'}</span>
            </div>

            <button
              onClick={handleResetSession}
              className="px-3 py-2 bg-[#161616] border border-[#333] text-[#aaa] hover:text-white text-xs font-bold uppercase hover:bg-[#222] transition-colors inline-flex items-center gap-1.5"
              title="Zerar estatísticas e buffer da sessão"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Zerar Sessão
            </button>

            <button
              onClick={handleExportCsv}
              disabled={historyBuffer.length === 0}
              className="px-4 py-2 bg-[#161616] border border-[#333] text-white text-xs font-bold uppercase hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
              title="Exportar log de pacotes reais para CSV"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>

            <button
              onClick={handleSendToAi}
              className="px-4 py-2 bg-[#ef4444] text-black font-black text-xs uppercase hover:bg-white transition-colors inline-flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" /> Enviar para IA
            </button>

            <button
              onClick={() => setShowBridgeModal(true)}
              className="p-2 bg-[#161616] border border-[#333] text-[#aaa] hover:text-white transition-colors"
              title="Instruções de Configuração do Forza UDP Data Out"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Offline Warning State Banner */}
        {!isConnected && (
          <div className="bg-[#120808] border-2 border-[#ef4444]/40 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <WifiOff className="w-6 h-6 text-[#ef4444]" />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  Status do Link de Telemetria: OFFLINE
                </h2>
              </div>
              <p className="text-xs text-[#aaa] leading-relaxed max-w-2xl">
                Nenhum fluxo de dados do <strong className="text-white">Forza Horizon 6</strong> detectado na porta UDP <strong className="text-white">5300</strong>.
                Para receber dados em tempo real, inicie o jogo e ative o <span className="text-[#10b981]">Data Out</span> nas configurações de HUD.
              </p>
              <div className="text-[11px] text-[#777] flex flex-wrap gap-4 pt-1">
                <span>• Protocolo: <strong className="text-[#bbb]">UDP Data Out (Dash 324B)</strong></span>
                <span>• Porta Padrão: <strong className="text-[#bbb]">5300</strong></span>
                <span>• Pacotes Capturados na Sessão: <strong className="text-[#bbb]">{packetCount}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => setShowBridgeModal(true)}
                className="px-5 py-2.5 bg-[#ef4444] text-black font-black text-xs uppercase hover:bg-white transition-colors flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5" /> Guia de Conexão UDP
              </button>
            </div>
          </div>
        )}

        {/* Live Gauges Section */}
        {isConnected && telemetry ? (
          <>
            {/* Primary Gauges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Velocity */}
              <div className="p-5 bg-[#0e0e0e] border border-[#222]">
                <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Velocidade Atual</span>
                <div className="text-4xl font-black text-white italic tracking-tighter">
                  {telemetry.speedKmh} <span className="text-xs text-[#666] font-normal not-italic">KM/H</span>
                </div>
                <div className="text-xs text-[#888] mt-1 flex justify-between">
                  <span>{telemetry.speedMph} MPH</span>
                  <span className="text-[#10b981] font-bold">Máx: {sessionStats.topSpeedKmh} KM/H</span>
                </div>
              </div>

              {/* Engine RPM & Dyno */}
              <div className="p-5 bg-[#0e0e0e] border border-[#222]">
                <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Giro do Motor</span>
                <div className="text-4xl font-black text-[#ef4444] italic tracking-tighter">
                  {telemetry.rpm} <span className="text-xs text-[#666] font-normal not-italic">RPM</span>
                </div>
                <div className="w-full bg-[#1c1c1c] h-2 mt-2 overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-75 ${
                      telemetry.rpm > (telemetry.maxRpm * 0.9) ? 'bg-[#ef4444]' : 'bg-[#eab308]'
                    }`}
                    style={{ width: `${Math.min(100, (telemetry.rpm / (telemetry.maxRpm || 8500)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Gear & Drivetrain Load */}
              <div className="p-5 bg-[#0e0e0e] border border-[#222]">
                <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Câmbio & Marcha</span>
                <div className="text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2">
                  <span>MARCHA {telemetry.gear}</span>
                </div>
                <div className="text-xs text-[#888] mt-1 flex justify-between">
                  <span>Boost: {telemetry.boostPsi} PSI</span>
                  <span className="text-[#3b82f6] font-bold">{telemetry.powerHp} HP</span>
                </div>
              </div>

              {/* G-Force Instantaneous */}
              <div className="p-5 bg-[#0e0e0e] border border-[#222]">
                <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Aceleração Lateral</span>
                <div className="text-4xl font-black text-[#10b981] italic tracking-tighter">
                  {telemetry.accelX} <span className="text-xs text-[#666] font-normal not-italic">G</span>
                </div>
                <div className="text-xs text-[#888] mt-1 flex justify-between">
                  <span>Long: {telemetry.accelZ}G</span>
                  <span className="text-[#eab308] font-bold">Pico Lat: {sessionStats.maxLateralG}G</span>
                </div>
              </div>
            </div>

            {/* Mid Section: Friction Circle (G-G) + 4-Corner Tire Dynamics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Friction Circle (G-G Diagram) */}
              <div className="bg-[#0e0e0e] border border-[#222] p-6 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between pb-3 border-b border-[#1c1c1c] mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#ef4444]" />
                    Círculo de Aderência G-G (Tempo Real)
                  </h3>
                  <span className="text-[10px] text-[#666]">Rastro Real</span>
                </div>

                <canvas
                  ref={ggCanvasRef}
                  width={260}
                  height={260}
                  className="bg-[#080808] border border-[#1a1a1a] rounded-full my-2"
                />

                <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center text-[10px] border-t border-[#1c1c1c] pt-3">
                  <div>
                    <span className="text-[#666] block uppercase">Lateral</span>
                    <span className="text-white font-bold">{telemetry.accelX} G</span>
                  </div>
                  <div>
                    <span className="text-[#666] block uppercase">Longitudinal</span>
                    <span className="text-white font-bold">{telemetry.accelZ} G</span>
                  </div>
                  <div>
                    <span className="text-[#666] block uppercase">Pico Frenagem</span>
                    <span className="text-[#ef4444] font-bold">{sessionStats.maxBrakingG} G</span>
                  </div>
                </div>
              </div>

              {/* 4-Corner Thermal & Pressure Heatmap */}
              <div className="lg:col-span-2 bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#ef4444] flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#ef4444]" />
                    Gradiente Térmico das 4 Rodas (Medições Reais)
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-[#666]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3b82f6]"></span> Frio &lt;75°C</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981]"></span> Ideal 85-98°C</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#ef4444]"></span> Quente &gt;105°C</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Left */}
                  <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase">Dianteiro Esquerdo (FL)</span>
                      <span className="text-[#10b981] font-bold">{telemetry.tirePressureFL} PSI</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#777]">
                        <span>Interno: {telemetry.tireTempFL.inner}°C</span>
                        <span>Centro: {telemetry.tireTempFL.center}°C</span>
                        <span>Externo: {telemetry.tireTempFL.outer}°C</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 h-3">
                        <div className={`rounded-sm ${telemetry.tireTempFL.inner > 105 ? 'bg-[#ef4444]' : telemetry.tireTempFL.inner < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempFL.center > 105 ? 'bg-[#ef4444]' : telemetry.tireTempFL.center < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempFL.outer > 105 ? 'bg-[#ef4444]' : telemetry.tireTempFL.outer < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-[#141414]">
                      <span className="text-[#888]">Slip Ratio:</span>
                      <span className="text-white font-bold">{telemetry.tireSlipFL}</span>
                    </div>
                  </div>

                  {/* Front Right */}
                  <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase">Dianteiro Direito (FR)</span>
                      <span className="text-[#10b981] font-bold">{telemetry.tirePressureFR} PSI</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#777]">
                        <span>Interno: {telemetry.tireTempFR.inner}°C</span>
                        <span>Centro: {telemetry.tireTempFR.center}°C</span>
                        <span>Externo: {telemetry.tireTempFR.outer}°C</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 h-3">
                        <div className={`rounded-sm ${telemetry.tireTempFR.inner > 105 ? 'bg-[#ef4444]' : telemetry.tireTempFR.inner < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempFR.center > 105 ? 'bg-[#ef4444]' : telemetry.tireTempFR.center < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempFR.outer > 105 ? 'bg-[#ef4444]' : telemetry.tireTempFR.outer < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-[#141414]">
                      <span className="text-[#888]">Slip Ratio:</span>
                      <span className="text-white font-bold">{telemetry.tireSlipFR}</span>
                    </div>
                  </div>

                  {/* Rear Left */}
                  <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase">Traseiro Esquerdo (RL)</span>
                      <span className="text-[#10b981] font-bold">{telemetry.tirePressureRL} PSI</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#777]">
                        <span>Interno: {telemetry.tireTempRL.inner}°C</span>
                        <span>Centro: {telemetry.tireTempRL.center}°C</span>
                        <span>Externo: {telemetry.tireTempRL.outer}°C</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 h-3">
                        <div className={`rounded-sm ${telemetry.tireTempRL.inner > 105 ? 'bg-[#ef4444]' : telemetry.tireTempRL.inner < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempRL.center > 105 ? 'bg-[#ef4444]' : telemetry.tireTempRL.center < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempRL.outer > 105 ? 'bg-[#ef4444]' : telemetry.tireTempRL.outer < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-[#141414]">
                      <span className="text-[#888]">Slip Ratio:</span>
                      <span className="text-white font-bold">{telemetry.tireSlipRL}</span>
                    </div>
                  </div>

                  {/* Rear Right */}
                  <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase">Traseiro Direito (RR)</span>
                      <span className="text-[#10b981] font-bold">{telemetry.tirePressureRR} PSI</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#777]">
                        <span>Interno: {telemetry.tireTempRR.inner}°C</span>
                        <span>Centro: {telemetry.tireTempRR.center}°C</span>
                        <span>Externo: {telemetry.tireTempRR.outer}°C</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 h-3">
                        <div className={`rounded-sm ${telemetry.tireTempRR.inner > 105 ? 'bg-[#ef4444]' : telemetry.tireTempRR.inner < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempRR.center > 105 ? 'bg-[#ef4444]' : telemetry.tireTempRR.center < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                        <div className={`rounded-sm ${telemetry.tireTempRR.outer > 105 ? 'bg-[#ef4444]' : telemetry.tireTempRR.outer < 75 ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`}></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-[#141414]">
                      <span className="text-[#888]">Slip Ratio:</span>
                      <span className="text-white font-bold">{telemetry.tireSlipRR}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower Section: Real Pedals & Suspension Deflection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Pedals & Inputs */}
              <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white pb-3 border-b border-[#1c1c1c]">
                  Entradas do Piloto (Pedais & Volante)
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#888]">Acelerador (Throttle)</span>
                      <span className="text-white font-bold">{telemetry.throttle}%</span>
                    </div>
                    <div className="w-full bg-[#161616] h-2.5 overflow-hidden">
                      <div className="bg-[#10b981] h-full transition-all duration-75" style={{ width: `${telemetry.throttle}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#888]">Frenagem (Brake)</span>
                      <span className="text-white font-bold">{telemetry.brake}%</span>
                    </div>
                    <div className="w-full bg-[#161616] h-2.5 overflow-hidden">
                      <div className="bg-[#ef4444] h-full transition-all duration-75" style={{ width: `${telemetry.brake}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#888]">Embreagem (Clutch)</span>
                      <span className="text-white font-bold">{telemetry.clutch}%</span>
                    </div>
                    <div className="w-full bg-[#161616] h-2.5 overflow-hidden">
                      <div className="bg-[#3b82f6] h-full transition-all duration-75" style={{ width: `${telemetry.clutch}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#888]">Ângulo de Esterço (Steer)</span>
                      <span className="text-white font-bold">{telemetry.steer}</span>
                    </div>
                    <div className="w-full bg-[#161616] h-2.5 overflow-hidden relative">
                      <div 
                        className="bg-[#eab308] h-full absolute transition-all duration-75" 
                        style={{ 
                          left: '50%', 
                          width: `${Math.abs(telemetry.steer) * 50}%`,
                          transform: telemetry.steer < 0 ? 'translateX(-100%)' : 'none'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suspension Deflection Bars */}
              <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white pb-3 border-b border-[#1c1c1c]">
                  Curso de Suspensão por Amortecedor
                </h3>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block mb-1">FL</span>
                    <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                      <div 
                        className="bg-[#3b82f6] w-full transition-all duration-75"
                        style={{ height: `${Math.min(100, (telemetry.suspensionTravelFL / 120) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelFL} mm</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777] uppercase block mb-1">FR</span>
                    <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                      <div 
                        className="bg-[#3b82f6] w-full transition-all duration-75"
                        style={{ height: `${Math.min(100, (telemetry.suspensionTravelFR / 120) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelFR} mm</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777] uppercase block mb-1">RL</span>
                    <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                      <div 
                        className="bg-[#10b981] w-full transition-all duration-75"
                        style={{ height: `${Math.min(100, (telemetry.suspensionTravelRL / 120) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelRL} mm</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777] uppercase block mb-1">RR</span>
                    <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                      <div 
                        className="bg-[#10b981] w-full transition-all duration-75"
                        style={{ height: `${Math.min(100, (telemetry.suspensionTravelRR / 120) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelRR} mm</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Detailed Setup & Diagnostics Section when OFFLINE */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#0e0e0e] border border-[#222] p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-[#1c1c1c] pb-3">
                <HelpCircle className="w-4 h-4 text-[#ef4444]" />
                Como Ativar a Telemetria Real no Forza Horizon 6
              </h3>

              <div className="space-y-4 text-xs text-[#bbb] leading-relaxed">
                <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-2">
                  <div className="font-bold text-white uppercase text-[11px]">Passo 1: No Menu do Forza Horizon</div>
                  <p className="text-[#888]">
                    Abra o jogo &gt; <strong>Configurações</strong> &gt; <strong>HUD e Jogabilidade</strong> &gt; Role até a seção <strong>Saída de Dados (Data Out)</strong>.
                  </p>
                </div>

                <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-2">
                  <div className="font-bold text-white uppercase text-[11px]">Passo 2: Preencha os Campos Exatos</div>
                  <ul className="space-y-1.5 text-[#aaa]">
                    <li>• <span className="text-white font-bold">Saída de Dados (Data Out):</span> <span className="text-[#10b981] font-bold">LIGADO</span></li>
                    <li>• <span className="text-white font-bold">Endereço IP de Saída de Dados:</span> <span className="text-[#10b981] font-bold">127.0.0.1</span> (ou IP local da sua máquina)</li>
                    <li>• <span className="text-white font-bold">Porta IP de Saída de Dados:</span> <span className="text-[#10b981] font-bold">5300</span></li>
                    <li>• <span className="text-white font-bold">Formato de Estrutura de Pacote:</span> <span className="text-[#10b981] font-bold">Dash</span></li>
                  </ul>
                </div>

                <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-2">
                  <div className="font-bold text-white uppercase text-[11px]">Passo 3: Conexão Direta e Ponte Python</div>
                  <p className="text-[#888]">
                    Assim que você começar a pilotar no Forza Horizon 6, o fluxo UDP transmitirá 60 pacotes por segundo para o Cockpit.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Helper Box */}
            <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Script de Ponte UDP
                </h4>
                <p className="text-xs text-[#777] leading-relaxed mb-4">
                  Se você joga no Xbox ou em outro PC na mesma rede local, execute o script em Python para encaminhar o fluxo de pacotes sem bloqueios de firewall.
                </p>
                <button
                  onClick={() => setShowBridgeModal(true)}
                  className="w-full py-2.5 bg-[#161616] border border-[#333] text-white hover:bg-[#222] text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5" /> Ver Código Python
                </button>
              </div>

              <div className="p-3 bg-[#080808] border border-[#1a1a1a] text-[10px] text-[#666]">
                Status do Socket do Servidor: <span className="text-[#10b981] font-bold">0.0.0.0:5300 (UDP Ativo)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Python UDP Bridge Instructions Modal */}
      {showBridgeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-[#333] w-full max-w-2xl p-6 sm:p-8 my-8 relative">
            <button 
              onClick={() => setShowBridgeModal(false)}
              className="absolute right-4 top-4 text-[#666] hover:text-white p-1 font-mono"
            >
              ✕
            </button>

            <h3 className="text-xl font-black italic text-white uppercase mb-2">
              Script de Ponte UDP do Forza Horizon 6
            </h3>
            <p className="text-xs text-[#777] mb-4 leading-relaxed">
              Copie o código Python abaixo para receber os pacotes do Forza e transmiti-los diretamente para a API do Cockpit:
            </p>

            <div className="relative">
              <div className="flex justify-between items-center bg-[#141414] px-4 py-2 border-t border-x border-[#262626]">
                <span className="text-[10px] text-[#888] font-bold uppercase">forza_udp_bridge.py</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pythonBridgeCode);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="text-[10px] text-[#ef4444] hover:text-white inline-flex items-center gap-1 font-bold"
                >
                  {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedScript ? 'Copiado para a Área de Transferência!' : 'Copiar Script Python'}
                </button>
              </div>
              <pre className="p-4 bg-[#050505] border border-[#262626] text-[10px] text-[#10b981] overflow-x-auto max-h-64">
                {pythonBridgeCode}
              </pre>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowBridgeModal(false)}
                className="px-5 py-2 bg-[#ef4444] text-black font-bold text-xs uppercase hover:bg-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
