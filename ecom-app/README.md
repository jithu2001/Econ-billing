# Ecom App - Business Configuration Feature

A React + Go application for managing business settings including property details and GST configuration.

## Setup Instructions

### Database Setup
1. Install PostgreSQL
2. Create a database named `ecom_db`
3. Run the schema from `backend/internal/database/schema.sql`

```sql
CREATE DATABASE ecom_db;
\c ecom_db;
-- Then run the contents of schema.sql
```

### Backend Setup
```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

The API will run on http://localhost:8080

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The React app will run on http://localhost:3000

## API Endpoints

- `GET /api/settings` - Fetch business configuration
- `POST /api/settings` - Save/update business configuration

## Environment Variables

For the backend, you can set:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_USER` (default: postgres)
- `DB_PASSWORD` (default: postgres)
- `DB_NAME` (default: ecom_db)
- `PORT` (default: 8080)

## Features

✅ Business property name configuration
✅ Property address management
✅ GST number storage
✅ GST percentage settings (0-100%)
✅ Form validation
✅ API integration
✅ Edit existing settings