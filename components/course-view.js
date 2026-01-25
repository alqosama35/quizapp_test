// Course view component - shows quizzes for a specific course

async function renderCourseView() {
    const course = AppState.currentCourse;
    if (!course) {
        Router.navigate('dashboard');
        return '';
    }
    
    const quizzes = await getAllQuizzes(course.id);
    const mistakes = await getMistakesForCourse(course.id);
    const results = await getResultsForCourse(course.id);
    
    return `
        <div class="course-view">
            <header class="page-header">
                <button class="btn-back" data-action="back">← Back</button>
                <h1>${course.icon} ${escapeHTML(course.name)}</h1>
            </header>
            
            <div class="course-header">
                <p class="course-description">${escapeHTML(course.description)}</p>
                <div class="course-actions">
                    <button class="btn btn-secondary" onclick="editCourse('${course.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteCourseConfirm('${course.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            
            <section class="course-stats-section">
                <div class="stat-card">
                    <div class="stat-value">${course.stats.totalQuizzes}</div>
                    <div class="stat-label">Total Quizzes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${course.stats.averageScore}%</div>
                    <div class="stat-label">Average Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${course.stats.bestScore}%</div>
                    <div class="stat-label">Best Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${course.stats.totalMistakes}</div>
                    <div class="stat-label">Mistakes</div>
                </div>
            </section>
            
            <div class="action-buttons">
                <button class="btn btn-primary" data-action="new-quiz">
                    📥 Add New Quiz
                </button>
                ${mistakes.length > 0 ? `
                    <button class="btn btn-warning" onclick="practiceMistakes('${course.id}')">
                        📝 Practice Mistakes (${mistakes.length})
                    </button>
                ` : ''}
            </div>
            
            <section class="quizzes-section">
                <h2>Saved Quizzes</h2>
                ${quizzes.length > 0 ? `
                    <div class="quizzes-list">
                        ${quizzes.map(quiz => renderQuizItem(quiz)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        No quizzes yet. Add your first quiz to get started!
                    </div>
                `}
            </section>
        </div>
    `;
}

function renderQuizItem(quiz) {
    const scoreColor = quiz.stats.bestScore >= 70 ? '#4CAF50' : quiz.stats.bestScore >= 50 ? '#FF9800' : '#F44336';
    
    return `
        <div class="quiz-item">
            <div class="quiz-info">
                <h3 class="quiz-name">${escapeHTML(quiz.name)}</h3>
                <div class="quiz-meta">
                    ${quiz.stats.attempts} ${quiz.stats.attempts === 1 ? 'attempt' : 'attempts'}
                    ${quiz.stats.lastAttempt ? ` • Last: ${formatDate(quiz.stats.lastAttempt)}` : ''}
                </div>
            </div>
            <div class="quiz-score" style="color: ${scoreColor}">
                ${quiz.stats.bestScore > 0 ? `${quiz.stats.bestScore}%` : '-'}
            </div>
            <div class="quiz-actions">
                <button class="btn btn-sm btn-primary" onclick="retakeQuiz('${quiz.id}')">
                    ▶️ ${quiz.stats.attempts > 0 ? 'Retake' : 'Start'}
                </button>
                <button class="btn btn-sm btn-secondary" onclick="viewQuizStats('${quiz.id}')">
                    📊 Stats
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuizConfirm('${quiz.id}')">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// Course actions
async function editCourse(courseId) {
    const course = await getCourse(courseId);
    const newName = await Modal.prompt('Enter new course name:', 'Edit Course', course.name);
    
    if (newName && newName !== course.name) {
        await updateCourse(courseId, { name: newName });
        AppState.currentCourse.name = newName;
        showToast('Course updated!', 'success');
        render();
    }
}

async function deleteCourseConfirm(courseId) {
    const confirmed = await Modal.confirm(
        'All quizzes, results, and mistakes in this course will be permanently deleted. This action cannot be undone.',
        '⚠️ Delete Course?',
        { danger: true, confirmText: 'Delete', cancelText: 'Cancel' }
    );
    if (!confirmed) return;
    
    await deleteCourse(courseId);
    showToast('Course deleted', 'success');
    Router.navigate('dashboard');
}

// Quiz actions
async function retakeQuiz(quizId) {
    const quiz = await getQuiz(quizId);
    await startQuiz(quiz);
}

async function viewQuizStats(quizId) {
    const quiz = await getQuiz(quizId);
    const results = await getResultsForQuiz(quizId);
    
    if (results.length === 0) {
        showToast('No attempts yet', 'info');
        return;
    }
    
    const stats = calculateStats(results);
    await Modal.info(
        `Total Attempts: ${stats.total}<br>Average Score: ${stats.average}%<br>Best Score: ${stats.best}%<br>Worst Score: ${stats.worst}%<br>Total Time: ${formatDuration(stats.totalTime)}`,
        '📊 Quiz Statistics'
    );
}

async function deleteQuizConfirm(quizId) {
    const confirmed = await Modal.confirm(
        'This will also delete all results for this quiz.',
        'Delete Quiz?',
        { danger: true, confirmText: 'Delete', cancelText: 'Cancel' }
    );
    if (!confirmed) return;
    
    await deleteQuiz(quizId);
    showToast('Quiz deleted', 'success');
    
    // Refresh current course
    AppState.currentCourse = await getCourse(AppState.currentCourse.id);
    render();
}

async function practiceMistakes(courseId) {
    const mistakes = await getMistakesForCourse(courseId);
    
    if (mistakes.length === 0) {
        showToast('No mistakes to practice!', 'info');
        return;
    }
    
    // Create temporary quiz from mistakes
    const quiz = {
        id: 'mistakes-practice',
        name: 'Mistakes Practice',
        jsonData: mistakes.map(m => m.question),
        courseId: courseId
    };
    
    await startQuiz(quiz);
}
