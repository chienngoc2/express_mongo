import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes, fetchQuizDetails, clearCurrentQuiz } from '../redux/slices/quizSlice';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { quizzes, currentQuiz, loading, error } = useSelector((state) => state.quiz);
  const { user } = useSelector((state) => state.auth);

  const [activeQuizId, setActiveQuizId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(clearCurrentQuiz());
  }, [dispatch]);

  const handleStartQuiz = async (quizId) => {
    setActiveQuizId(quizId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setScore(0);
    await dispatch(fetchQuizDetails(quizId));
  };

  const handleSelectOption = (optionIndex) => {
    if (quizFinished) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz || !currentQuiz.questions) return;
    let correctCount = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) correctCount++;
    });
    setScore(correctCount);
    setQuizFinished(true);
  };

  const handleQuitQuiz = () => {
    setActiveQuizId(null);
    dispatch(clearCurrentQuiz());
  };

  const getScoreColor = (ratio) => {
    if (ratio >= 0.8) return 'var(--success)';
    if (ratio >= 0.5) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreMessage = (ratio) => {
    if (ratio >= 0.8) return { icon: 'fa-face-laugh-beam', text: 'Xuất sắc! Bạn nắm kiến thức rất vững.', color: 'var(--success)' };
    if (ratio >= 0.5) return { icon: 'fa-face-smile', text: 'Đạt yêu cầu! Tiếp tục ôn tập nhé.', color: 'var(--warning)' };
    return { icon: 'fa-face-frown', text: 'Chưa đạt! Hãy xem lại kiến thức và thử lại.', color: 'var(--danger)' };
  };

  // ── LOADING ──
  if (loading && quizzes.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted small">Đang tải danh sách bài thi...</p>
      </div>
    );
  }

  // ── QUIZ TAKING VIEW ──
  if (activeQuizId && currentQuiz) {
    const questions = currentQuiz.questions || [];
    const hasQuestions = questions.length > 0;
    const currentQuestion = questions[currentQuestionIndex];
    const totalAnswered = Object.keys(selectedAnswers).length;
    const progressPct = hasQuestions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    const ratio = questions.length > 0 ? score / questions.length : 0;

    return (
      <div className="container py-4 animate-slide-up" style={{ maxWidth: '780px' }}>
        {!quizFinished ? (
          /* ── QUESTION SCREEN ── */
          <div className="bezel-container">
            <div className="bezel-content p-4 p-md-5">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="text-muted small mb-1">
                    <i className="fa-solid fa-book-open me-1 text-primary"></i> {currentQuiz.title}
                  </div>
                  <div className="fw-semibold text-primary" style={{ fontSize: '0.9rem' }}>
                    Câu {currentQuestionIndex + 1} / {questions.length}
                    <span className="text-muted ms-2 small">({totalAnswered} đã trả lời)</span>
                  </div>
                </div>
                <button
                  onClick={handleQuitQuiz}
                  className="btn btn-secondary btn-sm px-3 d-flex align-items-center gap-2"
                  style={{ padding: '8px 16px', borderRadius: '10px' }}
                >
                  <i className="fa-solid fa-xmark"></i> Thoát
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px', transition: 'width 0.4s ease',
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  width: `${progressPct}%`
                }}></div>
              </div>

              {!hasQuestions ? (
                <div className="text-center py-5">
                  <i className="fa-solid fa-receipt fs-1 text-muted d-block mb-3"></i>
                  <p className="text-muted">Bài thi này chưa có câu hỏi nào!</p>
                </div>
              ) : (
                <>
                  {/* Question */}
                  <div className="mb-4">
                    <p className="text-muted small mb-2 text-uppercase fw-semibold" style={{ letterSpacing: '0.08em', fontSize: '0.75rem' }}>
                      Câu hỏi {currentQuestionIndex + 1}
                    </p>
                    <h4 className="fw-semibold text-white mb-0" style={{ lineHeight: '1.6', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                      {currentQuestion?.text}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="d-flex flex-column gap-3 mb-5">
                    {currentQuestion?.options?.map((option, idx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <span className="option-label" style={{
                              background: isSelected ? 'rgba(129, 140, 248, 0.25)' : 'rgba(255,255,255,0.06)',
                              border: isSelected ? '1px solid rgba(129, 140, 248, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                              color: isSelected ? 'white' : '#9ca3af',
                              width: '32px',
                              height: '32px'
                            }}>
                              {OPTION_LABELS[idx]}
                            </span>
                            <span style={{ color: isSelected ? 'white' : '#cbd5e1', flex: 1, fontSize: '0.95rem' }}>
                              {option}
                            </span>
                            {isSelected && (
                              <i className="fa-solid fa-circle-check text-primary" style={{ fontSize: '1rem' }}></i>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Keywords */}
                  {currentQuestion?.keywords?.length > 0 && (
                    <div className="mb-4 pb-2">
                      <span style={{ color: '#6b7280', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>
                        <i className="fa-solid fa-tags me-1"></i>Từ khóa:
                      </span>
                      <div className="d-flex flex-wrap gap-2">
                        {currentQuestion.keywords.map((kw, idx) => (
                          <span key={idx} className="keyword-chip">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="btn btn-secondary px-3"
                      style={{ borderRadius: '10px', fontSize: '0.875rem' }}
                    >
                      <i className="fa-solid fa-arrow-left me-2"></i>Câu trước
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="btn btn-primary px-4 btn-magnetic"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                          borderRadius: '10px',
                          fontSize: '0.875rem'
                        }}
                      >
                        Nộp bài
                        <span className="btn-icon-wrapper ms-2">
                          <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.75rem' }}></i>
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                        className="btn btn-primary px-4 btn-magnetic"
                        style={{ borderRadius: '10px', fontSize: '0.875rem' }}
                      >
                        Tiếp theo
                        <span className="btn-icon-wrapper ms-2">
                          <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                        </span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ── RESULT SCREEN ── */
          <div className="bezel-container">
            <div className="bezel-content p-4 p-md-5 text-center animate-fade-in">
              {/* Trophy orb */}
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                margin: '0 auto 24px',
                background: `radial-gradient(circle, ${getScoreColor(ratio)}25 0%, transparent 100%)`,
                border: `2px solid ${getScoreColor(ratio)}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                color: getScoreColor(ratio),
                boxShadow: `0 10px 25px -5px ${getScoreColor(ratio)}20`
              }}>
                <i className="fa-solid fa-trophy animate-bounce"></i>
              </div>

              <h3 className="fw-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>Kết Quả Bài Thi</h3>
              <p style={{ color: '#9ca3af' }} className="mb-4 small">
                <i className="fa-solid fa-book-open me-1 text-primary"></i>
                {currentQuiz.title}
              </p>

              {/* Score card grid */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px',
                padding: '24px 32px', borderRadius: '16px',
                background: 'rgba(3, 7, 18, 0.4)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: '2.8rem', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {score}<span style={{ color: '#4b5563', fontSize: '1.6rem' }}>/{questions.length}</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '8px' }}>Số câu đúng</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
                <div>
                  <div className="fw-bold" style={{ fontSize: '2.8rem', lineHeight: 1, color: getScoreColor(ratio), letterSpacing: '-0.03em' }}>
                    {Math.round(ratio * 100)}%
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '8px' }}>Điểm phần trăm</div>
                </div>
              </div>

              {/* Feedback text */}
              {(() => {
                const msg = getScoreMessage(ratio);
                return (
                  <p className="fw-semibold mb-5" style={{ color: msg.color, fontSize: '1.05rem' }}>
                    <i className={`fa-solid ${msg.icon} me-2`}></i>{msg.text}
                  </p>
                );
              })()}

              {/* Actions */}
              <div className="d-flex justify-content-center gap-3">
                <button
                  onClick={() => handleStartQuiz(currentQuiz._id)}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '12px 24px' }}
                >
                  <i className="fa-solid fa-rotate-left me-2"></i>Làm lại
                </button>
                <button
                  onClick={handleQuitQuiz}
                  className="btn btn-secondary"
                  style={{ borderRadius: '12px', padding: '12px 24px' }}
                >
                  <i className="fa-solid fa-house me-2"></i>Về trang chủ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── QUIZ LIST VIEW ──
  return (
    <div className="container py-4 animate-slide-up">
      {/* Welcome Header */}
      <div className="mb-5 mt-2">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0,
            boxShadow: '0 8px 24px rgba(129, 140, 248, 0.35)',
          }}>
            <i className="fa-solid fa-graduation-cap text-white"></i>
          </div>
          <div>
            <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.7rem', letterSpacing: '-0.03em' }}>
              Xin chào, <span style={{ color: 'var(--primary)' }}>{user?.username || 'Học viên'}</span>! 👋
            </h2>
            <p className="small text-muted mb-0 mt-1">
              Chọn một bộ đề thi bên dưới để bắt đầu rèn luyện kỹ năng của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon animate-pulse" style={{ background: 'rgba(129,140,248,0.12)' }}>
              <i className="fa-solid fa-book-open" style={{ color: 'var(--primary)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{quizzes.length}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '6px' }}>Đề thi hiện có</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <i className="fa-solid fa-circle-question" style={{ color: 'var(--success)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '6px' }}>Tổng số câu hỏi</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <i className="fa-solid fa-fire-flame-curved" style={{ color: 'var(--warning)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {quizzes.filter(q => (q.questions?.length || 0) > 0).length}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '6px' }}>Đề có sẵn câu hỏi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error messages */}
      {error && (
        <div className="mb-4 p-3 animate-fade-in" style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '12px', color: 'var(--danger)',
        }}>
          <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
        </div>
      )}

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="glass-panel text-center py-5 my-4">
          <i className="fa-solid fa-receipt d-block mb-3 text-muted" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-white mt-3">Chưa có đề thi nào</h5>
          <p style={{ color: '#6b7280' }}>Hiện tại hệ thống chưa có bộ đề thi. Vui lòng quay lại sau!</p>
        </div>
      ) : (
        <div className="row g-4">
          {quizzes.map((quiz, idx) => {
            const questionCount = quiz.questions?.length || 0;
            const hasQuestions = questionCount > 0;
            
            // Subtle theme accents
            const gradients = [
              ['rgba(129,140,248,0.15)', 'rgba(192,132,252,0.1)'],
              ['rgba(52,211,153,0.15)', 'rgba(129,140,248,0.1)'],
              ['rgba(251,191,36,0.15)', 'rgba(248,113,113,0.1)'],
              ['rgba(192,132,252,0.15)', 'rgba(52,211,153,0.1)'],
            ];
            const [g1, g2] = gradients[idx % gradients.length];
            const iconColors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--secondary)'];
            const iconColor = iconColors[idx % iconColors.length];

            return (
              <div key={quiz._id} className="col-md-6 col-lg-4">
                <div style={{
                  background: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '18px',
                  padding: '26px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = `${iconColor}44`;
                    e.currentTarget.style.boxShadow = `0 15px 35px rgba(0,0,0,0.3), 0 0 20px ${iconColor}10`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Subtle top corner gradient mesh */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '120px', height: '120px',
                    background: `radial-gradient(circle at top right, ${g1} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}></div>

                  {/* Header: Icon & count */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${g1}, ${g2})`,
                      border: `1px solid ${iconColor}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.15rem', flexShrink: 0,
                    }}>
                      <i className="fa-solid fa-scroll" style={{ color: iconColor }}></i>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: hasQuestions ? `${iconColor}15` : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${hasQuestions ? iconColor + '30' : 'rgba(255,255,255,0.1)'}`,
                      color: hasQuestions ? iconColor : '#9ca3af',
                      borderRadius: '20px', padding: '4px 12px',
                      fontSize: '0.8rem', fontWeight: 600,
                    }}>
                      <i className="fa-solid fa-circle-question" style={{ fontSize: '0.7rem' }}></i>
                      {questionCount} câu
                    </div>
                  </div>

                  {/* Details */}
                  <h5 className="fw-bold text-white mb-2" style={{
                    fontSize: '1.1rem', letterSpacing: '-0.02em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {quiz.title || <span style={{ color: '#4b5563', fontStyle: 'italic' }}>Chưa có tiêu đề</span>}
                  </h5>

                  <p className="small mb-4" style={{
                    color: '#9ca3af', lineHeight: '1.6',
                    flexGrow: 1,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    minHeight: '58px',
                  }}>
                    {quiz.description || 'Chưa có mô tả chi tiết cho bộ đề thi này. Nhấn bắt đầu để khám phá các câu hỏi ngay!'}
                  </p>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>

                  {/* Actions */}
                  <button
                    onClick={() => handleStartQuiz(quiz._id)}
                    className={`w-100 btn-magnetic ${hasQuestions ? 'btn btn-primary' : 'btn btn-secondary text-muted'}`}
                    style={{ borderRadius: '12px', padding: '12px' }}
                    disabled={!hasQuestions}
                  >
                    {hasQuestions ? (
                      <>
                        Bắt đầu làm bài
                        <span className="btn-icon-wrapper ms-2">
                          <i className="fa-solid fa-play" style={{ fontSize: '0.75rem' }}></i>
                        </span>
                      </>
                    ) : (
                      <>
                        Chưa có câu hỏi
                        <span className="btn-icon-wrapper ms-2">
                          <i className="fa-solid fa-lock" style={{ fontSize: '0.75rem' }}></i>
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
