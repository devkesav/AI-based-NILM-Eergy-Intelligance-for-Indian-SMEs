import React from 'react';
import { Cpu, Wind, Droplets, Flame, Cog, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export interface MachineRow {
  id: string;
  name: string;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  actualKw: number;
  estimatedKw: number;
  energyKwh: number;
  runtimeH: number;
  idleH: number;
  state: 'OFF' | 'STARTING' | 'RUNNING' | 'IDLE' | 'ABNORMAL';
  status: 'NORMAL' | 'REVIEW' | 'WARNING';
  anomalyScore: number;
  confidence: number;
  baselineKw: number;
}

interface MachineTableProps {
  machines: MachineRow[];
}

export const MachineTable: React.FC<MachineTableProps> = ({ machines }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'motor_1':
        return <Cpu className="w-4 h-4 text-sky-600" />;
      case 'compressor_1':
        return <Wind className="w-4 h-4 text-indigo-600" />;
      case 'pump_1':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'cnc_1':
        return <Cog className="w-4 h-4 text-slate-700" />;
      case 'furnace_1':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStateBadge = (state: MachineRow['state']) => {
    switch (state) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            RUNNING
          </span>
        );
      case 'STARTING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            STARTING
          </span>
        );
      case 'IDLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            IDLE
          </span>
        );
      case 'ABNORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            ABNORMAL
          </span>
        );
      case 'OFF':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
            OFF
          </span>
        );
    }
  };

  const getStatusBadge = (status: MachineRow['status']) => {
    switch (status) {
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3 h-3" /> REVIEW
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> NORMAL
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            NILM Machine Disaggregation & Operational Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Estimated vs actual ground truth loads reconstructed from aggregate feeder signal
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-mono">
          Model: 1D-CNN Seq2Point (Prototype v1.0)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Machine Asset</th>
              <th className="px-4 py-3">Criticality</th>
              <th className="px-4 py-3">NILM Estimated (kW)</th>
              <th className="px-4 py-3">Actual Load (kW)</th>
              <th className="px-4 py-3">Disagg. Error</th>
              <th className="px-4 py-3">Energy (kWh)</th>
              <th className="px-4 py-3">Operating State</th>
              <th className="px-4 py-3">Anomaly Score</th>
              <th className="px-4 py-3">AI Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {machines.map((m) => {
              const absError = Math.abs(m.estimatedKw - m.actualKw);
              return (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 rounded-md">
                        {getIcon(m.id)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Baseline: {m.baselineKw.toFixed(1)} kW
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.criticality === 'HIGH' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : m.criticality === 'MEDIUM' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {m.criticality}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {m.estimatedKw.toFixed(2)} kW
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Conf: {(m.confidence * 100).toFixed(0)}%
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-600">
                    {m.actualKw.toFixed(2)} kW
                  </td>

                  <td className="px-4 py-3 font-mono">
                    <span className={`text-[11px] ${absError > 0.4 ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                      ±{absError.toFixed(2)} kW
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-medium text-slate-800">
                    {m.energyKwh.toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    {getStateBadge(m.state)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="w-28">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-500">Score</span>
                        <span className={`font-bold ${
                          m.anomalyScore > 65 ? 'text-rose-600' : m.anomalyScore > 35 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {m.anomalyScore.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.anomalyScore > 65 ? 'bg-rose-500' : m.anomalyScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, m.anomalyScore))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {getStatusBadge(m.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
