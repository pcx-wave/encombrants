import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { RouteProvider } from './contexts/RouteContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';

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
                  {/* Additional routes will be added here */}
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