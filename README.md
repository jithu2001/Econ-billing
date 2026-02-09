<p align="center">
  <img src="icon/icon.png" alt="Econ Logo" width="120" />
</p>

<h1 align="center">Econ</h1>

<p align="center">
  <strong>Modern Lodge & Hotel Management System</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Windows-lightgrey" alt="Platform" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

<p align="center">
  A lightweight desktop application for managing lodge operations — rooms, reservations, customers, billing with GST support, and invoice printing.
</p>

---

## Features

- **Room Management** — Add rooms, define room types with default rates, track availability
- **Reservation System** — Create, check-in, check-out, and cancel reservations
- **Customer Records** — Maintain guest details with ID proof tracking
- **GST Billing** — Generate GST and Non-GST invoices with configurable invoice series
- **Invoice Printing** — Clean, modern A4 invoice layout with amount in words
- **Multi-tenant** — Each admin account has isolated data
- **Settings** — Configure lodge name, address, GSTIN, state info, and invoice numbering

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend** | Go (Gin), GORM, SQLite |
| **Desktop** | Electron |

## Project Structure

```
econ/
├── frontend/              # React SPA
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route pages
│       ├── services/      # API service layer
│       └── types/         # TypeScript interfaces
├── backend/               # Go REST API
│   ├── cmd/server/        # Entry point
│   └── internal/
│       ├── config/        # App & database config
│       ├── handlers/      # HTTP handlers
│       ├── middleware/     # Auth & CORS
│       ├── models/        # GORM models
│       ├── repository/    # Database queries
│       ├── services/      # Business logic
│       └── web/           # Embedded frontend (build output)
├── desktop/               # Electron wrapper
├── build.ps1              # PowerShell build script
└── build.bat              # Batch build script
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Go](https://go.dev/) 1.21+
- npm

## Quick Start (Development)

**Backend**
```bash
cd backend
go run ./cmd/server
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

### Option 1: Standalone Executable

```powershell
# From project root
./build.ps1
```

Creates `bin/econ.exe` — a single executable with the frontend embedded. Run it and it auto-opens http://localhost:8080.

### Option 2: Desktop App (Recommended)

```powershell
# 1. Build backend with embedded frontend
./build.ps1

# 2. Copy backend to desktop folder
New-Item -ItemType Directory -Path "desktop/backend" -Force
Copy-Item "bin/econ.exe" "desktop/backend/econ.exe"

# 3. Build Electron app
cd desktop
npm install
npm run build:win
cd ..
```

Output: `bin/desktop/Econ.exe` — Portable desktop application.

## Running

| Method | Command |
|--------|---------|
| **Desktop App** | Double-click `bin/desktop/Econ.exe` |
| **Standalone** | `./bin/econ.exe` |
| **Server mode** | `./bin/econ.exe --server` (no browser auto-open) |

## Configuration

Environment variables (optional — sensible defaults are provided):

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | HTTP server port |
| `DATABASE_PATH` | `./trinity.db` | SQLite database file path |
| `JWT_SECRET` | Auto-generated | JWT signing key (persisted to `.jwt_secret` file) |
| `REGISTRATION_TOKEN` | `919847073856` | Token required for new account registration |

## Data Storage

| Mode | Database Location |
|------|------------------|
| Desktop App | `%APPDATA%/econ/trinity.db` |
| Standalone | `./trinity.db` (working directory) |

## First Run

1. Launch the application
2. Click **"Don't have an account? Sign up"** on the login page
3. Enter the registration token: `919847073856`
4. Create your admin account
5. Go to **Settings** to configure your lodge details (name, address, GSTIN, etc.)
6. Start adding rooms, customers, and reservations

## License

MIT
