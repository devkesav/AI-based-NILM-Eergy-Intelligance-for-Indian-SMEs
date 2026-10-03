"""Factory electrical signal simulator for aggregate main panel."""

import random
from typing import Dict, List, Tuple
from simulator.machine_models import MachineModel
from utils.config import FACTORY_MACHINES, NOISE_STD_KW

class FactorySimulator:
    def __init__(self):
        self.machines: Dict[str, MachineModel] = {
            m_id: MachineModel(m_id, specs) for m_id, specs in FACTORY_MACHINES.items()
        }
        self.nominal_voltage_v = 415.0  # 3-phase line-to-line
        self.nominal_freq_hz = 50.0
        self.cumulative_energy_kwh = 0.0
        self.total_time_seconds = 0.0

    def step(self, dt_seconds: float = 1.0) -> Dict:
        self.total_time_seconds += dt_seconds
        dt_hours = dt_seconds / 3600.0

        p_sum = 0.0
        q_sum = 0.0
        machine_powers = {}

        for m_id, machine in self.machines.items():
            kw, kvar = machine.step(dt_seconds)
            machine_powers[m_id] = kw
            p_sum += kw
            q_sum += kvar

        # Measurement noise & grid voltage fluctuations
        noise = random.gauss(0, NOISE_STD_KW)
        p_total = max(0.0, p_sum + noise)
        v_rms = self.nominal_voltage_v + random.gauss(0, 1.5)
        freq_hz = self.nominal_freq_hz + random.gauss(0, 0.04)

        s_total = (p_total**2 + q_sum**2) ** 0.5
        i_rms = (s_total * 1000.0) / (1.732 * v_rms) if v_rms > 0 else 0.0
        pf = min(1.0, max(0.5, p_total / s_total)) if s_total > 0 else 1.0

        self.cumulative_energy_kwh += p_total * dt_hours

        return {
            "time_s": self.total_time_seconds,
            "p_total_kw": p_total,
            "q_total_kvar": q_sum,
            "s_total_kva": s_total,
            "v_rms": v_rms,
            "i_rms": i_rms,
            "pf": pf,
            "freq_hz": freq_hz,
            "cumulative_energy_kwh": self.cumulative_energy_kwh,
            "machine_powers": machine_powers,
        }
