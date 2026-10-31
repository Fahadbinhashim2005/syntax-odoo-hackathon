import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import User
from app.routers import auth, dashboard, users

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

@app.get("/")
def home():
    return {
        "message": "Odoo Backend is running successfully!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }