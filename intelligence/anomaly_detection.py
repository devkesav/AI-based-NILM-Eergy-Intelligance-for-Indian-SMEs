"""Industrial Machine Behavior Intelligence and Anomaly Scoring."""

from typing import Dict, List
from utils.config import FACTORY_MACHINES

class AnomalyDetector:
    def __init__(self):
        self.history: Dict[str, List[float]] = {m_id: [] for m_id in FACTORY_MACHINES}

    def evaluate_machine(self, machine_id: str, estimated_kw: float, state: str, runtime_h: float, idle_h: float) -> Dict:
        specs = FACTORY_MACHINES[machine_id]
        baseline = specs.baseline_kw
        deviation_pct = ((estimated_kw - baseline) / baseline) * 100.0 if baseline > 0 else 0.0

        anomaly_score = 0.0
        status = "NORMAL"
        findings = []

        if state == "ABNORMAL" or estimated_kw > specs.power_ranges["RUNNING"][1] + 1.0:
            anomaly_score = min(98.0, 70.0 + deviation_pct * 0.5)
            status = "WARNING"
            findings.append(f"Power draw {estimated_kw:.1f} kW is {deviation_pct:+.1f}% vs baseline {baseline:.1f} kW.")
        elif state == "IDLE" and idle_h > 0.05:  # More than 3 minutes idle
            anomaly_score = min(75.0, 35.0 + idle_h * 50.0)
            status = "REVIEW"
            findings.append(f"Machine has been idling unproductively for {idle_h*60:.0f} mins.")
        else:
            anomaly_score = max(5.0, 10.0 + (deviation_pct * 0.2 if deviation_pct > 0 else 0))
            status = "NORMAL"

        return {
            "machine_id": machine_id,
            "anomaly_score": round(anomaly_score, 1),
            "status": status,
            "deviation_pct": round(deviation_pct, 1),
            "findings": findings,
        }
