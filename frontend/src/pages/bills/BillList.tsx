import { useState, useEffect } from 'react'
import { Receipt, Calendar, Filter, DollarSign, Clock, CheckCircle, FileText, TrendingUp, X, Eye, ChevronDown } from 'lucide-react'
import { billService, customerService } from '@/services'
import type { Bill } from '@/types'
import { handleApiError } from '@/lib/bindings'
import BillViewModal from '@/components/bills/BillViewModal'
import { Avatar, StatCard, StatusBadge, SearchInput, EmptyState, TableSkeleton, PageHeader } from '@/components/common'

const AMOUNT_COLOR: Record<string, string> = {
  PAID: 'hsl(var(--status-green))',
  UNPAID: 'hsl(var(--status-red))',
  FINALIZED: 'hsl(var(--status-amber))',
  DRAFT: 'hsl(var(--status-stone))',
}

export default function BillList() {
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [gstFilter, setGstFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bills, statusFilter, gstFilter, searchQuery, dateFrom, dateTo])

  const loadData = async () => {
    try {
      setLoading(true)
      const customersData = await customerService.getAll()
      const allBills: Bill[] = []
      for (const customer of customersData) {
        try {
          const customerBills = await billService.getByCustomerId(customer.id)
          allBills.push(...customerBills.map(bill => ({ ...bill, customer })))
        } catch {
          // Customer might not have bills, continue
        }
      }
      setBills(allBills)
    } catch (error) {
      console.error('Failed to load bills:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...bills]
    if (statusFilter !== 'ALL') filtered = filtered.filter(b => b.status === statusFilter)
    if (gstFilter === 'GST') filtered = filtered.filter(b => b.is_gst_bill === true)
    else if (gstFilter === 'NON_GST') filtered = filtered.filter(b => b.is_gst_bill === false)
    if (searchQuery) filtered = filtered.filter(b => b.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    if (dateFrom) filtered = filtered.filter(b => b.bill_date >= dateFrom)
    if (dateTo) filtered = filtered.filter(b => b.bill_date <= dateTo)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFilteredBills(filtered)
  }

  const clearFilters = () => {
    setStatusFilter('ALL')
    setGstFilter('ALL')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
  }

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill)
    setIsViewModalOpen(true)
  }

  const stats = {
    total: bills.length,
    paid: bills.filter(b => b.status === 'PAID').length,
    unpaid: bills.filter(b => b.status === 'UNPAID').length,
    draft: bills.filter(b => b.status === 'DRAFT').length,
    totalRevenue: bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.total_amount, 0),
    pendingRevenue: bills.filter(b => b.status === 'UNPAID' || b.status === 'FINALIZED').reduce((sum, b) => sum + b.total_amount, 0),
  }

  const activeFilterCount =
    (statusFilter !== 'ALL' ? 1 : 0) + (gstFilter !== 'ALL' ? 1 : 0) +
    (searchQuery ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Bills" subtitle="Manage and track all billing records" />

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <>
          {/* Hero revenue + pending */}
          <div className="stagger-children grid gap-4 md:grid-cols-2">
            <StatCard index={0} hero label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} accent="primary" hint="Collected from paid bills" />
            <StatCard index={1} hero label="Pending" value={`₹${stats.pendingRevenue.toLocaleString()}`} icon={DollarSign} accent="amber" hint="Awaiting payment" />
          </div>

          {/* Count stats */}
          <div className="stagger-children grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard index={0} label="Total Bills" value={stats.total} icon={Receipt} accent="stone" />
            <StatCard index={1} label="Paid" value={stats.paid} icon={CheckCircle} accent="green" />
            <StatCard index={2} label="Unpaid" value={stats.unpaid} icon={Clock} accent="red" />
            <StatCard index={3} label="Draft" value={stats.draft} icon={FileText} accent="stone" />
          </div>

          {/* Collapsible filters */}
          <div className="card">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              aria-expanded={filtersOpen}
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Filter className="h-5 w-5 text-gray-600" /> Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ background: 'hsl(var(--primary))' }}>
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>

            {filtersOpen && (
              <div className="animate-slide-down mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2">
                  <label className="col-label mb-2 block">Search Customer</label>
                  <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Customer name..." />
                </div>
                <div>
                  <label className="col-label mb-2 block">Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field-input cursor-pointer">
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="FINALIZED">Finalized</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="col-label mb-2 block">Invoice Type</label>
                  <select value={gstFilter} onChange={(e) => setGstFilter(e.target.value)} className="field-input cursor-pointer">
                    <option value="ALL">All Invoices</option>
                    <option value="GST">GST Only</option>
                    <option value="NON_GST">Non-GST Only</option>
                  </select>
                </div>
                <div>
                  <label className="col-label mb-2 block">From Date</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="field-input" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="col-label mb-2 block">To Date</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="field-input" />
                  </div>
                  <button onClick={clearFilters} aria-label="Clear filters"
                    className="flex h-[42px] items-center justify-center rounded-lg bg-muted px-3 text-gray-700 transition-colors hover:bg-gray-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                All Bills
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm text-gray-600">{filteredBills.length}</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="col-label px-4 py-3 text-left">Invoice No.</th>
                    <th className="col-label px-4 py-3 text-left">Bill Date</th>
                    <th className="col-label px-4 py-3 text-left">Customer</th>
                    <th className="col-label px-4 py-3 text-left">Type</th>
                    <th className="col-label px-4 py-3 text-left">Total</th>
                    <th className="col-label px-4 py-3 text-left">Status</th>
                    <th className="col-label px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length > 0 ? (
                    filteredBills.map((bill, idx) => (
                      <tr key={bill.id} className="group border-b border-gray-50" style={{ background: idx % 2 ? 'hsl(36 20% 98%)' : undefined }}>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium text-gray-900">{bill.invoice_number || `#${bill.id.slice(0, 8)}`}</span>
                            {bill.is_gst_bill && (
                              <span className="mt-0.5 w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'hsl(var(--status-blue)/0.12)', color: 'hsl(210 65% 35%)' }}>GST</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" /> {new Date(bill.bill_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={bill.customer?.full_name} size="sm" />
                            <span className="font-medium text-gray-900">{bill.customer?.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2.5 py-1 text-sm text-gray-600">{bill.bill_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold tabular-nums" style={{ color: AMOUNT_COLOR[bill.status] ?? 'hsl(var(--foreground))' }}>
                            ₹{bill.total_amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={bill.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <button onClick={() => handleViewBill(bill)} aria-label="View bill details"
                              className="rounded-lg bg-muted p-2 text-gray-600 transition-colors hover:bg-gray-200">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7}><EmptyState icon={Receipt} title="No bills found" hint="Try adjusting your filters." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <BillViewModal open={isViewModalOpen} onOpenChange={setIsViewModalOpen} bill={selectedBill} />
    </div>
  )
}
