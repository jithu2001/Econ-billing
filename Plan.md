🧾 Daily Rate Room Rental Billing System
(Customer-Centric, Reservation Optional)
🎯 Goal Description

Build a flexible, daily-rate billing system for lodges/hostels where:

Bills can be generated with or without reservations

Every bill belongs to a customer

Room rate, GST, discounts, and charges are fully manual

Designed for real-world operations, not rigid automation

Simple UI for staff, powerful controls for admins

✅ Confirmed Tech Stack
Layer	Technology
Frontend	React (Vite) + TypeScript
UI	TailwindCSS + Shadcn/UI
Backend	Golang + Gin
Database	SQLite (Embedded)
ORM	GORM
Auth	JWT
PDF	gofpdf / chromedp
🧠 Core Design Principle (IMPORTANT)

Customer is the central entity.

Everything starts from a Customer:

Customer → Reservation → Bill

Customer → Bill (No reservation)

This mirrors how lodges actually work.

🏗️ System Architecture
High-Level Architecture
React SPA
   ↓ REST API
Gin Backend
   ↓
SQLite Database

Clean Architecture Layers
Handlers (HTTP)
↓
Services / UseCases (Business Logic)
↓
Repositories (DB Access)
↓
Models (Entities)

🗃️ Database Schema (FINAL)
1️⃣ Users
id (UUID, PK)
username (unique)
password_hash
role (ADMIN | STAFF)
created_at
updated_at

2️⃣ Customers (CORE ENTITY)
id (UUID, PK)
full_name
phone
address
id_proof_type
id_proof_number
created_at
updated_at

3️⃣ RoomTypes
id (UUID, PK)
name
default_rate
created_at
updated_at

4️⃣ Rooms
id (UUID, PK)
room_number (unique)
type_id (FK)
status (AVAILABLE | OCCUPIED | MAINTENANCE)
created_at
updated_at

5️⃣ Reservations (OPTIONAL)
id (UUID, PK)
customer_id (FK)
room_id (FK)
check_in_date
expected_check_out_date
actual_check_out_date
status (ACTIVE | COMPLETED | CANCELLED)
created_at
updated_at

6️⃣ Bills (UPDATED & FLEXIBLE)
id (UUID, PK)
customer_id (FK)               -- REQUIRED
reservation_id (FK, NULLABLE) -- OPTIONAL
bill_type (ROOM | WALK_IN | FOOD | MANUAL)
bill_date
subtotal
tax_amount
discount_amount
total_amount
status (DRAFT | FINALIZED | PAID | UNPAID)
generated_by (FK -> Users)
created_at
updated_at

7️⃣ BillLineItems
id (UUID, PK)
bill_id (FK)
description
amount
created_at

8️⃣ Payments
id (UUID, PK)
bill_id (FK)
amount
payment_method (Cash | Card | UPI)
payment_date

🔄 Business Workflows
🟢 Flow 1: Bill WITH Reservation (Room Stay)

Steps

Create Customer

Check-in → Create Reservation

Open Customer → Reservations

Click Generate Bill

System auto-adds:

Room Charge (Days × Rate)

User can:

Edit rate

Add food / extras

Enable/disable tax

Finalize → Pay → Checkout

🟢 Flow 2: Bill WITHOUT Reservation (NEW)

Use Cases

Walk-in guest

Food bill

Extra charges

Manual billing

Steps

Open Customer

Click ➕ New Bill

Select Bill Type

Add line items manually

Apply tax / discount

Finalize → Pay

✔ No room
✔ No reservation
✔ Very fast

🌐 API Endpoints (FINAL)
🔐 Authentication
POST /api/auth/login

👤 Customers
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

🏨 Rooms & Types
GET  /api/room-types
POST /api/room-types

GET  /api/rooms
POST /api/rooms

📅 Reservations
GET  /api/reservations
POST /api/reservations
PUT  /api/reservations/:id/checkout

🧾 Bills (KEY CHANGES)
POST /api/bills
GET  /api/bills/:id
PUT  /api/bills/:id
POST /api/bills/:id/finalize
GET  /api/customers/:id/bills
POST /api/reservations/:id/bill

💳 Payments
POST /api/bills/:id/payments

🖥️ Frontend UX Structure
🧭 Navigation
Dashboard
Customers
Rooms
Reservations
Reports

👤 Customer Details Page (IMPORTANT)

Tabs:

Overview | Reservations | Bills | Payments

🧾 Bills Tab

List all bills (with/without reservation)

Buttons:

➕ Create Bill

🖨️ View Invoice

💳 Add Payment

✍️ Bill Editor (User Friendly)

Features:

Dynamic line items

Toggle GST

Manual discount

Live total calculation

Save as Draft

Smart Actions:

➕ Add Room Charge (only if reservation exists)

➕ Common Items (Food, Cleaning, Extra Bed)

📁 Project Structure (UNCHANGED)
backend/
 ├── cmd/server/main.go
 ├── internal/
 │   ├── config
 │   ├── models
 │   ├── handlers
 │   ├── services
 │   ├── repository
 │   └── routes
 └── pkg/utils

frontend/
 ├── src/components
 ├── src/pages
 ├── src/services
 ├── src/context
 └── App.tsx

🧪 Verification Plan
Manual Testing

Create Customer

Create Bill (No reservation)

Add food & finalize

Create Reservation

Generate Bill from reservation

Modify rate

Checkout room

Verify room status resets

🚀 Why This Design Works

✅ Real-world lodge workflow
✅ No forced automation
✅ Customer-centric
✅ Faster billing
✅ Less staff confusion
✅ Future-proof

🔜 Optional Future Enhancements

Customer ledger

Day-end report

Bill templates

Multi-branch support

Role-based permissions