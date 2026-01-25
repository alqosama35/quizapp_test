// Help and How to Use component

async function renderHelp() {
    return `
        <div class="help-page">
            <div class="help-header">
                <button class="btn-back" onclick="Router.navigate('dashboard')">
                    ← Back to Dashboard
                </button>
                <h1>📚 How to Use QuizMaster</h1>
            </div>
            
            <div class="help-content">
                <!-- What is QuizMaster -->
                <section class="help-section">
                    <h2>🎯 What is QuizMaster?</h2>
                    <p>
                        QuizMaster is a powerful quiz visualization tool that helps you learn effectively by:
                    </p>
                    <ul>
                        <li>Taking quizzes in a beautiful, distraction-free interface</li>
                        <li>Tracking your mistakes and practicing them</li>
                        <li>Organizing quizzes by courses/subjects</li>
                        <li>Monitoring your progress over time</li>
                    </ul>
                </section>

                <!-- The AI-Powered Learning Approach -->
                <section class="help-section featured">
                    <h2>🤖 The AI-Powered Learning Approach</h2>
                    <p>
                        Here's the recommended workflow for maximum learning efficiency:
                    </p>
                    
                    <div class="approach-steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h3>Study Your Material</h3>
                                <p>Read your textbook, watch videos, or review your notes on a specific topic.</p>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h3>Generate Quizzes with AI</h3>
                                <p>Use AI tools like ChatGPT, Claude, or Gemini to create practice questions:</p>
                                <div class="code-example">
                                    <strong>Example prompt:</strong>
                                    <pre>"Create a 10-question multiple choice quiz about [your topic] in this JSON format:

[
    {
        "question": "Your question here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 2,
        "explanation": "Why this is correct"
    }
]

Make the questions challenging and cover the key concepts."</pre>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h3>Paste into QuizMaster</h3>
                                <p>Copy the AI-generated JSON and paste it into QuizMaster to benefit from:</p>
                                <ul>
                                    <li>✨ Beautiful, distraction-free UI/UX</li>
                                    <li>📊 Progress tracking and statistics</li>
                                    <li>❌ Automatic mistake tracking</li>
                                    <li>📈 Performance analytics</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h3>Review & Practice Mistakes</h3>
                                <p>After taking the quiz, review your mistakes and practice them until you master the topic!</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Quick Start Guide -->
                <section class="help-section">
                    <h2>🚀 Quick Start Guide</h2>
                    
                    <div class="quick-start">
                        <h3>Step 1: Create a Course</h3>
                        <p>Click the <strong>"+ New Course"</strong> button on the dashboard and enter:</p>
                        <ul>
                            <li>Course name (e.g., "Biology Chapter 3")</li>
                            <li>Description (optional)</li>
                        </ul>
                        
                        <h3>Step 2: Add a Quiz</h3>
                        <p>Open your course and click <strong>"📥 Add New Quiz"</strong>. You can:</p>
                        <ul>
                            <li>Click "Load Sample" to see an example</li>
                            <li>Paste your own JSON quiz</li>
                            <li>Give it a custom name (or use auto-naming)</li>
                        </ul>
                        
                        <h3>Step 3: Take the Quiz</h3>
                        <p>Click "Save & Start Quiz" and:</p>
                        <ul>
                            <li>Use number keys (1-4) to select answers</li>
                            <li>Use arrow keys to navigate</li>
                            <li>Press R to review all answers before submitting</li>
                            <li>Watch the timer and track your progress</li>
                        </ul>
                        
                        <h3>Step 4: Review Results</h3>
                        <p>After submitting, you'll see:</p>
                        <ul>
                            <li>Your score and percentage</li>
                            <li>Detailed breakdown of right/wrong answers</li>
                            <li>Explanations for each question</li>
                            <li>Option to practice mistakes immediately</li>
                        </ul>
                    </div>
                </section>

                <!-- JSON Format Reference -->
                <section class="help-section">
                    <h2>📝 JSON Format Reference</h2>
                    <p>Quizzes must be in this exact format:</p>
                    
                    <div class="code-block">
<pre>[
    {
        "question": "What is the capital of France?",
        "options": ["Berlin", "Madrid", "Paris", "Rome"],
        "correct": 2,
        "explanation": "Paris is the capital and largest city of France."
    },
    {
        "question": "Which planet is closest to the Sun?",
        "options": ["Venus", "Mercury", "Earth", "Mars"],
        "correct": 1,
        "explanation": "Mercury is the closest planet to the Sun."
    }
]</pre>
                    </div>
                    
                    <div class="format-details">
                        <h3>Field Descriptions:</h3>
                        <table class="format-table">
                            <tr>
                                <th>Field</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                            <tr>
                                <td><code>question</code></td>
                                <td>String</td>
                                <td>The question text (required)</td>
                            </tr>
                            <tr>
                                <td><code>options</code></td>
                                <td>Array</td>
                                <td>2-6 answer choices (required)</td>
                            </tr>
                            <tr>
                                <td><code>correct</code></td>
                                <td>Number</td>
                                <td>Index of correct answer, starting from 0 (required)</td>
                            </tr>
                            <tr>
                                <td><code>explanation</code></td>
                                <td>String</td>
                                <td>Why the answer is correct (required)</td>
                            </tr>
                        </table>
                    </div>
                </section>

                <!-- AI Prompts Examples -->
                <section class="help-section">
                    <h2>💡 AI Prompt Examples</h2>
                    <p>Copy these prompts and customize them for your study topics:</p>
                    
                    <div class="prompt-examples">
                        <div class="prompt-card">
                            <h3>General Quiz Prompt</h3>
                            <div class="code-example">
<pre>Create a 15-question multiple choice quiz about [TOPIC] in this JSON format:

[
    {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "..."
    }
]

Requirements:
- Mix of easy, medium, and hard questions
- Focus on key concepts and common misconceptions
- Provide detailed explanations</pre>
                            </div>
                        </div>
                        
                        <div class="prompt-card">
                            <h3>Exam Preparation Prompt</h3>
                            <div class="code-example">
<pre>I'm studying for an exam on [TOPIC]. Create a challenging 20-question quiz that:
- Tests deep understanding, not just memorization
- Includes scenario-based questions
- Covers all major subtopics
- Format: JSON with question, options (array), correct (index), explanation</pre>
                            </div>
                        </div>
                        
                        <div class="prompt-card">
                            <h3>Quick Review Prompt</h3>
                            <div class="code-example">
<pre>Create a quick 5-question review quiz on [SPECIFIC CONCEPT] in JSON format.
Make it focused on the most important points I should remember.</pre>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Overview -->
                <section class="help-section">
                    <h2>✨ Key Features</h2>
                    
                    <div class="features-grid">
                        <div class="feature-card">
                            <h3>📚 Course Organization</h3>
                            <p>Group quizzes by subject, chapter, or any category you choose.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>❌ Mistake Tracking</h3>
                            <p>Automatically saves questions you got wrong for focused practice.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>📊 Progress Analytics</h3>
                            <p>Track scores over time, see improvements, and identify weak areas.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>⌨️ Keyboard Shortcuts</h3>
                            <p>Navigate quickly with 1-4 for answers, arrows for navigation, R for review.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>🔀 Shuffle Options</h3>
                            <p>Enable shuffle in course settings to randomize answer order.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>📱 Mobile Friendly</h3>
                            <p>Works perfectly on phones, tablets, and desktops.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>🌓 Dark/Light Theme</h3>
                            <p>Choose your preferred theme or let it auto-detect.</p>
                        </div>
                        
                        <div class="feature-card">
                            <h3>💾 Data Backup</h3>
                            <p>Export all your data anytime to prevent loss.</p>
                        </div>
                    </div>
                </section>

                <!-- Tips & Best Practices -->
                <section class="help-section">
                    <h2>💡 Tips & Best Practices</h2>
                    
                    <div class="tips-list">
                        <div class="tip">
                            <h3>🎯 Study Strategy</h3>
                            <ul>
                                <li>Take quizzes immediately after studying to reinforce learning</li>
                                <li>Review mistakes the next day for better retention</li>
                                <li>Retake quizzes weekly to ensure long-term memory</li>
                            </ul>
                        </div>
                        
                        <div class="tip">
                            <h3>📝 Creating Effective Quizzes</h3>
                            <ul>
                                <li>Start with 10-15 questions per quiz (manageable chunks)</li>
                                <li>Include detailed explanations to learn from mistakes</li>
                                <li>Mix difficulty levels for balanced practice</li>
                                <li>Use AI to generate diverse question types</li>
                            </ul>
                        </div>
                        
                        <div class="tip">
                            <h3>🔧 Using Features</h3>
                            <ul>
                                <li>Enable shuffle options to test real understanding</li>
                                <li>Use the review mode before submitting</li>
                                <li>Practice mistakes immediately after getting results</li>
                                <li>Export backups weekly to protect your data</li>
                            </ul>
                        </div>
                        
                        <div class="tip">
                            <h3>⚡ Productivity Hacks</h3>
                            <ul>
                                <li>Use keyboard shortcuts for faster quiz-taking</li>
                                <li>Search courses on dashboard to find quizzes quickly</li>
                                <li>Set custom course colors for visual organization</li>
                                <li>Check dashboard stats to track your learning streak</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Troubleshooting -->
                <section class="help-section">
                    <h2>🔧 Troubleshooting</h2>
                    
                    <div class="faq">
                        <div class="faq-item">
                            <h3>Q: My quiz won't load - "Invalid JSON"</h3>
                            <p><strong>A:</strong> Make sure your JSON is properly formatted. Common issues:</p>
                            <ul>
                                <li>Missing commas between questions</li>
                                <li>Wrong quote types (use " not ' or ")</li>
                                <li>Correct index out of range</li>
                                <li>Use "Load Sample" to see correct format</li>
                            </ul>
                        </div>
                        
                        <div class="faq-item">
                            <h3>Q: Can I use this offline?</h3>
                            <p><strong>A:</strong> Yes! Once loaded, QuizMaster works offline. Your data is stored locally in your browser.</p>
                        </div>
                        
                        <div class="faq-item">
                            <h3>Q: How do I backup my data?</h3>
                            <p><strong>A:</strong> Go to Settings (⚙️) → Data Backup & Recovery → Export Backup. Save the JSON file somewhere safe.</p>
                        </div>
                        
                        <div class="faq-item">
                            <h3>Q: Can I import quizzes from files?</h3>
                            <p><strong>A:</strong> Yes! In the quiz input page, there's a file upload button. Select any .json file with the correct format.</p>
                        </div>
                        
                        <div class="faq-item">
                            <h3>Q: Where is my data stored?</h3>
                            <p><strong>A:</strong> All data is stored locally in your browser using IndexedDB. It never leaves your device.</p>
                        </div>
                    </div>
                </section>

                <!-- Footer -->
                <section class="help-footer">
                    <p>Ready to start learning? <a href="#" onclick="Router.navigate('dashboard'); return false;">Go to Dashboard →</a></p>
                </section>
            </div>
        </div>
    `;
}
