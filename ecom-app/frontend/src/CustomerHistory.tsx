import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bill } from './types';
import BillComponent from './BillComponent';

const API_BASE = 'http://localhost:8080';

interface CustomerHistoryData {
  customer: {
    id: number;
    name: string;
    address: string;
    phone: string;
    id_card_photo: string;
    created_at: string;
  };
  statistics: {
    total_bookings: number;
    total_spent: number;
    total_nights: number;
  };
  bookings: Array<{
    id: number;
    room_id: number;
    check_in: string;
    check_out: string;
    price_per_night: number;
    total_amount: number;
    nights: number;
    status: string;
    created_at: string;
    room_number: string;
    room_type_name: string;
    has_bill: boolean;
    bill_id: number;
    bill_number: string;
  }>;
}

const CustomerHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<CustomerHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetchCustomerHistory();
  }, [id]);

  const fetchCustomerHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/customers/${id}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      } else {
        setError('Failed to fetch customer history');
      }
    } catch (error) {
      setError('Error loading customer history');
    } finally {
      setLoading(false);
    }
  };

  const viewBill = async (bookingId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/bill`);
      if (response.ok) {
        const bill = await response.json();
        setCurrentBill(bill);
      } else {
        alert('Bill not found for this booking');
      }
    } catch (error) {
      alert('Error fetching bill');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#007bff';
      case 'checked_in': return '#28a745';
      case 'checked_out': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'checked_in': return 'Checked In';
      case 'checked_out': return 'Checked Out';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading customer history...</div>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#dc3545', marginBottom: '20px' }}>{error || 'Customer not found'}</div>
        <button
          onClick={() => navigate('/customers')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Customer History</h1>
        <button
          onClick={() => navigate('/customers')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Customers
        </button>
      </div>

      {/* Customer Info Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Customer Details */}
          <div>
            <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '24px' }}>
              {historyData.customer.name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>ADDRESS</div>
                <div style={{ fontSize: '16px', color: '#333' }}>{historyData.customer.address}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>PHONE</div>
                <div style={{ fontSize: '16px', color: '#333' }}>{historyData.customer.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>MEMBER SINCE</div>
                <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(historyData.customer.created_at)}</div>
              </div>
              {historyData.customer.id_card_photo && (
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>ID DOCUMENT</div>
                  <a 
                    href={`${API_BASE}/uploads/ids/${historyData.customer.id_card_photo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    View ID Photo
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                  {historyData.statistics.total_bookings}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Total Bookings</div>
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                  {historyData.statistics.total_nights}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Total Nights</div>
              </div>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {formatCurrency(historyData.statistics.total_spent)}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Total Spent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking History */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>Booking History</h3>
        
        {historyData.bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No bookings found for this customer
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Booking ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Room</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-in</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-out</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Nights</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#495057' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Bill</th>
                </tr>
              </thead>
              <tbody>
                {historyData.bookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>#{booking.id}</td>
                    <td style={{ padding: '12px' }}>
                      <div>{booking.room_number}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{booking.room_type_name}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(booking.check_in)}</td>
                    <td style={{ padding: '12px' }}>{formatDate(booking.check_out)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{booking.nights}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getStatusColor(booking.status)
                      }}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {booking.has_bill ? (
                        <button
                          onClick={() => viewBill(booking.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          View Bill
                        </button>
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>No Bill</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {currentBill && (
        <BillComponent 
          bill={currentBill} 
          onClose={() => setCurrentBill(null)} 
        />
      )}
    </div>
  );
};

export default CustomerHistory;