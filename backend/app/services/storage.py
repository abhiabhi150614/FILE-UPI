import boto3
from botocore.exceptions import ClientError
from datetime import datetime
import hashlib
from typing import Optional
from app.config import settings

class S3StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.S3_BUCKET
    
    def generate_storage_key(self, user_id: str, filename: str) -> str:
        """Generate unique S3 key for file storage"""
        timestamp = datetime.utcnow().isoformat()
        unique_id = hashlib.sha256(f"{user_id}{filename}{timestamp}".encode()).hexdigest()[:16]
        return f"users/{user_id}/files/{unique_id}/{filename}"
    
    def create_presigned_upload_url(
        self,
        storage_key: str,
        content_type: str,
        expires_in: int = None
    ) -> str:
        """Generate presigned URL for direct upload to S3"""
        if expires_in is None:
            expires_in = settings.S3_PRESIGNED_URL_EXPIRY
        
        try:
            url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': storage_key,
                    'ContentType': content_type,
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate upload URL: {str(e)}")
    
    def create_presigned_download_url(
        self,
        storage_key: str,
        expires_in: int = None,
        filename: Optional[str] = None
    ) -> str:
        """Generate presigned URL for download"""
        if expires_in is None:
            expires_in = settings.S3_PRESIGNED_URL_EXPIRY
        
        params = {
            'Bucket': self.bucket,
            'Key': storage_key
        }
        
        if filename:
            params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate download URL: {str(e)}")
    
    def delete_file(self, storage_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=storage_key)
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete file: {str(e)}")
    
    def check_file_exists(self, storage_key: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.s3_client.head_object(Bucket=self.bucket, Key=storage_key)
            return True
        except ClientError:
            return False

    def download_file_obj(self, storage_key: str, file_obj):
        """Download file to file-like object"""
        try:
            self.s3_client.download_fileobj(self.bucket, storage_key, file_obj)
        except ClientError as e:
            raise Exception(f"Failed to download file: {str(e)}")

    def upload_file_obj(self, file_obj, storage_key: str, content_type: str = None):
        """Upload file-like object to S3"""
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
            
        try:
            self.s3_client.upload_fileobj(
                file_obj, 
                self.bucket, 
                storage_key,
                ExtraArgs=extra_args
            )
        except ClientError as e:
            raise Exception(f"Failed to upload file: {str(e)}")

import os
import shutil
from pathlib import Path

class LocalStorageService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        # Create subdirectories for organization if needed, but flat or user-based is fine.
        # We'll stick to the key structure.
    
    def generate_storage_key(self, user_id: str, filename: str) -> str:
        """Generate unique key for file storage"""
        timestamp = datetime.utcnow().isoformat()
        unique_id = hashlib.sha256(f"{user_id}{filename}{timestamp}".encode()).hexdigest()[:16]
        # Ensure the directory exists
        user_dir = self.upload_dir / "users" / user_id / "files" / unique_id
        user_dir.mkdir(parents=True, exist_ok=True)
        return str(user_dir / filename)
    
    def create_presigned_upload_url(
        self,
        storage_key: str,
        content_type: str,
        expires_in: int = None
    ) -> str:
        """
        For local storage, we don't have presigned URLs. 
        But since we switched to /upload/direct, this might not be called for the main flow.
        However, if the frontend still calls initUpload, we need to return something.
        We can return a URL that points to our own backend upload endpoint if we wanted to support the 2-step flow,
        but since we are using direct upload now, this is less critical.
        Let's return a dummy URL or the direct endpoint.
        """
        return f"{settings.API_V1_PREFIX}/files/upload/direct" 
    
    def create_presigned_download_url(
        self,
        storage_key: str,
        expires_in: int = None,
        filename: Optional[str] = None
    ) -> str:
        """
        For local storage, we serve files via an endpoint.
        We'll return a URL to a new download endpoint we might need to create, 
        or just return the file directly in the API.
        The current API uses this to get a URL. 
        Let's assume we will serve files via /files/{id}/content or similar.
        For now, let's return a placeholder or modify the API to serve content directly.
        Actually, the API calls this. 
        """
        # We need a way to serve these files. 
        # For now, let's return a relative path that the frontend can use if we serve static files,
        # or better, the API should handle the download.
        # The current API implementation for get_download_url returns this URL.
        # We should probably change the API to stream the file if it's local.
        return f"/api/v1/files/download/proxy?key={storage_key}"

    def delete_file(self, storage_key: str) -> bool:
        """Delete file from local storage"""
        try:
            path = Path(storage_key)
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception as e:
            raise Exception(f"Failed to delete file: {str(e)}")
    
    def check_file_exists(self, storage_key: str) -> bool:
        """Check if file exists"""
        return Path(storage_key).exists()

    def download_file_obj(self, storage_key: str, file_obj):
        """Download file to file-like object"""
        try:
            with open(storage_key, 'rb') as f:
                shutil.copyfileobj(f, file_obj)
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")

    def upload_file_obj(self, file_obj, storage_key: str, content_type: str = None):
        """Upload file-like object to local storage"""
        try:
            # Ensure directory exists (it should be part of the key generation, but double check)
            Path(storage_key).parent.mkdir(parents=True, exist_ok=True)
            
            with open(storage_key, 'wb') as f:
                shutil.copyfileobj(file_obj, f)
        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")

# Switch to Local Storage
storage_service = LocalStorageService()
# storage_service = S3StorageService()
