import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Button, Input, Badge } from '../ui';
import { Grid, Flex } from '../layout/Grid';
import { useReports } from '../../hooks/useApi';
import { colors, spacing } from '../../theme';

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

export const ModernRentalReports: React.FC = () => {
  const { reportData, loading, error, fetchRentalReport, exportRentalReport } = useReports();
  
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

  useEffect(() => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30); // Last 30 days
    
    const newFilters = {
      ...filters,
      date_from: oneMonthAgo.toISOString().split('T')[0],
      date_to: now.toISOString().split('T')[0]
    };
    
    setFilters(newFilters);
    
    // Auto-generate report for last 1 month when page loads
    setTimeout(() => {
      fetchRentalReport(newFilters);
    }, 500); // Small delay to ensure filters are set
  }, []);

  const handleFilterChange = (field: keyof RentalReportFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    fetchRentalReport(filters);
  };

  const handleExport = () => {
    exportRentalReport(filters);
  };

  const clearFilters = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30); // Last 30 days
    
    setFilters({
      date_from: oneMonthAgo.toISOString().split('T')[0],
      date_to: now.toISOString().split('T')[0],
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

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' => {
    switch (status) {
      case 'checked_out': return 'success';
      case 'checked_in': return 'info';
      case 'confirmed': return 'warning';
      default: return 'error';
    }
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: spacing[3],
    fontSize: '16px',
    color: colors.gray[900],
    backgroundColor: colors.white,
    border: `2px solid ${colors.gray[200]}`,
    borderRadius: '12px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const summaryCardStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: spacing[6],
    backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    border: `2px solid ${colors.gray[100]}`,
    borderRadius: '16px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: spacing[8],
    marginBottom: spacing[8],
    color: colors.white,
    position: 'relative',
    overflow: 'hidden',
  };

  const filterCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: `2px solid ${colors.gray[100]}`,
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    marginBottom: spacing[6],
  };

  return (
    <div>
      {/* Enhanced Header */}
      <div style={headerStyle}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 1,
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: spacing[4],
            margin: 0,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}>
            📊 Rental Reports
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.9,
            margin: 0,
            fontWeight: '400',
          }}>
            Analytics for the last 1 month • Generate comprehensive rental reports with advanced filtering
          </p>
        </div>
      </div>

      {/* Enhanced Summary */}
      {reportData?.summary && (
        <Card style={{ 
          marginBottom: spacing[6],
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `2px solid ${colors.gray[100]}`,
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        }}>
          <CardHeader 
            title="📈 Analytics Summary (Last 30 Days)" 
            subtitle={`Report generated for ${filters.date_from} to ${filters.date_to}`}
          />
          
          <Grid cols={3} gap={6}>
            <div style={{
              ...summaryCardStyle,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: colors.white,
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: spacing[2] }}>
                {reportData.summary.total_bookings}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Bookings</div>
            </div>

            <div style={{
              ...summaryCardStyle,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: colors.white,
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: spacing[2] }}>
                ₹{reportData.summary.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Revenue</div>
            </div>

            <div style={{
              ...summaryCardStyle,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: colors.white,
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[2] }}>
                ₹{reportData.summary.total_gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>GST Collected</div>
            </div>

            <div style={{
              ...summaryCardStyle,
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: colors.white,
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[2] }}>
                ₹{reportData.summary.total_non_gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Non-GST Revenue</div>
            </div>

            <div style={{
              ...summaryCardStyle,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: colors.white,
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[2] }}>
                {reportData.summary.average_stay_nights.toFixed(1)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg Stay (Nights)</div>
            </div>

            <div style={{
              ...summaryCardStyle,
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              color: colors.white,
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: spacing[2] }}>
                {reportData.summary.unique_customers}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Unique Customers</div>
            </div>
          </Grid>
        </Card>
      )}

      {/* Enhanced Filters */}
      <Card padding={8} style={filterCardStyle}>
        <CardHeader 
          title="🔍 Report Filters" 
          subtitle="Default: Last 30 days • Configure your report parameters as needed"
        />
        
        <Grid cols={3} gap={6} style={{ marginBottom: spacing[8] }}>
          <Input
            label="Date From"
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
          
          <Input
            label="Date To"
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.gray[700],
              marginBottom: spacing[2],
            }}>
              Date Type
            </label>
            <select
              value={filters.date_type}
              onChange={(e) => handleFilterChange('date_type', e.target.value)}
              style={selectStyle}
            >
              <option value="check_in">Check-in Date</option>
              <option value="check_out">Check-out Date</option>
              <option value="booking_date">Booking Date</option>
              <option value="bill_date">Bill Date</option>
            </select>
          </div>

          <Input
            label="Customer Name"
            placeholder="Search by customer name"
            value={filters.customer_name}
            onChange={(e) => handleFilterChange('customer_name', e.target.value)}
            leftIcon="👤"
          />

          <Input
            label="Room Type"
            placeholder="e.g., Standard, Deluxe"
            value={filters.room_type}
            onChange={(e) => handleFilterChange('room_type', e.target.value)}
            leftIcon="🏠"
          />

          <Input
            label="Room Number"
            placeholder="e.g., 101, 202"
            value={filters.room_number}
            onChange={(e) => handleFilterChange('room_number', e.target.value)}
            leftIcon="🚪"
          />

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.gray[700],
              marginBottom: spacing[2],
            }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={selectStyle}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.gray[700],
              marginBottom: spacing[2],
            }}>
              GST Filter
            </label>
            <select
              value={filters.gst_filter}
              onChange={(e) => handleFilterChange('gst_filter', e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Bills</option>
              <option value="gst_only">GST Bills Only</option>
              <option value="non_gst_only">Non-GST Bills Only</option>
            </select>
          </div>

          <Input
            label="Min Amount (₹)"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={filters.min_amount}
            onChange={(e) => handleFilterChange('min_amount', e.target.value)}
            leftIcon="💰"
          />

          <Input
            label="Max Amount (₹)"
            type="number"
            placeholder="No limit"
            min="0"
            step="0.01"
            value={filters.max_amount}
            onChange={(e) => handleFilterChange('max_amount', e.target.value)}
            leftIcon="💰"
          />
        </Grid>

        <Flex gap={4} wrap>
          <Button
            onClick={handleGenerateReport}
            isLoading={loading}
            leftIcon="📊"
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              padding: `${spacing[4]} ${spacing[6]}`,
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>

          <Button
            variant="secondary"
            onClick={clearFilters}
            leftIcon="🗑️"
            size="lg"
          >
            Clear Filters
          </Button>

          {reportData && (
            <Button
              variant="success"
              onClick={handleExport}
              leftIcon="📁"
              size="lg"
            >
              Export CSV
            </Button>
          )}
        </Flex>
      </Card>

      {/* Error Message */}
      {error && (
        <Card style={{
          marginBottom: spacing[6],
          border: `2px solid ${colors.error[200]}`,
          backgroundColor: colors.error[50],
          borderRadius: '16px',
        }}>
          <div style={{ color: colors.error[700], padding: spacing[2] }}>
            <strong>Error:</strong> {error}
          </div>
        </Card>
      )}

      {/* Enhanced Data Table */}
      {reportData?.items && reportData.items.length > 0 && (
        <Card style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `2px solid ${colors.gray[100]}`,
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        }}>
          <CardHeader 
            title={`📋 Detailed Report (${reportData.items.length} records)`}
            action={
              <Badge variant="primary" size="sm">
                {reportData.items.length} records
              </Badge>
            }
          />
          
          <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '14px',
              backgroundColor: colors.white,
            }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                }}>
                  <th style={{ padding: spacing[4], textAlign: 'left', fontWeight: '600', color: colors.gray[700] }}>Bill #</th>
                  <th style={{ padding: spacing[4], textAlign: 'left', fontWeight: '600', color: colors.gray[700] }}>Dates</th>
                  <th style={{ padding: spacing[4], textAlign: 'left', fontWeight: '600', color: colors.gray[700] }}>Customer</th>
                  <th style={{ padding: spacing[4], textAlign: 'left', fontWeight: '600', color: colors.gray[700] }}>Room</th>
                  <th style={{ padding: spacing[4], textAlign: 'right', fontWeight: '600', color: colors.gray[700] }}>Amount</th>
                  <th style={{ padding: spacing[4], textAlign: 'center', fontWeight: '600', color: colors.gray[700] }}>GST</th>
                  <th style={{ padding: spacing[4], textAlign: 'center', fontWeight: '600', color: colors.gray[700] }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.items.map((item: RentalReportItem, index: number) => (
                  <tr key={index} style={{ 
                    backgroundColor: index % 2 === 0 ? colors.white : '#fafbfc',
                    borderBottom: `1px solid ${colors.gray[100]}`,
                    transition: 'all 0.2s ease-in-out',
                  }}>
                    <td style={{ padding: spacing[4] }}>
                      <div style={{ fontWeight: '600', color: colors.gray[900] }}>
                        {item.bill_number || `B-${item.booking_id}`}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.gray[500] }}>
                        ID: {item.booking_id}
                      </div>
                    </td>
                    <td style={{ padding: spacing[4] }}>
                      <div style={{ fontSize: '13px' }}>
                        <div><strong>In:</strong> {item.check_in}</div>
                        <div><strong>Out:</strong> {item.check_out}</div>
                        <div style={{ color: colors.gray[600] }}>{item.nights} nights</div>
                      </div>
                    </td>
                    <td style={{ padding: spacing[4] }}>
                      <div style={{ fontWeight: '500' }}>{item.customer_name}</div>
                      <div style={{ fontSize: '12px', color: colors.gray[600] }}>{item.customer_phone}</div>
                    </td>
                    <td style={{ padding: spacing[4] }}>
                      <div style={{ fontWeight: '500' }}>{item.room_number}</div>
                      <div style={{ fontSize: '12px', color: colors.gray[600] }}>{item.room_type}</div>
                      <div style={{ fontSize: '12px', color: colors.gray[500] }}>
                        ₹{item.price_per_night.toFixed(2)}/night
                      </div>
                    </td>
                    <td style={{ padding: spacing[4], textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>
                        ₹{item.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      {item.gst_included && (
                        <div style={{ fontSize: '12px', color: colors.gray[600] }}>
                          GST: ₹{item.gst_amount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: spacing[4], textAlign: 'center' }}>
                      {item.gst_included ? (
                        <Badge variant="success" size="sm">
                          {item.gst_percent.toFixed(1)}% GST
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          No GST
                        </Badge>
                      )}
                    </td>
                    <td style={{ padding: spacing[4], textAlign: 'center' }}>
                      <Badge variant={getStatusVariant(item.status)} size="sm">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {reportData?.items && reportData.items.length === 0 && (
        <Card style={{ 
          textAlign: 'center', 
          padding: spacing[12],
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `2px solid ${colors.gray[100]}`,
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: spacing[4] }}>📭</div>
          <h3 style={{ fontSize: '1.75rem', color: colors.gray[700], marginBottom: spacing[2] }}>
            No Data Found
          </h3>
          <p style={{ color: colors.gray[600], fontSize: '16px' }}>
            No rental records match your filter criteria. Try adjusting the filters and generate the report again.
          </p>
        </Card>
      )}
    </div>
  );
};