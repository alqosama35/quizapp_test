// Settings component
async function renderSettings() {
    const settings = await getSettings();
    const allData = await exportAllData();
    const dataSize = new Blob([JSON.stringify(allData)]).size;
    const dataSizeKB = (dataSize / 1024).toFixed(2);
    
    const courses = await getAllCourses();
    const totalQuizzes = courses.reduce((sum, c) => sum + c.stats.totalQuizzes, 0);
    const totalAttempts = courses.reduce((sum, c) => sum + c.stats.totalAttempts, 0);
    
    const lastBackup = localStorage.getItem('lastBackupDate');
    const lastBackupText = lastBackup 
        ? `Last backup: ${formatDate(new Date(lastBackup))}`
        : 'No backup yet';
    
    return `
        <div class="settings-page">
            <div class="settings-header">
                <button class="btn-back" onclick="Router.navigate('dashboard')">
                    ← Back to Dashboard
                </button>
                <h1>⚙️ Settings</h1>
            </div>
            
            <div class="settings-content">
                <!-- Data Backup Section -->
                <div class="settings-section">
                    <h2>📦 Data Backup & Recovery</h2>
                    <p class="section-description">
                        Export all your data to prevent loss. Import to restore from a backup.
                    </p>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Courses</span>
                            <span class="stat-value">${courses.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Quizzes</span>
                            <span class="stat-value">${totalQuizzes}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Attempts</span>
                            <span class="stat-value">${totalAttempts}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Data Size</span>
                            <span class="stat-value">${dataSizeKB} KB</span>
                        </div>
                    </div>
                    
                    <p class="last-backup">${lastBackupText}</p>
                    
                    <div class="button-group">
                        <button class="btn-primary" onclick="exportBackup()">
                            📥 Export Backup
                        </button>
                        <button class="btn-secondary" onclick="importBackup()">
                            📤 Import Backup
                        </button>
                        <input type="file" id="import-file" accept=".json" style="display: none" onchange="handleImportFile(event)">
                    </div>
                </div>
                
                <!-- Appearance Section -->
                <div class="settings-section">
                    <h2>🎨 Appearance</h2>
                    <p class="section-description">
                        Customize the look and feel of the app.
                    </p>
                    
                    <div class="setting-item">
                        <div>
                            <label for="theme-select">Theme</label>
                            <p class="setting-description">Choose your preferred color scheme</p>
                        </div>
                        <select id="theme-select" class="setting-select" onchange="changeTheme(this.value)">
                            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div>
                            <label for="font-size-select">Font Size</label>
                            <p class="setting-description">Adjust text size for better readability</p>
                        </div>
                        <select id="font-size-select" class="setting-select" onchange="changeFontSize(this.value)">
                            <option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                            <option value="medium" ${settings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                            <option value="x-large" ${settings.fontSize === 'x-large' ? 'selected' : ''}>Extra Large</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <div>
                            <label>Animations</label>
                            <p class="setting-description">Enable or disable UI animations</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.animations !== false ? 'checked' : ''} onchange="toggleAnimations(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <!-- Quiz Preferences Section -->
                <div class="settings-section">
                    <h2>🎯 Quiz Preferences</h2>
                    <p class="section-description">
                        Default settings for quiz-taking experience.
                    </p>
                    
                    <div class="setting-item">
                        <div>
                            <label>Sound Effects</label>
                            <p class="setting-description">Play sounds for correct/wrong answers</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.soundEffects === true ? 'checked' : ''} onchange="toggleSoundEffects(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <div>
                            <label>Confetti on Perfect Score</label>
                            <p class="setting-description">Celebrate 100% scores with confetti animation</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.confetti !== false ? 'checked' : ''} onchange="toggleConfetti(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <div>
                            <label>Show Timer by Default</label>
                            <p class="setting-description">Display quiz timer automatically</p>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" ${settings.showTimer !== false ? 'checked' : ''} onchange="toggleTimer(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <!-- Study Reminders Section -->
                <div class="settings-section">
                    <h2>📅 Study Reminders</h2>
                    <p class="section-description">
                        Get reminders to practice regularly.
                    </p>
                    
                    <div class="setting-item">
                        <div>
                            <label>Reminder Frequency</label>
                            <p class="setting-description">How often to remind you to practice</p>
                        </div>
                        <select class="setting-select" onchange="changeReminderFrequency(this.value)">
                            <option value="none" ${settings.reminderFrequency === 'none' ? 'selected' : ''}>None</option>
                            <option value="daily" ${settings.reminderFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="3days" ${settings.reminderFrequency === '3days' ? 'selected' : ''}>Every 3 Days</option>
                            <option value="weekly" ${settings.reminderFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                        </select>
                    </div>
                </div>
                
                <!-- Danger Zone -->
                <div class="settings-section danger-zone">
                    <h2>⚠️ Danger Zone</h2>
                    <p class="section-description">
                        Irreversible actions - use with caution!
                    </p>
                    
                    <button class="btn-danger" onclick="clearAllData()">
                        🗑️ Clear All Data
                    </button>
                    <p class="danger-warning">
                        This will delete all courses, quizzes, results, and mistakes. This action cannot be undone!
                    </p>
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
        showToast('Backup exported successfully!', 'success');
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
        'This will MERGE the backup with your existing data.\n\nTo REPLACE all data instead, cancel and use "Clear All Data" first.',
        'Import Backup?',
        { confirmText: 'Merge Data', cancelText: 'Cancel' }
    );
    
    if (!confirmed) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        await importData(data, true); // true = merge mode
        
        showToast('Backup imported successfully!', 'success');
        setTimeout(() => {
            Router.navigate('dashboard');
        }, 1500);
    } catch (error) {
        console.error('Import failed:', error);
        showToast('Failed to import backup. Invalid file format.', 'error');
    }
}

// Theme functions
async function changeTheme(theme) {
    await updateSettings({ theme });
    applyTheme(theme);
    showToast(`Theme changed to ${theme}`, 'success');
}

async function changeFontSize(fontSize) {
    await updateSettings({ fontSize });
    document.body.className = document.body.className.replace(/font-\w+/g, '');
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

async function changeReminderFrequency(frequency) {
    await updateSettings({ reminderFrequency: frequency });
    showToast('Reminder frequency updated', 'success');
}

// Clear all data
async function clearAllData() {
    const confirmed = await Modal.confirm(
        'This will permanently delete:<br>' +
        '• All courses<br>' +
        '• All quizzes<br>' +
        '• All quiz history<br>' +
        '• All mistakes<br><br>' +
        'This action CANNOT be undone!',
        '⚠️ WARNING: DELETE ALL DATA?',
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
        setTimeout(() => {
            location.reload();
        }, 1500);
    } catch (error) {
        console.error('Clear failed:', error);
        showToast('Failed to clear data', 'error');
    }
}
