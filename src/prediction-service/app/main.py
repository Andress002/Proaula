from typing import Optional

from app.services.revenue_predictor import RevenuePredictor
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Revenue Prediction Service", version="1.0.0")
predictor = RevenuePredictor()


class PredictionRequest(BaseModel):
    hotel_id: int = Field(..., description="Hotel ID")
    monthly_revenue: list[float] = Field(
        ..., min_length=6, max_length=36, description="Last 6-36 months of revenue"
    )
    occupancy_rates: Optional[list[float]] = Field(
        None, min_length=6, max_length=36, description="Occupancy rates per month (0-1)"
    )
    reservations_count: Optional[list[int]] = Field(
        None, min_length=6, max_length=36, description="Reservations count per month"
    )
    total_rooms: Optional[int] = Field(None, description="Total rooms in hotel")
    avg_room_price: Optional[float] = Field(None, description="Average room price")
    real_data_months: Optional[int] = Field(
        None, description="Number of months with actual data (not interpolated)"
    )


class PredictionResponse(BaseModel):
    hotel_id: int
    monthly: float
    annual: float
    confidence: float
    trend: str
    data_quality: str


@app.get("/health")
async def health():
    return {"status": "ok", "service": "revenue-prediction"}


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        result = predictor.predict(
            revenue_history=request.monthly_revenue,
            occupancy_rates=request.occupancy_rates,
            reservations_count=request.reservations_count,
            total_rooms=request.total_rooms,
            avg_room_price=request.avg_room_price,
            real_data_months=request.real_data_months,
        )
        return PredictionResponse(
            hotel_id=request.hotel_id,
            monthly=round(result["monthly"], 2),
            annual=round(result["annual"], 2),
            confidence=round(result["confidence"], 2),
            trend=result["trend"],
            data_quality=result.get("data_quality", "medium"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
