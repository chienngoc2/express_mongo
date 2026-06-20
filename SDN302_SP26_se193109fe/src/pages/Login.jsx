import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from '../redux/slices/authSlice';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.admin) {
        navigate('/admin/users'); // Redirect to user management or quiz management based on preference, here users is a default
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim() || !password.trim()) {
      setValidationError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    dispatch(loginUser({ username, password }));
  };

  return (
    <div className="container animate-fade-in py-5" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="bezel-container">
            <div className="bezel-content p-4 p-md-5 position-relative overflow-hidden">
              {/* Decorative gradient orb */}
              <div className="position-absolute rounded-circle" style={{ width: '180px', height: '180px', top: '-80px', right: '-80px', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
              
              <div className="text-center mb-5 relative-position">
                <div className="d-inline-flex align-items-center justify-content-center bg-gradient text-white rounded-4 p-3 mb-3 shadow" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                  <i className="fa-solid fa-right-to-bracket fs-3"></i>
                </div>
                <h2 className="fw-bold mb-2 text-white">Chào Mừng Trở Lại</h2>
                <p className="text-muted small">Đăng nhập hệ thống thi trắc nghiệm trực tuyến</p>
              </div>

              {validationError && (
                <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-3 small p-3 mb-4 animate-fade-in" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {validationError}
                </div>
              )}

              {error && (
                <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-3 small p-3 mb-4 animate-fade-in" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative-position">
                <div className="mb-4">
                  <label htmlFor="usernameInput" className="form-label">
                    <i className="fa-solid fa-user me-2 text-primary"></i>Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="usernameInput"
                    placeholder="Nhập tên tài khoản..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="passwordInput" className="form-label">
                    <i className="fa-solid fa-lock me-2 text-primary"></i>Mật khẩu
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 btn-magnetic"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đăng nhập
                      <span className="btn-icon-wrapper ms-2">
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4 border-top border-secondary border-opacity-10 pt-4 relative-position">
                <p className="mb-0 text-muted small">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-primary fw-semibold text-decoration-none hover-underline">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
