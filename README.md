# Econ - Lodge Management System

A desktop application for managing lodge/hotel operations including room management, reservations, billing, and payments.

## Features

- Room Management - Add, edit, and track room inventory
- Reservation System - Create and manage guest reservations
- Customer Management - Maintain customer records
- Billing & Payments - Generate bills and process payments
- Bill Printing - Print invoices with customizable lodge details
- Settings - Configure lodge name, address, GST number, and contact info

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Go (Gin framework), SQLite
- **Desktop**: Electron

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Go backend server
│   ├── cmd/server/    # Main entry point
│   └── internal/      # Internal packages
├── desktop/           # Electron desktop wrapper
├── bin/               # Build output
│   ├── econ.exe       # Standalone backend executable
│   └── desktop/       # Electron build output
│       └── Econ.exe   # Portable desktop app
└── build.ps1          # Build script
```

## Prerequisites

- Node.js 18+
- Go 1.21+
- npm

## Quick Start (Development)

### Backend
```bash
cd backend
go run ./cmd/server
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Building

### Option 1: Build Standalone Backend

```powershell
./build.ps1
```

Creates `bin/econ.exe` - a single executable with frontend embedded.
Run it and open http://localhost:8080 in your browser.

### Option 2: Build Desktop Application (Recommended)

Run all commands from the project root (`d:\Trinity`):

1. Build the backend:
   ```powershell
   ./build.ps1
   ```

2. Copy backend to desktop folder:
   ```powershell
   Copy-Item "bin/econ.exe" "desktop/backend/econ.exe"
   ```

3. Install Electron dependencies (from project root):
   ```powershell
   cd desktop
   npm install
   ```

4. Build Electron app:
   ```powershell
   npm run build:win
   ```

5. Return to project root:
   ```powershell
   cd ..
   ```

Output: `bin/desktop/Econ.exe` - Portable desktop application

## Running

### Desktop App
Double-click `bin/desktop/Econ.exe`

### Standalone Backend
```bash
./bin/econ.exe
```
Then open http://localhost:8080

### Command Line Options
- `--server` or `-s`: Server-only mode (no browser auto-open)
- `--no-browser` or `-n`: Don't auto-open browser

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| SERVER_PORT | 8080 | HTTP server port |
| DATABASE_PATH | ./trinity.db | SQLite database path |
| JWT_SECRET | (default) | JWT token secret |
| REGISTRATION_TOKEN | 919847073856 | Token for user registration |

## Data Storage

- **Desktop App**: `%APPDATA%/econ/trinity.db`
- **Standalone**: `./trinity.db` (current directory)

## First Run

1. Launch the application
2. Click "Register" on the login page
3. Enter registration token: `919847073856`
4. Create your admin account
5. Configure lodge details in Settings

## License

MIT
