from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import documentary, social, news, payment
from app.routers import cms_auth, products, orders, upload, social_cms, screening

settings = get_settings()
app = FastAPI(
    title="Kashmir Documentary API",
    description="Backend for the Kashmir documentary website — timeline, news, social feed, payments.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Airpay-Transaction-Id"],
)
app.include_router(documentary.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(payment.router, prefix="/api")

# Kashmir Harvest CMS + shop
app.include_router(cms_auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(social_cms.router, prefix="/api")
app.include_router(screening.router, prefix="/api")

@app.get("/")
async def root():
    return {"status": "running", "project": "Kashmir Documentary"}
 
 
@app.get("/health")
async def health():
    return {"status": "ok"}
 
 