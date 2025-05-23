```tsx
// Update the routes in App.tsx to include the new RequestDetails page
import RequestDetails from './pages/Client/RequestDetails';

// Add this route inside the Client routes section
<Route 
  path="/client/requests/:id" 
  element={
    <ProtectedRoute requiredRole="client">
      <RequestDetails />
    </ProtectedRoute>
  } 
/>
```