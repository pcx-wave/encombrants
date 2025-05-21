import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { RouteProvider } from './contexts/RouteContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import DepositRegister from './pages/Deposit/Register';
import DepositDashboard from './pages/Deposit/Dashboard';
import CollectorDashboard from './pages/Collector/Dashboard';
import CollectorRoutes from './pages/Collector/Routes';

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
                  <Route path="/deposit/register" element={<DepositRegister />} />
                  <Route path="/deposit/dashboard" element={<DepositDashboard />} />
                  <Route path="/collector/dashboard" element={<CollectorDashboard />} />
                  <Route path="/collector/routes" element={<CollectorRoutes />} />
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