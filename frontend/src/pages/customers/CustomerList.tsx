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
      <div className="flex items-center justify-between slide-in-left">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold gradient-text">Customers</h1>
            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <span className="text-sm font-semibold text-purple-400">{customers.length} Total</span>
            </div>
          </div>
          <p className="text-slate-400">Manage your lodge customers</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Add Customer</span>
        </button>
      </div>

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddCustomer}
      />

      {/* Search & Table Card */}
      <div className="glass-card fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">ID Proof</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-500">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="group hover:bg-slate-800/30 transition-all cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {customer.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-white group-hover:text-purple-300 transition-colors">
                          {customer.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300 max-w-xs truncate">
                        <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        {customer.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{customer.id_proof_type}</p>
                        <p className="text-xs text-slate-500">{customer.id_proof_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 transition-all flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-purple-500/10">
                        View
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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