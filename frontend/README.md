# Trinity Lodge - Frontend Application

A modern React-based frontend for the Daily Rate Room Rental Billing System.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v3
- **UI Components**: Custom Shadcn/UI components
- **Routing**: React Router v6
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   │   ├── layout/          # Layout components (MainLayout with navigation)
│   │   └── bills/           # Bill-specific components (BillEditor)
│   ├── pages/
│   │   ├── dashboard/       # Dashboard page with stats and quick actions
│   │   ├── customers/       # Customer list and details with tabs
│   │   ├── rooms/           # Room management and types
│   │   ├── reservations/    # Reservation management
│   │   └── bills/           # Bill components
│   ├── services/            # API service layer (to be implemented)
│   ├── context/             # React context providers (to be implemented)
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Main app component with routing
├── public/
└── package.json
```

## Features Implemented

### 1. Dashboard
- Overview stats (customers, reservations, rooms, revenue)
- Recent reservations and bills
- Quick action buttons for common tasks
- Navigation to all major sections

### 2. Customer Management
- **Customer List**: Search and view all customers
- **Customer Details Page** with 4 tabs:
  - **Overview**: Summary stats (reservations, bills, total amount)
  - **Reservations**: All customer reservations with "Generate Bill" action
  - **Bills**: All bills (with/without reservations) with status badges
  - **Payments**: Payment history

### 3. Room Management
- Room status dashboard (Available, Occupied, Maintenance)
- Room types with default rates
- Individual room management
- Visual status indicators with icons

### 4. Reservations
- Active reservations view
- Complete reservation history
- Check-in/Check-out date tracking
- Night calculation
- Direct links to customer details
- "Generate Bill" action for active reservations

### 5. Bill Editor Component
- **Dynamic Line Items**: Add/remove items with description and amount
- **Quick Add Buttons**: Pre-configured items (Room Charge, Food, Cleaning, Extra Bed)
- **GST Toggle**: Enable/disable with configurable percentage
- **Manual Discount**: Add discount amounts
- **Live Calculations**: Real-time subtotal, tax, and total calculations
- **Bill Preview**: See formatted bill before finalizing
- **Draft & Finalize**: Save as draft or finalize immediately

## Key Design Decisions

### Customer-Centric Approach
Following the plan, the system is designed around customers as the core entity:
- `Customer → Reservation → Bill` (traditional flow)
- `Customer → Bill` (direct billing without reservation)

### Flexible Billing
- Bills can exist with or without reservations
- Manual control over all bill components (rates, GST, discounts)
- Support for multiple bill types: ROOM, WALK_IN, FOOD, MANUAL

### Mock Data
Currently using mock data for development. All components are ready to integrate with backend APIs.

## Running the Application

### Development
```bash
npm install
npm run dev
```
The app will be available at http://localhost:5173

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Next Steps

### Backend Integration
1. Create API service layer in `src/services/`
2. Set up API client with axios/fetch
3. Implement authentication flow with JWT
4. Connect all components to real backend endpoints

### Additional Features to Implement
1. **Authentication**:
   - Login page
   - Role-based access control (ADMIN/STAFF)
   - Protected routes

2. **Forms & Modals**:
   - Add Customer form
   - Create Reservation form
   - Add Room/Room Type forms
   - Edit modals for all entities

3. **State Management**:
   - Context providers for global state
   - Customer data provider
   - Auth context

4. **PDF Generation**:
   - Bill invoice component
   - Print functionality
   - Download as PDF

5. **Payments**:
   - Payment form modal
   - Payment method selection
   - Payment history view

6. **Reports**:
   - Daily revenue report
   - Occupancy statistics
   - Customer analytics

7. **Validation**:
   - Form validation with react-hook-form
   - Error handling and display
   - Loading states

## Available Routes

- `/dashboard` - Main dashboard with stats
- `/customers` - Customer list
- `/customers/:id` - Customer details with tabs
- `/rooms` - Room management
- `/reservations` - Reservation list
- `/reports` - Reports (placeholder in nav)

## Component Library

### UI Components
All components follow Shadcn/UI patterns and are fully typed:
- `Button` - Primary, secondary, outline, ghost, link variants
- `Card` - Container with header, content, footer
- `Input` - Text input with full styling
- `Table` - Data tables with header, body, rows
- `Tabs` - Tab navigation (custom implementation)

### Utility
- `cn()` - Class name merger using clsx and tailwind-merge
- Type definitions for all domain models

## Styling

The application uses TailwindCSS with a custom theme based on CSS variables. Colors are semantic:
- `primary` - Main brand color
- `secondary` - Secondary actions
- `destructive` - Dangerous actions
- `muted` - Subdued text/backgrounds
- `accent` - Highlights

## Notes

- The application is currently in **UI scaffolding phase**
- All data is mocked for development
- Backend integration is the next major step
- Following the plan from `Plan.md` exactly
