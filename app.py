"""FactoryPulse AI - Streamlit Dashboard Entry Point."""

import time
import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

from utils.config import FACTORY_MACHINES, DEFAULT_TARIFF_INR_PER_KWH
from simulator.factory_simulator import FactorySimulator
from simulator.production_simulator import ProductionSimulator
from nilm.inference import NILMInferenceEngine
from intelligence.anomaly_detection import AnomalyDetector
from intelligence.optimization import OptimizationEngine
from verification.savings import SavingsVerificationEngine

st.set_page_config(
    page_title="FactoryPulse AI - Industrial NILM Dashboard",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Industrial Styling
st.markdown("""
<style>
    .metric-card {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 16px 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .metric-label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 4px;
    }
    .metric-val {
        font-size: 26px;
        font-weight: 800;
        color: #0f172a;
    }
    .val-blue { color: #0284c7; }
    .val-orange { color: #f59e0b; }
    .val-green { color: #10b981; }
</style>
""", unsafe_allow_html=True)

# Initialize Session State
if "factory" not in st.session_state:
    st.session_state.factory = FactorySimulator()
    st.session_state.production = ProductionSimulator()
    st.session_state.nilm = NILMInferenceEngine()
    st.session_state.detector = AnomalyDetector()
    st.session_state.optimizer = OptimizationEngine()
    st.session_state.savings = SavingsVerificationEngine()
    st.session_state.sim_running = False
    st.session_state.sim_speed = 1
    st.session_state.tariff = DEFAULT_TARIFF_INR_PER_KWH
    st.session_state.history = []

# Sidebar Controls
with st.sidebar:
    st.image("https://img.icons8.com/color/96/factory.png", width=64)
    st.title("FactoryPulse AI")
    st.caption("AI-Driven Industrial NILM & Energy Intelligence")
    st.markdown("---")

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        if st.button("▶ Start", use_container_width=True):
            st.session_state.sim_running = True
    with col_btn2:
        if st.button("⏸ Pause", use_container_width=True):
            st.session_state.sim_running = False

    if st.button("🔄 Reset Factory State", use_container_width=True):
        st.session_state.factory = FactorySimulator()
        st.session_state.production = ProductionSimulator()
        st.session_state.history = []
        st.session_state.sim_running = False

    st.markdown("### ⚠ Anomaly Injection")
    if st.button("Inject Compressor High Load", use_container_width=True):
        st.session_state.factory.machines["compressor_1"].set_state("ABNORMAL")
        st.warning("Injected: Compressor Pneumatic Overload Anomaly")

    if st.button("Inject Pump Idle Operation", use_container_width=True):
        st.session_state.factory.machines["pump_1"].set_state("IDLE")
        st.info("Injected: Pump Standby / Idle Waste")

    if st.button("✅ Apply Corrective Action", use_container_width=True):
        for m in st.session_state.factory.machines.values():
            if m.state in ("ABNORMAL", "IDLE"):
                m.set_state("RUNNING")
        st.session_state.savings.record_corrective_action(38.5)
        st.success("Corrective Action Applied! Baseline Restored.")

    st.markdown("---")
    st.session_state.tariff = st.slider("Electricity Tariff (₹/kWh)", 4.0, 15.0, 8.0, 0.5)
    st.session_state.sim_speed = st.slider("Simulation Speed", 1, 5, 1)

# Step simulation if running
if st.session_state.sim_running:
    # Auto-stage machines on initial startup
    t = st.session_state.factory.total_time_seconds
    if t < 5:
        st.session_state.factory.machines["motor_1"].set_state("STARTING")
    elif t < 10:
        st.session_state.factory.machines["pump_1"].set_state("STARTING")
    elif t < 15:
        st.session_state.factory.machines["cnc_1"].set_state("RUNNING")
    elif t < 20:
        st.session_state.factory.machines["compressor_1"].set_state("STARTING")

    step_data = st.session_state.factory.step(dt_seconds=1.0 * st.session_state.sim_speed)
    active_count = sum(1 for m in st.session_state.factory.machines.values() if m.state == "RUNNING")
    units = st.session_state.production.step(1.0 * st.session_state.sim_speed, active_count)
    ei = st.session_state.production.compute_energy_intensity(step_data["cumulative_energy_kwh"])

    st.session_state.nilm.update_buffer(step_data["p_total_kw"])
    estimates = st.session_state.nilm.estimate_machine_loads(step_data["machine_powers"])

    st.session_state.history.append({
        "time": step_data["time_s"],
        "p_total": step_data["p_total_kw"],
        "pf": step_data["pf"],
        "energy": step_data["cumulative_energy_kwh"],
        "units": units,
        "ei": ei,
    })
    if len(st.session_state.history) > 60:
        st.session_state.history.pop(0)

# Extract current metrics
p_now = st.session_state.history[-1]["p_total"] if st.session_state.history else 0.0
e_now = st.session_state.history[-1]["energy"] if st.session_state.history else 0.0
u_now = st.session_state.history[-1]["units"] if st.session_state.history else 0.0
ei_now = st.session_state.history[-1]["ei"] if st.session_state.history else 0.0
saving_kwh = st.session_state.savings.verified_saving_kwh_per_day

# Top KPI Header
st.title("🏭 FactoryPulse AI — Production-Aware Energy Intelligence")

k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    st.markdown(f"<div class='metric-card'><div class='metric-label'>Current Power</div><div class='metric-val val-blue'>{p_now:.1f} kW</div></div>", unsafe_allow_html=True)
with k2:
    st.markdown(f"<div class='metric-card'><div class='metric-label'>Today Energy</div><div class='metric-val val-orange'>{e_now:.1f} kWh</div></div>", unsafe_allow_html=True)
with k3:
    st.markdown(f"<div class='metric-card'><div class='metric-label'>Production Output</div><div class='metric-val'>{int(u_now)} units</div></div>", unsafe_allow_html=True)
with k4:
    st.markdown(f"<div class='metric-card'><div class='metric-label'>Energy Intensity</div><div class='metric-val'>{ei_now:.2f} kWh/u</div></div>", unsafe_allow_html=True)
with k5:
    st.markdown(f"<div class='metric-card'><div class='metric-label'>Verified Savings</div><div class='metric-val val-green'>{saving_kwh:.1f} kWh/d</div></div>", unsafe_allow_html=True)

st.markdown("---")

# Waveform & Real-Time Disaggregation Charts
c_left, c_right = st.columns([2, 1])

with c_left:
    st.subheader("📈 Aggregate Main Panel Waveform (P_total)")
    if st.session_state.history:
        df_hist = pd.DataFrame(st.session_state.history)
        fig_wave = px.area(df_hist, x="time", y="p_total", labels={"p_total": "Active Power (kW)", "time": "Time (s)"})
        fig_wave.update_traces(line_color="#0284c7", fillcolor="rgba(2,132,199,0.15)")
        fig_wave.update_layout(margin=dict(l=0, r=0, t=10, b=0), height=300)
        st.plotly_chart(fig_wave, use_container_width=True)
    else:
        st.info("Click '▶ Start' in the sidebar to simulate live electrical streaming.")

with c_right:
    st.subheader("⚡ NILM Seq2Point Disaggregation Breakdown")
    pie_labels = []
    pie_values = []
    for m_id, m in st.session_state.factory.machines.items():
        pie_labels.append(m.specs.name)
        pie_values.append(max(0.1, m.current_kw))
    fig_pie = px.pie(names=pie_labels, values=pie_values, hole=0.5, color_discrete_sequence=px.colors.qualitative.Prism)
    fig_pie.update_layout(margin=dict(l=0, r=0, t=10, b=0), height=300, showlegend=False)
    st.plotly_chart(fig_pie, use_container_width=True)

# Machine Table
st.subheader("📋 Machine-Level Status & Anomaly Matrix")
table_rows = []
anomalies_map = {}
for m_id, machine in st.session_state.factory.machines.items():
    res = st.session_state.detector.evaluate_machine(
        m_id, machine.current_kw, machine.state, machine.runtime_hours, machine.idle_hours
    )
    anomalies_map[m_id] = res
    table_rows.append({
        "Machine Asset": machine.specs.name,
        "Criticality": machine.specs.criticality,
        "Estimated Load (kW)": f"{machine.current_kw:.2f}",
        "Energy (kWh)": f"{machine.energy_kwh:.2f}",
        "Runtime (h)": f"{machine.runtime_hours:.2f}",
        "Operating State": machine.state,
        "Status": res["status"],
        "Anomaly Score": f"{res['anomaly_score']}%",
    })
st.dataframe(pd.DataFrame(table_rows), use_container_width=True)

# Prescriptive Opportunities & Payback Section
col_opp, col_fin = st.columns([3, 2])

with col_opp:
    st.subheader("💡 Prescriptive Energy Opportunities")
    estimates_dict = {m_id: {"estimated_kw": m.current_kw, "inferred_state": m.state} for m_id, m in st.session_state.factory.machines.items()}
    opps = st.session_state.optimizer.evaluate_opportunities(estimates_dict, anomalies_map, ei_now, True)
    if opps:
        for opp in opps:
            st.warning(f"**⚠ {opp['asset']} — {opp['issue']}**\n\n"
                       f"- **Evidence**: {opp['evidence']}\n"
                       f"- **Recommended Action**: {opp['recommended_action']}\n"
                       f"- **Production Constraint**: {opp['production_impact']}\n"
                       f"- **Confidence**: {opp['confidence']}")
    else:
        st.success("All machinery operating within optimal baseline efficiency envelopes.")

with col_fin:
    st.subheader("💰 IPMVP Payback & Financial Return")
    payback_res = st.session_state.savings.calculate_payback(st.session_state.tariff, saving_pct=0.08)
    st.metric("Estimated Payback Period", f"≈ {payback_res['payback_months']} Months")
    st.write(f"- **Monthly Energy Cost**: ₹{payback_res['monthly_cost_inr']:,.0f}")
    st.write(f"- **Projected Monthly Savings**: ₹{payback_res['monthly_saving_inr']:,.0f}")
    st.write(f"- **Avoided Carbon Emissions**: {payback_res['avoided_co2e_kg']:,.0f} kg CO₂e/yr")
    st.caption("*Illustrative scenario — actual return verified via IPMVP Option B/C.*")

if st.session_state.sim_running:
    time.sleep(1.0 / st.session_state.sim_speed)
    st.rerun()
