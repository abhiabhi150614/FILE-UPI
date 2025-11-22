from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from pydantic import BaseModel, EmailStr

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

class UserRegister(BaseModel):
    email: EmailStr
    phone: str
    name: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register new user and create default folders"""
    
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        phone=user_data.phone,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        is_verified=False
    )
    
    db.add(user)
    await db.flush()
    
    # Create default folders
    from app.models.folder import Folder
    default_folders = [
        {"name": "Bills", "icon": "🧾", "color": "#667eea"},
        {"name": "Hospital Reports", "icon": "🏥", "color": "#f093fb"},
        {"name": "Company", "icon": "🏢", "color": "#4facfe"},
        {"name": "Education", "icon": "🎓", "color": "#43e97b"},
        {"name": "Receipts", "icon": "🧾", "color": "#fa709a"},
        {"name": "Personal", "icon": "👤", "color": "#30cfd0"},
    ]
    
    for idx, folder_data in enumerate(default_folders):
        folder = Folder(
            owner_user_id=user.id,
            name=folder_data["name"],
            icon=folder_data["icon"],
            color=folder_data["color"],
            position=idx
        )
        db.add(folder)
    
    await db.commit()
    await db.refresh(user)
    
    # Generate tokens
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "plan": user.plan
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Login user with email/password"""
    
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Generate tokens
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "plan": user.plan,
            "avatar_url": user.avatar_url
        }
    }

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """Get current authenticated user"""
    from app.core.security import decode_token
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    return user
