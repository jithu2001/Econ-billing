import React, { useState, useEffect } from 'react';
import { BusinessSettings } from './types';
import InvoiceCounterSettings from './InvoiceCounterSettings';

const API_BASE = 'http://localhost:8080';

const SettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings>({
    property_name: '',
    property_address: '',
    gst_number: '',
    gst_percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 404) {
        setMessage('No settings found. Please configure your business details.');
      }
    } catch (error) {
      setMessage('Error fetching settings');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'gst_percentage' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setMessage('Settings saved successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Business Configuration</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="property_name">Property Name:</label>
          <input
            type="text"
            id="property_name"
            name="property_name"
            value={settings.property_name}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="property_address">Property Address:</label>
          <textarea
            id="property_address"
            name="property_address"
            value={settings.property_address}
            onChange={handleInputChange}
            required
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="gst_number">GST Number:</label>
          <input
            type="text"
            id="gst_number"
            name="gst_number"
            value={settings.gst_number}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="gst_percentage">GST Percentage (%):</label>
          <input
            type="number"
            id="gst_percentage"
            name="gst_percentage"
            value={settings.gst_percentage}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
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
      
      <InvoiceCounterSettings />
    </div>
  );
};

export default SettingsForm;