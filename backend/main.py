from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from backend.routers import user
from backend.db import engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

app.include_router(user.router)

@app.get("/health")
def health_check():
    return {"status": "ok"} 