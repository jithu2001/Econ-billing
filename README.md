# Trinity Lodge Management System

A comprehensive hotel management system built with Go backend and React frontend.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Customer Management
- Add, edit, and manage customer records
- Store customer details including ID proofs
- View customer history and associated bookings

### Room Management
- Manage room types and pricing
- Track room availability status (Available, Occupied, Maintenance)
- Room type categorization

### Reservation System
- Create and manage reservations
- Check-in and checkout functionality
- Date-based availability checking
- Prevent overlapping bookings
- Cancel reservations
- Future booking management

### Billing System
- Generate bills for rooms, food, and other services
- Multiple bill types: ROOM, WALK_IN, FOOD, MANUAL
- Tax and discount calculations
- Payment tracking (Cash, Card, UPI)
- Bill status management (Draft, Finalized, Paid, Unpaid)
- Filter bills by status, customer, and date range

### Dashboard & Analytics
- Real-time statistics
- Total customers, active reservations, available rooms
- Pending bills count
- Recent reservations and bills
- Quick action buttons

---

## 🛠️ Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin (HTTP web framework)
- **ORM**: GORM
- **Database**: SQLite (glebarez/sqlite - pure Go driver)
- **Authentication**: JWT tokens
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.0
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Go** 1.21 or higher - [Download](https://golang.org/dl/)
- **Node.js** 18.x or higher - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Trinity
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Download Go dependencies
go mod download

# Build the backend
go build -o ../bin/trinity-backend.exe ./cmd/server
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Or using yarn
yarn install
```

---

## ⚙️ Configuration

### Backend Configuration

The backend uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
SERVER_PORT=8080

# Database
DATABASE_PATH=./trinity.db

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Registration Token (required for creating new accounts)
REGISTRATION_TOKEN=919847073856

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

**⚠️ Security Note**:
- Never commit the `.env` file to version control
- Always use a strong, random JWT_SECRET in production
- Change the REGISTRATION_TOKEN to a secure value - only users with this token can create accounts
- Change default credentials after first login

### Frontend Configuration

Frontend configuration is handled through Vite. If needed, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

---

## 🏃 Running the Application

### Development Mode

#### Start Backend

```bash
# From project root
cd backend
go run cmd/server/main.go

# Or use the compiled binary
cd ..
./bin/trinity-backend.exe
```

The backend will start on `http://localhost:8080`

#### Start Frontend

```bash
# From project root
cd frontend
npm run dev

# Or using yarn
yarn dev
```

The frontend will start on `http://localhost:5173` (or next available port)

### Production Build

#### Backend

```bash
cd backend
go build -o ../bin/trinity-backend.exe ./cmd/server
```

#### Frontend

```bash
cd frontend
npm run build

# Build output will be in frontend/dist/
```

Serve the built frontend using a web server (nginx, Apache, etc.) and configure it to proxy API requests to the backend.

---

## 📁 Project Structure

```
Trinity/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go              # Entry point
│   ├── internal/
│   │   ├── config/
│   │   │   ├── config.go            # Configuration
│   │   │   └── database.go          # Database setup
│   │   ├── models/
│   │   │   ├── user.go              # User model
│   │   │   ├── customer.go          # Customer model
│   │   │   ├── room.go              # Room models
│   │   │   ├── reservation.go       # Reservation model
│   │   │   ├── bill.go              # Bill model
│   │   │   └── payment.go           # Payment model
│   │   ├── repository/
│   │   │   ├── user_repository.go
│   │   │   ├── customer_repository.go
│   │   │   ├── room_repository.go
│   │   │   ├── reservation_repository.go
│   │   │   ├── bill_repository.go
│   │   │   └── payment_repository.go
│   │   ├── services/
│   │   │   ├── auth_service.go
│   │   │   ├── customer_service.go
│   │   │   ├── room_service.go
│   │   │   ├── reservation_service.go
│   │   │   ├── bill_service.go
│   │   │   └── payment_service.go
│   │   ├── handlers/
│   │   │   ├── auth_handler.go
│   │   │   ├── customer_handler.go
│   │   │   ├── room_handler.go
│   │   │   ├── reservation_handler.go
│   │   │   ├── bill_handler.go
│   │   │   └── payment_handler.go
│   │   ├── middleware/
│   │   │   ├── auth.go              # JWT authentication
│   │   │   └── cors.go              # CORS middleware
│   │   └── routes/
│   │       └── routes.go            # Route definitions
│   ├── pkg/
│   │   └── utils/
│   │       ├── jwt.go               # JWT utilities
│   │       └── password.go          # Password hashing
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── MainLayout.tsx   # Main layout
│   │   │   ├── ui/                  # UI components
│   │   │   ├── customers/
│   │   │   ├── rooms/
│   │   │   └── reservations/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerList.tsx
│   │   │   │   └── CustomerDetails.tsx
│   │   │   ├── rooms/
│   │   │   │   └── RoomList.tsx
│   │   │   ├── reservations/
│   │   │   │   └── ReservationList.tsx
│   │   │   ├── bills/
│   │   │   │   └── BillList.tsx
│   │   │   └── Login.tsx
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── room.service.ts
│   │   │   ├── reservation.service.ts
│   │   │   └── bill.service.ts
│   │   ├── lib/
│   │   │   ├── api.ts               # Axios setup
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── bin/                              # Compiled binaries
├── .gitignore
└── README.md
```

---

## 🔌 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "role": "ADMIN",
  "registration_token": "919847073856"
}
```

**Note**: Registration requires a valid registration token (configured in `.env`). Only users with the correct token can create accounts. See [REGISTRATION_TOKEN.md](REGISTRATION_TOKEN.md) for details.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### Customers

#### Get All Customers
```http
GET /api/customers
Authorization: Bearer <token>
```

#### Create Customer
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "id_proof_type": "Passport",
  "id_proof_number": "AB1234567"
}
```

### Rooms

#### Get All Rooms
```http
GET /api/rooms
Authorization: Bearer <token>
```

#### Create Room
```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_number": "101",
  "type_id": "uuid",
  "status": "AVAILABLE"
}
```

### Reservations

#### Create Reservation
```http
POST /api/reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": "uuid",
  "room_id": "uuid",
  "check_in_date": "2026-01-15",
  "expected_check_out_date": "2026-01-18"
}
```

#### Check-In
```http
PUT /api/reservations/:id/checkin
Authorization: Bearer <token>
```

#### Checkout
```http
PUT /api/reservations/:id/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "checkout_date": "2026-01-18"
}
```

#### Cancel Reservation
```http
PUT /api/reservations/:id/cancel
Authorization: Bearer <token>
```

### Bills

#### Create Bill
```http
POST /api/bills
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": "uuid",
  "reservation_id": "uuid",
  "bill_type": "ROOM",
  "bill_date": "2026-01-15",
  "subtotal": 5000,
  "tax_amount": 500,
  "discount_amount": 100,
  "total_amount": 5400,
  "status": "FINALIZED",
  "line_items": [
    {
      "description": "Room charge - 2 nights",
      "amount": 5000
    }
  ]
}
```

#### Add Payment
```http
POST /api/bills/:id/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5400,
  "payment_method": "CASH",
  "payment_date": "2026-01-15"
}
```

---

## 🎯 Key Features Explained

### Reservation Check-In Flow

1. **Create Reservation**: Book a room for future dates
2. **Room Status**: Room remains AVAILABLE until check-in
3. **Check-In**: On the check-in date, staff clicks "Check In"
4. **Status Update**:
   - Reservation gets `actual_check_in_date` set
   - Room status changes to OCCUPIED
5. **Checkout**: Staff clicks "Checkout"
   - Reservation status becomes COMPLETED
   - Room status changes back to AVAILABLE

### Overlapping Reservation Prevention

The system prevents double-booking:
- When creating a reservation, it checks for overlapping dates
- Overlap logic: `new_check_in < existing_checkout AND new_checkout > existing_checkin`
- Back-to-back reservations are allowed (checkout date = next check-in date)

### Bill Workflow

1. **Draft**: Initial bill creation
2. **Finalized**: Bill is finalized, ready for payment
3. **Paid**: Payment received
4. **Unpaid**: Finalized but not paid

---

## 🔐 Default Credentials

**Username**: `admin`
**Password**: `admin`

**⚠️ IMPORTANT**: Change the default password after first login!

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🐛 Common Issues & Solutions

### Backend won't start
- **Issue**: Database error
- **Solution**: Delete `trinity.db` and restart (will create fresh database)

### Frontend can't connect to backend
- **Issue**: CORS error
- **Solution**: Check `ALLOWED_ORIGINS` in backend configuration includes frontend URL

### Build fails
- **Issue**: Missing dependencies
- **Solution**: Run `go mod download` (backend) or `npm install` (frontend)

---

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Backend server port | `8080` |
| `DATABASE_PATH` | SQLite database file path | `./trinity.db` |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `REGISTRATION_TOKEN` | Token required for user registration | `919847073856` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |

---

## 🚢 Deployment

### Backend Deployment

1. Build the binary:
   ```bash
   go build -o trinity-backend ./cmd/server
   ```

2. Set environment variables on your server

3. Run the binary:
   ```bash
   ./trinity-backend
   ```

### Frontend Deployment

1. Build for production:
   ```bash
   npm run build
   ```

2. Serve the `dist/` folder using:
   - **Nginx**
   - **Apache**
   - **Caddy**
   - Or any static file server

3. Configure reverse proxy for API requests

---

## 📊 Database Schema

### Tables

- **users** - System users (admin, staff)
- **customers** - Hotel guests
- **room_types** - Room categories (Standard, Deluxe, Suite)
- **rooms** - Individual rooms
- **reservations** - Room bookings
- **bills** - Customer bills
- **bill_line_items** - Bill items breakdown
- **payments** - Payment records

### Relationships

- Customer → Reservations (1:N)
- Customer → Bills (1:N)
- Room → Reservations (1:N)
- Reservation → Bills (1:1)
- Bill → Line Items (1:N)
- Bill → Payments (1:N)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- Built with [Go](https://golang.org/)
- Powered by [React](https://react.dev/)
- UI inspired by [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ for hotel management**
