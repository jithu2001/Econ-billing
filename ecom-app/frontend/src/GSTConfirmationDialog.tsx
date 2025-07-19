import React, { useState } from 'react';

interface GSTConfirmationDialogProps {
  isOpen: boolean;
  bookingId: number;
  customerName: string;
  totalAmount: number;
  gstPercentage: number;
  onConfirm: (includeGST: boolean) => void;
  onCancel: () => void;
}

const GSTConfirmationDialog: React.FC<GSTConfirmationDialogProps> = ({
  isOpen,
  bookingId,
  customerName,
  totalAmount,
  gstPercentage,
  onConfirm,
  onCancel
}) => {
  const [includeGST, setIncludeGST] = useState(true);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const gstAmount = totalAmount * (gstPercentage / 100);
  const finalAmount = includeGST ? totalAmount + gstAmount : totalAmount;

  return (
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
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '24px' }}>
            Generate Bill for Checkout
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Customer: <strong>{customerName}</strong>
          </p>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>GST Options</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '10px',
              backgroundColor: includeGST ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              border: includeGST ? '2px solid #2196F3' : '2px solid transparent'
            }}>
              <input
                type="radio"
                checked={includeGST}
                onChange={() => setIncludeGST(true)}
                style={{ marginRight: '10px' }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>With GST ({gstPercentage}%)</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Subtotal: {formatCurrency(totalAmount)} + GST: {formatCurrency(gstAmount)} = <strong>{formatCurrency(totalAmount + gstAmount)}</strong>
                </div>
              </div>
            </label>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '10px',
              backgroundColor: !includeGST ? '#e8f5e8' : 'transparent',
              borderRadius: '4px',
              border: !includeGST ? '2px solid #4CAF50' : '2px solid transparent'
            }}>
              <input
                type="radio"
                checked={!includeGST}
                onChange={() => setIncludeGST(false)}
                style={{ marginRight: '10px' }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>Without GST</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Total: <strong>{formatCurrency(totalAmount)}</strong>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div style={{
          backgroundColor: includeGST ? '#e3f2fd' : '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            Final Bill Amount: {formatCurrency(finalAmount)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(includeGST)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default GSTConfirmationDialog;