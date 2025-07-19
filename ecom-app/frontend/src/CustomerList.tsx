import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from './types';

const API_BASE = 'http://localhost:8080';

interface CustomerListProps {
  refresh: boolean;
  onRefreshComplete: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ refresh, onRefreshComplete }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchCustomers();
      onRefreshComplete();
    }
  }, [refresh, onRefreshComplete]);

  const fetchCustomers = async (search?: string) => {
    setLoading(true);
    try {
      const url = search 
        ? `${API_BASE}/api/customers?search=${encodeURIComponent(search)}`
        : `${API_BASE}/api/customers`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchTerm);
  };

  const viewCustomerDetails = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/customers/${id}`);
      if (response.ok) {
        const customer = await response.json();
        setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Customer List</h3>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone number..."
            style={{ 
              flex: 1, 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searchTerm && (
            <button 
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchCustomers();
              }}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Customer List */}
      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          {searchTerm ? 'No customers found matching your search.' : 'No customers added yet.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {customers.map((customer) => (
            <div 
              key={customer.id} 
              style={{ 
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => viewCustomerDetails(customer.id!)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{customer.name}</h4>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                    📞 {customer.phone}
                  </p>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                    📍 {customer.address}
                  </p>
                  <p style={{ margin: '4px 0', color: '#999', fontSize: '12px' }}>
                    Added: {formatDate(customer.created_at!)}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customers/${customer.id}/history`);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View History
                  </button>
                  {customer.id_card_photo && (
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#6c757d'
                    }}>
                      📄 ID
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <strong>Name:</strong> {selectedCustomer.name}
              </div>
              <div>
                <strong>Phone:</strong> {selectedCustomer.phone}
              </div>
              <div>
                <strong>Address:</strong> {selectedCustomer.address}
              </div>
              <div>
                <strong>Added:</strong> {formatDate(selectedCustomer.created_at!)}
              </div>
              
              {selectedCustomer.id_card_photo && (
                <div>
                  <strong>ID Card Photo:</strong>
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={`${API_BASE}/uploads/ids/${selectedCustomer.id_card_photo}`}
                      alt="ID Card"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.textContent = 'Image not available';
                      }}
                    />
                    <div style={{ display: 'none', color: '#666', fontStyle: 'italic' }}></div>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    navigate(`/customers/${selectedCustomer.id}/history`);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View Booking History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;