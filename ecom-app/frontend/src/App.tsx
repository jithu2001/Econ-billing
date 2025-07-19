import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SimpleNavigation } from './components/layout/SimpleNavigation';
import { Container } from './components/layout/Container';
import { ModernSettingsForm } from './components/forms/ModernSettingsForm';
import { ModernRentalReports } from './components/features/ModernRentalReports';
import { SimpleRoomsPage } from './components/features/SimpleRoomsPage';
import { ModernCustomersPage } from './components/features/ModernCustomersPage';
import { ModernBookingsPage } from './components/features/ModernBookingsPage';
import { ModernCustomerHistory } from './components/features/ModernCustomerHistory';
import { colors, typography } from './theme';

function App() {
  const appStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(', '),
    minHeight: '100vh',
    backgroundColor: colors.gray[50],
    color: colors.gray[900],
  };

  const mainStyle: React.CSSProperties = {
    paddingTop: '2rem',
    paddingBottom: '2rem',
  };

  return (
    <Router>
      <div style={appStyle}>
        <SimpleNavigation />
        
        <main style={mainStyle}>
          <Container>
            <Routes>
              <Route path="/" element={<Navigate to="/reports" replace />} />
              <Route path="/settings" element={<ModernSettingsForm />} />
              <Route path="/rooms" element={<SimpleRoomsPage />} />
              <Route path="/customers" element={<ModernCustomersPage />} />
              <Route path="/customers/:id/history" element={<ModernCustomerHistory />} />
              <Route path="/bookings" element={<ModernBookingsPage />} />
              <Route path="/reports" element={<ModernRentalReports />} />
            </Routes>
          </Container>
        </main>
      </div>
    </Router>
  );
}

export default App;