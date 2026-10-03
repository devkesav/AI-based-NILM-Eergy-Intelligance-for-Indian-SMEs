"""Manufacturing batch, throughput, and energy intensity simulator."""

class ProductionSimulator:
    def __init__(self, target_units_per_shift: int = 500):
        self.target_units = target_units_per_shift
        self.completed_units: float = 0.0
        self.shift_name: str = "Morning Shift (06:00 - 14:00)"
        self.cycle_time_sec: float = 45.0  # seconds per part
        self.downtime_minutes: float = 0.0

    def step(self, dt_seconds: float, active_machine_count: int) -> float:
        # Production throughput scales with active critical machines (Motor, CNC, Compressor)
        if active_machine_count >= 2:
            efficiency = min(1.2, 0.4 + 0.2 * active_machine_count)
            produced = (dt_seconds / self.cycle_time_sec) * efficiency
            self.completed_units += produced
        return self.completed_units

    def compute_energy_intensity(self, cumulative_kwh: float) -> float:
        """Returns Energy Intensity in kWh/unit."""
        if self.completed_units < 1.0:
            return 0.0
        return cumulative_kwh / self.completed_units
