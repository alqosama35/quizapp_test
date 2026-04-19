// Quiz input component - for pasting JSON quiz data (also handles editing)

async function renderQuizInput(isEditing = false) {
    const course = AppState.currentCourse;
    if (!course) { Router.navigate('dashboard'); return ''; }

    const editingQuiz  = isEditing ? AppState.editingQuiz : null;
    const prefillJSON  = editingQuiz ? JSON.stringify(editingQuiz.jsonData, null, 2) : '';
    const prefillName  = editingQuiz ? editingQuiz.name : '';

    const chatgptPrompt = `Generate a quiz in JSON format about [TOPIC]. Return ONLY a JSON array with no extra text. Each question must follow this exact structure:

[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Because ..."
  }
]

Rules:
- "correct" is the 0-based index of the correct option (0 = first option)
- Include 4 options per question
- Write a clear explanation for each answer
- Generate [NUMBER] questions`;

    return `
        <div class="quiz-input-page">

            <div class="page-header">
                <button class="btn-back" data-action="back">← Back</button>
                <h1>${isEditing ? '✏️ Edit Quiz JSON' : '📥 Add New Quiz'}</h1>
            </div>

            <div class="qi-layout">

                <!-- Left: Form -->
                <div class="qi-form-card">

                    <div class="qi-toolbar">
                        ${!isEditing ? `
                            <button type="button" class="btn btn-sm btn-secondary" onclick="loadSampleQuiz()">
                                📄 Sample
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-sm btn-secondary" onclick="importFromFile()">
                            📂 Import File
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="formatJSON()">
                            ✨ Format JSON
                        </button>
                    </div>

                    <div class="form-group">
                        <label for="jsonInput">Quiz JSON</label>
                        <textarea
                            id="jsonInput"
                            placeholder='[&#10;  {&#10;    "question": "What is...?",&#10;    "options": ["A", "B", "C", "D"],&#10;    "correct": 0,&#10;    "explanation": "Because..."&#10;  }&#10;]'
                            rows="14"
                            required
                        >${escapeHTML(prefillJSON)}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="quizName">Quiz Name <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
                        <input
                            type="text"
                            id="quizName"
                            value="${escapeHTML(prefillName)}"
                            placeholder="e.g., JavaScript Basics Quiz"
                            class="form-input"
                        />
                        <div class="form-help">Leave empty to auto-name (Quiz 1, Quiz 2, …)</div>
                    </div>

                    <div class="qi-submit-row">
                        ${isEditing ? `
                            <button type="button" class="btn btn-primary btn-lg" onclick="saveEditedQuiz()">
                                💾 Save Changes
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary btn-lg" onclick="submitQuizInput()">
                                ✅ Save &amp; Start Quiz
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="saveQuizForLater()">
                                💾 Save for Later
                            </button>
                        `}
                    </div>
                </div>

                <!-- Right: Tutorial panel -->
                <div class="tutorial-panel">
                    <button class="tutorial-toggle" onclick="toggleTutorial(this)">
                        💡 How to get quiz JSON from AI <span class="toggle-arrow">▼</span>
                    </button>
                    <div class="tutorial-body" id="tutorial-body" style="display:none">

                        <div class="tutorial-steps">
                            <div class="tutorial-step">
                                <div class="tutorial-step-num">1</div>
                                <div class="tutorial-step-text">Open <strong>ChatGPT</strong>, <strong>Claude</strong>, or any AI assistant.</div>
                            </div>
                            <div class="tutorial-step">
                                <div class="tutorial-step-num">2</div>
                                <div class="tutorial-step-text">Copy the prompt below and fill in your <strong>topic</strong> and <strong>question count</strong>.</div>
                            </div>
                            <div class="tutorial-step">
                                <div class="tutorial-step-num">3</div>
                                <div class="tutorial-step-text">Paste the returned JSON into the field on the left.</div>
                            </div>
                        </div>

                        <div class="tutorial-prompt-box">
                            <div class="tutorial-prompt-label">
                                AI Prompt
                                <button class="btn btn-sm btn-secondary" onclick="copyAIPrompt()">Copy</button>
                            </div>
                            <pre class="tutorial-prompt-code" id="chatgpt-prompt">${escapeHTML(chatgptPrompt)}</pre>
                        </div>

                        <div class="tutorial-format-box">
                            <div class="tutorial-prompt-label">Required JSON format</div>
                            <table class="format-table" style="margin-top:8px">
                                <thead>
                                    <tr><th>Field</th><th>Type</th><th>Req</th><th>Description</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><code>question</code></td><td>string</td><td>✅</td><td>The question text</td></tr>
                                    <tr><td><code>options</code></td><td>array</td><td>✅</td><td>2–6 answer choices</td></tr>
                                    <tr><td><code>correct</code></td><td>number</td><td>✅</td><td>0-based index of correct option</td></tr>
                                    <tr><td><code>explanation</code></td><td>string</td><td>—</td><td>Shown after submitting</td></tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    `;
}

function toggleTutorial(btn) {
    const body  = document.getElementById('tutorial-body');
    const arrow = btn.querySelector('.toggle-arrow');
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    arrow.textContent  = isOpen ? '▼' : '▲';
}

function copyAIPrompt() {
    const el = document.getElementById('chatgpt-prompt');
    if (el) copyToClipboard(el.textContent);
}

function formatJSON() {
    const ta = document.getElementById('jsonInput');
    if (!ta) return;
    try {
        ta.value = JSON.stringify(JSON.parse(ta.value), null, 2);
        showToast('JSON formatted!', 'success');
    } catch (e) {
        showToast('Invalid JSON — cannot format', 'error');
    }
}

function loadSampleQuiz() {
    const sample = [
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correct: 2,
            explanation: "Paris is the capital and most populous city of France."
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correct: 1,
            explanation: "Mars appears red due to iron oxide on its surface."
        },
        {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correct: 1,
            explanation: "Basic arithmetic: 2 plus 2 equals 4."
        }
    ];
    document.getElementById('jsonInput').value = JSON.stringify(sample, null, 2);
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
        reader.onload = (ev) => {
            document.getElementById('jsonInput').value = ev.target.result;
            showToast('File imported!', 'success');
        };
        reader.onerror = () => showToast('Error reading file', 'error');
        reader.readAsText(file);
    };
    input.click();
}

async function submitQuizInput() {
    const jsonInput = document.getElementById('jsonInput').value;
    const quizName  = document.getElementById('quizName').value;

    const validation = validateQuizJSON(jsonInput);
    if (!validation.valid) { showToast(validation.error, 'error'); return; }

    try {
        const quiz = await createQuiz(AppState.currentCourse.id, {
            name: quizName || undefined,
            jsonData: validation.data
        });
        await startQuiz(quiz);
    } catch (err) {
        showToast('Error saving quiz', 'error');
        console.error(err);
    }
}

async function saveQuizForLater() {
    const jsonInput = document.getElementById('jsonInput').value;
    const quizName  = document.getElementById('quizName').value;

    const validation = validateQuizJSON(jsonInput);
    if (!validation.valid) { showToast(validation.error, 'error'); return; }

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

async function saveEditedQuiz() {
    const jsonInput = document.getElementById('jsonInput').value;
    const quizName  = document.getElementById('quizName').value;
    const quiz      = AppState.editingQuiz;

    if (!quiz) { showToast('No quiz selected for editing', 'error'); return; }

    const validation = validateQuizJSON(jsonInput);
    if (!validation.valid) { showToast(validation.error, 'error'); return; }

    try {
        const updates = { jsonData: validation.data };
        if (quizName) updates.name = quizName;
        await updateQuiz(quiz.id, updates);

        showToast('Quiz updated!', 'success');
        AppState.editingQuiz = null;
        AppState.currentCourse = await getCourse(AppState.currentCourse.id);
        Router.navigate('course-view', { currentCourse: AppState.currentCourse });
    } catch (err) {
        showToast('Error updating quiz', 'error');
        console.error(err);
    }
}
