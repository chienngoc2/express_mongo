import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isInitialized, token } = useSelector((state) => state.auth);

  // If we have a token stored but auth is not initialized, wait for it
  if (token && !isInitialized) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Đang xác thực thông tin...</p>
      </div>
    );
  }

  // If not authenticated or authenticated but not Admin -> Redirect to login
  if (!isAuthenticated || !user?.admin) {
    return <Navigate to="/login" replace />;
  }

  // If Admin -> Allow viewing the page
  return children;
};

export default AdminRoute;
