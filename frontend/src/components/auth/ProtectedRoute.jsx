import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute component that requires authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  
  // For now, we'll assume users are always authenticated
  // In a real app, you would check authentication status here
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

export default ProtectedRoute;