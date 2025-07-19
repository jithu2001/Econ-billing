import React, { useState, useEffect } from 'react';

interface RentalReportFilter {
  date_from: string;
  date_to: string;
  date_type: string;
  customer_name: string;
  room_type: string;
  room_number: string;
  status: string;
  gst_filter: string;
  min_amount: string;
  max_amount: string;
}

interface RentalReportItem {
  booking_id: number;
  bill_number: string;
  booking_date: string;
  check_in: string;
  check_out: string;
  nights: number;
  customer_name: string;
  customer_phone: string;
  room_number: string;
  room_type: string;
  price_per_night: number;
  subtotal: number;
  gst_included: boolean;
  gst_percent: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  bill_date: string;
}

interface RentalReportSummary {
  total_bookings: number;
  total_revenue: number;
  total_gst_amount: number;
  total_non_gst: number;
  total_gst_revenue: number;
  average_stay_nights: number;
  unique_customers: number;
}

interface RentalReportResponse {
  items: RentalReportItem[];
  summary: RentalReportSummary;
  filters: RentalReportFilter;
}

const API_BASE = 'http://localhost:8080';

const RentalReports: React.FC = () => {
  const [filters, setFilters] = useState<RentalReportFilter>({
    date_from: '',
    date_to: '',
    date_type: 'check_in',
    customer_name: '',
    room_type: '',
    room_number: '',
    status: '',
    gst_filter: 'all',
    min_amount: '',
    max_amount: ''
  });

  const [reportData, setReportData] = useState<RentalReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilters(prev => ({
      ...prev,
      date_from: firstDay.toISOString().split('T')[0],
      date_to: lastDay.toISOString().split('T')[0]
    }));
  }, []);

  const handleFilterChange = (field: keyof RentalReportFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchReport = async () => {
    setLoading(true);
    setMessage('');

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE}/api/reports/rental?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setMessage('Failed to fetch report');
      }
    } catch (error) {
      setMessage('Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const downloadUrl = `${API_BASE}/api/reports/rental/export?${queryParams}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `rental_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilters({
      date_from: firstDay.toISOString().split('T')[0],
      date_to: lastDay.toISOString().split('T')[0],
      date_type: 'check_in',
      customer_name: '',
      room_type: '',
      room_number: '',
      status: '',
      gst_filter: 'all',
      min_amount: '',
      max_amount: ''
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>📊 Rental Reports</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Generate detailed rental reports for your chartered accountant with comprehensive filtering options.
      </p>

      {/* Filters Section */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>🔍 Report Filters</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          {/* Date Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date From:</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date To:</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date Type:</label>
            <select
              value={filters.date_type}
              onChange={(e) => handleFilterChange('date_type', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="check_in">Check-in Date</option>
              <option value="check_out">Check-out Date</option>
              <option value="booking_date">Booking Date</option>
              <option value="bill_date">Bill Date</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Customer Name:</label>
            <input
              type="text"
              value={filters.customer_name}
              onChange={(e) => handleFilterChange('customer_name', e.target.value)}
              placeholder="Search by customer name"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Room Filters */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Room Type:</label>
            <input
              type="text"
              value={filters.room_type}
              onChange={(e) => handleFilterChange('room_type', e.target.value)}
              placeholder="e.g., Standard, Deluxe"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Room Number:</label>
            <input
              type="text"
              value={filters.room_number}
              onChange={(e) => handleFilterChange('room_number', e.target.value)}
              placeholder="e.g., 101, 202"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* GST Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>GST Filter:</label>
            <select
              value={filters.gst_filter}
              onChange={(e) => handleFilterChange('gst_filter', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All Bills</option>
              <option value="gst_only">GST Bills Only</option>
              <option value="non_gst_only">Non-GST Bills Only</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Amount (₹):</label>
            <input
              type="number"
              value={filters.min_amount}
              onChange={(e) => handleFilterChange('min_amount', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Amount (₹):</label>
            <input
              type="number"
              value={filters.max_amount}
              onChange={(e) => handleFilterChange('max_amount', e.target.value)}
              placeholder="No limit"
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchReport}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? '🔄 Generating...' : '📊 Generate Report'}
          </button>

          <button
            onClick={clearFilters}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Clear Filters
          </button>

          {reportData && (
            <button
              onClick={exportToCSV}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📁 Export to CSV
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {/* Summary Section */}
      {reportData && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>📈 Report Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {reportData.summary.total_bookings}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Bookings</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                ₹{reportData.summary.total_revenue.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Revenue</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                ₹{reportData.summary.total_gst_amount.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>GST Collected</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#17a2b8' }}>
                ₹{reportData.summary.total_non_gst.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Non-GST Revenue</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6610f2' }}>
                {reportData.summary.average_stay_nights.toFixed(1)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Avg Stay (Nights)</div>
            </div>

            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fd7e14' }}>
                {reportData.summary.unique_customers}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Unique Customers</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {reportData && reportData.items.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
            📋 Detailed Report ({reportData.items.length} records)
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>Bill #</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>Check-in</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>Check-out</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>Nights</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>Customer</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>Room</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>Rate/Night</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>Subtotal</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' }}>GST</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>GST Amt</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>Total</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                      {item.bill_number || `B-${item.booking_id}`}
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>{item.check_in}</td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>{item.check_out}</td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' }}>{item.nights}</td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                      {item.customer_name}
                      <br />
                      <small style={{ color: '#666' }}>{item.customer_phone}</small>
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>
                      {item.room_number}
                      <br />
                      <small style={{ color: '#666' }}>{item.room_type}</small>
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>
                      ₹{item.price_per_night.toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>
                      ₹{item.subtotal.toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' }}>
                      {item.gst_included ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                          {item.gst_percent.toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ color: '#6c757d' }}>No</span>
                      )}
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>
                      ₹{item.gst_amount.toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                      ₹{item.total_amount.toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        backgroundColor: item.status === 'checked_out' ? '#d4edda' : 
                                       item.status === 'checked_in' ? '#cce7ff' :
                                       item.status === 'confirmed' ? '#fff3cd' : '#f8d7da',
                        color: item.status === 'checked_out' ? '#155724' : 
                               item.status === 'checked_in' ? '#004085' :
                               item.status === 'confirmed' ? '#856404' : '#721c24'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportData && reportData.items.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3>No Data Found</h3>
          <p>No rental records match your filter criteria. Try adjusting the filters and generate the report again.</p>
        </div>
      )}
    </div>
  );
};

export default RentalReports;