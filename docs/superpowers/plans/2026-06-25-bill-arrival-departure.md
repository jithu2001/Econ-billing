# Bill Arrival & Departure Date+Time Implementation Plan

> **For agentic workers:** Implement task-by-task. NO git operations this session (leave changes in the working tree). Verify with builds/typechecks.

**Goal:** Capture and display guest arrival and departure date+time on bills (reservation-linked and walk-in), persisted on the Bill.

**Architecture:** Two nullable `*string` datetime columns on the `Bill` model (ISO `YYYY-MM-DDTHH:mm`), threaded through the Wails binding DTO, the React bill editor (datetime-local inputs, pre-filled from the linked reservation when present), the save mapping, and the print/view displays. `AutoMigrate` adds the columns automatically.

**Reference spec:** `docs/superpowers/specs/2026-06-25-bill-arrival-departure-design.md`

---

### Task 1: Backend — model fields + binding DTO

**Files:**
- Modify: `internal/models/bill.go`
- Modify: `internal/bindings/bill.go`

- [ ] **Step 1: Add fields to the Bill model.** In `internal/models/bill.go`, in the `Bill` struct, after the `TotalAmount` field line, add:
```go
	ArrivalDateTime   *string `gorm:"type:varchar(20)" json:"arrival_datetime"`
	DepartureDateTime *string `gorm:"type:varchar(20)" json:"departure_datetime"`
```

- [ ] **Step 2: Add fields to `BillInput`.** In `internal/bindings/bill.go`, in the `BillInput` struct, after the `TotalAmount float64` line (before `Status`), add:
```go
	ArrivalDateTime   *string `json:"arrival_datetime"`
	DepartureDateTime *string `json:"departure_datetime"`
```

- [ ] **Step 3: Map them in `Create`.** In `internal/bindings/bill.go`, in the `bill := &models.Bill{...}` literal, after `TotalAmount: in.TotalAmount,` add:
```go
		ArrivalDateTime:   in.ArrivalDateTime,
		DepartureDateTime: in.DepartureDateTime,
```

- [ ] **Step 4: Build + test the backend.**
Run: `go build ./... && go test ./internal/...`
Expected: build succeeds; tests pass (existing bill/settings tests unaffected).

---

### Task 2: Frontend types + service request

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/services/bill.service.ts`

Note: the Wails-generated `frontend/wailsjs/go/models.ts` is NOT edited — the
service passes the payload to `BillAPI.Create` with an `as any` cast, so the
generated `BillInput` type is bypassed; the Go json tags (Task 1) carry the
fields at runtime. Components type bills via `@/types`, not the generated model.

- [ ] **Step 1: Add fields to the `Bill` interface.** In `frontend/src/types/index.ts`, in the `Bill` interface, after `total_amount: number`, add:
```ts
  arrival_datetime?: string
  departure_datetime?: string
```

- [ ] **Step 2: Add fields to `CreateBillRequest`.** In `frontend/src/services/bill.service.ts`, in the `CreateBillRequest` interface, after the `line_items: ...` line, add:
```ts
  arrival_datetime?: string;
  departure_datetime?: string;
```

- [ ] **Step 3: Forward them in `create`.** In the same file, in the object passed to `BillAPI.Create({...})`, after `line_items: d.line_items,` add:
```ts
      arrival_datetime: d.arrival_datetime,
      departure_datetime: d.departure_datetime,
```

- [ ] **Step 4: Typecheck.** Run: `cd frontend && npx tsc -b` — expected: no errors.

---

### Task 3: Bill editor — datetime inputs + reservation pre-fill

**Files:**
- Modify: `frontend/src/components/bills/BillEditor.tsx`

- [ ] **Step 1: Extend `BillData`.** In the `BillData` interface, after `numberOfDays?: number`, add:
```ts
  arrivalDateTime?: string
  departureDateTime?: string
```

- [ ] **Step 2: Add state with reservation-based initial values.** After the existing `inclusiveDescription` state line, add this block. It pre-fills from the reservation (actual → planned) with default times when a reservation exists, else blank:
```ts
  const initialArrival = reservation
    ? `${reservation.actual_check_in_date || reservation.check_in_date}T12:00`
    : ''
  const initialDeparture = reservation
    ? `${reservation.actual_check_out_date || reservation.expected_check_out_date}T11:00`
    : ''
  const [arrivalDateTime, setArrivalDateTime] = useState(initialArrival)
  const [departureDateTime, setDepartureDateTime] = useState(initialDeparture)
```

- [ ] **Step 3: Include in saved data.** In `handleSave`, add to the `billData` object (after `numberOfDays,`):
```ts
      arrivalDateTime: arrivalDateTime || undefined,
      departureDateTime: departureDateTime || undefined,
```

- [ ] **Step 4: Add the input UI.** Immediately before the `{/* Calculation Mode Toggle */}` block, insert:
```tsx
          {/* Arrival & Departure */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Arrival & Departure</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="arrival_dt" className="text-xs">Arrival</Label>
                  <Input
                    id="arrival_dt"
                    type="datetime-local"
                    value={arrivalDateTime}
                    onChange={(e) => setArrivalDateTime(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="departure_dt" className="text-xs">Departure</Label>
                  <Input
                    id="departure_dt"
                    type="datetime-local"
                    value={departureDateTime}
                    onChange={(e) => setDepartureDateTime(e.target.value)}
                    className="h-9"
                    min={arrivalDateTime || undefined}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
```
(`Card`, `CardContent`, `Label`, `Input`, and the `Calendar` icon are already imported in this file — verify before use.)

- [ ] **Step 5: Typecheck.** Run: `cd frontend && npx tsc -b` — expected: no errors.

---

### Task 4: Save mapping + display

**Files:**
- Modify: `frontend/src/pages/customers/CustomerDetails.tsx`
- Modify: `frontend/src/components/bills/BillPrint.tsx`
- Modify: `frontend/src/components/bills/BillViewModal.tsx`

- [ ] **Step 1: Map fields into the create request.** In `frontend/src/pages/customers/CustomerDetails.tsx`, in the `billRequest` object inside `handleBillSubmit`, after `line_items: ...,` add:
```ts
        arrival_datetime: billData.arrivalDateTime,
        departure_datetime: billData.departureDateTime,
```

- [ ] **Step 2: Add a datetime formatter + display to `BillPrint.tsx`.** In `frontend/src/components/bills/BillPrint.tsx`, inside the component near the existing `formatDate` function, add:
```ts
  const formatDateTime = (value?: string) => {
    if (!value) return ''
    const d = new Date(value)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
  }
```
Then, in the header block right after the `<p>` that renders `formatDate(bill.bill_date)` (the date under the invoice number), add:
```tsx
          {bill.arrival_datetime && (
            <p className="text-sm text-gray-500">Arrival: {formatDateTime(bill.arrival_datetime)}</p>
          )}
          {bill.departure_datetime && (
            <p className="text-sm text-gray-500">Departure: {formatDateTime(bill.departure_datetime)}</p>
          )}
```

- [ ] **Step 3: Add display to `BillViewModal.tsx`.** In `frontend/src/components/bills/BillViewModal.tsx`, add a formatter near the top of the component body (after `if (!bill) return null` / the existing gstSplit line):
```ts
  const formatDateTime = (value?: string) => {
    if (!value) return ''
    return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
  }
```
Then, inside the "Bill Info Grid" `<div className="grid grid-cols-2 gap-4">`, after the Bill Type cell, add (conditionally):
```tsx
                      {bill.arrival_datetime && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="text-gray-500 text-sm mb-1">Arrival</div>
                          <p className="text-gray-900 font-medium">{formatDateTime(bill.arrival_datetime)}</p>
                        </div>
                      )}
                      {bill.departure_datetime && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="text-gray-500 text-sm mb-1">Departure</div>
                          <p className="text-gray-900 font-medium">{formatDateTime(bill.departure_datetime)}</p>
                        </div>
                      )}
```

- [ ] **Step 4: Typecheck.** Run: `cd frontend && npx tsc -b` — expected: no errors.

---

### Task 5: Full build verification

- [ ] **Step 1:** Run: `go build ./...` (repo root) — expected: success.
- [ ] **Step 2:** Run: `cd frontend && npm run build` — expected: success.
- [ ] **Step 3 (manual, user):** Launch `wails dev`; create a room bill from a reservation (confirm arrival/departure pre-filled, editable, shown on view + print) and a walk-in bill (enter arrival/departure, confirm persisted + shown). Confirm an old bill with no datetimes shows no arrival/departure lines.

---

## Self-Review

- Spec coverage: model+time storage (Task 1), backend DTO (Task 1), types/bindings (Task 2), editor inputs + actual→planned prefill with 12:00/11:00 defaults (Task 3), save mapping (Task 4 s1), print + view display with formatter, conditional on presence (Task 4 s2-3). ✔
- Non-reservation capture: Task 3 initial values blank when no reservation; inputs shown for all bill types. ✔
- Optional/omit-when-empty: `arrivalDateTime || undefined` on save; `{bill.arrival_datetime && ...}` guards on display. ✔
- Placeholder scan: none. Type consistency: `arrival_datetime`/`departure_datetime` (snake, Go/JSON/TS Bill), `arrivalDateTime`/`departureDateTime` (camel, BillData) used consistently. ✔
