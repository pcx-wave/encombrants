import React from 'react';
import RequestDetails from './pages/Client/RequestDetails';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Route 
      path="/client/requests/:id" 
      element={
        <ProtectedRoute requiredRole="client">
          <RequestDetails />
        </ProtectedRoute>
      } 
    />
  );
}

export default App;