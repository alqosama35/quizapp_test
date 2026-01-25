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
    const progress = Math.round(((currentQ) / totalQuestions) * 100);
    
    // Calculate elapsed time
    const elapsedTime = Math.floor((Date.now() - session.startTime) / 1000);
    
    return `
        <div class="quiz-taking-page">
            <header class="quiz-header">
                <div class="quiz-title">${escapeHTML(quiz.name)}</div>
                <div class="quiz-timer" id="quiz-timer">⏱️ ${formatTime(elapsedTime)}</div>
            </header>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">Question ${currentQ + 1} / ${totalQuestions}</div>
            
            <div class="quiz-content">
                <div class="question-text">
                    <span class="question-number">Question ${currentQ + 1}</span>
                    ${escapeHTML(question.question)}
                </div>
                
                <div class="options-list">
                    ${question.options.map((option, index) => {
                        const isSelected = session.answers[currentQ] === index;
                        return `
                            <div class="option ${isSelected ? 'selected' : ''}" 
                                 onclick="selectOption(${index})"
                                 data-index="${index}">
                                <div class="option-indicator">${String.fromCharCode(65 + index)})</div>
                                <div class="option-text">${escapeHTML(option)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="question-navigator">
                    ${quiz.jsonData.map((_, idx) => {
                        const answered = session.answers[idx] !== null;
                        const current = idx === currentQ;
                        return `
                            <div class="nav-dot ${answered ? 'answered' : ''} ${current ? 'current' : ''}"
                                 onclick="jumpToQuestion(${idx})"
                                 title="Question ${idx + 1}">
                                ${answered ? '✓' : idx + 1}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="quiz-actions">
                    <button class="btn btn-secondary" 
                            onclick="previousQuestion()" 
                            ${currentQ === 0 ? 'disabled' : ''}>
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
                
                <div class="quiz-footer">
                    <button class="btn btn-text" onclick="pauseQuiz()">⏸️ Pause</button>
                    <button class="btn btn-text" onclick="reviewAllAnswers()">📝 Review All (R)</button>
                    <div class="keyboard-hints">
                        <span class="hint">1-4: Select option</span>
                        <span class="hint">←→: Navigate</span>
                        <span class="hint">Enter: Next/Submit</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function selectOption(index) {
    const session = AppState.quizSession;
    session.answers[session.currentQuestion] = index;
    
    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === index);
    });
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
    const session = AppState.quizSession;
    session.currentQuestion = index;
    render();
}

function pauseQuiz() {
    if (confirmDialog('Pause quiz? Your progress will be saved.')) {
        Router.back();
    }
}

async function submitQuizConfirm() {
    const session = AppState.quizSession;
    const unanswered = session.answers.filter(a => a === null).length;
    
    if (unanswered > 0) {
        const confirmed = await Modal.confirm(
            `You have ${unanswered} unanswered question(s). Submit anyway?`,
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
    
    // Calculate score
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
                    question: question,
                    incorrectAnswer: selectedOption,
                    correctAnswer: question.correct
                });
            }
        }
    });
    
    // Save result
    const result = await saveResult({
        courseId: AppState.currentCourse.id,
        quizId: quiz.id !== 'mistakes-practice' ? quiz.id : null,
        quizName: quiz.name,
        score,
        totalQuestions: quiz.jsonData.length,
        timeTaken: totalTime,
        answers
    });
    
    // Save mistakes
    for (const mistake of mistakes) {
        await saveMistake(mistake);
    }
    
    // Store result in session for results page
    AppState.quizResult = {
        result,
        quiz,
        mistakes: mistakes.length
    };
    
    Router.navigate('quiz-results');
}

function reviewAllAnswers() {
    const session = AppState.quizSession;
    const quiz = session.quiz;
    
    const answeredCount = session.answers.filter(a => a !== null).length;
    const unansweredCount = session.answers.length - answeredCount;
    
    let html = `
        <div class="review-modal">
            <div class="review-content">
                <h2>📝 Review Your Answers</h2>
                <p class="review-summary">
                    Answered: ${answeredCount} / ${session.answers.length}
                    ${unansweredCount > 0 ? `<br><span style="color: var(--warning-color);">⚠️ ${unansweredCount} unanswered</span>` : ''}
                </p>
                
                <div class="review-list">
                    ${quiz.jsonData.map((q, idx) => {
                        const answered = session.answers[idx] !== null;
                        const answerText = answered ? q.options[session.answers[idx]] : 'Not answered';
                        return `
                            <div class="review-item ${!answered ? 'unanswered' : ''}" onclick="jumpToQuestion(${idx}); closeReviewModal();">
                                <div class="review-question">
                                    <strong>Q${idx + 1}:</strong> ${escapeHTML(q.question).substring(0, 60)}...
                                </div>
                                <div class="review-answer">
                                    ${answered ? '✓' : '⚠️'} ${escapeHTML(answerText)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="review-actions">
                    <button class="btn btn-secondary" onclick="closeReviewModal()">Continue Editing</button>
                    <button class="btn btn-success" onclick="closeReviewModal(); submitQuizConfirm();">Submit Quiz</button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.remove();
}

async function pauseQuiz() {
    if (!window.Modal) {
        console.error('Modal system not loaded!');
        if (confirm('Pause quiz? Your progress will be saved.')) {
            Router.navigate('course-view', { courseId: AppState.currentCourse.id });
        }
        return;
    }
    
    const confirmed = await Modal.confirm(
        'Your progress will be saved. You can resume later from the course page.',
        'Pause Quiz?',
        { confirmText: 'Pause', cancelText: 'Continue Quiz' }
    );
    if (confirmed) {
        // In a full implementation, we'd save the session to IndexedDB
        // For now, just go back
        Router.navigate('course-view', { courseId: AppState.currentCourse.id });
    }
}

// Keyboard shortcuts for quiz navigation
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts if we're in quiz-taking view
        if (AppState.currentView !== 'quiz-taking' || !AppState.quizSession) return;
        
        const session = AppState.quizSession;
        const currentQ = session.quiz.jsonData[session.currentQuestion];
        
        // Number keys 1-4 for selecting options
        if (e.key >= '1' && e.key <= '4') {
            const optionIndex = parseInt(e.key) - 1;
            if (optionIndex < currentQ.options.length) {
                e.preventDefault();
                selectOption(optionIndex);
            }
        }
        
        // Arrow keys for navigation
        if (e.key === 'ArrowLeft' && session.currentQuestion > 0) {
            e.preventDefault();
            previousQuestion();
        }
        
        if (e.key === 'ArrowRight' && session.currentQuestion < session.quiz.jsonData.length - 1) {
            e.preventDefault();
            nextQuestion();
        }
        
        // Enter to go next or submit
        if (e.key === 'Enter') {
            e.preventDefault();
            if (session.currentQuestion < session.quiz.jsonData.length - 1) {
                nextQuestion();
            } else {
                submitQuizConfirm();
            }
        }
        
        // R for review
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            reviewAllAnswers();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeReviewModal();
        }
    });
}

// Initialize keyboard shortcuts
setupKeyboardShortcuts();

// Update timer every second
setInterval(() => {
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl && AppState.quizSession) {
        const elapsed = Math.floor((Date.now() - AppState.quizSession.startTime) / 1000);
        timerEl.textContent = `⏱️ ${formatTime(elapsed)}`;
    }
}, 1000);
