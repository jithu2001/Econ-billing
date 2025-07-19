import React, { useState, useEffect } from 'react';

interface InvoiceCounter {
  counter_type: string;
  current_number: number;
}

const API_BASE = 'http://localhost:8080';

const InvoiceCounterSettings: React.FC = () => {
  const [counters, setCounters] = useState<InvoiceCounter[]>([]);
  const [gstStartingNumber, setGstStartingNumber] = useState<number>(1);
  const [nonGstStartingNumber, setNonGstStartingNumber] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCounters();
  }, []);

  const fetchCounters = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/invoice-counters`);
      if (response.ok) {
        const data = await response.json();
        setCounters(data);
        
        // Set current values
        const gstCounter = data.find((c: InvoiceCounter) => c.counter_type === 'GST');
        const nonGstCounter = data.find((c: InvoiceCounter) => c.counter_type === 'NON_GST');
        
        if (gstCounter) setGstStartingNumber(gstCounter.current_number + 1);
        if (nonGstCounter) setNonGstStartingNumber(nonGstCounter.current_number + 1);
      }
    } catch (error) {
      setMessage('Error fetching counters');
    }
  };

  const updateCounter = async (counterType: string, startingNumber: number) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/invoice-counters/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counter_type: counterType,
          starting_number: startingNumber
        })
      });

      if (response.ok) {
        setMessage(`${counterType === 'GST' ? 'GST' : 'NON-GST'} counter updated successfully!`);
        fetchCounters(); // Refresh the counters
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to update counter');
      }
    } catch (error) {
      setMessage('Error updating counter');
    } finally {
      setLoading(false);
    }
  };

  const handleGstUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCounter('GST', gstStartingNumber);
  };

  const handleNonGstUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCounter('NON_GST', nonGstStartingNumber);
  };

  return (
    <div style={{ 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '20px', 
      marginTop: '20px',
      backgroundColor: 'white'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>
        Invoice Number Settings
      </h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Current Invoice Numbers</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <strong>GST Bills (TG- prefix):</strong>
            <div style={{ fontSize: '18px', color: '#007bff', fontWeight: 'bold' }}>
              {counters.find(c => c.counter_type === 'GST')?.current_number 
                ? `TG-${String(counters.find(c => c.counter_type === 'GST')?.current_number! + 1).padStart(6, '0')}`
                : 'TG-000001'} (next)
            </div>
          </div>
          <div>
            <strong>NON-GST Bills (TC- prefix):</strong>
            <div style={{ fontSize: '18px', color: '#28a745', fontWeight: 'bold' }}>
              {counters.find(c => c.counter_type === 'NON_GST')?.current_number 
                ? `TC-${String(counters.find(c => c.counter_type === 'NON_GST')?.current_number! + 1).padStart(6, '0')}`
                : 'TC-000001'} (next)
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <form onSubmit={handleGstUpdate} style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Set GST Bills Starting Number</h4>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Next GST Invoice Number (TG- prefix):
            </label>
            <input
              type="number"
              min="1"
              value={gstStartingNumber}
              onChange={(e) => setGstStartingNumber(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter starting number"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Next invoice will be: TG-{String(gstStartingNumber).padStart(6, '0')}
            </small>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            {loading ? 'Updating...' : 'Update GST Counter'}
          </button>
        </form>

        <form onSubmit={handleNonGstUpdate} style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Set NON-GST Bills Starting Number</h4>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Next NON-GST Invoice Number (TC- prefix):
            </label>
            <input
              type="number"
              min="1"
              value={nonGstStartingNumber}
              onChange={(e) => setNonGstStartingNumber(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter starting number"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Next invoice will be: TC-{String(nonGstStartingNumber).padStart(6, '0')}
            </small>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              width: '100%'
            }}
          >
            {loading ? 'Updating...' : 'Update NON-GST Counter'}
          </button>
        </form>
      </div>

      {message && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: message.includes('Error') || message.includes('Failed') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') || message.includes('Failed') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Error') || message.includes('Failed') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
        <strong>📋 Note:</strong> Use this feature if you were previously maintaining paper bills and want to continue your numbering sequence. 
        For example, if your last GST bill was TG-000150, set the next number to 151.
      </div>
    </div>
  );
};

export default InvoiceCounterSettings;