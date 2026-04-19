// Course view component

async function renderCourseView() {
    const course = AppState.currentCourse;
    if (!course) { Router.navigate('dashboard'); return ''; }

    const quizzes  = await getAllQuizzes(course.id);
    const mistakes = await getMistakesForCourse(course.id);

    return `
    <div class="course-view">

        <!-- Page header (back button) -->
        <div class="page-header">
            <button class="btn-back" data-action="back">← Back</button>
        </div>

        <!-- Course banner -->
        <div class="cv-banner">
            <div class="cv-banner-icon" style="background:${course.color}22;color:${course.color}">
                ${course.icon}
            </div>
            <div class="cv-banner-info">
                <h1>${escapeHTML(course.name)}</h1>
                <div class="cv-banner-desc">${escapeHTML(course.description) || 'No description'}</div>
                <div class="cv-banner-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editCourse('${course.id}')">✏️ Edit</button>
                    <button class="btn btn-sm btn-danger"    onclick="deleteCourseConfirm('${course.id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>

        <!-- Stats row -->
        <div class="cv-stats-row">
            <div class="cv-stat">
                <div class="cv-stat-value">${course.stats.totalQuizzes}</div>
                <div class="cv-stat-label">📋 Quizzes</div>
            </div>
            <div class="cv-stat">
                <div class="cv-stat-value" style="color:${getScoreColor(course.stats.averageScore)}">${course.stats.averageScore}%</div>
                <div class="cv-stat-label">🎯 Avg Score</div>
            </div>
            <div class="cv-stat">
                <div class="cv-stat-value" style="color:${getScoreColor(course.stats.bestScore)}">${course.stats.bestScore}%</div>
                <div class="cv-stat-label">🏆 Best Score</div>
            </div>
            <div class="cv-stat">
                <div class="cv-stat-value" style="color:var(--danger-color)">${course.stats.totalMistakes}</div>
                <div class="cv-stat-label">❌ Mistakes</div>
            </div>
        </div>

        <!-- Action bar -->
        <div class="cv-action-bar">
            <button class="btn btn-primary" data-action="new-quiz">📥 Add New Quiz</button>
            <button class="btn btn-secondary" onclick="importQuizToCurrentCourse()">📂 Import Quiz</button>
            ${mistakes.length > 0 ? `
                <button class="btn btn-warning" onclick="practiceMistakes('${course.id}')">
                    📝 Practice Mistakes (${mistakes.length})
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="exportCourseData('${course.id}')" title="Export course & quizzes">⬇️ Export Course</button>
        </div>

        <!-- Quiz list -->
        <div class="cv-section-title">Saved Quizzes (${quizzes.length})</div>

        ${quizzes.length > 0 ? `
            <div class="cv-quiz-list">
                ${quizzes.map(q => renderQuizItem(q)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No quizzes yet</h3>
                <p>Add your first quiz to this course to get started.</p>
                <button class="btn btn-primary" data-action="new-quiz">📥 Add New Quiz</button>
            </div>
        `}
    </div>
    `;
}

function renderQuizItem(quiz) {
    const score      = quiz.stats.bestScore;
    const scoreColor = score > 0 ? getScoreColor(score) : 'var(--text-muted)';
    const scoreText  = score > 0 ? `${score}%` : '—';
    const metaText   = [
        `${quiz.stats.attempts} attempt${quiz.stats.attempts !== 1 ? 's' : ''}`,
        quiz.stats.lastAttempt ? `· last ${formatDate(quiz.stats.lastAttempt)}` : ''
    ].filter(Boolean).join(' ');

    return `
        <div class="cv-quiz-row">
            <div class="cv-quiz-score-ring" style="border-color:${scoreColor};color:${scoreColor}">
                <span>${scoreText}</span>
            </div>
            <div class="cv-quiz-info">
                <div class="cv-quiz-name">${escapeHTML(quiz.name)}</div>
                <div class="cv-quiz-meta">${metaText || 'Not started yet'}</div>
            </div>
            <div class="cv-quiz-actions">
                <button class="btn btn-sm btn-primary" onclick="retakeQuiz('${quiz.id}')" title="${quiz.stats.attempts > 0 ? 'Retake' : 'Start'}">
                    ▶ ${quiz.stats.attempts > 0 ? 'Retake' : 'Start'}
                </button>
                <button class="btn-icon" onclick="viewQuizStats('${quiz.id}')" title="View stats">📊</button>
                <button class="btn-icon" onclick="editQuizJSON('${quiz.id}')"  title="Edit JSON">✏️</button>
                <button class="btn-icon" onclick="exportQuizJSON('${quiz.id}')" title="Export JSON">⬇️</button>
                <button class="btn-icon" onclick="deleteQuizConfirm('${quiz.id}')" title="Delete"
                        style="color:var(--danger-color);border-color:var(--danger-muted)">🗑️</button>
            </div>
        </div>
    `;
}

/* ---- Course actions ---- */

async function editCourse(courseId) {
    const course = await getCourse(courseId);
    const newName = await Modal.prompt('Enter new course name:', 'Edit Course', course.name);
    if (newName && newName.trim() && newName.trim() !== course.name) {
        await updateCourse(courseId, { name: newName.trim() });
        AppState.currentCourse.name = newName.trim();
        showToast('Course updated!', 'success');
        render();
    }
}

async function deleteCourseConfirm(courseId) {
    const confirmed = await Modal.confirm(
        'All quizzes, results, and mistakes in this course will be permanently deleted.',
        '⚠️ Delete Course?',
        { danger: true, confirmText: 'Delete', cancelText: 'Cancel' }
    );
    if (!confirmed) return;
    await deleteCourse(courseId);
    showToast('Course deleted', 'success');
    Router.navigate('dashboard');
}

/* ---- Quiz actions ---- */

async function retakeQuiz(quizId) {
    const quiz = await getQuiz(quizId);
    await startQuiz(quiz);
}

async function viewQuizStats(quizId) {
    const quiz    = await getQuiz(quizId);
    const results = await getResultsForQuiz(quizId);
    if (!results.length) { showToast('No attempts yet', 'info'); return; }
    const stats = calculateStats(results);
    await Modal.info(
        `Total Attempts: ${stats.total}<br>Average Score: ${stats.average}%<br>Best Score: ${stats.best}%<br>Worst Score: ${stats.worst}%<br>Total Time: ${formatDuration(stats.totalTime)}`,
        `📊 ${quiz.name} — Statistics`
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
    AppState.currentCourse = await getCourse(AppState.currentCourse.id);
    render();
}

async function exportQuizJSON(quizId) {
    const quiz = await getQuiz(quizId);
    if (!quiz) return;
    const safeName = quiz.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadJSON(quiz.jsonData, `quiz-${safeName}.json`);
    showToast('Quiz JSON exported!', 'success');
}

async function editQuizJSON(quizId) {
    const quiz = await getQuiz(quizId);
    if (!quiz) return;
    AppState.editingQuiz = quiz;
    Router.navigate('quiz-edit', { currentCourse: AppState.currentCourse });
}

async function exportCourseData(courseId) {
    const course  = await getCourse(courseId);
    const quizzes = await getAllQuizzes(courseId);
    const exportData = {
        type: 'course-export', version: 1,
        exportDate: new Date().toISOString(),
        course, quizzes
    };
    const safeName = course.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadJSON(exportData, `course-${safeName}.json`);
    showToast('Course exported!', 'success');
}

async function importQuizToCurrentCourse() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text   = await file.text();
            const parsed = JSON.parse(text);

            let quizzes = [];
            if (Array.isArray(parsed)) {
                const validation = validateQuizJSON(text);
                if (!validation.valid) { showToast('Invalid quiz JSON: ' + validation.error, 'error'); return; }
                quizzes.push({ name: file.name.replace('.json', ''), jsonData: validation.data });
            } else if (parsed.type === 'course-export' && Array.isArray(parsed.quizzes)) {
                quizzes = parsed.quizzes;
            } else {
                showToast('Unrecognised file format', 'error'); return;
            }

            const confirmed = await Modal.confirm(
                `Import ${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} into "${AppState.currentCourse.name}"?`,
                'Import Quiz', { confirmText: 'Import', cancelText: 'Cancel' }
            );
            if (!confirmed) return;

            for (const q of quizzes) {
                await createQuiz(AppState.currentCourse.id, { name: q.name, jsonData: q.jsonData });
            }

            showToast(`${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} imported!`, 'success');
            AppState.currentCourse = await getCourse(AppState.currentCourse.id);
            render();
        } catch (err) {
            showToast('Import failed: ' + err.message, 'error');
            console.error(err);
        }
    };

    input.click();
}

async function practiceMistakes(courseId) {
    const mistakes = await getMistakesForCourse(courseId);
    if (!mistakes.length) { showToast('No mistakes to practice!', 'info'); return; }

    const quiz = {
        id: 'mistakes-practice',
        name: 'Mistakes Practice',
        jsonData: mistakes.map(m => m.question),
        courseId
    };
    await startQuiz(quiz);
}
