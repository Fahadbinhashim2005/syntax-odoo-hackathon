from fastapi import FastAPI

app = FastAPI(
    title="Odoo Subscription Management API",
    description="Authentication and User Management Module",
    version="1.0.0"
)


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