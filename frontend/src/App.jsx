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
import CloudinaryTest from './components/CloudinaryTest';
import ExpertReport from './components/ExpertReport';
import ViewReport from './components/ViewReport';
import ErrorBoundary from './components/ErrorBoundary';
// Import the API configuration to ensure it's loaded
import './utils/axiosConfig';

// Fallback loading component
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-lg text-gray-700">Loading...</p>
  </div>
);

function App() {
  console.log("App rendering");
  
  // Check token validity on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Token found in localStorage on app start");
    }
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-red-50">
          <Navbar />
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<AuthenticationPage />} />
                <Route path="/signup" element={<AuthenticationPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create-report" element={<ProtectedRoute><ReportForm /></ProtectedRoute>} />
                <Route path="/previous-reports" element={<ProtectedRoute><PreviousReports /></ProtectedRoute>} />
                <Route path="/create-pda-report" element={<ProtectedRoute><ReportPDA /></ProtectedRoute>} />
                <Route path="/create-expert-report" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <div className="container mx-auto px-4 py-8">
                        <ExpertReport />
                      </div>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/view-report/:id" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <ViewReport />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/cloudinary-test" element={<CloudinaryTest />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  );
}

// ✅ Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  console.log("Protected route - authenticated:", isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
