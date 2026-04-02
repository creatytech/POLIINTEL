from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict, analyze, health

app = FastAPI(
    title="POLIINTEL ML Engine",
    description="Motor de Machine Learning para análisis electoral",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(predict.router, prefix="/api/v1/predict", tags=["predict"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analyze"])
