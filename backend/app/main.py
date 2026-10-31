from app.database import Base, engine
from app import models
from app.api.invoices import router as invoices_router
from app.api.payments import router as payments_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Brightloop Billing API",
    description="Invoice, payment, and finance management API",
    version="1.0.0",
)

app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(dashboard_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Brightloop Billing API is running",
        "status": "healthy",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "billing-api",
    }