import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Calendar, Filter, Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Label } from '../../components/ui/label'
import { billService, customerService } from '@/services'
import type { Bill, Customer } from '@/types'
import { handleApiError } from '@/lib/api'

const getStatusBadge = (status: Bill['status']) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    FINALIZED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    UNPAID: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  )
}

export default function BillList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState<Bill[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
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
      setCustomers(customersData)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading bills...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
        <p className="text-muted-foreground">Manage and track all billing records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unpaid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{stats.pendingRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="search">Search Customer</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="FINALIZED">Finalized</option>
                <option value="DRAFT">Draft</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bills ({filteredBills.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Bill Type</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/customers/${bill.customer_id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {bill.customer?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{bill.bill_type}</span>
                    </TableCell>
                    <TableCell>₹{bill.subtotal.toLocaleString()}</TableCell>
                    <TableCell>₹{bill.tax_amount.toLocaleString()}</TableCell>
                    <TableCell>₹{bill.discount_amount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{bill.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/customers/${bill.customer_id}`)
                        }}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No bills found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
