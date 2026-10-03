"""Machine physics & electrical state models."""

import random
from typing import Dict, Tuple
from utils.config import MachineSpecs, FACTORY_MACHINES

class MachineModel:
    def __init__(self, machine_id: str, specs: MachineSpecs):
        self.id = machine_id
        self.specs = specs
        self.state: str = "OFF"
        self.current_kw: float = 0.0
        self.reactive_kvar: float = 0.0
        self.runtime_hours: float = 0.0
        self.idle_hours: float = 0.0
        self.energy_kwh: float = 0.0
        self.start_count: int = 0
        self.time_in_state: float = 0.0

    def set_state(self, new_state: str):
        if new_state != self.state:
            if new_state in ("STARTING", "RUNNING") and self.state in ("OFF", "IDLE"):
                self.start_count += 1
            self.state = new_state
            self.time_in_state = 0.0

    def step(self, dt_seconds: float = 1.0) -> Tuple[float, float]:
        self.time_in_state += dt_seconds
        dt_hours = dt_seconds / 3600.0

        p_min, p_max = self.specs.power_ranges.get(self.state, (0.0, 0.0))
        if p_min == p_max:
            base_kw = p_min
        else:
            base_kw = random.uniform(p_min, p_max)

        # Micro-fluctuations
        jitter = random.gauss(0, 0.03 * max(0.5, base_kw))
        kw = max(0.0, base_kw + jitter)

        # Reactive power based on typical PF
        pf = self.specs.typical_pf
        sin_phi = (1.0 - pf**2) ** 0.5
        kvar = kw * (sin_phi / max(0.1, pf))

        self.current_kw = kw
        self.reactive_kvar = kvar

        if self.state not in ("OFF",):
            self.energy_kwh += kw * dt_hours
            if self.state == "IDLE":
                self.idle_hours += dt_hours
            else:
                self.runtime_hours += dt_hours

        # Automatically transition STARTING to RUNNING after 8 seconds
        if self.state == "STARTING" and self.time_in_state >= 8.0:
            self.set_state("RUNNING")

        return kw, kvar
