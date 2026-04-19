// Help and How to Use component

async function renderHelp() {
    return `
        <div class="help-page">
            <div class="help-header">
                <button class="btn-back" onclick="Router.navigate('dashboard')">← Dashboard</button>
                <h1>📚 How to Use QuizMaster</h1>
            </div>

            <div class="help-content">

                <!-- What is QuizMaster -->
                <section class="help-section">
                    <h2>🎯 What is QuizMaster?</h2>
                    <p>QuizMaster is a personal study tool that helps you learn effectively by organising AI-generated quizzes, tracking your mistakes, and monitoring your progress over time.</p>
                    <ul>
                        <li>Beautiful, distraction-free quiz interface</li>
                        <li>Automatic mistake tracking and targeted practice</li>
                        <li>Course-based organisation for any subject</li>
                        <li>Progress analytics and streak tracking</li>
                    </ul>
                </section>

                <!-- AI-Powered Approach -->
                <section class="help-section featured">
                    <h2>🤖 The AI-Powered Learning Workflow</h2>
                    <p>The recommended approach for maximum learning efficiency:</p>

                    <div class="approach-steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h3>Study Your Material</h3>
                                <p>Read your textbook, watch videos, or review your notes on a topic.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h3>Generate a Quiz with AI</h3>
                                <p>Open ChatGPT, Claude, or Gemini and ask it to create quiz questions. Use the "Add New Quiz" page for a ready-made prompt you can copy.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h3>Paste into QuizMaster</h3>
                                <p>Copy the AI's JSON output and paste it into QuizMaster to unlock progress tracking, instant feedback, and mistake practice.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h3>Review &amp; Repeat</h3>
                                <p>After each quiz, practice your wrong answers until you master the topic. Revisit weekly for long-term retention.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Quick Start -->
                <section class="help-section">
                    <h2>🚀 Quick Start Guide</h2>

                    <h3>1. Create a Course</h3>
                    <p>Click <strong>+ New Course</strong> on the dashboard. Give it a name (e.g., "Biology Ch. 3") and an optional description.</p>

                    <h3>2. Add a Quiz</h3>
                    <p>Open the course and click <strong>📥 Add New Quiz</strong>. Paste your JSON, give it a name (or leave blank for auto-naming), and save.</p>

                    <h3>3. Take the Quiz</h3>
                    <ul>
                        <li>Press <strong>1–4</strong> to select an answer</li>
                        <li>Press <strong>← →</strong> or click the dots to navigate</li>
                        <li>Press <strong>Enter</strong> to advance</li>
                        <li>Press <strong>R</strong> to review all answers before submitting</li>
                        <li>Toggle <strong>💡 Feedback</strong> in the footer for instant right/wrong feedback</li>
                    </ul>

                    <h3>4. Review Results</h3>
                    <p>After submitting you'll see your score, a stat strip, detailed wrong-answer breakdown with explanations, and a "Review All Answers" section. You can practice your mistakes immediately.</p>
                </section>

                <!-- JSON Format Reference -->
                <section class="help-section">
                    <h2>📝 JSON Format Reference</h2>
                    <p>Quizzes must be a JSON array. Each item:</p>

                    <div class="code-block">
<pre>[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "correct": 2,
    "explanation": "Paris is the capital and largest city of France."
  }
]</pre>
                    </div>

                    <table class="format-table" style="margin-top:16px">
                        <thead>
                            <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><code>question</code></td><td>string</td><td>✅</td><td>The question text</td></tr>
                            <tr><td><code>options</code></td><td>array</td><td>✅</td><td>2–6 answer choices</td></tr>
                            <tr><td><code>correct</code></td><td>number</td><td>✅</td><td>0-based index of the correct option</td></tr>
                            <tr><td><code>explanation</code></td><td>string</td><td>—</td><td>Shown after submitting — explains why the answer is correct</td></tr>
                        </tbody>
                    </table>
                </section>

                <!-- Features Grid -->
                <section class="help-section">
                    <h2>✨ Key Features</h2>

                    <div class="features-grid">
                        <div class="feature-card">
                            <h3>📚 Course Organisation</h3>
                            <p>Group quizzes by subject or chapter with custom colours and icons.</p>
                        </div>
                        <div class="feature-card">
                            <h3>💡 Instant Feedback</h3>
                            <p>Study mode shows correct/wrong immediately after selecting. Toggle it per session.</p>
                        </div>
                        <div class="feature-card">
                            <h3>❌ Mistake Tracking</h3>
                            <p>Wrong answers are saved automatically. Practice them with one click.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📊 Progress Analytics</h3>
                            <p>Per-quiz attempt history, best scores, and dashboard streak counter.</p>
                        </div>
                        <div class="feature-card">
                            <h3>⌨️ Keyboard Shortcuts</h3>
                            <p>1–4 to answer, ← → to navigate, Enter to advance, R to review.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📤 Import / Export</h3>
                            <p>Export individual quizzes or full courses as JSON. Import them back anytime.</p>
                        </div>
                        <div class="feature-card">
                            <h3>🌓 Dark / Light Theme</h3>
                            <p>Switch themes from the dashboard toolbar or Settings.</p>
                        </div>
                        <div class="feature-card">
                            <h3>📱 Mobile Friendly</h3>
                            <p>Fully responsive — works on phones, tablets, and desktops.</p>
                        </div>
                    </div>
                </section>

                <!-- Troubleshooting -->
                <section class="help-section">
                    <h2>🔧 Troubleshooting</h2>

                    <div class="faq">
                        <div class="faq-item">
                            <h3>My quiz shows "Invalid JSON"</h3>
                            <p>Common issues: missing commas between questions, wrong quote characters (use <code>"</code> not <code>'</code> or curly quotes), or a <code>correct</code> index that's out of range. Use the <strong>✨ Format JSON</strong> button to auto-fix whitespace issues, or <strong>📄 Sample</strong> to see a working example.</p>
                        </div>
                        <div class="faq-item">
                            <h3>Can I use this offline?</h3>
                            <p>Yes. Once loaded, QuizMaster works fully offline. All data is stored locally in your browser's IndexedDB.</p>
                        </div>
                        <div class="faq-item">
                            <h3>How do I back up my data?</h3>
                            <p>Go to <strong>Settings → Data Backup</strong> and click <strong>Export Backup</strong>. Save the JSON file somewhere safe.</p>
                        </div>
                        <div class="faq-item">
                            <h3>Will clearing my browser delete my quizzes?</h3>
                            <p>Yes — clearing site data removes IndexedDB. Export a backup first if you plan to clear the browser.</p>
                        </div>
                    </div>
                </section>

                <section class="help-footer">
                    <p>Ready to start? <a href="#" onclick="Router.navigate('dashboard'); return false;">Go to Dashboard →</a></p>
                </section>

            </div>
        </div>
    `;
}
