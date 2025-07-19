import { useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T = any>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    request,
    reset,
  };
};

// Specific API hooks
export const useCustomers = () => {
  const { data, loading, error, request } = useApi();

  const fetchCustomers = useCallback((search?: string) => {
    const endpoint = search ? `/api/customers?search=${encodeURIComponent(search)}` : '/api/customers';
    return request(endpoint);
  }, [request]);

  const createCustomer = useCallback((customerData: any) => {
    return request('/api/customers', {
      method: 'POST',
      body: customerData,
    });
  }, [request]);

  return {
    customers: data,
    loading,
    error,
    fetchCustomers,
    createCustomer,
  };
};

export const useBookings = () => {
  const { data, loading, error, request } = useApi();

  const fetchBookings = useCallback(() => {
    return request('/api/bookings');
  }, [request]);

  const createBooking = useCallback((bookingData: any) => {
    return request('/api/bookings', {
      method: 'POST',
      body: bookingData,
    });
  }, [request]);

  const updateBooking = useCallback((id: number, updates: any) => {
    return request(`/api/bookings/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }, [request]);

  const cancelBooking = useCallback((id: number) => {
    return request(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }, [request]);

  const generateBill = useCallback((id: number, includeGST: boolean) => {
    return request(`/api/bookings/${id}/generate-bill`, {
      method: 'POST',
      body: { include_gst: includeGST },
    });
  }, [request]);

  return {
    bookings: data,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    generateBill,
  };
};

export const useSettings = () => {
  const { data, loading, error, request } = useApi();

  const fetchSettings = useCallback(() => {
    return request('/api/settings');
  }, [request]);

  const saveSettings = useCallback((settings: any) => {
    return request('/api/settings', {
      method: 'POST',
      body: settings,
    });
  }, [request]);

  return {
    settings: data,
    loading,
    error,
    fetchSettings,
    saveSettings,
  };
};

export const useReports = () => {
  const { data, loading, error, request } = useApi();

  const fetchRentalReport = useCallback((filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    return request(`/api/reports/rental?${params}`);
  }, [request]);

  const exportRentalReport = useCallback((filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const downloadUrl = `${API_BASE}/api/reports/rental/export?${params}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `rental_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    reportData: data,
    loading,
    error,
    fetchRentalReport,
    exportRentalReport,
  };
};