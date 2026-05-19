from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import admin, auth, calls, internal, journey, matches, personas, users, webhooks
from app.seed import seed_personas


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_personas(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Bridge API",
    description="AI-powered social matchmaking — hackathon PoC",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(personas.router)
app.include_router(journey.router)
app.include_router(matches.router)
app.include_router(calls.router)
app.include_router(users.router)
app.include_router(webhooks.router)
app.include_router(internal.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
