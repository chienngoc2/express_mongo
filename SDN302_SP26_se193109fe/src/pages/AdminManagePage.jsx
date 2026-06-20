import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchQuizzes,
  fetchMyQuizzes, 
  createQuiz, 
  updateQuiz, 
  deleteQuiz, 
  fetchQuizDetails, 
  clearCurrentQuiz 
} from '../redux/slices/quizSlice';
import { 
  addQuestionToQuiz, 
  updateQuestion, 
  deleteQuestionFromQuiz 
} from '../redux/slices/questionSlice';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const AdminManagePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { quizzes: allQuizzes, myQuizzes, currentQuiz, loading: quizLoading, error: quizError } = useSelector((state) => state.quiz);
  const { loading: questionLoading, error: questionError } = useSelector((state) => state.question);

  const quizzes = user?.admin ? allQuizzes : myQuizzes;

  const [activeTab, setActiveTab] = useState('quizzes');
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Quiz Modal
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizModalMode, setQuizModalMode] = useState('create');
  const [quizForm, setQuizForm] = useState({ id: '', title: '', description: '' });
  const [quizFormError, setQuizFormError] = useState('');

  // Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState('create');
  const [questionForm, setQuestionForm] = useState({
    id: '', text: '', option1: '', option2: '', option3: '', option4: '',
    keywords: '', correctAnswerIndex: 0,
  });
  const [questionFormError, setQuestionFormError] = useState('');

  useEffect(() => {
    if (user?.admin) {
      dispatch(fetchQuizzes());
    } else {
      dispatch(fetchMyQuizzes());
    }
  }, [dispatch, user]);

  // --- QUIZ ACTIONS ---
  const openQuizModal = (mode, quiz = null) => {
    setQuizModalMode(mode);
    setQuizFormError('');
    if (mode === 'edit' && quiz) {
      setQuizForm({ id: quiz._id, title: quiz.title || '', description: quiz.description || '' });
    } else {
      setQuizForm({ id: '', title: '', description: '' });
    }
    setIsQuizModalOpen(true);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setQuizFormError('');
    if (!quizForm.title.trim()) { setQuizFormError('Vui lòng nhập tiêu đề đề thi!'); return; }
    const quizData = { title: quizForm.title.trim(), description: quizForm.description.trim() };
    let resultAction;
    if (quizModalMode === 'create') {
      resultAction = await dispatch(createQuiz(quizData));
    } else {
      resultAction = await dispatch(updateQuiz({ id: quizForm.id, data: quizData }));
    }
    if (createQuiz.fulfilled.match(resultAction) || updateQuiz.fulfilled.match(resultAction)) {
      setIsQuizModalOpen(false);
    } else {
      setQuizFormError(resultAction.payload || 'Có lỗi xảy ra!');
    }
  };

  const handleDeleteQuiz = (id, title) => {
    if (window.confirm(`Xóa đề thi "${title}"? Tất cả câu hỏi liên quan sẽ bị xóa!`)) {
      dispatch(deleteQuiz(id));
    }
  };

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setActiveTab('questions');
    dispatch(fetchQuizDetails(quizId));
  };

  const handleBackToQuizzes = () => {
    setActiveTab('quizzes');
    setSelectedQuizId(null);
    dispatch(clearCurrentQuiz());
  };

  // --- QUESTION ACTIONS ---
  const openQuestionModal = (mode, question = null) => {
    setQuestionModalMode(mode);
    setQuestionFormError('');
    if (mode === 'edit' && question) {
      setQuestionForm({
        id: question._id,
        text: question.text || '',
        option1: question.options?.[0] || '',
        option2: question.options?.[1] || '',
        option3: question.options?.[2] || '',
        option4: question.options?.[3] || '',
        keywords: question.keywords ? question.keywords.join(', ') : '',
        correctAnswerIndex: question.correctAnswerIndex ?? 0,
      });
    } else {
      setQuestionForm({ id: '', text: '', option1: '', option2: '', option3: '', option4: '', keywords: '', correctAnswerIndex: 0 });
    }
    setIsQuestionModalOpen(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setQuestionFormError('');
    if (!questionForm.text.trim()) { setQuestionFormError('Vui lòng nhập nội dung câu hỏi!'); return; }
    if (!questionForm.option1.trim() || !questionForm.option2.trim() || !questionForm.option3.trim() || !questionForm.option4.trim()) {
      setQuestionFormError('Vui lòng nhập đầy đủ cả 4 lựa chọn trả lời!'); return;
    }
    const options = [questionForm.option1.trim(), questionForm.option2.trim(), questionForm.option3.trim(), questionForm.option4.trim()];
    const keywordsArray = questionForm.keywords
      ? questionForm.keywords.split(',').map((kw) => kw.trim()).filter((kw) => kw !== '')
      : [];
    const questionData = { text: questionForm.text.trim(), options, keywords: keywordsArray, correctAnswerIndex: parseInt(questionForm.correctAnswerIndex, 10) };

    let resultAction;
    if (questionModalMode === 'create') {
      resultAction = await dispatch(addQuestionToQuiz({ quizId: selectedQuizId, questionData }));
    } else {
      resultAction = await dispatch(updateQuestion({ id: questionForm.id, quizId: selectedQuizId, questionData }));
    }
    if (addQuestionToQuiz.fulfilled.match(resultAction) || updateQuestion.fulfilled.match(resultAction)) {
      setIsQuestionModalOpen(false);
    } else {
      setQuestionFormError(resultAction.payload || 'Có lỗi xảy ra!');
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      dispatch(deleteQuestionFromQuiz({ quizId: selectedQuizId, questionId }));
    }
  };

  const questions = currentQuiz?.questions || [];
  const selectedQuiz = quizzes.find(q => q._id === selectedQuizId);

  return (
    <div className="container py-4 animate-fade-in">

      {/* ── HEADER BAR ── */}
      <div className="d-flex align-items-center justify-content-between mb-5 mt-2">
        <div className="d-flex align-items-center gap-3">
          {activeTab === 'questions' && (
            <button
              onClick={handleBackToQuizzes}
              className="btn-action btn-action-primary me-2"
              title="Quay lại"
              style={{ border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
          <div>
            <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em' }}>
              {activeTab === 'quizzes' ? (
                <><i className="fa-solid fa-gauge-high me-2 text-primary"></i>{user?.admin ? 'Quản Lý Đề Thi (Hệ Thống)' : 'Đề Thi Của Tôi'}</>
              ) : (
                <>
                  <i className="fa-solid fa-circle-question me-2 text-secondary"></i>
                  {currentQuiz ? currentQuiz.title : (selectedQuiz ? selectedQuiz.title : 'Câu Hỏi')}
                </>
              )}
            </h2>
            <p className="text-muted mb-0 small mt-1">
              {activeTab === 'quizzes' ? (user?.admin ? 'Quản lý toàn bộ bộ đề thi trong hệ thống.' : 'Thêm, sửa đổi và xóa bộ đề thi do bạn tạo.') : 'Quản lý ngân hàng câu hỏi của bộ đề này.'}
            </p>
          </div>
        </div>

        {activeTab === 'quizzes' ? (
          <button onClick={() => openQuizModal('create')} className="btn btn-primary d-flex align-items-center gap-2 btn-magnetic">
            Thêm Đề Thi Mới
            <span className="btn-icon-wrapper">
              <i className="fa-solid fa-plus" style={{ fontSize: '0.8rem' }}></i>
            </span>
          </button>
        ) : (
          <button onClick={() => openQuestionModal('create')} disabled={!currentQuiz} className="btn btn-primary d-flex align-items-center gap-2 btn-magnetic">
            Thêm Câu Hỏi
            <span className="btn-icon-wrapper">
              <i className="fa-solid fa-plus" style={{ fontSize: '0.8rem' }}></i>
            </span>
          </button>
        )}
      </div>

      {/* ── ERROR ALERTS ── */}
      {quizError && (
        <div className="alert mb-4 animate-fade-in" role="alert" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', color: 'var(--danger)' }}>
          <i className="fa-solid fa-circle-exclamation me-2"></i>{quizError}
        </div>
      )}
      {questionError && (
        <div className="alert mb-4 animate-fade-in" role="alert" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', color: 'var(--danger)' }}>
          <i className="fa-solid fa-circle-exclamation me-2"></i>{questionError}
        </div>
      )}

      {/* ══════════════════════════════════════════
          A. QUIZZES TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'quizzes' && (
        <div className="animate-slide-up">
          {/* Stats Row */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(129,140,248,0.12)' }}>
                  <i className="fa-solid fa-book-open" style={{ color: 'var(--primary)' }}></i>
                </div>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{quizzes.length}</div>
                  <div className="text-muted small mt-1">Tổng số Đề Thi</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
                  <i className="fa-solid fa-circle-question" style={{ color: 'var(--success)' }}></i>
                </div>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
                  </div>
                  <div className="text-muted small mt-1">Tổng số Câu Hỏi</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.12)' }}>
                  <i className="fa-solid fa-chart-bar" style={{ color: 'var(--warning)' }}></i>
                </div>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0) / quizzes.length) : 0}
                  </div>
                  <div className="text-muted small mt-1">Câu hỏi TB / Đề</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Table Container with Double Bezel */}
          <div className="bezel-container">
            <div className="bezel-content p-4">
              {quizLoading && quizzes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                  <p className="text-muted mt-3 small">Đang tải danh sách đề thi...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa-solid fa-folder-open text-muted mb-3 animate-pulse" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Chưa có đề thi nào. Hãy bấm <strong>"Thêm Đề Thi Mới"</strong>!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table custom-table align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: '6%' }}>#</th>
                        <th style={{ width: '38%' }}>TIÊU ĐỀ ĐỀ THI</th>
                        <th style={{ width: '26%' }}>MÔ TẢ</th>
                        <th style={{ width: '13%' }}>SỐ CÂU HỎI</th>
                        <th style={{ width: '17%' }} className="text-end">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.map((quiz, idx) => (
                        <tr key={quiz._id}>
                          <td>
                            <span className="text-muted small fw-bold">{idx + 1}</span>
                          </td>
                          <td>
                            <div className="fw-bold text-white" style={{ fontSize: '0.95rem' }}>
                              {quiz.title || <span className="text-muted fst-italic">Chưa có tiêu đề</span>}
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small" style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {quiz.description || <span className="text-muted fst-italic">Không có mô tả</span>}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)',
                              color: 'var(--primary)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600
                            }}>
                              <i className="fa-solid fa-circle-question" style={{ fontSize: '0.65rem' }}></i>
                              {quiz.questions?.length ?? 0} câu
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end align-items-center gap-2">
                              <button
                                onClick={() => handleSelectQuiz(quiz._id)}
                                title="Quản lý câu hỏi"
                                style={{
                                  background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.25)',
                                  color: 'var(--primary)', borderRadius: '10px', padding: '6px 14px',
                                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
                                  alignItems: 'center', gap: '6px', transition: 'all 0.3s ease'
                                }}
                              >
                                <i className="fa-solid fa-list" style={{ fontSize: '0.75rem' }}></i> Câu hỏi
                              </button>
                              <button
                                onClick={() => openQuizModal('edit', quiz)}
                                className="btn-action btn-action-warning"
                                title="Sửa tiêu đề"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                                className="btn-action btn-action-danger"
                                title="Xóa đề thi"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          B. QUESTIONS TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'questions' && (
        <div className="animate-slide-up">
          {/* Quiz Info Banner */}
          {currentQuiz && (
            <div className="mb-4 p-3 d-flex align-items-center gap-3" style={{
              background: 'linear-gradient(135deg, rgba(129,140,248,0.1) 0%, rgba(192,132,252,0.1) 100%)',
              border: '1px solid rgba(129,140,248,0.2)', borderRadius: '14px'
            }}>
              <div className="stat-icon" style={{ background: 'rgba(129,140,248,0.18)', flexShrink: 0 }}>
                <i className="fa-solid fa-book-open" style={{ color: 'var(--primary)' }}></i>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold text-white" style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}>{currentQuiz.title}</div>
                {currentQuiz.description && <div className="text-muted small mt-1">{currentQuiz.description}</div>}
              </div>
              <span style={{
                background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)',
                color: 'var(--primary)', borderRadius: '20px', padding: '5px 14px',
                fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
              }}>
                {questions.length} câu hỏi
              </span>
            </div>
          )}

          {/* Loading */}
          {quizLoading && questions.length === 0 ? (
            <div className="text-center py-5 glass-panel">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              <p className="text-muted mt-3 small">Đang tải câu hỏi...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bezel-container">
              <div className="bezel-content p-5 text-center">
                <i className="fa-solid fa-receipt text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-white mt-3">Đề thi này chưa có câu hỏi nào</h5>
                <p className="text-muted small mb-0">Hãy bấm <strong style={{ color: 'var(--primary)' }}>"Thêm Câu Hỏi"</strong> để bổ sung vào ngân hàng đề.</p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {questions.map((question, index) => {
                const qText = typeof question === 'object' ? (question.text || '') : '';
                const qOptions = typeof question === 'object' ? (question.options || []) : [];
                const qKeywords = typeof question === 'object' ? (question.keywords || []) : [];
                const qCorrect = typeof question === 'object' ? (question.correctAnswerIndex ?? -1) : -1;
                const qId = typeof question === 'object' ? question._id : question;

                return (
                  <div key={qId || index} className="question-card">
                    {/* Question Header */}
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div className="d-flex align-items-start gap-3 flex-grow-1">
                        <div className="question-number-badge mt-1">{index + 1}</div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-white" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                            {qText || <span className="text-muted fst-italic">Nội dung câu hỏi trống</span>}
                          </div>
                          {/* Keywords */}
                          {qKeywords.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-3">
                              {qKeywords.map((kw, kwIdx) => (
                                <span key={kwIdx} className="keyword-chip">
                                  <i className="fa-solid fa-tag me-1" style={{ fontSize: '0.6rem' }}></i>{kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
                        <button
                          onClick={() => openQuestionModal('edit', typeof question === 'object' ? question : null)}
                          className="btn-action btn-action-warning"
                          title="Sửa câu hỏi"
                          disabled={typeof question !== 'object'}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(qId)}
                          className="btn-action btn-action-danger"
                          title="Xóa câu hỏi"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>

                    {/* Answer Options Grid */}
                    {qOptions.length > 0 && (
                      <div className="row g-3 mt-1">
                        {qOptions.map((opt, oIdx) => (
                          <div key={oIdx} className="col-md-6">
                            <div className={`answer-option ${oIdx === qCorrect ? 'correct-answer' : ''}`}>
                              <span className="option-label" style={{
                                width: '22px', height: '22px', fontSize: '0.7rem'
                              }}>{OPTION_LABELS[oIdx] || (oIdx + 1)}</span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {oIdx === qCorrect && (
                                <i className="fa-solid fa-check-circle ms-auto text-success" style={{ fontSize: '0.9rem' }}></i>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: QUIZ CREATE / EDIT ── */}
      {isQuizModalOpen && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content modal-content-glass">
              <div className="modal-header border-bottom border-secondary border-opacity-10 px-4 py-3">
                <h5 className="modal-title fw-bold text-white fs-5">
                  <i className={`fa-solid ${quizModalMode === 'create' ? 'fa-circle-plus' : 'fa-pen-to-square'} me-2 text-primary`}></i>
                  {quizModalMode === 'create' ? 'Tạo Bộ Đề Thi Mới' : 'Cập Nhật Thông Tin Đề Thi'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsQuizModalOpen(false)}></button>
              </div>
              <form onSubmit={handleQuizSubmit}>
                <div className="modal-body p-4">
                  {quizFormError && (
                    <div className="alert mb-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-triangle-exclamation me-2"></i>{quizFormError}
                    </div>
                  )}
                  <div className="mb-4">
                    <label htmlFor="quizTitleInput" className="form-label">Tiêu đề đề thi <span className="text-danger ms-1">*</span></label>
                    <input
                      type="text" id="quizTitleInput" className="form-control"
                      placeholder="VD: Trắc nghiệm Node.js nâng cao"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quizDescInput" className="form-label">Mô tả ngắn</label>
                    <textarea
                      id="quizDescInput" className="form-control" rows="3"
                      placeholder="Mô tả tóm tắt nội dung đề..."
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-10 px-4 py-3">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsQuizModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={quizLoading}>
                    {quizLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : (quizModalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: QUESTION CREATE / EDIT ── */}
      {isQuestionModalOpen && (
        <div className="modal show d-block animate-fade-in" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
            <div className="modal-content modal-content-glass">
              <div className="modal-header border-bottom border-secondary border-opacity-10 px-4 py-3">
                <h5 className="modal-title fw-bold text-white fs-5">
                  <i className={`fa-solid ${questionModalMode === 'create' ? 'fa-circle-plus' : 'fa-pen-to-square'} me-2 text-secondary`}></i>
                  {questionModalMode === 'create' ? 'Thêm Câu Hỏi Mới' : 'Sửa Thông Tin Câu Hỏi'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsQuestionModalOpen(false)}></button>
              </div>
              <form onSubmit={handleQuestionSubmit}>
                <div className="modal-body p-4">
                  {questionFormError && (
                    <div className="alert mb-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-triangle-exclamation me-2"></i>{questionFormError}
                    </div>
                  )}

                  {/* Question text */}
                  <div className="mb-4">
                    <label htmlFor="questionTextInput" className="form-label">
                      Nội dung câu hỏi <span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      id="questionTextInput" className="form-control" rows="3"
                      placeholder="Nhập nội dung câu hỏi..."
                      value={questionForm.text}
                      onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                      autoFocus
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-4">
                    <label className="form-label">Các lựa chọn trả lời <span className="text-danger ms-1">*</span></label>
                    <div className="d-flex flex-column gap-3">
                      {['option1', 'option2', 'option3', 'option4'].map((key, idx) => (
                        <div key={key} className="d-flex align-items-center gap-3">
                          <span className="option-label" style={{
                            width: '28px', height: '28px', fontSize: '0.75rem',
                            background: parseInt(questionForm.correctAnswerIndex) === idx ? 'rgba(52,211,153,0.15)' : 'rgba(129,140,248,0.12)',
                            border: `1px solid ${parseInt(questionForm.correctAnswerIndex) === idx ? 'rgba(52,211,153,0.3)' : 'rgba(129,140,248,0.25)'}`,
                            color: parseInt(questionForm.correctAnswerIndex) === idx ? 'var(--success)' : 'var(--primary)'
                          }}>
                            {OPTION_LABELS[idx]}
                          </span>
                          <input
                            type="text" className="form-control"
                            placeholder={`Phương án ${OPTION_LABELS[idx]}`}
                            value={questionForm[key]}
                            onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row g-4">
                    {/* Correct answer */}
                    <div className="col-md-6">
                      <label htmlFor="correctAnswerSelect" className="form-label">Đáp án đúng</label>
                      <select
                        id="correctAnswerSelect" className="form-select"
                        value={questionForm.correctAnswerIndex}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctAnswerIndex: parseInt(e.target.value, 10) })}
                      >
                        <option value={0}>Lựa chọn A</option>
                        <option value={1}>Lựa chọn B</option>
                        <option value={2}>Lựa chọn C</option>
                        <option value={3}>Lựa chọn D</option>
                      </select>
                    </div>
                    {/* Keywords */}
                    <div className="col-md-6">
                      <label htmlFor="keywordsInput" className="form-label">Từ khóa <span className="text-muted small ms-1">(phân cách bằng dấu phẩy)</span></label>
                      <input
                        type="text" id="keywordsInput" className="form-control"
                        placeholder="VD: nodejs, database"
                        value={questionForm.keywords}
                        onChange={(e) => setQuestionForm({ ...questionForm, keywords: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-10 px-4 py-3">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsQuestionModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={questionLoading}>
                    {questionLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : (questionModalMode === 'create' ? 'Thêm mới' : 'Lưu thay đổi')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagePage;
