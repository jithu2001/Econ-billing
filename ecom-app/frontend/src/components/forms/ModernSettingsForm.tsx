import React, { useEffect } from 'react';
import { Card, CardHeader, Button, Input } from '../ui';
import { Grid } from '../layout/Grid';
import { useForm } from '../../hooks/useForm';
import { useSettings } from '../../hooks/useApi';
import { colors, spacing } from '../../theme';
import InvoiceCounterSettings from '../../InvoiceCounterSettings';

interface SettingsFormData {
  property_name: string;
  property_address: string;
  gst_number: string;
  gst_percentage: number;
}

export const ModernSettingsForm: React.FC = () => {
  const { settings, loading, error, fetchSettings, saveSettings } = useSettings();

  const {
    values,
    errors,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setFieldValue,
  } = useForm<SettingsFormData>({
    initialValues: {
      property_name: '',
      property_address: '',
      gst_number: '',
      gst_percentage: 0,
    },
    validationRules: {
      property_name: { required: true, minLength: 2 },
      property_address: { required: true, minLength: 5 },
      gst_number: { 
        required: true,
        pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        custom: (value) => {
          if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
            return 'Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)';
          }
          return null;
        }
      },
      gst_percentage: { 
        required: true,
        custom: (value) => {
          if (value < 0 || value > 100) return 'GST percentage must be between 0 and 100';
          return null;
        }
      },
    },
    onSubmit: async (formValues) => {
      await saveSettings(formValues);
    },
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFieldValue('property_name', settings.property_name || '');
      setFieldValue('property_address', settings.property_address || '');
      setFieldValue('gst_number', settings.gst_number || '');
      setFieldValue('gst_percentage', settings.gst_percentage || 0);
    }
  }, [settings, setFieldValue]);

  const successMessageStyle: React.CSSProperties = {
    padding: spacing[4],
    backgroundColor: colors.success[50],
    color: colors.success[700],
    border: `1px solid ${colors.success[200]}`,
    borderRadius: '6px',
    marginBottom: spacing[6],
    fontSize: '14px',
  };

  const errorMessageStyle: React.CSSProperties = {
    padding: spacing[4],
    backgroundColor: colors.error[50],
    color: colors.error[700],
    border: `1px solid ${colors.error[200]}`,
    borderRadius: '6px',
    marginBottom: spacing[6],
    fontSize: '14px',
  };

  if (loading && !settings) {
    return (
      <div style={{ padding: spacing[8], textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: colors.gray[600] }}>Loading settings...</div>
      </div>
    );
  }

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    borderRadius: '20px',
    padding: spacing[8],
    marginBottom: spacing[8],
    color: colors.white,
    position: 'relative',
    overflow: 'hidden',
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
            ⚙️ Business Settings
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.9,
            margin: 0,
            fontWeight: '400',
          }}>
            Configure your property details and GST settings for invoice generation
          </p>
        </div>
      </div>

      {error && !isSubmitting && (
        <div style={errorMessageStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {settings && !error && !isSubmitting && (
        <div style={successMessageStyle}>
          <strong>✓ Settings loaded successfully!</strong> Make changes below and save to update.
        </div>
      )}

      <Grid cols={1} gap={8}>
        <Card>
          <CardHeader 
            title="Property Information" 
            subtitle="Basic details about your property that will appear on invoices"
          />
          
          <form onSubmit={handleSubmit}>
            <Grid cols={1} gap={6}>
              <Input
                {...getFieldProps('property_name')}
                label="Property Name"
                placeholder="Enter your hotel/property name"
                leftIcon="🏨"
              />

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: colors.gray[700],
                  marginBottom: spacing[2],
                }}>
                  Property Address
                </label>
                <textarea
                  {...getFieldProps('property_address')}
                  rows={3}
                  placeholder="Enter complete property address"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: '16px',
                    color: colors.gray[900],
                    backgroundColor: colors.white,
                    border: `1px solid ${errors.property_address ? colors.error[500] : colors.gray[300]}`,
                    borderRadius: '6px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.property_address ? colors.error[500] : colors.primary[500];
                    e.target.style.boxShadow = `0 0 0 3px ${errors.property_address ? colors.error[200] : colors.primary[200]}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.property_address ? colors.error[500] : colors.gray[300];
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.property_address && (
                  <div style={{
                    marginTop: spacing[1],
                    fontSize: '14px',
                    color: colors.error[600],
                  }}>
                    {errors.property_address}
                  </div>
                )}
              </div>

              <Grid cols={2} gap={6}>
                <Input
                  {...getFieldProps('gst_number')}
                  label="GST Number"
                  placeholder="22AAAAA0000A1Z5"
                  leftIcon="📄"
                />

                <Input
                  {...getFieldProps('gst_percentage')}
                  label="GST Percentage (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="18.00"
                  leftIcon="💱"
                />
              </Grid>

              <div style={{ marginTop: spacing[6] }}>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={loading}
                  leftIcon="💾"
                >
                  {isSubmitting ? 'Saving Settings...' : 'Save Settings'}
                </Button>
              </div>
            </Grid>
          </form>
        </Card>

        <InvoiceCounterSettings />
      </Grid>
    </div>
  );
};