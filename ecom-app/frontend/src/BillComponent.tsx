import React, { useEffect } from 'react';
import { Bill } from './types';

interface BillComponentProps {
  bill: Bill;
  onClose: () => void;
}

const BillComponent: React.FC<BillComponentProps> = ({ bill, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Add print styles when component mounts
  useEffect(() => {
    const printStyles = `
      <style id="bill-print-styles">
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body * { visibility: hidden; }
          .bill-modal, .bill-modal * { visibility: visible; }
          .bill-modal { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; background: white !important; }
          .no-print { display: none !important; }
          .bill-content { padding: 20px !important; }
          .bill-container { max-width: none !important; margin: 0 !important; }
          .header { page-break-inside: avoid; }
          .bill-table { page-break-inside: auto; }
          .bill-table tr { page-break-inside: avoid; page-break-after: auto; }
          .total-section { page-break-inside: avoid; }
          body { margin: 0 !important; padding: 0 !important; }
          @page { margin: 0.5in; size: A4; }
        }
      </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', printStyles);

    // Cleanup on unmount
    return () => {
      const styleElement = document.getElementById('bill-print-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a clean bill content for download/print
    const billContent = document.getElementById('bill-content')?.innerHTML;
    
    const printWindow = window.open('', '_blank');
    if (printWindow && billContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${bill.bill_number}</title>
          <meta charset="UTF-8">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5;
              color: #333;
              line-height: 1.6;
            }
            .invoice-wrapper {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .invoice-header {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              padding: 30px 40px;
              text-align: center;
            }
            .business-name {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              letter-spacing: 1px;
            }
            .business-info {
              font-size: 14px;
              opacity: 0.9;
              line-height: 1.8;
            }
            .invoice-body {
              padding: 40px;
            }
            .invoice-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 2px solid #f0f0f0;
            }
            .invoice-details {
              flex: 1;
            }
            .invoice-badge {
              display: inline-block;
              background: #e8f4f8;
              color: #1e3c72;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 15px;
            }
            .invoice-number {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 5px;
            }
            .invoice-date {
              color: #666;
              font-size: 14px;
            }
            .customer-box {
              background: #f8f9fa;
              border-left: 4px solid #1e3c72;
              padding: 20px;
              border-radius: 4px;
              max-width: 300px;
            }
            .customer-label {
              font-size: 12px;
              text-transform: uppercase;
              color: #666;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
            }
            .customer-name {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 8px;
            }
            .customer-details {
              font-size: 14px;
              color: #666;
              line-height: 1.6;
            }
            .items-table {
              width: 100%;
              margin: 30px 0;
              border-collapse: collapse;
            }
            .items-table th {
              background: #f8f9fa;
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #666;
              border-bottom: 2px solid #e0e0e0;
            }
            .items-table td {
              padding: 20px 15px;
              border-bottom: 1px solid #f0f0f0;
              font-size: 14px;
            }
            .item-description {
              font-weight: 600;
              color: #333;
              margin-bottom: 5px;
            }
            .item-details {
              font-size: 13px;
              color: #666;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .amount {
              font-weight: 600;
              color: #333;
            }
            .invoice-totals {
              margin-top: 30px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 300px;
              background: #f8f9fa;
              padding: 25px;
              border-radius: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 14px;
              color: #666;
            }
            .gst-na {
              font-style: italic;
              color: #999;
            }
            .total-label {
              font-weight: 500;
            }
            .grand-total {
              display: flex;
              justify-content: space-between;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #1e3c72;
              font-size: 20px;
              font-weight: 700;
              color: #1e3c72;
            }
            .invoice-footer {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #f0f0f0;
              text-align: center;
            }
            .thank-you {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
            }
            .footer-note {
              font-size: 12px;
              color: #999;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                background: white;
              }
              .invoice-wrapper {
                box-shadow: none;
                margin: 0;
              }
              @page { 
                margin: 0.5in; 
                size: A4; 
              }
            }
          </style>
        </head>
        <body>
          ${billContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="bill-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header with controls */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 25px',
          borderBottom: '2px solid #ddd',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Professional Invoice</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📄 Download
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div id="bill-content" className="bill-content" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
          <div className="invoice-wrapper" style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div className="invoice-header" style={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              padding: '30px 40px',
              textAlign: 'center'
            }}>
              <div className="business-name" style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '10px',
                letterSpacing: '1px'
              }}>{bill.business_name}</div>
              <div className="business-info" style={{
                fontSize: '14px',
                opacity: '0.9',
                lineHeight: '1.8'
              }}>
                {bill.business_address}<br />
                GST No: {bill.business_gst}
              </div>
            </div>

            {/* Body */}
            <div className="invoice-body" style={{ padding: '40px' }}>
              {/* Invoice Meta */}
              <div className="invoice-meta" style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '40px',
                paddingBottom: '30px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div className="invoice-details">
                  <div className="invoice-badge" style={{
                    display: 'inline-block',
                    background: '#e8f4f8',
                    color: '#1e3c72',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '15px'
                  }}>INVOICE</div>
                  <div className="invoice-number" style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '5px'
                  }}>{bill.bill_number}</div>
                  <div className="invoice-date" style={{
                    color: '#666',
                    fontSize: '14px'
                  }}>Date: {formatDate(bill.created_at!)}</div>
                </div>
                
                <div className="customer-box" style={{
                  background: '#f8f9fa',
                  borderLeft: '4px solid #1e3c72',
                  padding: '20px',
                  borderRadius: '4px',
                  maxWidth: '300px'
                }}>
                  <div className="customer-label" style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    color: '#666',
                    letterSpacing: '0.5px',
                    marginBottom: '10px'
                  }}>Billed To</div>
                  <div className="customer-name" style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '8px'
                  }}>{bill.customer_name}</div>
                  <div className="customer-details" style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.6'
                  }}>
                    {bill.customer_address && (
                      <div>{bill.customer_address}</div>
                    )}
                    <div>Phone: {bill.customer_phone}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="items-table" style={{
                width: '100%',
                margin: '30px 0',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#666',
                      borderBottom: '2px solid #e0e0e0'
                    }}>Room Details</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#666',
                      borderBottom: '2px solid #e0e0e0'
                    }}>Check-in</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#666',
                      borderBottom: '2px solid #e0e0e0'
                    }}>Check-out</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#666',
                      borderBottom: '2px solid #e0e0e0'
                    }}>Nights</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      textAlign: 'right',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#666',
                      borderBottom: '2px solid #e0e0e0'
                    }}>Rate/Night</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      textAlign: 'right',
                      fontWeight: '600',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#666',
                      borderBottom: '2px solid #e0e0e0'
                    }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{
                      padding: '20px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px'
                    }}>
                      <div className="item-description" style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '5px'
                      }}>Room {bill.room_number}</div>
                      <div className="item-details" style={{
                        fontSize: '13px',
                        color: '#666'
                      }}>{bill.room_type_name}</div>
                    </td>
                    <td className="text-center" style={{
                      padding: '20px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>{formatDate(bill.check_in!)}</td>
                    <td className="text-center" style={{
                      padding: '20px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>{formatDate(bill.check_out!)}</td>
                    <td className="text-center" style={{
                      padding: '20px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>{bill.nights}</td>
                    <td className="text-right amount" style={{
                      padding: '20px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#333'
                    }}>{formatCurrency(bill.price_per_night!)}</td>
                    <td className="text-right amount" style={{
                      padding: '20px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#333'
                    }}>{formatCurrency(bill.subtotal)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="invoice-totals" style={{
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <div className="totals-box" style={{
                  width: '300px',
                  background: '#f8f9fa',
                  padding: '25px',
                  borderRadius: '8px'
                }}>
                  <div className="total-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span className="total-label" style={{ fontWeight: '500' }}>Subtotal:</span>
                    <span>{formatCurrency(bill.subtotal)}</span>
                  </div>
                  {bill.gst_included && (
                    <div className="total-row" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      <span className="total-label" style={{ fontWeight: '500' }}>GST ({bill.gst_percent}%):</span>
                      <span>{formatCurrency(bill.gst_amount)}</span>
                    </div>
                  )}
                  {!bill.gst_included && (
                    <div className="total-row" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      <span className="total-label" style={{ fontWeight: '500' }}>GST:</span>
                      <span>Not Applicable</span>
                    </div>
                  )}
                  <div className="grand-total" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '2px solid #1e3c72',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e3c72'
                  }}>
                    <span>Total Amount:</span>
                    <span>{formatCurrency(bill.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="invoice-footer" style={{
                marginTop: '50px',
                paddingTop: '30px',
                borderTop: '2px solid #f0f0f0',
                textAlign: 'center'
              }}>
                <div className="thank-you" style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '20px'
                }}>
                  Thank you for choosing {bill.business_name}!
                </div>
                <div className="footer-note" style={{
                  fontSize: '12px',
                  color: '#999'
                }}>
                  This is a computer-generated invoice and does not require a signature.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillComponent;