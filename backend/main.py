"""
FastAPI Application Entrypoint
"What's the Chance?" Game Backend

This is the main entry point for the FastAPI application.
Follows the project structure outlined in the SRD.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers (will be created later)
# from app.routers import auth, challenges, users, notifications

# Create FastAPI app
app = FastAPI(
    title="What's the Chance? API",
    description="Backend API for the What's the Chance social game",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS configuration
origins = [
    "http://localhost:3000",  # React dev server
    "http://localhost:8080",  # Vite dev server
    "https://localhost:3000",
    "https://localhost:8080",
    # Add production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {
        "status": "healthy",
        "service": "whats-the-chance-api",
        "version": "0.1.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "message": "What's the Chance? API",
        "version": "0.1.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }

# Include routers (uncomment when routers are created)
# app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
# app.include_router(users.router, prefix="/api/users", tags=["users"])
# app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
# app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

if __name__ == "__main__":
    # Development server
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    ) 