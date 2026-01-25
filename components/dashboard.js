// Dashboard component - main landing page

async function renderDashboard() {
    const courses = await getAllCourses();
    const allResults = await db.results.toArray();
    
    // Calculate overall stats
    const totalQuizzes = allResults.length;
    const avgScore = allResults.length > 0 
        ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
        : 0;
    
    // Calculate streak (simplified - consecutive days with activity)
    const streak = calculateStreak(allResults);
    
    // Total mistakes across all courses
    const totalMistakes = await db.mistakes.count();
    
    // Recent activity
    const recentResults = allResults
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5);
    
    return `
        <div class="dashboard">
            <header class="dashboard-header">
                <h1>🎓 QuizMaster</h1>
                <div class="header-actions">
                    <button class="icon-btn" onclick="Router.navigate('help')" title="Help & How to Use">
                        ❓
                    </button>
                    <button class="icon-btn" onclick="Router.navigate('settings')" title="Settings">
                        ⚙️
                    </button>
                    <button class="icon-btn" onclick="toggleTheme()" title="Toggle Theme">
                        🌓
                    </button>
                </div>
            </header>
            
            <section class="stats-overview">
                <div class="stat-card">
                    <div class="stat-value">${totalQuizzes}</div>
                    <div class="stat-label">Quizzes Taken</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${avgScore}%</div>
                    <div class="stat-label">Average Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${streak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalMistakes}</div>
                    <div class="stat-label">Mistakes</div>
                </div>
            </section>
            
            <section class="courses-section">
                <div class="section-header">
                    <h2>📚 Your Courses</h2>
                    <div class="header-controls">
                        <input type="text" 
                               id="course-search" 
                               class="search-input" 
                               placeholder="🔍 Search courses..."
                               oninput="filterCourses(this.value)">
                        <button class="btn btn-primary" data-action="new-course">
                            + New Course
                        </button>
                    </div>
                </div>
                
                <div class="courses-grid" id="courses-grid">
                    ${courses.length > 0 
                        ? courses.map(course => renderCourseCard(course)).join('')
                        : '<div class="empty-state">No courses yet. Create your first course to get started!</div>'
                    }
                </div>
            </section>
            
            ${recentResults.length > 0 ? `
                <section class="recent-activity">
                    <h2>📜 Recent Activity</h2>
                    <div class="activity-list">
                        ${recentResults.map(result => `
                            <div class="activity-item">
                                <div class="activity-icon">${result.percentage >= 70 ? '✅' : '📝'}</div>
                                <div class="activity-details">
                                    <div class="activity-title">${escapeHTML(result.quizName)}</div>
                                    <div class="activity-meta">
                                        ${result.percentage}% • ${formatDate(result.completedAt)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}

function renderCourseCard(course) {
    const { stats } = course;
    const scoreColor = stats.averageScore >= 70 ? '#4CAF50' : stats.averageScore >= 50 ? '#FF9800' : '#F44336';
    
    return `
        <div class="course-card" data-action="view-course" data-course-id="${course.id}">
            <div class="course-icon" style="background: ${course.color}">
                ${course.icon}
            </div>
            <div class="course-info">
                <h3 class="course-name">${escapeHTML(course.name)}</h3>
                <p class="course-description">${escapeHTML(course.description)}</p>
                <div class="course-stats">
                    <div class="course-stat">
                        <span class="stat-label">${stats.totalQuizzes}</span>
                        <span class="stat-text">quizzes</span>
                    </div>
                    <div class="course-stat">
                        <span class="stat-label" style="color: ${scoreColor}">${stats.averageScore}%</span>
                        <span class="stat-text">avg</span>
                    </div>
                    <div class="course-stat">
                        <span class="stat-label">${stats.totalMistakes}</span>
                        <span class="stat-text">mistakes</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateStreak(results) {
    if (results.length === 0) return 0;
    
    const dates = results
        .map(r => new Date(r.completedAt).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) return 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if streak is current
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000;
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function toggleTheme() {
    const currentTheme = AppState.settings.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    updateSettings({ theme: newTheme }).then(() => {
        AppState.settings.theme = newTheme;
        applyTheme(newTheme);
        showToast(`Switched to ${newTheme} theme`, 'success');
    });
}

// Filter courses by search text
async function filterCourses(searchText) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    
    const courses = await getAllCourses();
    const search = searchText.toLowerCase().trim();
    
    const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(search) ||
        (course.description && course.description.toLowerCase().includes(search))
    );
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                No courses found matching "${escapeHTML(searchText)}"
            </div>
        `;
    } else {
        grid.innerHTML = filtered.map(course => renderCourseCard(course)).join('');
    }
}
