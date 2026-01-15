# Check-In/Checkout Issue Fix

**Date**: January 14, 2026
**Status**: ✅ FIXED

---

## Problems Fixed

### 1. Check-In Affecting All Reservations
**Problem**: When clicking "Check In" on one reservation, all reservations for the same room appeared as checked in.

**Root Cause**: The `isCheckedIn` function was checking room status (OCCUPIED) instead of reservation status. Multiple reservations could reference the same room, so when one room was marked OCCUPIED, all reservations for that room appeared checked in.

**Solution**: Added `ActualCheckInDate` field to track check-in status at the reservation level, not the room level.

### 2. Checkout Not Working
**Problem**: Clicking "Checkout" returned 400 error.

**Root Cause**: Frontend was sending `actual_check_out_date` but backend expected `checkout_date`.

**Solution**: Updated frontend to send `checkout_date` field to match backend expectations.

---

## Changes Made

### Backend Changes

#### 1. Updated Reservation Model ([reservation.go](d:\Trinity\backend\internal\models\reservation.go))

**Added new field**:
```go
ActualCheckInDate *string `gorm:"type:date" json:"actual_check_in_date"`
```

This field tracks when a guest actually checks in (vs. the planned check-in date).

#### 2. Updated Check-In Service ([reservation_service.go](d:\Trinity\backend\internal\services\reservation_service.go))

**Before**:
```go
func (s *ReservationService) CheckInReservation(id uuid.UUID) error {
    reservation, err := s.repo.FindByID(id)
    if err != nil {
        return err
    }
    if reservation.Status != models.ReservationStatusActive {
        return errors.New("only active reservations can be checked in")
    }
    // Update room status to occupied
    return s.roomRepo.UpdateRoomStatus(reservation.RoomID, models.RoomStatusOccupied)
}
```

**After**:
```go
func (s *ReservationService) CheckInReservation(id uuid.UUID) error {
    reservation, err := s.repo.FindByID(id)
    if err != nil {
        return err
    }
    if reservation.Status != models.ReservationStatusActive {
        return errors.New("only active reservations can be checked in")
    }
    if reservation.ActualCheckInDate != nil {
        return errors.New("reservation is already checked in")
    }
    // Set actual check-in date
    today := time.Now().Format("2006-01-02")
    reservation.ActualCheckInDate = &today
    // Update reservation
    err = s.repo.Update(reservation)
    if err != nil {
        return err
    }
    // Update room status to occupied
    return s.roomRepo.UpdateRoomStatus(reservation.RoomID, models.RoomStatusOccupied)
}
```

**Key Changes**:
- Added check for existing check-in
- Set `ActualCheckInDate` on the reservation record
- Update the reservation in database
- Then update room status

#### 3. Added `time` Import
Added `"time"` to imports in [reservation_service.go](d:\Trinity\backend\internal\services\reservation_service.go:3).

#### 4. Database Migration
GORM AutoMigrate automatically added the new column:
```sql
ALTER TABLE `reservations` ADD `actual_check_in_date` date
```

---

### Frontend Changes

#### 1. Updated Reservation Type ([types/index.ts](d:\Trinity\frontend\src\types\index.ts))

**Added field**:
```typescript
export interface Reservation {
  id: string
  customer_id: string
  room_id: string
  check_in_date: string
  actual_check_in_date?: string  // NEW
  expected_check_out_date: string
  actual_check_out_date?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  created_at: string
  updated_at: string
  customer?: Customer
  room?: Room
}
```

#### 2. Fixed `isCheckedIn` Logic ([ReservationList.tsx](d:\Trinity\frontend\src\pages\reservations\ReservationList.tsx))

**Before**:
```typescript
const isCheckedIn = (reservation: Reservation) => {
  // Check if the room is occupied (guest has checked in)
  const room = rooms.find(r => r.id === reservation.room_id)
  return room?.status === 'OCCUPIED'
}
```

**After**:
```typescript
const isCheckedIn = (reservation: Reservation) => {
  // Check if the reservation has an actual check-in date
  return reservation.actual_check_in_date != null
}
```

**Why This Fixes It**:
- Now checks the specific reservation's check-in status
- Not dependent on room status
- Multiple reservations for the same room are independent

#### 3. Fixed Checkout Request ([ReservationList.tsx](d:\Trinity\frontend\src\pages\reservations\ReservationList.tsx))

**Before**:
```typescript
await reservationService.checkout(reservationId, {
  actual_check_out_date: new Date().toISOString().split('T')[0],
})
```

**After**:
```typescript
await reservationService.checkout(reservationId, {
  checkout_date: new Date().toISOString().split('T')[0],
})
```

#### 4. Updated Checkout Interface ([reservation.service.ts](d:\Trinity\frontend\src\services\reservation.service.ts))

**Before**:
```typescript
export interface CheckoutRequest {
  actual_check_out_date: string;
}
```

**After**:
```typescript
export interface CheckoutRequest {
  checkout_date: string;
}
```

---

## How It Works Now

### Check-In Flow

1. **User Action**: Staff clicks "Check In" for Reservation A
2. **Frontend**: Calls `PUT /api/reservations/{id}/checkin`
3. **Backend**:
   - Finds specific reservation by ID
   - Validates reservation is ACTIVE and not already checked in
   - Sets `actual_check_in_date` to today on Reservation A only
   - Updates Reservation A in database
   - Marks the room as OCCUPIED
4. **Frontend Reloads**: Gets all reservations
5. **Display Logic**:
   - Only Reservation A has `actual_check_in_date` set
   - Only Reservation A shows "Checkout" button
   - Other reservations for same room (past or future) remain unaffected

### Checkout Flow

1. **User Action**: Staff clicks "Checkout" for a checked-in reservation
2. **Frontend**: Calls `PUT /api/reservations/{id}/checkout` with `checkout_date`
3. **Backend**:
   - Finds reservation by ID
   - Sets `actual_check_out_date`
   - Changes status to COMPLETED
   - Marks room as AVAILABLE
4. **UI Updates**: Reservation moves to "Completed" section

---

## Database Schema Changes

```sql
-- New column added to reservations table
ALTER TABLE reservations ADD COLUMN actual_check_in_date DATE;
```

**Before**:
```
reservations
├── id (UUID)
├── customer_id (UUID)
├── room_id (UUID)
├── check_in_date (DATE)
├── expected_check_out_date (DATE)
├── actual_check_out_date (DATE)
├── status (VARCHAR)
├── created_at (DATETIME)
└── updated_at (DATETIME)
```

**After**:
```
reservations
├── id (UUID)
├── customer_id (UUID)
├── room_id (UUID)
├── check_in_date (DATE)
├── actual_check_in_date (DATE)       ← NEW
├── expected_check_out_date (DATE)
├── actual_check_out_date (DATE)
├── status (VARCHAR)
├── created_at (DATETIME)
└── updated_at (DATETIME)
```

---

## Files Modified

### Backend (3 files)
1. [backend/internal/models/reservation.go](d:\Trinity\backend\internal\models\reservation.go) - Added `ActualCheckInDate` field
2. [backend/internal/services/reservation_service.go](d:\Trinity\backend\internal\services\reservation_service.go) - Updated `CheckInReservation` method
3. Database - Auto-migrated new column

### Frontend (3 files)
1. [frontend/src/types/index.ts](d:\Trinity\frontend\src\types\index.ts) - Added `actual_check_in_date` to interface
2. [frontend/src/pages/reservations/ReservationList.tsx](d:\Trinity\frontend\src\pages\reservations\ReservationList.tsx) - Fixed `isCheckedIn` logic and checkout request
3. [frontend/src/services/reservation.service.ts](d:\Trinity\frontend\src\services\reservation.service.ts) - Fixed `CheckoutRequest` interface

---

## Testing

### Test 1: Check-In Single Reservation
1. ✅ Create 3 reservations for Room 101 (past, present, future)
2. ✅ Click "Check In" on the current reservation
3. ✅ **Verify**: Only that reservation shows "Checkout" button
4. ✅ **Verify**: Other reservations for Room 101 remain unaffected
5. ✅ **Verify**: Room 101 shows as OCCUPIED in Rooms page

### Test 2: Checkout
1. ✅ Check in a reservation
2. ✅ Click "Checkout"
3. ✅ **Verify**: No 400 error
4. ✅ **Verify**: Reservation moves to Completed section
5. ✅ **Verify**: Room becomes AVAILABLE

### Test 3: Multiple Rooms
1. ✅ Create reservations for Room 101 and Room 102
2. ✅ Check in both
3. ✅ **Verify**: Each room shows OCCUPIED independently
4. ✅ Checkout Room 101
5. ✅ **Verify**: Room 101 becomes AVAILABLE, Room 102 stays OCCUPIED

---

## Summary

✅ **Check-In Issue**: Fixed by tracking check-in at reservation level with `actual_check_in_date` field

✅ **Checkout Issue**: Fixed by aligning frontend/backend field names (`checkout_date`)

✅ **Database**: Auto-migrated successfully with GORM

✅ **Type Safety**: Full TypeScript support with updated interfaces

✅ **Independent Reservations**: Each reservation's check-in status is now independent of room status

---

## Benefits

1. **Accurate Tracking**: Can see exactly when each guest checked in vs. planned check-in
2. **Historical Data**: Past reservations for same room don't interfere with current ones
3. **Better UI**: Only relevant reservations show check-in/checkout buttons
4. **Data Integrity**: Reservation check-in status stored in database, not just inferred
5. **Audit Trail**: `actual_check_in_date` provides clear audit trail

---

**Status**: ✅ All issues resolved and tested successfully!
