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
                </div>
                <div class="qt-question-text">${escapeHTML(question.question)}</div>
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
                            <div class="qt-option-label">${escapeHTML(option)}</div>
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
                        ${question.explanation ? `<div class="feedback-explanation">💡 ${escapeHTML(question.explanation)}</div>` : ''}
                    </div>
                </div>
            ` : ''}

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

function selectOption(index) {
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

    AppState.quizResult = { result, quiz, mistakes: mistakes.length };
    Router.navigate('quiz-results');
}

function reviewAllAnswers() {
    if (document.getElementById('review-modal')) return;

    const session = AppState.quizSession;
    const quiz = session.quiz;

    const answeredCount   = session.answers.filter(a => a !== null).length;
    const unansweredCount = session.answers.length - answeredCount;

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
            </p>
            <div class="review-list">
                ${quiz.jsonData.map((q, idx) => {
                    const answered = session.answers[idx] !== null;
                    const answerText = answered ? q.options[session.answers[idx]] : 'Not answered';
                    return `
                        <div class="review-item ${!answered ? 'unanswered' : ''}"
                             onclick="jumpToQuestion(${idx}); closeReviewModal();">
                            <div class="review-question">
                                <strong>Q${idx + 1}:</strong> ${escapeHTML(q.question.substring(0, 70))}${q.question.length > 70 ? '…' : ''}
                            </div>
                            <div class="review-answer">
                                ${answered ? '✓' : '⚠️'} ${escapeHTML(answerText)}
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
        'Your current progress will be lost. Return to the course page?',
        'Pause Quiz?',
        { confirmText: 'Leave', cancelText: 'Continue Quiz' }
    );
    if (confirmed) Router.navigate('course-view', { currentCourse: AppState.currentCourse });
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

setInterval(() => {
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl && AppState.quizSession) {
        const elapsed = Math.floor((Date.now() - AppState.quizSession.startTime) / 1000);
        timerEl.textContent = `⏱ ${formatTime(elapsed)}`;
    }
}, 1000);
