from typing import Optional

import numpy as np
from app.models.predictor import RevenuePredictorModel


class RevenuePredictor:
    def __init__(self):
        self.model = RevenuePredictorModel()

    def _count_nonzero_months(self, history: list[float]) -> int:
        return sum(1 for v in history if v > 0)

    def _simple_avg_projection(
        self, revenue_history: list[float], steps: int = 12
    ) -> list[float]:
        non_zero = [v for v in revenue_history if v > 0]
        avg = np.mean(non_zero) if non_zero else 0
        seasonal_factors = [
            0.85,
            0.80,
            0.90,
            0.95,
            1.05,
            1.15,
            1.25,
            1.20,
            1.10,
            1.00,
            0.90,
            0.85,
        ]
        total_annual = avg * steps
        factor_sum = sum(seasonal_factors)
        return [
            round(total_annual * f / factor_sum, 2) for f in seasonal_factors[:steps]
        ]

    def predict(
        self,
        revenue_history: list[float],
        occupancy_rates: Optional[list[float]] = None,
        reservations_count: Optional[list[int]] = None,
        total_rooms: Optional[int] = None,
        avg_room_price: Optional[float] = None,
        real_data_months: Optional[int] = None,
    ) -> dict:
        if len(revenue_history) < 6:
            raise ValueError(
                f"Need at least 6 months of revenue history, got {len(revenue_history)}"
            )

        # Determine how many months have actual (non-interpolated) data
        actual_data = (
            real_data_months
            if real_data_months is not None
            else self._count_nonzero_months(revenue_history)
        )

        # Determine data_quality based on actual data
        if actual_data >= 6:
            data_quality = "high"
        elif actual_data >= 3:
            data_quality = "medium"
        else:
            data_quality = "low"

        # Not enough real data for MLP — use seasonal projection with confidence scaling
        if actual_data < 3:
            predictions = self._simple_avg_projection(revenue_history, steps=12)
            confidence = max(10.0, actual_data * 10)
            trend = "stable"
            next_month = predictions[0]
            annual = sum(predictions)
            return {
                "monthly": float(next_month),
                "annual": float(annual),
                "confidence": float(confidence),
                "trend": trend,
                "data_quality": data_quality,
            }

        self.model.train(
            revenue=revenue_history,
            occupancy=occupancy_rates,
            reservations=reservations_count,
        )

        predictions = self.model.predict_next(
            revenue=revenue_history,
            occupancy=occupancy_rates,
            reservations=reservations_count,
            steps=12,
        )

        recent = np.array(revenue_history[-6:])
        mean = np.mean(recent)
        std = np.std(recent)
        cv = std / max(mean, 1)

        # Adjust confidence based on real data available
        if real_data_months is not None:
            data_factor = min(1.0, real_data_months / 12)
        else:
            data_factor = 1.0
        confidence = max(0, min(100, (1 - cv) * 85 + 10) * data_factor)

        if len(predictions) >= 3:
            first_third = np.mean(predictions[:4])
            last_third = np.mean(predictions[-4:])
            diff_ratio = (last_third - first_third) / max(first_third, 1)
            if diff_ratio > 0.05:
                trend = "up"
            elif diff_ratio < -0.05:
                trend = "down"
            else:
                trend = "stable"
        else:
            trend = "stable"

        next_month = predictions[0]
        annual = sum(predictions)

        return {
            "monthly": float(next_month),
            "annual": float(annual),
            "confidence": float(confidence),
            "trend": trend,
            "data_quality": data_quality,
        }
