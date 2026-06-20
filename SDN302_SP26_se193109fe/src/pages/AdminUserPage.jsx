import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleAdminStatus } from '../redux/slices/userSlice';

const AdminUserPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleAdmin = async (userId, currentAdminStatus, username) => {
    const newStatus = !currentAdminStatus;
    const confirmMsg = newStatus
      ? `Cấp quyền Admin cho "${username}"?`
      : `Thu hồi quyền Admin của "${username}"?`;
    if (!window.confirm(confirmMsg)) return;

    setTogglingId(userId);
    setFeedback(null);
    const result = await dispatch(toggleAdminStatus({ userId, adminStatus: newStatus }));
    setTogglingId(null);

    if (toggleAdminStatus.fulfilled.match(result)) {
      setFeedback({ type: 'success', msg: `Đã ${newStatus ? 'cấp' : 'thu hồi'} quyền Admin cho "${username}".` });
    } else {
      setFeedback({ type: 'error', msg: result.payload || 'Có lỗi xảy ra!' });
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.admin).length;
  const regularCount = users.length - adminCount;

  return (
    <div className="container py-4 animate-fade-in">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-5 mt-2">
        <div>
          <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em' }}>
            <i className="fa-solid fa-users-gear me-2 text-primary"></i>
            Quản Lý Người Dùng
          </h2>
          <p className="text-muted mb-0 small mt-1">Xem danh sách và phân quyền Admin cho người dùng trong hệ thống.</p>
        </div>
        <button
          onClick={() => dispatch(fetchAllUsers())}
          className="btn-action btn-action-primary"
          title="Làm mới danh sách"
          disabled={loading}
          style={{ width: '42px', height: '42px', borderRadius: '12px' }}
        >
          <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`} style={{ fontSize: '1rem' }}></i>
        </button>
      </div>

      {/* Feedback alerts */}
      {feedback && (
        <div
          className="mb-4 p-3 d-flex align-items-center gap-3 animate-fade-in"
          style={{
            background: feedback.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
            borderRadius: '12px',
            color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)',
          }}
        >
          <i className={`fa-solid ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          <span className="small fw-semibold">{feedback.msg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 animate-fade-in" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', color: 'var(--danger)' }}>
          <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
        </div>
      )}

      {/* Stats Row */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(129,140,248,0.12)' }}>
              <i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{users.length}</div>
              <div className="text-muted small mt-1">Tổng số Người dùng</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(248,113,113,0.12)' }}>
              <i className="fa-solid fa-crown" style={{ color: 'var(--danger)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{adminCount}</div>
              <div className="text-muted small mt-1">Quản trị viên (Admin)</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <i className="fa-solid fa-user-graduate" style={{ color: 'var(--success)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{regularCount}</div>
              <div className="text-muted small mt-1">Học viên thường</div>
            </div>
          </div>
        </div>
      </div>

      {/* Double Bezel Card Wrapper */}
      <div className="bezel-container">
        <div className="bezel-content p-4">
          {/* Search bar */}
          <div className="mb-4" style={{ maxWidth: '380px' }}>
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', pointerEvents: 'none' }}></i>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px !important' }}
              />
            </div>
          </div>

          {loading && users.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              <p className="text-muted mt-3 small">Đang tải danh sách người dùng...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa-solid fa-user-slash text-muted mb-3 animate-pulse" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-2 small">
                {searchQuery ? `Không tìm thấy người dùng "${searchQuery}"` : 'Chưa có người dùng nào trong hệ thống.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table custom-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '6%' }}>#</th>
                    <th style={{ width: '38%' }}>TÊN ĐĂNG NHẬP</th>
                    <th style={{ width: '22%' }}>VAI TRÒ</th>
                    <th style={{ width: '20%' }}>MÃ ID</th>
                    <th style={{ width: '14%' }} className="text-end">PHÂN QUYỀN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => {
                    const isSelf = currentUser?._id === u._id;
                    const isToggling = togglingId === u._id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <span className="text-muted small fw-bold">{idx + 1}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              style={{
                                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                background: u.admin
                                  ? 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(192,132,252,0.2))'
                                  : 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(52,211,153,0.2))',
                                border: `1px solid ${u.admin ? 'rgba(248,113,113,0.35)' : 'rgba(129,140,248,0.25)'}`,
                                display: 'flex', alignItems: 'center', justify: 'center',
                                fontSize: '0.9rem', fontWeight: 700, color: u.admin ? 'var(--danger)' : 'var(--primary)',
                              }}
                            >
                              {u.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="fw-bold" style={{ color: '#f3f4f6', fontSize: '0.95rem' }}>
                                {u.username}
                                {isSelf && (
                                  <span className="ms-2" style={{
                                    fontSize: '0.68rem', background: 'rgba(129,140,248,0.15)',
                                    color: 'var(--primary)', borderRadius: '20px', padding: '2px 8px',
                                    border: '1px solid rgba(129,140,248,0.3)', fontWeight: 500,
                                  }}>Bạn</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {u.admin ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
                              color: 'var(--danger)', borderRadius: '20px', padding: '4px 12px',
                              fontSize: '0.78rem', fontWeight: 600,
                            }}>
                              <i className="fa-solid fa-crown" style={{ fontSize: '0.65rem' }}></i> Admin
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              background: 'rgba(156,163,175,0.12)', border: '1px solid rgba(156,163,175,0.25)',
                              color: '#9ca3af', borderRadius: '20px', padding: '4px 12px',
                              fontSize: '0.78rem', fontWeight: 500,
                            }}>
                              <i className="fa-solid fa-user" style={{ fontSize: '0.65rem' }}></i> Học viên
                            </span>
                          )}
                        </td>
                        <td>
                          <code style={{ fontSize: '0.72rem', color: '#cbd5e1', background: 'rgba(3,7,18,0.4)', padding: '3px 8px', borderRadius: '6px' }}>
                            {u._id}
                          </code>
                        </td>
                        <td className="text-end">
                          {isSelf ? (
                            <span className="text-muted small fst-italic">—</span>
                          ) : (
                            <button
                              onClick={() => handleToggleAdmin(u._id, u.admin, u.username)}
                              disabled={isToggling}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: u.admin ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)',
                                border: `1px solid ${u.admin ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)'}`,
                                color: u.admin ? 'var(--danger)' : 'var(--success)',
                                borderRadius: '10px', padding: '6px 14px',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.3s ease', whiteSpace: 'nowrap',
                              }}
                            >
                              {isToggling ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className={`fa-solid ${u.admin ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                              )}
                              {u.admin ? 'Thu hồi Admin' : 'Cấp Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserPage;
