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
    if (ratio >= 0.8) return '#10b981';
    if (ratio >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreMessage = (ratio) => {
    if (ratio >= 0.8) return { icon: 'fa-face-laugh-beam', text: 'Xuất sắc! Bạn nắm kiến thức rất vững.', color: '#10b981' };
    if (ratio >= 0.5) return { icon: 'fa-face-smile', text: 'Đạt yêu cầu! Tiếp tục ôn tập nhé.', color: '#f59e0b' };
    return { icon: 'fa-face-frown', text: 'Chưa đạt! Hãy xem lại kiến thức và thử lại.', color: '#ef4444' };
  };

  // ── LOADING ──
  if (loading && quizzes.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Đang tải danh sách bài thi...</p>
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
      <div className="container py-4 animate-slide-up" style={{ maxWidth: '760px' }}>

        {!quizFinished ? (
          /* ── QUESTION SCREEN ── */
          <div className="glass-panel p-4 p-md-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <div className="text-muted small mb-1">
                  <i className="fa-solid fa-book-open me-1"></i> {currentQuiz.title}
                </div>
                <div className="fw-semibold" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                  Câu {currentQuestionIndex + 1} / {questions.length}
                  <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>({totalAnswered} đã trả lời)</span>
                </div>
              </div>
              <button
                onClick={handleQuitQuiz}
                style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171', borderRadius: '10px', padding: '6px 14px',
                  fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <i className="fa-solid fa-xmark"></i> Thoát
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: '28px', overflow: 'hidden' }}>
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
                  <p className="text-muted small mb-2 text-uppercase fw-semibold" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    Câu hỏi {currentQuestionIndex + 1}
                  </p>
                  <h5 className="fw-semibold text-white mb-0" style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>
                    {currentQuestion?.text}
                  </h5>
                </div>

                {/* Options */}
                <div className="d-flex flex-column gap-2 mb-5">
                  {currentQuestion?.options?.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '14px 18px', borderRadius: '12px', cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)'
                            : 'rgba(30,41,59,0.4)',
                          border: isSelected
                            ? '1px solid rgba(99,102,241,0.5)'
                            : '1px solid rgba(255,255,255,0.07)',
                          boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
                        }}
                      >
                        <span style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700,
                          background: isSelected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                          border: isSelected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? 'white' : '#94a3b8',
                        }}>
                          {OPTION_LABELS[idx]}
                        </span>
                        <span style={{ color: isSelected ? 'white' : '#cbd5e1', flex: 1, fontSize: '0.95rem' }}>
                          {option}
                        </span>
                        {isSelected && (
                          <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Keywords */}
                {currentQuestion?.keywords?.length > 0 && (
                  <div className="mb-4 pb-2">
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>
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
                    style={{
                      background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                      color: currentQuestionIndex === 0 ? '#475569' : '#e2e8f0',
                      borderRadius: '10px', padding: '9px 18px', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500,
                    }}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Câu trước
                  </button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none', color: 'white', borderRadius: '10px',
                        padding: '9px 24px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.875rem', fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                      }}
                    >
                      Nộp bài <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      style={{
                        background: selectedAnswers[currentQuestionIndex] !== undefined
                          ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                          : 'rgba(30,41,59,0.6)',
                        border: selectedAnswers[currentQuestionIndex] !== undefined ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedAnswers[currentQuestionIndex] !== undefined ? 'white' : '#475569',
                        borderRadius: '10px', padding: '9px 18px',
                        cursor: selectedAnswers[currentQuestionIndex] !== undefined ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.875rem', fontWeight: 600,
                        boxShadow: selectedAnswers[currentQuestionIndex] !== undefined ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
                      }}
                    >
                      Tiếp theo <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── RESULT SCREEN ── */
          <div className="glass-panel p-4 p-md-5 text-center animate-fade-in">
            {/* Trophy */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px',
              background: `radial-gradient(circle, ${getScoreColor(ratio)}33 0%, ${getScoreColor(ratio)}11 100%)`,
              border: `2px solid ${getScoreColor(ratio)}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', color: getScoreColor(ratio),
            }}>
              <i className="fa-solid fa-trophy"></i>
            </div>

            <h3 className="fw-bold text-white mb-1">Kết Quả Bài Thi</h3>
            <p style={{ color: '#94a3b8' }} className="mb-4">
              <i className="fa-solid fa-book-open me-1" style={{ color: 'var(--primary)' }}></i>
              {currentQuiz.title}
            </p>

            {/* Score display */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '28px',
              padding: '24px', borderRadius: '16px',
              background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div>
                <div className="fw-bold text-white" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                  {score}<span style={{ color: '#64748b', fontSize: '1.5rem' }}>/{questions.length}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px' }}>Số câu đúng</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }}></div>
              <div>
                <div className="fw-bold" style={{ fontSize: '2.5rem', lineHeight: 1, color: getScoreColor(ratio) }}>
                  {Math.round(ratio * 100)}%
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px' }}>Điểm phần trăm</div>
              </div>
            </div>

            {/* Message */}
            {(() => {
              const msg = getScoreMessage(ratio);
              return (
                <p className="fw-semibold mb-4" style={{ color: msg.color, fontSize: '1rem' }}>
                  <i className={`fa-solid ${msg.icon} me-2`}></i>{msg.text}
                </p>
              );
            })()}

            {/* Actions */}
            <div className="d-flex justify-content-center gap-3">
              <button
                onClick={() => handleStartQuiz(currentQuiz._id)}
                className="btn btn-primary"
                style={{ borderRadius: '10px', padding: '10px 22px' }}
              >
                <i className="fa-solid fa-rotate-left me-2"></i>Làm lại
              </button>
              <button
                onClick={handleQuitQuiz}
                style={{
                  background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', borderRadius: '10px', padding: '10px 22px',
                  cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                }}
              >
                <i className="fa-solid fa-house me-2"></i>Về trang chủ
              </button>
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
      <div className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', flexShrink: 0,
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}>
            <i className="fa-solid fa-graduation-cap text-white"></i>
          </div>
          <div>
            <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em' }}>
              Xin chào, <span style={{ color: 'var(--primary)' }}>{user?.username || 'Học viên'}</span>! 👋
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: 0, fontSize: '0.9rem' }}>
              Chọn một bộ đề thi bên dưới để kiểm tra và củng cố kiến thức của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <i className="fa-solid fa-book-open" style={{ color: 'var(--primary)' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{quizzes.length}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>Đề thi hiện có</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <i className="fa-solid fa-circle-question" style={{ color: '#10b981' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>Tổng câu hỏi</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <i className="fa-solid fa-fire-flame-curved" style={{ color: '#f59e0b' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                {quizzes.filter(q => (q.questions?.length || 0) > 0).length}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>Đề có sẵn câu hỏi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 animate-fade-in" style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px', color: '#f87171',
        }}>
          <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
        </div>
      )}

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="glass-panel text-center py-5 my-4">
          <i className="fa-solid fa-receipt d-block mb-3 text-muted" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-white mt-3">Chưa có đề thi nào</h5>
          <p style={{ color: '#64748b' }}>Hiện tại hệ thống chưa có bộ đề thi. Vui lòng quay lại sau!</p>
        </div>
      ) : (
        <div className="row g-4">
          {quizzes.map((quiz, idx) => {
            const questionCount = quiz.questions?.length || 0;
            const hasQuestions = questionCount > 0;
            // Gradient colors cycling
            const gradients = [
              ['rgba(99,102,241,0.2)', 'rgba(168,85,247,0.15)'],
              ['rgba(16,185,129,0.2)', 'rgba(99,102,241,0.15)'],
              ['rgba(245,158,11,0.2)', 'rgba(239,68,68,0.15)'],
              ['rgba(168,85,247,0.2)', 'rgba(16,185,129,0.15)'],
            ];
            const [g1, g2] = gradients[idx % gradients.length];
            const iconColors = ['var(--primary)', '#10b981', '#f59e0b', 'var(--secondary)'];
            const iconColor = iconColors[idx % iconColors.length];

            return (
              <div key={quiz._id} className="col-md-6 col-lg-4">
                <div style={{
                  background: 'rgba(30,41,59,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = `${iconColor}44`;
                    e.currentTarget.style.boxShadow = `0 12px 35px rgba(0,0,0,0.25)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Gradient accent top-right */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '120px', height: '120px', borderRadius: '0 18px 0 0',
                    background: `radial-gradient(circle at top right, ${g1} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}></div>

                  {/* Card icon + question count */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${g1}, ${g2})`,
                      border: `1px solid ${iconColor}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', flexShrink: 0,
                    }}>
                      <i className="fa-solid fa-scroll" style={{ color: iconColor }}></i>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: hasQuestions ? `${iconColor}18` : 'rgba(100,116,139,0.15)',
                      border: `1px solid ${hasQuestions ? iconColor + '33' : 'rgba(100,116,139,0.25)'}`,
                      color: hasQuestions ? iconColor : '#64748b',
                      borderRadius: '20px', padding: '4px 12px',
                      fontSize: '0.8rem', fontWeight: 600,
                    }}>
                      <i className="fa-solid fa-circle-question" style={{ fontSize: '0.7rem' }}></i>
                      {questionCount} câu
                    </div>
                  </div>

                  {/* Title */}
                  <h5 className="fw-bold text-white mb-2" style={{
                    fontSize: '1.05rem', letterSpacing: '-0.02em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {quiz.title || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có tiêu đề</span>}
                  </h5>

                  {/* Description */}
                  <p style={{
                    color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.55',
                    flexGrow: 1, marginBottom: '20px',
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    minHeight: '60px',
                  }}>
                    {quiz.description || 'Chưa có mô tả. Hãy bắt đầu làm bài để khám phá nội dung đề thi này!'}
                  </p>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }}></div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleStartQuiz(quiz._id)}
                    style={{
                      width: '100%',
                      background: hasQuestions
                        ? `linear-gradient(135deg, var(--primary), var(--secondary))`
                        : 'rgba(30,41,59,0.6)',
                      border: hasQuestions ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      color: hasQuestions ? 'white' : '#64748b',
                      borderRadius: '12px', padding: '12px',
                      cursor: hasQuestions ? 'pointer' : 'not-allowed',
                      fontSize: '0.9rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: hasQuestions ? '0 4px 15px rgba(99,102,241,0.25)' : 'none',
                    }}
                    disabled={!hasQuestions}
                  >
                    {hasQuestions ? (
                      <><i className="fa-solid fa-play" style={{ fontSize: '0.8rem' }}></i> Bắt đầu làm bài</>
                    ) : (
                      <><i className="fa-solid fa-lock" style={{ fontSize: '0.8rem' }}></i> Chưa có câu hỏi</>
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
