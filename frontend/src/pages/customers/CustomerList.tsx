import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Phone, MapPin, Users, ArrowRight } from 'lucide-react'
import CustomerForm from '../../components/customers/CustomerForm'
import { customerService } from '@/services'
import type { Customer } from '@/types'
import { handleApiError } from '@/lib/api'

export default function CustomerList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Failed to load customers:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async (customerData: any) => {
    try {
      await customerService.create(customerData)
      await loadCustomers()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to add customer:', handleApiError(error))
      throw error
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
              {customers.length} Total
            </span>
          </div>
          <p className="text-gray-500">Manage your lodge customers</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-gray-900 rounded-lg font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddCustomer}
      />

      {/* Search & Table Card */}
      <div className="card">
        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Proof</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium text-sm">
                          {customer.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {customer.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-600 max-w-xs truncate">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {customer.address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.id_proof_type}</p>
                        <p className="text-xs text-gray-500">{customer.id_proof_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1">
                        View
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
