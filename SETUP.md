# Trinity Lodge - Setup Guide

Complete setup guide for running the Trinity Lodge application.

## Prerequisites

- Go 1.23+ installed
- Node.js 18+ and npm installed
- Git installed

## Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Go dependencies**
   ```bash
   go mod download
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your settings:
   ```
   SERVER_PORT=8080
   DATABASE_PATH=./trinity-lodge.db
   JWT_SECRET=your-secret-key-change-this-in-production
   ALLOWED_ORIGINS=http://localhost:5173
   ```

4. **Run the backend server**
   ```bash
   go run cmd/server/main.go
   ```

   Or build and run:
   ```bash
   go build -o server.exe cmd/server/main.go
   ./server.exe
   ```

   The backend will be running at `http://localhost:8080`

5. **Create the first admin user**

   Use curl or Postman to register the first admin user:
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123", "role": "ADMIN"}'
   ```

## Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   The `.env` file should contain:
   ```
   VITE_API_URL=http://localhost:8080
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:5173`

5. **Login**

   Navigate to `http://localhost:5173/login` and use the admin credentials you created.

## Quick Start (Both Services)

**Terminal 1 - Backend:**
```bash
cd backend
go run cmd/server/main.go
```

**Terminal 2 - Create Admin User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123", "role": "ADMIN"}'
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Testing the Setup

1. **Check backend health**
   ```bash
   curl http://localhost:8080/health
   ```
   Should return: `{"status":"ok"}`

2. **Login to frontend**
   - Navigate to http://localhost:5173
   - You'll be redirected to the login page
   - Enter username: `admin`, password: `admin123`
   - You should be redirected to the dashboard

## Project Structure

```
Trinity/
├── backend/
│   ├── cmd/server/          # Main application entry point
│   ├── internal/
│   │   ├── config/          # Configuration and database setup
│   │   ├── handlers/        # HTTP request handlers
│   │   ├── middleware/      # Authentication and CORS middleware
│   │   ├── models/          # Database models
│   │   ├── repository/      # Data access layer
│   │   ├── routes/          # API route definitions
│   │   └── services/        # Business logic layer
│   └── pkg/utils/           # Utilities (JWT, password hashing)
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable React components
    │   ├── lib/             # API client setup
    │   ├── pages/           # Page components
    │   ├── services/        # API service layer
    │   └── types/           # TypeScript type definitions
    └── public/              # Static assets
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints (require JWT token)
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/rooms` - Get all rooms
- `POST /api/reservations` - Create reservation
- `POST /api/bills` - Create bill
- And many more...

See `backend/README.md` for complete API documentation.

## Troubleshooting

### Backend won't start
- Check if port 8080 is already in use
- Verify Go is installed: `go version`
- Check database file permissions

### Frontend won't connect to backend
- Verify backend is running on port 8080
- Check CORS settings in backend `.env`
- Verify `VITE_API_URL` in frontend `.env`

### Login fails
- Ensure you created an admin user
- Check backend logs for errors
- Verify JWT_SECRET is set in backend `.env`

## Production Deployment

### Backend
1. Build the binary:
   ```bash
   go build -o trinity-lodge cmd/server/main.go
   ```

2. Set production environment variables
3. Run behind a reverse proxy (nginx/Apache)
4. Enable HTTPS
5. Set `GIN_MODE=release`

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder with a web server
3. Update `VITE_API_URL` to production backend URL

## Security Notes

- Change `JWT_SECRET` to a strong random string in production
- Use HTTPS in production
- Implement rate limiting
- Regular database backups
- Keep dependencies updated

## Support

For issues and questions, please check the documentation or create an issue in the repository.
