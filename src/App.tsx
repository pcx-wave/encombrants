import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { RouteProvider } from './contexts/RouteContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import DepositRegister from './pages/Deposit/Register';
import DepositDashboard from './pages/Deposit/Dashboard';
import CollectorDashboard from './pages/Collector/Dashboard';
import CollectorRoutes from './pages/Collector/Routes';
import ClientDashboard from './pages/Client/Dashboard';
import ClientRequests from './pages/Client/Requests';
import NewRequest from './pages/Client/NewRequest';
import RequestDetails from './pages/Client/RequestDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RequestProvider>
          <RouteProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  
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
              </main>
              <Footer />
            </div>
          </RouteProvider>
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;