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

storage_service = S3StorageService()
