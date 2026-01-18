import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Calendar, Filter, Search, DollarSign, Clock, CheckCircle, FileText, TrendingUp, X } from 'lucide-react'
import { billService, customerService } from '@/services'
import type { Bill } from '@/types'
import { handleApiError } from '@/lib/api'

const getStatusBadge = (status: Bill['status']) => {
  const styles = {
    DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
    FINALIZED: 'bg-blue-50 text-blue-600 border-blue-200',
    PAID: 'bg-green-50 text-green-600 border-green-200',
    UNPAID: 'bg-red-50 text-red-600 border-red-200',
  }

  const dots = {
    DRAFT: 'bg-gray-500',
    FINALIZED: 'bg-blue-500',
    PAID: 'bg-green-500',
    UNPAID: 'bg-red-500',
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${styles[status]}`}>
      <div className={`w-2 h-2 rounded-full ${dots[status]}`} />
      {status}
    </span>
  )
}

export default function BillList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bills, statusFilter, searchQuery, dateFrom, dateTo])

  const loadData = async () => {
    try {
      setLoading(true)
      // Fetch customers first
      const customersData = await customerService.getAll()

      // Fetch bills for all customers
      const allBills: Bill[] = []
      for (const customer of customersData) {
        try {
          const customerBills = await billService.getByCustomerId(customer.id)
          // Attach customer data to each bill
          const billsWithCustomer = customerBills.map(bill => ({
            ...bill,
            customer: customer
          }))
          allBills.push(...billsWithCustomer)
        } catch (error) {
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

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(bill => bill.status === statusFilter)
    }

    // Filter by search query (customer name)
    if (searchQuery) {
      filtered = filtered.filter(bill =>
        bill.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(bill => bill.bill_date >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter(bill => bill.bill_date <= dateTo)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredBills(filtered)
  }

  const clearFilters = () => {
    setStatusFilter('ALL')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
  }

  // Calculate stats
  const stats = {
    total: bills.length,
    paid: bills.filter(b => b.status === 'PAID').length,
    unpaid: bills.filter(b => b.status === 'UNPAID').length,
    draft: bills.filter(b => b.status === 'DRAFT').length,
    totalRevenue: bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.total_amount, 0),
    pendingRevenue: bills.filter(b => b.status === 'UNPAID' || b.status === 'FINALIZED').reduce((sum, b) => sum + b.total_amount, 0),
  }

  const statCards = [
    { label: 'Total Bills', value: stats.total, icon: Receipt, color: 'gray' },
    { label: 'Paid', value: stats.paid, icon: CheckCircle, color: 'green' },
    { label: 'Unpaid', value: stats.unpaid, icon: Clock, color: 'red' },
    { label: 'Draft', value: stats.draft, icon: FileText, color: 'gray' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'green' },
    { label: 'Pending', value: `$${stats.pendingRevenue.toLocaleString()}`, icon: DollarSign, color: 'amber' },
  ]

  const colorClasses = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bills</h1>
        <p className="text-gray-500">Manage and track all billing records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const colors = colorClasses[stat.color as keyof typeof colorClasses]
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className={`p-2 ${colors.bg} rounded-lg inline-block mb-3`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${colors.text}`}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Search Customer
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="FINALIZED">Finalized</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
            />
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              All Bills
              <span className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {filteredBills.length}
              </span>
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bill Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bill Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => navigate(`/customers/${bill.customer_id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                          {bill.customer?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-gray-900">
                          {bill.customer?.full_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                        {bill.bill_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${bill.subtotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      ${bill.tax_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      ${bill.discount_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ${bill.total_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/customers/${bill.customer_id}`)
                        }}
                        className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 transition-all"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">No bills found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
