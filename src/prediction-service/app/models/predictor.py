from typing import Optional

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor


class RevenuePredictorModel:
    def __init__(self):
        self.mlp = MLPRegressor(
            hidden_layer_sizes=(16, 8),
            activation="relu",
            solver="adam",
            max_iter=500,
            learning_rate_init=0.001,
            random_state=42,
        )
        self.linreg = LinearRegression()
        self._trained = False
        self._use_linear = False
        self._y_mean = 1.0

    def _sparsity_ratio(self, revenue: np.ndarray) -> float:
        return np.sum(revenue < 1) / max(len(revenue), 1)

    def _build_features(
        self,
        revenue: np.ndarray,
        occupancy: Optional[np.ndarray] = None,
        reservations: Optional[np.ndarray] = None,
    ) -> np.ndarray:
        features = []
        n = len(revenue)

        for i in range(3, n):
            row = [
                revenue[i - 3] / max(revenue[i - 1], 1),
                revenue[i - 2] / max(revenue[i - 1], 1),
                revenue[i - 1] / max(revenue[i - 1], 1),
                i / n,
            ]
            if occupancy is not None and len(occupancy) > i:
                row.append(float(occupancy[i]))
            else:
                row.append(0.5)
            if reservations is not None and len(reservations) > i:
                row.append(float(reservations[i]) / 1000)
            else:
                row.append(0.0)
            features.append(row)

        return np.array(features, dtype=np.float64)

    def train(
        self,
        revenue: list[float],
        occupancy: Optional[list[float]] = None,
        reservations: Optional[list[int]] = None,
    ):
        arr = np.array(revenue, dtype=np.float64)
        occ = np.array(occupancy, dtype=np.float64) if occupancy else None
        res = np.array(reservations, dtype=np.float64) if reservations else None

        non_zero = arr[arr > 0]
        if len(non_zero) < 3 or self._sparsity_ratio(arr) > 0.4:
            self._use_linear = True
            self._trained = False
            self._lin_fit(arr)
            return

        X = self._build_features(arr, occ, res)
        y = arr[3:]

        if len(X) < 6:
            self._use_linear = True
            self._trained = False
            self._lin_fit(arr)
            return

        self._y_mean = max(np.mean(y), 1)
        y_scaled = y / self._y_mean
        self.mlp.fit(X, y_scaled)
        self._trained = True
        self._use_linear = False

    def _lin_fit(self, revenue: np.ndarray):
        x = np.arange(len(revenue)).reshape(-1, 1)
        y = revenue.copy()
        self.linreg.fit(x, y)

    def predict_next(
        self,
        revenue: list[float],
        occupancy: Optional[list[float]] = None,
        reservations: Optional[list[int]] = None,
        steps: int = 12,
    ) -> list[float]:
        arr = list(revenue)
        occ = list(occupancy) if occupancy else None
        res = list(reservations) if reservations else None

        for _ in range(steps):
            if len(arr) < 3:
                arr.append(arr[-1] * 1.02 if arr else 0)
                continue

            obs = occ[-1] if occ and len(occ) >= len(arr) else 0.5
            rsv = res[-1] if res and len(res) >= len(arr) else 0
            n = len(arr)

            if self._use_linear or not self._trained:
                x_pred = np.array([[n]])
                pred = float(self.linreg.predict(x_pred)[0])
                pred = max(pred, 0)
            else:
                features = np.array(
                    [
                        [
                            arr[-3] / max(arr[-1], 1),
                            arr[-2] / max(arr[-1], 1),
                            arr[-1] / max(arr[-1], 1),
                            n / (n + 12),
                            float(obs),
                            float(rsv) / 1000,
                        ]
                    ],
                    dtype=np.float64,
                )
                pred = float(self.mlp.predict(features)[0]) * self._y_mean

            arr.append(max(pred, 0))
            if occ:
                occ.append(occ[-1])
            if res:
                res.append(res[-1])

        return arr[-steps:]
