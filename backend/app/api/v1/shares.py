from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.models.user import User
from app.models.file import File
from app.models.folder import Folder
from app.models.share import Share
from app.api.v1.auth import get_current_user
from app.core.security import generate_transaction_id
from pydantic import BaseModel, EmailStr

router = APIRouter()

class ShareCreate(BaseModel):
    file_id: str
    recipient_email: EmailStr | None = None
    recipient_phone: str | None = None
    target_folder_name: str
    message: str | None = None
    share_type: str = "direct"  # direct, link, qr

class ShareResponse(BaseModel):
    id: str
    transaction_id: str
    file_id: str
    filename: str
    sender_name: str
    recipient_name: str | None
    target_folder_name: str
    status: str
    created_at: str
    message: str | None

@router.post("/", response_model=ShareResponse, status_code=201)
async def send_file(
    share_data: ShareCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send file to another user (like UPI transaction)"""
    
    # Validate recipient info
    if not share_data.recipient_email and not share_data.recipient_phone:
        raise HTTPException(status_code=400, detail="Recipient email or phone required")
    
    # Get file
    result = await db.execute(
        select(File).where(
            File.id == share_data.file_id,
            File.owner_user_id == current_user.id,
            File.deleted_at.is_(None)
        )
    )
    file = result.scalar_one_or_none()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found or deleted")
    
    # Check if file is ready
    # Check if file is ready
    if file.status not in ["uploaded", "hidden"]:
        raise HTTPException(status_code=400, detail="File is not ready to be shared")
    
    # Find recipient
    recipient = None
    if share_data.recipient_email:
        result = await db.execute(
            select(User).where(User.email == share_data.recipient_email)
        )
        recipient = result.scalar_one_or_none()
    
    # Generate transaction ID
    transaction_id = generate_transaction_id()
    
    # Create share/transaction
    share = Share(
        file_id=file.id,
        sender_user_id=current_user.id,
        sender_name=current_user.name,
        sender_email=current_user.email,
        recipient_user_id=recipient.id if recipient else None,
        recipient_email=share_data.recipient_email,
        recipient_phone=share_data.recipient_phone,
        recipient_name=recipient.name if recipient else None,
        target_folder_name=share_data.target_folder_name,
        message=share_data.message,
        share_type=share_data.share_type,
        transaction_id=transaction_id,
        status="sent"
    )
    
    db.add(share)
    
    # If recipient exists, mark as delivered
    # If recipient exists, mark as delivered and create file copy
    if recipient:
        share.status = "delivered"
        share.delivered_at = datetime.utcnow()
        
        # 1. Find or Create Target Folder for Recipient
        result = await db.execute(
            select(Folder).where(
                Folder.owner_user_id == recipient.id,
                Folder.name == share_data.target_folder_name
            )
        )
        target_folder = result.scalar_one_or_none()
        
        if not target_folder:
            # Create folder if it doesn't exist
            # Need to calculate position
            from sqlalchemy import func
            result = await db.execute(
                select(func.max(Folder.position)).where(Folder.owner_user_id == recipient.id)
            )
            max_position = result.scalar()
            new_position = (max_position + 1) if max_position is not None else 0
            
            target_folder = Folder(
                owner_user_id=recipient.id,
                name=share_data.target_folder_name,
                icon="📁", # Default icon
                color="#667eea", # Default color
                position=new_position
            )
            db.add(target_folder)
            await db.flush() # Flush to get ID
            
        # 2. Create File Record for Recipient
        # We point to the SAME storage key (deduplication)
        recipient_file = File(
            owner_user_id=recipient.id,
            folder_id=target_folder.id,
            filename=file.filename,
            original_filename=file.original_filename,
            size_bytes=file.size_bytes,
            mime_type=file.mime_type,
            storage_key=file.storage_key,
            storage_bucket=file.storage_bucket,
            checksum_sha256=file.checksum_sha256,
            status="uploaded" # Visible to recipient
        )
        
        db.add(recipient_file)
        
        # Update recipient storage usage
        recipient.storage_used_bytes += file.size_bytes
        
        # TODO: Send notification to recipient
    
    await db.commit()
    await db.refresh(share)
    
    return {
        "id": str(share.id),
        "transaction_id": share.transaction_id,
        "file_id": str(file.id),
        "filename": file.filename,
        "sender_name": current_user.name,
        "recipient_name": share.recipient_name,
        "target_folder_name": share.target_folder_name,
        "status": share.status,
        "created_at": share.created_at.isoformat(),
        "message": share.message
    }

@router.get("/sent", response_model=List[ShareResponse])
async def get_sent_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all sent transactions (like bank statement)"""
    
    result = await db.execute(
        select(Share, File)
        .join(File, Share.file_id == File.id)
        .where(Share.sender_user_id == current_user.id)
        .order_by(Share.created_at.desc())
    )
    
    transactions = []
    for share, file in result.all():
        transactions.append({
            "id": str(share.id),
            "transaction_id": share.transaction_id,
            "file_id": str(file.id),
            "filename": file.filename,
            "sender_name": share.sender_name,
            "recipient_name": share.recipient_name or share.recipient_email,
            "target_folder_name": share.target_folder_name,
            "status": share.status,
            "created_at": share.created_at.isoformat(),
            "message": share.message
        })
    
    return transactions

@router.get("/received", response_model=List[ShareResponse])
async def get_received_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all received transactions (inbox)"""
    
    result = await db.execute(
        select(Share, File)
        .join(File, Share.file_id == File.id)
        .where(
            or_(
                Share.recipient_user_id == current_user.id,
                Share.recipient_email == current_user.email
            )
        )
        .order_by(Share.created_at.desc())
    )
    
    transactions = []
    for share, file in result.all():
        transactions.append({
            "id": str(share.id),
            "transaction_id": share.transaction_id,
            "file_id": str(file.id),
            "filename": file.filename,
            "sender_name": share.sender_name,
            "recipient_name": current_user.name,
            "target_folder_name": share.target_folder_name,
            "status": share.status,
            "created_at": share.created_at.isoformat(),
            "message": share.message
        })
    
    return transactions

@router.get("/{transaction_id}")
async def get_transaction_details(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get transaction details by transaction ID"""
    
    result = await db.execute(
        select(Share, File)
        .join(File, Share.file_id == File.id)
        .where(
            Share.transaction_id == transaction_id,
            or_(
                Share.sender_user_id == current_user.id,
                Share.recipient_user_id == current_user.id
            )
        )
    )
    
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    share, file = row
    
    return {
        "id": str(share.id),
        "transaction_id": share.transaction_id,
        "file": {
            "id": str(file.id),
            "filename": file.filename,
            "size_bytes": file.size_bytes,
            "mime_type": file.mime_type
        },
        "sender": {
            "name": share.sender_name,
            "email": share.sender_email
        },
        "recipient": {
            "name": share.recipient_name,
            "email": share.recipient_email
        },
        "target_folder": share.target_folder_name,
        "message": share.message,
        "status": share.status,
        "created_at": share.created_at.isoformat(),
        "delivered_at": share.delivered_at.isoformat() if share.delivered_at else None,
        "viewed_at": share.first_viewed_at.isoformat() if share.first_viewed_at else None
    }

@router.get("/{transaction_id}/receipt")
async def get_transaction_receipt(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get official transaction receipt data"""
    
    result = await db.execute(
        select(Share, File)
        .join(File, Share.file_id == File.id)
        .where(
            Share.transaction_id == transaction_id,
            or_(
                Share.sender_user_id == current_user.id,
                Share.recipient_user_id == current_user.id
            )
        )
    )
    
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    share, file = row
    
    # Generate a verification signature
    signature_base = f"{share.transaction_id}:{share.created_at.isoformat()}:{share.sender_user_id}:{share.recipient_user_id}:{file.checksum_sha256}"
    signature = hashlib.sha256(signature_base.encode()).hexdigest()
    
    return {
        "receipt_id": f"RCPT-{share.transaction_id[-8:]}",
        "transaction_id": share.transaction_id,
        "timestamp": share.created_at.isoformat(),
        "status": "SUCCESS" if share.status in ["sent", "delivered", "viewed"] else share.status,
        "sender": {
            "name": share.sender_name,
            "id": str(share.sender_user_id)
        },
        "recipient": {
            "name": share.recipient_name or share.recipient_email,
            "id": str(share.recipient_user_id) if share.recipient_user_id else None
        },
        "item": {
            "name": file.filename,
            "size": file.size_bytes,
            "checksum": file.checksum_sha256
        },
        "verification_signature": signature,
        "legal_disclaimer": "This is a computer generated receipt and does not require a physical signature. Verified by FileFlow."
    }
