import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface WaveformPoint {
  time: number;
  power: number;
  voltage: number;
  current: number;
  pf: number;
}

interface WaveformChartProps {
  data: WaveformPoint[];
  currentPower: number;
  pf: number;
  voltage: number;
  current: number;
}

export const WaveformChart: React.FC<WaveformChartProps> = ({
  data,
  currentPower,
  pf,
  voltage,
  current,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxPower = Math.max(25, ...data.map(d => d.power * 1.15));
  const minPower = 0;

  // Generate SVG path points
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((d.power - minPower) / (maxPower - minPower)) * graphHeight;
    return { x, y, data: d };
  });

  const linePath = points.length > 0 
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${padding.top + graphHeight} L ${points[0].x.toFixed(1)} ${padding.top + graphHeight} Z`
    : '';

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Aggregate Main Panel Signal (P_total)</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE 1 Hz
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High-resolution incoming feeder telemetry feeding NILM Seq2Point disaggregation
            </p>
          </div>
        </div>

        {/* Live Electrical Telemetry Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 font-medium mr-1.5">Voltage:</span>
            <span className="font-mono font-bold text-slate-800">{voltage.toFixed(1)} V</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 font-medium mr-1.5">Current:</span>
            <span className="font-mono font-bold text-slate-800">{current.toFixed(1)} A</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 font-medium mr-1.5">Power Factor:</span>
            <span className="font-mono font-bold text-slate-800">{pf.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* SVG Waveform Graph */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + graphHeight * ratio;
            const kwVal = maxPower * (1 - ratio);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  {kwVal.toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#powerGradient)" />}

          {/* Waveform line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive hover overlay */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - graphWidth / (data.length * 2)}
              y={padding.top}
              width={graphWidth / data.length}
              height={graphHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {/* Active Hover Marker */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + graphHeight}
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Baseline threshold guideline (e.g., 20kW) */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight - (20.0 / maxPower) * graphHeight}
            x2={width - padding.right}
            y2={padding.top + graphHeight - (20.0 / maxPower) * graphHeight}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="5 3"
          />
          <text
            x={width - padding.right - 5}
            y={padding.top + graphHeight - (20.0 / maxPower) * graphHeight - 4}
            fill="#d97706"
            fontSize="9"
            fontWeight="bold"
            textAnchor="end"
          >
            Warning Threshold (20 kW)
          </text>
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs"
            style={{
              left: `${Math.min(75, Math.max(15, (activePoint.x / width) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-sky-400 font-mono">
              {activePoint.data.power.toFixed(2)} kW
            </div>
            <div className="text-[10px] text-slate-300">
              t={activePoint.data.time.toFixed(0)}s | PF: {activePoint.data.pf.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            Total Active Power (kW)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500"></span>
            Baseline Operational Boundary
          </span>
        </div>
        <span className="text-slate-400 font-mono">
          NILM Sampling Window: 30s sliding buffer
        </span>
      </div>
    </div>
  );
};
