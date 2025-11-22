# FileFlow - UPI for Files

Production-grade file management platform. Send, receive, and organize files like UPI transactions.

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- AWS S3 (or MinIO)

### Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your credentials

# Database
createdb fileflow
alembic upgrade head

# Run
python run.py
```

Server: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

## API Endpoints

**Auth**
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login

**Files**
- `POST /api/v1/files/upload/init` - Start upload
- `POST /api/v1/files/upload/{id}/complete` - Complete upload
- `GET /api/v1/files` - List files
- `GET /api/v1/files/{id}/download` - Download

**Shares (Transactions)**
- `POST /api/v1/shares` - Send file
- `GET /api/v1/shares/sent` - Sent transactions
- `GET /api/v1/shares/received` - Received transactions

**Folders**
- `GET /api/v1/folders` - List folders
- `POST /api/v1/folders` - Create folder

**Search**
- `GET /api/v1/search?q=query` - Search files

## Architecture

- **Backend**: FastAPI (async)
- **Database**: PostgreSQL + Redis
- **Storage**: AWS S3 (presigned URLs)
- **Queue**: Celery + Redis
- **Search**: ElasticSearch

## Security

- JWT authentication
- Bcrypt password hashing
- Rate limiting
- CORS protection
- Presigned URLs (direct S3 access)
- Input validation

## Production Deploy

```bash
# Install
pip install -r requirements.txt

# Configure production .env
ENVIRONMENT=production
DEBUG=False

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## License

Proprietary
