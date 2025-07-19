import React, { useState } from 'react';
import { Customer } from './types';
import WebcamCapture from './WebcamCapture';

const API_BASE = 'http://localhost:8080';

interface CustomerFormProps {
  onCustomerAdded: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onCustomerAdded }) => {
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    address: '',
    phone: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'webcam'>('file');
  const [showWebcam, setShowWebcam] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    // Reset file input
    const fileInput = document.getElementById('id_card_photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleWebcamCapture = (file: File) => {
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setShowWebcam(false);
    setMessage('Photo captured successfully!');
  };

  const handleWebcamCancel = () => {
    setShowWebcam(false);
  };

  const startWebcamCapture = () => {
    setShowWebcam(true);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', customer.name);
      formData.append('address', customer.address);
      formData.append('phone', customer.phone);
      
      if (selectedFile) {
        formData.append('id_card_photo', selectedFile);
      }

      const response = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setCustomer({ name: '', address: '', phone: '' });
        setSelectedFile(null);
        setPreviewUrl('');
        const fileInput = document.getElementById('id_card_photo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setMessage('Customer added successfully!');
        onCustomerAdded();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error adding customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Add New Customer</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customer.name}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={customer.address}
            onChange={handleInputChange}
            required
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customer.phone}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>ID Card Photo (optional):</label>
          
          {/* Upload Method Selection */}
          <div style={{ marginTop: '10px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="uploadMethod"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value as 'file')}
                  style={{ marginRight: '5px' }}
                />
                Upload File
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="uploadMethod"
                  value="webcam"
                  checked={uploadMethod === 'webcam'}
                  onChange={(e) => setUploadMethod(e.target.value as 'webcam')}
                  style={{ marginRight: '5px' }}
                />
                Take Photo
              </label>
            </div>
          </div>

          {/* File Upload Option */}
          {uploadMethod === 'file' && (
            <div>
              <input
                type="file"
                id="id_card_photo"
                name="id_card_photo"
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </small>
            </div>
          )}

          {/* Webcam Capture Option */}
          {uploadMethod === 'webcam' && (
            <div>
              {!showWebcam ? (
                <button
                  type="button"
                  onClick={startWebcamCapture}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginTop: '5px'
                  }}
                >
                  📷 Open Camera
                </button>
              ) : (
                <WebcamCapture 
                  onPhotoCapture={handleWebcamCapture}
                  onCancel={handleWebcamCancel}
                />
              )}
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Click to open camera and capture ID card photo
              </small>
            </div>
          )}
        </div>

        {previewUrl && (
          <div style={{ marginTop: '10px' }}>
            <label>Preview:</label>
            <div style={{ 
              marginTop: '5px', 
              position: 'relative', 
              display: 'inline-block',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '5px'
            }}>
              <img 
                src={previewUrl} 
                alt="ID Card Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px', 
                  objectFit: 'contain',
                  display: 'block'
                }} 
              />
              <button
                type="button"
                onClick={removeFile}
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Adding Customer...' : 'Add Customer'}
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

export default CustomerForm;