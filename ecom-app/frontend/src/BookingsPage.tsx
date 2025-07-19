import React, { useState } from 'react';
import BookingForm from './BookingForm';
import BookingList from './BookingList';

const BookingsPage: React.FC = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleBookingCreated = () => {
    setRefreshList(true);
  };

  const handleRefreshComplete = () => {
    setRefreshList(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>Room Reservations</h2>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <BookingForm onBookingCreated={handleBookingCreated} />
        </div>
        
        <div>
          <BookingList 
            refresh={refreshList} 
            onRefreshComplete={handleRefreshComplete} 
          />
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;