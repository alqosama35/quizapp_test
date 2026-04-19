// Settings component
async function renderSettings() {
    const settings = await getSettings();
    const allData = await exportAllData();
    const dataSize = new Blob([JSON.stringify(allData)]).size;
    const dataSizeKB = (dataSize / 1024).toFixed(1);

    const courses = await getAllCourses();
    const totalQuizzes = courses.reduce((sum, c) => sum + c.stats.totalQuizzes, 0);
    const totalAttempts = courses.reduce((sum, c) => sum + c.stats.totalAttempts, 0);

    const lastBackup = localStorage.getItem('lastBackupDate');
    const lastBackupText = lastBackup
        ? formatDate(new Date(lastBackup))
        : 'Never';

    return `
        <div class="settings-page">
            <div class="settings-header">
                <button class="btn-back" onclick="Router.navigate('dashboard')">← Back</button>
                <h1>⚙️ Settings</h1>
                <p class="settings-subtitle">Manage your data, preferences, and appearance</p>
            </div>

            <div class="settings-content">

                <!-- Data Backup Section -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon backup-icon">📦</div>
                        <div>
                            <h2>Data Backup &amp; Recovery</h2>
                            <p class="section-description">Keep your data safe — export a backup regularly.</p>
                        </div>
                    </div>

                    <div class="data-stats-grid">
                        <div class="data-stat">
                            <div class="data-stat-value">${courses.length}</div>
                            <div class="data-stat-label">Courses</div>
                        </div>
                        <div class="data-stat">
                            <div class="data-stat-value">${totalQuizzes}</div>
                            <div class="data-stat-label">Quizzes</div>
                        </div>
                        <div class="data-stat">
                            <div class="data-stat-value">${totalAttempts}</div>
                            <div class="data-stat-label">Attempts</div>
                        </div>
                        <div class="data-stat">
                            <div class="data-stat-value">${dataSizeKB} KB</div>
                            <div class="data-stat-label">Data Size</div>
                        </div>
                    </div>

                    <div class="backup-meta">
                        <span class="backup-status ${lastBackup ? 'backup-ok' : 'backup-warn'}">
                            ${lastBackup ? '✅' : '⚠️'} Last backup: <strong>${lastBackupText}</strong>
                        </span>
                    </div>

                    <div class="backup-actions">
                        <button class="btn btn-primary" onclick="exportBackup()">
                            ⬇️ Export Backup
                        </button>
                        <button class="btn btn-secondary" onclick="importBackup()">
                            ⬆️ Import Backup
                        </button>
                        <input type="file" id="import-file" accept=".json" style="display:none" onchange="handleImportFile(event)">
                    </div>
                </div>

                <!-- Appearance Section -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon appearance-icon">🎨</div>
                        <div>
                            <h2>Appearance</h2>
                            <p class="section-description">Customise the look and feel.</p>
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Theme</label>
                            <p class="setting-description">Choose your preferred color scheme</p>
                        </div>
                        <div class="theme-pills">
                            <button class="theme-pill ${settings.theme === 'dark' ? 'active' : ''}" onclick="changeTheme('dark')">🌙 Dark</button>
                            <button class="theme-pill ${settings.theme === 'light' ? 'active' : ''}" onclick="changeTheme('light')">☀️ Light</button>
                            <button class="theme-pill ${settings.theme === 'auto' ? 'active' : ''}" onclick="changeTheme('auto')">🖥️ Auto</button>
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label for="font-size-select">Font Size</label>
                            <p class="setting-description">Adjust text size for better readability</p>
                        </div>
                        <select id="font-size-select" class="setting-select" onchange="changeFontSize(this.value)">
                            <option value="small"   ${settings.fontSize === 'small'   ? 'selected' : ''}>Small</option>
                            <option value="medium"  ${settings.fontSize === 'medium'  ? 'selected' : ''}>Medium</option>
                            <option value="large"   ${settings.fontSize === 'large'   ? 'selected' : ''}>Large</option>
                            <option value="x-large" ${settings.fontSize === 'x-large' ? 'selected' : ''}>Extra Large</option>
                        </select>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Animations</label>
                            <p class="setting-description">Enable or disable UI animations</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.animations !== false ? 'checked' : ''} onchange="toggleAnimations(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Quiz Preferences -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon quiz-icon">🎯</div>
                        <div>
                            <h2>Quiz Preferences</h2>
                            <p class="section-description">Default settings for the quiz experience.</p>
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Sound Effects</label>
                            <p class="setting-description">Play sounds for correct / wrong answers</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.soundEffects === true ? 'checked' : ''} onchange="toggleSoundEffects(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Confetti on Perfect Score</label>
                            <p class="setting-description">Celebrate 100% scores with confetti 🎊</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.confetti !== false ? 'checked' : ''} onchange="toggleConfetti(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Show Timer by Default</label>
                            <p class="setting-description">Display the quiz timer automatically</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.showTimer !== false ? 'checked' : ''} onchange="toggleTimer(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Instant Feedback</label>
                            <p class="setting-description">Show correct / wrong immediately after selecting an answer</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.instantFeedback === true ? 'checked' : ''} onchange="toggleInstantFeedbackSetting(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Study Reminders -->
                <div class="settings-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon reminder-icon">📅</div>
                        <div>
                            <h2>Study Reminders</h2>
                            <p class="section-description">Get nudged to practise regularly.</p>
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="setting-info">
                            <label>Reminder Frequency</label>
                            <p class="setting-description">How often to remind you to practise</p>
                        </div>
                        <select class="setting-select" onchange="changeReminderFrequency(this.value)">
                            <option value="none"   ${settings.reminderFrequency === 'none'   ? 'selected' : ''}>None</option>
                            <option value="daily"  ${settings.reminderFrequency === 'daily'  ? 'selected' : ''}>Daily</option>
                            <option value="3days"  ${settings.reminderFrequency === '3days'  ? 'selected' : ''}>Every 3 Days</option>
                            <option value="weekly" ${settings.reminderFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        </select>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div class="settings-card danger-card">
                    <div class="settings-card-header">
                        <div class="settings-card-icon danger-icon">⚠️</div>
                        <div>
                            <h2>Danger Zone</h2>
                            <p class="section-description">Irreversible actions — use with caution!</p>
                        </div>
                    </div>

                    <div class="danger-action">
                        <div class="setting-info">
                            <label>Clear All Data</label>
                            <p class="setting-description">Permanently deletes all courses, quizzes, results and mistakes.</p>
                        </div>
                        <button class="btn btn-danger" onclick="clearAllData()">
                            🗑️ Clear All Data
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;
}

// Export backup
async function exportBackup() {
    try {
        const data = await exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizapp-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        localStorage.setItem('lastBackupDate', new Date().toISOString());
        showToast('Backup exported!', 'success');
        render(); // refresh last-backup label
    } catch (error) {
        console.error('Export failed:', error);
        showToast('Failed to export backup', 'error');
    }
}

// Import backup
function importBackup() {
    document.getElementById('import-file').click();
}

async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const confirmed = await Modal.confirm(
        'This will MERGE the backup with your existing data.\n\nTo REPLACE all data instead, clear your data first from the Danger Zone.',
        'Import Backup?',
        { confirmText: 'Merge Data', cancelText: 'Cancel' }
    );

    if (!confirmed) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        await importData(data, true);

        showToast('Backup imported!', 'success');
        setTimeout(() => Router.navigate('dashboard'), 1500);
    } catch (error) {
        console.error('Import failed:', error);
        showToast('Import failed — invalid file format', 'error');
    }
}

// Theme functions
async function changeTheme(theme) {
    await updateSettings({ theme });
    applyTheme(theme);
    // Update active pill without full re-render
    document.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.theme-pill').forEach(p => {
        if (p.textContent.toLowerCase().includes(theme) || (theme === 'auto' && p.textContent.includes('Auto'))) {
            p.classList.add('active');
        }
    });
    showToast(`Theme: ${theme}`, 'success');
}

async function changeFontSize(fontSize) {
    await updateSettings({ fontSize });
    document.body.className = document.body.className.replace(/font-\S+/g, '');
    document.body.classList.add(`font-${fontSize}`);
    showToast('Font size updated', 'success');
}

async function toggleAnimations(enabled) {
    await updateSettings({ animations: enabled });
    document.body.classList.toggle('no-animations', !enabled);
    showToast(`Animations ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function toggleSoundEffects(enabled) {
    await updateSettings({ soundEffects: enabled });
    showToast(`Sound effects ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function toggleConfetti(enabled) {
    await updateSettings({ confetti: enabled });
    showToast(`Confetti ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function toggleTimer(enabled) {
    await updateSettings({ showTimer: enabled });
    showToast(`Timer ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function toggleInstantFeedbackSetting(enabled) {
    await updateSettings({ instantFeedback: enabled });
    showToast(`Instant feedback ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function changeReminderFrequency(frequency) {
    await updateSettings({ reminderFrequency: frequency });
    showToast('Reminder frequency updated', 'success');
}

// Clear all data
async function clearAllData() {
    const confirmed = await Modal.confirm(
        'This will permanently delete:<br>• All courses<br>• All quizzes<br>• All quiz history<br>• All mistakes<br><br>This action CANNOT be undone!',
        '⚠️ Delete All Data?',
        { danger: true, confirmText: 'Continue', cancelText: 'Cancel' }
    );

    if (!confirmed) return;

    const confirmation = await Modal.prompt('Type DELETE to confirm:', 'Confirm Deletion', '', { placeholder: 'DELETE' });
    if (confirmation !== 'DELETE') {
        showToast('Deletion cancelled', 'info');
        return;
    }

    try {
        await db.courses.clear();
        await db.quizzes.clear();
        await db.results.clear();
        await db.mistakes.clear();

        showToast('All data cleared', 'success');
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        console.error('Clear failed:', error);
        showToast('Failed to clear data', 'error');
    }
}
