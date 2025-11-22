from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from app.config import settings
from app.api.v1 import auth, users, folders, files, shares, search

# Initialize Sentry for error tracking
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
    )

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FileFlow - UPI for Files. Send, receive, and organize files like bank transactions.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware
if settings.ENVIRONMENT == "production":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.fileflow.com", "fileflow.com"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to FileFlow API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Contact admin for API documentation"
    }

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])
app.include_router(folders.router, prefix=f"{settings.API_V1_PREFIX}/folders", tags=["Folders"])
app.include_router(files.router, prefix=f"{settings.API_V1_PREFIX}/files", tags=["Files"])
app.include_router(shares.router, prefix=f"{settings.API_V1_PREFIX}/shares", tags=["Shares/Transactions"])
app.include_router(search.router, prefix=f"{settings.API_V1_PREFIX}/search", tags=["Search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
