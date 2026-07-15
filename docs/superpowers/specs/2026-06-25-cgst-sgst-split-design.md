# CGST/SGST Split + Tax-Inclusive Billing — Design

**Date:** 2026-06-25
**Status:** Approved

## Problem

The bill currently shows a single combined **GST** line, and the editor can only
add GST *on top* of a subtotal (tax-exclusive). Two changes are needed:

1. Split the single GST line into **CGST** and **SGST**, showing both the amount
   **and the percentage** for each, everywhere a bill is displayed or printed.
2. Add a **tax-inclusive** option: the user enters a single final total amount,
   and the system back-calculates the base amount, CGST, and SGST from it.

## Decisions (confirmed with user)

- **Split rule:** Always 50/50. GST splits equally into CGST and SGST
  (e.g. 18% GST → 9% CGST + 9% SGST). Standard intra-state billing.
- **Reverse calc UX:** "From total" mode — user enters one final total; the system
  derives base + CGST + SGST. In this mode, line-item entry is replaced by a single
  total field.
- **Storage:** Derive for display only. Keep the existing single `tax_amount`
  field. No DB migration, no Go/backend changes.
- **Percentages:** CGST and SGST percentages must be displayed alongside the amounts.

## Data flow (existing, unchanged)

`BillEditor` (produces `BillData`) → `BillModal` → `CustomerDetails.handleSave`
maps to the bill object fields: `is_gst_bill`, `subtotal`, `tax_amount`,
`total_amount`, `line_items`. The split is derived from `subtotal` and
`tax_amount` at display time, so persisted data is untouched.

## Part 1 — Derive CGST/SGST for display

A small shared helper derives the split from a bill's stored values:

```ts
function gstSplit(subtotal: number, taxAmount: number) {
  const gstRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0
  const half = taxAmount / 2
  return {
    cgstAmount: half,
    sgstAmount: half,
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
  }
}
```

Wherever a single "GST" / "Tax (GST)" line appears today, render two lines:

- **CGST (x%)** — amount
- **SGST (x%)** — amount

Where `x` is `gstRate / 2`, formatted without trailing zeros (e.g. `9%`, `2.5%`).

Surfaces to update:

- `frontend/src/components/bills/BillEditor.tsx` — live calculation panel
- `frontend/src/components/bills/BillViewModal.tsx` — amount breakdown
- `frontend/src/components/bills/BillPrint.tsx` — printed tax-invoice summary

Because the split is deterministic, existing bills render the split automatically
with no migration.

## Part 2 — Tax-inclusive mode in the bill editor

Add a calculation-mode toggle in `BillEditor.tsx`:

- **Add GST (exclusive)** — current behavior, unchanged. Line items → subtotal →
  add GST on top → total.
- **From total (inclusive)** — line-item entry is replaced by a single **Total
  Amount** field plus the GST% input. The system back-calculates:
  - `base (subtotal) = total / (1 + gst/100)`
  - `tax = total − base`
  - `cgst = sgst = tax / 2`
  - Live panel shows: Base, CGST (x%), SGST (x%), Total.

On save in inclusive mode, synthesize a single line item
(`{ description: "Charges" (editable), amount: base }`) so the bill persists
through the existing `BillData` shape with no schema change. The resulting
`subtotal = base`, `tax_amount = tax`, `total_amount = entered total`.

## Scope / simplifications

- **Discount in inclusive mode:** omitted. The entered total is treated as final.
  Discount remains available in exclusive mode.
- All changes are confined to the three frontend components listed above. No Go,
  repository, service, or model changes; no DB migration.

## Testing

- Exclusive mode: subtotal 1000 @ 18% → CGST 90 (9%), SGST 90 (9%), total 1180.
- Inclusive mode: total 1180 @ 18% → base 1000, CGST 90 (9%), SGST 90 (9%).
- Zero-tax / non-GST bill: no CGST/SGST lines shown (tax_amount = 0).
- Existing finalized bills render the CGST/SGST split correctly in view + print.
- Rate label formats cleanly for non-integer halves (e.g. 5% GST → 2.5%).
