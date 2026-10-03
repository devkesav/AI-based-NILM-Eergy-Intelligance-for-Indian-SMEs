"""Configuration file for FactoryPulse AI Industrial Simulation."""

from dataclasses import dataclass, field
from typing import Dict, Tuple

@dataclass
class MachineSpecs:
    name: str
    criticality: str  # HIGH, MEDIUM, LOW
    power_ranges: Dict[str, Tuple[float, float]]  # State -> (min_kW, max_kW)
    baseline_kw: float
    typical_pf: float  # Power Factor

FACTORY_MACHINES: Dict[str, MachineSpecs] = {
    "motor_1": MachineSpecs(
        name="Induction Motor",
        criticality="HIGH",
        power_ranges={
            "OFF": (0.0, 0.0),
            "STARTING": (7.0, 9.0),
            "RUNNING": (3.0, 5.0),
            "IDLE": (0.5, 1.0),
            "ABNORMAL": (8.0, 10.0),
        },
        baseline_kw=4.0,
        typical_pf=0.82,
    ),
    "pump_1": MachineSpecs(
        name="Cooling / Sump Pump",
        criticality="MEDIUM",
        power_ranges={
            "OFF": (0.0, 0.0),
            "STARTING": (4.0, 4.5),
            "RUNNING": (2.0, 2.5),
            "IDLE": (0.3, 0.5),
            "ABNORMAL": (3.5, 4.0),
        },
        baseline_kw=2.2,
        typical_pf=0.85,
    ),
    "compressor_1": MachineSpecs(
        name="Air Compressor",
        criticality="HIGH",
        power_ranges={
            "OFF": (0.0, 0.0),
            "STARTING": (9.0, 10.0),
            "RUNNING": (5.0, 6.0),
            "IDLE": (1.0, 2.0),
            "ABNORMAL": (7.0, 8.5),
        },
        baseline_kw=5.5,
        typical_pf=0.88,
    ),
    "cnc_1": MachineSpecs(
        name="CNC Machine",
        criticality="HIGH",
        power_ranges={
            "OFF": (0.0, 0.0),
            "STARTING": (5.0, 6.0),
            "RUNNING": (3.0, 5.0),
            "IDLE": (1.0, 1.2),
            "ABNORMAL": (6.0, 7.0),
        },
        baseline_kw=4.0,
        typical_pf=0.92,
    ),
    "furnace_1": MachineSpecs(
        name="Furnace / Industrial Heater",
        criticality="LOW",
        power_ranges={
            "OFF": (0.0, 0.0),
            "STARTING": (6.0, 6.5),
            "RUNNING": (4.0, 6.0),
            "IDLE": (2.0, 2.5),
            "ABNORMAL": (7.0, 8.0),
        },
        baseline_kw=5.0,
        typical_pf=0.98,
    ),
}

DEFAULT_TARIFF_INR_PER_KWH = 8.0
EMISSION_FACTOR_KG_CO2_PER_KWH = 0.82  # Central Electricity Authority average
WINDOW_SIZE = 30  # samples for NILM Seq2Point
NOISE_STD_KW = 0.15
SAMPLING_RATE_HZ = 1.0
