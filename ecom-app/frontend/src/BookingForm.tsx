import React, { useState, useEffect } from 'react';
import { Booking, Customer, Room } from './types';

const API_BASE = 'http://localhost:8080';

interface BookingFormProps {
  onBookingCreated: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onBookingCreated }) => {
  const [booking, setBooking] = useState<Booking>({
    customer_id: 0,
    room_id: 0,
    check_in: '',
    check_out: '',
    price_per_night: 0
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nights, setNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCustomers();
    fetchRooms();
  }, []);

  // Calculate nights and total when dates or price change
  useEffect(() => {
    if (booking.check_in && booking.check_out && booking.price_per_night > 0) {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      
      if (checkOut > checkIn) {
        const calculatedNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
        const calculatedTotal = calculatedNights * booking.price_per_night;
        
        setNights(calculatedNights);
        setTotalAmount(calculatedTotal);
      } else {
        setNights(0);
        setTotalAmount(0);
      }
    } else {
      setNights(0);
      setTotalAmount(0);
    }
  }, [booking.check_in, booking.check_out, booking.price_per_night]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBooking(prev => ({
      ...prev,
      [name]: name === 'customer_id' || name === 'room_id' ? parseInt(value) || 0 : 
               name === 'price_per_night' ? parseFloat(value) || 0 : value
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (booking.customer_id === 0) {
      setMessage('Please select a customer');
      return;
    }
    
    if (booking.room_id === 0) {
      setMessage('Please select a room');
      return;
    }
    
    if (!booking.check_in || !booking.check_out) {
      setMessage('Please select check-in and check-out dates');
      return;
    }
    
    if (booking.price_per_night <= 0) {
      setMessage('Please enter a valid price per night');
      return;
    }
    
    if (nights <= 0) {
      setMessage('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(booking)
      });

      if (response.ok) {
        setBooking({
          customer_id: 0,
          room_id: 0,
          check_in: '',
          check_out: '',
          price_per_night: 0
        });
        setMessage('Booking created successfully!');
        onBookingCreated();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Create New Booking</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="customer_id">Customer:</label>
          <select
            id="customer_id"
            name="customer_id"
            value={booking.customer_id}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value={0}>Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              No customers found. Please add customers first.
            </small>
          )}
        </div>

        <div>
          <label htmlFor="room_id">Room:</label>
          <select
            id="room_id"
            name="room_id"
            value={booking.room_id}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value={0}>Select a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                Room {room.number} - {room.type_name}
              </option>
            ))}
          </select>
          {rooms.length === 0 && (
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              No rooms found. Please add rooms first.
            </small>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label htmlFor="check_in">Check-in Date:</label>
            <input
              type="date"
              id="check_in"
              name="check_in"
              value={booking.check_in}
              onChange={handleInputChange}
              min={getTodayDate()}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div>
            <label htmlFor="check_out">Check-out Date:</label>
            <input
              type="date"
              id="check_out"
              name="check_out"
              value={booking.check_out}
              onChange={handleInputChange}
              min={booking.check_in || getTomorrowDate()}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="price_per_night">Price per Night (₹):</label>
          <input
            type="number"
            id="price_per_night"
            name="price_per_night"
            value={booking.price_per_night || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Booking Summary */}
        {nights > 0 && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Booking Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
              <div><strong>Nights:</strong> {nights}</div>
              <div><strong>Price per night:</strong> ₹{booking.price_per_night.toFixed(2)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ fontSize: '16px', color: '#007bff' }}>
                  Total Amount: ₹{totalAmount.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || customers.length === 0 || rooms.length === 0}
          style={{ 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>

      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default BookingForm;