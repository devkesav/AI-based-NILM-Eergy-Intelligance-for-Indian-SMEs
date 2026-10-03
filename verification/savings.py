"""IPMVP Measurement & Verification (M&V) and Financial Payback Engine."""

from utils.config import DEFAULT_TARIFF_INR_PER_KWH, EMISSION_FACTOR_KG_CO2_PER_KWH

class SavingsVerificationEngine:
    def __init__(self, system_cost_inr: float = 75000.0, monthly_baseline_kwh: float = 10000.0):
        self.system_cost_inr = system_cost_inr
        self.monthly_baseline_kwh = monthly_baseline_kwh
        self.verified_saving_kwh_per_day = 0.0

    def record_corrective_action(self, kwh_saved_daily: float = 42.0):
        self.verified_saving_kwh_per_day += kwh_saved_daily

    def calculate_payback(self, tariff_inr: float = DEFAULT_TARIFF_INR_PER_KWH, saving_pct: float = 0.08):
        """Calculates financial savings and return on investment period."""
        monthly_cost_inr = self.monthly_baseline_kwh * tariff_inr
        monthly_saving_inr = monthly_cost_inr * saving_pct
        annual_saving_inr = monthly_saving_inr * 12.0

        if monthly_saving_inr > 0:
            payback_months = self.system_cost_inr / monthly_saving_inr
        else:
            payback_months = 999.0

        annual_kwh_saved = (self.monthly_baseline_kwh * saving_pct) * 12.0
        avoided_co2e_kg = annual_kwh_saved * EMISSION_FACTOR_KG_CO2_PER_KWH

        return {
            "system_cost_inr": self.system_cost_inr,
            "monthly_cost_inr": monthly_cost_inr,
            "monthly_saving_inr": monthly_saving_inr,
            "annual_saving_inr": annual_saving_inr,
            "payback_months": round(payback_months, 1),
            "annual_kwh_saved": round(annual_kwh_saved, 1),
            "avoided_co2e_kg": round(avoided_co2e_kg, 1),
        }
