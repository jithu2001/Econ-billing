# CGST/SGST Split + Tax-Inclusive Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display GST as separate CGST and SGST lines (with percentages) on every bill surface, and add a "from total" tax-inclusive entry mode to the bill editor.

**Architecture:** A single pure helper (`gstSplit`) derives CGST/SGST amounts and rates from a bill's stored `subtotal` and `tax_amount` (50/50 split). Three React components consume it for display. The bill editor gains an exclusive/inclusive mode toggle; inclusive mode back-calculates base + tax from a single total and synthesizes one line item on save. No Go, repository, model, or DB changes — persisted data is untouched.

**Tech Stack:** React + TypeScript (Vite), existing `BillData` flow. Verification via `npx tsc -b` (type/build check) and a throwaway Node script for the math (no test framework is configured in this frontend).

**Reference spec:** `docs/superpowers/specs/2026-06-25-cgst-sgst-split-design.md`

---

### Task 1: Pure `gstSplit` helper

**Files:**
- Create: `frontend/src/lib/gst.ts`
- Verify (throwaway): `frontend/gst.check.mjs`

- [ ] **Step 1: Write the failing math check**

Create `frontend/gst.check.mjs`:

```js
// Throwaway verification of the GST split math. Deleted after Task 1.
import assert from 'node:assert'
import { gstSplit, formatRate } from './src/lib/gst.ts'

// 1000 base @ 18% -> tax 180 -> CGST/SGST 90 @ 9% each
let r = gstSplit(1000, 180)
assert.strictEqual(r.cgstAmount, 90)
assert.strictEqual(r.sgstAmount, 90)
assert.strictEqual(r.cgstRate, 9)
assert.strictEqual(r.sgstRate, 9)

// Zero subtotal -> zero rate, no divide-by-zero
r = gstSplit(0, 0)
assert.strictEqual(r.cgstRate, 0)
assert.strictEqual(r.cgstAmount, 0)

// Non-integer half: 1000 @ 5% -> tax 50 -> 2.5% each
r = gstSplit(1000, 50)
assert.strictEqual(r.cgstRate, 2.5)

// Rate label formatting drops trailing zeros
assert.strictEqual(formatRate(9), '9')
assert.strictEqual(formatRate(2.5), '2.5')
assert.strictEqual(formatRate(9.005), '9.01')

console.log('gstSplit OK')
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && node --experimental-strip-types gst.check.mjs`
Expected: FAIL — cannot resolve `./src/lib/gst.ts` (file does not exist yet).

- [ ] **Step 3: Implement the helper**

Create `frontend/src/lib/gst.ts`:

```ts
export interface GstSplit {
  cgstAmount: number
  sgstAmount: number
  cgstRate: number
  sgstRate: number
}

/**
 * Derive the 50/50 CGST/SGST split from a bill's stored subtotal and tax amount.
 * Display-only: the bill still persists a single combined tax_amount.
 */
export function gstSplit(subtotal: number, taxAmount: number): GstSplit {
  const gstRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0
  const half = taxAmount / 2
  return {
    cgstAmount: half,
    sgstAmount: half,
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
  }
}

/** Format a percentage rate without trailing zeros, e.g. 9, 2.5, 9.01. */
export function formatRate(rate: number): string {
  return parseFloat(rate.toFixed(2)).toString()
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && node --experimental-strip-types gst.check.mjs`
Expected: prints `gstSplit OK`, exit 0.

- [ ] **Step 5: Delete the throwaway check and commit**

```bash
cd frontend && rm gst.check.mjs
git add frontend/src/lib/gst.ts
git commit -m "feat(bills): add gstSplit helper for CGST/SGST derivation"
```

---

### Task 2: Split GST on the printed invoice

**Files:**
- Modify: `frontend/src/components/bills/BillPrint.tsx:151-156`

- [ ] **Step 1: Import the helper**

At the top of `frontend/src/components/bills/BillPrint.tsx`, after the existing
`import type { Bill, Customer, Settings } from '@/types'` line, add:

```ts
import { gstSplit, formatRate } from '@/lib/gst'
```

- [ ] **Step 2: Compute the split inside the component**

In the component body, immediately after the existing line
`const totalInWords = ...` (around line 61), add:

```ts
const { cgstAmount, sgstAmount, cgstRate, sgstRate } = gstSplit(bill.subtotal, bill.tax_amount)
```

- [ ] **Step 3: Replace the single GST line with CGST + SGST lines**

Replace this block (around lines 151-156):

```tsx
          {bill.tax_amount > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">GST</span>
              <span className="text-gray-900">{bill.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
```

with:

```tsx
          {bill.tax_amount > 0 && (
            <>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">CGST ({formatRate(cgstRate)}%)</span>
                <span className="text-gray-900">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">SGST ({formatRate(sgstRate)}%)</span>
                <span className="text-gray-900">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
```

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc -b`
Expected: completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/bills/BillPrint.tsx
git commit -m "feat(bills): show CGST/SGST split with rates on printed invoice"
```

---

### Task 3: Split GST in the bill view modal

**Files:**
- Modify: `frontend/src/components/bills/BillViewModal.tsx:171-176`

- [ ] **Step 1: Import the helper**

At the top of `frontend/src/components/bills/BillViewModal.tsx`, after
`import BillPrint from './BillPrint'`, add:

```ts
import { gstSplit, formatRate } from '@/lib/gst'
```

- [ ] **Step 2: Compute the split before the return**

Inside the component, after the existing `if (!bill) return null` line (around
line 59), add:

```ts
  const { cgstAmount, sgstAmount, cgstRate, sgstRate } = gstSplit(bill.subtotal, bill.tax_amount)
```

- [ ] **Step 3: Replace the single Tax (GST) line with CGST + SGST lines**

Replace this block (around lines 171-176):

```tsx
                      {bill.tax_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tax (GST)</span>
                          <span className="text-gray-700">₹{bill.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
```

with:

```tsx
                      {bill.tax_amount > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">CGST ({formatRate(cgstRate)}%)</span>
                            <span className="text-gray-700">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">SGST ({formatRate(sgstRate)}%)</span>
                            <span className="text-gray-700">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </>
                      )}
```

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc -b`
Expected: completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/bills/BillViewModal.tsx
git commit -m "feat(bills): show CGST/SGST split with rates in bill view modal"
```

---

### Task 4: Bill editor — CGST/SGST display + tax-inclusive mode

**Files:**
- Modify: `frontend/src/components/bills/BillEditor.tsx`

- [ ] **Step 1: Import the helper**

At the top of `frontend/src/components/bills/BillEditor.tsx`, after
`import type { BillLineItem, Reservation } from '../../types'`, add:

```ts
import { gstSplit, formatRate } from '@/lib/gst'
```

- [ ] **Step 2: Add inclusive-mode state**

After the existing `const [discountAmount, setDiscountAmount] = useState(0)` line
(around line 42), add:

```ts
  const [calcMode, setCalcMode] = useState<'exclusive' | 'inclusive'>('exclusive')
  const [inclusiveTotal, setInclusiveTotal] = useState(0)
  const [inclusiveDescription, setInclusiveDescription] = useState('Charges')
```

- [ ] **Step 3: Replace the calculation block with mode-aware math**

Replace these three lines (around lines 56-58):

```ts
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const taxAmount = enableGST ? (subtotal * gstPercentage) / 100 : 0
  const totalAmount = subtotal + taxAmount - discountAmount
```

with:

```ts
  const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  let subtotal: number
  let taxAmount: number
  let totalAmount: number

  if (calcMode === 'inclusive') {
    // User enters the gross total; back-calculate base + tax from it.
    subtotal = enableGST && gstPercentage > 0 ? inclusiveTotal / (1 + gstPercentage / 100) : inclusiveTotal
    taxAmount = inclusiveTotal - subtotal
    totalAmount = inclusiveTotal
  } else {
    subtotal = lineItemsSubtotal
    taxAmount = enableGST ? (subtotal * gstPercentage) / 100 : 0
    totalAmount = subtotal + taxAmount - discountAmount
  }

  const { cgstAmount, sgstAmount, cgstRate, sgstRate } = gstSplit(subtotal, taxAmount)
```

- [ ] **Step 4: Synthesize a line item on save in inclusive mode**

Replace the `handleSave` function body (around lines 108-125):

```ts
  const handleSave = () => {
    const billData: BillData = {
      billType,
      reservationId,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      enableGST,
      gstPercentage,
      checkInDate,
      checkOutDate,
      numberOfDays,
    }

    onSave?.(billData)
  }
```

with:

```ts
  const handleSave = () => {
    const effectiveLineItems = calcMode === 'inclusive'
      ? [{ description: inclusiveDescription || 'Charges', amount: subtotal }]
      : lineItems

    const billData: BillData = {
      billType,
      reservationId,
      lineItems: effectiveLineItems,
      subtotal,
      taxAmount,
      discountAmount: calcMode === 'inclusive' ? 0 : discountAmount,
      totalAmount,
      enableGST,
      gstPercentage,
      checkInDate,
      checkOutDate,
      numberOfDays,
    }

    onSave?.(billData)
  }
```

- [ ] **Step 5: Add the mode toggle above the Line Items section**

Find the Line Items section opening (around line 241):

```tsx
          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Line Items</h3>
```

Insert this block immediately BEFORE the `{/* Line Items */}` comment:

```tsx
          {/* Calculation Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={calcMode === 'exclusive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalcMode('exclusive')}
            >
              Add GST (exclusive)
            </Button>
            <Button
              type="button"
              variant={calcMode === 'inclusive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalcMode('inclusive')}
            >
              From Total (inclusive)
            </Button>
          </div>

          {/* Inclusive Mode: single total field */}
          {calcMode === 'inclusive' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="inclusive_description" className="text-xs">Description</Label>
                <Input
                  id="inclusive_description"
                  value={inclusiveDescription}
                  onChange={(e) => setInclusiveDescription(e.target.value)}
                  placeholder="Charges"
                />
              </div>
              <div>
                <Label htmlFor="inclusive_total" className="text-xs">Total Amount (incl. GST) ₹</Label>
                <Input
                  id="inclusive_total"
                  type="number"
                  value={inclusiveTotal || ''}
                  onChange={(e) => setInclusiveTotal(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
```

- [ ] **Step 6: Hide line-item entry in inclusive mode**

Change the Line Items wrapper so it only renders in exclusive mode. Replace:

```tsx
          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Line Items</h3>
```

with:

```tsx
          {/* Line Items */}
          {calcMode === 'exclusive' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Line Items</h3>
```

Then find the closing of that Line Items block (the `</div>` that closes the
`lineItems.map(...)` wrapper, around line 278):

```tsx
            ))}
          </div>
```

and replace it with:

```tsx
            ))}
          </div>
          )}
```

- [ ] **Step 7: Replace the single GST display line with CGST + SGST**

Replace this block (around lines 314-319):

```tsx
            {enableGST && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstPercentage}%)</span>
                <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
```

with:

```tsx
            {enableGST && taxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST ({formatRate(cgstRate)}%)</span>
                  <span className="font-medium">₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST ({formatRate(sgstRate)}%)</span>
                  <span className="font-medium">₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
            )}
```

- [ ] **Step 8: Hide the discount rows in inclusive mode**

Replace this entire block (around lines 321-341 — the Discount input `<div>`
plus the conditional "Discount Applied" block):

```tsx
            {/* Discount */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Discount</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">₹</span>
                <Input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-32 h-8 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount Applied</span>
                <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
```

with this version, wrapped in a single `calcMode === 'exclusive'` fragment guard:

```tsx
            {/* Discount (exclusive mode only) */}
            {calcMode === 'exclusive' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Discount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">₹</span>
                    <Input
                      type="number"
                      value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="w-32 h-8 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount Applied</span>
                    <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
```

- [ ] **Step 9: Typecheck**

Run: `cd frontend && npx tsc -b`
Expected: completes with no errors. If there is a JSX mismatch, re-check the
fragment wrapping from Step 8.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/bills/BillEditor.tsx
git commit -m "feat(bills): add tax-inclusive mode and CGST/SGST display to bill editor"
```

---

### Task 5: Manual end-to-end verification

**Files:** none (manual)

- [ ] **Step 1: Build the full app**

Run: `cd frontend && npx tsc -b && npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 2: Run the app and verify exclusive mode**

Run the Wails app (`wails dev` from repo root). Create a bill in the default
"Add GST (exclusive)" mode: one line item ₹1000, GST 18%.
Expected: editor shows CGST (9%) ₹90.00 and SGST (9%) ₹90.00, Total ₹1180.00.

- [ ] **Step 3: Verify inclusive mode**

Switch to "From Total (inclusive)", enter Total 1180, GST 18%.
Expected: panel shows Subtotal 1000.00, CGST (9%) ₹90.00, SGST (9%) ₹90.00,
Total ₹1180.00. Save, then open the saved bill — line item "Charges" ₹1000.00,
breakdown shows both CGST and SGST with 9%.

- [ ] **Step 4: Verify print**

Open the saved bill and Print. Confirm the printed invoice summary lists
CGST (9%) and SGST (9%) lines with amounts, and the Total matches.

- [ ] **Step 5: Verify non-GST bill**

Create a bill with GST disabled. Confirm no CGST/SGST lines appear anywhere
(editor, view modal, print).

---

## Self-Review

**Spec coverage:**
- Split GST into CGST/SGST with percentages on all surfaces → Tasks 2, 3, 4 (steps 7). ✔
- 50/50 derivation, display-only, no DB change → Task 1 helper; no model/Go tasks. ✔
- Tax-inclusive "from total" mode replacing line items → Task 4 steps 2-6. ✔
- Discount omitted in inclusive mode → Task 4 steps 4, 8. ✔
- Existing bills render split / zero-tax shows nothing → Task 5 steps 4-5; helper guards `subtotal > 0` and `tax_amount > 0` conditionals. ✔
- Non-integer rate formatting (2.5%) → Task 1 `formatRate`, checked in Step 1. ✔

**Placeholder scan:** No TBD/TODO; all code blocks complete. ✔

**Type consistency:** `gstSplit(subtotal, taxAmount)` returns `{cgstAmount, sgstAmount, cgstRate, sgstRate}` — used identically in Tasks 2, 3, 4. `formatRate(number): string` used consistently. `calcMode: 'exclusive' | 'inclusive'` consistent across Task 4. ✔
