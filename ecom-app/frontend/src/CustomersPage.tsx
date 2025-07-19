import React, { useState } from 'react';
import CustomerForm from './CustomerForm';
import CustomerList from './CustomerList';

const CustomersPage: React.FC = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleCustomerAdded = () => {
    setRefreshList(true);
  };

  const handleRefreshComplete = () => {
    setRefreshList(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>Customer Management</h2>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <CustomerForm onCustomerAdded={handleCustomerAdded} />
        </div>
        
        <div>
          <CustomerList 
            refresh={refreshList} 
            onRefreshComplete={handleRefreshComplete} 
          />
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;