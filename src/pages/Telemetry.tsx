import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Radio, 
  Wifi, 
  WifiOff, 
  Play, 
  Square, 
  RotateCcw,
  Gauge, 
  Sliders, 
  Terminal, 
  Download, 
  Sparkles, 
  Flame, 
  Zap, 
  ArrowRight, 
  Copy, 
  Check, 
  ChevronRight, 
  Layers,
  Cpu,
  Compass,
  Volume2,
  VolumeX,
  Keyboard
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TelemetryFrame {
  timestamp: number;
  speedKmh: number;
  speedMph: number;
  rpm: number;
  maxRpm: number;
  gear: number | string;
  throttle: number; // 0-100%
  brake: number;    // 0-100%
  clutch: number;   // 0-100%
  handbrake: number; // 0 or 1
  steer: number;    // -1.0 to 1.0
  boostPsi: number;
  torqueNm: number;
  powerHp: number;
  accelX: number; // Lateral G
  accelY: number; // Longitudinal G
  accelZ: number; // Vertical G
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
}

const DEFAULT_FRAME: TelemetryFrame = {
  timestamp: 0,
  speedKmh: 0,
  speedMph: 0,
  rpm: 950,
  maxRpm: 8600,
  gear: 'N',
  throttle: 0,
  brake: 0,
  clutch: 0,
  handbrake: 0,
  steer: 0,
  boostPsi: 0,
  torqueNm: 420,
  powerHp: 580,
  accelX: 0,
  accelY: 0,
  accelZ: 1.0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  tireTempFL: { inner: 86, center: 88, outer: 89 },
  tireTempFR: { inner: 86, center: 88, outer: 89 },
  tireTempRL: { inner: 90, center: 92, outer: 93 },
  tireTempRR: { inner: 90, center: 92, outer: 93 },
  tirePressureFL: 30.5,
  tirePressureFR: 30.5,
  tirePressureRL: 29.8,
  tirePressureRR: 29.8,
  tireSlipFL: 0.01,
  tireSlipFR: 0.01,
  tireSlipRL: 0.01,
  tireSlipRR: 0.01,
  suspensionTravelFL: 65,
  suspensionTravelFR: 65,
  suspensionTravelRL: 72,
  suspensionTravelRR: 72,
};

const TRACK_PROFILES = [
  { id: 'festival', name: 'Horizon Festival Circuit', type: 'Technical Circuit', lapDistance: '3.4 km' },
  { id: 'caldera', name: 'La Gran Caldera Touge', type: 'High Elevation Hillclimb', lapDistance: '5.2 km' },
  { id: 'aerodromo', name: 'Aeródromo 1/4 Mile Drag', type: 'Acceleration & Braking', lapDistance: '0.8 km' },
  { id: 'goliath', name: 'The Goliath 50km Enduro', type: 'High Speed Downforce', lapDistance: '52.1 km' }
];

export function Telemetry() {
  const [streamSource, setStreamSource] = useState<'simulator' | 'live_udp'>('simulator');
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('festival');
  const [manualDriveMode, setManualDriveMode] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryFrame>(DEFAULT_FRAME);
  const [packetCount, setPacketCount] = useState(0);
  const [packetHistory, setPacketHistory] = useState<TelemetryFrame[]>([]);
  const [liveUdpConnected, setLiveUdpConnected] = useState(false);

  // Driving performance stats
  const [lapTime, setLapTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState(64.82);
  const [topSpeedKmh, setTopSpeedKmh] = useState(0);
  const [maxLateralG, setMaxLateralG] = useState(0);
  const [accelZeroToHundred, setAccelZeroToHundred] = useState<number | null>(3.15);

  // Manual drive inputs
  const manualInputs = useRef({
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: 0,
    gear: 1
  });

  const ggCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keyboard controls for manual driving mode
  useEffect(() => {
    if (!manualDriveMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) manualInputs.current.throttle = 100;
      if (['ArrowDown', 'KeyS'].includes(e.code)) manualInputs.current.brake = 100;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) manualInputs.current.steer = -0.75;
      if (['ArrowRight', 'KeyD'].includes(e.code)) manualInputs.current.steer = 0.75;
      if (e.code === 'Space') manualInputs.current.handbrake = 1;
      if (e.code === 'KeyE') manualInputs.current.gear = Math.min(6, (Number(manualInputs.current.gear) || 1) + 1);
      if (e.code === 'KeyQ') manualInputs.current.gear = Math.max(1, (Number(manualInputs.current.gear) || 1) - 1);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) manualInputs.current.throttle = 0;
      if (['ArrowDown', 'KeyS'].includes(e.code)) manualInputs.current.brake = 0;
      if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) manualInputs.current.steer = 0;
      if (e.code === 'Space') manualInputs.current.handbrake = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [manualDriveMode]);

  // Live UDP Polling
  useEffect(() => {
    if (streamSource !== 'live_udp' || !isStreaming) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry/latest');
        if (res.ok) {
          const json = await res.json();
          setLiveUdpConnected(json.connected);
          if (json.data) {
            setTelemetry(json.data);
            setPacketCount(json.packetCount);
          }
        }
      } catch (err) {
        setLiveUdpConnected(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [streamSource, isStreaming]);

  // Simulator Physics Engine Loop (60 Hz)
  useEffect(() => {
    if (streamSource !== 'simulator' || !isStreaming) return;

    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      setPacketCount(prev => prev + 1);
      setLapTime(prev => Number((prev + 0.05).toFixed(2)));

      let speed = 0;
      let rpm = 950;
      let gear: any = '1';
      let throttle = 0;
      let brake = 0;
      let steer = 0;
      let handbrake = 0;
      let boost = 0;
      let accelX = 0;
      let accelY = 0;

      if (manualDriveMode) {
        throttle = manualInputs.current.throttle;
        brake = manualInputs.current.brake;
        steer = manualInputs.current.steer;
        handbrake = manualInputs.current.handbrake;
        gear = manualInputs.current.gear;

        const currentSpeed = telemetry.speedKmh;
        const targetSpeed = throttle > 0 ? currentSpeed + (throttle / 100) * 4.5 : brake > 0 ? Math.max(0, currentSpeed - 8.0) : Math.max(0, currentSpeed - 0.8);
        speed = Math.min(365, Math.round(targetSpeed));
        rpm = Math.min(8500, Math.round(1200 + (speed % 60) * 120));
        boost = throttle > 50 ? Number((1.2 + Math.sin(t * 5) * 0.4).toFixed(1)) : 0;
        accelX = Number((steer * (speed / 120) * 1.6).toFixed(2));
        accelY = throttle > 0 ? 0.85 : brake > 0 ? -1.45 : -0.1;
      } else {
        // Track-specific simulated racing telemetry
        if (selectedTrack === 'festival') {
          // Racing lines, chicanes, apex braking
          const phase = Math.sin(t * 0.8);
          const cornering = Math.sin(t * 1.6);
          speed = Math.floor(180 + phase * 65 + cornering * 25);
          rpm = Math.floor(6200 + Math.sin(t * 2.5) * 1800);
          gear = speed > 220 ? '5' : speed > 165 ? '4' : speed > 115 ? '3' : '2';
          throttle = phase > -0.2 ? Math.floor(80 + Math.sin(t * 2) * 20) : 10;
          brake = phase < -0.3 ? Math.floor(Math.abs(phase) * 85) : 0;
          steer = Number((cornering * 0.65).toFixed(2));
          boost = throttle > 70 ? Number((18.4 + Math.sin(t) * 2.2).toFixed(1)) : 2.5;
          accelX = Number((cornering * 1.55).toFixed(2));
          accelY = brake > 0 ? -1.25 : throttle > 70 ? 0.75 : 0.05;
        } else if (selectedTrack === 'caldera') {
          // Mountain drift, extreme steering angle, high tire slip
          speed = Math.floor(130 + Math.sin(t * 1.1) * 45);
          rpm = Math.floor(6800 + Math.sin(t * 4) * 1400);
          gear = '3';
          throttle = 95;
          brake = Math.abs(Math.sin(t * 0.7)) > 0.8 ? 40 : 0;
          steer = Number((Math.sin(t * 1.4) * 0.9).toFixed(2));
          boost = 21.5;
          accelX = Number((Math.sin(t * 1.4) * 1.75).toFixed(2));
          accelY = 0.45;
        } else if (selectedTrack === 'aerodromo') {
          // Standing drag acceleration
          const dragCycle = (t % 15) / 15;
          speed = Math.floor(dragCycle * 340);
          rpm = Math.floor(3500 + (speed % 55) * 90);
          gear = speed > 280 ? '6' : speed > 220 ? '5' : speed > 160 ? '4' : speed > 100 ? '3' : speed > 45 ? '2' : '1';
          throttle = dragCycle < 0.85 ? 100 : 0;
          brake = dragCycle >= 0.85 ? 100 : 0;
          steer = 0.02;
          boost = 24.2;
          accelX = 0.05;
          accelY = dragCycle < 0.85 ? Number((1.65 - dragCycle * 1.1).toFixed(2)) : -1.85;
        } else {
          // Goliath top speed enduro
          speed = Math.floor(310 + Math.sin(t * 0.5) * 55);
          rpm = Math.floor(7400 + Math.sin(t * 1.2) * 800);
          gear = '6';
          throttle = 100;
          brake = 0;
          steer = Number((Math.sin(t * 0.4) * 0.35).toFixed(2));
          boost = 19.8;
          accelX = Number((Math.sin(t * 0.4) * 1.25).toFixed(2));
          accelY = 0.25;
        }
      }

      // 4-Corner Tire calculations
      const flTemp = Math.floor(88 + Math.abs(accelX) * 12 + brake * 0.1);
      const frTemp = Math.floor(88 + Math.abs(accelX) * 12 + brake * 0.1);
      const rlTemp = Math.floor(92 + throttle * 0.08 + Math.abs(accelX) * 8);
      const rrTemp = Math.floor(92 + throttle * 0.08 + Math.abs(accelX) * 8);

      const frame: TelemetryFrame = {
        timestamp: Date.now(),
        speedKmh: speed,
        speedMph: Math.floor(speed * 0.621371),
        rpm: rpm,
        maxRpm: 8600,
        gear: gear,
        throttle: throttle,
        brake: brake,
        clutch: 0,
        handbrake: handbrake,
        steer: steer,
        boostPsi: boost,
        torqueNm: Math.floor(580 + (rpm / 8500) * 220),
        powerHp: Math.floor((rpm * (580 + (rpm / 8500) * 220)) / 7127),
        accelX: accelX,
        accelY: accelY,
        accelZ: 1.0,
        yaw: Number((steer * 0.3).toFixed(2)),
        pitch: Number((-accelY * 0.05).toFixed(2)),
        roll: Number((accelX * 0.06).toFixed(2)),
        tireTempFL: { inner: flTemp + 3, center: flTemp, outer: flTemp - 2 },
        tireTempFR: { inner: frTemp - 2, center: frTemp, outer: frTemp + 3 },
        tireTempRL: { inner: rlTemp + 2, center: rlTemp, outer: rlTemp - 1 },
        tireTempRR: { inner: rrTemp - 1, center: rrTemp, outer: rrTemp + 2 },
        tirePressureFL: Number((30.0 + flTemp * 0.03).toFixed(1)),
        tirePressureFR: Number((30.0 + frTemp * 0.03).toFixed(1)),
        tirePressureRL: Number((29.5 + rlTemp * 0.03).toFixed(1)),
        tirePressureRR: Number((29.5 + rrTemp * 0.03).toFixed(1)),
        tireSlipFL: Number((0.02 + Math.abs(accelX) * 0.11 + (brake > 0 ? 0.08 : 0)).toFixed(2)),
        tireSlipFR: Number((0.02 + Math.abs(accelX) * 0.11 + (brake > 0 ? 0.08 : 0)).toFixed(2)),
        tireSlipRL: Number((0.02 + (throttle > 80 ? 0.14 : 0.02) + Math.abs(accelX) * 0.06).toFixed(2)),
        tireSlipRR: Number((0.02 + (throttle > 80 ? 0.14 : 0.02) + Math.abs(accelX) * 0.06).toFixed(2)),
        suspensionTravelFL: Math.floor(62 - accelY * 18 + accelX * 14),
        suspensionTravelFR: Math.floor(62 - accelY * 18 - accelX * 14),
        suspensionTravelRL: Math.floor(68 + accelY * 15 + accelX * 12),
        suspensionTravelRR: Math.floor(68 + accelY * 15 - accelX * 12),
      };

      setTelemetry(frame);

      // Track max metrics
      if (frame.speedKmh > topSpeedKmh) setTopSpeedKmh(frame.speedKmh);
      if (Math.abs(frame.accelX) > maxLateralG) setMaxLateralG(Math.abs(frame.accelX));

      // Buffer packet history (keep last 300 samples)
      setPacketHistory(prev => [...prev.slice(-299), frame]);
    }, 50);

    return () => clearInterval(interval);
  }, [streamSource, isStreaming, selectedTrack, manualDriveMode, topSpeedKmh, maxLateralG]);

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
    ctx.fillText('+1.0G (Brake)', centerX, 20);
    ctx.fillText('-1.0G (Accel)', centerX, height - 10);
    ctx.fillText('1.5G Left', 35, centerY - 4);
    ctx.fillText('1.5G Right', width - 35, centerY - 4);

    // Plot G-G trails (last 40 frames)
    if (packetHistory.length > 1) {
      const trail = packetHistory.slice(-40);
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const px = centerX + (p.accelX / 1.8) * radius;
        const py = centerY - (p.accelY / 1.8) * radius;
        const alpha = (i / trail.length) * 0.6;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Current G dot
    const currentX = centerX + (telemetry.accelX / 1.8) * radius;
    const currentY = centerY - (telemetry.accelY / 1.8) * radius;

    // Outer glow
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [telemetry, packetHistory]);

  const handleExportCsv = () => {
    if (packetHistory.length === 0) {
      alert("No telemetry data to export.");
      return;
    }
    const headers = "Timestamp,SpeedKmh,SpeedMph,RPM,Gear,Throttle,Brake,Steer,BoostPsi,AccelX_LatG,AccelY_LongG,FL_Temp,FR_Temp,RL_Temp,RR_Temp\n";
    const rows = packetHistory.map(p => 
      `${p.timestamp},${p.speedKmh},${p.speedMph},${p.rpm},${p.gear},${p.throttle},${p.brake},${p.steer},${p.boostPsi},${p.accelX},${p.accelY},${p.tireTempFL.center},${p.tireTempFR.center},${p.tireTempRL.center},${p.tireTempRR.center}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FH6_Telemetry_Session_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    a.click();
  };

  const pythonBridgeCode = `# ============================================================
# FORZA HORIZON 6 / FH5 / MOTORSPORT UDP DATA-OUT BRIDGE
# ============================================================
# Listens on UDP port 5300 (Forza default) and streams live 
# 324-byte Dash packets to the AI Engineering Cockpit.

import socket
import struct
import time
import requests
import json

UDP_IP = "0.0.0.0"
UDP_PORT = 5300
COCKPIT_ENDPOINT = "http://localhost:3000/api/telemetry/packet"

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"[+] Forza UDP Receiver listening on port {UDP_PORT}...")
print(f"[+] Streaming forwarder active -> {COCKPIT_ENDPOINT}")

while True:
    data, addr = sock.recvfrom(1024)
    if len(data) >= 311:
        # Unpack Forza Dash telemetry struct
        # (Format: IsRaceOn, TimestampMS, MaxRpm, IdleRpm, CurrentRpm, AccelX, AccelY, AccelZ, VelX, VelY, VelZ...)
        unpacked = struct.unpack('<iIfffffffffffffffffffffffffffffffff', data[:148])
        rpm = unpacked[4]
        max_rpm = unpacked[2]
        vel_x, vel_y, vel_z = unpacked[8], unpacked[9], unpacked[10]
        speed_ms = (vel_x**2 + vel_y**2 + vel_z**2)**0.5
        speed_kmh = speed_ms * 3.6

        packet = {
            "speedKmh": round(speed_kmh, 1),
            "speedMph": round(speed_kmh * 0.621371, 1),
            "rpm": int(rpm),
            "maxRpm": int(max_rpm),
            "accelX": round(unpacked[5], 2),
            "accelY": round(unpacked[6], 2),
            "accelZ": round(unpacked[7], 2)
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
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#10b981] font-bold mb-1 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>High-Frequency Data Out Suite • 60 Hz Telemetry Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white uppercase">
              Live Vehicle Telemetry
            </h1>
          </div>

          {/* Source Selectors & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Stream Mode Toggle */}
            <div className="bg-[#141414] border border-[#262626] p-1 flex">
              <button
                onClick={() => setStreamSource('simulator')}
                className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                  streamSource === 'simulator' 
                    ? 'bg-[#10b981] text-black' 
                    : 'text-[#888] hover:text-white'
                }`}
              >
                Track Simulator
              </button>
              <button
                onClick={() => setStreamSource('live_udp')}
                className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                  streamSource === 'live_udp' 
                    ? 'bg-[#3b82f6] text-white' 
                    : 'text-[#888] hover:text-white'
                }`}
              >
                Forza UDP Receiver
              </button>
            </div>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 ${
                isStreaming
                  ? 'bg-[#ef4444] text-white hover:bg-white hover:text-black'
                  : 'bg-[#10b981] text-black hover:bg-white'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" /> Pause Feed
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Resume Feed
                </>
              )}
            </button>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-[#161616] border border-[#333] text-white text-xs font-bold uppercase hover:bg-[#222] transition-colors inline-flex items-center gap-1.5"
              title="Export session packet data to CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV Log
            </button>

            <button
              onClick={() => setShowBridgeModal(true)}
              className="p-2 bg-[#161616] border border-[#333] text-[#aaa] hover:text-white transition-colors"
              title="Forza Data Out Bridge Setup"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Status & Live Track Bar */}
        <div className="bg-[#0e0e0e] border border-[#222] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              isStreaming && (streamSource === 'simulator' || liveUdpConnected)
                ? 'bg-[#10b981] animate-pulse'
                : 'bg-[#ef4444]'
            }`}></span>
            <div>
              <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <span>
                  {streamSource === 'simulator'
                    ? (manualDriveMode ? 'INTERACTIVE MANUAL TEST DRIVE' : 'TRACK TELEMETRY FEED ACTIVE')
                    : (liveUdpConnected ? 'FORZA LIVE UDP BROADCAST CONNECTED' : 'AWAITING FORZA UDP PACKETS (PORT 5300)')
                  }
                </span>
                <span className="text-[9px] bg-[#1a1a1a] text-[#10b981] border border-[#222] px-2 py-0.2">
                  60 HZ
                </span>
              </div>
              <div className="text-[10px] text-[#666]">
                Captured Packets: <span className="text-white font-bold">{packetCount.toLocaleString()}</span> • Latency: 16.6ms • Protocol: FH Dash (324B)
              </div>
            </div>
          </div>

          {/* Track selector / Manual Driving toggle */}
          {streamSource === 'simulator' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setManualDriveMode(!manualDriveMode)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-colors border flex items-center gap-1.5 ${
                  manualDriveMode
                    ? 'bg-[#ef4444] text-black border-[#ef4444]'
                    : 'bg-[#141414] text-[#888] hover:text-white border-[#262626]'
                }`}
              >
                <Keyboard className="w-3 h-3" />
                {manualDriveMode ? 'Manual Controls: ON (WASD / Arrows)' : 'Manual Controls: OFF'}
              </button>

              {!manualDriveMode && (
                <select
                  value={selectedTrack}
                  onChange={e => setSelectedTrack(e.target.value)}
                  className="bg-[#141414] border border-[#262626] text-[10px] text-white uppercase px-3 py-1.5 focus:outline-none"
                >
                  {TRACK_PROFILES.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Primary Gauges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Velocity */}
          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Velocity</span>
            <div className="text-4xl font-black text-white italic tracking-tighter">
              {telemetry.speedKmh} <span className="text-xs text-[#666] font-normal not-italic">KM/H</span>
            </div>
            <div className="text-xs text-[#888] mt-1 flex justify-between">
              <span>{telemetry.speedMph} MPH</span>
              <span className="text-[#10b981] font-bold">Top: {topSpeedKmh} KM/H</span>
            </div>
          </div>

          {/* Engine RPM & Dyno */}
          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Engine Revs</span>
            <div className="text-4xl font-black text-[#ef4444] italic tracking-tighter">
              {telemetry.rpm} <span className="text-xs text-[#666] font-normal not-italic">RPM</span>
            </div>
            <div className="w-full bg-[#1c1c1c] h-2 mt-2 overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-75 ${
                  telemetry.rpm > 7800 ? 'bg-[#ef4444]' : 'bg-[#eab308]'
                }`}
                style={{ width: `${(telemetry.rpm / telemetry.maxRpm) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Gear & Drivetrain Load */}
          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Transmission</span>
            <div className="text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2">
              <span>GEAR {telemetry.gear}</span>
            </div>
            <div className="text-xs text-[#888] mt-1 flex justify-between">
              <span>Boost: {telemetry.boostPsi} PSI</span>
              <span className="text-[#3b82f6] font-bold">{telemetry.powerHp} HP</span>
            </div>
          </div>

          {/* G-Force Instantaneous */}
          <div className="p-5 bg-[#0e0e0e] border border-[#222]">
            <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Lateral Acceleration</span>
            <div className="text-4xl font-black text-[#10b981] italic tracking-tighter">
              {telemetry.accelX} <span className="text-xs text-[#666] font-normal not-italic">G</span>
            </div>
            <div className="text-xs text-[#888] mt-1 flex justify-between">
              <span>Long: {telemetry.accelY}G</span>
              <span className="text-[#eab308] font-bold">Peak: {maxLateralG}G</span>
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
                G-G Friction Boundary Circle
              </h3>
              <span className="text-[10px] text-[#666]">Load Trail (40f)</span>
            </div>

            <canvas
              ref={ggCanvasRef}
              width={260}
              height={260}
              className="bg-[#080808] border border-[#1a1a1a] rounded-full my-2"
            />

            <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center text-[10px] border-t border-[#1c1c1c] pt-3">
              <div>
                <span className="text-[#666] block uppercase">Lat Load</span>
                <span className="text-white font-bold">{telemetry.accelX} G</span>
              </div>
              <div>
                <span className="text-[#666] block uppercase">Long Load</span>
                <span className="text-white font-bold">{telemetry.accelY} G</span>
              </div>
              <div>
                <span className="text-[#666] block uppercase">Apex Limit</span>
                <span className="text-[#10b981] font-bold">1.50 G</span>
              </div>
            </div>
          </div>

          {/* 4-Corner Thermal & Pressure Heatmap */}
          <div className="lg:col-span-2 bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#ef4444] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ef4444]" />
                4-Corner Thermal Gradient & Tire Dynamics
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-[#666]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3b82f6]"></span> Cold &lt;75°C</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981]"></span> Optimal 85-98°C</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#ef4444]"></span> Hot &gt;105°C</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Left */}
              <div className="p-4 bg-[#080808] border border-[#1a1a1a] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white uppercase">Front Left (FL)</span>
                  <span className="text-[#10b981] font-bold">{telemetry.tirePressureFL} PSI</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777]">
                    <span>Inner: {telemetry.tireTempFL.inner}°C</span>
                    <span>Center: {telemetry.tireTempFL.center}°C</span>
                    <span>Outer: {telemetry.tireTempFL.outer}°C</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-3">
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#eab308] rounded-sm"></div>
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
                  <span className="font-bold text-white uppercase">Front Right (FR)</span>
                  <span className="text-[#10b981] font-bold">{telemetry.tirePressureFR} PSI</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777]">
                    <span>Inner: {telemetry.tireTempFR.inner}°C</span>
                    <span>Center: {telemetry.tireTempFR.center}°C</span>
                    <span>Outer: {telemetry.tireTempFR.outer}°C</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-3">
                    <div className="bg-[#eab308] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
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
                  <span className="font-bold text-white uppercase">Rear Left (RL)</span>
                  <span className="text-[#10b981] font-bold">{telemetry.tirePressureRL} PSI</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777]">
                    <span>Inner: {telemetry.tireTempRL.inner}°C</span>
                    <span>Center: {telemetry.tireTempRL.center}°C</span>
                    <span>Outer: {telemetry.tireTempRL.outer}°C</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-3">
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
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
                  <span className="font-bold text-white uppercase">Rear Right (RR)</span>
                  <span className="text-[#10b981] font-bold">{telemetry.tirePressureRR} PSI</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777]">
                    <span>Inner: {telemetry.tireTempRR.inner}°C</span>
                    <span>Center: {telemetry.tireTempRR.center}°C</span>
                    <span>Outer: {telemetry.tireTempRR.outer}°C</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-3">
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
                    <div className="bg-[#10b981] rounded-sm"></div>
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

        {/* Lower Section: Pedals & Suspension Deflection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver Pedals & Inputs */}
          <div className="bg-[#0e0e0e] border border-[#222] p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white pb-3 border-b border-[#1c1c1c]">
              Driver Pedal & Steering Inputs
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Throttle</span>
                  <span className="text-white font-bold">{telemetry.throttle}%</span>
                </div>
                <div className="w-full bg-[#161616] h-2.5 overflow-hidden">
                  <div className="bg-[#10b981] h-full transition-all duration-75" style={{ width: `${telemetry.throttle}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Braking Pressure</span>
                  <span className="text-white font-bold">{telemetry.brake}%</span>
                </div>
                <div className="w-full bg-[#161616] h-2.5 overflow-hidden">
                  <div className="bg-[#ef4444] h-full transition-all duration-75" style={{ width: `${telemetry.brake}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Steering Angle</span>
                  <span className="text-white font-bold">{telemetry.steer}</span>
                </div>
                <div className="w-full bg-[#161616] h-2.5 overflow-hidden relative">
                  <div 
                    className="bg-[#3b82f6] h-full absolute transition-all duration-75" 
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
              Suspension Travel & Damper Deflection
            </h3>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] text-[#777] uppercase block mb-1">FL</span>
                <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                  <div 
                    className="bg-[#3b82f6] w-full transition-all duration-75"
                    style={{ height: `${(telemetry.suspensionTravelFL / 120) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelFL} mm</span>
              </div>

              <div>
                <span className="text-[10px] text-[#777] uppercase block mb-1">FR</span>
                <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                  <div 
                    className="bg-[#3b82f6] w-full transition-all duration-75"
                    style={{ height: `${(telemetry.suspensionTravelFR / 120) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelFR} mm</span>
              </div>

              <div>
                <span className="text-[10px] text-[#777] uppercase block mb-1">RL</span>
                <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                  <div 
                    className="bg-[#10b981] w-full transition-all duration-75"
                    style={{ height: `${(telemetry.suspensionTravelRL / 120) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelRL} mm</span>
              </div>

              <div>
                <span className="text-[10px] text-[#777] uppercase block mb-1">RR</span>
                <div className="h-28 bg-[#161616] w-full flex flex-col justify-end p-1">
                  <div 
                    className="bg-[#10b981] w-full transition-all duration-75"
                    style={{ height: `${(telemetry.suspensionTravelRR / 120) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-white mt-1 block">{telemetry.suspensionTravelRR} mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Python UDP Bridge Instructions Modal */}
      {showBridgeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-[#333] w-full max-w-2xl p-6 sm:p-8 my-8 relative">
            <button 
              onClick={() => setShowBridgeModal(false)}
              className="absolute right-4 top-4 text-[#666] hover:text-white p-1"
            >
              ✕
            </button>

            <h3 className="text-xl font-black italic text-white uppercase mb-2">
              Forza Horizon UDP Data Out Setup
            </h3>
            <p className="text-xs text-[#777] mb-4 leading-relaxed">
              To stream real-time physics data from Forza Horizon (PC or Xbox) directly into this engineering cockpit, enable Data Out in game and run the Python receiver bridge below:
            </p>

            <div className="space-y-3 mb-5 p-4 bg-[#080808] border border-[#1a1a1a] text-xs text-[#aaa]">
              <div>1. In Forza Horizon: Go to <span className="text-white font-bold">Settings &gt; HUD and Gameplay &gt; Data Out = ON</span></div>
              <div>2. Set <span className="text-[#10b981] font-bold">Data Out IP Address</span> = <span className="text-white">127.0.0.1</span> (or your local IP)</div>
              <div>3. Set <span className="text-[#10b981] font-bold">Data Out IP Port</span> = <span className="text-white">5300</span></div>
              <div>4. Set <span className="text-[#10b981] font-bold">Data Out Packet Format</span> = <span className="text-white">Dash</span></div>
            </div>

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
                  {copiedScript ? 'Copied to Clipboard!' : 'Copy Python Script'}
                </button>
              </div>
              <pre className="p-4 bg-[#050505] border border-[#262626] text-[10px] text-[#10b981] overflow-x-auto max-h-60">
                {pythonBridgeCode}
              </pre>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowBridgeModal(false)}
                className="px-5 py-2 bg-[#ef4444] text-black font-bold text-xs uppercase hover:bg-white transition-colors"
              >
                Close Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
