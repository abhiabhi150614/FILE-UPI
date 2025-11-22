# FileFlow - UPI for Files

**Send, Receive, and Organize Files Like Bank Transactions**

FileFlow is a production-grade file management platform that makes sharing and organizing documents as simple as sending money through UPI. Perfect for hospitals, shops, companies, and individuals.

## 🎯 Key Features

### For Everyone
- **📤 Send Files Like UPI**: Select recipient, choose folder, send - get transaction receipt
- **📥 Organized Inbox**: All received files automatically organized in folders
- **🔍 Smart Search**: Find any document instantly, even text inside PDFs
- **📱 Mobile & Web**: Works seamlessly on all devices
- **🔐 Bank-Level Security**: Encrypted storage, secure sharing, audit trails

### For Businesses
- **🏥 Hospitals**: Send reports directly to patient folders
- **🏪 Shops**: Send bills/receipts digitally
- **🏢 Companies**: Share documents with employees (payslips, contracts)
- **📊 Analytics**: Track delivery, views, and engagement

## 🏗️ Architecture

```
Frontend (Web)     →  Next.js 14 + TypeScript
Frontend (Mobile)  →  React Native (Expo)
Backend API        →  FastAPI (Python 3.11+)
Database           →  PostgreSQL + Redis
Storage            →  AWS S3 (or MinIO)
Search             →  ElasticSearch
Queue              →  Celery + Redis
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- AWS S3 account (or MinIO)
- Node.js 18+ (for frontend)

### Backend Setup

1. **Clone and navigate**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Setup database**
```bash
# Create PostgreSQL database
createdb fileflow

# Run migrations
alembic upgrade head
```

6. **Run server**
```bash
python -m app.main
# Or with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/storage` - Get storage usage

### Folders
- `GET /api/v1/folders` - List all folders
- `POST /api/v1/folders` - Create new folder
- `DELETE /api/v1/folders/{id}` - Delete folder

### Files
- `POST /api/v1/files/upload/init` - Initialize upload (get presigned URL)
- `POST /api/v1/files/upload/{id}/complete` - Complete upload
- `GET /api/v1/files` - List files
- `GET /api/v1/files/{id}/download` - Get download URL
- `DELETE /api/v1/files/{id}` - Delete file

### Shares (Transactions)
- `POST /api/v1/shares` - Send file to someone
- `GET /api/v1/shares/sent` - Get sent transactions
- `GET /api/v1/shares/received` - Get received transactions
- `GET /api/v1/shares/{transaction_id}` - Get transaction details

### Search
- `GET /api/v1/search?q=query` - Search files

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: Prevent abuse
- **CORS Protection**: Configured origins only
- **Presigned URLs**: Direct S3 upload/download (backend never handles files)
- **Virus Scanning**: Automatic scan on upload
- **Encryption**: Files encrypted at rest in S3

## 💾 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **folders**: Folder organization
- **files**: File metadata and storage info
- **shares**: Transaction records (UPI-like)
- **audit_events**: Complete audit trail

## 📊 Storage Quotas

- **Free Plan**: 5 GB
- **Premium Plan**: 50 GB (₹99/month)
- **Family Plan**: 200 GB (₹199/month)
- **Business**: Custom pricing

## 🎨 Default Folders

Every new user gets:
- 🧾 Bills
- 🏥 Hospital Reports
- 🏢 Company
- 🎓 Education
- 🧾 Receipts
- 👤 Personal

## 🔄 File Upload Flow

1. **Client**: Request upload initialization
2. **Backend**: Generate presigned S3 URL, create file record
3. **Client**: Upload directly to S3 using presigned URL
4. **Client**: Notify backend upload complete
5. **Backend**: Update file status, trigger processing (virus scan, OCR)

## 📤 File Sharing Flow (UPI-like)

1. **Sender**: Select file, choose recipient, select target folder
2. **Backend**: Create transaction record with unique ID
3. **Backend**: Notify recipient (email/SMS/push)
4. **Recipient**: File appears in their folder
5. **Both**: Can view transaction history with status

## 🧪 Testing

```bash
pytest
```

## 📈 Production Deployment

### Environment Variables
Set all variables in `.env`:
- Database credentials
- AWS S3 credentials
- JWT secrets
- Email/SMS API keys
- Monitoring (Sentry)

### Database
- Use connection pooling
- Setup read replicas for scale
- Regular backups

### Storage
- Use S3 with lifecycle policies
- Enable versioning
- Setup CDN (CloudFront)

### Monitoring
- Sentry for error tracking
- Prometheus + Grafana for metrics
- ELK stack for logs

### Scaling
- Run multiple API instances behind load balancer
- Use Redis for caching and sessions
- Celery workers for background tasks
- ElasticSearch cluster for search

## 🛠️ Tech Stack Details

### Backend
- **FastAPI**: Modern, fast, async Python framework
- **SQLAlchemy**: ORM with async support
- **Alembic**: Database migrations
- **Pydantic**: Data validation
- **Boto3**: AWS S3 integration
- **Celery**: Background task processing
- **Redis**: Caching and queue
- **JWT**: Authentication

### Why These Choices?
- **FastAPI**: 3x faster than Flask, automatic API docs, async support
- **PostgreSQL**: ACID compliance, JSONB support, proven at scale
- **S3**: Scalable, durable, cost-effective storage
- **Presigned URLs**: Reduces backend load, faster uploads/downloads

## 📱 Mobile & Web Apps

### Web (Next.js)
```bash
cd web
npm install
npm run dev
```

### Mobile (React Native)
```bash
cd mobile
npm install
npx expo start
```

## 🤝 Use Cases

### 🏥 Healthcare
- Doctor sends test results to patient's "Hospital Reports" folder
- Patient can access all medical history instantly
- Share with new doctors securely

### 💰 Financial
- Shops send bills to customer's "Bills" folder
- All receipts organized and searchable
- Easy tax filing

### 🏢 Professional
- Companies send documents to employee folders
- Complete audit trail
- Easy document retrieval

## 📞 Support

For issues or questions:
- Email: support@fileflow.com
- Documentation: https://docs.fileflow.com

## 📄 License

Proprietary - All rights reserved

## 🚀 Roadmap

- [ ] OCR for all document types
- [ ] AI-powered auto-categorization
- [ ] QR code generation for easy sharing
- [ ] Offline mode for mobile
- [ ] E-signature integration
- [ ] Blockchain verification for legal documents
- [ ] Multi-language support
- [ ] WhatsApp integration

---

**Built with ❤️ for making file management as simple as UPI**
