# FileFlow Web - Next.js Frontend

Production-grade web application for FileFlow.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- User authentication (register/login)
- Dashboard with folders
- File upload/download
- Send files (UPI-like)
- Transaction history
- Search files
- Storage management

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (API client)

## Environment

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Build

```bash
npm run build
npm start
```
