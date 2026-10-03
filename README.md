# AI-Based-Non-Intrusive-Load-Disaggregation-and-Production-Aware-Energy-Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1+-ee4c2c.svg)](https://pytorch.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30+-ff4b4b.svg)](https://streamlit.io/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![SIH / Hackathon Ready](https://img.shields.io/badge/Prototype-SIH%20%2F%20Hackathon%20Ready-success.svg)](#)

> **FactoryPulse AI**: AI-Driven Non-Intrusive Load Disaggregation (NILM) & Production-Aware Energy Optimization for Industrial Manufacturing.
> 
> *Target: Reduce industrial electrical energy consumption without compromising production output or product quality.*

---

## 📌 Executive Summary

Industrial manufacturing facilities consume vast amounts of electrical energy, but traditional energy monitoring suffers from a high-barrier dilemma:
1. **Intrusive Sub-Metering Is Cost-Prohibitive**: Installing individual smart power meters on dozens of heavy induction motors, compressors, CNC machines, pumps, and furnaces requires thousands of dollars in sensor hardware, panel wiring downtime, and maintenance.
2. **Blind Energy Curtailment Ruins Production**: Traditional energy management systems attempt peak shaving or blind load shedding by switching off machines, inadvertently stopping critical bottlenecks, violating production cycle times, and causing throughput losses.

**FactoryPulse AI** solves both challenges simultaneously:
- **Non-Intrusive Load Monitoring (NILM)**: By sampling only the aggregate active and reactive electrical power waveform at the single factory incoming main feeder panel, a deep learning 1D-CNN Seq2Point model disaggregates and reconstructs the real-time power draw and operational states of individual machinery.
- **Production-Aware Energy Intelligence**: Rather than analyzing energy in a vacuum, the system couples disaggregated power with real-time manufacturing schedule, batch production output ($Q$), cycle times, and machine criticality. It tracks **Specific Energy Consumption / Energy Intensity ($EI = \text{Energy} / \text{Output}$)** to identify real waste (e.g. uncoordinated idling, pneumatic leakage, pressure setpoint drift) without ever cutting power to critical production assets.

---

## 🏭 Digital Factory Simulation Specification

The prototype simulates a manufacturing shop floor equipped with 5 industrial machine classes with realistic electrical signatures, power factor characteristics, harmonics, and switching transients:

| Machine Asset | Criticality | OFF (kW) | STARTING (kW) | RUNNING (kW) | IDLE (kW) | ABNORMAL (kW) | Failure / Waste Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Induction Motor** | HIGH | 0.0 | 7.0 – 9.0 | 3.0 – 5.0 | 0.5 – 1.0 | 8.0 – 10.0 | Mechanical overload, bearing friction, phase imbalance |
| **Cooling / Sump Pump** | MEDIUM | 0.0 | 4.0 – 4.5 | 2.0 – 2.5 | 0.3 – 0.5 | 3.5 – 4.0 | Cavitation, uncoordinated idle running during shift pauses |
| **Air Compressor** | HIGH | 0.0 | 9.0 – 10.0 | 5.0 – 6.0 | 1.0 – 2.0 | 7.0 – 8.5 | Airline piping leaks, excessive duty cycle, pressure drop |
| **CNC Machine** | HIGH | 0.0 | 5.0 – 6.0 | 3.0 – 5.0 | 1.0 – 1.2 | 6.0 – 7.0 | Tool bluntness chatter, prolonged standby spindle power |
| **Furnace / Heater** | LOW | 0.0 | 6.0 – 6.5 | 4.0 – 6.0 | 2.0 – 2.5 | 7.0 – 8.0 | Thermal insulation degradation, over-temperature cycling |

### Electrical Signal Formulation
The total aggregate panel active power $P_{\text{total}}(t)$ and reactive power $Q_{\text{total}}(t)$ at time step $t$ are given by:

$$P_{\text{total}}(t) = \sum_{m=1}^{M} P_{m}(t) + \epsilon_{p}(t)$$

$$Q_{\text{total}}(t) = \sum_{m=1}^{M} Q_{m}(t) + \epsilon_{q}(t)$$

$$S_{\text{total}}(t) = \sqrt{P_{\text{total}}(t)^2 + Q_{\text{total}}(t)^2}, \quad PF(t) = \frac{P_{\text{total}}(t)}{S_{\text{total}}(t)}$$

where $\epsilon(t) \sim \mathcal{N}(0, \sigma^2)$ represents electrical measurement noise and unmodelled parasitic line impedance.

---

## 🧠 System Architecture & Methodology

```
+-----------------------------------------------------------------------------------+
|                            FACTORY ELECTRICAL INCOMING FEEDER                     |
|                                                                                   |
|   [Induction Motor]   [Cooling Pump]   [Air Compressor]   [CNC Machine]  [Furnace]|
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Aggregate Main Panel Energy Meter  │
                      │  (Voltage, Current, P_total, Q, PF)  │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   NILM Disaggregation Engine         │
                      │   (Seq2Point 1D-CNN Deep Learning)   │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
             Estimated Machine-Level Power: P_motor, P_pump, P_comp, P_cnc...
                                         │
         ┌───────────────────────────────┴──────────────────────────────┐
         ▼                                                              ▼
┌─────────────────────────────────┐                    ┌─────────────────────────────────┐
│  Machine Behavior & Anomaly AI  │                    │    Production Context Engine    │
│  (Isolation Forest + Baselines) │                    │ (Target, Units, Shift, Cycles)  │
└────────────────┬────────────────┘                    └────────────────┬────────────────┘
                 │                                                      │
                 └───────────────────────┬──────────────────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Production-Aware Optimization      │
                      │   (Preserves Critical Line Uptime)   │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Verified Savings & Payback Engine  │
                      │   (IPMVP Option B/C, CO2e Avoidance) │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   FactoryPulse AI Dashboard (React)  │
                      │   + Streamlit Local Simulation App   │
                      └──────────────────────────────────────┘
```

### 1. NILM Deep Learning (Seq2Point 1D-CNN)
Instead of predicting an entire sequence, the Sequence-to-Point (Seq2Point) neural network takes a sliding temporal window of aggregate power $W_t = [P_{\text{total}}(t - \tau), \dots, P_{\text{total}}(t), \dots, P_{\text{total}}(t + \tau)]$ and maps it to the midpoint power consumption of target machine $m$:

$$f_{\theta_m}(W_t) \approx \hat{P}_m(t)$$

The disaggregation loss minimizes Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE):
$$\mathcal{L}(\theta) = \frac{1}{N} \sum_{t=1}^N \left| P_m(t) - \hat{P}_m(t) \right| + \lambda \sqrt{\frac{1}{N}\sum_{t=1}^N \left(P_m(t) - \hat{P}_m(t)\right)^2}$$

### 2. Specific Energy Intensity Metric
To guarantee that energy reduction does not starve production throughput, the system computes:

$$\text{Energy Intensity } (EI_t) = \frac{E_{\text{consumed}}(t)}{Q_{\text{produced}}(t)} \quad [\text{kWh/unit}]$$

If energy usage drops while production simultaneously collapses, $EI_t$ surges, immediately flagging an operational efficiency defect rather than an intentional conservation victory.

---

## 💻 Tech Stack

### Web Application (Live Demonstration)
- **Frontend Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Visualization**: Interactive High-Resolution SVG Waveforms & Real-Time Gantt Machine States
- **Port**: 3000 (Docker / Cloud Run native preview)

### Python Machine Learning & Simulation Suite
- **Language**: Python 3.11+
- **Deep Learning**: PyTorch 2.1+ (1D-CNN Seq2Point NILM)
- **Scientific Computing**: NumPy, SciPy, Pandas
- **Machine Learning**: Scikit-Learn (Isolation Forest anomaly scoring)
- **Dashboard & Graphs**: Streamlit, Plotly Express & Graph Objects

---

## 🚀 Quickstart Guide

### Option A: Running the React Web Platform (Instant Preview)
The application includes a real-time reactive digital factory simulator directly in the browser:

```bash
# Install dependencies
npm install

# Run Vite development server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Running the Python Streamlit Prototype

```bash
# 1. Clone the repository
git clone https://github.com/yathavPerumal/AI-Based-Non-Intrusive-Load-Disaggregation-and-Production-Aware-Energy-Intelligence.git
cd AI-Based-Non-Intrusive-Load-Disaggregation-and-Production-Aware-Energy-Intelligence

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows use: venv\Scripts\activate

# 3. Install required Python packages
pip install -r requirements.txt

# 4. Launch the FactoryPulse Streamlit application
streamlit run app.py
```

---

## 📊 Demonstration Scenario for Hackathon Judges

To demonstrate the full intelligence loop during an SIH / hackathon presentation, follow this 60-second live test script:

1. **Step 1 - Normal Operation**:
   - Start the simulation. All 5 machines stage up: Motor $\rightarrow$ Pump $\rightarrow$ CNC $\rightarrow$ Compressor.
   - Aggregate power stabilizes at **~18.4 kW**.
   - Energy Intensity stabilizes at **~1.83 kWh/unit**. Anomaly scores stay in the green (< 15%).
2. **Step 2 - Inject Compressor Anomaly**:
   - Click the orange **"Inject Compressor Anomaly"** trigger.
   - The compressor begins drawing **7.8 – 8.5 kW** (above the 5.5 kW baseline) due to simulated airline pressure leakage and continuous unloader cycling.
   - NILM isolates the compressor load despite other machines operating concurrently.
   - Anomaly score climbs to **85% (WARNING)**.
   - Energy Intensity degrades to **> 2.65 kWh/unit**.
3. **Step 3 - Production Context Evaluation**:
   - The optimization engine inspects production schedules: *Air Compressor is critical to downstream pneumatic actuators, so automatic hard-trip shutdown is prohibited.*
   - A prescriptive recommendation card appears in the **Energy Opportunities** panel:
     - *Issue*: Compressor power 45% above baseline.
     - *Evidence*: 8.2 kW draw, elevated temperature signature.
     - *Potential Cause*: Pneumatic leak in Main Header Ring, valve unloader bypass.
     - *Action*: Conduct ultrasonic leak inspection; check receiver pressure regulator.
4. **Step 4 - Apply Corrective Action**:
   - Click **"Apply Corrective Action"**.
   - Compressor returns to optimal 5.2 kW running state.
   - Confetti triggers, and the **Verified Savings** counter increases by **+38.5 kWh/day**.
   - Payback calculator instantly recalculates investment recovery time to **≈ 11.8 months**.

---

## 🔌 Hardware Roadmap (ESP32 / Modbus Industrial Integration)

The software architecture is engineered to decouple signal ingestion from ML inference:

```
[3-Phase 415V Industrial Bus]
             │
             ├──> Split-Core Current Transformers (SCT-013 / Rogowski Coils)
             └──> Voltage Taps (PT / Direct Sensing)
                            │
                            ▼
             [Analog Front End: ADE7758 / PZEM-004T IC]
                            │ (SPI / UART)
                            ▼
             [Edge Microcontroller: ESP32-S3 Dual Core]
                            │ (MQTT over Wi-Fi / RS485 Modbus-RTU)
                            ▼
             [Edge Gateway / MQTT Broker: Eclipse Mosquitto]
                            │ (JSON Payload: V_rms, I_rms, P_active, Q_reactive, THD)
                            ▼
             [FactoryPulse AI Python / Node.js Ingestion Pipeline]
```

---

## 📁 Repository Directory Structure

```
AI-Based-Non-Intrusive-Load-Disaggregation-and-Production-Aware-Energy-Intelligence/
├── app.py                      # Complete Streamlit Interactive Dashboard
├── requirements.txt            # Python dependencies (PyTorch, Streamlit, etc.)
├── README.md                   # Comprehensive technical documentation
├── metadata.json               # Applet deployment descriptor
├── package.json                # Web application configuration
├── vite.config.ts              # Vite bundling pipeline
│
├── simulator/                  # Digital factory electrical simulation
│   ├── machine_models.py       # Physics & electrical state machines
│   ├── factory_simulator.py    # Aggregate waveform & noise generator
│   └── production_simulator.py # Batch tracking & energy intensity
│
├── nilm/                       # Non-Intrusive Load Monitoring ML
│   ├── preprocessing.py        # Sliding window & normalization
│   ├── model.py                # PyTorch 1D-CNN Seq2Point architecture
│   └── inference.py            # Real-time disaggregation inference
│
├── intelligence/               # AI reasoning & heuristics
│   ├── anomaly_detection.py    # Isolation Forest & statistical baselines
│   └── optimization.py         # Production-aware recommendation engine
│
├── verification/               # Savings & financial validation
│   └── savings.py              # IPMVP savings & payback calculation
│
├── utils/
│   └── config.py               # Machine ratings & system constants
│
└── src/                        # React 19 Interactive Dashboard
    ├── App.tsx                 # Master state & simulation loop
    ├── index.css               # Tailwind CSS theme
    ├── main.tsx                # Entry point
    └── components/             # Reusable industrial UI cards & charts
```

---

## 📜 Technical Honesty & Disclaimers

1. **Estimated, Not Direct Measurement**: NILM produces statistical approximations of machine loads. Critical high-voltage safety interlocks must always use certified physical relays.
2. **Maintenance Hypotheses**: Detected anomalies reflect energetic deviations and provide probable inspection causes (e.g. pressure leakage, idle running), not definitive mechanical teardown diagnoses.
3. **Illustrative Financial Metrics**: Payback schedules are calculated using baseline tariffs (default ₹8.0/kWh) and illustrative verified saving percentages.

---

## 👨‍💻 Author & Attribution

Developed by **yathavPerumal**  
Contact: [25eel05@kpriet.ac.in](mailto:25eel05@kpriet.ac.in)  
GitHub: [@yathavPerumal](https://github.com/yathavPerumal)

*Created for Smart India Hackathon (SIH) & Industrial AI Energy Management Innovations.*
