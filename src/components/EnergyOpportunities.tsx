import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Sparkles, Wrench } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface OpportunityItem {
  id: string;
  asset: string;
  issue: string;
  evidence: string;
  cause: string;
  action: string;
  productionImpact: string;
  confidence: string;
  level: 'WARNING' | 'REVIEW';
}

interface EnergyOpportunitiesProps {
  opportunities: OpportunityItem[];
  onApplyAction: (oppId: string) => void;
}

export const EnergyOpportunities: React.FC<EnergyOpportunitiesProps> = ({
  opportunities,
  onApplyAction,
}) => {
  const triggerConfetti = (oppId: string) => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });
    onApplyAction(oppId);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Prescriptive Energy Opportunities (Production-Aware)
            </h2>
            <p className="text-xs text-slate-500">
              AI recommendations respecting machine criticality and active production commitments
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {opportunities.length} Active {opportunities.length === 1 ? 'Action' : 'Actions'}
        </span>
      </div>

      {opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Optimal Energy Envelope Maintained
          </h3>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            All machinery operating within thermal and electrical baseline bounds. No uncoordinated idling or parasitic leakage detected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className={`rounded-xl border p-4.5 flex flex-col justify-between transition-all ${
                opp.level === 'WARNING'
                  ? 'bg-rose-50/40 border-rose-200 shadow-2xs hover:border-rose-300'
                  : 'bg-amber-50/40 border-amber-200 shadow-2xs hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    {opp.level === 'WARNING' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    )}
                    <span className="font-bold text-sm text-slate-900">
                      {opp.asset}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    opp.level === 'WARNING' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {opp.confidence} CONFIDENCE
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 mb-2">
                  {opp.issue}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-600 mb-4 bg-white/70 p-3 rounded-lg border border-slate-200/50">
                  <div>
                    <span className="font-bold text-slate-700">Evidence: </span>
                    {opp.evidence}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Potential Cause: </span>
                    {opp.cause}
                  </div>
                  <div className="text-indigo-900 font-medium">
                    <span className="font-bold text-indigo-950">Production Impact: </span>
                    {opp.productionImpact}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
                <div className="text-[11px] font-bold text-slate-700 truncate">
                  Action: {opp.action}
                </div>
                <button
                  onClick={() => triggerConfetti(opp.id)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Apply Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
