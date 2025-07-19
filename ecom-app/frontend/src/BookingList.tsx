import React, { useState, useEffect } from 'react';
import { Booking, Bill } from './types';
import BillComponent from './BillComponent';
import GSTConfirmationDialog from './GSTConfirmationDialog';

const API_BASE = 'http://localhost:8080';

interface BillButtonProps {
  booking: Booking;
  onGenerateBill: (bookingId: number, event: React.MouseEvent) => void;
  onViewBill: (bookingId: number, event: React.MouseEvent) => void;
  generatingBillId: number | null;
}

const BillButton: React.FC<BillButtonProps> = ({ booking, onGenerateBill, onViewBill, generatingBillId }) => {
  const [billExists, setBillExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBill = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/bookings/${booking.id}/bill`);
        setBillExists(response.ok);
      } catch (error) {
        setBillExists(false);
      }
    };

    if (booking.id) {
      checkBill();
    }
  }, [booking.id]);

  if (billExists === null) {
    return null; // Loading
  }

  if (billExists) {
    return (
      <button
        onClick={(e) => onViewBill(booking.id!, e)}
        style={{
          padding: '4px 8px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        View Bill
      </button>
    );
  }

  return (
    <button
      onClick={(e) => onGenerateBill(booking.id!, e)}
      disabled={generatingBillId === booking.id}
      style={{
        padding: '4px 8px',
        backgroundColor: generatingBillId === booking.id ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: generatingBillId === booking.id ? 'not-allowed' : 'pointer',
        fontSize: '12px'
      }}
    >
      {generatingBillId === booking.id ? 'Generating...' : 'Generate Bill'}
    </button>
  );
};

interface BookingListProps {
  refresh: boolean;
  onRefreshComplete: () => void;
}

const BookingList: React.FC<BookingListProps> = ({ refresh, onRefreshComplete }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [generatingBillId, setGeneratingBillId] = useState<number | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [gstDialogOpen, setGstDialogOpen] = useState(false);
  const [selectedBookingForBill, setSelectedBookingForBill] = useState<Booking | null>(null);
  const [businessGSTPercentage, setBusinessGSTPercentage] = useState<number>(18);

  useEffect(() => {
    fetchBookings();
    fetchBusinessSettings();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchBookings();
      onRefreshComplete();
    }
  }, [refresh, onRefreshComplete]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/bookings`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setBusinessGSTPercentage(data.gst_percentage || 18);
      }
    } catch (error) {
      console.error('Error fetching business settings:', error);
    }
  };

  const viewBookingDetails = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${id}`);
      if (response.ok) {
        const booking = await response.json();
        setSelectedBooking(booking);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const cancelBooking = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening booking details
    
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setCancellingId(id);
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
        method: 'PUT'
      });

      if (response.ok) {
        // Refresh the bookings list
        fetchBookings();
        // Also refresh parent if needed
        onRefreshComplete();
      } else {
        const error = await response.json();
        alert(`Error cancelling booking: ${error.error}`);
      }
    } catch (error) {
      alert('Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  const canCancelBooking = (status: string) => {
    return status === 'confirmed' || status === 'checked_in';
  };

  const canCheckIn = (status: string) => {
    return status === 'confirmed';
  };

  const canCheckOut = (status: string) => {
    return status === 'checked_in';
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error updating booking: ${error.error}`);
      }
    } catch (error) {
      alert('Error updating booking status');
    }
  };

  const canGenerateBill = (status: string) => {
    return status === 'confirmed' || status === 'checked_in' || status === 'checked_out';
  };

  const generateBill = async (bookingId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Find the booking to show GST dialog
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForBill(booking);
      setGstDialogOpen(true);
    }
  };

  const handleGSTConfirmation = async (includeGST: boolean) => {
    if (!selectedBookingForBill) return;
    
    setGstDialogOpen(false);
    setGeneratingBillId(selectedBookingForBill.id!);
    
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${selectedBookingForBill.id}/generate-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          include_gst: includeGST
        })
      });

      if (response.ok) {
        const bill = await response.json();
        setCurrentBill(bill);
      } else {
        const error = await response.json();
        alert(`Error generating bill: ${error.error}`);
      }
    } catch (error) {
      alert('Error generating bill');
    } finally {
      setGeneratingBillId(null);
      setSelectedBookingForBill(null);
    }
  };

  const handleGSTCancel = () => {
    setGstDialogOpen(false);
    setSelectedBookingForBill(null);
  };

  const viewBill = async (bookingId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/bill`);
      if (response.ok) {
        const bill = await response.json();
        setCurrentBill(bill);
      } else {
        alert('Bill not found');
      }
    } catch (error) {
      alert('Error fetching bill');
    }
  };

  const checkBillExists = async (bookingId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/bill`);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Recent Bookings</h3>
      
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          No bookings found. Create your first booking using the form.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {bookings.slice(0, 10).map((booking) => (
            <div 
              key={booking.id} 
              style={{ 
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => viewBookingDetails(booking.id!)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>
                      {booking.customer_name}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(booking.status || 'confirmed')
                    }}>
                      {getStatusLabel(booking.status || 'confirmed')}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <div>
                      <strong>Room:</strong> {booking.room_number} ({booking.room_type_name})
                    </div>
                    <div>
                      <strong>Phone:</strong> {booking.customer_phone}
                    </div>
                    <div>
                      <strong>Check-in:</strong> {formatDate(booking.check_in)}
                    </div>
                    <div>
                      <strong>Check-out:</strong> {formatDate(booking.check_out)}
                    </div>
                    <div>
                      <strong>Nights:</strong> {booking.nights}
                    </div>
                    <div>
                      <strong>Total:</strong> ₹{booking.total_amount?.toFixed(2)}
                    </div>
                  </div>
                  
                  <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '12px' }}>
                    Booked: {formatDate(booking.created_at!)}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {/* Check-in Button */}
                  {canCheckIn(booking.status || 'confirmed') && (
                    <button
                      onClick={(e) => updateBookingStatus(booking.id!, 'checked_in', e)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Check In
                    </button>
                  )}
                  
                  {/* Check-out Button */}
                  {canCheckOut(booking.status || 'confirmed') && (
                    <button
                      onClick={(e) => updateBookingStatus(booking.id!, 'checked_out', e)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Check Out
                    </button>
                  )}
                  
                  {/* Cancel Button */}
                  {canCancelBooking(booking.status || 'confirmed') && (
                    <button
                      onClick={(e) => cancelBooking(booking.id!, e)}
                      disabled={cancellingId === booking.id}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: cancellingId === booking.id ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  
                  {/* Bill Buttons */}
                  {canGenerateBill(booking.status || 'confirmed') && (
                    <BillButton 
                      booking={booking} 
                      onGenerateBill={generateBill}
                      onViewBill={viewBill}
                      generatingBillId={generatingBillId}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {bookings.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Showing 10 most recent bookings out of {bookings.length} total
              </p>
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
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
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>Booking ID:</strong><br />
                  #{selectedBooking.id}
                </div>
                <div>
                  <strong>Status:</strong><br />
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getStatusColor(selectedBooking.status || 'confirmed')
                  }}>
                    {getStatusLabel(selectedBooking.status || 'confirmed')}
                  </span>
                </div>
              </div>
              
              <div>
                <strong>Customer:</strong><br />
                {selectedBooking.customer_name}<br />
                <span style={{ color: '#666' }}>{selectedBooking.customer_phone}</span>
              </div>
              
              <div>
                <strong>Room:</strong><br />
                Room {selectedBooking.room_number} - {selectedBooking.room_type_name}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>Check-in:</strong><br />
                  {formatDate(selectedBooking.check_in)}
                </div>
                <div>
                  <strong>Check-out:</strong><br />
                  {formatDate(selectedBooking.check_out)}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <strong>Nights:</strong><br />
                  {selectedBooking.nights}
                </div>
                <div>
                  <strong>Price/Night:</strong><br />
                  ₹{selectedBooking.price_per_night?.toFixed(2)}
                </div>
                <div>
                  <strong>Total Amount:</strong><br />
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                    ₹{selectedBooking.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div>
                <strong>Booking Date:</strong><br />
                {formatDate(selectedBooking.created_at!)}
              </div>
              
              {/* Cancel Button in Modal */}
              {canCancelBooking(selectedBooking.status || 'confirmed') && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      cancelBooking(selectedBooking.id!, { stopPropagation: () => {} } as React.MouseEvent);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel This Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GST Confirmation Dialog */}
      {gstDialogOpen && selectedBookingForBill && (
        <GSTConfirmationDialog
          isOpen={gstDialogOpen}
          bookingId={selectedBookingForBill.id!}
          customerName={selectedBookingForBill.customer_name || ''}
          totalAmount={selectedBookingForBill.total_amount || 0}
          gstPercentage={businessGSTPercentage}
          onConfirm={handleGSTConfirmation}
          onCancel={handleGSTCancel}
        />
      )}

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

export default BookingList;