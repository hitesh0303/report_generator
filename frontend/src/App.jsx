// src/App.jsx
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthenticationPage from './components/AuthenticationPage';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import PreviousReports from './components/PreviousReports';
import ReportPDA from './components/ReportPDA';
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import CloudinaryTest from './components/CloudinaryTest';
import ExpertReport from './components/ExpertReport';
import ViewReport from './components/ViewReport';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
// Import the API configuration to ensure it's loaded
import './utils/axiosConfig';

// Fallback loading component
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-lg text-gray-700">Loading...</p>
  </div>
);

// ✅ Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// ✅ Public Only Route Wrapper
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
      <div className="min-h-screen bg-red-50">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
              } />
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <>
                    <PublicNavbar />
                    <AuthenticationPage />
                  </>
                </PublicOnlyRoute>
              } />
              <Route path="/signup" element={
                <PublicOnlyRoute>
                  <>
                    <PublicNavbar />
                    <AuthenticationPage />
                  </>
                </PublicOnlyRoute>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/create-report" element={
                <ProtectedRoute>
                  <Navbar />
                  <ReportForm />
                </ProtectedRoute>
              } />
              <Route path="/previous-reports" element={
                <ProtectedRoute>
                  <Navbar />
                  <PreviousReports />
                </ProtectedRoute>
              } />
              <Route path="/create-pda-report" element={
                <ProtectedRoute>
                  <Navbar />
                  <ReportPDA />
                </ProtectedRoute>
              } />
              <Route path="/create-expert-report" element={
                <ProtectedRoute>
                  <Navbar />
                  <ErrorBoundary>
                    <div className="container mx-auto px-4 py-8">
                      <ExpertReport />
                    </div>
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/view-report/:id" element={
                <ProtectedRoute>
                  <Navbar />
                  <ErrorBoundary>
                    <ViewReport />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/cloudinary-test" element={<CloudinaryTest />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
