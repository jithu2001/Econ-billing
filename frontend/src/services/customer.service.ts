import { apiClient } from '@/lib/api';
import type { Customer } from '@/types';

export interface CreateCustomerRequest {
  full_name: string;
  phone: string;
  address?: string;
  id_proof_type?: string;
  id_proof_number?: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>('/api/customers');
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/api/customers/${id}`);
    return response.data;
  },

  async create(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>('/api/customers', data);
    return response.data;
  },

  async update(id: string, data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/api/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/customers/${id}`);
  },
};
