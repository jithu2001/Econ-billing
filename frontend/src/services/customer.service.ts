// frontend/src/services/customer.service.ts
import { CustomerAPI } from '@/lib/bindings'
import type { Customer } from '@/types'

export interface CreateCustomerRequest {
  full_name: string; phone: string; address?: string;
  id_proof_type?: string; id_proof_number?: string;
}

const toInput = (d: CreateCustomerRequest) => ({
  full_name: d.full_name, phone: d.phone,
  address: d.address ?? '',
  id_proof_type: d.id_proof_type ?? '',
  id_proof_number: d.id_proof_number ?? '',
})

export const customerService = {
  getAll: () => CustomerAPI.GetAll() as unknown as Promise<Customer[]>,
  getById: (id: string) => CustomerAPI.GetByID(id) as unknown as Promise<Customer>,
  create: (data: CreateCustomerRequest) => CustomerAPI.Create(toInput(data)) as unknown as Promise<Customer>,
  update: (id: string, data: CreateCustomerRequest) => CustomerAPI.Update(id, toInput(data)) as unknown as Promise<Customer>,
  delete: (id: string) => CustomerAPI.Delete(id) as unknown as Promise<void>,
}
