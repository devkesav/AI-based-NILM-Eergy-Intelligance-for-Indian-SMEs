import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Wind, Droplets, Cpu, Wrench } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onInjectAnomaly: (type: 'compressor' | 'pump' | 'motor') => void;
  onApplyAction: () => void;
  simTime: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onToggleRun,
  onReset,
  speed,
  onSpeedChange,
  onInjectAnomaly,
  onApplyAction,
  simTime,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-900">
            Digital Factory Simulation Engine
          </h2>
          <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold">
            t = {simTime.toFixed(0)}s
          </span>
        </div>

        {/* Speed Multiplier Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Speed:</span>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded font-mono font-bold transition-all cursor-pointer ${
                speed === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Play / Pause */}
        <button
          onClick={onToggleRun}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause Telemetry' : '▶ Start Simulation'}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          Reset Factory
        </button>

        {/* Apply Corrective Action */}
        <button
          onClick={onApplyAction}
          className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs cursor-pointer"
        >
          <Wrench className="w-4 h-4" />
          Apply All Corrective Actions (Restore Baseline)
        </button>
      </div>

      {/* Anomaly Injections */}
      <div className="pt-3 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Manual Anomaly Injections (Hackathon Demo Triggers)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onInjectAnomaly('compressor')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100/80 active:scale-98 transition-all cursor-pointer text-left"
          >
            <Wind className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <div className="truncate">
              <span className="block font-bold">Compressor Leak</span>
              <span className="text-[10px] text-rose-600">Power surge to 8.2 kW</span>
            </div>
          </button>

          <button
            onClick={() => onInjectAnomaly('pump')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100/80 active:scale-98 transition-all cursor-pointer text-left"
          >
            <Droplets className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="truncate">
              <span className="block font-bold">Pump Idle Waste</span>
              <span className="text-[10px] text-amber-600">Uncoordinated standby</span>
            </div>
          </button>

          <button
            onClick={() => onInjectAnomaly('motor')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200 hover:bg-purple-100/80 active:scale-98 transition-all cursor-pointer text-left"
          >
            <Cpu className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div className="truncate">
              <span className="block font-bold">Motor Friction Overload</span>
              <span className="text-[10px] text-purple-600">Surge to 9.1 kW</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
