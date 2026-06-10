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
    <div className="container-fluid animate-fade-in py-2">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
            <i className="fa-solid fa-users-gear me-2" style={{ color: 'var(--primary)' }}></i>
            Quản Lý Người Dùng
          </h2>
          <p className="text-muted mb-0 small mt-1">Xem danh sách và phân quyền Admin cho người dùng trong hệ thống.</p>
        </div>
        <button
          onClick={() => dispatch(fetchAllUsers())}
          className="btn-action btn-action-primary"
          title="Làm mới danh sách"
          disabled={loading}
        >
          <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          className="mb-4 p-3 d-flex align-items-center gap-2 animate-fade-in"
          style={{
            background: feedback.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '12px',
            color: feedback.type === 'success' ? '#10b981' : '#f87171',
          }}
        >
          <i className={`fa-solid ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          {feedback.msg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 animate-fade-in" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', color: '#f87171' }}>
          <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
        </div>
      )}

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.4rem', lineHeight: 1 }}>{users.length}</div>
              <div className="text-muted small mt-1">Tổng số Người dùng</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <i className="fa-solid fa-crown" style={{ color: '#ef4444' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.4rem', lineHeight: 1 }}>{adminCount}</div>
              <div className="text-muted small mt-1">Quản trị viên (Admin)</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <i className="fa-solid fa-user-graduate" style={{ color: '#10b981' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.4rem', lineHeight: 1 }}>{regularCount}</div>
              <div className="text-muted small mt-1">Học viên thường</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="glass-panel p-4">
        {/* Search bar */}
        <div className="mb-4" style={{ maxWidth: '360px' }}>
          <div className="position-relative">
            <i className="fa-solid fa-magnifying-glass position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: '0.85rem', pointerEvents: 'none' }}></i>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo tên người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            <p className="text-muted mt-3">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-user-slash text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-2">
              {searchQuery ? `Không tìm thấy người dùng "${searchQuery}"` : 'Chưa có người dùng nào trong hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table align-middle">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '35%' }}>TÊN ĐĂNG NHẬP</th>
                  <th style={{ width: '20%' }}>VAI TRÒ</th>
                  <th style={{ width: '25%' }}>ID</th>
                  <th style={{ width: '15%' }} className="text-end">PHÂN QUYỀN</th>
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
                              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                              background: u.admin
                                ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(168,85,247,0.3))'
                                : 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.3))',
                              border: `1px solid ${u.admin ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.85rem', fontWeight: 700, color: u.admin ? '#f87171' : 'var(--primary)',
                            }}
                          >
                            {u.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: '#e2e8f0' }}>
                              {u.username}
                              {isSelf && (
                                <span className="ms-2" style={{
                                  fontSize: '0.7rem', background: 'rgba(99,102,241,0.15)',
                                  color: 'var(--primary)', borderRadius: '20px', padding: '2px 8px',
                                  border: '1px solid rgba(99,102,241,0.3)', fontWeight: 500,
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
                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171', borderRadius: '20px', padding: '4px 12px',
                            fontSize: '0.78rem', fontWeight: 600,
                          }}>
                            <i className="fa-solid fa-crown" style={{ fontSize: '0.7rem' }}></i> Admin
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.25)',
                            color: '#94a3b8', borderRadius: '20px', padding: '4px 12px',
                            fontSize: '0.78rem', fontWeight: 500,
                          }}>
                            <i className="fa-solid fa-user" style={{ fontSize: '0.7rem' }}></i> Học viên
                          </span>
                        )}
                      </td>
                      <td>
                        <code style={{ fontSize: '0.72rem', color: '#64748b', background: 'rgba(15,23,42,0.4)', padding: '3px 8px', borderRadius: '6px' }}>
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
                              background: u.admin ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                              border: `1px solid ${u.admin ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                              color: u.admin ? '#f87171' : '#10b981',
                              borderRadius: '10px', padding: '6px 14px',
                              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                              transition: 'all 0.2s', whiteSpace: 'nowrap',
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
  );
};

export default AdminUserPage;
