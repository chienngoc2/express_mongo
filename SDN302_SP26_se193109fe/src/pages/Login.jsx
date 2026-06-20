import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, clearAuthError } from '../redux/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Switch between 'login' and 'register'
  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login');

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [admin, setAdmin] = useState(false);

  // Validation / Feedback states
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync tab status with URL path
  useEffect(() => {
    const tab = location.pathname === '/register' ? 'register' : 'login';
    setActiveTab(tab);
    dispatch(clearAuthError());
    setValidationError('');
    setSuccessMsg('');
  }, [location.pathname, dispatch]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Auth Redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.admin) {
        navigate('/admin/users');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim() || !password.trim()) {
      setValidationError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    dispatch(loginUser({ username, password }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setValidationError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    if (password.length < 6) {
      setValidationError('Mật khẩu phải có độ dài từ 6 ký tự trở lên!');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Xác nhận mật khẩu không trùng khớp!');
      return;
    }

    const resultAction = await dispatch(registerUser({ username, password, admin }));
    if (registerUser.fulfilled.match(resultAction)) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
      // Clear inputs
      const registeredUser = username;
      setTimeout(() => {
        setSuccessMsg('');
        setUsername(registeredUser);
        setPassword('');
        setConfirmPassword('');
        setAdmin(false);
        // Switch tab to login
        setActiveTab('login');
        navigate('/login');
      }, 2000);
    }
  };

  const isLogin = activeTab === 'login';

  return (
    <div className="container animate-fade-in py-5" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="bezel-container">
            <div className="bezel-content p-4 p-md-5 position-relative overflow-hidden">
              {/* Decorative gradient orb */}
              <div 
                className="position-absolute rounded-circle" 
                style={{ 
                  width: '180px', height: '180px', top: '-80px', right: '-80px', 
                  background: isLogin 
                    ? 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, transparent 70%)', 
                  filter: 'blur(30px)', pointerEvents: 'none',
                  transition: 'background 0.5s ease'
                }}
              ></div>
              
              {/* Header Icon */}
              <div className="text-center mb-4 relative-position">
                <div 
                  className="d-inline-flex align-items-center justify-content-center bg-gradient text-white rounded-4 p-3 mb-3 shadow" 
                  style={{ 
                    width: '60px', height: '60px', 
                    background: isLogin
                      ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                      : 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                    transition: 'background 0.5s ease'
                  }}
                >
                  <i className={`fa-solid ${isLogin ? 'fa-right-to-bracket' : 'fa-user-plus'} fs-3`}></i>
                </div>
                <h2 className="fw-bold mb-2 text-white">
                  {isLogin ? 'Chào Mừng Trở Lại' : 'Đăng Ký Tài Khoản'}
                </h2>
                <p className="text-muted small">
                  {isLogin ? 'Đăng nhập hệ thống thi trắc nghiệm trực tuyến' : 'Tạo tài khoản để tham gia hệ thống trắc nghiệm'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div 
                className="d-flex mb-4 p-1 rounded-3 border" 
                style={{ 
                  background: 'rgba(3, 7, 18, 0.4)', 
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  margin: '0 auto 28px',
                  maxWidth: '280px'
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm flex-grow-1 py-2 fw-semibold rounded-2 border-0"
                  style={{
                    color: isLogin ? 'white' : 'var(--gray-600)',
                    background: isLogin ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
                    boxShadow: isLogin ? '0 4px 10px rgba(129, 140, 248, 0.2)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="btn btn-sm flex-grow-1 py-2 fw-semibold rounded-2 border-0"
                  style={{
                    color: !isLogin ? 'white' : 'var(--gray-600)',
                    background: !isLogin ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' : 'transparent',
                    boxShadow: !isLogin ? '0 4px 10px rgba(192, 132, 252, 0.2)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={() => navigate('/register')}
                >
                  Đăng ký
                </button>
              </div>

              {/* Alerts */}
              {(validationError || error) && (
                <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-3 small p-3 mb-4 animate-fade-in" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {validationError || error}
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success bg-success bg-opacity-10 text-success border-0 rounded-3 small p-3 mb-4 animate-fade-in" role="alert">
                  <i className="fa-solid fa-circle-check me-2"></i>
                  {successMsg}
                </div>
              )}

              {/* Combined Form */}
              <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="relative-position">
                {/* Username */}
                <div className="mb-4">
                  <label htmlFor="usernameInput" className="form-label">
                    <i className={`fa-solid fa-user me-2 ${isLogin ? 'text-primary' : 'text-secondary'}`}></i>
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="usernameInput"
                    placeholder={isLogin ? "Nhập tên tài khoản..." : "Chọn tên tài khoản..."}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading || !!successMsg}
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label htmlFor="passwordInput" className="form-label">
                    <i className={`fa-solid fa-lock me-2 ${isLogin ? 'text-primary' : 'text-secondary'}`}></i>
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    placeholder={isLogin ? "Nhập mật khẩu..." : "Nhập mật khẩu (tối thiểu 6 ký tự)..."}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || !!successMsg}
                  />
                </div>

                {/* Confirm Password (Register Only) */}
                {!isLogin && (
                  <div className="mb-4 animate-fade-in">
                    <label htmlFor="confirmPasswordInput" className="form-label">
                      <i className="fa-solid fa-circle-check me-2 text-secondary"></i>
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPasswordInput"
                      placeholder="Nhập lại mật khẩu..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading || !!successMsg}
                    />
                  </div>
                )}

                {/* Admin Select Role (Register Only) */}
                {!isLogin && (
                  <div className="mb-5 animate-fade-in">
                    <label htmlFor="regAdminInput" className="form-label">
                      <i className="fa-solid fa-user-shield me-2 text-secondary"></i>
                      Quyền Admin (true / false)
                    </label>
                    <select
                      className="form-select"
                      id="regAdminInput"
                      value={admin.toString()}
                      onChange={(e) => setAdmin(e.target.value === 'true')}
                      disabled={loading || !!successMsg}
                    >
                      <option value="false">Học viên thường (false)</option>
                      <option value="true">Quản trị viên (true)</option>
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 btn-magnetic mt-2"
                  disabled={loading || !!successMsg}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang xử lý...
                    </>
                  ) : isLogin ? (
                    <>
                      Đăng nhập
                      <span className="btn-icon-wrapper ms-2">
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                      </span>
                    </>
                  ) : (
                    <>
                      Đăng ký tài khoản
                      <span className="btn-icon-wrapper ms-2">
                        <i className="fa-solid fa-user-plus" style={{ fontSize: '0.85rem' }}></i>
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom text switch trigger */}
              <div className="text-center mt-4 border-top border-secondary border-opacity-10 pt-4 relative-position">
                <p className="mb-0 text-muted small">
                  {isLogin ? (
                    <>
                      Chưa có tài khoản?{' '}
                      <button 
                        type="button"
                        onClick={() => navigate('/register')} 
                        className="btn btn-link p-0 text-primary fw-semibold text-decoration-none hover-underline align-baseline"
                        style={{ fontSize: 'inherit' }}
                      >
                        Đăng ký ngay
                      </button>
                    </>
                  ) : (
                    <>
                      Đã có tài khoản?{' '}
                      <button 
                        type="button"
                        onClick={() => navigate('/login')} 
                        className="btn btn-link p-0 text-secondary fw-semibold text-decoration-none hover-underline align-baseline"
                        style={{ fontSize: 'inherit' }}
                      >
                        Đăng nhập ngay
                      </button>
                    </>
                  )}
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
