import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearAuthError } from '../redux/slices/authSlice';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
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

    const resultAction = await dispatch(registerUser({ username, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="container animate-fade-in py-5" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-5 col-xl-5">
          <div className="glass-panel p-5 border-0 shadow-lg position-relative overflow-hidden">
            {/* Decorative background blur inside the panel */}
            <div className="position-absolute bg-secondary rounded-circle" style={{ width: '150px', height: '150px', top: '-60px', right: '-60px', filter: 'blur(50px)', opacity: '0.3' }}></div>
            
            <div className="text-center mb-4 relative-position">
              <div className="d-inline-flex align-items-center justify-content-center bg-secondary bg-gradient text-white rounded-4 p-3 mb-3 shadow" style={{ width: '60px', height: '60px' }}>
                <i className="fa-solid fa-user-plus fs-3"></i>
              </div>
              <h2 className="fw-bold mb-1 text-white">Đăng Ký Tài Khoản</h2>
              <p className="text-muted">Tạo tài khoản để tham gia làm bài thi trắc nghiệm</p>
            </div>

            {validationError && (
              <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-3 small p-3 animate-fade-in" role="alert">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>
                {validationError}
              </div>
            )}

            {error && (
              <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 rounded-3 small p-3 animate-fade-in" role="alert">
                <i className="fa-solid fa-triangle-exclamation me-2"></i>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success bg-success bg-opacity-10 text-success border-0 rounded-3 small p-3 animate-fade-in" role="alert">
                <i className="fa-solid fa-circle-check me-2"></i>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative-position">
              <div className="mb-3">
                <label htmlFor="regUsernameInput" className="form-label">
                  <i className="fa-solid fa-user me-2 text-secondary"></i>Tên đăng nhập
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="regUsernameInput"
                  placeholder="Chọn tên tài khoản..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || !!successMsg}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="regPasswordInput" className="form-label">
                  <i className="fa-solid fa-lock me-2 text-secondary"></i>Mật khẩu
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="regPasswordInput"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !!successMsg}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPasswordInput" className="form-label">
                  <i className="fa-solid fa-circle-check me-2 text-secondary"></i>Xác nhận mật khẩu
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

              <button
                type="submit"
                className="btn btn-primary bg-gradient w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%) !important' }}
                disabled={loading || !!successMsg}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng ký <i className="fa-solid fa-user-plus"></i>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 border-top border-secondary border-opacity-10 pt-4 relative-position">
              <p className="mb-0 text-muted small">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-secondary fw-semibold text-decoration-none hover-underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
