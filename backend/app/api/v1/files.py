from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import hashlib
from app.db.session import get_db
from app.models.user import User
from app.models.file import File
from app.api.v1.auth import get_current_user
from app.services.storage import storage_service
from app.config import settings
from pydantic import BaseModel

router = APIRouter()

class FileUploadInit(BaseModel):
    filename: str
    size_bytes: int
    mime_type: str
    folder_id: str | None = None

class FileUploadResponse(BaseModel):
    upload_url: str
    storage_key: str
    file_id: str

class FileResponse(BaseModel):
    id: str
    filename: str
    size_bytes: int
    mime_type: str
    folder_id: str | None
    created_at: str
    thumbnail_url: str | None

@router.post("/upload/init", response_model=FileUploadResponse)
async def init_upload(
    upload_data: FileUploadInit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initialize file upload - returns presigned URL for direct S3 upload"""
    
    # Validate file size
    if upload_data.size_bytes <= 0:
        raise HTTPException(status_code=400, detail="Invalid file size")
    
    # Check storage quota
    if current_user.storage_used_bytes + upload_data.size_bytes > current_user.storage_quota_bytes:
        raise HTTPException(
            status_code=400, 
            detail=f"Storage quota exceeded. Used: {current_user.storage_used_bytes / (1024**3):.2f}GB / {current_user.storage_quota_bytes / (1024**3):.2f}GB"
        )
    
    # Check file size limit
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if upload_data.size_bytes > max_size:
        raise HTTPException(status_code=400, detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
    
    # Validate file type (basic security)
    dangerous_extensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1']
    if any(upload_data.filename.lower().endswith(ext) for ext in dangerous_extensions):
        raise HTTPException(status_code=400, detail="File type not allowed for security reasons")
    
    # Generate storage key
    storage_key = storage_service.generate_storage_key(str(current_user.id), upload_data.filename)
    
    # Create file record
    file = File(
        owner_user_id=current_user.id,
        folder_id=upload_data.folder_id,
        filename=upload_data.filename,
        original_filename=upload_data.filename,
        size_bytes=upload_data.size_bytes,
        mime_type=upload_data.mime_type,
        storage_key=storage_key,
        storage_bucket=settings.S3_BUCKET,
        checksum_sha256="pending",
        status="uploading"
    )
    
    db.add(file)
    await db.commit()
    await db.refresh(file)
    
    # Generate presigned upload URL
    upload_url = storage_service.create_presigned_upload_url(storage_key, upload_data.mime_type)
    
    return {
        "upload_url": upload_url,
        "storage_key": storage_key,
        "file_id": str(file.id)
    }

@router.post("/upload/{file_id}/complete")
async def complete_upload(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark upload as complete and update user storage"""
    
    result = await db.execute(
        select(File).where(
            File.id == file_id,
            File.owner_user_id == current_user.id
        )
    )
    file = result.scalar_one_or_none()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Update file status
    file.status = "uploaded"
    
    # Update user storage
    current_user.storage_used_bytes += file.size_bytes
    
    await db.commit()
    
    # Trigger background tasks (virus scan, OCR, etc.)
    # TODO: Add Celery task here
    
    return {"message": "Upload completed", "file_id": str(file.id)}

@router.get("/", response_model=List[FileResponse])
async def get_files(
    folder_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get files for current user with pagination"""
    # Validate pagination
    if limit > 100:
        limit = 100
    if offset < 0:
        offset = 0
    
    query = select(File).where(File.owner_user_id == current_user.id, File.deleted_at.is_(None))
    
    if folder_id:
        query = query.where(File.folder_id == folder_id)
    
    result = await db.execute(query.order_by(File.created_at.desc()).limit(limit).offset(offset))
    files = result.scalars().all()
    
    return [
        {
            "id": str(file.id),
            "filename": file.filename,
            "size_bytes": file.size_bytes,
            "mime_type": file.mime_type,
            "folder_id": str(file.folder_id) if file.folder_id else None,
            "created_at": file.created_at.isoformat(),
            "thumbnail_url": file.thumbnail_url
        }
        for file in files
    ]

@router.get("/{file_id}/download")
async def get_download_url(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get presigned download URL"""
    
    result = await db.execute(
        select(File).where(
            File.id == file_id,
            File.owner_user_id == current_user.id
        )
    )
    file = result.scalar_one_or_none()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    download_url = storage_service.create_presigned_download_url(
        file.storage_key,
        filename=file.original_filename
    )
    
    return {
        "download_url": download_url,
        "filename": file.original_filename,
        "expires_in": settings.S3_PRESIGNED_URL_EXPIRY
    }

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete file (soft delete)"""
    from datetime import datetime
    
    result = await db.execute(
        select(File).where(
            File.id == file_id,
            File.owner_user_id == current_user.id
        )
    )
    file = result.scalar_one_or_none()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Soft delete
    file.deleted_at = datetime.utcnow()
    
    # Update user storage
    current_user.storage_used_bytes -= file.size_bytes
    
    await db.commit()
    
    return {"message": "File deleted successfully"}
