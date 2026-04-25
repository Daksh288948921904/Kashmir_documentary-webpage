from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import documentary, social, news, payement
 
settings = get_settings() 
app = FastAPI(
    title="Kashmir Documentary API",
    description="Backend for the Kashmir documentary website — timeline, news, social feed, payments.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "*",
       
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documentary.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(payement.router, prefix="/api")

@app.get("/")
async def root():
    return {"status": "running", "project": "Kashmir Documentary"}
 
 
@app.get("/health")
async def health():
    return {"status": "ok"}
 
 