# Bill Arrival & Departure Date+Time — Design

**Date:** 2026-06-25
**Status:** Approved

## Problem

Bills do not show the guest's arrival and departure. The user wants arrival and
departure **date + time** displayed on the bill, for both reservation-linked and
non-reservation bills.

## Decisions (confirmed with user)

- **Store time too** (not just dates). Reservation records store dates only, so
  the datetime is captured and persisted on the **Bill** itself.
- **Pre-fill source:** actual, falling back to planned — when the bill is linked
  to a reservation: arrival = `actual_check_in_date ?? check_in_date`,
  departure = `actual_check_out_date ?? expected_check_out_date`. The reservation
  has no stored time, so default times are **12:00 PM arrival / 11:00 AM
  departure** (editable).
- **Non-reservation bills** also capture arrival/departure directly in the editor.
- **Show in both** the printed invoice and the bill view modal.
- Fields are **optional**; bills without them omit the lines.

## Data model — `Bill` (Go)

Add two nullable fields to `internal/models/bill.go`:

```go
ArrivalDateTime   *string `gorm:"type:varchar(20)" json:"arrival_datetime"`
DepartureDateTime *string `gorm:"type:varchar(20)" json:"departure_datetime"`
```

Stored as ISO `YYYY-MM-DDTHH:mm` strings (matches the existing date-as-string
convention; `*string` keeps them nullable). `db.AutoMigrate(&models.Bill{})`
already runs on startup and adds the columns; existing bills get NULL.

## Backend — `internal/bindings/bill.go`

Add to `BillInput`:

```go
ArrivalDateTime   *string `json:"arrival_datetime"`
DepartureDateTime *string `json:"departure_datetime"`
```

Map both into the `models.Bill` constructed in `Create`.

## Frontend

### Types (`frontend/src/types/index.ts`)
- `Bill`: add `arrival_datetime?: string` and `departure_datetime?: string`.

### Bill editor (`frontend/src/components/bills/BillEditor.tsx`)
- `BillData`: add `arrivalDateTime?: string`, `departureDateTime?: string`.
- New "Arrival & Departure" section with two `datetime-local` inputs, shown for
  all bill types (optional).
- Pre-fill when `reservation` is present: arrival date from
  `actual_check_in_date ?? check_in_date` with default time `12:00`; departure
  date from `actual_check_out_date ?? expected_check_out_date` with default time
  `11:00`. Value format: `YYYY-MM-DDTHH:mm`.
- For non-reservation bills, inputs start blank.
- Include both values in the `BillData` passed to `onSave`.

### Save mapping (`frontend/src/pages/customers/CustomerDetails.tsx`)
- Add `arrival_datetime: billData.arrivalDateTime` and
  `departure_datetime: billData.departureDateTime` to the create request.

### Display (`BillPrint.tsx`, `BillViewModal.tsx`)
- A shared `formatDateTime(value)` helper renders e.g. `12 May 2026, 12:00 PM`.
- Show "Arrival" and "Departure" lines only when the respective value is set.
- In `BillPrint`, place them near the bill date / Bill To area.
- In `BillViewModal`, add them to the bill info grid.

## Testing

- Reservation bill: arrival/departure pre-fill from actual (fallback planned)
  dates with default times; editable; persist; show on print + view.
- Walk-in/manual bill (no reservation): inputs blank, user enters, persists, shows.
- Bill with neither set: no arrival/departure lines anywhere.
- `AutoMigrate` adds columns; existing bills load with NULL and render no lines.
- Go build/tests pass; frontend `tsc -b` + build pass.
