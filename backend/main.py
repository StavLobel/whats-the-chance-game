"""
FastAPI Application Entrypoint
"What's the Chance?" Game Backend

This is the main entry point for the FastAPI application.
Follows the project structure outlined in the SRD.
"""

import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.routers import challenges, game_stats, notifications

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Backend API for the What's the Chance social game",
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    debug=settings.debug,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"],
)


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {
        "status": "healthy",
        "service": "whats-the-chance-api",
        "version": settings.app_version,
        "environment": "development" if settings.debug else "production",
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "message": settings.app_name,
        "version": settings.app_version,
        "docs": "/api/docs",
        "health": "/api/health",
        "endpoints": {
            "challenges": "/api/challenges",
            "notifications": "/api/notifications",
            "game_stats": "/api/game-stats",
        },
    }


# Include routers
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(
    notifications.router, prefix="/api/notifications", tags=["notifications"]
)
app.include_router(game_stats.router)

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
