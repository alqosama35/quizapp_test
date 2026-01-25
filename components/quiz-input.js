// Quiz input component - for pasting JSON quiz data

async function renderQuizInput() {
    const course = AppState.currentCourse;
    if (!course) {
        Router.navigate('dashboard');
        return '';
    }
    
    const sampleJSON = JSON.stringify([
        {
            "question": "What is the capital of France?",
            "options": ["Berlin", "Madrid", "Paris", "Rome"],
            "correct": 2,
            "explanation": "Paris is the capital of France."
        }
    ], null, 2);
    
    return `
        <div class="quiz-input-page">
            <header class="page-header">
                <button class="btn-back" data-action="back">← Back</button>
                <h1>📥 Add New Quiz</h1>
            </header>
            
            <div class="quiz-input-container">
                <form id="quiz-input-form">
                    <div class="form-group">
                        <label for="jsonInput">Paste your quiz JSON below:</label>
                        <textarea 
                            id="jsonInput" 
                            placeholder="Paste JSON here..." 
                            rows="12"
                            required
                        ></textarea>
                        <div class="form-help">
                            Format: Array of questions with "question", "options" (array), "correct" (index), and "explanation" fields.
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="loadSampleQuiz()">
                            📄 Load Sample
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="importFromFile()">
                            📂 Import File
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <label for="quizName">Quiz Name (optional):</label>
                        <input 
                            type="text" 
                            id="quizName" 
                            placeholder="e.g., JavaScript Basics Quiz"
                            class="form-input"
                        />
                        <div class="form-help">
                            Leave empty for auto-naming (Quiz 1, Quiz 2, etc.)
                        </div>
                    </div>
                    
                    <div class="form-submit">
                        <button type="submit" class="btn btn-primary btn-lg">
                            ✅ Save & Start Quiz
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="saveQuizForLater()">
                            💾 Save for Later
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function loadSampleQuiz() {
    const sampleJSON = [
        {
            "question": "What is the capital of France?",
            "options": ["Berlin", "Madrid", "Paris", "Rome"],
            "correct": 2,
            "explanation": "Paris is the capital and most populous city of France."
        },
        {
            "question": "Which planet is known as the Red Planet?",
            "options": ["Earth", "Mars", "Jupiter", "Venus"],
            "correct": 1,
            "explanation": "Mars is known as the Red Planet due to its reddish appearance caused by iron oxide on its surface."
        },
        {
            "question": "What is 2 + 2?",
            "options": ["3", "4", "5", "6"],
            "correct": 1,
            "explanation": "Basic arithmetic: 2 plus 2 equals 4."
        }
    ];
    
    document.getElementById('jsonInput').value = JSON.stringify(sampleJSON, null, 2);
    showToast('Sample quiz loaded!', 'success');
}

function importFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('jsonInput').value = event.target.result;
            showToast('File imported!', 'success');
        };
        reader.onerror = () => {
            showToast('Error reading file', 'error');
        };
        reader.readAsText(file);
    };
    
    input.click();
}

async function saveQuizForLater() {
    const jsonInput = document.getElementById('jsonInput').value;
    const quizName = document.getElementById('quizName').value;
    
    const validation = validateQuizJSON(jsonInput);
    
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }
    
    try {
        await createQuiz(AppState.currentCourse.id, {
            name: quizName || undefined,
            jsonData: validation.data
        });
        
        showToast('Quiz saved!', 'success');
        Router.navigate('course-view', { currentCourse: AppState.currentCourse });
    } catch (err) {
        showToast('Error saving quiz', 'error');
        console.error(err);
    }
}
