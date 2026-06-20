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

  return (
    <div className="container pt-3 mb-2">
      <nav className="navbar navbar-expand-lg navbar-dark glass-panel px-4 py-3 rounded-4 border shadow-lg">
        <div className="container-fluid px-0">
          <Link className="navbar-brand d-flex align-items-center fw-bold fs-5" to={isAuthenticated ? "/dashboard" : "/"}>
            <div className="bg-primary bg-gradient p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              <i className="fa-solid fa-graduation-cap text-white fs-5"></i>
            </div>
            <span className="text-white fw-bold tracking-tight">Quiz</span>
            <span className="text-primary fw-bold tracking-tight">Portal</span>
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
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link 
                      className={`nav-link px-3 py-2 fw-semibold rounded-3 transition-premium ${location.pathname === '/dashboard' ? 'active text-white bg-white bg-opacity-10' : 'text-secondary'}`} 
                      to="/dashboard"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      <i className="fa-solid fa-list-check me-2"></i>Làm Quiz
                    </Link>
                  </li>
                  <li className="nav-item ms-lg-1">
                    <Link 
                      className={`nav-link px-3 py-2 fw-semibold rounded-3 transition-premium ${location.pathname === '/manage' ? 'active text-white bg-white bg-opacity-10' : 'text-secondary'}`} 
                      to="/manage"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      <i className="fa-solid fa-book-open me-2"></i>{user?.admin ? 'Quản lý Đề thi' : 'Đề Thi Của Tôi'}
                    </Link>
                  </li>
                  {user?.admin && (
                    <li className="nav-item ms-lg-1">
                      <Link 
                        className={`nav-link px-3 py-2 fw-semibold rounded-3 transition-premium ${location.pathname === '/admin/users' ? 'active text-white bg-white bg-opacity-10' : 'text-secondary'}`} 
                        to="/admin/users"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <i className="fa-solid fa-users-gear me-2"></i>Quản lý Người dùng
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            <div className="d-flex align-items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="d-flex align-items-center gap-2 me-1">
                    <div className="d-flex flex-column text-end">
                      <span className="fw-semibold text-white small" style={{ fontSize: '0.9rem' }}>{user?.username}</span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {user?.admin ? (
                          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-20 rounded-pill px-2">
                            <i className="fa-solid fa-crown me-1 small"></i>Admin
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-25 text-muted border border-secondary border-opacity-20 rounded-pill px-2">
                            Học viên
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="bg-dark p-1 border border-secondary border-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="fa-solid fa-user text-primary" style={{ fontSize: '0.9rem' }}></i>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn btn-danger btn-sm px-3 rounded-pill fw-semibold bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20"
                    style={{ padding: '8px 16px', transition: 'all 0.3s ease' }}
                  >
                    <i className="fa-solid fa-right-from-bracket me-2"></i>Đăng xuất
                  </button>
                </>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-secondary px-4 rounded-pill fw-semibold" style={{ padding: '8px 20px' }}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn btn-primary px-4 rounded-pill fw-semibold" style={{ padding: '8px 20px' }}>
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
