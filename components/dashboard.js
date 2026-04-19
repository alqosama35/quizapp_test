// Dashboard component

async function renderDashboard() {
    const courses    = await getAllCourses();
    const allResults = await db.results.toArray();

    const totalQuizzes   = allResults.length;
    const avgScore       = allResults.length > 0
        ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length)
        : 0;
    const streak         = calculateStreak(allResults);
    const totalMistakes  = await db.mistakes.count();

    const recentResults = [...allResults]
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 6);

    const avgColor  = getScoreColor(avgScore);

    return `
    <div class="dashboard">

        <!-- Top bar -->
        <header class="dash-topbar">
            <div class="dash-brand">
                <div class="dash-logo">🎓</div>
                <div>
                    <div class="dash-app-name">QuizMaster</div>
                    <div class="dash-tagline">Your personal study companion</div>
                </div>
            </div>
            <div class="dash-nav-btns">
                <button class="dash-nav-btn" onclick="Router.navigate('help')"     title="Help">❓</button>
                <button class="dash-nav-btn" onclick="toggleTheme()"               title="Toggle theme">🌓</button>
                <button class="dash-nav-btn" onclick="Router.navigate('settings')" title="Settings">⚙️</button>
            </div>
        </header>

        <!-- Stats strip -->
        <section class="dash-stats">
            <div class="dash-stat-card">
                <div class="dash-stat-icon" style="background:var(--primary-muted);color:var(--primary-color)">📝</div>
                <div>
                    <div class="dash-stat-value" style="color:var(--primary-color)">${totalQuizzes}</div>
                    <div class="dash-stat-label">Quizzes Taken</div>
                </div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon" style="background:var(--purple-muted);color:var(--purple-color)">🎯</div>
                <div>
                    <div class="dash-stat-value" style="color:${avgColor}">${avgScore}%</div>
                    <div class="dash-stat-label">Average Score</div>
                </div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon" style="background:var(--orange-muted);color:var(--orange-color)">🔥</div>
                <div>
                    <div class="dash-stat-value" style="color:var(--orange-color)">${streak}</div>
                    <div class="dash-stat-label">Day Streak</div>
                </div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon" style="background:var(--danger-muted);color:var(--danger-color)">❌</div>
                <div>
                    <div class="dash-stat-value" style="color:var(--danger-color)">${totalMistakes}</div>
                    <div class="dash-stat-label">Total Mistakes</div>
                </div>
            </div>
        </section>

        <!-- Courses section -->
        <section>
            <div class="dash-courses-header">
                <h2>📚 Your Courses</h2>
                <div class="dash-courses-controls">
                    <input
                        type="text"
                        id="course-search"
                        class="dash-search"
                        placeholder="🔍  Search courses…"
                        oninput="filterCourses(this.value)"
                        autocomplete="off">
                    <button class="btn btn-primary" data-action="new-course">＋ New Course</button>
                </div>
            </div>

            <div class="courses-grid" id="courses-grid">
                ${courses.length > 0
                    ? courses.map(renderCourseCard).join('')
                    : `<div class="empty-state" style="grid-column:1/-1">
                            <div class="empty-state-icon">📚</div>
                            <h3>No courses yet</h3>
                            <p>Create your first course to start organising and taking quizzes.</p>
                            <button class="btn btn-primary btn-lg" data-action="new-course">＋ Create First Course</button>
                       </div>`
                }
            </div>
        </section>

        <!-- Recent activity -->
        ${recentResults.length > 0 ? `
            <section class="dash-activity">
                <h2 style="margin-bottom:14px">📜 Recent Activity</h2>
                <div class="activity-list">
                    ${recentResults.map(r => {
                        const color = getScoreColor(r.percentage);
                        const badgeCls = r.percentage >= 70 ? 'badge-green' : r.percentage >= 50 ? 'badge-orange' : 'badge-red';
                        return `
                            <div class="activity-item">
                                <div class="activity-dot" style="background:${color}"></div>
                                <div class="activity-details">
                                    <div class="activity-title">${escapeHTML(r.quizName)}</div>
                                    <div class="activity-meta">${formatDate(r.completedAt)}</div>
                                </div>
                                <span class="badge ${badgeCls}">${r.percentage}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>
        ` : ''}

    </div>
    `;
}

function renderCourseCard(course) {
    const { stats } = course;
    const scoreColor = getScoreColor(stats.averageScore);
    const badgeCls   = stats.averageScore >= 70 ? 'badge-green'
                     : stats.averageScore >= 50 ? 'badge-orange'
                     : stats.totalAttempts > 0  ? 'badge-red'
                     : 'badge-blue';
    const badgeText  = stats.totalAttempts > 0 ? `${stats.averageScore}% avg` : 'New';
    const barWidth   = Math.min(100, stats.bestScore);
    const barColor   = getScoreColor(stats.bestScore);

    return `
        <div class="course-card card-hover"
             data-action="view-course"
             data-course-id="${course.id}"
             style="--course-accent:${course.color}">
            <div class="course-card-top">
                <div class="course-card-icon" style="background:${course.color}22;color:${course.color}">
                    ${course.icon}
                </div>
                <span class="badge ${badgeCls}">${badgeText}</span>
            </div>
            <div class="course-card-name">${escapeHTML(course.name)}</div>
            <div class="course-card-desc">${escapeHTML(course.description) || '&nbsp;'}</div>
            <div class="course-card-meta">
                <span>📋 ${stats.totalQuizzes} quiz${stats.totalQuizzes !== 1 ? 'zes' : ''}</span>
                <span>✅ ${stats.totalAttempts} attempt${stats.totalAttempts !== 1 ? 's' : ''}</span>
                ${stats.totalMistakes > 0 ? `<span>❌ ${stats.totalMistakes}</span>` : ''}
            </div>
            <div class="course-progress-bar">
                <div class="course-progress-fill" style="width:${barWidth}%;background:${barColor}"></div>
            </div>
        </div>
    `;
}

function calculateStreak(results) {
    if (!results.length) return 0;

    const dates = [...new Set(results.map(r => new Date(r.completedAt).toDateString()))]
        .sort((a, b) => new Date(b) - new Date(a));

    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i-1]) - new Date(dates[i])) / 86400000;
        if (diff === 1) streak++;
        else break;
    }
    return streak;
}

function toggleTheme() {
    const cur = AppState.settings?.theme || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next }).then(() => {
        AppState.settings.theme = next;
        applyTheme(next);
        showToast(`Switched to ${next} theme`, 'success');
    });
}

async function filterCourses(searchText) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    const courses = await getAllCourses();
    const q = searchText.toLowerCase().trim();

    const filtered = q
        ? courses.filter(c =>
            c.name.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q)))
        : courses;

    if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="empty-state-icon">🔍</div>
            <h3>No courses found</h3>
            <p>No courses match "<strong>${escapeHTML(searchText)}</strong>"</p>
        </div>`;
    } else {
        grid.innerHTML = filtered.map(renderCourseCard).join('');
    }
    // Re-attach click handlers for course cards
    document.querySelectorAll('[data-action="view-course"]').forEach(card => {
        card.addEventListener('click', async () => {
            const course = await getCourse(card.dataset.courseId);
            Router.navigate('course-view', { currentCourse: course });
        });
    });
}
