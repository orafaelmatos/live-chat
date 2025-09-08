from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from .database import Base, engine
from .config import settings
from .routers import auth, rooms, messages, ws

# Create tables on startup (for demo/dev; in production use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chat API", version="0.1.0")

# CORS – allow frontend (React) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in prod: restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(messages.router)
app.include_router(ws.router)

# Metrics for Prometheus
if settings.PROMETHEUS_ENABLED:
    Instrumentator().instrument(app).expose(app, include_in_schema=False)

# Healthcheck / root
@app.get("/")
def root():
    return {"ok": True, "service": "chat-api"}
