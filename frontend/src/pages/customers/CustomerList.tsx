import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Phone, MapPin, UserPlus, Edit, Eye } from 'lucide-react'
import CustomerForm from '../../components/customers/CustomerForm'
import { customerService } from '@/services'
import { Avatar, SearchInput, EmptyState, TableSkeleton, PageHeader, Button } from '@/components/common'
import type { Customer } from '@/types'
import { handleApiError } from '@/lib/bindings'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86_400_000
  if (diff < day) return 'today'
  const days = Math.floor(diff / day)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  return `${Math.floor(months / 12)} yr ago`
}

export default function CustomerList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setCustomers(await customerService.getAll())
    } catch (error) {
      console.error('Failed to load customers:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage your lodge customers"
        count={
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-gray-600">
            {customers.length} Total
          </span>
        }
        action={<Button icon={Plus} onClick={() => setIsFormOpen(true)}>Add Customer</Button>}
      />

      <CustomerForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setSelectedCustomer(undefined)
        }}
        onSubmit={async (data) => {
          if (selectedCustomer) {
            await customerService.update(selectedCustomer.id, data)
          } else {
            await customerService.create(data)
          }
          await loadCustomers()
          setIsFormOpen(false)
          setSelectedCustomer(undefined)
        }}
        customer={selectedCustomer}
      />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <div className="card animate-fade-up">
          <div className="mb-5">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name or phone..." className="max-w-md" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="col-label sticky top-0 z-10 bg-white px-4 py-3 text-left">Customer</th>
                  <th className="col-label sticky top-0 z-10 bg-white px-4 py-3 text-left">Phone</th>
                  <th className="col-label sticky top-0 z-10 bg-white px-4 py-3 text-left">Address</th>
                  <th className="col-label sticky top-0 z-10 bg-white px-4 py-3 text-left">ID Proof</th>
                  <th className="col-label sticky top-0 z-10 bg-white px-4 py-3 text-left">Added</th>
                  <th className="col-label sticky top-0 z-10 bg-white px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={UserPlus} title="No customers yet" hint="Add your first customer to get started." />
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="group cursor-pointer border-b border-gray-50"
                      style={{ background: idx % 2 ? 'hsl(36 20% 98%)' : undefined }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={customer.full_name} size="sm" />
                          <span className="font-medium text-gray-900">{customer.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-xs items-center gap-2 truncate text-gray-600">
                          <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                          {customer.address}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{customer.id_proof_type}</p>
                        <p className="text-xs text-gray-500">{customer.id_proof_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{timeAgo(customer.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`) }}
                            className="rounded-lg bg-muted p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); setIsFormOpen(true) }}
                            className="rounded-lg bg-muted p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            aria-label="Edit customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
