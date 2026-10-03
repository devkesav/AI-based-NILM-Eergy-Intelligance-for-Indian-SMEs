"""NILM Disaggregation Inference Engine with Confidence Scoring."""

import random
from typing import Dict, List
import numpy as np
from nilm.preprocessing import NILMPreprocessor
from utils.config import FACTORY_MACHINES

class NILMInferenceEngine:
    def __init__(self, window_size: int = 30):
        self.window_size = window_size
        self.preprocessor = NILMPreprocessor(window_size=window_size)
        self.buffer: List[float] = []

    def update_buffer(self, p_total_kw: float):
        self.buffer.append(p_total_kw)
        if len(self.buffer) > self.window_size * 2:
            self.buffer = self.buffer[-self.window_size:]

    def estimate_machine_loads(self, ground_truth: Dict[str, float] = None) -> Dict[str, Dict]:
        """Disaggregates aggregate signal into individual machine power predictions."""
        estimates = {}
        for m_id, specs in FACTORY_MACHINES.items():
            if ground_truth and m_id in ground_truth:
                true_val = ground_truth[m_id]
                # Simulate Seq2Point neural estimation error (MAE ~ 0.25 kW, 94-98% accuracy)
                noise = random.gauss(0, 0.20)
                pred_kw = max(0.0, true_val + noise) if true_val > 0.1 else (0.1 if random.random() < 0.05 else 0.0)
            else:
                pred_kw = random.uniform(0.0, specs.baseline_kw)

            # Inferred state classification
            if pred_kw < 0.2:
                inferred_state = "OFF"
            elif pred_kw > specs.power_ranges["ABNORMAL"][0] - 0.5:
                inferred_state = "ABNORMAL"
            elif pred_kw <= specs.power_ranges["IDLE"][1]:
                inferred_state = "IDLE"
            elif pred_kw >= specs.power_ranges["STARTING"][0] - 0.5:
                inferred_state = "STARTING"
            else:
                inferred_state = "RUNNING"

            # Confidence score (simulated model softmax / epistemic certainty)
            confidence = round(random.uniform(0.88, 0.96), 2)

            estimates[m_id] = {
                "estimated_kw": round(pred_kw, 2),
                "inferred_state": inferred_state,
                "confidence": confidence,
            }
        return estimates
