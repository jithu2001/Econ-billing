# Trinity Lodge Backend

Backend API for Trinity Lodge Daily Rate Room Rental Billing System.

## Tech Stack

- **Language**: Golang
- **Framework**: Gin
- **Database**: SQLite with GORM
- **Authentication**: JWT

## Project Structure

```
backend/
├── cmd/server/         # Main application entry point
├── internal/
│   ├── config/         # Configuration and database setup
│   ├── models/         # Database models
│   ├── repository/     # Data access layer
│   ├── services/       # Business logic layer
│   ├── handlers/       # HTTP handlers (controllers)
│   ├── middleware/     # Middleware (auth, CORS)
│   └── routes/         # Route definitions
└── pkg/utils/          # Utility functions (JWT, password hashing)
```

## Setup

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Run the server:
   ```bash
   go run cmd/server/main.go
   ```

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/bills` - Get customer bills

### Room Types
- `GET /api/room-types` - Get all room types
- `POST /api/room-types` - Create room type
- `PUT /api/room-types/:id` - Update room type

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room

### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/:id` - Get reservation by ID
- `PUT /api/reservations/:id/checkout` - Checkout reservation

### Bills
- `POST /api/bills` - Create bill
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills/:id/finalize` - Finalize bill
- `POST /api/bills/:id/payments` - Add payment to bill
- `GET /api/bills/:id/payments` - Get bill payments

## First Time Setup

After starting the server, create an admin user:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"ADMIN"}'
```

## Database

The SQLite database file (`trinity.db`) will be created automatically on first run with all necessary tables.

## Development

```bash
# Run with hot reload (install air first: go install github.com/air-verse/air@latest)
air

# Build
go build -o server cmd/server/main.go

# Run tests (when tests are added)
go test ./...
```
