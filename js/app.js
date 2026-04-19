// Main application state and initialization

const AppState = {
    currentView: 'dashboard',
    currentCourse: null,
    currentQuiz: null,
    quizSession: null,
    settings: null
};

// Simple router
const Router = {
    navigate(view, params = {}) {
        AppState.currentView = view;
        Object.assign(AppState, params);

        // Push to browser history for back button support
        history.pushState(
            { view, currentCourse: AppState.currentCourse, currentQuiz: AppState.currentQuiz },
            '',
            location.pathname
        );

        render();
    },

    back() {
        if (AppState.currentView === 'course-view' || AppState.currentView === 'quiz-input' || AppState.currentView === 'quiz-edit') {
            this.navigate('dashboard');
        } else if (AppState.currentView === 'quiz-taking' || AppState.currentView === 'quiz-results') {
            this.navigate('course-view', { currentCourse: AppState.currentCourse });
        } else {
            this.navigate('dashboard');
        }
    }
};

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (!state || !state.view) return;

    // Don't restore active quiz session via browser back (session state is in-memory only)
    const safeView = state.view === 'quiz-taking' ? 'course-view' : state.view;
    AppState.currentView = safeView;
    if (state.currentCourse) AppState.currentCourse = state.currentCourse;
    if (state.currentQuiz) AppState.currentQuiz = state.currentQuiz;
    render();
});

// Render current view
async function render() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    let html = '';

    switch (AppState.currentView) {
        case 'dashboard':
            html = await renderDashboard();
            break;
        case 'course-view':
            html = await renderCourseView();
            break;
        case 'quiz-input':
            html = await renderQuizInput();
            break;
        case 'quiz-edit':
            html = await renderQuizInput(true);
            break;
        case 'quiz-taking':
            html = await renderQuizTaking();
            break;
        case 'quiz-results':
            html = await renderQuizResults();
            break;
        case 'settings':
            html = await renderSettings();
            break;
        case 'help':
            html = await renderHelp();
            break;
        default:
            html = await renderDashboard();
    }
    
    appContainer.innerHTML = html;
    attachEventListeners();
}

// Attach event listeners after rendering
function attachEventListeners() {
    // Navigation listeners
    const backButtons = document.querySelectorAll('[data-action="back"]');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => Router.back());
    });
    
    // Course actions
    const newCourseBtn = document.querySelector('[data-action="new-course"]');
    if (newCourseBtn) {
        newCourseBtn.addEventListener('click', showNewCourseDialog);
    }
    
    const courseCards = document.querySelectorAll('[data-action="view-course"]');
    courseCards.forEach(card => {
        card.addEventListener('click', async () => {
            const courseId = card.dataset.courseId;
            const course = await getCourse(courseId);
            Router.navigate('course-view', { currentCourse: course });
        });
    });
    
    // Quiz actions
    const newQuizBtn = document.querySelector('[data-action="new-quiz"]');
    if (newQuizBtn) {
        newQuizBtn.addEventListener('click', () => {
            Router.navigate('quiz-input', { currentCourse: AppState.currentCourse });
        });
    }
    
}

// Dialog functions
async function showNewCourseDialog() {
    const nameId = 'new-course-name-' + Date.now();
    const descId = 'new-course-desc-' + Date.now();

    const result = await new Promise((resolve) => {
        Modal.show({
            title: '📘 Create New Course',
            html: `
                <div style="margin-bottom:16px">
                    <label style="display:block;margin-bottom:8px;font-weight:600;color:var(--text-primary)">Course Name *</label>
                    <input type="text" id="${nameId}" class="modal-input" placeholder="e.g., JavaScript Fundamentals" style="margin-top:0;display:block;width:100%">
                </div>
                <div>
                    <label style="display:block;margin-bottom:8px;font-weight:600;color:var(--text-primary)">Description <span style="font-weight:400;color:var(--text-secondary)">(optional)</span></label>
                    <input type="text" id="${descId}" class="modal-input" placeholder="Brief description of this course" style="margin-top:0;display:block;width:100%">
                </div>
            `,
            buttons: [
                { text: 'Cancel', action: () => resolve(null) },
                {
                    text: 'Create Course', primary: true,
                    action: () => {
                        const name = document.getElementById(nameId)?.value?.trim();
                        const description = document.getElementById(descId)?.value?.trim() || '';
                        resolve(name ? { name, description } : null);
                    }
                }
            ]
        });
        setTimeout(() => document.getElementById(nameId)?.focus(), 120);
    });

    if (!result) return;

    try {
        await createCourse(result);
        showToast('Course created!', 'success');
        render();
    } catch (err) {
        showToast('Error creating course', 'error');
        console.error(err);
    }
}

async function handleQuizSubmit(e) {
    e.preventDefault();
    
    const jsonInput = document.getElementById('jsonInput').value;
    const quizName = document.getElementById('quizName').value;
    
    const validation = validateQuizJSON(jsonInput);
    
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }
    
    try {
        const quiz = await createQuiz(AppState.currentCourse.id, {
            name: quizName || undefined,
            jsonData: validation.data
        });
        
        showToast('Quiz saved!', 'success');
        
        // Start quiz
        startQuiz(quiz);
    } catch (err) {
        showToast('Error saving quiz', 'error');
        console.error(err);
    }
}

async function startQuiz(quiz) {
    // Get course and global settings
    const [course, settings] = await Promise.all([
        getCourse(quiz.courseId),
        getSettings()
    ]);
    const shouldShuffle = course?.settings?.shuffleOptions || false;

    // Clone quiz data to avoid mutating original
    const quizData = JSON.parse(JSON.stringify(quiz.jsonData));

    // Shuffle options if enabled
    if (shouldShuffle) {
        quizData.forEach((question, qIndex) => {
            const indices = question.options.map((_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            quiz.jsonData[qIndex].options = indices.map(i => question.options[i]);
            quiz.jsonData[qIndex].correct = indices.indexOf(question.correct);
        });
    }

    AppState.quizSession = {
        quiz,
        startTime: Date.now(),
        answers: new Array(quiz.jsonData.length).fill(null),
        questionTimes: new Array(quiz.jsonData.length).fill(0),
        currentQuestion: 0,
        instantFeedback: settings.instantFeedback === true,
        revealedAnswers: new Array(quiz.jsonData.length).fill(false)
    };

    Router.navigate('quiz-taking', { currentQuiz: quiz });
}

// Initialize app
async function initApp() {
    console.log('Initializing Quiz App...');
    
    try {
        // Wait for Dexie to be ready
        await db.open();
        console.log('Database opened');
        
        // Migrate localStorage data
        await migrateFromLocalStorage();
        
        // Load settings
        AppState.settings = await getSettings();
        
        // Apply theme
        applyTheme(AppState.settings.theme);
        
        // Apply font size
        if (AppState.settings.fontSize) {
            document.body.className = document.body.className.replace(/font-\w+/g, '');
            document.body.classList.add(`font-${AppState.settings.fontSize}`);
        }
        
        // Apply animations setting
        if (AppState.settings.animations === false) {
            document.body.classList.add('no-animations');
        }
        
        // Set initial browser history state so back button works from the start
        history.replaceState({ view: 'dashboard' }, '', location.pathname);

        // Initial render
        await render();

        console.log('App initialized successfully');
    } catch (err) {
        console.error('Error initializing app:', err);
        document.getElementById('app').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #F44336;">
                <h2>Error Loading App</h2>
                <p>${err.message}</p>
                <button onclick="location.reload()">Reload</button>
            </div>
        `;
    }
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    } else {
        // Auto theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', prefersDark);
        document.body.classList.toggle('light-theme', !prefersDark);
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
