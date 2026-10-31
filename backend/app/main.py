import os

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
from sqlalchemy import inspect, text

from app.database import Base, SessionLocal, engine
from app.models import User
from app.routers import auth, dashboard, users
from app.utils.initial_admin import seed_initial_admin

app = FastAPI(
    title="Odoo Subscription Management API",
    description="Authentication and User Management Module",
    version="1.0.0"
)

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)
    if "must_change_password" not in {column["name"] for column in inspect(engine).get_columns("users")}:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT 0"))
    seed_initial_admin(SessionLocal)
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
def home():
    return {
        "message": "Odoo Backend is running successfully!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
        "status": "healthy",
        "service": "billing-api",
    }
