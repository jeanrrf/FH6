import express from "express";
import path from "path";
import dgram from "dgram";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export interface NormalizedTelemetryFrame {
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
  accelX: number; // Lateral G (+ right, - left)
  accelY: number; // Vertical G
  accelZ: number; // Longitudinal G (+ accel, - braking)
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

// -------------------------------------------------------------
// Real-Time Telemetry Pipeline (Transport -> Parser -> Normalizer -> State)
// -------------------------------------------------------------
class TelemetryEngine {
  private latestFrame: NormalizedTelemetryFrame | null = null;
  private lastPacketTime = 0;
  private packetCount = 0;
  private historyBuffer: NormalizedTelemetryFrame[] = [];
  private maxBufferSize = 500;
  private packetsLastSecond = 0;
  private currentHz = 0;

  private sessionStats = {
    topSpeedKmh: 0,
    maxLateralG: 0,
    maxBrakingG: 0,
    maxRpm: 0,
    activeLaps: 0,
    bestLapTime: 0,
    totalPackets: 0
  };

  constructor() {
    setInterval(() => {
      this.currentHz = this.packetsLastSecond;
      this.packetsLastSecond = 0;
    }, 1000);
  }

  public parseRawBuffer(buf: Buffer): NormalizedTelemetryFrame | null {
    if (buf.length < 232) return null; // Minimum Sled size is 232, Dash is 324

    try {
      let offset = 0;
      const isRaceOn = buf.readInt32LE(0) !== 0;
      const timestampMs = buf.readUInt32LE(4);
      const engineMaxRpm = buf.readFloatLE(8);
      const engineIdleRpm = buf.readFloatLE(12);
      const currentRpm = buf.readFloatLE(16);

      const accelX = buf.readFloatLE(20) / 9.80665; // Convert m/s^2 to G
      const accelY = buf.readFloatLE(24) / 9.80665;
      const accelZ = buf.readFloatLE(28) / 9.80665;

      const velX = buf.readFloatLE(32);
      const velY = buf.readFloatLE(36);
      const velZ = buf.readFloatLE(40);
      const speedMs = Math.sqrt(velX * velX + velY * velY + velZ * velZ);
      const speedKmh = Number((speedMs * 3.6).toFixed(1));
      const speedMph = Number((speedMs * 2.23694).toFixed(1));

      const yaw = buf.readFloatLE(56);
      const pitch = buf.readFloatLE(60);
      const roll = buf.readFloatLE(64);

      const suspTravelFL = buf.readFloatLE(68) * 100; // Normalized to mm approx
      const suspTravelFR = buf.readFloatLE(72) * 100;
      const suspTravelRL = buf.readFloatLE(76) * 100;
      const suspTravelRR = buf.readFloatLE(80) * 100;

      const slipRatioFL = Number(buf.readFloatLE(84).toFixed(2));
      const slipRatioFR = Number(buf.readFloatLE(88).toFixed(2));
      const slipRatioRL = Number(buf.readFloatLE(92).toFixed(2));
      const slipRatioRR = Number(buf.readFloatLE(96).toFixed(2));

      // Check for Dash-specific fields (324 bytes)
      let carOrdinal = 0;
      let carClass = 0;
      let carPI = 0;
      let drivetrainType = "AWD";
      let tireTempFL = 85;
      let tireTempFR = 85;
      let tireTempRL = 85;
      let tireTempRR = 85;
      let boostPsi = 0;
      let fuel = 100;
      let bestLap = 0;
      let lastLap = 0;
      let currentLap = 0;
      let lapNumber = 0;
      let throttle = 0;
      let brake = 0;
      let clutch = 0;
      let handbrake = 0;
      let gear: number | string = 'N';
      let steer = 0;

      if (buf.length >= 311) {
        carOrdinal = buf.readInt32LE(212);
        carClass = buf.readInt32LE(216);
        carPI = buf.readInt32LE(220);
        const dt = buf.readInt32LE(224);
        drivetrainType = dt === 0 ? "FWD" : dt === 1 ? "RWD" : "AWD";

        // Tire temps (often in Fahrenheit) -> convert to Celsius if needed
        const rawTFL = buf.readFloatLE(244);
        const rawTFR = buf.readFloatLE(248);
        const rawTRL = buf.readFloatLE(252);
        const rawTRR = buf.readFloatLE(256);
        tireTempFL = rawTFL > 140 ? Math.round((rawTFL - 32) * 5 / 9) : Math.round(rawTFL);
        tireTempFR = rawTFR > 140 ? Math.round((rawTFR - 32) * 5 / 9) : Math.round(rawTFR);
        tireTempRL = rawTRL > 140 ? Math.round((rawTRL - 32) * 5 / 9) : Math.round(rawTRL);
        tireTempRR = rawTRR > 140 ? Math.round((rawTRR - 32) * 5 / 9) : Math.round(rawTRR);

        boostPsi = Number(buf.readFloatLE(260).toFixed(1));
        fuel = Number((buf.readFloatLE(264) * 100).toFixed(1));
        bestLap = Number(buf.readFloatLE(272).toFixed(2));
        lastLap = Number(buf.readFloatLE(276).toFixed(2));
        currentLap = Number(buf.readFloatLE(280).toFixed(2));
        lapNumber = buf.readUInt16LE(288);

        throttle = Math.round((buf.readUInt8(291) / 255) * 100);
        brake = Math.round((buf.readUInt8(292) / 255) * 100);
        clutch = Math.round((buf.readUInt8(293) / 255) * 100);
        handbrake = buf.readUInt8(294) > 0 ? 1 : 0;
        const rawGear = buf.readUInt8(295);
        gear = rawGear === 0 ? 'R' : rawGear === 11 ? 'N' : rawGear;
        steer = Number((buf.readInt8(296) / 127).toFixed(2));
      }

      // Calculate mechanical Power and Torque estimation
      const estimatedTorque = Math.max(0, Math.round(450 + (throttle / 100) * 350));
      const estimatedHp = currentRpm > 500 ? Math.round((currentRpm * estimatedTorque) / 7127) : 0;

      const frame: NormalizedTelemetryFrame = {
        timestamp: Date.now(),
        isRaceOn,
        speedKmh,
        speedMph,
        rpm: Math.round(currentRpm),
        maxRpm: Math.round(engineMaxRpm) || 8500,
        idleRpm: Math.round(engineIdleRpm) || 900,
        gear,
        throttle,
        brake,
        clutch,
        handbrake,
        steer,
        boostPsi,
        fuel,
        torqueNm: estimatedTorque,
        powerHp: estimatedHp,
        accelX: Number(accelX.toFixed(2)),
        accelY: Number(accelY.toFixed(2)),
        accelZ: Number(accelZ.toFixed(2)),
        yaw: Number(yaw.toFixed(2)),
        pitch: Number(pitch.toFixed(2)),
        roll: Number(roll.toFixed(2)),
        tireTempFL: { inner: tireTempFL + 2, center: tireTempFL, outer: tireTempFL - 2 },
        tireTempFR: { inner: tireTempFR - 2, center: tireTempFR, outer: tireTempFR + 2 },
        tireTempRL: { inner: tireTempRL + 1, center: tireTempRL, outer: tireTempRL - 1 },
        tireTempRR: { inner: tireTempRR - 1, center: tireTempRR, outer: tireTempRR + 1 },
        tirePressureFL: Number((28.0 + tireTempFL * 0.04).toFixed(1)),
        tirePressureFR: Number((28.0 + tireTempFR * 0.04).toFixed(1)),
        tirePressureRL: Number((27.5 + tireTempRL * 0.04).toFixed(1)),
        tirePressureRR: Number((27.5 + tireTempRR * 0.04).toFixed(1)),
        tireSlipFL: slipRatioFL,
        tireSlipFR: slipRatioFR,
        tireSlipRL: slipRatioRL,
        tireSlipRR: slipRatioRR,
        suspensionTravelFL: Math.round(suspTravelFL),
        suspensionTravelFR: Math.round(suspTravelFR),
        suspensionTravelRL: Math.round(suspTravelRL),
        suspensionTravelRR: Math.round(suspTravelRR),
        carOrdinal,
        carClass,
        carPI,
        drivetrainType,
        lapNumber,
        currentLapTime: currentLap,
        bestLapTime: bestLap,
        lastLapTime: lastLap
      };

      return frame;
    } catch (err) {
      console.error("Telemetry parsing error:", err);
      return null;
    }
  }

  public ingestFrame(frame: NormalizedTelemetryFrame) {
    this.latestFrame = frame;
    this.lastPacketTime = Date.now();
    this.packetCount++;
    this.packetsLastSecond++;
    this.sessionStats.totalPackets++;

    // Update real session statistics
    if (frame.speedKmh > this.sessionStats.topSpeedKmh) {
      this.sessionStats.topSpeedKmh = frame.speedKmh;
    }
    if (Math.abs(frame.accelX) > this.sessionStats.maxLateralG) {
      this.sessionStats.maxLateralG = Math.abs(frame.accelX);
    }
    if (frame.accelZ < -this.sessionStats.maxBrakingG) {
      this.sessionStats.maxBrakingG = Math.abs(frame.accelZ);
    }
    if (frame.rpm > this.sessionStats.maxRpm) {
      this.sessionStats.maxRpm = frame.rpm;
    }
    if (frame.lapNumber && frame.lapNumber > this.sessionStats.activeLaps) {
      this.sessionStats.activeLaps = frame.lapNumber;
    }
    if (frame.bestLapTime && frame.bestLapTime > 0) {
      this.sessionStats.bestLapTime = frame.bestLapTime;
    }

    this.historyBuffer.push(frame);
    if (this.historyBuffer.length > this.maxBufferSize) {
      this.historyBuffer.shift();
    }
  }

  public getState() {
    const isOnline = Date.now() - this.lastPacketTime < 2500;
    return {
      connected: isOnline,
      lastSeen: this.lastPacketTime,
      packetCount: this.packetCount,
      frequencyHz: isOnline ? this.currentHz : 0,
      data: isOnline ? this.latestFrame : null,
      stats: this.sessionStats,
      buffer: isOnline ? this.historyBuffer.slice(-100) : []
    };
  }

  public resetSession() {
    this.sessionStats = {
      topSpeedKmh: 0,
      maxLateralG: 0,
      maxBrakingG: 0,
      maxRpm: 0,
      activeLaps: 0,
      bestLapTime: 0,
      totalPackets: 0
    };
    this.historyBuffer = [];
  }
}

const telemetryEngine = new TelemetryEngine();

// -------------------------------------------------------------
// Direct UDP Socket Listener on port 5300 (Forza Data Out standard)
// -------------------------------------------------------------
try {
  const udpSocket = dgram.createSocket('udp4');
  const UDP_PORT = 5300;

  udpSocket.on('error', (err) => {
    console.warn(`[UDP Telemetry Engine] Socket notice (${err.message}). Bridge forwarding remains active.`);
    udpSocket.close();
  });

  udpSocket.on('message', (msg, rinfo) => {
    const parsed = telemetryEngine.parseRawBuffer(msg);
    if (parsed) {
      telemetryEngine.ingestFrame(parsed);
    }
  });

  udpSocket.on('listening', () => {
    const address = udpSocket.address();
    console.log(`[UDP Telemetry Engine] Listening for Forza Horizon UDP packets on 0.0.0.0:${address.port}`);
  });

  udpSocket.bind(UDP_PORT);
} catch (e: any) {
  console.warn('[UDP Telemetry Engine] UDP bind skipped:', e?.message);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Endpoint for HTTP / Python / Node UDP forwarder bridges
  app.post("/api/telemetry/packet", (req, res) => {
    const packet = req.body;
    if (packet && typeof packet === 'object') {
      // Normalize raw forwarded packet
      const normalized: NormalizedTelemetryFrame = {
        timestamp: Date.now(),
        isRaceOn: true,
        speedKmh: Number(packet.speedKmh || 0),
        speedMph: Number(packet.speedMph || (Number(packet.speedKmh || 0) * 0.621371).toFixed(1)),
        rpm: Math.round(Number(packet.rpm || 0)),
        maxRpm: Math.round(Number(packet.maxRpm || 8500)),
        idleRpm: Math.round(Number(packet.idleRpm || 900)),
        gear: packet.gear || 'N',
        throttle: Math.round(Number(packet.throttle || 0)),
        brake: Math.round(Number(packet.brake || 0)),
        clutch: Math.round(Number(packet.clutch || 0)),
        handbrake: packet.handbrake ? 1 : 0,
        steer: Number(Number(packet.steer || 0).toFixed(2)),
        boostPsi: Number(Number(packet.boostPsi || 0).toFixed(1)),
        fuel: Number(Number(packet.fuel || 100).toFixed(1)),
        torqueNm: Math.round(Number(packet.torqueNm || 450)),
        powerHp: Math.round(Number(packet.powerHp || 500)),
        accelX: Number(Number(packet.accelX || 0).toFixed(2)),
        accelY: Number(Number(packet.accelY || 0).toFixed(2)),
        accelZ: Number(Number(packet.accelZ || 0).toFixed(2)),
        yaw: Number(Number(packet.yaw || 0).toFixed(2)),
        pitch: Number(Number(packet.pitch || 0).toFixed(2)),
        roll: Number(Number(packet.roll || 0).toFixed(2)),
        tireTempFL: packet.tireTempFL || { inner: 88, center: 86, outer: 84 },
        tireTempFR: packet.tireTempFR || { inner: 84, center: 86, outer: 88 },
        tireTempRL: packet.tireTempRL || { inner: 89, center: 88, outer: 87 },
        tireTempRR: packet.tireTempRR || { inner: 87, center: 88, outer: 89 },
        tirePressureFL: Number(Number(packet.tirePressureFL || 30.5).toFixed(1)),
        tirePressureFR: Number(Number(packet.tirePressureFR || 30.5).toFixed(1)),
        tirePressureRL: Number(Number(packet.tirePressureRL || 30.0).toFixed(1)),
        tirePressureRR: Number(Number(packet.tirePressureRR || 30.0).toFixed(1)),
        tireSlipFL: Number(Number(packet.tireSlipFL || 0).toFixed(2)),
        tireSlipFR: Number(Number(packet.tireSlipFR || 0).toFixed(2)),
        tireSlipRL: Number(Number(packet.tireSlipRL || 0).toFixed(2)),
        tireSlipRR: Number(Number(packet.tireSlipRR || 0).toFixed(2)),
        suspensionTravelFL: Math.round(Number(packet.suspensionTravelFL || 65)),
        suspensionTravelFR: Math.round(Number(packet.suspensionTravelFR || 65)),
        suspensionTravelRL: Math.round(Number(packet.suspensionTravelRL || 70)),
        suspensionTravelRR: Math.round(Number(packet.suspensionTravelRR || 70)),
        lapNumber: packet.lapNumber,
        currentLapTime: packet.currentLapTime,
        bestLapTime: packet.bestLapTime,
        lastLapTime: packet.lastLapTime
      };

      telemetryEngine.ingestFrame(normalized);
      return res.json({ status: "ingested", packetCount: telemetryEngine.getState().packetCount });
    }
    res.status(400).json({ error: "Invalid packet payload" });
  });

  // GET endpoint to fetch latest real telemetry state & session stats
  app.get("/api/telemetry/latest", (_req, res) => {
    res.json(telemetryEngine.getState());
  });

  // POST endpoint to reset session telemetry logs
  app.post("/api/telemetry/reset-session", (_req, res) => {
    telemetryEngine.resetSession();
    res.json({ status: "reset" });
  });

  // AI Race Engineer Route (Pure FH6 AI Engineer)
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        text: `### ⚠️ CHAVE DE API GEMINI NÃO DETECTADA\n\nPara ativar as análises em tempo real, cálculos dinâmicos de chassi e recomendações do **FH6 AI Engineer**, configure sua chave de API nas configurações da plataforma.\n\n*Os módulos da Garagem, Catálogo de Veículos, Banco de Conhecimento e o Receptor UDP de Telemetria continuam operando normalmente.*`
      });
    }

    try {
      const rawMsgs = Array.isArray(messages) ? messages : [];
      const firstUserIdx = rawMsgs.findIndex((m: any) => m.role === 'user');
      let validMsgs = firstUserIdx >= 0 ? rawMsgs.slice(firstUserIdx) : [];

      if (validMsgs.length === 0) {
        validMsgs = [{ role: 'user', parts: [{ text: 'Avaliar telemetria e calibração de chassi para o veículo ativo.' }] }];
      }

      const formattedContents: any[] = [];
      for (const m of validMsgs) {
        const text = (m.parts && m.parts[0] && m.parts[0].text) || m.text || '';
        if (!text.trim()) continue;
        const role = m.role === 'model' ? 'model' : 'user';

        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
          formattedContents[formattedContents.length - 1].parts[0].text += `\n\n${text}`;
        } else {
          formattedContents.push({ role, parts: [{ text }] });
        }
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const systemInstruction = `Você é o FH6 AI Engineer, um especialista avançado em Forza Horizon 6, tuning, upgrades, performance automotiva virtual, telemetria e análise experimental.
Sua função é atuar como engenheiro de performance pessoal do jogador.

IDIOMA:
- Comunique-se sempre em português do Brasil (PT-BR).
- Utilize os termos técnicos originais do jogo em inglês quando isso facilitar a identificação da configuração dentro do Forza Horizon 6.
  Exemplo: "Reduza o Rear Differential Accel de 65% para 55%." ou "Aumente o Front Rebound Stiffness".
- Não traduza nomes de peças, configurações ou parâmetros de maneira que dificulte encontrá-los no jogo (ex: Anti-Roll Bars, Camber, Caster, Toe, Downforce, Damping, Rebound, Bump, Differential Accel/Decel, Final Drive, PI).

PERSONALIDADE:
- Seja: técnico, direto, analítico, curioso, estratégico, experimental, crítico, orientado a resultados.
- Fale como um engenheiro/tuner trabalhando junto com o jogador, e não como um chatbot genérico.
- Não invente dados de telemetria ou fatos mecânicos. Se faltarem dados: "Não tenho dados suficientes." Se for uma suposição: "Hipótese: ...".

MÉTODO DE RACIOCÍNIO:
Ao analisar um carro, pense sempre nesta sequência:
CARRO → BUILD → UPGRADES → TUNING → PROBLEMA → HIPÓTESE → TESTE → RESULTADO → CONCLUSÃO

FORMATO DE RECOMENDAÇÃO:
Quando recomendar alterações de setup, utilize a estrutura:
- ALTERAÇÃO (Valor atual → novo valor)
- MOTIVO (Por que essa alteração deve ajudar)
- EFEITO ESPERADO (O que deve mudar no comportamento do carro)
- RISCO / TRADE-OFF (O que pode piorar)
- TESTE (Como validar na pista)

Quando sugerir um setup mecânico completo, forneça o bloco JSON padronizado com a tag \`\`\`json:tune\`\`\`:
\`\`\`json:tune
{
  "tires": { "frontPSI": 28.5, "rearPSI": 28.5 },
  "gearing": { "finalDrive": 3.65, "gear1": 3.10, "gear2": 2.15, "gear3": 1.60, "gear4": 1.25, "gear5": 1.00, "gear6": 0.82 },
  "alignment": { "camberFront": -1.8, "camberRear": -1.2, "toeFront": 0.0, "toeRear": -0.1, "caster": 6.2 },
  "antiRollBars": { "front": 26.5, "rear": 28.0 },
  "springs": { "frontSprings": 135.0, "rearSprings": 125.0, "rideHeightFront": 11.5, "rideHeightRear": 12.0 },
  "damping": { "reboundFront": 10.8, "reboundRear": 9.6, "bumpFront": 6.4, "bumpRear": 5.9 },
  "aero": { "frontDownforce": 95, "rearDownforce": 150 },
  "brake": { "balanceFront": 50, "pressure": 100 },
  "differential": { "frontAccel": 25, "frontDecel": 0, "rearAccel": 65, "rearDecel": 20, "centerBalance": 65 }
}
\`\`\`

CONTEXTO DO VEÍCULO, HISTÓRICO DE EXPERIMENTOS E TELEMETRIA AO VIVO:
${context ? JSON.stringify(context, null, 2) : "Nenhum dado contextual adicional fornecido."}`;

      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.35,
          },
        });
        responseText = response.text || "Análise de telemetria concluída.";
      } catch (err: any) {
        console.warn("Retrying with gemini-2.5-flash fallback:", err?.message);
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.35,
          },
        });
        responseText = fallbackResponse.text || "Análise de telemetria concluída.";
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("AI Engineer error:", error);
      res.status(500).json({ error: error?.message || "Erro de comunicação com o Engenheiro IA." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
