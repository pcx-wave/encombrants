import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { RouteProvider } from './contexts/RouteContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MobileOptimizedHeader from './components/common/MobileOptimizedHeader';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DepositRegister = lazy(() => import('./pages/Deposit/Register'));
const DepositDashboard = lazy(() => import('./pages/Deposit/Dashboard'));
const CollectorDashboard = lazy(() => import('./pages/Collector/Dashboard'));
const CollectorRoutes = lazy(() => import('./pages/Collector/Routes'));
const ClientDashboard = lazy(() => import('./pages/Client/Dashboard'));
const ClientRequests = lazy(() => import('./pages/Client/Requests'));
const NewRequest = lazy(() => import('./pages/Client/NewRequest'));
const RequestDetails = lazy(() => import('./pages/Client/RequestDetails'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <RequestProvider>
            <RouteProvider>
              <div className="flex flex-col min-h-screen">
                <MobileOptimizedHeader />
                <main className="flex-grow">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                      
                      {/* Profile route - accessible to all authenticated users */}
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Deposit routes */}
                      <Route path="/deposit/register" element={<DepositRegister />} />
                      <Route 
                        path="/deposit/dashboard" 
                        element={
                          <ProtectedRoute requiredRole="deposit">
                            <DepositDashboard />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Collector routes */}
                      <Route 
                        path="/collector/dashboard" 
                        element={
                          <ProtectedRoute requiredRole="collector">
                            <CollectorDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/collector/routes" 
                        element={
                          <ProtectedRoute requiredRole="collector">
                            <CollectorRoutes />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Client routes */}
                      <Route 
                        path="/client/dashboard" 
                        element={
                          <ProtectedRoute requiredRole="client">
                            <ClientDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client/requests" 
                        element={
                          <ProtectedRoute requiredRole="client">
                            <ClientRequests />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client/new-request" 
                        element={
                          <ProtectedRoute requiredRole="client">
                            <NewRequest />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client/requests/:id" 
                        element={
                          <ProtectedRoute requiredRole="client">
                            <RequestDetails />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </RouteProvider>
          </RequestProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;