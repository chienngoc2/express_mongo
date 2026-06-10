import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark glass-panel py-3 mb-4 sticky-top rounded-0 border-start-0 border-end-0 border-top-0">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to={isAuthenticated ? "/dashboard" : "/"}>
          <div className="bg-primary bg-gradient p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <i className="fa-solid fa-graduation-cap text-white fs-5"></i>
          </div>
          <span className="text-white">Quiz</span>
          <span className="text-primary">Portal</span>
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link px-3 fw-semibold ${location.pathname === '/dashboard' ? 'active text-primary' : 'text-light-emphasis'}`} 
                    to="/dashboard"
                  >
                    <i className="fa-solid fa-list-check me-1"></i> Làm Quiz
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link px-3 fw-semibold ${location.pathname === '/manage' ? 'active text-primary' : 'text-light-emphasis'}`} 
                    to="/manage"
                  >
                    <i className="fa-solid fa-book-open me-1"></i> {user?.admin ? 'Quản lý Đề thi' : 'Đề Thi Của Tôi'}
                  </Link>
                </li>
                {user?.admin && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link px-3 fw-semibold ${location.pathname === '/admin/users' ? 'active text-primary' : 'text-light-emphasis'}`} 
                      to="/admin/users"
                    >
                      <i className="fa-solid fa-users-gear me-1"></i> Quản lý Người dùng
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="d-flex align-items-center gap-2 me-2">
                  <div className="d-flex flex-column text-end">
                    <span className="fw-semibold text-white small">{user?.username}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {user?.admin ? (
                        <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 rounded-pill px-2">
                          <i className="fa-solid fa-crown me-1 small"></i>Admin
                        </span>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-25 text-muted border border-secondary border-opacity-25 rounded-pill px-2">
                          Học viên
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="bg-dark-accent p-1.5 border border-secondary border-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fa-solid fa-user text-primary fs-5"></i>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm px-3 rounded-pill fw-semibold bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20"
                >
                  <i className="fa-solid fa-right-from-bracket me-1"></i> Đăng xuất
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-secondary px-3 rounded-pill fw-semibold">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary px-3 rounded-pill fw-semibold">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
