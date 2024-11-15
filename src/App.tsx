import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Treatments from './pages/Treatments';
import Billing from './pages/Billing';
import CabinetManagement from './pages/CabinetManagement';
import AdminPanel from './pages/AdminPanel';
import Lists from './pages/Lists';
import Backup from './pages/Backup';
import Absences from './pages/Absences';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute requiredPermissions={['view_dashboard']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/appointments" element={
              <ProtectedRoute requiredPermissions={['view_appointments']}>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute requiredPermissions={['view_patients']}>
                <Patients />
              </ProtectedRoute>
            } />
            <Route path="/treatments" element={
              <ProtectedRoute requiredPermissions={['view_treatments']}>
                <Treatments />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute requiredPermissions={['view_billing']}>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/cabinet" element={
              <ProtectedRoute requiredPermissions={['view_supplies']}>
                <CabinetManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredPermissions={['manage_users']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/lists" element={
              <ProtectedRoute requiredPermissions={['manage_users']}>
                <Lists />
              </ProtectedRoute>
            } />
            <Route path="/backup" element={
              <ProtectedRoute requiredPermissions={['manage_users']}>
                <Backup />
              </ProtectedRoute>
            } />
            <Route path="/absences" element={
              <ProtectedRoute requiredPermissions={['view_supplies']}>
                <Absences />
              </ProtectedRoute>
            } />
            <Route path="*" element={
              hasPermission('view_dashboard') ? 
                <Navigate to="/" /> : 
                <Navigate to="/appointments" />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}