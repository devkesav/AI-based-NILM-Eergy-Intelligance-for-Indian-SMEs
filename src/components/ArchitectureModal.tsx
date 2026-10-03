import React from 'react';
import { X, Cpu, Server, Wifi, Database, Layers, CheckCircle } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                FactoryPulse AI — Industrial Hardware Architecture
              </h3>
              <p className="text-xs text-slate-500">
                End-to-end signal pipeline from 415V Main Bus to NILM Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-600">
          {/* Hardware Pipeline Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-2">
                <Cpu className="w-4 h-4 text-sky-600" /> 1. Edge Sensing
              </div>
              <p className="text-[11px] text-slate-500">
                Non-invasive Split-Core CTs (SCT-013 / Rogowski coils) clamped on Main Incomer + PZEM-004T / ADE7758 energy IC.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-2">
                <Wifi className="w-4 h-4 text-indigo-600" /> 2. Gateway / ESP32
              </div>
              <p className="text-[11px] text-slate-500">
                ESP32-S3 dual-core microcontroller samples 1 Hz RMS active power, reactive power, power factor, and harmonics via Modbus/UART.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-2">
                <Server className="w-4 h-4 text-purple-600" /> 3. MQTT Broker
              </div>
              <p className="text-[11px] text-slate-500">
                Lightweight JSON packets published to Eclipse Mosquitto broker:
                <code className="block mt-1 font-mono text-[9px] bg-slate-200/70 p-1 rounded">
                  factory/feeder/P_total
                </code>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-2">
                <Database className="w-4 h-4 text-emerald-600" /> 4. NILM & AI
              </div>
              <p className="text-[11px] text-slate-500">
                PyTorch 1D-CNN Seq2Point disaggregates individual machinery without intrusive sub-metering.
              </p>
            </div>
          </div>

          {/* MQTT JSON Payload Specification */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px]">
            <div className="text-slate-400 mb-2 font-sans font-bold text-xs">
              ESP32 Telemetry JSON Schema (MQTT Topic: factory/incomer/telemetry):
            </div>
            <pre className="text-sky-300">
{`{
  "timestamp": 1727944200,
  "v_rms": 415.2,
  "i_rms": 25.6,
  "p_active_kw": 18.35,
  "q_reactive_kvar": 9.82,
  "power_factor": 0.88,
  "frequency_hz": 50.02,
  "device_id": "ESP32_PANEL_FEEDER_01"
}`}
            </pre>
          </div>

          {/* Technical Honesty Note */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <CheckCircle className="w-4 h-4 text-amber-600" /> Technical Honesty & Industrial Constraints
            </span>
            <p>
              • <strong>Estimated, Not Direct Physical Metering:</strong> NILM produces high-confidence statistical load estimates (Seq2Point MAE ~ 0.2 kW). Critical trip safety circuits continue to use physical breakers.
            </p>
            <p>
              • <strong>Production-Aware Interlocking:</strong> High-criticality equipment (e.g. CNC Spindle, Main Line Motor) is flagged so the optimizer never recommends abrupt load shedding during an active batch.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Close Architecture Reference
          </button>
        </div>
      </div>
    </div>
  );
};
