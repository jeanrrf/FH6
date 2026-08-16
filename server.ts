import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // In-memory live telemetry buffer for Forza UDP streams
  let latestTelemetryPacket: any = null;
  let lastTelemetryTimestamp = 0;
  let telemetryPacketCount = 0;

  // POST endpoint for UDP bridge forwarder or simulator
  app.post("/api/telemetry/packet", (req, res) => {
    latestTelemetryPacket = req.body;
    lastTelemetryTimestamp = Date.now();
    telemetryPacketCount++;
    res.json({ status: "received", count: telemetryPacketCount });
  });

  // GET endpoint to fetch latest live telemetry
  app.get("/api/telemetry/latest", (_req, res) => {
    const isLive = Date.now() - lastTelemetryTimestamp < 3000;
    res.json({
      connected: isLive,
      lastSeen: lastTelemetryTimestamp,
      packetCount: telemetryPacketCount,
      data: latestTelemetryPacket
    });
  });

  // AI Race Engineer Route
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Helper: Offline Physics Formula Calculator for Forza Horizon 6
    const generateOfflineEngineeringResponse = (userQuery: string, ctx: any) => {
      const car = ctx?.car || {
        brand: "Forza Motorsport",
        model: "Spec GT",
        carClass: "A",
        pi: 800,
        power: 450,
        weight: 1350,
        drivetrain: "AWD"
      };

      const weight = Number(car.weight) || 1350;
      const power = Number(car.power) || 400;
      const drivetrain = (car.drivetrain || "AWD").toUpperCase();
      const isAwd = drivetrain === "AWD";
      const isRwd = drivetrain === "RWD";
      const frontWeightBias = 0.52; // standard front-engine 52%

      // Physics Formula calculations
      // ARB: Front = (Bias * TotalStiffness) + Delta
      const totalArb = 55;
      const frontArb = +(frontWeightBias * totalArb + 0.5).toFixed(1);
      const rearArb = +(totalArb - frontArb + 1.2).toFixed(1);

      // Springs: base frequency
      const frontSprings = +((weight * 0.52 * 0.18)).toFixed(1);
      const rearSprings = +((weight * 0.48 * 0.17)).toFixed(1);

      // Damping: Rebound 55-65% higher than bump
      const rebFront = 10.4;
      const rebRear = 9.8;
      const bumpFront = 6.2;
      const bumpRear = 5.7;

      // Camber & Alignment
      const camberFront = -1.8;
      const camberRear = -1.3;
      const toeFront = 0.0;
      const toeRear = -0.1;
      const caster = 6.2;

      // Differential
      const diffRearAccel = isRwd ? (power > 600 ? 55 : 68) : 65;
      const diffRearDecel = isRwd ? 28 : 20;
      const diffFrontAccel = isAwd ? 25 : 0;
      const diffFrontDecel = isAwd ? 0 : 0;
      const diffCenter = isAwd ? 65 : 100;

      // Transmission Final Drive
      const finalDrive = +(3.65 - (power > 500 ? 0.25 : 0)).toFixed(2);

      return `### 🏎️ CHASSIS DYNAMICS TELEMETRY REPORT
**Target Vehicle:** ${car.brand} ${car.model} (${car.carClass}${car.pi} • ${car.power} HP • ${car.weight} kg • ${drivetrain})

#### 📊 Mechanical Setup Diagnostics:
- **Anti-Roll Bars (ARB):** Calibrated to **${frontArb} Front / ${rearArb} Rear** to counteract high-speed turn-in understeer and promote neutral corner exit rotation.
- **Spring Stiffness & Travel:** Front springs calculated at **${frontSprings} kgf/mm** and Rear at **${rearSprings} kgf/mm** based on dynamic axle load distribution. Ride height set to **11.5cm Front / 12.0cm Rear** for low center of gravity while maintaining bump-stop clearance.
- **Damping Ratios:** Rebound set at **${rebFront} / ${rebRear}** with bump damping at **${bumpFront} / ${bumpRear}** (approx 60% bump-to-rebound ratio) for optimal transient curb stability.
- **Differential Lock:** ${isAwd ? `AWD Center power split tuned to **${diffCenter}% Rear** with **${diffRearAccel}% Rear Accel / ${diffRearDecel}% Rear Decel** to prevent power-on understeer.` : `RWD Accel set to **${diffRearAccel}%** to maximize traction off apex without snap oversteer.`}
- **Tire Pressure:** Baseline cold pressure set to **28.5 PSI** to reach target **33.0 PSI hot track temperature**.

\`\`\`json:tune
{
  "tires": { "frontPSI": 28.5, "rearPSI": 28.5 },
  "gearing": { "finalDrive": ${finalDrive}, "gear1": 3.10, "gear2": 2.15, "gear3": 1.60, "gear4": 1.25, "gear5": 1.00, "gear6": 0.82 },
  "alignment": { "camberFront": ${camberFront}, "camberRear": ${camberRear}, "toeFront": ${toeFront}, "toeRear": ${toeRear}, "caster": ${caster} },
  "antiRollBars": { "front": ${frontArb}, "rear": ${rearArb} },
  "springs": { "frontSprings": ${frontSprings}, "rearSprings": ${rearSprings}, "rideHeightFront": 11.5, "rideHeightRear": 12.0 },
  "damping": { "reboundFront": ${rebFront}, "reboundRear": ${rebRear}, "bumpFront": ${bumpFront}, "bumpRear": ${bumpRear} },
  "aero": { "frontDownforce": 95, "rearDownforce": 145 },
  "brake": { "balanceFront": 50, "pressure": 100 },
  "differential": { "frontAccel": ${diffFrontAccel}, "frontDecel": ${diffFrontDecel}, "rearAccel": ${diffRearAccel}, "rearDecel": ${diffRearDecel}, "centerBalance": ${diffCenter} }
}
\`\`\`

*Setup sheet generated by the Forza Chassis Engineering Core. Click **Save to Car** or **Copy Setup** to apply.*`;
    };

    try {
      // 1. Sanitize incoming conversation history
      const rawMsgs = Array.isArray(messages) ? messages : [];
      
      // Locate the first user message
      const firstUserIdx = rawMsgs.findIndex((m: any) => m.role === 'user');
      let validMsgs = firstUserIdx >= 0 ? rawMsgs.slice(firstUserIdx) : [];

      if (validMsgs.length === 0) {
        validMsgs = [{ role: 'user', parts: [{ text: 'Calculate optimal vehicle tune and telemetry setup.' }] }];
      }

      // Convert to clean Gemini contents format and ensure strict user/model alternation
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

      const lastUserPrompt = formattedContents.length > 0 ? formattedContents[formattedContents.length - 1].parts[0].text : '';

      // If no API key is available, use the physics formula engine fallback immediately
      if (!apiKey) {
        console.warn("GEMINI_API_KEY missing - using Forza Horizon physics calculation engine fallback.");
        const fallbackText = generateOfflineEngineeringResponse(lastUserPrompt, context);
        return res.json({ text: fallbackText });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const systemInstruction = `You are the Virtual Race Engineer and Vehicle Dynamics Specialist for Forza Horizon 6 (FH6 AI Engineering Cockpit).
Your role is to act as a world-class motorsport data engineer, chassis tuner, and performance strategist.
You provide precise, actionable, numbers-driven mechanical advice based directly on Forza Horizon's physics engine and vehicle dynamics equations.

CORE EXPERTISE & FORMULAS:
1. Anti-Roll Bars (ARB):
   - Formula: Front_ARB = (Front_Weight_Bias% * Total_Roll_Stiffness) + Balance_Delta
   - To fix corner entry understeer: Soften front ARB or stiffen rear ARB.
   - To fix snap oversteer on corner exit: Soften rear ARB or increase rear downforce.
2. Springs & Ride Height:
   - Base Spring Stiffness = (Car_Weight_kg * Weight_Distribution_Ratio) * Frequency_Factor.
   - Low ride height increases mechanical grip via lower center of gravity; ensure minimum 10-15mm suspension travel above bump-stops.
3. Damping (Rebound & Bump):
   - Rebound should generally be 55-65% higher than Bump (e.g. Rebound 10.5 / Bump 6.2).
   - Stiff front rebound improves transient steering response on turn-in.
4. Alignment (Camber, Caster, Toe):
   - Front Camber: Typically -1.2° to -2.5° (adjust so Inside tire temp is 3-5°C warmer than Outside under hard cornering).
   - Caster: 5.5° to 7.0° to increase dynamic negative camber while steering without sacrificing straight-line braking grip.
   - Rear Toe: 0.0° to -0.2° (toe-in) for straight-line and high-speed stability.
5. Differential Tuning:
   - AWD: Front Accel 20-35%, Front Decel 0-5%, Rear Accel 50-75%, Rear Decel 15-30%, Center Bias 60-70% Rear.
   - RWD: Accel 45-70% (lower for high HP loose surface, higher for high downforce grip), Decel 20-35% (higher decel stabilizes braking into corners).
   - FWD: Accel 30-50%, Decel 0-10%.
6. Gearing / Final Drive:
   - Match 1st gear for minimum wheelspin off launch.
   - Final Drive scaled so top gear redlines just before the longest straight on target circuit.
7. Tire Pressures:
   - Cold setting should reach 32.5 - 33.5 PSI hot operating temperature.

RESPONSE FORMATTING GUIDELINES:
- When recommending a setup or tune change, format the key values clearly in structured markdown tables or bulleted parameter sheets with exact numbers.
- If a full tune is generated, include a standardized JSON codeblock tagged with \`\`\`json:tune\`\`\` so the cockpit can automatically parse and 1-click apply it to the vehicle:
Example:
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
- Keep text direct, sharp, technical, and formatted for high scannability.

ACTIVE TELEMETRY & GARAGE CONTEXT:
${context ? JSON.stringify(context, null, 2) : "No active vehicle context selected."}`;

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
        responseText = response.text || "No response generated.";
      } catch (err: any) {
        console.warn("Retrying with gemini-2.5-flash fallback:", err?.message);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.35,
            },
          });
          responseText = fallbackResponse.text || "No response generated.";
        } catch (innerErr: any) {
          console.warn("Gemini model call failed, calculating physics tune locally:", innerErr?.message);
          responseText = generateOfflineEngineeringResponse(lastUserPrompt, context);
        }
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("AI Engineer fatal error:", error);
      const fallback = generateOfflineEngineeringResponse("chassis tune", context);
      res.json({ text: fallback });
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
