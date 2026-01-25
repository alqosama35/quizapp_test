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
        render();
    },
    
    back() {
        if (AppState.currentView === 'course-view' || AppState.currentView === 'quiz-input') {
            this.navigate('dashboard');
        } else if (AppState.currentView === 'quiz-taking' || AppState.currentView === 'quiz-results') {
            this.navigate('course-view', { currentCourse: AppState.currentCourse });
        } else {
            this.navigate('dashboard');
        }
    }
};

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
    
    const quizForm = document.getElementById('quiz-input-form');
    if (quizForm) {
        quizForm.addEventListener('submit', handleQuizSubmit);
    }
}

// Dialog functions
async function showNewCourseDialog() {
    const name = await Modal.prompt('Enter course name:', 'Create New Course');
    if (!name) return;
    
    const description = await Modal.prompt('Enter course description (optional):', 'Course Description', '') || '';
    
    createCourse({ name, description })
        .then(() => {
            showToast('Course created!', 'success');
            render();
        })
        .catch(err => {
            showToast('Error creating course', 'error');
            console.error(err);
        });
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
    // Get course settings for shuffle options
    const course = await getCourse(quiz.courseId);
    const shouldShuffle = course?.settings?.shuffleOptions || false;
    
    // Clone quiz data to avoid mutating original
    const quizData = JSON.parse(JSON.stringify(quiz.jsonData));
    
    // Shuffle options if enabled
    if (shouldShuffle) {
        quizData.forEach((question, qIndex) => {
            // Create array of option indices
            const indices = question.options.map((_, i) => i);
            
            // Fisher-Yates shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            
            // Reorder options and update correct answer
            const newOptions = indices.map(i => question.options[i]);
            const newCorrect = indices.indexOf(question.correct);
            
            quiz.jsonData[qIndex].options = newOptions;
            quiz.jsonData[qIndex].correct = newCorrect;
        });
    }
    
    AppState.quizSession = {
        quiz: quiz,
        startTime: Date.now(),
        answers: new Array(quiz.jsonData.length).fill(null),
        questionTimes: new Array(quiz.jsonData.length).fill(0),
        currentQuestion: 0
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
