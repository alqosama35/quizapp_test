// Quiz taking component - interactive quiz interface

async function renderQuizTaking() {
    const session = AppState.quizSession;
    if (!session) {
        Router.back();
        return '';
    }

    const quiz = session.quiz;
    const currentQ = session.currentQuestion;
    const question = quiz.jsonData[currentQ];
    const totalQuestions = quiz.jsonData.length;
    const progress = Math.round((currentQ / totalQuestions) * 100);
    const elapsedTime = Math.floor((Date.now() - session.startTime) / 1000);

    const isRevealed = session.instantFeedback && session.revealedAnswers[currentQ];
    const selectedAnswer = session.answers[currentQ];
    const isCorrectAnswer = isRevealed && selectedAnswer === question.correct;

    return `
        <div class="quiz-taking-page">

            <!-- Sticky header -->
            <div class="qt-header">
                <div class="qt-header-inner">
                    <div class="qt-title">${escapeHTML(quiz.name)}</div>
                    <div class="qt-timer" id="quiz-timer">⏱ ${formatTime(elapsedTime)}</div>
                </div>
                <div class="qt-progress-bar">
                    <div class="qt-progress-fill" style="width:${progress}%"></div>
                </div>
                <div class="qt-progress-label">Question ${currentQ + 1} of ${totalQuestions}</div>
            </div>

            <!-- Question card -->
            <div class="qt-question-card">
                <div class="qt-question-meta">
                    <span class="qt-q-chip">Q ${currentQ + 1}</span>
                    <button class="btn btn-text qt-copy-btn" onclick="copyQuestion()" title="Copy question">📋 Copy</button>
                </div>
                <div class="qt-question-text">${renderMath(question.question)}</div>
            </div>

            <!-- Options -->
            <div class="qt-options">
                ${question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOpt = isRevealed && index === question.correct;
                    const isWrongOpt = isRevealed && isSelected && index !== question.correct;

                    let cls = 'qt-option';
                    if (isCorrectOpt)     cls += ' option-feedback-correct';
                    else if (isWrongOpt)  cls += ' option-feedback-wrong';
                    else if (isSelected)  cls += ' selected';
                    if (isRevealed)       cls += ' option-locked';

                    return `
                        <div class="${cls}"
                             ${isRevealed ? '' : `onclick="selectOption(${index})"`}
                             data-index="${index}">
                            <div class="qt-option-key">${String.fromCharCode(65 + index)}</div>
                            <div class="qt-option-label">${renderMath(option)}</div>
                            ${isCorrectOpt ? '<div class="option-tag correct-tag">✓ Correct</div>' : ''}
                            ${isWrongOpt   ? '<div class="option-tag wrong-tag">✗ Wrong</div>'   : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Instant feedback banner -->
            ${isRevealed ? `
                <div class="feedback-banner ${isCorrectAnswer ? 'feedback-correct' : 'feedback-wrong'}">
                    <div class="feedback-icon">${isCorrectAnswer ? '✅' : '❌'}</div>
                    <div class="feedback-body">
                        <div class="feedback-title">${isCorrectAnswer ? 'Correct!' : 'Incorrect'}</div>
                        ${question.explanation ? `<div class="feedback-explanation">💡 ${renderMath(question.explanation)}</div>` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Actions -->
            <div class="qt-actions">
                <button class="btn btn-secondary" onclick="previousQuestion()" ${currentQ === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                ${currentQ < totalQuestions - 1 ? `
                    <button class="btn btn-primary" onclick="nextQuestion()">
                        Next →
                    </button>
                ` : `
                    <button class="btn btn-success btn-lg" onclick="submitQuizConfirm()">
                        ✅ Submit Quiz
                    </button>
                `}
            </div>

            <!-- Question navigator -->
            <div class="qt-nav-strip">
                ${quiz.jsonData.map((_, idx) => {
                    const answered = session.answers[idx] !== null;
                    const revealed = session.revealedAnswers && session.revealedAnswers[idx];
                    const correct  = revealed && session.answers[idx] === quiz.jsonData[idx].correct;
                    const wrong    = revealed && session.answers[idx] !== quiz.jsonData[idx].correct;
                    const current  = idx === currentQ;

                    let dotClass = 'nav-dot';
                    if (correct)       dotClass += ' nav-dot-correct';
                    else if (wrong)    dotClass += ' nav-dot-wrong';
                    else if (answered) dotClass += ' answered';
                    if (current)       dotClass += ' current';

                    return `
                        <div class="${dotClass}" onclick="jumpToQuestion(${idx})" title="Question ${idx + 1}">
                            ${correct ? '✓' : wrong ? '✗' : idx + 1}
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Footer -->
            <div class="qt-footer">
                <button class="btn btn-text" onclick="pauseQuiz()">⏸ Pause</button>
                <div class="qt-footer-divider"></div>
                <button class="btn btn-text" onclick="reviewAllAnswers()">📝 Review (R)</button>
                <div class="qt-footer-divider"></div>
                <button class="btn btn-text feedback-toggle-btn ${session.instantFeedback ? 'feedback-toggle-on' : ''}"
                        onclick="toggleInstantFeedback()"
                        title="Show correct/wrong after each answer">
                    💡 Feedback: <strong>${session.instantFeedback ? 'ON' : 'OFF'}</strong>
                </button>
                <div class="qt-footer-divider"></div>
                <button class="btn btn-text autoscroll-toggle-btn ${session.autoScroll ? 'autoscroll-on' : ''}"
                        onclick="toggleAutoScroll()"
                        title="Automatically go to next question after answering">
                    → Auto-next: <strong>${session.autoScroll ? 'ON' : 'OFF'}</strong>
                </button>
                <div class="keyboard-hints">
                    <span class="hint">1–4 Select</span>
                    <span class="hint">← → Navigate</span>
                    <span class="hint">Enter Next</span>
                    <span class="hint">R Review</span>
                </div>
            </div>

        </div>
    `;
}

async function selectOption(index) {
    const session = AppState.quizSession;
    const currentQ = session.currentQuestion;

    if (session.instantFeedback && session.revealedAnswers[currentQ]) return;

    session.answers[currentQ] = index;

    if (session.instantFeedback) {
        session.revealedAnswers[currentQ] = true;
        applyInstantFeedback(currentQ, index);
    } else {
        const options = document.querySelectorAll('.qt-option');
        options.forEach((opt, idx) => opt.classList.toggle('selected', idx === index));
    }

    const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    await saveQuizProgress({ ...session, elapsedSeconds }, AppState.currentCourse.id);
}

function applyInstantFeedback(questionIdx, selectedIndex) {
    const session = AppState.quizSession;
    const question = session.quiz.jsonData[questionIdx];
    const isCorrect = selectedIndex === question.correct;

    const navDots = document.querySelectorAll('.nav-dot');
    if (navDots[questionIdx]) {
        navDots[questionIdx].classList.remove('answered', 'nav-dot-correct', 'nav-dot-wrong');
        navDots[questionIdx].classList.add(isCorrect ? 'nav-dot-correct' : 'nav-dot-wrong');
        navDots[questionIdx].textContent = isCorrect ? '✓' : '✗';
    }

    render();

    if (AppState.quizSession.autoScroll) {
        const session = AppState.quizSession;
        const totalQuestions = session.quiz.jsonData.length;
        setTimeout(() => {
            if (session.currentQuestion < totalQuestions - 1) {
                nextQuestion();
            } else {
                submitQuizConfirm();
            }
        }, 1000);
    }
}

function toggleAutoScroll() {
    const session = AppState.quizSession;
    session.autoScroll = !session.autoScroll;
    const btn = document.querySelector('.autoscroll-toggle-btn');
    if (btn) {
        btn.classList.toggle('autoscroll-on', session.autoScroll);
        btn.innerHTML = `→ Auto-next: <strong>${session.autoScroll ? 'ON' : 'OFF'}</strong>`;
    }
    showToast(`Auto-next ${session.autoScroll ? 'enabled' : 'disabled'}`, 'info');
}

function toggleInstantFeedback() {
    const session = AppState.quizSession;
    session.instantFeedback = !session.instantFeedback;
    updateSettings({ instantFeedback: session.instantFeedback });
    const btn = document.querySelector('.feedback-toggle-btn');
    if (btn) {
        btn.classList.toggle('feedback-toggle-on', session.instantFeedback);
        btn.innerHTML = `💡 Feedback: <strong>${session.instantFeedback ? 'ON' : 'OFF'}</strong>`;
    }
    showToast(`Instant feedback ${session.instantFeedback ? 'enabled' : 'disabled'}`, 'info');
}

function previousQuestion() {
    const session = AppState.quizSession;
    if (session.currentQuestion > 0) {
        session.currentQuestion--;
        render();
    }
}

function nextQuestion() {
    const session = AppState.quizSession;
    const totalQuestions = session.quiz.jsonData.length;
    if (session.currentQuestion < totalQuestions - 1) {
        session.currentQuestion++;
        render();
    }
}

function jumpToQuestion(index) {
    AppState.quizSession.currentQuestion = index;
    render();
}

async function submitQuizConfirm() {
    const session = AppState.quizSession;
    const unanswered = session.answers.filter(a => a === null).length;

    if (unanswered > 0) {
        const confirmed = await Modal.confirm(
            `You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Submit anyway?`,
            'Unanswered Questions',
            { confirmText: 'Submit Anyway', cancelText: 'Go Back' }
        );
        if (!confirmed) return;
    }

    await submitQuiz();
}

async function submitQuiz() {
    const session = AppState.quizSession;
    const quiz = session.quiz;
    const totalTime = Math.floor((Date.now() - session.startTime) / 1000);

    let score = 0;
    const answers = [];
    const mistakes = [];

    quiz.jsonData.forEach((question, index) => {
        const selectedOption = session.answers[index];
        const isCorrect = selectedOption === question.correct;

        if (selectedOption !== null) {
            answers.push({
                questionIndex: index,
                questionText: question.question,
                selectedOption,
                correctOption: question.correct,
                isCorrect,
                timeTaken: 0
            });

            if (isCorrect) {
                score++;
            } else {
                mistakes.push({
                    courseId: AppState.currentCourse.id,
                    quizId: quiz.id !== 'mistakes-practice' ? quiz.id : null,
                    quizName: quiz.name,
                    question,
                    incorrectAnswer: selectedOption,
                    correctAnswer: question.correct
                });
            }
        }
    });

    trackEvent('quiz_completed', {
        quiz_name: quiz.name,
        course_name: AppState.currentCourse?.name,
        score_percent: Math.round(score / quiz.jsonData.length * 100),
        questions_answered: answers.length,
        total_questions: quiz.jsonData.length,
        time_seconds: totalTime
    });

    const result = await saveResult({
        courseId: AppState.currentCourse.id,
        quizId: quiz.id !== 'mistakes-practice' ? quiz.id : null,
        quizName: quiz.name,
        score,
        totalQuestions: quiz.jsonData.length,
        timeTaken: totalTime,
        answers
    });

    for (const mistake of mistakes) {
        await saveMistake(mistake);
    }

    if (quiz.id !== 'mistakes-practice') {
        await clearQuizProgress(quiz.id);
    }
    AppState.quizResult = { result, quiz, mistakes: mistakes.length };
    Router.navigate('quiz-results');
}

function reviewAllAnswers() {
    if (document.getElementById('review-modal')) return;

    const session = AppState.quizSession;
    const quiz = session.quiz;

    const answeredCount   = session.answers.filter(a => a !== null).length;
    const unansweredCount = session.answers.length - answeredCount;

    let correctCount = 0;
    let wrongCount = 0;
    quiz.jsonData.forEach((q, idx) => {
        if (session.answers[idx] !== null) {
            if (session.answers[idx] === q.correct) correctCount++;
            else wrongCount++;
        }
    });

    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'review-modal';
    modal.onclick = (e) => { if (e.target === modal) closeReviewModal(); };

    modal.innerHTML = `
        <div class="review-content" onclick="event.stopPropagation()">
            <div class="review-header">
                <h2>📝 Review Your Answers</h2>
                <button class="review-close-btn" onclick="closeReviewModal()" title="Close">✕</button>
            </div>
            <p class="review-summary">
                Answered: <strong>${answeredCount} / ${session.answers.length}</strong>
                ${unansweredCount > 0 ? `&nbsp;&nbsp;<span style="color:var(--warning-color)">⚠️ ${unansweredCount} unanswered</span>` : ''}
                ${answeredCount > 0 ? `&nbsp;&nbsp;<span class="review-summary-correct">✓ ${correctCount}</span>&nbsp;&nbsp;<span class="review-summary-wrong">✗ ${wrongCount}</span>` : ''}
            </p>
            <div class="review-list">
                ${quiz.jsonData.map((q, idx) => {
                    const answered   = session.answers[idx] !== null;
                    const isCorrect  = answered && session.answers[idx] === q.correct;
                    const isWrong    = answered && session.answers[idx] !== q.correct;
                    const answerText = answered ? q.options[session.answers[idx]] : 'Not answered';

                    let itemClass = 'review-item';
                    let icon;
                    if (!answered)      { itemClass += ' unanswered'; icon = '<span class="review-status-icon">⚠️</span>'; }
                    else if (isCorrect) { itemClass += ' correct';    icon = '<span class="review-status-icon correct-icon">✓</span>'; }
                    else                { itemClass += ' wrong';      icon = '<span class="review-status-icon wrong-icon">✗</span>'; }

                    return `
                        <div class="${itemClass}"
                             onclick="jumpToQuestion(${idx}); closeReviewModal();">
                            <div class="review-question">
                                <strong>Q${idx + 1}:</strong> ${renderMath(q.question.substring(0, 70))}${q.question.length > 70 ? '…' : ''}
                            </div>
                            <div class="review-answer">
                                ${icon} ${renderMath(answerText)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="review-actions">
                <button class="btn btn-secondary" onclick="closeReviewModal()">Continue Quiz</button>
                <button class="btn btn-success"   onclick="closeReviewModal(); submitQuizConfirm();">✅ Submit Quiz</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.remove();
}

async function pauseQuiz() {
    const confirmed = await Modal.confirm(
        'Leave this quiz? Your progress is saved and you can continue later.',
        'Pause Quiz?',
        { confirmText: 'Leave', cancelText: 'Continue Quiz' }
    );
    if (confirmed) {
        const session = AppState.quizSession;
        const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
        await saveQuizProgress({ ...session, elapsedSeconds }, AppState.currentCourse.id);
        Router.navigate('course-view', { currentCourse: AppState.currentCourse });
    }
}

function copyQuestion() {
    const session = AppState.quizSession;
    const q = session.quiz.jsonData[session.currentQuestion];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const text = [
        `Q${session.currentQuestion + 1}: ${q.question}`,
        '',
        ...q.options.map((opt, i) => `${letters[i]}) ${opt}`)
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('Question copied!', 'success'));
}

function setupSwipeNavigation() {
    let startX = 0, startY = 0, swiping = false;

    document.addEventListener('touchstart', e => {
        if (AppState.currentView !== 'quiz-taking' || !AppState.quizSession) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        swiping = false;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (AppState.currentView !== 'quiz-taking' || !AppState.quizSession) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (!swiping && Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            swiping = true;
        }
        if (swiping) e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', e => {
        if (AppState.currentView !== 'quiz-taking' || !AppState.quizSession || !swiping) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (dx > 50) previousQuestion();
        else if (dx < -50) nextQuestion();
        swiping = false;
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (AppState.currentView !== 'quiz-taking' || !AppState.quizSession) return;

        const session  = AppState.quizSession;
        const currentQ = session.quiz.jsonData[session.currentQuestion];

        if (e.key >= '1' && e.key <= '4') {
            const idx = parseInt(e.key) - 1;
            if (idx < currentQ.options.length) { e.preventDefault(); selectOption(idx); }
        }

        if (e.key === 'ArrowLeft'  && session.currentQuestion > 0)                             { e.preventDefault(); previousQuestion(); }
        if (e.key === 'ArrowRight' && session.currentQuestion < session.quiz.jsonData.length - 1) { e.preventDefault(); nextQuestion(); }

        if (e.key === 'Enter') {
            e.preventDefault();
            session.currentQuestion < session.quiz.jsonData.length - 1 ? nextQuestion() : submitQuizConfirm();
        }

        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reviewAllAnswers(); }
        if (e.key === 'Escape') closeReviewModal();
    });
}

setupKeyboardShortcuts();
setupSwipeNavigation();

setInterval(() => {
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl && AppState.quizSession) {
        const elapsed = Math.floor((Date.now() - AppState.quizSession.startTime) / 1000);
        timerEl.textContent = `⏱ ${formatTime(elapsed)}`;
    }
}, 1000);
