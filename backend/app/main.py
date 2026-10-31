from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal
from app.models import *  # import all models
from app.api import (
    auth,
    users,
    customers,
    products,
    plans,
    discounts,
    taxes,
    quotations,
    subscriptions,
    invoices,
    payments,
    dashboard,
)
from app.seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

# Auto seed default admin if needed
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="Brightloop API",
    description="SaaS Subscription Management System API - Team Syntax",
    version="1.0.0"
)

# CORS configuration
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
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(plans.router)
app.include_router(discounts.router)
app.include_router(taxes.router)
app.include_router(quotations.router)
app.include_router(subscriptions.router)
app.include_router(invoices.router)
app.include_router(payments.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Brightloop API is running"}

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
