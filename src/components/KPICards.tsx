import React from 'react';
import { Activity, Zap, Factory, Gauge, TrendingDown, Leaf } from 'lucide-react';

interface KPICardsProps {
  totalPower: number;
  totalEnergy: number;
  production: number;
  energyIntensity: number;
  verifiedSavings: number;
  co2AvoidedKg: number;
  tariff: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalPower,
  totalEnergy,
  production,
  energyIntensity,
  verifiedSavings,
  co2AvoidedKg,
  tariff,
}) => {
  const isHighIntensity = energyIntensity > 2.5;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Current Power</span>
          <Activity className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {totalPower.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kW</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Incoming main feeder</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Today's Energy</span>
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {totalEnergy.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kWh</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Est. cost: ₹{(totalEnergy * tariff).toFixed(0)}</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Production</span>
          <Factory className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {Math.floor(production)} <span className="text-xs font-semibold text-slate-400">units</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Target: 500 units/shift</p>
      </div>

      <div className={`p-4 rounded-xl border transition-all ${
        isHighIntensity 
          ? 'bg-amber-50/50 border-amber-300 shadow-xs' 
          : 'bg-white border-slate-200/80 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Energy Intensity</span>
          <Gauge className={`w-4 h-4 ${isHighIntensity ? 'text-amber-600' : 'text-slate-600'}`} />
        </div>
        <div className={`text-2xl font-black tracking-tight ${isHighIntensity ? 'text-amber-700' : 'text-slate-900'}`}>
          {energyIntensity.toFixed(2)} <span className="text-xs font-semibold text-slate-400">kWh/u</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {isHighIntensity ? '⚠ Above optimal baseline' : 'Target: < 2.0 kWh/u'}
        </p>
      </div>

      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">Verified Savings</span>
          <TrendingDown className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-emerald-700 tracking-tight">
          {verifiedSavings.toFixed(1)} <span className="text-xs font-semibold text-emerald-600">kWh/d</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium mt-1">
          ₹{(verifiedSavings * 30 * tariff).toFixed(0)}/mo saved
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Avoided CO₂e</span>
          <Leaf className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {co2AvoidedKg.toFixed(1)} <span className="text-xs font-semibold text-slate-400">kg</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Factor: 0.82 kg/kWh</p>
      </div>
    </div>
  );
};
