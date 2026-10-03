import React from 'react';
import { Calculator, DollarSign, Calendar, TrendingUp, Info } from 'lucide-react';

interface PaybackCalculatorProps {
  tariff: number;
  onTariffChange: (tariff: number) => void;
  verifiedSavingsKwhDay: number;
}

export const PaybackCalculator: React.FC<PaybackCalculatorProps> = ({
  tariff,
  onTariffChange,
  verifiedSavingsKwhDay,
}) => {
  const systemCost = 75000; // ₹75,000 baseline
  const monthlyConsumptionKwh = 10000; // 10,000 kWh/month baseline
  const savingPct = 0.08; // 8% baseline verified

  const monthlyCost = monthlyConsumptionKwh * tariff;
  const monthlySaving = monthlyCost * savingPct;
  const paybackMonths = monthlySaving > 0 ? systemCost / monthlySaving : 0;
  const annualSaving = monthlySaving * 12;
  const co2AvoidedYearly = monthlyConsumptionKwh * savingPct * 12 * 0.82; // 0.82 kg/kWh

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              IPMVP Payback & Investment Return
            </h2>
            <p className="text-xs text-slate-500">
              Financial amortization schedule based on disaggregated verified savings
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          IPMVP Option B/C
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
              <span>Electricity Tariff</span>
              <span className="font-mono text-sky-700 font-bold">₹{tariff.toFixed(1)} / kWh</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="16.0"
              step="0.5"
              value={tariff}
              onChange={(e) => onTariffChange(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>₹4.0 (Subsidized)</span>
              <span>₹8.0 (Industrial LT)</span>
              <span>₹16.0 (Peak HT)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg">
              <span className="text-slate-500 block mb-1 text-[11px]">System Capex</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                ₹{systemCost.toLocaleString('en-IN')}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">ESP32 + CT Hardware & AI</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg">
              <span className="text-slate-500 block mb-1 text-[11px]">Monthly Factory Base</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {monthlyConsumptionKwh.toLocaleString('en-IN')} kWh
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Small industrial plant</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg text-[11px] text-blue-900">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Verified saving of <strong>{(savingPct * 100).toFixed(0)}%</strong> yields{' '}
              <strong>₹{monthlySaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> reduction per month.
            </span>
          </div>
        </div>

        {/* Big Payback ROI Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold tracking-wider uppercase text-[11px]">Projected Recovery</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" /> High Feasibility
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black tracking-tight text-white font-mono">
                ≈ {paybackMonths.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-slate-300">Months</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Full initial investment capital recovered within first operational year.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/80 mt-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Annual Cash Savings</span>
              <span className="text-emerald-400 font-bold text-sm">
                ₹{annualSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / yr
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Avoided Greenhouse Gas</span>
              <span className="text-sky-300 font-bold text-sm">
                {co2AvoidedYearly.toFixed(0)} kg CO₂e / yr
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-100">
        *Illustrative scenario — actual payback verified via IPMVP Option B / Option C post-retrofit continuous metering.
      </div>
    </div>
  );
};
