// Quiz results component - shows quiz results with detailed breakdown

async function renderQuizResults() {
    const data = AppState.quizResult;
    if (!data) { Router.back(); return ''; }

    const { result, quiz, mistakes } = data;
    const percentage  = result.percentage;
    const scoreColor  = getScoreColor(percentage);
    const message     = getMotivationalMessage(percentage);

    const settings = await getSettings();
    if (percentage === 100 && settings.confetti !== false) {
        setTimeout(showConfetti, 300);
    }

    const allResults = quiz.id !== 'mistakes-practice'
        ? await getResultsForQuiz(quiz.id)
        : [];
    const previousBest = allResults.length > 1
        ? Math.max(...allResults.slice(0, -1).map(r => r.percentage))
        : 0;
    const improvement = previousBest > 0 ? percentage - previousBest : null;

    const wrongAnswers = result.answers.filter(a => !a.isCorrect);

    return `
        <div class="quiz-results-page">

            <!-- Header -->
            <div class="qr-header">
                <h1>${percentage === 100 ? '🎊' : percentage >= 70 ? '🎉' : '📊'} Quiz Complete!</h1>
            </div>

            <!-- Score hero -->
            <div class="qr-hero">
                <div class="score-circle" style="border-color:${scoreColor}">
                    <div class="score-value" style="color:${scoreColor}">${result.score}/${result.totalQuestions}</div>
                    <div class="score-percentage">${percentage}%</div>
                </div>
                <div class="score-stars">${'⭐'.repeat(Math.min(4, Math.floor(percentage / 25)))}</div>
                <div class="motivational-message">${message}</div>
            </div>

            <!-- Stats strip -->
            <div class="qr-stats-strip">
                <div class="qr-stat">
                    <div class="qr-stat-icon">✅</div>
                    <div class="qr-stat-value" style="color:var(--success-color)">${result.score}</div>
                    <div class="qr-stat-label">Correct</div>
                </div>
                <div class="qr-stat">
                    <div class="qr-stat-icon">❌</div>
                    <div class="qr-stat-value" style="color:var(--danger-color)">${result.totalQuestions - result.score}</div>
                    <div class="qr-stat-label">Wrong</div>
                </div>
                <div class="qr-stat">
                    <div class="qr-stat-icon">⏱</div>
                    <div class="qr-stat-value">${formatDuration(result.timeTaken)}</div>
                    <div class="qr-stat-label">Time</div>
                </div>
                <div class="qr-stat">
                    <div class="qr-stat-icon">${improvement !== null ? (improvement >= 0 ? '📈' : '📉') : '🆕'}</div>
                    <div class="qr-stat-value" style="color:${improvement !== null ? (improvement >= 0 ? 'var(--success-color)' : 'var(--danger-color)') : 'var(--text-muted)'}">
                        ${improvement !== null ? `${improvement >= 0 ? '+' : ''}${improvement}%` : '—'}
                    </div>
                    <div class="qr-stat-label">vs. Best</div>
                </div>
            </div>

            <!-- Wrong answers section -->
            ${wrongAnswers.length > 0 ? `
                <div class="qr-section">
                    <div class="qr-section-title">❌ Wrong Answers (${wrongAnswers.length})</div>
                    ${wrongAnswers.map(a => {
                        const question = quiz.jsonData[a.questionIndex];
                        return `
                            <div class="wrong-question">
                                <div class="wrong-q-title">
                                    <strong>Q${a.questionIndex + 1}:</strong> ${escapeHTML(question.question)}
                                </div>
                                <div class="result-options-list">
                                    ${question.options.map((opt, optIdx) => {
                                        const isCorrect   = optIdx === a.correctOption;
                                        const isUserWrong = optIdx === a.selectedOption && !isCorrect;
                                        return `
                                            <div class="result-option ${isCorrect ? 'result-option-correct' : ''} ${isUserWrong ? 'result-option-wrong' : ''}">
                                                <span class="result-option-letter">${String.fromCharCode(65 + optIdx)}</span>
                                                <span class="result-option-text">${escapeHTML(opt)}</span>
                                                ${isCorrect   ? '<span class="result-badge correct-badge">✓ Correct</span>'      : ''}
                                                ${isUserWrong ? '<span class="result-badge wrong-badge">✗ Your answer</span>' : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                ${question.explanation ? `
                                    <div class="explanation">💡 ${escapeHTML(question.explanation)}</div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="qr-section" style="text-align:center;padding:28px">
                    <div style="font-size:2.5rem;margin-bottom:8px">🏆</div>
                    <div style="font-weight:700;font-size:1.1rem;color:var(--success-color)">Perfect Score!</div>
                    <div style="color:var(--text-muted);font-size:14px;margin-top:4px">You got every question right.</div>
                </div>
            `}

            <!-- Full review collapsible -->
            <div class="qr-section full-review-section">
                <button class="full-review-toggle" onclick="toggleFullReview(this)">
                    📋 Review All Answers <span class="toggle-arrow">▼</span>
                </button>
                <div class="full-review-content" style="display:none">
                    ${quiz.jsonData.map((question, qIdx) => {
                        const answer     = result.answers.find(a => a.questionIndex === qIdx);
                        const isCorrect  = answer?.isCorrect;
                        const notAnswered = !answer;
                        return `
                            <div class="full-review-question ${isCorrect ? 'fq-correct' : notAnswered ? 'fq-unanswered' : 'fq-wrong'}">
                                <div class="fq-header">
                                    <span class="fq-status">${isCorrect ? '✅' : notAnswered ? '⬜' : '❌'}</span>
                                    <span class="fq-title">Q${qIdx + 1}: ${escapeHTML(question.question)}</span>
                                </div>
                                <div class="result-options-list">
                                    ${question.options.map((opt, optIdx) => {
                                        const isCorrectOpt = optIdx === question.correct;
                                        const isUserChoice = answer && answer.selectedOption === optIdx;
                                        const isUserWrong  = isUserChoice && !isCorrectOpt;
                                        return `
                                            <div class="result-option ${isCorrectOpt ? 'result-option-correct' : ''} ${isUserWrong ? 'result-option-wrong' : ''}">
                                                <span class="result-option-letter">${String.fromCharCode(65 + optIdx)}</span>
                                                <span class="result-option-text">${escapeHTML(opt)}</span>
                                                ${isCorrectOpt ? '<span class="result-badge correct-badge">✓ Correct</span>' : ''}
                                                ${isUserWrong  ? '<span class="result-badge wrong-badge">✗ Your answer</span>' : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                ${question.explanation ? `<div class="explanation">💡 ${escapeHTML(question.explanation)}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Actions -->
            <div class="results-actions">
                <button class="btn btn-primary" onclick="retryCurrentQuiz()">
                    🔄 Retry Quiz
                </button>
                ${mistakes > 0 ? `
                    <button class="btn btn-warning" onclick="practiceTheseMistakes()">
                        📝 Practice ${mistakes} Mistake${mistakes !== 1 ? 's' : ''}
                    </button>
                ` : ''}
                <button class="btn btn-secondary" data-action="back">
                    ← Back to Course
                </button>
            </div>

        </div>
    `;
}

function toggleFullReview(btn) {
    const content = btn.nextElementSibling;
    const arrow   = btn.querySelector('.toggle-arrow');
    const isOpen  = content.style.display !== 'none';
    content.style.display = isOpen ? 'none' : 'flex';
    arrow.textContent = isOpen ? '▼' : '▲';
}

async function retryCurrentQuiz() {
    const quiz = AppState.quizResult.quiz;
    if (quiz.id === 'mistakes-practice') {
        await practiceMistakes(AppState.currentCourse.id);
    } else {
        await startQuiz(quiz);
    }
}

async function practiceTheseMistakes() {
    const result = AppState.quizResult.result;
    const quiz   = AppState.quizResult.quiz;

    const wrongAnswers = result.answers
        .filter(a => !a.isCorrect)
        .map(a => quiz.jsonData[a.questionIndex]);

    if (!wrongAnswers.length) return;

    await startQuiz({
        id: 'mistakes-practice',
        name: 'Practice Wrong Answers',
        jsonData: wrongAnswers,
        courseId: AppState.currentCourse.id
    });
}
