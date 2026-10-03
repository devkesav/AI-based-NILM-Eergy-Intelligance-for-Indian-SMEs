import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Factory, 
  Activity, 
  Layers, 
  Github, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Terminal,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  Cpu,
  Cog
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { KPICards } from './components/KPICards';
import { WaveformChart } from './components/WaveformChart';
import { MachineTable, MachineRow } from './components/MachineTable';
import { EnergyOpportunities, OpportunityItem } from './components/EnergyOpportunities';
import { PaybackCalculator } from './components/PaybackCalculator';
import { SimulationControls } from './components/SimulationControls';
import { ArchitectureModal } from './components/ArchitectureModal';

interface WaveformPoint {
  time: number;
  power: number;
  voltage: number;
  current: number;
  pf: number;
}

const INITIAL_MACHINES: MachineRow[] = [
  {
    id: 'motor_1',
    name: 'Induction Motor',
    criticality: 'HIGH',
    actualKw: 0.0,
    estimatedKw: 0.0,
    energyKwh: 0.0,
    runtimeH: 0.0,
    idleH: 0.0,
    state: 'OFF',
    status: 'NORMAL',
    anomalyScore: 6,
    confidence: 0.94,
    baselineKw: 4.0,
  },
  {
    id: 'pump_1',
    name: 'Cooling / Sump Pump',
    criticality: 'MEDIUM',
    actualKw: 0.0,
    estimatedKw: 0.0,
    energyKwh: 0.0,
    runtimeH: 0.0,
    idleH: 0.0,
    state: 'OFF',
    status: 'NORMAL',
    anomalyScore: 8,
    confidence: 0.92,
    baselineKw: 2.2,
  },
  {
    id: 'compressor_1',
    name: 'Air Compressor',
    criticality: 'HIGH',
    actualKw: 0.0,
    estimatedKw: 0.0,
    energyKwh: 0.0,
    runtimeH: 0.0,
    idleH: 0.0,
    state: 'OFF',
    status: 'NORMAL',
    anomalyScore: 10,
    confidence: 0.95,
    baselineKw: 5.5,
  },
  {
    id: 'cnc_1',
    name: 'CNC Machine',
    criticality: 'HIGH',
    actualKw: 0.0,
    estimatedKw: 0.0,
    energyKwh: 0.0,
    runtimeH: 0.0,
    idleH: 0.0,
    state: 'OFF',
    status: 'NORMAL',
    anomalyScore: 5,
    confidence: 0.96,
    baselineKw: 4.0,
  },
  {
    id: 'furnace_1',
    name: 'Furnace / Heater',
    criticality: 'LOW',
    actualKw: 0.0,
    estimatedKw: 0.0,
    energyKwh: 0.0,
    runtimeH: 0.0,
    idleH: 0.0,
    state: 'OFF',
    status: 'NORMAL',
    anomalyScore: 4,
    confidence: 0.93,
    baselineKw: 5.0,
  },
];

export default function App() {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [tariff, setTariff] = useState<number>(8.0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showGitHelper, setShowGitHelper] = useState<boolean>(false);

  const [machines, setMachines] = useState<MachineRow[]>(INITIAL_MACHINES);
  const [waveform, setWaveform] = useState<WaveformPoint[]>([]);
  const [productionUnits, setProductionUnits] = useState<number>(0);
  const [totalEnergyKwh, setTotalEnergyKwh] = useState<number>(0);
  const [verifiedSavingsKwhDay, setVerifiedSavingsKwhDay] = useState<number>(42.0);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  // Telemetry references
  const machinesRef = useRef(machines);
  machinesRef.current = machines;

  // Staged Startup Sequence on simulation clock
  const updateMachineStatesForTime = (time: number, prevMachines: MachineRow[]): MachineRow[] => {
    return prevMachines.map((m) => {
      // Auto-stage machines on initial startup if they are OFF
      if (m.state === 'OFF') {
        if (m.id === 'motor_1' && time >= 2) return { ...m, state: 'STARTING' };
        if (m.id === 'pump_1' && time >= 6) return { ...m, state: 'STARTING' };
        if (m.id === 'cnc_1' && time >= 10) return { ...m, state: 'RUNNING' };
        if (m.id === 'compressor_1' && time >= 14) return { ...m, state: 'STARTING' };
        if (m.id === 'furnace_1' && time >= 18) return { ...m, state: 'RUNNING' };
      }
      if (m.state === 'STARTING') {
        // Transition STARTING -> RUNNING after short transient
        if (m.id === 'motor_1' && time >= 5) return { ...m, state: 'RUNNING' };
        if (m.id === 'pump_1' && time >= 9) return { ...m, state: 'RUNNING' };
        if (m.id === 'compressor_1' && time >= 17) return { ...m, state: 'RUNNING' };
      }
      return m;
    });
  };

  // Main simulation tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimTime((prevTime) => {
        const nextTime = prevTime + speed;
        const dtHours = speed / 3600;

        // Stage machines
        const updatedMachines = updateMachineStatesForTime(nextTime, machinesRef.current);

        let activePowerSum = 0;
        let reactivePowerSum = 0;
        let activeUnitsInc = 0;

        const nextMachineList = updatedMachines.map((m) => {
          let baseKw = 0;
          switch (m.state) {
            case 'STARTING':
              baseKw = m.id === 'compressor_1' ? 9.5 : m.id === 'motor_1' ? 8.2 : 4.2;
              break;
            case 'RUNNING':
              baseKw = m.baselineKw + (Math.random() - 0.5) * 0.4;
              break;
            case 'IDLE':
              baseKw = m.id === 'pump_1' ? 0.35 : m.id === 'compressor_1' ? 1.5 : 1.0;
              break;
            case 'ABNORMAL':
              baseKw = m.id === 'compressor_1' ? 8.2 : m.id === 'motor_1' ? 9.2 : 7.2;
              break;
            case 'OFF':
            default:
              baseKw = 0.0;
          }

          // Add realistic high-frequency electrical jitter
          const actual = baseKw > 0 ? Math.max(0.05, baseKw + (Math.random() - 0.5) * 0.15) : 0;
          // NILM Seq2Point estimation with slight neural variance
          const estimated = actual > 0 ? Math.max(0.05, actual + (Math.random() - 0.5) * 0.22) : (Math.random() < 0.03 ? 0.1 : 0);

          // Anomaly scoring
          let anomalyScore = m.anomalyScore;
          let status: 'NORMAL' | 'REVIEW' | 'WARNING' = 'NORMAL';

          if (m.state === 'ABNORMAL') {
            anomalyScore = Math.min(95, anomalyScore + 4 * speed);
            status = 'WARNING';
          } else if (m.state === 'IDLE' && m.idleH > 0.02) {
            anomalyScore = Math.min(75, anomalyScore + 2 * speed);
            status = 'REVIEW';
          } else {
            anomalyScore = Math.max(8, anomalyScore - 1 * speed);
            status = 'NORMAL';
          }

          const newEnergy = m.energyKwh + actual * dtHours;
          const newRuntime = m.state === 'RUNNING' || m.state === 'ABNORMAL' ? m.runtimeH + dtHours : m.runtimeH;
          const newIdle = m.state === 'IDLE' ? m.idleH + dtHours : m.idleH;

          activePowerSum += actual;
          reactivePowerSum += actual * 0.6; // rough 0.85 PF

          if (m.state === 'RUNNING') activeUnitsInc += 1;

          return {
            ...m,
            actualKw: actual,
            estimatedKw: estimated,
            energyKwh: newEnergy,
            runtimeH: newRuntime,
            idleH: newIdle,
            anomalyScore,
            status,
          };
        });

        // Grid noise on aggregate incoming feeder
        const noise = (Math.random() - 0.5) * 0.25;
        const totalP = Math.max(0, activePowerSum + noise);
        const voltage = 415.0 + (Math.random() - 0.5) * 2.0;
        const current = (totalP * 1000) / (1.732 * voltage * 0.88);
        const pf = totalP > 0 ? Math.min(0.98, Math.max(0.75, 0.88 + (Math.random() - 0.5) * 0.02)) : 1.0;

        setMachines(nextMachineList);
        setTotalEnergyKwh((prev) => prev + totalP * dtHours);

        // Production output increment
        if (activeUnitsInc >= 2) {
          setProductionUnits((prev) => prev + (activeUnitsInc * 0.08 * speed));
        }

        // Waveform append
        setWaveform((prevWave) => {
          const newPt: WaveformPoint = {
            time: nextTime,
            power: totalP,
            voltage,
            current,
            pf,
          };
          const nextWave = [...prevWave, newPt];
          return nextWave.length > 50 ? nextWave.slice(nextWave.length - 50) : nextWave;
        });

        // Update prescriptive opportunities
        const newOpps: OpportunityItem[] = [];
        const comp = nextMachineList.find((m) => m.id === 'compressor_1');
        if (comp && (comp.state === 'ABNORMAL' || comp.status === 'WARNING')) {
          newOpps.push({
            id: 'opp_compressor',
            asset: 'Air Compressor (Main Ring)',
            issue: 'High Duty Over-Power Draw (Pneumatic Leakage)',
            evidence: `Estimated at ${comp.estimatedKw.toFixed(1)} kW (+48% vs 5.5 kW baseline).`,
            cause: 'Main header air line distribution leak or receiver regulator bypass.',
            action: 'Execute ultrasonic leak audit; calibrate receiver pressure switch.',
            productionImpact: 'CRITICAL LINE ASSET — Keep power active to feed assembly pick-and-place arms.',
            confidence: '94%',
            level: 'WARNING',
          });
        }

        const pump = nextMachineList.find((m) => m.id === 'pump_1');
        if (pump && (pump.state === 'IDLE' || pump.status === 'REVIEW')) {
          newOpps.push({
            id: 'opp_pump',
            asset: 'Cooling / Sump Pump',
            issue: 'Uncoordinated Idle Standby Power',
            evidence: `Idling at ${pump.estimatedKw.toFixed(2)} kW with no active batch coolant demand.`,
            cause: 'Manual operator bypass without automated buffer-tank level switch interlock.',
            action: 'Configure 90s auto-sleep delay in PLC ladder logic.',
            productionImpact: 'MEDIUM CRITICALITY — Standby mode safe; will auto-wake on temperature trigger.',
            confidence: '91%',
            level: 'REVIEW',
          });
        }

        const motor = nextMachineList.find((m) => m.id === 'motor_1');
        if (motor && motor.state === 'ABNORMAL') {
          newOpps.push({
            id: 'opp_motor',
            asset: 'Induction Motor (Line Infeed)',
            issue: 'Thermal & Current Baseline Violation',
            evidence: `Operating at ${motor.estimatedKw.toFixed(1)} kW vs rated 4.0 kW baseline.`,
            cause: 'Mechanical conveyor chain tension binding or bearing lubrication deficit.',
            action: 'Check belt alignment; grease bearings at upcoming shift changeover.',
            productionImpact: 'HIGH CRITICALITY — Finish active lot before inspection stop.',
            confidence: '89%',
            level: 'WARNING',
          });
        }

        setOpportunities(newOpps);

        return nextTime;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  // Handler: Toggle simulation run/pause
  const handleToggleRun = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Handler: Reset factory
  const handleReset = useCallback(() => {
    setSimTime(0);
    setMachines(INITIAL_MACHINES);
    setWaveform([]);
    setProductionUnits(0);
    setTotalEnergyKwh(0);
    setVerifiedSavingsKwhDay(42.0);
    setOpportunities([]);
  }, []);

  // Handler: Inject anomaly
  const handleInjectAnomaly = useCallback((type: 'compressor' | 'pump' | 'motor') => {
    setMachines((prev) =>
      prev.map((m) => {
        if (type === 'compressor' && m.id === 'compressor_1') {
          return { ...m, state: 'ABNORMAL', status: 'WARNING', anomalyScore: 82 };
        }
        if (type === 'pump' && m.id === 'pump_1') {
          return { ...m, state: 'IDLE', status: 'REVIEW', idleH: 0.1, anomalyScore: 65 };
        }
        if (type === 'motor' && m.id === 'motor_1') {
          return { ...m, state: 'ABNORMAL', status: 'WARNING', anomalyScore: 78 };
        }
        return m;
      })
    );
  }, []);

  // Handler: Apply single or all corrective actions
  const handleApplyAction = useCallback((_oppId?: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
    });

    setMachines((prev) =>
      prev.map((m) => {
        if (m.state === 'ABNORMAL' || m.state === 'IDLE') {
          return {
            ...m,
            state: 'RUNNING',
            status: 'NORMAL',
            anomalyScore: 12,
            idleH: 0.0,
          };
        }
        return m;
      })
    );

    setVerifiedSavingsKwhDay((prev) => prev + 38.5);
    setOpportunities([]);
  }, []);

  // Current calculations
  const totalPower = machines.reduce((acc, m) => acc + m.actualKw, 0);
  const energyIntensity = productionUnits > 1 ? totalEnergyKwh / productionUnits : 1.83;
  const co2AvoidedKg = totalEnergyKwh * 0.82;
  const currentWavePoint = waveform.length > 0 ? waveform[waveform.length - 1] : { voltage: 415, current: 0, pf: 0.88 };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans">
      {/* Top Industrial Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-white">
                  FACTORYPULSE <span className="text-sky-400">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  SIH HACKATHON PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI-Driven Load Disaggregation (NILM) & Production-Aware Energy Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Hardware Architecture Modal Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Hardware Specs (ESP32/MQTT)</span>
            </button>

            {/* GitHub Info Button */}
            <button
              onClick={() => setShowGitHelper(!showGitHelper)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Github className="w-4 h-4" />
              <span className="hidden md:inline">GitHub Repository</span>
            </button>
          </div>
        </div>
      </header>

      {/* GitHub Repository Sync Helper Drawer/Banner */}
      {showGitHelper && (
        <div className="bg-slate-900 border-b border-slate-800 text-white p-4 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sky-400 text-sm">
                <Terminal className="w-4 h-4" />
                Repository: yathavPerumal / AI-Based-Non-Intrusive-Load-Disaggregation-and-Production-Aware-Energy-Intelligence
              </div>
              <p className="text-slate-300">
                The complete comprehensive <code>README.md</code>, PyTorch NILM Seq2Point models, Python Streamlit files, and simulation engine are configured in this workspace.
              </p>
              <div className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-emerald-400 select-all">
                git init && git add . && git commit -m "feat: AI-Based NILM and Production-Aware Energy Intelligence complete prototype" && git branch -M main && git push -u origin main
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href="/factorypulse_ai_complete.zip"
                  download="factorypulse_ai_complete.zip"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Download Full Repo ZIP (31 Files + README)
                </a>
                <span className="text-slate-400 text-[11px]">or reply with your GitHub PAT to push directly</span>
              </div>
            </div>
            <a
              href="https://github.com/yathavPerumal/AI-Based-Non-Intrusive-Load-Disaggregation-and-Production-Aware-Energy-Intelligence"
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors"
            >
              Open GitHub Repo <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top KPI Cards */}
        <KPICards
          totalPower={totalPower}
          totalEnergy={totalEnergyKwh}
          production={productionUnits}
          energyIntensity={energyIntensity}
          verifiedSavings={verifiedSavingsKwhDay}
          co2AvoidedKg={co2AvoidedKg}
          tariff={tariff}
        />

        {/* Live Signal Waveform Graph */}
        <WaveformChart
          data={waveform}
          currentPower={totalPower}
          pf={currentWavePoint.pf}
          voltage={currentWavePoint.voltage}
          current={currentWavePoint.current}
        />

        {/* Simulation Controls & Anomaly Injection Bar */}
        <SimulationControls
          isRunning={isRunning}
          onToggleRun={handleToggleRun}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={setSpeed}
          onInjectAnomaly={handleInjectAnomaly}
          onApplyAction={() => handleApplyAction()}
          simTime={simTime}
        />

        {/* NILM Machine Disaggregation Table */}
        <MachineTable machines={machines} />

        {/* Opportunities and Payback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <EnergyOpportunities
              opportunities={opportunities}
              onApplyAction={handleApplyAction}
            />
          </div>
          <div className="lg:col-span-5">
            <PaybackCalculator
              tariff={tariff}
              onTariffChange={setTariff}
              verifiedSavingsKwhDay={verifiedSavingsKwhDay}
            />
          </div>
        </div>

        {/* Technical Honesty & Production Context Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Technical Honesty Protocol:</strong> Disaggregated machine loads are high-confidence neural approximations (Seq2Point 1D-CNN).
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Created for Smart India Hackathon & Industrial Energy Innovation
          </div>
        </footer>
      </main>

      {/* Hardware Architecture Modal */}
      <ArchitectureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
