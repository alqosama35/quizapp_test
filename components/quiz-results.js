// Quiz results component - shows quiz results with detailed breakdown

async function renderQuizResults() {
    const data = AppState.quizResult;
    if (!data) {
        Router.back();
        return '';
    }
    
    const { result, quiz, mistakes } = data;
    const percentage = result.percentage;
    const scoreColor = getScoreColor(percentage);
    const message = getMotivationalMessage(percentage);
    
    // Show confetti for perfect score
    const settings = await getSettings();
    if (percentage === 100 && settings.confetti !== false) {
        setTimeout(showConfetti, 300);
    }
    
    // Get all results for this quiz to show improvement
    const allResults = quiz.id !== 'mistakes-practice' 
        ? await getResultsForQuiz(quiz.id)
        : [];
    const previousBest = allResults.length > 1
        ? Math.max(...allResults.slice(0, -1).map(r => r.percentage))
        : 0;
    
    const improvement = previousBest > 0 ? percentage - previousBest : 0;
    
    return `
        <div class="quiz-results-page">
            <header class="results-header">
                <h1>🎉 Quiz Complete!</h1>
            </header>
            
            <div class="results-content">
                <div class="score-display">
                    <div class="score-circle" style="border-color: ${scoreColor}">
                        <div class="score-value" style="color: ${scoreColor}">
                            ${result.score}/${result.totalQuestions}
                        </div>
                        <div class="score-percentage">${percentage}%</div>
                    </div>
                    <div class="score-stars">
                        ${'⭐'.repeat(Math.floor(percentage / 25))}
                    </div>
                </div>
                
                <div class="motivational-message">${message}</div>
                
                <div class="results-breakdown">
                    <h3>Breakdown</h3>
                    <div class="breakdown-stats">
                        <div class="breakdown-item">
                            <span class="breakdown-icon">✅</span>
                            <span class="breakdown-label">Correct:</span>
                            <span class="breakdown-value">${result.score}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-icon">❌</span>
                            <span class="breakdown-label">Wrong:</span>
                            <span class="breakdown-value">${result.totalQuestions - result.score}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-icon">⏱️</span>
                            <span class="breakdown-label">Time:</span>
                            <span class="breakdown-value">${formatDuration(result.timeTaken)}</span>
                        </div>
                        ${previousBest > 0 ? `
                            <div class="breakdown-item">
                                <span class="breakdown-icon">${improvement >= 0 ? '📈' : '📉'}</span>
                                <span class="breakdown-label">vs. Best:</span>
                                <span class="breakdown-value" style="color: ${improvement >= 0 ? '#4CAF50' : '#F44336'}">
                                    ${improvement >= 0 ? '+' : ''}${improvement}%
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${mistakes > 0 ? `
                    <div class="mistakes-section">
                        <h3>❌ Questions You Got Wrong (${mistakes})</h3>
                        <div class="wrong-questions">
                            ${result.answers
                                .filter(a => !a.isCorrect)
                                .map(a => {
                                    const question = quiz.jsonData[a.questionIndex];
                                    return `
                                        <div class="wrong-question">
                                            <div class="wrong-q-title">
                                                Question ${a.questionIndex + 1}: ${escapeHTML(question.question)}
                                            </div>
                                            <div class="wrong-q-details">
                                                <div class="wrong-answer">
                                                    Your answer: <span class="wrong-text">${escapeHTML(question.options[a.selectedOption])}</span>
                                                </div>
                                                <div class="correct-answer">
                                                    Correct answer: <span class="correct-text">${escapeHTML(question.options[a.correctOption])}</span>
                                                </div>
                                                ${question.explanation ? `
                                                    <div class="explanation">
                                                        💡 ${escapeHTML(question.explanation)}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${percentage === 100 ? `
                    <div class="perfect-score">
                        🎊 Perfect score! Amazing work! 🎊
                    </div>
                ` : ''}
                
                <div class="results-actions">
                    <button class="btn btn-primary" onclick="retryCurrentQuiz()">
                        🔄 Retry Quiz
                    </button>
                    ${mistakes > 0 ? `
                        <button class="btn btn-warning" onclick="practiceTheseMistakes()">
                            📝 Practice These ${mistakes} Mistakes
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="viewDetailedResults()">
                        📊 View Detailed Results
                    </button>
                    <button class="btn btn-secondary" data-action="back">
                        🏠 Back to Course
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function retryCurrentQuiz() {
    const quiz = AppState.quizResult.quiz;
    
    if (quiz.id === 'mistakes-practice') {
        // Re-fetch mistakes for practice
        await practiceMistakes(AppState.currentCourse.id);
    } else {
        await startQuiz(quiz);
    }
}

async function practiceTheseMistakes() {
    // Get the mistakes from the current quiz result
    const result = AppState.quizResult.result;
    const quiz = AppState.quizResult.quiz;
    
    const wrongAnswers = result.answers
        .filter(a => !a.isCorrect)
        .map(a => quiz.jsonData[a.questionIndex]);
    
    if (wrongAnswers.length === 0) return;
    
    // Create temporary quiz from these mistakes
    const mistakesQuiz = {
        id: 'mistakes-practice',
        name: 'Practice Wrong Answers',
        jsonData: wrongAnswers,
        courseId: AppState.currentCourse.id
    };
    
    await startQuiz(mistakesQuiz);
}

async function viewDetailedResults() {
    const result = AppState.quizResult.result;
    const quiz = AppState.quizResult.quiz;
    
    let details = `Detailed Results\n\n`;
    details += `Quiz: ${quiz.name}\n`;
    details += `Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)\n`;
    details += `Time: ${formatDuration(result.timeTaken)}\n`;
    details += `Average per question: ${Math.round(result.timeTaken / result.totalQuestions)}s\n\n`;
    
    details += `Question-by-Question:\n`;
    result.answers.forEach((a, idx) => {
        const question = quiz.jsonData[a.questionIndex];
        const status = a.isCorrect ? '✅' : '❌';
        details += `${idx + 1}. ${status} ${question.question.substring(0, 40)}...\n`;
    });
    
    Modal.info(details.replace(/\n/g, '<br>'), '📊 Detailed Statistics');
}
