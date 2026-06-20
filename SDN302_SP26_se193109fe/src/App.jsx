import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminManagePage from './pages/AdminManagePage';
import AdminUserPage from './pages/AdminUserPage';

// Authenticated route guard for general logged in users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, token } = useSelector((state) => state.auth);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route wrapper to handle home page redirection based on role
const HomeRedirect = () => {
  const { isAuthenticated, user, isInitialized, token } = useSelector((state) => state.auth);

  if (token && !isInitialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <div className="min-vh-100 d-flex flex-column">
        <Navbar />
        <main className="flex-grow-1 py-3">
          <Routes>
            {/* Redirect root to dashboard/login depending on auth */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />

            {/* User routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage" 
              element={
                <ProtectedRoute>
                  <AdminManagePage />
                </ProtectedRoute>
              } 
            />

            {/* Admin routes */}
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUserPage />
                </AdminRoute>
              } 
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
