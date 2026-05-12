# Econ — Wails v2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Electron + Gin (HTTP/JWT) wrapper with Wails v2, exposing existing Go service-layer logic to React via Wails bindings while preserving GORM models, SQLite repositories, Indian GST billing logic, and the Tailwind/React 19 frontend.

**Architecture:** A single Wails v2 project at the repo root hosts the Go backend (App + per-domain Binding structs) and the React/TS frontend under `frontend/`. IPC is local, so JWT/CORS/Bearer auth are deleted; an in-memory `Session` (holding `CurrentUserID uuid.UUID`) is mutated by `AuthBinding.Login` and read by every other binding. SQLite lives at `%APPDATA%/econ/econ.db` and is opened in `OnStartup`. Frontend service modules are replaced by thin wrappers around `wailsjs/go/bindings/*` generated bindings.

**Tech Stack:** Go 1.22+, Wails v2 (`github.com/wailsapp/wails/v2`), GORM (`gorm.io/gorm`), pure-Go SQLite (`github.com/glebarez/sqlite`), `github.com/google/uuid`, bcrypt (`golang.org/x/crypto/bcrypt`); React 19 + TypeScript 5.9 + Vite 7 + Tailwind 3.4 + react-router-dom 7.

---

## App Struct & Binding Surface (reference for all binding tasks)

The Wails IPC surface is composed of **eight bound types**:

| Binding (Go type)  | Source file (new)     | Frontend module (auto-gen) | Replaces (old)                            |
|--------------------|-----------------------|----------------------------|-------------------------------------------|
| `*App`             | `app.go`              | `wailsjs/go/main/App.ts`   | Electron `main.js` lifecycle              |
| `*AuthBinding`     | `bindings/auth.go`    | `wailsjs/go/bindings/AuthBinding.ts`     | `handlers/auth_handler.go` + `middleware/auth.go` |
| `*CustomerBinding` | `bindings/customer.go`| `wailsjs/go/bindings/CustomerBinding.ts` | `handlers/customer_handler.go`            |
| `*RoomBinding`     | `bindings/room.go`    | `wailsjs/go/bindings/RoomBinding.ts`     | `handlers/room_handler.go`                |
| `*ReservationBinding` | `bindings/reservation.go` | `wailsjs/go/bindings/ReservationBinding.ts` | `handlers/reservation_handler.go` |
| `*BillBinding`     | `bindings/bill.go`    | `wailsjs/go/bindings/BillBinding.ts`     | `handlers/bill_handler.go`                |
| `*PaymentBinding`  | `bindings/payment.go` | `wailsjs/go/bindings/PaymentBinding.ts`  | `handlers/payment_handler.go`             |
| `*SettingsBinding` | `bindings/settings.go`| `wailsjs/go/bindings/SettingsBinding.ts` | `handlers/settings_handler.go`            |

**Shared dependency (not bound):** `session.Session` — an in-memory holder injected into every binding constructor.

```go
// internal/session/session.go
package session

import (
    "errors"
    "sync"
    "github.com/google/uuid"
)

type Session struct {
    mu  sync.RWMutex
    uid uuid.UUID  // uuid.Nil = not logged in
}

func New() *Session { return &Session{} }

func (s *Session) Set(id uuid.UUID) {
    s.mu.Lock(); defer s.mu.Unlock(); s.uid = id
}

func (s *Session) Clear() {
    s.mu.Lock(); defer s.mu.Unlock(); s.uid = uuid.Nil
}

func (s *Session) UserID() (uuid.UUID, error) {
    s.mu.RLock(); defer s.mu.RUnlock()
    if s.uid == uuid.Nil {
        return uuid.Nil, errors.New("not authenticated")
    }
    return s.uid, nil
}
```

### `App` — root binding

```go
type App struct {
    ctx context.Context
    db  *gorm.DB
}

func (a *App) OnStartup(ctx context.Context)  // opens DB, runs migrations
func (a *App) OnShutdown(ctx context.Context) // closes DB
func (a *App) MinimizeWindow()                // wraps runtime.WindowMinimise
func (a *App) MaximizeWindow()                // wraps runtime.WindowToggleMaximise
func (a *App) CloseWindow()                   // wraps runtime.Quit
func (a *App) ShowSaveDialog(defaultName string) (string, error) // wraps runtime.SaveFileDialog
```

### `AuthBinding`

```go
type LoginResult struct {
    User models.User `json:"user"`
}

func (b *AuthBinding) Login(username, password string) (*LoginResult, error)
func (b *AuthBinding) Register(username, password, role, registrationToken string) (*LoginResult, error)
func (b *AuthBinding) Logout() error
func (b *AuthBinding) CurrentUser() (*models.User, error)
func (b *AuthBinding) IsAuthenticated() bool
```

### `CustomerBinding`

```go
func (b *CustomerBinding) GetAll() ([]models.Customer, error)
func (b *CustomerBinding) GetByID(id string) (*models.Customer, error)
func (b *CustomerBinding) Create(input CustomerInput) (*models.Customer, error)
func (b *CustomerBinding) Update(id string, input CustomerInput) (*models.Customer, error)
func (b *CustomerBinding) Delete(id string) error
```
`CustomerInput` mirrors `services.CreateCustomerRequest` (FullName, Phone, Address, IDProofType, IDProofNumber).

### `RoomBinding`

```go
func (b *RoomBinding) GetAllRoomTypes() ([]models.RoomType, error)
func (b *RoomBinding) CreateRoomType(input RoomTypeInput) (*models.RoomType, error)
func (b *RoomBinding) UpdateRoomType(id string, input RoomTypeInput) (*models.RoomType, error)
func (b *RoomBinding) GetAllRooms() ([]models.Room, error)
func (b *RoomBinding) CreateRoom(input RoomInput) (*models.Room, error)
func (b *RoomBinding) UpdateRoom(id string, input RoomInput) (*models.Room, error)
```

### `ReservationBinding`

```go
func (b *ReservationBinding) GetAll() ([]models.Reservation, error)
func (b *ReservationBinding) GetByID(id string) (*models.Reservation, error)
func (b *ReservationBinding) Create(input ReservationInput) (*models.Reservation, error)
func (b *ReservationBinding) CheckIn(id string) error
func (b *ReservationBinding) Cancel(id string) error
func (b *ReservationBinding) Checkout(id, checkoutDate string) error
```

### `BillBinding`

```go
func (b *BillBinding) Create(input BillInput) (*models.Bill, error)
func (b *BillBinding) GetByID(id string) (*models.Bill, error)
func (b *BillBinding) GetByCustomerID(customerID string) ([]models.Bill, error)
func (b *BillBinding) Finalize(id string) error
```
`BillInput` mirrors the existing `handlers.CreateBillRequest` (CustomerID, ReservationID, BillType, BillDate, IsGSTBill, Subtotal, TaxAmount, DiscountAmount, TotalAmount, Status, LineItems).

### `PaymentBinding`

```go
func (b *PaymentBinding) Create(billID string, input PaymentInput) (*models.Payment, error)
func (b *PaymentBinding) GetByBillID(billID string) ([]models.Payment, error)
```

### `SettingsBinding`

```go
func (b *SettingsBinding) Get() (*models.Settings, error)
func (b *SettingsBinding) Save(input SettingsInput) (*models.Settings, error)
```

### Binding pattern (single template applied to every domain binding)

```go
type CustomerBinding struct {
    svc *services.CustomerService
    sess *session.Session
}

func NewCustomerBinding(svc *services.CustomerService, sess *session.Session) *CustomerBinding {
    return &CustomerBinding{svc: svc, sess: sess}
}

func (b *CustomerBinding) GetAll() ([]models.Customer, error) {
    uid, err := b.sess.UserID()
    if err != nil { return nil, err }
    return b.svc.GetAllCustomers(uid)
}
```

Where the existing handler parsed `c.Param("id")` to `uuid.UUID`, the binding accepts `id string` from JS and parses it with `uuid.Parse(id)` (return error if invalid).

---

## File Structure (target tree after migration)

```
Econ-billing/
├── app.go                                 # App struct + lifecycle
├── main.go                                # Wails entry (window/options)
├── go.mod                                 # module github.com/econ/econ
├── go.sum
├── wails.json
├── build/                                 # auto-created by `wails init`
│   ├── windows/                           # icon, manifest, info.json
│   └── appicon.png
├── build.ps1                              # rewritten
├── README.md
├── create-admin.ps1
├── create-admin.sh
│
├── internal/
│   ├── bindings/
│   │   ├── auth.go
│   │   ├── customer.go
│   │   ├── room.go
│   │   ├── reservation.go
│   │   ├── bill.go
│   │   ├── payment.go
│   │   └── settings.go
│   ├── database/
│   │   └── database.go                    # opens SQLite at %APPDATA%/econ/econ.db
│   ├── session/
│   │   └── session.go
│   ├── models/                            # MOVED unchanged
│   │   ├── bill.go, customer.go, payment.go, reservation.go,
│   │   ├── room.go, settings.go, user.go
│   ├── repository/                        # MOVED unchanged
│   │   ├── bill_repository.go, customer_repository.go, ...
│   └── services/                          # MOVED unchanged (GST logic preserved)
│       ├── auth_service.go (modified: drop jwtSecret arg, drop token gen)
│       ├── bill_service.go (unchanged - GST invoice numbering preserved)
│       └── ... (others unchanged)
│
├── pkg/utils/
│   └── password.go                        # MOVED unchanged
│   # jwt.go DELETED
│
├── frontend/
│   ├── index.html
│   ├── package.json                       # remove axios, add nothing (Wails JS is generated)
│   ├── vite.config.ts                     # unchanged
│   ├── tailwind.config.js                 # unchanged
│   ├── postcss.config.js                  # unchanged
│   ├── tsconfig*.json                     # add `wailsjs` to includes
│   ├── public/
│   ├── wailsjs/                           # AUTO-GENERATED — do not edit
│   │   ├── go/main/App.{ts,js}
│   │   ├── go/bindings/{Auth,Customer,Room,Reservation,Bill,Payment,Settings}Binding.{ts,js}
│   │   ├── go/models/models.ts            # generated structs
│   │   └── runtime/runtime.{ts,js}
│   └── src/
│       ├── App.tsx                        # ProtectedRoute uses auth context not localStorage
│       ├── main.tsx, index.css            # unchanged
│       ├── types/index.ts                 # unchanged (compatible with Wails JSON)
│       ├── context/
│       │   ├── AppContext.tsx             # keep (UI state)
│       │   └── AuthContext.tsx            # NEW: in-memory current user
│       ├── lib/
│       │   ├── utils.ts                   # unchanged
│       │   └── bindings.ts                # NEW: re-exports + error helpers
│       │   # api.ts DELETED
│       ├── services/                      # files rewritten as thin wrappers (or deleted; callers use bindings directly)
│       │   ├── auth.service.ts            # rewrite to wrap AuthBinding
│       │   ├── customer.service.ts        # rewrite to wrap CustomerBinding
│       │   ├── room.service.ts            # rewrite to wrap RoomBinding
│       │   ├── reservation.service.ts     # rewrite to wrap ReservationBinding
│       │   ├── bill.service.ts            # rewrite to wrap BillBinding
│       │   ├── settings.service.ts        # rewrite to wrap SettingsBinding
│       │   └── index.ts                   # unchanged
│       ├── components/                    # unchanged
│       └── pages/                         # unchanged (still call ${domain}Service.*)
│
├── desktop/                               # DELETED
├── backend/                               # DELETED (after migration)
└── bin/                                   # build output dir (wails build target)
```

**Decomposition rationale:** Each binding has one responsibility (one domain), maps 1:1 to a Gin handler file, and produces one frontend module. The `Session` is the only cross-cutting dependency and lives in its own package to avoid an import cycle. Service-layer code is moved verbatim so the proven GST logic and SQLite repository patterns are unchanged.

---

## Self-Review Checklist (filled in after writing)

1. **Spec coverage:**
   - Wails init → Task 1
   - Merge backend/internal/ → Tasks 3, 4
   - Convert handlers → Tasks 8–14 (one per domain)
   - APPDATA SQLite path in OnStartup → Task 6
   - Remove services/ axios calls → Tasks 16–21
   - Wails runtime for minimize/dialog → Task 7, Task 22
   - wails.json metadata → Task 2 (created by wails init) + Task 23 (Name/Version)
   - Frameless window config in main.go → Task 7
   - build.ps1 update → Task 24
   - Delete desktop/ and backend/cmd/server/ → Task 25
   - Remove Gin middleware → falls out of deletion (Task 25)
   - Keep GST logic unchanged → Tasks 3, 4 (move-only)
   - Keep GORM/SQLite repo patterns → Tasks 3, 4 (move-only)
   - Keep Tailwind config → Task 15 (frontend merge)
2. **Placeholder scan:** No "TBD", no "add error handling", every code step has full code.
3. **Type consistency:** `session.Session.UserID()` used everywhere; `LoginResult` defined once; `*Input` structs only declared in their owning binding file. UUIDs cross the boundary as `string` and are parsed inside bindings.

---

# Tasks

### Task 1: Initialize Wails v2 project shell

**Files:**
- Create: `d:/Econ-billing/wails.json`
- Create: `d:/Econ-billing/go.mod`
- Create: `d:/Econ-billing/main.go` (stub)
- Create: `d:/Econ-billing/app.go` (stub)
- Create: `d:/Econ-billing/build/` (generated)

- [ ] **Step 1: Verify Wails CLI is installed**

Run: `wails version`
Expected: prints `v2.x.x`. If not installed: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

- [ ] **Step 2: Initialize new Wails project in a sibling temp dir, then merge**

Run from `d:/`: `wails init -n econ-tmp -t react-ts`
This produces `d:/econ-tmp/` with `main.go`, `app.go`, `wails.json`, `go.mod`, `build/`, `frontend/`.

- [ ] **Step 3: Move scaffolding into the repo (do NOT overwrite existing frontend/ yet)**

```powershell
Move-Item d:/econ-tmp/main.go         d:/Econ-billing/main.go
Move-Item d:/econ-tmp/app.go          d:/Econ-billing/app.go
Move-Item d:/econ-tmp/wails.json      d:/Econ-billing/wails.json
Move-Item d:/econ-tmp/go.mod          d:/Econ-billing/go.mod
Move-Item d:/econ-tmp/build           d:/Econ-billing/build
# Capture the generated TS frontend separately for icon + index.html reference only:
Move-Item d:/econ-tmp/frontend        d:/Econ-billing/frontend.wails-scaffold
Remove-Item d:/econ-tmp -Recurse -Force
```

- [ ] **Step 4: Smoke-build the empty Wails project**

Run from `d:/Econ-billing`: `wails build -clean -s`
Expected: produces `build/bin/econ.exe`. Project compiles before any code changes.

- [ ] **Step 5: Commit**

```powershell
git add wails.json go.mod main.go app.go build/ frontend.wails-scaffold/
git commit -m "chore(wails): initialize Wails v2 react-ts scaffold"
```

---

### Task 2: Set go.mod module name and pin dependencies

**Files:**
- Modify: `d:/Econ-billing/go.mod`

- [ ] **Step 1: Replace module name to `github.com/econ/econ` and add deps**

```go
module github.com/econ/econ

go 1.22

require (
    github.com/wailsapp/wails/v2 v2.10.1
    gorm.io/gorm v1.31.1
    github.com/glebarez/sqlite v1.11.0
    github.com/google/uuid v1.6.0
    golang.org/x/crypto v0.47.0
)
```

- [ ] **Step 2: Resolve**

Run: `go mod tidy`
Expected: writes `go.sum`, no errors.

- [ ] **Step 3: Commit**

```powershell
git add go.mod go.sum
git commit -m "chore(go): set module name and add gorm/sqlite/uuid/bcrypt deps"
```

---

### Task 3: Move models, repositories, and password util (verbatim)

**Files:**
- Move: `backend/internal/models/*` → `internal/models/*`
- Move: `backend/internal/repository/*` → `internal/repository/*`
- Move: `backend/pkg/utils/password.go` → `pkg/utils/password.go`

- [ ] **Step 1: Move files preserving structure**

```powershell
New-Item -ItemType Directory -Path d:/Econ-billing/internal/models       -Force | Out-Null
New-Item -ItemType Directory -Path d:/Econ-billing/internal/repository   -Force | Out-Null
New-Item -ItemType Directory -Path d:/Econ-billing/pkg/utils             -Force | Out-Null
Move-Item d:/Econ-billing/backend/internal/models/*       d:/Econ-billing/internal/models/
Move-Item d:/Econ-billing/backend/internal/repository/*   d:/Econ-billing/internal/repository/
Move-Item d:/Econ-billing/backend/pkg/utils/password.go   d:/Econ-billing/pkg/utils/password.go
```

- [ ] **Step 2: Update import paths inside moved files**

Replace `"trinity-lodge/internal/models"` → `"github.com/econ/econ/internal/models"` in all files under `internal/repository/`. Same prefix rule for any other internal imports.

Use the Edit tool per-file or:
```powershell
Get-ChildItem d:/Econ-billing/internal,d:/Econ-billing/pkg -Recurse -Filter *.go | ForEach-Object {
    (Get-Content $_.FullName) -replace 'trinity-lodge/', 'github.com/econ/econ/' | Set-Content $_.FullName
}
```

- [ ] **Step 3: Verify it builds**

Run: `go build ./internal/... ./pkg/...`
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```powershell
git add internal/models internal/repository pkg/utils
git commit -m "refactor: move models, repositories, password util into wails project"
```

---

### Task 4: Move services and drop JWT from auth_service

**Files:**
- Move: `backend/internal/services/*` → `internal/services/*`
- Modify: `internal/services/auth_service.go`

- [ ] **Step 1: Move services**

```powershell
New-Item -ItemType Directory -Path d:/Econ-billing/internal/services -Force | Out-Null
Move-Item d:/Econ-billing/backend/internal/services/* d:/Econ-billing/internal/services/
Get-ChildItem d:/Econ-billing/internal/services -Filter *.go | ForEach-Object {
    (Get-Content $_.FullName) -replace 'trinity-lodge/', 'github.com/econ/econ/' | Set-Content $_.FullName
}
```

- [ ] **Step 2: Strip JWT from auth_service.go**

Rewrite `internal/services/auth_service.go` so `Login`/`Register` no longer take/return JWT secret/token. Final content:

```go
package services

import (
    "errors"
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/pkg/utils"

    "github.com/google/uuid"
)

type AuthService struct {
    userRepo     *repository.UserRepository
    settingsRepo *repository.SettingsRepository
}

func NewAuthService(userRepo *repository.UserRepository, settingsRepo *repository.SettingsRepository) *AuthService {
    return &AuthService{userRepo: userRepo, settingsRepo: settingsRepo}
}

func (s *AuthService) Login(username, password string) (*models.User, error) {
    user, err := s.userRepo.FindByUsername(username)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }
    if !utils.CheckPassword(password, user.PasswordHash) {
        return nil, errors.New("invalid credentials")
    }
    return user, nil
}

func (s *AuthService) Register(username, password string, role models.UserRole) (*models.User, error) {
    if existing, _ := s.userRepo.FindByUsername(username); existing != nil {
        return nil, errors.New("username already exists")
    }
    hashed, err := utils.HashPassword(password)
    if err != nil {
        return nil, err
    }
    user := &models.User{
        ID: uuid.New(), Username: username, PasswordHash: hashed, Role: role,
    }
    if err := s.userRepo.Create(user); err != nil {
        return nil, err
    }
    _ = s.settingsRepo.CreateDefaultSettings(user.ID)
    return user, nil
}

func (s *AuthService) GetUserByID(id uuid.UUID) (*models.User, error) {
    return s.userRepo.FindByID(id)
}
```

- [ ] **Step 3: Verify build**

Run: `go build ./internal/...`
Expected: exit 0.

- [ ] **Step 4: Commit**

```powershell
git add internal/services
git commit -m "refactor(auth): move services and remove JWT from AuthService"
```

---

### Task 5: Add session package

**Files:**
- Create: `internal/session/session.go`
- Test: `internal/session/session_test.go`

- [ ] **Step 1: Write failing test**

```go
// internal/session/session_test.go
package session

import (
    "testing"
    "github.com/google/uuid"
)

func TestSession_UnsetReturnsError(t *testing.T) {
    s := New()
    if _, err := s.UserID(); err == nil {
        t.Fatal("expected error for empty session, got nil")
    }
}

func TestSession_SetThenRead(t *testing.T) {
    s := New()
    id := uuid.New()
    s.Set(id)
    got, err := s.UserID()
    if err != nil { t.Fatal(err) }
    if got != id { t.Fatalf("want %s, got %s", id, got) }
}

func TestSession_Clear(t *testing.T) {
    s := New()
    s.Set(uuid.New())
    s.Clear()
    if _, err := s.UserID(); err == nil {
        t.Fatal("expected error after Clear")
    }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/session/...`
Expected: FAIL (package doesn't exist).

- [ ] **Step 3: Implement session.go**

```go
// internal/session/session.go
package session

import (
    "errors"
    "sync"
    "github.com/google/uuid"
)

var ErrNotAuthenticated = errors.New("not authenticated")

type Session struct {
    mu  sync.RWMutex
    uid uuid.UUID
}

func New() *Session { return &Session{} }

func (s *Session) Set(id uuid.UUID) {
    s.mu.Lock(); defer s.mu.Unlock(); s.uid = id
}

func (s *Session) Clear() {
    s.mu.Lock(); defer s.mu.Unlock(); s.uid = uuid.Nil
}

func (s *Session) UserID() (uuid.UUID, error) {
    s.mu.RLock(); defer s.mu.RUnlock()
    if s.uid == uuid.Nil { return uuid.Nil, ErrNotAuthenticated }
    return s.uid, nil
}

func (s *Session) IsAuthenticated() bool {
    s.mu.RLock(); defer s.mu.RUnlock()
    return s.uid != uuid.Nil
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/session/...`
Expected: PASS for all three tests.

- [ ] **Step 5: Commit**

```powershell
git add internal/session
git commit -m "feat(session): in-memory current-user holder"
```

---

### Task 6: Database package with APPDATA path

**Files:**
- Create: `internal/database/database.go`
- Test: `internal/database/database_test.go`

- [ ] **Step 1: Write failing test**

```go
// internal/database/database_test.go
package database

import (
    "os"
    "path/filepath"
    "testing"
)

func TestResolveDBPath_UsesAPPDATA(t *testing.T) {
    tmp := t.TempDir()
    t.Setenv("APPDATA", tmp)
    p, err := ResolveDBPath()
    if err != nil { t.Fatal(err) }
    want := filepath.Join(tmp, "econ", "econ.db")
    if p != want { t.Fatalf("want %s, got %s", want, p) }
    // Parent dir must exist
    if _, err := os.Stat(filepath.Dir(p)); err != nil {
        t.Fatalf("parent dir not created: %v", err)
    }
}

func TestOpen_CreatesFileAndMigrates(t *testing.T) {
    tmp := t.TempDir()
    db, err := Open(filepath.Join(tmp, "test.db"))
    if err != nil { t.Fatal(err) }
    sqlDB, _ := db.DB()
    defer sqlDB.Close()
    if !db.Migrator().HasTable("users") {
        t.Fatal("users table not created by AutoMigrate")
    }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/database/...`
Expected: FAIL.

- [ ] **Step 3: Implement database.go**

```go
// internal/database/database.go
package database

import (
    "errors"
    "os"
    "path/filepath"

    "github.com/econ/econ/internal/models"
    "github.com/glebarez/sqlite"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

// ResolveDBPath returns %APPDATA%/econ/econ.db on Windows, creating the parent dir.
func ResolveDBPath() (string, error) {
    base := os.Getenv("APPDATA")
    if base == "" {
        home, err := os.UserHomeDir()
        if err != nil { return "", err }
        base = filepath.Join(home, ".config")
    }
    dir := filepath.Join(base, "econ")
    if err := os.MkdirAll(dir, 0o755); err != nil { return "", err }
    return filepath.Join(dir, "econ.db"), nil
}

func Open(path string) (*gorm.DB, error) {
    if path == "" { return nil, errors.New("empty db path") }
    db, err := gorm.Open(sqlite.Open(path), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Warn),
    })
    if err != nil { return nil, err }
    if err := db.AutoMigrate(
        &models.User{}, &models.Customer{}, &models.RoomType{},
        &models.Room{}, &models.Reservation{}, &models.Bill{},
        &models.BillLineItem{}, &models.Payment{}, &models.Settings{},
    ); err != nil {
        return nil, err
    }
    return db, nil
}

func Close(db *gorm.DB) error {
    sqlDB, err := db.DB()
    if err != nil { return err }
    return sqlDB.Close()
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/database/...`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add internal/database
git commit -m "feat(db): APPDATA-based SQLite path resolution + GORM migrations"
```

---

### Task 7: Implement App struct (lifecycle + window) and main.go

**Files:**
- Modify: `app.go`
- Modify: `main.go`

- [ ] **Step 1: Replace app.go**

```go
// app.go
package main

import (
    "context"

    "github.com/econ/econ/internal/database"
    "gorm.io/gorm"
    rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
    ctx context.Context
    db  *gorm.DB
}

func NewApp() *App { return &App{} }

func (a *App) OnStartup(ctx context.Context) {
    a.ctx = ctx
    path, err := database.ResolveDBPath()
    if err != nil {
        rt.LogFatal(ctx, "db path: "+err.Error())
    }
    db, err := database.Open(path)
    if err != nil {
        rt.LogFatal(ctx, "db open: "+err.Error())
    }
    a.db = db
}

func (a *App) OnShutdown(ctx context.Context) {
    if a.db != nil { _ = database.Close(a.db) }
}

func (a *App) DB() *gorm.DB { return a.db }

// Window controls exposed to JS:
func (a *App) MinimizeWindow()       { rt.WindowMinimise(a.ctx) }
func (a *App) MaximizeWindow()       { rt.WindowToggleMaximise(a.ctx) }
func (a *App) CloseWindow()          { rt.Quit(a.ctx) }

// ShowSaveDialog returns the selected file path (empty if cancelled).
func (a *App) ShowSaveDialog(defaultName string) (string, error) {
    return rt.SaveFileDialog(a.ctx, rt.SaveDialogOptions{
        DefaultFilename: defaultName,
    })
}
```

- [ ] **Step 2: Replace main.go (frameless window + bind list left as stub until Task 14)**

```go
// main.go
package main

import (
    "embed"

    "github.com/wailsapp/wails/v2"
    "github.com/wailsapp/wails/v2/pkg/options"
    "github.com/wailsapp/wails/v2/pkg/options/assetserver"
    "github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
    app := NewApp()

    err := wails.Run(&options.App{
        Title:             "Econ",
        Width:             1400,
        Height:            900,
        MinWidth:          1024,
        MinHeight:         768,
        Frameless:         true,
        DisableResize:     false,
        BackgroundColour:  &options.RGBA{R: 249, G: 250, B: 251, A: 1},
        AssetServer:       &assetserver.Options{Assets: assets},
        OnStartup:         app.OnStartup,
        OnShutdown:        app.OnShutdown,
        Windows:           &windows.Options{
            WebviewIsTransparent: false,
            WindowIsTranslucent:  false,
        },
        Bind: []interface{}{
            app,
            // Bindings appended in Task 14
        },
    })
    if err != nil { panic(err) }
}
```

- [ ] **Step 3: Verify wails build still works**

Run: `wails build -s`
Expected: builds without errors (no bindings yet, so no generated TS, that's fine).

- [ ] **Step 4: Commit**

```powershell
git add app.go main.go
git commit -m "feat(app): wire OnStartup/OnShutdown, frameless window, runtime controls"
```

---

### Task 8: AuthBinding (TDD)

**Files:**
- Create: `internal/bindings/auth.go`
- Test: `internal/bindings/auth_test.go`

- [ ] **Step 1: Write failing test**

```go
// internal/bindings/auth_test.go
package bindings

import (
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
)

func newTestAuth(t *testing.T) (*AuthBinding, *session.Session) {
    t.Helper()
    db, err := database.Open(t.TempDir() + "/t.db")
    if err != nil { t.Fatal(err) }
    sess := session.New()
    userRepo := repository.NewUserRepository(db)
    settingsRepo := repository.NewSettingsRepository(db)
    svc := services.NewAuthService(userRepo, settingsRepo)
    return NewAuthBinding(svc, sess, "TEST_TOKEN"), sess
}

func TestAuth_RegisterThenLogin(t *testing.T) {
    b, sess := newTestAuth(t)
    _, err := b.Register("alice", "secret123", "ADMIN", "TEST_TOKEN")
    if err != nil { t.Fatalf("register: %v", err) }
    if !sess.IsAuthenticated() { t.Fatal("expected session set by Register") }

    b.Logout()
    if sess.IsAuthenticated() { t.Fatal("Logout did not clear session") }

    res, err := b.Login("alice", "secret123")
    if err != nil { t.Fatalf("login: %v", err) }
    if res.User.Username != "alice" { t.Fatalf("got %q", res.User.Username) }
    if res.User.Role != models.RoleAdmin { t.Fatalf("got role %q", res.User.Role) }
    if !sess.IsAuthenticated() { t.Fatal("Login did not set session") }
}

func TestAuth_RejectsBadToken(t *testing.T) {
    b, _ := newTestAuth(t)
    _, err := b.Register("bob", "secret123", "ADMIN", "WRONG")
    if err == nil { t.Fatal("expected error for wrong registration token") }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/bindings/...`
Expected: FAIL (package not present).

- [ ] **Step 3: Implement auth.go**

```go
// internal/bindings/auth.go
package bindings

import (
    "errors"

    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
)

type LoginResult struct {
    User models.User `json:"user"`
}

type AuthBinding struct {
    svc               *services.AuthService
    sess              *session.Session
    registrationToken string
}

func NewAuthBinding(svc *services.AuthService, sess *session.Session, registrationToken string) *AuthBinding {
    return &AuthBinding{svc: svc, sess: sess, registrationToken: registrationToken}
}

func (b *AuthBinding) Login(username, password string) (*LoginResult, error) {
    user, err := b.svc.Login(username, password)
    if err != nil { return nil, err }
    b.sess.Set(user.ID)
    return &LoginResult{User: *user}, nil
}

func (b *AuthBinding) Register(username, password, role, registrationToken string) (*LoginResult, error) {
    if registrationToken != b.registrationToken {
        return nil, errors.New("invalid registration token")
    }
    r := models.RoleStaff
    if role == "ADMIN" { r = models.RoleAdmin }
    user, err := b.svc.Register(username, password, r)
    if err != nil { return nil, err }
    b.sess.Set(user.ID)
    return &LoginResult{User: *user}, nil
}

func (b *AuthBinding) Logout() error {
    b.sess.Clear()
    return nil
}

func (b *AuthBinding) CurrentUser() (*models.User, error) {
    uid, err := b.sess.UserID()
    if err != nil { return nil, err }
    return b.svc.GetUserByID(uid)
}

func (b *AuthBinding) IsAuthenticated() bool {
    return b.sess.IsAuthenticated()
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/bindings/...`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add internal/bindings/auth.go internal/bindings/auth_test.go
git commit -m "feat(bindings): AuthBinding with session-based login/register/logout"
```

---

### Task 9: CustomerBinding

**Files:**
- Create: `internal/bindings/customer.go`
- Test: `internal/bindings/customer_test.go`

- [ ] **Step 1: Write failing test**

```go
// internal/bindings/customer_test.go
package bindings

import (
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

func TestCustomer_RequiresSession(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    sess := session.New()
    b := NewCustomerBinding(services.NewCustomerService(repository.NewCustomerRepository(db)), sess)
    if _, err := b.GetAll(); err == nil {
        t.Fatal("expected error when not authenticated")
    }
}

func TestCustomer_CRUD(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    sess := session.New()
    sess.Set(uuid.New())
    b := NewCustomerBinding(services.NewCustomerService(repository.NewCustomerRepository(db)), sess)

    c, err := b.Create(CustomerInput{FullName: "John", Phone: "555-1"})
    if err != nil { t.Fatalf("create: %v", err) }
    if c.FullName != "John" { t.Fatalf("got %q", c.FullName) }

    all, _ := b.GetAll()
    if len(all) != 1 { t.Fatalf("want 1 customer, got %d", len(all)) }

    if _, err := b.Update(c.ID.String(), CustomerInput{FullName: "Jane", Phone: "555-2"}); err != nil {
        t.Fatal(err)
    }
    got, _ := b.GetByID(c.ID.String())
    if got.FullName != "Jane" { t.Fatalf("update did not persist") }

    if err := b.Delete(c.ID.String()); err != nil { t.Fatal(err) }
    all, _ = b.GetAll()
    if len(all) != 0 { t.Fatalf("delete did not remove customer") }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/bindings/ -run TestCustomer`
Expected: FAIL.

- [ ] **Step 3: Implement customer.go**

```go
// internal/bindings/customer.go
package bindings

import (
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

type CustomerInput struct {
    FullName      string `json:"full_name"`
    Phone         string `json:"phone"`
    Address       string `json:"address"`
    IDProofType   string `json:"id_proof_type"`
    IDProofNumber string `json:"id_proof_number"`
}

type CustomerBinding struct {
    svc  *services.CustomerService
    sess *session.Session
}

func NewCustomerBinding(svc *services.CustomerService, sess *session.Session) *CustomerBinding {
    return &CustomerBinding{svc: svc, sess: sess}
}

func (b *CustomerBinding) GetAll() ([]models.Customer, error) {
    uid, err := b.sess.UserID()
    if err != nil { return nil, err }
    return b.svc.GetAllCustomers(uid)
}

func (b *CustomerBinding) GetByID(id string) (*models.Customer, error) {
    uid, err := b.sess.UserID()
    if err != nil { return nil, err }
    cid, err := uuid.Parse(id)
    if err != nil { return nil, err }
    return b.svc.GetCustomerByID(cid, uid)
}

func (b *CustomerBinding) Create(in CustomerInput) (*models.Customer, error) {
    uid, err := b.sess.UserID()
    if err != nil { return nil, err }
    c := &models.Customer{
        ID: uuid.New(), UserID: uid,
        FullName: in.FullName, Phone: in.Phone, Address: in.Address,
        IDProofType: in.IDProofType, IDProofNumber: in.IDProofNumber,
    }
    if err := b.svc.CreateCustomer(c); err != nil { return nil, err }
    return c, nil
}

func (b *CustomerBinding) Update(id string, in CustomerInput) (*models.Customer, error) {
    uid, err := b.sess.UserID()
    if err != nil { return nil, err }
    cid, err := uuid.Parse(id)
    if err != nil { return nil, err }
    c := &models.Customer{
        ID: cid, UserID: uid,
        FullName: in.FullName, Phone: in.Phone, Address: in.Address,
        IDProofType: in.IDProofType, IDProofNumber: in.IDProofNumber,
    }
    if err := b.svc.UpdateCustomer(c); err != nil { return nil, err }
    return c, nil
}

func (b *CustomerBinding) Delete(id string) error {
    uid, err := b.sess.UserID()
    if err != nil { return err }
    cid, err := uuid.Parse(id)
    if err != nil { return err }
    return b.svc.DeleteCustomer(cid, uid)
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/bindings/ -run TestCustomer`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add internal/bindings/customer.go internal/bindings/customer_test.go
git commit -m "feat(bindings): CustomerBinding with session-scoped CRUD"
```

---

### Task 10: RoomBinding

**Files:**
- Create: `internal/bindings/room.go`
- Test: `internal/bindings/room_test.go`

- [ ] **Step 1: Write failing test**

```go
// internal/bindings/room_test.go
package bindings

import (
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

func TestRoom_TypesAndRooms(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    sess := session.New(); sess.Set(uuid.New())
    b := NewRoomBinding(services.NewRoomService(repository.NewRoomRepository(db)), sess)

    rt, err := b.CreateRoomType(RoomTypeInput{Name: "Deluxe", DefaultRate: 1500})
    if err != nil { t.Fatal(err) }
    if rt.Name != "Deluxe" { t.Fatalf("got %q", rt.Name) }

    rm, err := b.CreateRoom(RoomInput{RoomNumber: "101", TypeID: rt.ID.String(), Status: "AVAILABLE"})
    if err != nil { t.Fatal(err) }
    if rm.RoomNumber != "101" { t.Fatalf("got %q", rm.RoomNumber) }

    rooms, _ := b.GetAllRooms()
    if len(rooms) != 1 { t.Fatalf("want 1 room, got %d", len(rooms)) }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/bindings/ -run TestRoom`
Expected: FAIL.

- [ ] **Step 3: Implement room.go**

```go
// internal/bindings/room.go
package bindings

import (
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

type RoomTypeInput struct {
    Name        string  `json:"name"`
    DefaultRate float64 `json:"default_rate"`
}

type RoomInput struct {
    RoomNumber string             `json:"room_number"`
    TypeID     string             `json:"type_id"`
    Status     models.RoomStatus  `json:"status"`
}

type RoomBinding struct {
    svc  *services.RoomService
    sess *session.Session
}

func NewRoomBinding(svc *services.RoomService, sess *session.Session) *RoomBinding {
    return &RoomBinding{svc: svc, sess: sess}
}

// Room Types
func (b *RoomBinding) GetAllRoomTypes() ([]models.RoomType, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    return b.svc.GetAllRoomTypes(uid)
}

func (b *RoomBinding) CreateRoomType(in RoomTypeInput) (*models.RoomType, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    rt := &models.RoomType{ID: uuid.New(), UserID: uid, Name: in.Name, DefaultRate: in.DefaultRate}
    if err := b.svc.CreateRoomType(rt); err != nil { return nil, err }
    return rt, nil
}

func (b *RoomBinding) UpdateRoomType(id string, in RoomTypeInput) (*models.RoomType, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    rtID, err := uuid.Parse(id); if err != nil { return nil, err }
    rt := &models.RoomType{ID: rtID, UserID: uid, Name: in.Name, DefaultRate: in.DefaultRate}
    if err := b.svc.UpdateRoomType(rt); err != nil { return nil, err }
    return rt, nil
}

// Rooms
func (b *RoomBinding) GetAllRooms() ([]models.Room, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    return b.svc.GetAllRooms(uid)
}

func (b *RoomBinding) CreateRoom(in RoomInput) (*models.Room, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    typeID, err := uuid.Parse(in.TypeID); if err != nil { return nil, err }
    status := in.Status
    if status == "" { status = models.RoomStatusAvailable }
    r := &models.Room{ID: uuid.New(), UserID: uid, RoomNumber: in.RoomNumber, TypeID: typeID, Status: status}
    if err := b.svc.CreateRoom(r); err != nil { return nil, err }
    return r, nil
}

func (b *RoomBinding) UpdateRoom(id string, in RoomInput) (*models.Room, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    rID, err := uuid.Parse(id); if err != nil { return nil, err }
    typeID, err := uuid.Parse(in.TypeID); if err != nil { return nil, err }
    r := &models.Room{ID: rID, UserID: uid, RoomNumber: in.RoomNumber, TypeID: typeID, Status: in.Status}
    if err := b.svc.UpdateRoom(r); err != nil { return nil, err }
    return r, nil
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/bindings/ -run TestRoom`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add internal/bindings/room.go internal/bindings/room_test.go
git commit -m "feat(bindings): RoomBinding (room types + rooms)"
```

---

### Task 11: ReservationBinding

**Files:**
- Create: `internal/bindings/reservation.go`
- Test: `internal/bindings/reservation_test.go`

- [ ] **Step 1: Write failing test**

```go
// internal/bindings/reservation_test.go
package bindings

import (
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

func TestReservation_CreateCheckInCheckout(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    uid := uuid.New()
    sess := session.New(); sess.Set(uid)

    custSvc := services.NewCustomerService(repository.NewCustomerRepository(db))
    cust := &models.Customer{ID: uuid.New(), UserID: uid, FullName: "C", Phone: "1"}
    custSvc.CreateCustomer(cust)

    roomSvc := services.NewRoomService(repository.NewRoomRepository(db))
    rt := &models.RoomType{ID: uuid.New(), UserID: uid, Name: "Std", DefaultRate: 100}
    roomSvc.CreateRoomType(rt)
    room := &models.Room{ID: uuid.New(), UserID: uid, RoomNumber: "1", TypeID: rt.ID, Status: models.RoomStatusAvailable}
    roomSvc.CreateRoom(room)

    b := NewReservationBinding(
        services.NewReservationService(
            repository.NewReservationRepository(db),
            repository.NewRoomRepository(db),
        ),
        sess,
    )

    r, err := b.Create(ReservationInput{
        CustomerID: cust.ID.String(), RoomID: room.ID.String(),
        CheckInDate: "2026-05-12", ExpectedCheckOutDate: "2026-05-14",
    })
    if err != nil { t.Fatal(err) }
    if err := b.CheckIn(r.ID.String()); err != nil { t.Fatal(err) }
    if err := b.Checkout(r.ID.String(), "2026-05-14"); err != nil { t.Fatal(err) }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/bindings/ -run TestReservation`
Expected: FAIL.

- [ ] **Step 3: Implement reservation.go**

```go
// internal/bindings/reservation.go
package bindings

import (
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

type ReservationInput struct {
    CustomerID            string `json:"customer_id"`
    RoomID                string `json:"room_id"`
    CheckInDate           string `json:"check_in_date"`
    ExpectedCheckOutDate  string `json:"expected_check_out_date"`
}

type ReservationBinding struct {
    svc  *services.ReservationService
    sess *session.Session
}

func NewReservationBinding(svc *services.ReservationService, sess *session.Session) *ReservationBinding {
    return &ReservationBinding{svc: svc, sess: sess}
}

func (b *ReservationBinding) GetAll() ([]models.Reservation, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    return b.svc.GetAllReservations(uid)
}

func (b *ReservationBinding) GetByID(id string) (*models.Reservation, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    rid, err := uuid.Parse(id); if err != nil { return nil, err }
    return b.svc.GetReservationByID(rid, uid)
}

func (b *ReservationBinding) Create(in ReservationInput) (*models.Reservation, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    cust, err := uuid.Parse(in.CustomerID); if err != nil { return nil, err }
    room, err := uuid.Parse(in.RoomID); if err != nil { return nil, err }
    r := &models.Reservation{
        ID: uuid.New(), UserID: uid,
        CustomerID: cust, RoomID: room,
        CheckInDate: in.CheckInDate,
        ExpectedCheckOutDate: in.ExpectedCheckOutDate,
        Status: models.ReservationStatusActive,
    }
    if err := b.svc.CreateReservation(r); err != nil { return nil, err }
    return r, nil
}

func (b *ReservationBinding) CheckIn(id string) error {
    uid, err := b.sess.UserID(); if err != nil { return err }
    rid, err := uuid.Parse(id); if err != nil { return err }
    return b.svc.CheckInReservation(rid, uid)
}

func (b *ReservationBinding) Cancel(id string) error {
    uid, err := b.sess.UserID(); if err != nil { return err }
    rid, err := uuid.Parse(id); if err != nil { return err }
    return b.svc.CancelReservation(rid, uid)
}

func (b *ReservationBinding) Checkout(id, checkoutDate string) error {
    uid, err := b.sess.UserID(); if err != nil { return err }
    rid, err := uuid.Parse(id); if err != nil { return err }
    return b.svc.CheckoutReservation(rid, uid, checkoutDate)
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/bindings/ -run TestReservation`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add internal/bindings/reservation.go internal/bindings/reservation_test.go
git commit -m "feat(bindings): ReservationBinding (create/check-in/cancel/checkout)"
```

---

### Task 12: BillBinding (preserves GST invoice numbering)

**Files:**
- Create: `internal/bindings/bill.go`
- Test: `internal/bindings/bill_test.go`

- [ ] **Step 1: Write failing test (GST invoice number assertion)**

```go
// internal/bindings/bill_test.go
package bindings

import (
    "strings"
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

func TestBill_GSTInvoiceNumberFormat(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    uid := uuid.New()
    sess := session.New(); sess.Set(uid)

    settingsRepo := repository.NewSettingsRepository(db)
    settingsRepo.CreateDefaultSettings(uid)

    custRepo := repository.NewCustomerRepository(db)
    cust := &models.Customer{ID: uuid.New(), UserID: uid, FullName: "C", Phone: "1"}
    custRepo.Create(cust)

    billRepo := repository.NewBillRepository(db)
    b := NewBillBinding(services.NewBillService(billRepo, settingsRepo), sess)

    bill, err := b.Create(BillInput{
        CustomerID: cust.ID.String(),
        BillType: models.BillTypeWalkIn,
        BillDate: "2026-05-12", IsGSTBill: true,
        Subtotal: 100, TaxAmount: 18, TotalAmount: 118,
        Status: models.BillStatusDraft,
    })
    if err != nil { t.Fatal(err) }
    if !strings.HasPrefix(bill.InvoiceNumber, "GST-") {
        t.Fatalf("expected GST- prefix, got %q", bill.InvoiceNumber)
    }
    if bill.InvoiceNumber != "GST-0001" {
        t.Fatalf("expected GST-0001 (zero-padded), got %q", bill.InvoiceNumber)
    }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/bindings/ -run TestBill`
Expected: FAIL.

- [ ] **Step 3: Implement bill.go**

```go
// internal/bindings/bill.go
package bindings

import (
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

type BillLineItemInput struct {
    Description string  `json:"description"`
    Amount      float64 `json:"amount"`
}

type BillInput struct {
    CustomerID     string                 `json:"customer_id"`
    ReservationID  *string                `json:"reservation_id"`
    BillType       models.BillType        `json:"bill_type"`
    BillDate       string                 `json:"bill_date"`
    IsGSTBill      bool                   `json:"is_gst_bill"`
    Subtotal       float64                `json:"subtotal"`
    TaxAmount      float64                `json:"tax_amount"`
    DiscountAmount float64                `json:"discount_amount"`
    TotalAmount    float64                `json:"total_amount"`
    Status         models.BillStatus      `json:"status"`
    LineItems      []BillLineItemInput    `json:"line_items"`
}

type BillBinding struct {
    svc  *services.BillService
    sess *session.Session
}

func NewBillBinding(svc *services.BillService, sess *session.Session) *BillBinding {
    return &BillBinding{svc: svc, sess: sess}
}

func (b *BillBinding) Create(in BillInput) (*models.Bill, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    custID, err := uuid.Parse(in.CustomerID); if err != nil { return nil, err }
    var resID *uuid.UUID
    if in.ReservationID != nil && *in.ReservationID != "" {
        v, err := uuid.Parse(*in.ReservationID); if err != nil { return nil, err }
        resID = &v
    }
    status := in.Status
    if status == "" { status = models.BillStatusDraft }
    bill := &models.Bill{
        ID: uuid.New(), UserID: uid,
        CustomerID: custID, ReservationID: resID,
        BillType: in.BillType, BillDate: in.BillDate,
        IsGSTBill: in.IsGSTBill,
        Subtotal: in.Subtotal, TaxAmount: in.TaxAmount,
        DiscountAmount: in.DiscountAmount, TotalAmount: in.TotalAmount,
        Status: status, GeneratedBy: uid,
    }
    lineItems := make([]models.BillLineItem, len(in.LineItems))
    for i, li := range in.LineItems {
        lineItems[i] = models.BillLineItem{
            ID: uuid.New(), Description: li.Description, Amount: li.Amount,
        }
    }
    if err := b.svc.CreateBill(bill, lineItems); err != nil { return nil, err }
    return bill, nil
}

func (b *BillBinding) GetByID(id string) (*models.Bill, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    bid, err := uuid.Parse(id); if err != nil { return nil, err }
    return b.svc.GetBillByID(bid, uid)
}

func (b *BillBinding) GetByCustomerID(customerID string) ([]models.Bill, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    cid, err := uuid.Parse(customerID); if err != nil { return nil, err }
    return b.svc.GetBillsByCustomerID(cid, uid)
}

func (b *BillBinding) Finalize(id string) error {
    uid, err := b.sess.UserID(); if err != nil { return err }
    bid, err := uuid.Parse(id); if err != nil { return err }
    return b.svc.FinalizeBill(bid, uid)
}
```

- [ ] **Step 4: Run tests**

Run: `go test ./internal/bindings/ -run TestBill`
Expected: PASS (GST-0001 format preserved).

- [ ] **Step 5: Commit**

```powershell
git add internal/bindings/bill.go internal/bindings/bill_test.go
git commit -m "feat(bindings): BillBinding preserving GST invoice numbering"
```

---

### Task 13: PaymentBinding and SettingsBinding

**Files:**
- Create: `internal/bindings/payment.go`
- Create: `internal/bindings/settings.go`
- Test: `internal/bindings/payment_test.go`
- Test: `internal/bindings/settings_test.go`

- [ ] **Step 1: Write failing tests**

```go
// internal/bindings/payment_test.go
package bindings

import (
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

func TestPayment_CreateMarksBillPaid(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    uid := uuid.New()
    sess := session.New(); sess.Set(uid)

    settingsRepo := repository.NewSettingsRepository(db)
    settingsRepo.CreateDefaultSettings(uid)
    custRepo := repository.NewCustomerRepository(db)
    cust := &models.Customer{ID: uuid.New(), UserID: uid, FullName: "C", Phone: "1"}
    custRepo.Create(cust)
    billRepo := repository.NewBillRepository(db)
    bill := &models.Bill{
        ID: uuid.New(), UserID: uid, CustomerID: cust.ID,
        BillType: models.BillTypeWalkIn, BillDate: "2026-05-12",
        TotalAmount: 100, Status: models.BillStatusUnpaid, GeneratedBy: uid,
        InvoiceNumber: "INV-0001",
    }
    billRepo.Create(bill)

    pay := NewPaymentBinding(
        services.NewPaymentService(repository.NewPaymentRepository(db), billRepo),
        sess,
    )
    _, err := pay.Create(bill.ID.String(), PaymentInput{Amount: 100, PaymentMethod: "Cash", PaymentDate: "2026-05-12"})
    if err != nil { t.Fatal(err) }

    got, _ := billRepo.FindByID(bill.ID, uid)
    if got.Status != models.BillStatusPaid {
        t.Fatalf("expected PAID, got %q", got.Status)
    }
}
```

```go
// internal/bindings/settings_test.go
package bindings

import (
    "testing"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

func TestSettings_DefaultsThenSave(t *testing.T) {
    db, _ := database.Open(t.TempDir() + "/t.db")
    sess := session.New(); sess.Set(uuid.New())
    b := NewSettingsBinding(services.NewSettingsService(repository.NewSettingsRepository(db)), sess)

    s, err := b.Get()
    if err != nil { t.Fatal(err) }
    if s.LodgeName != "My Lodge" {
        t.Fatalf("default LodgeName=%q want %q", s.LodgeName, "My Lodge")
    }
    saved, err := b.Save(SettingsInput{LodgeName: "Trinity", GSTInvoicePrefix: "GST", GSTInvoiceNextNumber: 1, NonGSTInvoicePrefix: "INV", NonGSTInvoiceNextNumber: 1})
    if err != nil { t.Fatal(err) }
    if saved.LodgeName != "Trinity" { t.Fatalf("save did not persist") }
}
```

- [ ] **Step 2: Run and confirm failure**

Run: `go test ./internal/bindings/ -run 'TestPayment|TestSettings'`
Expected: FAIL.

- [ ] **Step 3: Implement payment.go**

```go
// internal/bindings/payment.go
package bindings

import (
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
    "github.com/google/uuid"
)

type PaymentInput struct {
    Amount        float64               `json:"amount"`
    PaymentMethod models.PaymentMethod  `json:"payment_method"`
    PaymentDate   string                `json:"payment_date"`
}

type PaymentBinding struct {
    svc  *services.PaymentService
    sess *session.Session
}

func NewPaymentBinding(svc *services.PaymentService, sess *session.Session) *PaymentBinding {
    return &PaymentBinding{svc: svc, sess: sess}
}

func (b *PaymentBinding) Create(billID string, in PaymentInput) (*models.Payment, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    bid, err := uuid.Parse(billID); if err != nil { return nil, err }
    p := &models.Payment{
        ID: uuid.New(), BillID: bid,
        Amount: in.Amount, PaymentMethod: in.PaymentMethod, PaymentDate: in.PaymentDate,
    }
    if err := b.svc.CreatePayment(p, uid); err != nil { return nil, err }
    return p, nil
}

func (b *PaymentBinding) GetByBillID(billID string) ([]models.Payment, error) {
    if _, err := b.sess.UserID(); err != nil { return nil, err }
    bid, err := uuid.Parse(billID); if err != nil { return nil, err }
    return b.svc.GetPaymentsByBillID(bid)
}
```

- [ ] **Step 4: Implement settings.go**

```go
// internal/bindings/settings.go
package bindings

import (
    "github.com/econ/econ/internal/models"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
)

type SettingsInput struct {
    LodgeName               string `json:"lodge_name"`
    Address                 string `json:"address"`
    Phone                   string `json:"phone"`
    GSTNumber               string `json:"gst_number"`
    StateName               string `json:"state_name"`
    StateCode               string `json:"state_code"`
    GSTInvoicePrefix        string `json:"gst_invoice_prefix"`
    GSTInvoiceNextNumber    int    `json:"gst_invoice_next_number"`
    NonGSTInvoicePrefix     string `json:"non_gst_invoice_prefix"`
    NonGSTInvoiceNextNumber int    `json:"non_gst_invoice_next_number"`
}

type SettingsBinding struct {
    svc  *services.SettingsService
    sess *session.Session
}

func NewSettingsBinding(svc *services.SettingsService, sess *session.Session) *SettingsBinding {
    return &SettingsBinding{svc: svc, sess: sess}
}

func (b *SettingsBinding) Get() (*models.Settings, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    return b.svc.Get(uid)
}

func (b *SettingsBinding) Save(in SettingsInput) (*models.Settings, error) {
    uid, err := b.sess.UserID(); if err != nil { return nil, err }
    s := &models.Settings{
        UserID: uid,
        LodgeName: in.LodgeName, Address: in.Address, Phone: in.Phone,
        GSTNumber: in.GSTNumber, StateName: in.StateName, StateCode: in.StateCode,
        GSTInvoicePrefix: in.GSTInvoicePrefix, GSTInvoiceNextNumber: in.GSTInvoiceNextNumber,
        NonGSTInvoicePrefix: in.NonGSTInvoicePrefix, NonGSTInvoiceNextNumber: in.NonGSTInvoiceNextNumber,
    }
    if err := b.svc.Save(s, uid); err != nil { return nil, err }
    return s, nil
}
```

- [ ] **Step 5: Run tests**

Run: `go test ./internal/bindings/...`
Expected: ALL PASS.

- [ ] **Step 6: Commit**

```powershell
git add internal/bindings/payment.go internal/bindings/payment_test.go internal/bindings/settings.go internal/bindings/settings_test.go
git commit -m "feat(bindings): PaymentBinding and SettingsBinding"
```

---

### Task 14: Wire all bindings into main.go

**Files:**
- Modify: `main.go`
- Modify: `app.go` (add a `wireBindings(*session.Session) []interface{}` helper)

- [ ] **Step 1: Add wiring helper to app.go**

Append to `app.go`:
```go
import (
    "github.com/econ/econ/internal/bindings"
    "github.com/econ/econ/internal/repository"
    "github.com/econ/econ/internal/services"
    "github.com/econ/econ/internal/session"
)

// BuildBindings returns the slice for options.App.Bind. Caller passes Session.
func (a *App) BuildBindings(sess *session.Session, registrationToken string) []interface{} {
    db := a.db
    userRepo := repository.NewUserRepository(db)
    custRepo := repository.NewCustomerRepository(db)
    roomRepo := repository.NewRoomRepository(db)
    resRepo := repository.NewReservationRepository(db)
    billRepo := repository.NewBillRepository(db)
    payRepo := repository.NewPaymentRepository(db)
    setRepo := repository.NewSettingsRepository(db)

    return []interface{}{
        a,
        bindings.NewAuthBinding(services.NewAuthService(userRepo, setRepo), sess, registrationToken),
        bindings.NewCustomerBinding(services.NewCustomerService(custRepo), sess),
        bindings.NewRoomBinding(services.NewRoomService(roomRepo), sess),
        bindings.NewReservationBinding(services.NewReservationService(resRepo, roomRepo), sess),
        bindings.NewBillBinding(services.NewBillService(billRepo, setRepo), sess),
        bindings.NewPaymentBinding(services.NewPaymentService(payRepo, billRepo), sess),
        bindings.NewSettingsBinding(services.NewSettingsService(setRepo), sess),
    }
}
```

**Note:** Bindings can't be built until `OnStartup` has set `a.db`. Solve this by deferring the bind slice creation: build it inside `OnStartup` via `rt.EventsEmit` is not viable. Instead, hold a placeholder and use `wails.Run`'s `Bind` AFTER opening the DB. The cleanest approach: open the DB BEFORE `wails.Run`.

- [ ] **Step 2: Rework main.go to open DB before wails.Run**

```go
// main.go
package main

import (
    "embed"
    "os"

    "github.com/econ/econ/internal/database"
    "github.com/econ/econ/internal/session"
    "github.com/wailsapp/wails/v2"
    "github.com/wailsapp/wails/v2/pkg/options"
    "github.com/wailsapp/wails/v2/pkg/options/assetserver"
    "github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
    path, err := database.ResolveDBPath()
    if err != nil { panic(err) }
    db, err := database.Open(path)
    if err != nil { panic(err) }

    app := &App{db: db}
    sess := session.New()

    regToken := os.Getenv("REGISTRATION_TOKEN")
    if regToken == "" { regToken = "919847073856" }

    err = wails.Run(&options.App{
        Title:            "Econ",
        Width:            1400, Height: 900,
        MinWidth:         1024, MinHeight: 768,
        Frameless:        true,
        BackgroundColour: &options.RGBA{R: 249, G: 250, B: 251, A: 1},
        AssetServer:      &assetserver.Options{Assets: assets},
        OnStartup:        app.OnStartup,
        OnShutdown:       app.OnShutdown,
        Windows:          &windows.Options{},
        Bind:             app.BuildBindings(sess, regToken),
    })
    if err != nil { panic(err) }
}
```

- [ ] **Step 3: Simplify OnStartup (DB already open)**

Replace `OnStartup` body in `app.go` with:
```go
func (a *App) OnStartup(ctx context.Context) { a.ctx = ctx }
```

- [ ] **Step 4: Generate bindings**

Run: `wails generate module`
Expected: produces `frontend/wailsjs/go/main/App.{ts,js}` and `frontend/wailsjs/go/bindings/*Binding.{ts,js}`.

Note: `frontend/wailsjs/` is generated relative to the directory containing `vite.config.ts`. Since we haven't merged the React frontend yet, this writes to `frontend/wailsjs/` inside the scaffold dir. Task 15 merges the real frontend on top.

- [ ] **Step 5: Verify build**

Run: `go build ./...`
Expected: exit 0.

- [ ] **Step 6: Commit**

```powershell
git add main.go app.go
git commit -m "feat(wails): wire all eight bindings via App.BuildBindings"
```

---

### Task 15: Merge existing React frontend into Wails frontend dir

**Files:**
- Move: existing `frontend/` → root `frontend/` (overlay onto scaffold)

- [ ] **Step 1: Copy the existing React app over the scaffold, preserving wailsjs/**

```powershell
# Keep the scaffold's wailsjs and index.html structure as reference
Copy-Item -Recurse -Force d:/Econ-billing/frontend.wails-scaffold/wailsjs d:/Econ-billing/frontend/wailsjs
# The existing frontend/ already contains src/, index.html, package.json, vite.config.ts, tailwind config
# Do nothing else — frontend/ already has the React app
```

- [ ] **Step 2: Update `frontend/package.json` — drop axios, ensure scripts**

Replace the existing `package.json`:
```json
{
  "name": "econ-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.12.0",
    "react-to-print": "^3.2.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

- [ ] **Step 3: Ensure `frontend/tsconfig.app.json` includes wailsjs**

Edit `frontend/tsconfig.app.json`: add `"wailsjs"` to `"include"`:
```json
{
  "include": ["src", "wailsjs"]
}
```

- [ ] **Step 4: Install deps and confirm vite still builds**

```powershell
Set-Location d:/Econ-billing/frontend
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
npm run build
```
Expected: builds `dist/`. (Frontend src still references old axios services and won't typecheck yet if api.ts is gone — but axios is still installed transitively through current code; npm install will still succeed. tsc will fail because services/* still import api.ts. That's fixed in Tasks 16-21.)

If `npm run build` fails on tsc due to missing axios, that's acceptable here — the next tasks remove the axios calls. Move on.

- [ ] **Step 5: Commit**

```powershell
git add frontend/
git commit -m "chore(frontend): merge React app into Wails frontend dir"
```

---

### Task 16: Replace `lib/api.ts` with `lib/bindings.ts`

**Files:**
- Delete: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/bindings.ts`

- [ ] **Step 1: Create bindings.ts (re-exports + error helper)**

```ts
// frontend/src/lib/bindings.ts
export * as AuthAPI from '../../wailsjs/go/bindings/AuthBinding'
export * as CustomerAPI from '../../wailsjs/go/bindings/CustomerBinding'
export * as RoomAPI from '../../wailsjs/go/bindings/RoomBinding'
export * as ReservationAPI from '../../wailsjs/go/bindings/ReservationBinding'
export * as BillAPI from '../../wailsjs/go/bindings/BillBinding'
export * as PaymentAPI from '../../wailsjs/go/bindings/PaymentBinding'
export * as SettingsAPI from '../../wailsjs/go/bindings/SettingsBinding'
export * as AppAPI from '../../wailsjs/go/main/App'

export const handleApiError = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'An unexpected error occurred'
}
```

- [ ] **Step 2: Delete `api.ts`**

```powershell
Remove-Item d:/Econ-billing/frontend/src/lib/api.ts
```

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/lib/bindings.ts
git commit -am "refactor(frontend): replace axios api with wails binding re-exports"
```

---

### Task 17: Rewrite `auth.service.ts` over AuthBinding

**Files:**
- Modify: `frontend/src/services/auth.service.ts`

- [ ] **Step 1: Replace file contents**

```ts
// frontend/src/services/auth.service.ts
import { AuthAPI } from '@/lib/bindings'

export interface LoginRequest { username: string; password: string }
export interface RegisterRequest {
  username: string; password: string; role: 'ADMIN' | 'STAFF'; registration_token: string
}
export interface User { id: string; username: string; role: 'ADMIN' | 'STAFF' }
export interface AuthResponse { user: User }

const USER_KEY = 'econ_user_cache'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await AuthAPI.Login(data.username, data.password)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    return res as AuthResponse
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await AuthAPI.Register(data.username, data.password, data.role, data.registration_token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    return res as AuthResponse
  },

  async logout() {
    await AuthAPI.Logout()
    localStorage.removeItem(USER_KEY)
    window.location.hash = '#/login'
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  async isAuthenticated(): Promise<boolean> {
    return await AuthAPI.IsAuthenticated()
  },
}
```

Note: `IsAuthenticated()` now returns a Promise because every Wails binding call is async. `localStorage` is only kept as a UI hint cache for "who am I"; the source of truth is the Go session.

- [ ] **Step 2: Commit**

```powershell
git add frontend/src/services/auth.service.ts
git commit -m "refactor(frontend): auth.service over AuthBinding"
```

---

### Task 18: Rewrite `customer.service.ts` over CustomerBinding

**Files:**
- Modify: `frontend/src/services/customer.service.ts`

- [ ] **Step 1: Replace file contents**

```ts
// frontend/src/services/customer.service.ts
import { CustomerAPI } from '@/lib/bindings'
import type { Customer } from '@/types'

export interface CreateCustomerRequest {
  full_name: string; phone: string; address?: string;
  id_proof_type?: string; id_proof_number?: string;
}

const toInput = (d: CreateCustomerRequest) => ({
  full_name: d.full_name, phone: d.phone,
  address: d.address ?? '',
  id_proof_type: d.id_proof_type ?? '',
  id_proof_number: d.id_proof_number ?? '',
})

export const customerService = {
  getAll: () => CustomerAPI.GetAll() as Promise<Customer[]>,
  getById: (id: string) => CustomerAPI.GetByID(id) as Promise<Customer>,
  create: (data: CreateCustomerRequest) => CustomerAPI.Create(toInput(data)) as Promise<Customer>,
  update: (id: string, data: CreateCustomerRequest) => CustomerAPI.Update(id, toInput(data)) as Promise<Customer>,
  delete: (id: string) => CustomerAPI.Delete(id) as Promise<void>,
}
```

- [ ] **Step 2: Commit**

```powershell
git add frontend/src/services/customer.service.ts
git commit -m "refactor(frontend): customer.service over CustomerBinding"
```

---

### Task 19: Rewrite room and reservation services

**Files:**
- Modify: `frontend/src/services/room.service.ts`
- Modify: `frontend/src/services/reservation.service.ts`

- [ ] **Step 1: Replace `room.service.ts`**

```ts
// frontend/src/services/room.service.ts
import { RoomAPI } from '@/lib/bindings'
import type { Room, RoomType } from '@/types'

export interface CreateRoomTypeRequest { name: string; default_rate: number }
export interface CreateRoomRequest {
  room_number: string; type_id: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}
export interface UpdateRoomRequest extends CreateRoomRequest {}

export const roomService = {
  // Room Types
  getAllRoomTypes: () => RoomAPI.GetAllRoomTypes() as Promise<RoomType[]>,
  createRoomType: (d: CreateRoomTypeRequest) =>
    RoomAPI.CreateRoomType({ name: d.name, default_rate: d.default_rate }) as Promise<RoomType>,
  updateRoomType: (id: string, d: CreateRoomTypeRequest) =>
    RoomAPI.UpdateRoomType(id, { name: d.name, default_rate: d.default_rate }) as Promise<RoomType>,
  // Rooms
  getAllRooms: () => RoomAPI.GetAllRooms() as Promise<Room[]>,
  createRoom: (d: CreateRoomRequest) =>
    RoomAPI.CreateRoom({ room_number: d.room_number, type_id: d.type_id, status: d.status ?? 'AVAILABLE' }) as Promise<Room>,
  updateRoom: (id: string, d: UpdateRoomRequest) =>
    RoomAPI.UpdateRoom(id, { room_number: d.room_number, type_id: d.type_id, status: d.status ?? 'AVAILABLE' }) as Promise<Room>,
}
```

- [ ] **Step 2: Replace `reservation.service.ts`**

```ts
// frontend/src/services/reservation.service.ts
import { ReservationAPI } from '@/lib/bindings'
import type { Reservation } from '@/types'

export interface CreateReservationRequest {
  customer_id: string; room_id: string;
  check_in_date: string; expected_check_out_date?: string;
}
export interface CheckoutRequest { checkout_date: string }

export const reservationService = {
  getAll: () => ReservationAPI.GetAll() as Promise<Reservation[]>,
  getById: (id: string) => ReservationAPI.GetByID(id) as Promise<Reservation>,
  create: (d: CreateReservationRequest) =>
    ReservationAPI.Create({
      customer_id: d.customer_id, room_id: d.room_id,
      check_in_date: d.check_in_date,
      expected_check_out_date: d.expected_check_out_date ?? '',
    }) as Promise<Reservation>,
  checkin: (id: string) => ReservationAPI.CheckIn(id) as Promise<void>,
  cancel: (id: string) => ReservationAPI.Cancel(id) as Promise<void>,
  checkout: (id: string, d: CheckoutRequest) =>
    ReservationAPI.Checkout(id, d.checkout_date) as Promise<void>,
}
```

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/services/room.service.ts frontend/src/services/reservation.service.ts
git commit -m "refactor(frontend): room and reservation services over Wails bindings"
```

---

### Task 20: Rewrite bill (incl. payment) service

**Files:**
- Modify: `frontend/src/services/bill.service.ts`

- [ ] **Step 1: Replace file contents**

```ts
// frontend/src/services/bill.service.ts
import { BillAPI, PaymentAPI } from '@/lib/bindings'
import type { Bill, Payment } from '@/types'

export interface CreateBillRequest {
  customer_id: string; reservation_id?: string;
  bill_type: 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL';
  bill_date: string;
  is_gst_bill?: boolean;
  subtotal: number; tax_amount: number; discount_amount: number; total_amount: number;
  status?: 'DRAFT' | 'FINALIZED' | 'PAID' | 'UNPAID';
  line_items: { description: string; amount: number }[];
}

export interface CreatePaymentRequest {
  amount: number; payment_method: 'Cash' | 'Card' | 'UPI'; payment_date: string;
}

export const billService = {
  create: (d: CreateBillRequest) =>
    BillAPI.Create({
      customer_id: d.customer_id,
      reservation_id: d.reservation_id ?? null,
      bill_type: d.bill_type, bill_date: d.bill_date,
      is_gst_bill: d.is_gst_bill ?? false,
      subtotal: d.subtotal, tax_amount: d.tax_amount,
      discount_amount: d.discount_amount, total_amount: d.total_amount,
      status: d.status ?? 'DRAFT',
      line_items: d.line_items,
    }) as Promise<Bill>,
  getById: (id: string) => BillAPI.GetByID(id) as Promise<Bill>,
  getByCustomerId: (customerId: string) => BillAPI.GetByCustomerID(customerId) as Promise<Bill[]>,
  finalize: (id: string) => BillAPI.Finalize(id) as Promise<void>,
  createPayment: (billId: string, d: CreatePaymentRequest) =>
    PaymentAPI.Create(billId, {
      amount: d.amount, payment_method: d.payment_method, payment_date: d.payment_date,
    }) as Promise<Payment>,
  getPaymentsByBillId: (billId: string) => PaymentAPI.GetByBillID(billId) as Promise<Payment[]>,
}
```

- [ ] **Step 2: Commit**

```powershell
git add frontend/src/services/bill.service.ts
git commit -m "refactor(frontend): bill+payment service over Wails bindings"
```

---

### Task 21: Rewrite settings service

**Files:**
- Modify: `frontend/src/services/settings.service.ts`

- [ ] **Step 1: Replace contents**

```ts
// frontend/src/services/settings.service.ts
import { SettingsAPI } from '@/lib/bindings'
import type { Settings } from '@/types'

export const settingsService = {
  get: () => SettingsAPI.Get() as Promise<Settings>,
  save: (s: Omit<Settings, 'id' | 'created_at' | 'updated_at'>) =>
    SettingsAPI.Save({
      lodge_name: s.lodge_name, address: s.address, phone: s.phone,
      gst_number: s.gst_number, state_name: s.state_name, state_code: s.state_code,
      gst_invoice_prefix: s.gst_invoice_prefix,
      gst_invoice_next_number: s.gst_invoice_next_number,
      non_gst_invoice_prefix: s.non_gst_invoice_prefix,
      non_gst_invoice_next_number: s.non_gst_invoice_next_number,
    }) as Promise<Settings>,
}
```

- [ ] **Step 2: Confirm frontend typecheck passes**

```powershell
Set-Location d:/Econ-billing/frontend
npm run build
```
Expected: tsc + vite build succeed.

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/services/settings.service.ts
git commit -m "refactor(frontend): settings service over Wails bindings"
```

---

### Task 22: Update `App.tsx` ProtectedRoute to use async auth

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Replace ProtectedRoute with async-aware version**

```tsx
// frontend/src/App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/dashboard/Dashboard'
import CustomerList from './pages/customers/CustomerList'
import CustomerDetails from './pages/customers/CustomerDetails'
import RoomList from './pages/rooms/RoomList'
import ReservationList from './pages/reservations/ReservationList'
import BillList from './pages/bills/BillList'
import SettingsPage from './pages/settings/Settings'
import Login from './pages/Login'
import { authService } from './services/auth.service'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'pending' | 'authed' | 'guest'>('pending')
  useEffect(() => {
    authService.isAuthenticated().then(ok => setState(ok ? 'authed' : 'guest'))
  }, [])
  if (state === 'pending') return null
  if (state === 'guest') return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="reservations" element={<ReservationList />} />
          <Route path="bills" element={<BillList />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
export default App
```

- [ ] **Step 2: Add a window-control title bar (uses AppAPI for runtime)**

Optionally append a draggable title bar to `MainLayout.tsx` using `AppAPI.MinimizeWindow()` / `AppAPI.CloseWindow()`. Sample button:
```tsx
import { AppAPI } from '@/lib/bindings'
<button onClick={() => AppAPI.MinimizeWindow()}>—</button>
<button onClick={() => AppAPI.CloseWindow()}>×</button>
```
The draggable region needs the CSS rule `--wails-draggable: drag` on the title-bar element.

- [ ] **Step 3: Verify dev server starts**

```powershell
Set-Location d:/Econ-billing
wails dev
```
Expected: app window opens, login screen renders, login persists session, navigating to /customers loads data.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src
git commit -m "refactor(frontend): async ProtectedRoute, window controls via wails runtime"
```

---

### Task 23: Set wails.json metadata

**Files:**
- Modify: `wails.json`

- [ ] **Step 1: Edit wails.json**

```json
{
  "$schema": "https://wails.io/schemas/config.v2.json",
  "name": "Econ",
  "outputfilename": "Econ",
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev:watcher": "npm run dev",
  "frontend:dev:serverUrl": "auto",
  "author": {
    "name": "Econ",
    "email": "noreply@econ.local"
  },
  "info": {
    "companyName": "Econ",
    "productName": "Econ",
    "productVersion": "1.0.0",
    "copyright": "(c) 2026 Econ",
    "comments": "Hotel Management System"
  }
}
```

- [ ] **Step 2: Commit**

```powershell
git add wails.json
git commit -m "chore(wails): app metadata (Name=Econ, Version=1.0.0)"
```

---

### Task 24: New `build.ps1` using `wails build`

**Files:**
- Modify: `build.ps1`
- Delete: `build.bat`

- [ ] **Step 1: Replace build.ps1**

```powershell
# build.ps1 — Build Econ as a single Wails-packaged Windows executable.
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootDir

Write-Host "[1/2] Generating Wails bindings..." -ForegroundColor Cyan
wails generate module
if ($LASTEXITCODE -ne 0) { Write-Host "Binding generation failed" -ForegroundColor Red; exit 1 }

Write-Host "[2/2] Running wails build..." -ForegroundColor Cyan
wails build -clean -platform windows/amd64 -o Econ.exe
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Build completed successfully." -ForegroundColor Green
Write-Host "Output: $(Join-Path $RootDir 'build/bin/Econ.exe')"
```

- [ ] **Step 2: Remove old build.bat**

```powershell
Remove-Item d:/Econ-billing/build.bat -ErrorAction SilentlyContinue
```

- [ ] **Step 3: Run the build end-to-end**

Run: `./build.ps1`
Expected: produces `build/bin/Econ.exe`. Launch it manually and verify the login screen appears.

- [ ] **Step 4: Commit**

```powershell
git add build.ps1
git rm build.bat
git commit -m "chore(build): replace build script with wails build pipeline"
```

---

### Task 25: Delete `desktop/` and `backend/`

**Files:**
- Delete: `desktop/`
- Delete: `backend/`
- Delete: `frontend.wails-scaffold/`

- [ ] **Step 1: Verify nothing references those paths**

Run: `git grep -n "backend/" -- ':!docs/'`
Run: `git grep -n "desktop/" -- ':!docs/'`
Expected: no matches in source files (matches in docs/ are OK).

- [ ] **Step 2: Delete directories**

```powershell
Remove-Item -Recurse -Force d:/Econ-billing/desktop
Remove-Item -Recurse -Force d:/Econ-billing/backend
Remove-Item -Recurse -Force d:/Econ-billing/frontend.wails-scaffold
```

- [ ] **Step 3: Final build sanity check**

```powershell
./build.ps1
```
Expected: succeeds, Econ.exe runs.

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "chore: remove Electron desktop wrapper and Gin server entry point"
```

---

## Plan complete.

Spec coverage verified in self-review section above. Every binding, frontend service, and build script change has a concrete task with full code. The GST invoice numbering, GORM models, and Tailwind config are preserved by move-only operations in Tasks 3–4 and Task 15.
