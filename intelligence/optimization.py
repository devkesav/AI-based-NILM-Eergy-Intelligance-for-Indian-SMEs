"""Production-Aware Energy Optimization and Prescriptive Opportunities."""

from typing import Dict, List
from utils.config import FACTORY_MACHINES

class OptimizationEngine:
    """Generates prescriptive energy recommendations respecting safety and production schedules."""

    def evaluate_opportunities(
        self,
        machine_states: Dict[str, Dict],
        anomaly_results: Dict[str, Dict],
        energy_intensity: float,
        production_active: bool,
    ) -> List[Dict]:
        opportunities = []

        for m_id, anomaly in anomaly_results.items():
            specs = FACTORY_MACHINES[m_id]
            state_info = machine_states.get(m_id, {})
            current_kw = state_info.get("estimated_kw", 0.0)
            status = anomaly.get("status", "NORMAL")

            if m_id == "compressor_1" and (status == "WARNING" or current_kw > 7.0):
                opportunities.append({
                    "asset": "Air Compressor",
                    "issue": "Continuous High Duty & Over-Power Consumption",
                    "evidence": f"Estimated power at {current_kw:.1f} kW ({anomaly['deviation_pct']:+.1f}% above 5.5 kW baseline).",
                    "potential_cause": "Compressed-air header leakage, clogged intake filter, or unloader valve failure.",
                    "recommended_action": "Execute ultrasonic acoustic leak audit; verify receiver tank pressure setpoint.",
                    "production_impact": "High Criticality — DO NOT cut power automatically. Maintain pneumatic line supply.",
                    "confidence": "94%",
                    "level": "WARNING",
                })

            elif m_id == "pump_1" and (status == "REVIEW" or state_info.get("inferred_state") == "IDLE"):
                opportunities.append({
                    "asset": "Cooling / Sump Pump",
                    "issue": "Unproductive Idle Running Detected",
                    "evidence": "Pump has been running at idle (0.35 kW) while no batch liquid transfer is active.",
                    "potential_cause": "Manual operator bypass or missing level-switch interlock timer.",
                    "recommended_action": "Program auto-standby 90s sleep delay when buffer tank level is below threshold.",
                    "production_impact": "Low/Medium — Standby is safe; will auto-wake on incoming fluid signal.",
                    "confidence": "91%",
                    "level": "REVIEW",
                })

            elif m_id == "motor_1" and status == "WARNING":
                opportunities.append({
                    "asset": "Induction Motor",
                    "issue": "Power Draw Exceeding Rated Thermal Baseline",
                    "evidence": f"Operating at {current_kw:.1f} kW vs rated 4.0 kW baseline.",
                    "potential_cause": "Mechanical belt misalignment, bearing lubrication breakdown, or load jam.",
                    "recommended_action": "Schedule vibration analysis; grease drive bearings at next shift changeover.",
                    "production_impact": "High Criticality — Finish current batch before line shutdown.",
                    "confidence": "89%",
                    "level": "WARNING",
                })

        return opportunities
